# Status

**Last updated:** 23 Oct 2026, late night (live on https://task-hub-one-delta.vercel.app/)

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
- **9 AM routine picks high impact (23 Oct):** new STEP 5B in its prompt (`trig_011BLdwdUmAJxr7ccRKQFuNr`): if nothing is starred for today, it stars up to 3 tasks with a reason in their activity, or sets one theme when 3+ tasks share a thread. It never touches what Vimal picked. First run: 24 Oct.
- **Topics (23 Oct, late):** a note tag on 3+ notes in 2+ top-level projects becomes a topic (sidebar and Notes → Topics). Each topic page shows a brief, decisions, open tasks and calls that mention it, and notes. Briefs are in the new `topic_briefs` table, written by the hourly agent (`meeting-agent-9b-topic-briefs`, up to 3 a run, picked by the new `topics_due()` RPC). 13 topics qualified on day one; their briefs appear after the agent's next runs.
- **Inbox filing check (23 Oct):** the agent's first run logged one capture (`unroutable`, left in the inbox for Vimal). Working as designed.
- **Skill:** the claude.ai task-hub skill was replaced with the repo's `skills/task-hub/SKILL.md` on 23 Oct (high impact, merging, Topics).
- **Week focus (23 Oct):** the Week view opens with "Focus this week": week-focus tasks (`tasks.highlight_week`, "★ Week focus" in the quick look) and week themes (`focus_themes.span = 'week'`, day = the Monday), with carry-over from last week and a "Lined up for next week" line. On Mondays the 9 AM routine carries unfinished week themes and adds up to 4 for the week if Vimal hasn't.
- **Cleanup of existing data (23 Oct):** all 109 untagged notes tagged (Topics grew from 13 to more); 8 duplicate or split tasks merged into 5 with the new `hub_merge_tasks()` RPC (PostHog, booking automation, COM-538 pamphlet, Sam's Linear cleanup, ICP validation with Tyler); the "replace SKILL.md" task marked done; week themes set: "Meditation guide: Days 1–4" (this week) and 4 for the week of 26 Oct (HLTH campaign, Flow collateral and claims, Filow launch push, School Story).
- **Automatic from now on:** the hourly agent tags up to 20 untagged notes and merges up to 3 clear duplicate tasks per run (`meeting-agent-9c-tidy`); the Friday review in the 9 AM routine merges up to 5 more; unsure cases are only listed.
- **Ask Ambalam:** skipped by Vimal (23 Oct), because a question box in the app would need paid API credits.
- **Tests:** all 14 pass (`tests/*.mjs`). `focus.mjs` covers high impact, themes, merging and done-here; `topics.mjs` covers Topics.

## In progress
- Nothing mid-change.

## Next step
1. Vimal: replace the claude.ai task-hub skill again with `skills/task-hub/SKILL.md` (now has week focus and `hub_merge_tasks`).
2. After 24 Oct 9 AM: check the routine's high-impact picks; after the hourly runs: `select tag, updated_at from topic_briefs;` and the agent's "tidy" line.
3. Mon 26 Oct: check the routine's week focus and that the 4 pre-set themes show on the Week view.
4. Next in `docs/second-brain.md`: More ways in (#6) or Safety (#7). Ask Ambalam (#5) is skipped.

## Known issues
- **Hourly agent connectors (needs Vimal):** Gmail, Linear and Supabase_Connector are attached now (checked 23 Oct night). Claude_Code_Remote is still missing, so session sync is skipped.
- **Share target:** not tested on a real Android phone (no installability check run). iOS has no share target; use a Shortcut or the bookmarklet with `?url=`.
- **No offline queue:** captures made while offline fail with a toast instead of waiting to save.
- **Tap targets:** the step checkboxes in the editor draw at 22px. On phone their tap area is extended to 44px with an invisible overlay, so the drawn box still reports as small.
- **People matching:** it uses first names, so two people with the same first name share loops. Calls only match if `sources.attendees` or the title has the name.
- **Work with Claude:** it starts a new chat each time; the task doesn't remember a chat link yet.
- **Tests:** they need network access for the jsdelivr scripts.
- **Stray file:** `Test` at the repo root holds "Hello World". It looks like a leftover but I haven't removed it without asking.
