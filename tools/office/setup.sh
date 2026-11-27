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
#   - free-llm: a command and an MCP tool for Claude Code that sends bulk jobs to the gateway, with a guard
#   - a heartbeat to Task Hub every 10 minutes (phone alarm when the server or the home route stops)
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
# Older secrets files (from a first run before 27 Nov) get the heartbeat token too.
grep -q '^OFFICE_HEARTBEAT_TOKEN=' "$SECRETS" || echo "OFFICE_HEARTBEAT_TOKEN=$(openssl rand -hex 32)" >> "$SECRETS"

# --- free-model tool: a command and an MCP tool for Claude Code ------------
# Words that must never go to a free model (one regex per line, case-insensitive). Add more on the server.
cat >/opt/office/llm/guard.txt <<'OFFICE_GUARD'
# Never send these to a free model (decision n-38701a20). One regex per line, case-insensitive.
# Zenara is never sent (Healio is Zenara content). Add school or family names here if they come up.
zenara
healio
OFFICE_GUARD

cat >/opt/office/llm/free_llm.py <<'OFFICE_FREE_LLM'
#!/usr/bin/env python3
"""Free-model tool for the Tharavad office server.

  free_llm.py ask "prompt"        (or prompt on stdin)  -> prints the answer
  free_llm.py mcp                                        -> MCP stdio server with one tool, free_llm

Calls the LiteLLM gateway on 127.0.0.1:4000 (Gemini + Groq free tiers behind the alias free-fast).
Bulk, low-stakes work only: Claude checks every answer. Refuses anything that names Zenara (or Healio) or a guard word in
llm/guard.txt, or holds an email address or phone number. Logs sizes, never content.
Standard library only.
"""
import json, os, re, sys, time, urllib.request, urllib.error

HOME = os.environ.get("OFFICE_HOME", "/opt/office")
GATEWAY = os.environ.get("FREE_LLM_URL", "http://127.0.0.1:4000")
MODEL = os.environ.get("FREE_LLM_MODEL", "free-fast")
MAX_IN = 60000
BUILTIN = [r"zenara", r"healio"]
CONTACT = [(r"[\w.+-]+@[\w-]+\.[\w.-]+", "an email address"),
           (r"(?<![\w.])\+?\d[\d ()-]{8,}\d(?![\w.])", "a phone number")]


def secret(name):
    if os.environ.get(name):
        return os.environ[name]
    try:
        with open(os.path.join(HOME, "secrets.env")) as f:
            for line in f:
                k, _, v = line.strip().partition("=")
                if k == name:
                    return v
    except OSError:
        pass
    return ""


def guard_words():
    words = list(BUILTIN)
    try:
        with open(os.path.join(HOME, "llm", "guard.txt")) as f:
            words += [l.strip() for l in f if l.strip() and not l.startswith("#")]
    except OSError:
        pass
    return words


def check(text):
    """Return a reason to refuse, or None."""
    if len(text) > MAX_IN:
        return f"too long ({len(text)} characters; the limit is {MAX_IN}). Split it."
    for w in guard_words():
        try:
            if re.search(w, text, re.I):
                return f"it mentions a protected word ({w}). Zenara and private material never go to free models."
        except re.error:
            continue
    for pat, what in CONTACT:
        if re.search(pat, text):
            return f"it holds {what}. Customer and contact data never go to free models; remove it first."
    return None


def log(**kw):
    try:
        with open(os.path.join(HOME, "llm", "usage.jsonl"), "a") as f:
            f.write(json.dumps({"at": time.strftime("%Y-%m-%dT%H:%M:%S%z"), **kw}) + "\n")
    except OSError:
        pass


def ask(prompt, system=None, max_tokens=1024, temperature=0.3):
    """Return (ok, text)."""
    why = check((system or "") + "\n" + prompt)
    if why:
        log(ok=False, refused=True, chars_in=len(prompt))
        return False, "Refused: " + why
    msgs = ([{"role": "system", "content": system}] if system else []) + [{"role": "user", "content": prompt}]
    body = json.dumps({"model": MODEL, "messages": msgs, "max_tokens": int(max_tokens),
                       "temperature": float(temperature)}).encode()
    req = urllib.request.Request(GATEWAY.rstrip("/") + "/v1/chat/completions", data=body, method="POST",
                                 headers={"Content-Type": "application/json",
                                          "Authorization": "Bearer " + secret("LITELLM_MASTER_KEY")})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            data = json.load(r)
    except urllib.error.HTTPError as e:
        log(ok=False, status=e.code, chars_in=len(prompt))
        return False, f"The free-model gateway said {e.code}. Free limits may be used up; try later or do it with Claude."
    except (urllib.error.URLError, OSError, ValueError) as e:
        log(ok=False, error=type(e).__name__, chars_in=len(prompt))
        return False, ("The free-model gateway is not running. On the server: cd /opt/office && "
                       "docker compose --env-file secrets.env --profile llm up -d")
    try:
        text = data["choices"][0]["message"]["content"] or ""
    except (KeyError, IndexError, TypeError):
        return False, "The free-model gateway gave an answer with no text."
    used = data.get("model", MODEL)
    log(ok=True, model=used, chars_in=len(prompt), chars_out=len(text))
    return True, f"[Free model draft ({used}). Check it before using it.]\n\n{text}"


TOOL = {
    "name": "free_llm",
    "description": ("Send a low-stakes bulk job (rewrite, summarise public text, classify, first drafts, tags) to a "
                    "free model (Gemini or Groq free tier) to save Claude usage. The answer is an unchecked draft: "
                    "check it before using it. Never send Zenara (refused), private notes, or customer records such as "
                    "Fyule schools or Hey Jini children and families; prompts with emails or phone numbers are refused."),
    "inputSchema": {"type": "object", "properties": {
        "prompt": {"type": "string", "description": "The full instruction and text."},
        "system": {"type": "string", "description": "Optional system instruction."},
        "max_tokens": {"type": "integer", "default": 1024, "minimum": 16, "maximum": 8192},
        "temperature": {"type": "number", "default": 0.3, "minimum": 0, "maximum": 1.5}},
        "required": ["prompt"]},
}


def mcp():
    def send(obj):
        sys.stdout.write(json.dumps(obj) + "\n")
        sys.stdout.flush()
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except ValueError:
            send({"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "parse error"}})
            continue
        mid, method, params = msg.get("id"), msg.get("method"), msg.get("params") or {}
        if mid is None:          # a notification: no reply
            continue
        if method == "initialize":
            res = {"protocolVersion": params.get("protocolVersion", "2025-06-18"),
                   "capabilities": {"tools": {}},
                   "serverInfo": {"name": "free-llm", "version": "1.0"}}
        elif method == "ping":
            res = {}
        elif method == "tools/list":
            res = {"tools": [TOOL]}
        elif method == "tools/call" and params.get("name") == "free_llm":
            a = params.get("arguments") or {}
            if not isinstance(a.get("prompt"), str) or not a["prompt"].strip():
                ok, text = False, "A prompt is needed."
            else:
                ok, text = ask(a["prompt"], a.get("system"), a.get("max_tokens", 1024), a.get("temperature", 0.3))
            res = {"content": [{"type": "text", "text": text}], "isError": not ok}
        else:
            send({"jsonrpc": "2.0", "id": mid, "error": {"code": -32601, "message": "unknown method"}})
            continue
        send({"jsonrpc": "2.0", "id": mid, "result": res})


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "mcp":
        mcp()
    elif len(sys.argv) > 1 and sys.argv[1] == "ask":
        p = " ".join(sys.argv[2:]) or sys.stdin.read()
        ok, out = ask(p)
        print(out)
        sys.exit(0 if ok else 1)
    else:
        print(__doc__)
        sys.exit(2)
OFFICE_FREE_LLM
chmod 755 /opt/office/llm/free_llm.py
ln -sf /opt/office/llm/free_llm.py /usr/local/bin/free-llm

# --- heartbeat to Task Hub (dead-man's switch) -----------------------------
# Every 10 minutes: are the services up, does the home route reach the internet through the phone,
# how full is the disk. Task Hub's check_alarms() pushes a phone alarm when it stops (35 min) or the
# home route breaks. Sends yes/no and percentages only, never an IP address or anything from the browser.
cat >/opt/office/heartbeat.sh <<'OFFICE_HEARTBEAT'
#!/bin/bash
set -uo pipefail
cd "${OFFICE_HOME:-/opt/office}" || exit 1
SB_URL="${SB_URL:-https://mbbucsageoyxhekzbmyq.supabase.co}"
SB_KEY="${SB_KEY:-sb_publishable_mVoEHUZ40dF4cp-jRF__IA_hObDMvif}"   # the app's public key; the token below is the secret
val() { grep -m1 "^$1=" secrets.env | cut -d= -f2-; }
TOKEN="$(val OFFICE_HEARTBEAT_TOKEN)"
[ -n "$TOKEN" ] || { echo "no OFFICE_HEARTBEAT_TOKEN in secrets.env"; exit 1; }

want="ts-home browser homeproxy"
if [ -n "$(val GEMINI_API_KEY)$(val GROQ_API_KEY)" ]; then want="$want llm"; fi
running="$(${DOCKER_COMPOSE:-docker compose} --env-file secrets.env ps --services --status running 2>/dev/null)"
down=()
for s in $want; do grep -qx "$s" <<<"$running" || down+=("$s"); done

home_ok=false
if [ -n "$(val TS_HOME_ARGS)" ]; then
  home_ip="$(curl -s -m 20 --socks5-hostname 127.0.0.1:1080 https://ifconfig.me || true)"
  own_ip="$(curl -s -4 -m 10 https://ifconfig.me || true)"
  if [ -n "$home_ip" ] && [ "$home_ip" != "$own_ip" ]; then home_ok=true; fi
fi
disk="$(df --output=pcent / | tail -1 | tr -dc 0-9)"
mem="$(free | awk '/^Mem:/ {printf "%d", ($2-$7)*100/$2}')"

report="$(jq -nc --argjson home_ok "$home_ok" --argjson disk "${disk:-0}" --argjson mem "${mem:-0}" \
  --arg load "$(cut -d' ' -f1 /proc/loadavg)" --arg down "${down[*]:-}" \
  '{home_ok:$home_ok, disk_pct:$disk, mem_pct:$mem, load:$load, down:($down|split(" ")|map(select(length>0)))}')"
curl -sf -m 20 -X POST "$SB_URL/rest/v1/rpc/office_heartbeat" \
  -H "apikey: $SB_KEY" -H "Content-Type: application/json" \
  -d "$(jq -nc --arg t "$TOKEN" --argjson r "$report" '{p_token:$t, p_report:$r}')" >/dev/null \
  && echo "heartbeat ok $report" || { echo "heartbeat failed $report"; exit 1; }
OFFICE_HEARTBEAT
chmod 755 /opt/office/heartbeat.sh

cat >/etc/systemd/system/office-heartbeat.service <<'EOF'
[Unit]
Description=Tharavad office heartbeat to Task Hub
After=network-online.target docker.service
[Service]
Type=oneshot
User=office
ExecStart=/opt/office/heartbeat.sh
EOF
cat >/etc/systemd/system/office-heartbeat.timer <<'EOF'
[Unit]
Description=Tharavad office heartbeat every 10 minutes
[Timer]
OnBootSec=3min
OnUnitActiveSec=10min
[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now office-heartbeat.timer

chown -R office:office /opt/office

sudo -u office bash -c 'cd /opt/office && docker compose --env-file secrets.env up -d ts-home browser homeproxy' || true

# Claude Code can call the free models (works once step 8 has keys; harmless before)
sudo -u office -H claude mcp add --scope user free-llm -- python3 /opt/office/llm/free_llm.py mcp || true

echo "office setup done $(date -Is)" > /opt/office/SETUP_DONE
