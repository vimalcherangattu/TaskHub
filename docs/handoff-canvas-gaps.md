# Handoff: bring Today and the task editor in line with the design canvas

**For:** a Claude Code session working in this repo (`vimalcherangattu/TaskHub`).
**Goal:** implement the parts of the design canvas that the live app doesn't have yet. Keep the calmer layout and quick look that shipped on 21 Oct.

## Context

- **The app** is a single file, `index.html`: vanilla JS with supabase-js and d3. It's live at https://task-hub-one-delta.vercel.app/ and Vercel deploys every push to `main`.
- **The design canvas** "TaskHub Redesign" is at https://claude.ai/artifact/HtCxAmfpxTyXXA16YtkJGs. The artboards to match are **Today** (`project/Main.dc.html`) and **Task sheet** (`project/TaskSheet.dc.html`). Read them with the Artifact tool's `read` action and those paths. They use sample data ("Priya", "Lisbon"); match the layout and styling, not the content.
- **The theme** is Filow's Cream (tokens on `:root` in `index.html`), with a dark theme on `:root[data-theme="dark"]`. Every new colour must use the CSS variables so dark mode keeps working. Never hard-code the canvas's hex values.

## Already done (don't redo)

- **Calm task rows:** two lines (title, then project, one status and a step count), with tools only on hover.
- **Quick look panel:** `peekHtml()`, `renderPeek()` and `setPeek()`. It's a right drawer on desktop and a bottom sheet on phone; arrow keys move between tasks and Esc closes it.
- **"On it now"** shows 3, with a toggle for the rest.
- **One-line filters,** sidebar areas that fold, shorter rail cards.
- **Optimistic writes:** `S.db` updates the screen first, saves in the background, and puts the row back if the save fails.

## What to implement

### 1. Today header (canvas: Main, `<header>`)

- A small mono eyebrow with the date, e.g. `WEDNESDAY · 21 OCTOBER`.
- A greeting headline built from live data: "Good morning/afternoon/evening." (IST time) plus "N things today." N = open tasks on today's list, the same pool `renderView()` uses for Today.
- A slim progress bar under the headline (max-width ~320px, 6px tall) with "X of Y done" in mono beside it. This replaces the meter at the top right.

### 2. Week strip (canvas: `days`)

- The selected day is filled with ink and has cream text.
- Each day shows a small load bar instead of the "N planned" text. Width ≈ 6px × planned count, capped at about 40px.
- Keep the counts in each button's `aria-label` and `title`, e.g. "Thu 22: 15 planned, 2 done", so nothing is lost for screen readers.

### 3. Task rows: right-hand columns (canvas: `tasks` rows)

- Add two fixed columns on the right of each row:
  - **A priority pill** in mono 11px: HIGH filled ink, MED on the sunken background, LOW as an outline.
  - **The due date** in mono, right-aligned, about 64px wide: `TODAY`, a weekday like `FRI` within 6 days, otherwise `22 OCT`; overdue in the danger colour.
- Remove the due date from the meta line where it now shows on the right. The meta line keeps the project and one status: waiting, blocked, overdue or stalled.
- Use one line for the title, with an ellipsis, instead of clamping at two lines. The full title is in the quick look.
- The hover tools still overlay the right side on hover, so they'll cover the new columns while hovered. That's fine, but check it looks clean.
- Phone (≤820px): hide the priority pill and keep the due column.

### 4. "On it now" (canvas: the focus card)

- Keep the current card holding up to 3 tasks.
- For the **first** task only, show its "where you left it" note (`resumeNote`) inline in the serif italic box (one line, ellipsis), as in the canvas. The others stay compact.

### 5. Task editor (canvas: Task sheet; live: `<dialog id="taskDlg">`)

Restyle the dialog to match the artboard, keeping every field and all the save logic in the submit handler for `#taskForm`.

- **Header:** a mono eyebrow `EDIT TASK` (or `NEW TASK`) and a 44px close button.
- **Title:** a large borderless input in Bricolage 700, 26px.
- **Two-column grid:** Project | Deadline (with a mono `TODAY` / `OVERDUE` tag inside), then Effort ("~N days · start by X", computed from `effortDays` and `startBy()`) | Priority.
- **Priority:** a three-way Low / Med / High switch using real `role="radio"` buttons, replacing the `<select>`. It must still set `priority` on save.
- **"Where you left it":** a serif italic box, still editable (a styled `<textarea>`).
- **Quick toggles** as pills: Hand off (opens the existing handoff dialog), Park, On today, This week. These drive the existing `onToday` and `onWeek` checkboxes; keep the checkboxes hidden but present.
- **Fold the rest** behind a "More details" `<details>` element: Status, Waiting on, Next follow-up, Start by, Waits on (deps), Steps, Notes and Activity. All the existing editors (`#depList`, `#depAdd`, `#stepList`, `#stepNew`, `#actList`) must keep their ids and work unchanged.
- **Footer:** Delete in the danger colour as text on the left; Cancel and Save task on the right.
- **Phone:** it stays a bottom sheet (existing `dialog` media query).

### 6. Rail "This week" card (minor)

- Under the stat, add one plain sentence from `attentionCount()` and its parts, e.g. "Two need attention: one overdue, one with no deadline." Keep the existing link to Needs attention.

## Constraints

- **Writes:** every write must go through `S.db` / `upd()`, never `sb.from(...)` directly for tasks, so undo, redo and optimistic updates keep working.
- **Redrawing:** use `paint()` for redraws after local changes, and `render()` only when the view changes.
- **Accessibility:**
  - real `<button>`, `<input>` and `<label>` elements
  - text contrast at least 4.5:1 in both themes
  - touch targets at least 44px on phone
- **No new libraries.** Keep it one HTML file.
- **No database changes needed.** All the fields used already exist.

## How to check your work

1. Run the browser tests (see `tests/README.md`):
   ```bash
   mkdir -p tests/out && for f in tests/*.mjs; do echo "== $f"; node "$f" || echo "FAILED: $f"; done
   ```
   All must exit 0 with `errors []`. If you change a selector a test relies on, update the test, and say so in the commit message.
2. Look at `tests/out/v2-today.png`, `v2-peek.png` and `v2-phone*.png` from `tests/ui.mjs`. Compare them with the canvas artboards. Check that phone width (390px) has no horizontal scroll.
3. Check the theme: set `document.documentElement.dataset.theme="dark"` in a test, take a screenshot, and look at contrast.
4. Commit with a clear message and push to `main`. Vercel deploys in about a minute; confirm the live page contains your new code with `curl -s https://task-hub-one-delta.vercel.app/ | grep -c '<a function name you added>'`.

## Done means

- Today has the greeting header, the slim progress bar, the filled selected day with load bars, priority and due columns on rows, and the resume note on the first "On it now" task.
- The editor matches the Task sheet artboard, keeps every existing field, and folds the extras.
- All tests pass, the site is redeployed, and before/after screenshots are shared with Vimal.
