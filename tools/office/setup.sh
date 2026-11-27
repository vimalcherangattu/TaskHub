#!/bin/bash
# Tharavad office server: first-boot setup (decision n-38701a20, 27 Nov 2026).
#
# Paste this whole file into Hetzner Cloud › Create server › "Cloud config" (user data),
# or run it as root on a fresh Ubuntu 24.04 (Arm or x86). It holds NO secrets:
# every login (Tailscale, the browser, KDP, Claude) is done by hand afterwards, see README.md.
#
# What it sets up:
#   - updates, automatic security updates (reboot 03:00 IST if needed), 4 GB swap, firewall
#   - Tailscale on the host (you log in once from the Hetzner console)
#   - Docker, and in /opt/office a compose stack:
#       ts-home   : a second Tailscale node; once the home phone is an exit node, ALL traffic of
#                   the services below leaves through Vimal's home internet (fail-closed: if the
#                   phone is offline, they get no internet rather than the datacenter address)
#       browser   : Chromium with a remote screen (open http://office-browser:3000 on the tailnet),
#                   one saved profile, DevTools on :9222 inside the tailnet for Playwright
#       homeproxy : SOCKS5 on 127.0.0.1:1080 for yt-dlp / transcripts through the same home route
#       llm       : LiteLLM free-model gateway on 127.0.0.1:4000 (starts only with --profile llm)
#   - Node 22 + Claude Code CLI for the 'office' user
set -euxo pipefail
export DEBIAN_FRONTEND=noninteractive

# --- base system -----------------------------------------------------------
timedatectl set-timezone Asia/Kolkata || true
hostnamectl set-hostname office || true
apt-get update
apt-get -y upgrade
apt-get -y install ca-certificates curl gnupg ufw unattended-upgrades jq git python3-pip pipx ffmpeg docker.io docker-compose-v2

cat >/etc/apt/apt.conf.d/52office-upgrades <<'EOF'
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
EOF
systemctl enable --now unattended-upgrades

if [ ! -f /swapfile ]; then
  fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# --- user ------------------------------------------------------------------
id office >/dev/null 2>&1 || useradd -m -s /bin/bash -G docker office
systemctl enable --now docker

# --- Tailscale on the host -------------------------------------------------
curl -fsSL https://tailscale.com/install.sh | sh
systemctl enable --now tailscaled

# Firewall: nothing open to the internet except SSH (kept until Tailscale SSH is confirmed;
# README step 3 closes it). Everything else only on the tailnet.
ufw default deny incoming
ufw default allow outgoing
ufw allow in on tailscale0
ufw allow 22/tcp
ufw allow 41641/udp
ufw --force enable

# --- Node + Claude Code for the office user --------------------------------
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get -y install nodejs
npm install -g @anthropic-ai/claude-code
sudo -u office pipx install yt-dlp || true

# --- the office stack ------------------------------------------------------
install -d -o office -g office -m 750 /opt/office /opt/office/browser /opt/office/ts-home /opt/office/llm
SECRETS=/opt/office/secrets.env
if [ ! -f "$SECRETS" ]; then
  umask 077
  cat >"$SECRETS" <<EOF
# Filled on the server only. Never paste these into chat or commit them.
BROWSER_PASSWORD=$(openssl rand -base64 18)
# Once the home phone is approved as an exit node (README step 5), set e.g.
# TS_HOME_ARGS=--exit-node=home-phone   then: docker compose --env-file secrets.env up -d
TS_HOME_ARGS=
GEMINI_API_KEY=
GROQ_API_KEY=
LITELLM_MASTER_KEY=sk-office-$(openssl rand -hex 16)
EOF
  chown office:office "$SECRETS"
fi

cat >/opt/office/compose.yml <<'EOF'
# Tharavad office stack. Start: cd /opt/office && docker compose --env-file secrets.env up -d
services:
  ts-home:
    image: tailscale/tailscale:stable
    hostname: office-browser
    restart: unless-stopped
    cap_add: [NET_ADMIN, SYS_MODULE]
    devices: ["/dev/net/tun:/dev/net/tun"]
    environment:
      TS_STATE_DIR: /var/lib/tailscale
      TS_USERSPACE: "false"
      # Empty until the phone is ready; then --exit-node=<phone> (fail-closed when it is offline)
      TS_EXTRA_ARGS: ${TS_HOME_ARGS:-}
    volumes: ["./ts-home:/var/lib/tailscale"]
    ports: ["127.0.0.1:1080:1080"]

  browser:
    image: lscr.io/linuxserver/chromium:latest
    network_mode: service:ts-home
    depends_on: [ts-home]
    restart: unless-stopped
    shm_size: 1gb
    security_opt: [seccomp:unconfined]
    environment:
      PUID: "1000"
      PGID: "1000"
      TZ: Asia/Kolkata
      CUSTOM_USER: office
      PASSWORD: ${BROWSER_PASSWORD}
      CHROME_CLI: --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 --lang=en-IN
    volumes: ["./browser:/config"]

  homeproxy:
    image: serjs/go-socks5-proxy:latest
    network_mode: service:ts-home
    depends_on: [ts-home]
    restart: unless-stopped
    environment:
      PROXY_PORT: "1080"

  llm:
    image: ghcr.io/berriai/litellm:main-stable
    profiles: [llm]
    restart: unless-stopped
    command: ["--config", "/app/config.yaml", "--port", "4000"]
    environment:
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      GROQ_API_KEY: ${GROQ_API_KEY}
      LITELLM_MASTER_KEY: ${LITELLM_MASTER_KEY}
    volumes: ["./llm/config.yaml:/app/config.yaml:ro"]
    ports: ["127.0.0.1:4000:4000"]
EOF

cat >/opt/office/llm/config.yaml <<'EOF'
# Free-model gateway. Model names change often: check each provider's current free models
# when the keys are created and edit here. Bulk, low-stakes work only; Claude checks results.
# Never send Zenara, private notes or customer data (Fyule schools, Hey Jini children).
model_list:
  - model_name: free-fast
    litellm_params: { model: gemini/gemini-2.5-flash, api_key: os.environ/GEMINI_API_KEY }
  - model_name: free-fast
    litellm_params: { model: groq/llama-3.3-70b-versatile, api_key: os.environ/GROQ_API_KEY }
router_settings:
  routing_strategy: simple-shuffle
  num_retries: 2
  allowed_fails: 3
  cooldown_time: 60
EOF
chown -R office:office /opt/office

sudo -u office bash -c 'cd /opt/office && docker compose --env-file secrets.env up -d ts-home browser homeproxy' || true

echo "office setup done $(date -Is)" > /opt/office/SETUP_DONE
