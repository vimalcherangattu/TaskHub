# Browser tests

Headless Chromium checks for `index.html`. Each test loads the page from disk, swaps the Supabase client for an in-memory mock, and drives the UI. Nothing touches the real database.

```bash
mkdir -p tests/out
for f in tests/*.mjs; do echo "== $f"; node "$f" || echo "FAILED: $f"; done
```

The tests import Playwright from `/opt/node22/lib/node_modules/playwright/index.mjs`, where the cloud image installs it. Elsewhere, change that import to `playwright`.

Every test prints `errors []` (no page errors) and ends with exit code 0. Read the printed values as well:

| Test | What it checks |
|---|---|
| `speed.mjs` | A Done click shows in under ~200 ms with 800 ms per request; a failed save puts the task back with an error toast; a sync in flight can't undo a click; undo is instant |
| `ui.mjs` | Quick look opens, ticks steps, "Work with Claude" link, clicking another task switches the quick look, arrow keys move, Esc closes; "On it now" cap; sidebar folds; desktop and phone screenshots go to `tests/out/` |
| `act.mjs` | Suggestion actions: Done, Today, Week, Start, Done, Dismiss |
| `steps.mjs` | Tick a step, undo with Ctrl+Z, add or remove steps in the editor |
| `dep.mjs` | Dependencies: Can't start yet, Move after, Out of order, no cycles |
| `hov.mjs` | Hover tools don't squeeze titles |
| `ctx.mjs` | Briefs, calls, refiling a call, routing rules, filing an unfiled call |
| `inp.mjs` | Pending inputs: received, used in another doc, track a new one |
| `brain.mjs` | Capture (C key, link detection, idea into a project), Notes view and inbox, Ctrl+K search with transcript hits, recency ranking (a newer fact beats an older one), the stale-feed banner, lazy mind map, painting from the local cache, a shared link opening Capture |
| `calls.mjs` | Call prep sheet, agenda add, cover and undo, the Next call card |
| `people.mjs` | People list (open loops first), a person page (next call, they owe you, inputs, you owe them, agenda, calls, decisions), and the "From your notes" card on Today |
| `login.mjs` | Sign-in: link sent opens the paste step, a wrong code says so, a pasted (even Gmail-wrapped) link signs in by its token, a second send within a minute explains the wait |
