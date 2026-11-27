#!/usr/bin/env python3
"""Local test for provision.py against fake Hetzner and Tailscale APIs. Prints "provision tests ok"."""
import http.server, json, os, subprocess, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
state = {"servers": [], "keys": 0, "routes": {"d-phone": {"advertisedRoutes": ["0.0.0.0/0", "::/0"], "enabledRoutes": []},
                                               "d-mac": {"advertisedRoutes": [], "enabledRoutes": []}}, "user_data": None}


class Fake(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def reply(self, obj, code=200):
        data = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        p = self.path
        if p.startswith("/hc/server_types"):
            return self.reply({"server_types": [{"name": "cax11", "prices": [{"location": "hel1", "price_monthly": {"gross": "4.5900"}}]}]})
        if p.startswith("/hc/servers"):
            return self.reply({"servers": state["servers"]})
        if p.startswith("/ts/tailnet/-/devices"):
            return self.reply({"devices": [{"id": "d-phone", "hostname": "pixel-home", "os": "android"},
                                           {"id": "d-mac", "hostname": "vimals-mac", "os": "macOS"}]})
        if p.startswith("/ts/device/") and p.endswith("/routes"):
            return self.reply(state["routes"][p.split("/")[3]])
        self.reply({"error": p}, 404)

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        p = self.path
        if p == "/ts/tailnet/-/keys":
            state["keys"] += 1
            assert body["expirySeconds"] == 3600 and body["capabilities"]["devices"]["create"]["reusable"] is False
            return self.reply({"key": "tskey-auth-SECRET%d" % state["keys"]})
        if p == "/hc/servers":
            state["user_data"] = body["user_data"]
            s = {"id": 1, "name": body["name"], "status": "initializing", "server_type": {"name": body["server_type"]},
                 "public_net": {"ipv4": {"ip": "203.0.113.7"}}}
            state["servers"].append(s)
            return self.reply({"server": s, "root_password": "ROOTPW"})
        if p.startswith("/ts/device/"):
            state["routes"][p.split("/")[3]]["enabledRoutes"] = body["routes"]
            return self.reply({})
        self.reply({"error": p}, 404)


srv = http.server.HTTPServer(("127.0.0.1", 0), Fake)
threading.Thread(target=srv.serve_forever, daemon=True).start()
base = "http://127.0.0.1:%d" % srv.server_port
env = dict(os.environ, HCLOUD_URL=base + "/hc", TS_URL=base + "/ts", NO_PROXY="127.0.0.1", no_proxy="127.0.0.1")
pv = [sys.executable, os.path.join(HERE, "provision.py")]
fails = []


def run(*a):
    return subprocess.run(pv + list(a), capture_output=True, text=True, env=env, timeout=60)


def ok(c, w):
    if not c:
        fails.append(w)


r = run("check")
ok(r.returncode == 0 and "4.5900" in r.stdout and "pixel-home (android)" in r.stdout, "check: " + r.stdout + r.stderr)
r = run("create")
ok(r.returncode == 0 and "Created server 1" in r.stdout, "create: " + r.stdout + r.stderr)
ok("SECRET" not in r.stdout + r.stderr and "ROOTPW" not in r.stdout + r.stderr, "create must not print keys or passwords")
ud = state["user_data"] or ""
ok("OFFICE_TS_HOST_KEY='tskey-auth-SECRET1'" in ud and "OFFICE_TS_HOME_KEY='tskey-auth-SECRET2'" in ud
   and "# @@PROVISION@@" not in ud and ud.startswith("#!/bin/bash"), "user_data carries both keys")
ok(subprocess.run(["bash", "-n"], input=ud, text=True).returncode == 0, "filled setup.sh is valid bash")
r = run("create")
ok(r.returncode != 0 and "already exists" in (r.stdout + r.stderr), "second create refused")
r = run("status")
ok("initializing" in r.stdout and "not joined yet" in r.stdout, "status: " + r.stdout + r.stderr)
r = run("phone")
ok(r.returncode == 0 and "EXIT_NODE=pixel-home" in r.stdout and
   state["routes"]["d-phone"]["enabledRoutes"] == ["0.0.0.0/0", "::/0"], "phone: " + r.stdout + r.stderr)
ok(state["routes"]["d-mac"]["enabledRoutes"] == [], "only the phone is approved")

srv.shutdown()
if fails:
    print("FAILED:\n- " + "\n- ".join(fails))
    sys.exit(1)
print("provision tests ok")
