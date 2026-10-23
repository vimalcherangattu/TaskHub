# Status

**Last updated:** 23 Oct 2026. The 23 Oct work is on branch `claude/focused-mayer-x7h8co`; it goes live on https://task-hub-one-delta.vercel.app/ once merged to `main`.

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
- **Tests:** all 12 pass (`tests/*.mjs`). The new `people.mjs` covers People pages and the From your notes card.

## In progress
- Nothing mid-change.

## Next step
1. Merge `claude/focused-mayer-x7h8co` into `main` to deploy. Confirm with `curl -s https://task-hub-one-delta.vercel.app/ | grep -c fromNotesCard`.
2. Check the first agent runs that file inbox captures (`select * from processing_log where external_id like 'inbox:%'`).
3. Next in `docs/second-brain.md`: Topics (#4), then Ask Ambalam (#5).

## Known issues
- **Hourly agent connectors (needs Vimal):** its scheduled task (`trig_01VKWQV67JJLvzwVZB7HjokL`) has only Supabase and Wispr Flow attached, so Gmail, Linear and session sync are skipped every run. Attach Gmail, Linear, Supabase_Connector and Claude_Code_Remote to it. Claude was not allowed to grant connectors itself. Until then the Notes banner stays red for Gmail and Linear, with that reason.
- **Share target:** not tested on a real Android phone (no installability check run). iOS has no share target; use a Shortcut or the bookmarklet with `?url=`.
- **No offline queue:** captures made while offline fail with a toast instead of waiting to save.
- **Tap targets:** the step checkboxes in the editor draw at 22px. On phone their tap area is extended to 44px with an invisible overlay, so the drawn box still reports as small.
- **People matching:** it uses first names, so two people with the same first name share loops. Calls only match if `sources.attendees` or the title has the name.
- **Work with Claude:** it starts a new chat each time; the task doesn't remember a chat link yet.
- **Tests:** they need network access for the jsdelivr scripts.
- **Stray file:** `Test` at the repo root holds "Hello World". It looks like a leftover but I haven't removed it without asking.
