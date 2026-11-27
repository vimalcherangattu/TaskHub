# Tharavad office server

One small Hetzner Cloud server (CAX11: Arm, 2 vCPU, 4 GB) that runs the jobs needing a logged-in
browser or an always-on machine. Decided 27 Nov 2026 (Task Hub decision note n-38701a20, task
t-8061e6f4). Zenara never touches it.

- **Browser with a remote screen:** Chromium with one saved profile for KDP, Etsy gaps and Instagram checks.
  Open `http://office-browser:3000` from any device on the tailnet (Mac, or phone with the Tailscale app).
- **Home route:** the spare Android phone at home is a Tailscale exit node. The browser and the
  transcript proxy send all their traffic through it, so Amazon and YouTube see the home connection.
  It fails closed: if the phone is offline, those two get no internet rather than the datacenter address.
- **Free-model gateway:** LiteLLM on `127.0.0.1:4000` (Gemini + Groq free tiers), started only once keys exist.
- **Claude Code** for the `office` user, for scheduled browser jobs (the Sunday KDP draft run moves here).

Nothing is open to the internet except SSH until step 3 closes it.

## Set-up (about 30 minutes, once)

1. **Create the server.** Hetzner Cloud › Add server: location Helsinki or Falkenstein, image Ubuntu 24.04,
   type **CAX11** (Arm), add your SSH key if you have one, and paste all of `setup.sh` into **Cloud config**.
   Create. It installs itself in about 10 minutes.
2. **Join it to Tailscale.** Hetzner › the server › **Console** (top right). Log in as root (the password
   is emailed to you if you added no SSH key), then run `tailscale up --ssh` and open the link it prints
   on your Mac. Name it `office`.
3. **Close public SSH** once `ssh root@office` works over Tailscale: `ufw delete allow 22/tcp`.
4. **Join the browser's node.** On the server: `cd /opt/office && docker compose logs ts-home | grep -i login`
   and open that link too. It appears in Tailscale as `office-browser`.
5. **Home phone as exit node** (Android 8 or newer):
   - install Tailscale, sign in with the same account, then in the app choose **Run as exit node**;
   - approve it in the Tailscale admin console (Machines › the phone › Edit route settings › Use as exit node);
   - on the phone: Settings › Apps › Tailscale › Battery › **Unrestricted**; keep it on Wi-Fi and charging;
   - on the server, edit `/opt/office/secrets.env`: `TS_HOME_ARGS=--exit-node=<phone name>`, then
     `cd /opt/office && docker compose --env-file secrets.env up -d`;
   - check: `curl --socks5-hostname 127.0.0.1:1080 https://ifconfig.me` must print your **home** IP.
6. **Log in by hand, only after step 5 passes.** Open `http://office-browser:3000` (user `office`, password
   from `BROWSER_PASSWORD` in `secrets.env`). Log in to KDP and tick **Remember this device**. Never log in
   to KDP before the home route works, or Amazon sees a datacenter login.
7. **Claude Code:** `su - office`, run `claude`, and log in with the link it prints.
8. **Free models (later):** create a Gemini key (Google AI Studio) and a Groq key, put them in `secrets.env`
   on the server (never in chat or the repo), then `docker compose --env-file secrets.env --profile llm up -d`.
   Check the model names in `llm/config.yaml` against each provider's current free models first.

## Rules

- KDP: drafts only, at a human pace. Vimal presses Publish himself (from the phone via the remote screen when away).
- Instagram: post only through Meta's API. The browser is for checking, never for posting.
- Etsy: the Open API first; the browser only for gaps.
- Free models never see Zenara, private notes or customer data (Fyule schools, Hey Jini children).
- Secrets live only in `/opt/office/secrets.env` (mode 600). Never print, paste or commit them.

## Still to build

- A heartbeat to Task Hub alarms (phone push if the server or the home route stops).
- The KDP draft job on the server, with a Book 3 dry run before 5 Dec.
- Later: Etsy stats, KDP report parsing, Filow win-backs, Small Fish digest; Postiz (resize to 8 GB), OpenSEO.
