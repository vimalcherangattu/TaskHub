#!/usr/bin/env python3
"""Local test for the office server's own scripts (no server, no network, no real keys).

Pulls free_llm.py, guard.txt and heartbeat.sh out of setup.sh, then checks:
  - the guard refuses Zenara/Healio, emails and phone numbers, and lets normal text through
  - `ask` reaches a fake LiteLLM gateway and labels the answer as an unchecked draft
  - a gateway that is down gives a plain message, not a crash
  - the MCP server answers initialize, tools/list and tools/call
  - heartbeat.sh posts {p_token, p_report} with services down and the disk percentage, and no IP
Run: python3 tools/office/test_office.py   (prints "office tests ok")
"""
import http.server, json, os, re, subprocess, sys, tempfile, threading

HERE = os.path.dirname(os.path.abspath(__file__))
SETUP = open(os.path.join(HERE, "setup.sh")).read()


def extract(marker):
    m = re.search(r"<<'%s'\n(.*?)\n%s\n" % (marker, marker), SETUP, re.S)
    assert m, marker
    return m.group(1) + "\n"


home = tempfile.mkdtemp()
os.makedirs(os.path.join(home, "llm"))
for name, marker, mode in [("llm/free_llm.py", "OFFICE_FREE_LLM", 0o755), ("llm/guard.txt", "OFFICE_GUARD", 0o644),
                           ("heartbeat.sh", "OFFICE_HEARTBEAT", 0o755)]:
    p = os.path.join(home, name)
    open(p, "w").write(extract(marker))
    os.chmod(p, mode)
open(os.path.join(home, "secrets.env"), "w").write(
    "LITELLM_MASTER_KEY=sk-test\nOFFICE_HEARTBEAT_TOKEN=" + "f" * 64 + "\nTS_HOME_ARGS=\nGEMINI_API_KEY=x\nGROQ_API_KEY=\n")

seen = []


class Fake(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        seen.append((self.path, dict(self.headers), body))
        if self.path == "/v1/chat/completions":
            out = {"model": "gemini/gemini-2.5-flash",
                   "choices": [{"message": {"content": "TAGS: crochet, gift"}}]}
        else:
            out = "ok"
        data = json.dumps(out).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(data)


srv = http.server.HTTPServer(("127.0.0.1", 0), Fake)
threading.Thread(target=srv.serve_forever, daemon=True).start()
url = "http://127.0.0.1:%d" % srv.server_port
env = dict(os.environ, OFFICE_HOME=home, FREE_LLM_URL=url, SB_URL=url, NO_PROXY="127.0.0.1", no_proxy="127.0.0.1")
fl = [sys.executable, os.path.join(home, "llm", "free_llm.py")]


def run(args, stdin=None, e=env):
    return subprocess.run(args, input=stdin, capture_output=True, text=True, env=e, timeout=60)


fails = []
def ok(cond, what):
    if not cond:
        fails.append(what)


# guard
for bad in ["Summarise the Zenara pricing memo", "healio draft please", "mail asha@example.com",
            "call +91 98765 43210 tomorrow"]:
    r = run(fl + ["ask", bad])
    ok(r.returncode == 1 and r.stdout.startswith("Refused:"), "guard should refuse: " + bad + " -> " + r.stdout)
ok(not any(p == "/v1/chat/completions" for p, _, _ in seen), "refused prompts must not reach the gateway")

# ask through the fake gateway
r = run(fl + ["ask", "Give 2 Etsy tags for a crochet bunny, released 2026, 3 sizes"])
ok(r.returncode == 0 and "Free model draft" in r.stdout and "TAGS: crochet" in r.stdout, "ask: " + r.stdout + r.stderr)
call = [s for s in seen if s[0] == "/v1/chat/completions"]
ok(len(call) == 1 and call[0][1].get("Authorization") == "Bearer sk-test" and call[0][2]["model"] == "free-fast",
   "gateway request shape")
log = open(os.path.join(home, "llm", "usage.jsonl")).read()
ok("crochet" not in log and '"ok": true' in log, "usage log must hold sizes only")

# gateway down
r = run(fl + ["ask", "hello"], e=dict(env, FREE_LLM_URL="http://127.0.0.1:9"))
ok(r.returncode == 1 and "not running" in r.stdout, "gateway down: " + r.stdout)

# MCP
msgs = [{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2025-06-18"}},
        {"jsonrpc": "2.0", "method": "notifications/initialized"},
        {"jsonrpc": "2.0", "id": 2, "method": "tools/list"},
        {"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "free_llm", "arguments": {"prompt": "Tag: knitted fox"}}},
        {"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "free_llm", "arguments": {"prompt": "Zenara launch"}}}]
r = run(fl + ["mcp"], stdin="".join(json.dumps(m) + "\n" for m in msgs))
out = [json.loads(l) for l in r.stdout.splitlines()]
ok([o["id"] for o in out] == [1, 2, 3, 4], "mcp replies: " + r.stdout + r.stderr)
if len(out) == 4:
    ok(out[0]["result"]["protocolVersion"] == "2025-06-18", "mcp initialize")
    ok(out[1]["result"]["tools"][0]["name"] == "free_llm", "mcp tools/list")
    ok(out[2]["result"]["isError"] is False and "TAGS" in out[2]["result"]["content"][0]["text"], "mcp call")
    ok(out[3]["result"]["isError"] is True, "mcp refusal")

# heartbeat with a fake `docker compose`: browser is not running
fake = os.path.join(home, "fake-compose")
open(fake, "w").write("#!/bin/sh\nprintf 'ts-home\\nhomeproxy\\n'\n")
os.chmod(fake, 0o755)
seen.clear()
r = run(["bash", os.path.join(home, "heartbeat.sh")], e=dict(env, DOCKER_COMPOSE=fake))
ok(r.returncode == 0 and "heartbeat ok" in r.stdout, "heartbeat: " + r.stdout + r.stderr)
hb = [s for s in seen if s[0] == "/rest/v1/rpc/office_heartbeat"]
ok(len(hb) == 1, "heartbeat should post once")
if hb:
    rep = hb[0][2]["p_report"]
    ok(hb[0][2]["p_token"] == "f" * 64 and hb[0][1].get("apikey", "").startswith("sb_publishable_"), "heartbeat auth")
    ok(sorted(rep["down"]) == ["browser", "llm"] and rep["home_ok"] is False and isinstance(rep["disk_pct"], int),
       "heartbeat report: " + json.dumps(rep))
    ok(not re.search(r"\d+\.\d+\.\d+\.\d+", json.dumps(hb[0][2])), "heartbeat must not send an IP")

srv.shutdown()
if fails:
    print("FAILED:\n- " + "\n- ".join(fails))
    sys.exit(1)
print("office tests ok")
