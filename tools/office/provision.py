#!/usr/bin/env python3
"""Create and wire the Tharavad office server through the Hetzner Cloud and Tailscale APIs.

Claude runs this from a cloud session; the two API tokens are saved as network secrets there and
the session's proxy adds them to each request, so this script never sees them. Run on a Mac instead
with HCLOUD_TOKEN and TS_API_KEY set in the environment.

  provision.py check            tokens work? CAX11 price, existing servers, Tailscale devices
  provision.py create [loc]     mint two single-use 1-hour Tailscale keys, create server "office" (CAX11,
                                Ubuntu 24.04, default location hel1) with setup.sh as cloud config
  provision.py status           server state and whether office / office-browser are on the tailnet
  provision.py phone            find the phone offering itself as an exit node and approve it; prints
                                the name to put in Task Hub (tharavad_flags office_exit_node)

Never prints a key, token or password. Refuses to create a second server named office.
"""
import json, os, sys, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
HC = os.environ.get("HCLOUD_URL", "https://api.hetzner.cloud/v1")
TS = os.environ.get("TS_URL", "https://api.tailscale.com/api/v2")
NAME = "office"
TYPE = "cax11"
EXIT_ROUTES = ["0.0.0.0/0", "::/0"]


def call(base, token_env, method, path, body=None):
    # A placeholder token: the session proxy swaps in the saved secret for this host.
    tok = os.environ.get(token_env) or "placeholder"
    req = urllib.request.Request(base + path, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        msg = e.read().decode(errors="replace")[:300]
        sys.exit(f"{method} {base.split('/')[2]}{path.split('?')[0]} -> {e.code}: {msg}")


def hc(method, path, body=None):
    return call(HC, "HCLOUD_TOKEN", method, path, body)


def ts(method, path, body=None):
    return call(TS, "TS_API_KEY", method, path, body)


def servers():
    return hc("GET", "/servers?name=" + NAME).get("servers", [])


def devices():
    return ts("GET", "/tailnet/-/devices?fields=all").get("devices", [])


def short(d):
    return (d.get("hostname") or d.get("name", "").split(".")[0]).lower()


def check():
    t = hc("GET", "/server_types?name=" + TYPE)["server_types"]
    if not t:
        sys.exit("Hetzner has no server type " + TYPE)
    prices = {p["location"]: p["price_monthly"]["gross"] for p in t[0].get("prices", [])}
    print("Hetzner ok.", TYPE, "monthly gross by location:", json.dumps(prices))
    print("Servers named office:", [(s["id"], s["status"]) for s in servers()] or "none")
    ds = devices()
    print("Tailscale ok.", len(ds), "devices:", ", ".join(f"{short(d)} ({d.get('os')})" for d in ds) or "none")


def key(desc):
    k = ts("POST", "/tailnet/-/keys", {
        "capabilities": {"devices": {"create": {"reusable": False, "ephemeral": False, "preauthorized": True}}},
        "expirySeconds": 3600, "description": desc})
    return k["key"]


def create(location="hel1"):
    if servers():
        sys.exit("A server named office already exists; not creating another. Use status.")
    setup = open(os.path.join(HERE, "setup.sh")).read()
    assert "# @@PROVISION@@" in setup
    filled = setup.replace("# @@PROVISION@@",
                           "OFFICE_TS_HOST_KEY='%s'\nOFFICE_TS_HOME_KEY='%s'" % (key("office host"), key("office browser")))
    if len(filled.encode()) > 32 * 1024:
        sys.exit("setup.sh is over Hetzner's 32 KiB cloud-config limit")
    r = hc("POST", "/servers", {"name": NAME, "server_type": TYPE, "image": "ubuntu-24.04", "location": location,
                                "start_after_create": True, "user_data": filled,
                                "labels": {"role": "tharavad-office"}})
    s = r["server"]
    print(f"Created server {s['id']} ({TYPE}, {location}), status {s['status']}, "
          f"IPv4 {s.get('public_net', {}).get('ipv4', {}).get('ip')}. It sets itself up in about 10 minutes, "
          "joins Tailscale as office and office-browser, then reports to Task Hub every 10 minutes.")


def status():
    ss = servers()
    print("Hetzner:", [(s["id"], s["status"], s["server_type"]["name"]) for s in ss] or "no server named office")
    on = {short(d): d for d in devices()}
    for n in ("office", "office-browser"):
        d = on.get(n)
        print(f"Tailscale {n}:", "not joined yet" if not d else ("online" if d.get("connectedToControl") else
              "joined, last seen " + str(d.get("lastSeen"))))


def phone():
    found = []
    for d in devices():
        r = ts("GET", "/device/%s/routes" % d["id"])
        adv = set(r.get("advertisedRoutes") or [])
        if set(EXIT_ROUTES) <= adv:
            found.append((d, set(r.get("enabledRoutes") or [])))
    if not found:
        sys.exit("No device is offering itself as an exit node yet. On the phone: Tailscale › Run as exit node.")
    if len(found) > 1:
        sys.exit("More than one exit node offered: " + ", ".join(short(d) for d, _ in found) + ". Say which is the phone.")
    d, enabled = found[0]
    if not set(EXIT_ROUTES) <= enabled:
        ts("POST", "/device/%s/routes" % d["id"], {"routes": sorted(enabled | set(EXIT_ROUTES))})
        print("Approved", short(d), "as the exit node.")
    else:
        print(short(d), "was already approved as the exit node.")
    print("EXIT_NODE=" + short(d))


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "check":
        check()
    elif cmd == "create":
        create(*sys.argv[2:3])
    elif cmd == "status":
        status()
    elif cmd == "phone":
        phone()
    else:
        print(__doc__)
        sys.exit(2)
