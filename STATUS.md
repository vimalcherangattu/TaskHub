# Status

**Last updated:** 22 Oct 2026, evening (live on https://task-hub-one-delta.vercel.app/)

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
- **Quick look:** closes on a click anywhere outside it (desktop too). Other quick-look triggers, dialogs and the undo toast/bar don't close it.
- **Search ranking:** newer items win ties in both searches (recency weighting), and on-device search weights rare words and title hits more. `brain_search` was replaced in Supabase with the same signature. Details in `docs/second-brain.md`.
- **Feed freshness:** the Notes page shows when calls, Gmail and Linear last had a successful read (`sync_state`), with a red banner and the agent's reason when one is over 26 h old. The agent records this through the new `meeting-agent-8-run-record` addendum.
- **Tests:** all 11 pass (`tests/*.mjs`); `brain.mjs` checks recency ranking and the stale-feed banner.

## In progress
- Nothing mid-change.

## Next step
1. Have the hourly agent file Notes inbox captures: project, kind and tags, and split out any task. This is #1 in `docs/second-brain.md`.
2. Then People pages, then a "From your notes" card on Today.
These are logged as suggested tasks in project `task-hub` (named "Ambalam").

## Known issues
- **Hourly agent connectors (needs Vimal):** its scheduled task (`trig_01VKWQV67JJLvzwVZB7HjokL`) has only Supabase and Wispr Flow attached, so Gmail, Linear and session sync are skipped every run. Attach Gmail, Linear, Supabase_Connector and Claude_Code_Remote to it. Claude was not allowed to grant connectors itself. Until then the Notes banner stays red for Gmail and Linear, with that reason.
- **Share target:** not tested on a real Android phone (no installability check run). iOS has no share target; use a Shortcut or the bookmarklet with `?url=`.
- **No offline queue:** captures made while offline fail with a toast instead of waiting to save.
- **Tap targets:** the step checkboxes in the editor draw at 22px. On phone their tap area is extended to 44px with an invisible overlay, so the drawn box still reports as small.
- **Tests:** they need network access for the jsdelivr scripts.
- **Stray file:** `Test` at the repo root holds "Hello World". It looks like a leftover but I haven't removed it without asking.
