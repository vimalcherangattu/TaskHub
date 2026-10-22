# Ambalam (formerly Task Hub)

Vimal's tasks, notes, calls and project briefs. Live at https://task-hub-one-delta.vercel.app/.
At session start, read this file and `STATUS.md`. At every wrap-up, update `STATUS.md`.

## Stack
- **App:** one file, `index.html`. It's vanilla JS with no build step. It loads supabase-js 2.45.4 from jsdelivr; d3 7.9.0 loads lazily for the mind map only. Fonts are Bricolage Grotesque and IBM Plex.
- **PWA files:** `manifest.webmanifest` (with a share target) and `icon.svg`.
- **Data:** Supabase project "Task-Hub" (`mbbucsageoyxhekzbmyq`). Tables include projects, tasks, notes, sources, source_segments, project_briefs, changes, inputs, input_uses, call_series and agenda_items. The RPCs are `call_prep`, `call_prep_md` and `brain_search` (recency-weighted; see `docs/second-brain.md`).
- **Deploy:** Vercel deploys every push to `main`. There is no config file; it serves the repo root statically.
- **Other writers to the same tables:**
  - the hourly meeting agent (`agents/meeting-agent.md`; the live copy is in `agent_config`)
  - the 9 AM routine
  - chats through the `skills/task-hub` skill
- **Design notes:** `docs/system-design.md`, `docs/second-brain.md` and `docs/handoff-*.md`.

## Run, test, deploy
- **Run:** open `index.html` in a browser. It needs a Supabase magic-link session; otherwise it shows the sign-in form.
- **Tests:** headless Chromium with an in-memory Supabase mock, so they never touch the real database. They need network for the CDN scripts.
  ```bash
  mkdir -p tests/out && for f in tests/*.mjs; do echo "== $f"; node "$f" || echo "FAILED: $f"; done
  ```
  Every test must exit 0 and print `errors []`. Screenshots go to `tests/out/` (gitignored).
  Playwright is imported from `/opt/node22/lib/node_modules/playwright/index.mjs`. See `tests/README.md` for what each test covers.
- **Deploy:** push to `main`. Confirm with `curl -s https://task-hub-one-delta.vercel.app/ | grep -c '<a new function name>'`.

## Conventions
- Match the existing dense style: short helpers (`open`, `doing`, `onToday`, `startBy`…), HTML template strings, and `esc()` on every interpolated value.
- Colours come only from the CSS variables on `:root`, which are redefined under `:root[data-theme="dark"]`. Never hard-code a hex value in new UI.
- Rows are camelCase in JS and snake_case in the database. `toRow` and `fromRow` convert using `MAP`; add new columns there.
- Redraw with `paint()` (one microtask render) after local changes, and with `render()` only when the view changes.
- Accessibility:
  - use real `<button>`, `<label>` and `role="radio"` / `aria-pressed` elements;
  - keep text contrast at 4.5:1 or better in both themes;
  - make touch targets at least 44px on phone (≤820px).
- Dates use `T()`, `iso()`, `parse()` and `nice()` (local dates); greetings use IST. Weeks start Monday (`week()` is memoised per day).
- Commit messages start with `App:`, `Skill:` or `Agent:` and say what changed for the user. If a test changed, say why in the commit.

## Rules a fresh session must not break
- **Task and note writes:** they must go through `S.db` or `upd()`, never `sb.from(...)` directly, or optimistic updates, undo/redo and rollback-on-failure break. The only existing direct writes are for `inputs`, `input_uses` and `sources`.
- **Shared database:** don't change the schema casually; the agent, the routine and the skill depend on it. Allowed values:
  - `tasks.status`: todo, doing, waiting, suggested, done
  - `priority`: high, med, low
  - `notes.kind`: fact, person, idea, decision, link, note
- **Keep these working:** the quick look (`peekHtml`, `renderPeek`, `setPeek`), the task editor's field names and ids (`#taskForm`, `#depList`, `#depAdd`, `#stepList`, `#stepNew`, `#actList`, `#delTask`) and its submit handler.
- **`doRefresh`:** keep the staleness check (`W.n`, `W.seq`) so a sync never overwrites a save in flight.
- **Library choice:** don't add frameworks or build tools. Keep it one HTML file plus static assets.
- **Local cache:** `ambalam.cache.v1` in localStorage is the instant-open snapshot. It is cleared on sign-out; keep that.
- **Names:** Vimal decided to keep the Vercel URL, the repo name, the Supabase project and the `task-hub` skill name as they are. Only the UI says "Ambalam".
- **Product split:** tasks ("Do") and notes ("Know") stay separate views, sharing Capture and Search (decision of 21 Oct 2026).
- **Supabase from a chat:** use the `Supabase_Connector` MCP and never a raw `DELETE` (use `hub_delete`). The details are in `skills/task-hub/SKILL.md`.
