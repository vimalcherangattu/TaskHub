# Status

**Last updated:** 23 Oct 2026, late evening (live on https://task-hub-one-delta.vercel.app/)

## Current state
- **Today:** the redesign from the design canvas is live:
  - greeting header and progress bar;
  - filled selected day with load bars;
  - priority pill and due column on each row;
  - "where you left it" note on the first "On it now" task.
- **Task editor:** restyled as the Task sheet: Low/Med/High switch, quick-toggle pills and "More details".
- **Name:** the app is called **Ambalam** in the UI (title, brand, favicon, login). The URL, repo, Supabase project and skill keep their old names, by decision.
- **Second-brain basics:**
  - Capture (C key, sidebar, phone bar, share target, `?url=&title=` links)
  - Ctrl/⌘+K search over tasks, notes, calls, briefs and call transcripts
  - a Notes view with kind filters and an inbox for unfiled items
- **Speed:**
  - It paints from a localStorage snapshot on open, and tasks render before the slower data arrives.
  - d3 loads lazily, and date formatters are cached.
  - Today renders in about 10 ms with 470 tasks; clicks show in about 10 ms.
- **Quick look:** closes on a click anywhere outside it (desktop too). Clicking another task's row (its title or blank space) switches to that task. Other quick-look triggers, dialogs and the undo toast/bar don't close it.
- **Work with Claude:** the quick look of any task that isn't done opens a new claude.ai chat (`/new?q=`) pre-filled with the task's context. It tells Claude to load `project_context` and write progress back through the task-hub skill. The prompt is also copied to the clipboard.
- **People (23 Oct):** a People list (sidebar and Notes) and a page for each person note. The page shows their note, next call, what they owe you, open tasks that mention them, agenda points, recent calls and decisions. People are matched by first name.
- **From your notes (23 Oct):** a card in the Today rail. It shows notes that share two or more words with today's or started tasks in the same workspace, plus one idea or decision over 3 weeks old (it rotates daily).
- **Inbox filing (23 Oct, live):** the hourly agent files Notes inbox captures (`agent_config` row `meeting-agent-9-inbox-filing`, mirrored in `agents/meeting-agent.md`). It logs each one as `processing_log` `inbox:<note id>`.
- **Search ranking:** newer items win ties in both searches (recency weighting), and on-device search weights rare words and title hits more. `brain_search` was replaced in Supabase with the same signature. Details in `docs/second-brain.md`.
- **Feed freshness:** the Notes page shows when calls, Gmail and Linear last had a successful read (`sync_state`), with a red banner and the agent's reason when one is over 26 h old. The agent records this through the new `meeting-agent-8-run-record` addendum.
- **High impact today (23 Oct, late):** a block at the top of Today. Star any task (quick look or task sheet: "★ High impact", stored in the existing `tasks.highlight_day`), or add a **theme** ("+ Theme", e.g. "Close all the automation tasks") that covers several tasks and counts "n of m closed". Words in a theme's title pre-tick matching tasks. Themes live in the new `focus_themes` table. Unfinished stars and themes from the last 7 days get a "Carry to today" link. Starred and theme tasks show only in this block, not again in the lists below.
- **Merge and tick off (23 Oct, late):** a task's quick look lists "Also open in <project>" (other dates included) with Done and Merge on each, plus a "pick several" dialog that can search other projects. Done logs "Done while working on…" on the closed task and "Also closed:…" on the one you're on. Merge turns the other task into steps (its own steps keep their ticks), moves its notes over, keeps the earlier deadline and higher priority, repoints dependents and themes, and hides it as done + `superseded_by`. Undo restores it.
- **Tests:** all 13 pass (`tests/*.mjs`). The new `focus.mjs` covers high impact, themes, merging and done-here.

## In progress
- Nothing mid-change.

## Next step
1. The task-hub skill in claude.ai is a separate install: copy the new "High impact and merging" section of `skills/task-hub/SKILL.md` into it so chats can star tasks, set themes and merge.
2. Maybe: let the 9 AM routine propose today's high-impact items, and use `highlight_week` for a weekly focus.
3. Check the first agent runs that file inbox captures (`select * from processing_log where external_id like 'inbox:%'`).
4. Next in `docs/second-brain.md`: Topics (#4), then Ask Ambalam (#5).

## Known issues
- **Hourly agent connectors (needs Vimal):** its scheduled task (`trig_01VKWQV67JJLvzwVZB7HjokL`) has only Supabase and Wispr Flow attached, so Gmail, Linear and session sync are skipped every run. Attach Gmail, Linear, Supabase_Connector and Claude_Code_Remote to it. Claude was not allowed to grant connectors itself. Until then the Notes banner stays red for Gmail and Linear, with that reason.
- **Share target:** not tested on a real Android phone (no installability check run). iOS has no share target; use a Shortcut or the bookmarklet with `?url=`.
- **No offline queue:** captures made while offline fail with a toast instead of waiting to save.
- **Tap targets:** the step checkboxes in the editor draw at 22px. On phone their tap area is extended to 44px with an invisible overlay, so the drawn box still reports as small.
- **People matching:** it uses first names, so two people with the same first name share loops. Calls only match if `sources.attendees` or the title has the name.
- **Work with Claude:** it starts a new chat each time; the task doesn't remember a chat link yet.
- **Tests:** they need network access for the jsdelivr scripts.
- **Stray file:** `Test` at the repo root holds "Hello World". It looks like a leftover but I haven't removed it without asking.
