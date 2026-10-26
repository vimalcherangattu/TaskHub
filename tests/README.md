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
| `focus.mjs` | High impact today: star from the quick look (shows once, at the top), carry-over from earlier, themes pre-ticking matching tasks and counting "n of m closed", the task sheet's High impact pill; "Also open in <project>": Done here (logged on both), Merge (steps, notes, earliest deadline, dependents repointed), undo of a merge, the pick-several dialog with search across projects; Focus this week (★ Week focus, week themes, carry from last week, next week's line-up) |
| `topics.mjs` | Topics list (only tags on 3+ notes in 2+ projects; `handoff` skipped), a topic page with the agent's brief, decisions, open tasks that mention it (short tags match whole words only), notes and calls |
| `login.mjs` | Sign-in: link sent opens the paste step, a wrong code says so, a pasted (even Gmail-wrapped) link signs in by its token, a second send within a minute explains the wait |
| `owner.mjs` | Agent-owned tasks (`owner='agent'`) stay off Today and This week, show under "Run by agents" (sidebar count, phone tab, Today hint), carry an Agent tag elsewhere, and the quick look's "Agent's job" toggles them back and forth |
| `hard.mjs` | Hard deadlines: "Can't slip" heads Today (missed first, then by time; shown once), countdown and "Missed" lines, the due column with a time, a missed time counts as overdue, future hard rows and the quick look say so, the task sheet's time field and Hard deadline pill (pill off clears the time), and a time with no date means today |
| `peoplerec.mjs` | Person records: the keep-in-touch card on Today, the People list (filters, "New from calls" to keep or drop), a person page (projects with roles, "came up in", works with, open loops, linked here), adding them to a project, Talked today, a person note getting a record when edited, + Person, the People strip on project and workspace pages, the people map, phone width and dark mode |
| `links.mjs` | The `[[` picker in a note (search, arrow keys, Enter), links saved on save and removed when the `[[...]]` goes, "Linked here" on a person, `[[...]]` in a note body opening its target, "Might be related" with Link, `[[` in a task's notes |
| `phase1.mjs` | Archive (blocked while tasks are open, hidden from sidebar and pickers, the Archive page, bring back), the offline outbox (queued saves, the chip, sync on reconnect), private notes and tasks (blurred in lists), a task's Claude chat link (claude.ai only, "Continue in Claude"), Export (JSON and Markdown downloads), the dictation button only where the browser supports it |
| `life.mjs` | Life OS: Do / Know / Live sidebar groups and the 5-tab phone bar with its More sheet; habits on Today (tick, untick, streaks, skip keeps a streak); the evening check-in; the Life page (areas, quarter goals with progress and "no movement", energy); a goal page (link a project, a number goal, mark achieved); a new quarter goal under a year goal; an area's status, standard and note; new habit; the Log (a day's page, edit a day); a week theme serving a goal; the compass; a project's life area; phone width and dark mode |
| `rhythm.mjs` | Life OS phase 3: review periods and ready windows, a stale review marked skipped; life admin (due soon, make a renewal task, a done renewal rolls the date forward, new item, archive); numbers on an area page (log, trend, sparkline, a number goal following a metric); renewals in Coming up; the weekly review step by step (notes saved, area status set in the review, a theme for next week with its goal, finish); the quarterly review (carry a goal, archive a finished project); an agent draft on a step; phone width and dark mode |
