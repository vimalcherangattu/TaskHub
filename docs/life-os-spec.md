# Ambalam: complete second brain + Life OS — spec

**Written:** 25 Oct 2026. **Status:** spec, waiting on Vimal's review of the design canvas before the build starts.
**Builds on:** `docs/second-brain.md` (what exists) and `STATUS.md` (where things stand).
**Design:** canvas "TaskHub Redesign", page "Life OS + second brain": https://claude.ai/artifact/HtCxAmfpxTyXXA16YtkJGs (15 artboards: Today with habits and check-in, Life, Goals, Area, Weekly review, Log, Person, People list and map, Note with links, Capture, Life admin, the sidebar, and three phone screens). The sample goals, habits, amounts and some names on it are examples to replace.

## In one paragraph

Ambalam already runs Vimal's *work* well: capture, tasks, calls, briefs, agents. This spec finishes the second brain (Part A: links between everything, people as real records with their connections, more ways in, nothing ever lost) and turns the app into a **Life OS** (Part B): a few life areas with a standard for each, yearly and quarterly goals that the week's focus ties back to, daily habits, a one-minute evening check-in that builds a life log, guided reviews from weekly to yearly, and a place for life admin (renewals, documents, subscriptions). Agents keep doing the upkeep; Vimal only checks in, decides and reviews.

## How the app is organised after this

Three spaces, one front door (Capture + Search stay shared, as decided on 21 Oct):

| Space | Purpose | Screens |
|---|---|---|
| **Do** | Things with a next action and a date | Today, This week, Waiting on others, Needs attention, Suggested, Run by agents, All tasks, Call prep |
| **Know** | Things kept to find or reuse | Notes, People, Topics, Map, Archive |
| **Live** *(new)* | Where life is going and how it's going | Life (overview), Goals, Habits, Log, Reviews, Life admin |

- **Sidebar:** three labelled groups (Do / Know / Live), then the project areas as now.
- **Phone tab bar:** Today · Week · Life · Notes · More. "More" opens a sheet with everything else. Ten tabs today is too many for a phone.
- **Today stays the home screen.** It gains two small things from Live: the habit row and, after 6 PM, the evening check-in. Nothing else from Live is put on Today, so it doesn't get cluttered.

---

# Part A — Complete the second brain

## A1. Links between everything (backlinks)

**What Vimal gets:** any note, task, person, call, goal or topic can point to any other. Every item shows a "Linked here" list. Typing `[[` in a note or task body opens a picker and inserts a link.

**Data:** one new table, used for every kind of link so we never need a table per pair.

```
links(id text pk default 'l-'||uuid, from_type text, from_id text, to_type text, to_id text,
      kind text default 'related',      -- related | about | mentions | part_of | member | spawned
      note text, created_by text default 'you', created_at timestamptz default now(),
      unique(from_type, from_id, to_type, to_id, kind))
-- types: note | task | person | source | project | goal | area | habit | record | topic
```

- `[[Title]]` in a body is stored as text `[[n-xxxx|Title]]`; on save the app syncs `links` rows of kind `mentions` for that item (adds new, removes gone).
- **Backlinks panel:** "Linked here (n)" under every note editor, task quick look, person page, goal and topic page. Grouped by type.
- **"Might be related":** up to 3 suggestions per note (two or more shared rare words, or the same tag and project). One tap to link, one to hide. The hourly agent also proposes links for new notes (kind `related`, `created_by='meeting-agent'`).
- **A note can spawn a task** (and a task can save a note): the "spawned" link keeps them connected.
- Mind map gains a "Links" mode that draws these edges.

## A2. People as real records, with their connections

**Problem today:** people are notes of kind `person`, matched by first name. Two Davids share loops; a person's projects aren't known; you can't see who overlaps with whom.

**What Vimal gets:**
- A **person page** that shows: who they are, the circles they're in, **the projects they're part of** (and their role there), open loops both ways, next call, recent calls, decisions, **who they work with** (people they share projects or calls with), last contact and a keep-in-touch nudge for friends and family.
- A **People list** with filters: circle (Work, Family, Friends, Network), project, "owe them", "they owe me", "haven't spoken in a while".
- **Overlaps:** "Also on Zenara positioning: Ravi, Deepak". "You last saw David and Sam together on the GTM catch-up, 21 Oct."
- **A people map:** people and projects as dots; lines show shared projects and calls. Click a person to centre on them.
- On every **project page**, a "People" strip with roles.

**Data:**

```
people(id text pk,                 -- slug, e.g. 'david-m'
       name text not null, aliases text[] default '{}',   -- 'Dave', 'David M'
       emails text[] default '{}', org text, role text,
       circles text[] default '{}', -- work | family | friends | network
       how_met text, note_id text references notes(id),  -- the existing person note is the profile body
       cadence_days int,            -- keep in touch every N days (null = no nudge)
       last_contact_at timestamptz, -- set by calls, sent email, or "Talked today"
       birthday date, private boolean default false, archived_at timestamptz,
       created_at, updated_at)
```

- **Person ↔ project** is a `links` row: `from_type='person', to_type='project', kind='member', note='<role>'`.
- **Matching** (app, agent and skill all use one rule, via a new RPC `person_match(text)`): exact name or alias first, then email, then first name only when that first name is unique. Ambiguous matches are listed as "Could be David M or David K" instead of guessing.
- **Derived connections** (no extra writes): calls (`sources.attendees`), `call_series.people`, `tasks.waiting_on`, `inputs.owner`, decision notes that name them. RPC `person_graph(person_id)` returns projects, co-attendees with counts, shared projects and last contact.
- **Backfill:** one row per current person note (33). Projects come from the note's project, the calls they attended and the call series they're in. Vimal confirms the list once ("Check your people" screen with Merge for duplicates).
- **Agent:** the hourly agent sets `last_contact_at` from calls and sent email, adds new people it meets in calls as `suggested` person rows (shown in a "New people" strip), and adds member links when someone shows up in a project's calls twice.

## A3. More ways in

| Way in | How it works | Cost |
|---|---|---|
| **Voice** | A mic button in Capture uses the browser's own dictation (Web Speech API). Speak, see the words, save. Falls back to the phone keyboard's mic where not supported. | Free |
| **Forward an email** | Forward any email to `vimalcherangattu+ambalam@gmail.com`. The hourly agent treats mail to that address as a capture: a note in the inbox (or a task if it reads like one), linked to the sender's person record. | Free; agent change only |
| **Telegram** | A private Telegram bot. Anything Vimal sends it (text, link, voice note transcribed) lands in the Notes inbox. A Supabase Edge Function receives it and only accepts Vimal's chat id. | Free |
| **WhatsApp** | Android: Share → Ambalam (works today once installed). iPhone: a Shortcut that opens `?title=&url=`. A WhatsApp bot needs paid Business API, so it is not planned. | Free |
| **Quick log** | From Capture: "Log" saves a habit tick, a metric value or a journal line without leaving the screen. | Free |

## A4. Nothing ever lost

- **Offline queue:** every capture and task or note edit made offline goes into a local outbox (`ambalam.outbox.v1` in localStorage) and is sent, in order, when the connection is back. A small "3 waiting to sync" chip shows while it waits. Cleared on sign-out, like the cache.
- **Export:** Settings → "Export everything" downloads one JSON file (all tables) and one Markdown file (projects → briefs, notes, open tasks; people; goals; the log). No new libraries.
- **Nightly vault:** a scheduled task writes the whole hub as Markdown files to a **private** GitHub repo (`ambalam-vault`), one file per project, person, topic, goal and day of the log, and commits. That gives a history of every change and a copy that outlives the app. *Needs Vimal to create the repo and give Claude access.*

## A5. Archive

- `projects.archived_at timestamptz`. "Archive project" on a project page (only when no open tasks, or after moving them).
- Archived projects leave the sidebar and appear under Know → Archive with their brief, notes and done tasks. Search still finds them, ranked lower.
- People and goals can be archived the same way.

## A6. Smaller fixes from the open list

- **Task ↔ chat link:** "Work with Claude" stores the chat link on the task the first time, so it reopens the same chat.
- **Private items:** `notes.private`, `tasks.private` and `sources.private` already exist but nothing uses them. They become a lock toggle in the editors. Private items are blurred until tapped, never shown in agent pushes, and left out of the vault unless Vimal opts in.

---

# Part B — Life OS

## B1. The compass (top of everything)

One short page Vimal writes once and revisits each year:
- **Vision:** where life is heading in 3–5 years, a few lines.
- **Values:** 3–5 words with one line each.
- **Not doing:** the things he has decided not to take on.

```
compass(id int pk default 1 check (id = 1), vision text, values jsonb default '[]',
        not_doing text[] default '{}', updated_at)
```

Shown at the top of the Life view (folded) and used by the quarterly and yearly reviews.

## B2. Life areas, each with a standard

**Areas (proposed; Vimal confirms):** Work · Products · Health · Money · Family & home · Friends & people · Growth · Rest & fun.

Each area has:
- a **standard**: one line saying what "fine" looks like (e.g. Health: "Move 4×/week, sleep 7 h, check-up yearly");
- a **status**: *Good* / *Watch* / *Off*, with a one-line why, set by Vimal or suggested by an agent;
- its goals, habits, projects, metrics and life-admin records.

```
life_areas(id text pk, name text, standard text, status text default 'good' check (status in ('good','watch','off')),
           status_note text, status_set_by text, reviewed_at timestamptz, color text, "order" int, created_at, updated_at)
alter table projects add column life_area text references life_areas(id);  -- separate from projects.area, which drives the sidebar
```

- **Mapping:** existing `projects.area` stays untouched (the agent, skill and sidebar depend on it). Backfill `life_area`: Career projects → Work, Products → Products, and the Life projects by name (Health & fitness → Health, Admin & finance → Money, Home & family → Family & home, Travel and Gardening → Rest & fun, Canada trip → Family & home). Vimal checks the list once.
- **Suggested status:** the weekly review flags an area as *Watch* when its habits fall under 50% for two weeks, a goal in it has no movement for 3 weeks, or a renewal in it is overdue. It never sets *Off*; only Vimal does.

## B3. Goals: year → quarter → week

**What Vimal gets:** 3–5 goals for the year, 3–5 for the quarter, each in an area, each with a way to tell progress. The week's focus themes and starred tasks can point to a goal, so every week shows *why* it matters. Goals with no movement get flagged.

```
goals(id text pk default 'g-'||uuid, title text not null, why text,
      horizon text check (horizon in ('year','quarter')), period_start date,  -- Jan 1 / quarter's 1st day
      area_id text references life_areas(id), parent_id text references goals(id),  -- quarter goal under a year goal
      measure text check (measure in ('milestones','number','done')) default 'milestones',
      target numeric, current numeric, unit text,
      status text default 'active' check (status in ('active','done','dropped','paused')),
      done_at timestamptz, "order" int, created_at, updated_at)
alter table focus_themes add column goal_id text references goals(id);
```

- **Progress** depends on `measure`:
  - *milestones*: share of linked tasks and projects that are done (links of kind `part_of` from task/project to goal);
  - *number*: `current / target` (e.g. "₹X saved", "4 chapters"), updated by hand or from a metric;
  - *done*: a yes/no goal.
- **Last moved:** the latest change to anything linked. Flagged "No movement for 3 weeks" in the weekly review and on the Life view.
- **In the Week view:** "Focus this week" themes show their goal as a small tag. Adding a theme offers "Which goal does this serve?" (optional).
- **Project pages** show the goal they serve.

## B4. Habits

**What Vimal gets:** a row of round check buttons at the top of Today (morning habits before noon, evening ones after). One tap ticks; a long press adds a note. Each habit shows a 4-week dot strip and its streak on the Habits page.

```
habits(id text pk default 'h-'||uuid, title text, area_id text references life_areas(id), goal_id text references goals(id),
       cadence text check (cadence in ('daily','weekdays','weekly')) default 'daily', per_week int,  -- for 'weekly': N times a week
       part_of_day text check (part_of_day in ('morning','day','evening')) default 'day',
       active boolean default true, "order" int, created_at, updated_at)
habit_logs(habit_id text references habits(id) on delete cascade, day date, done boolean default true, note text,
           created_at, primary key (habit_id, day))
```

- **Streaks** are counted against the cadence: a weekdays habit doesn't break on Saturday; a 3×-a-week habit counts weeks.
- **No guilt design:** a missed day shows as an empty dot, not red. "Skip today (sick / travel)" keeps the streak.
- Habits are **not tasks**: they never appear in task lists, Needs attention or counts.
- Agents never tick habits. The 9 AM push may say "Meditation: 6-day streak" once a week, not daily.

## B5. Evening check-in and the life log

**What Vimal gets:** after 6 PM, a card at the top of Today: *How was today?* energy (1–5), mood (1–5), one line, and "one win". Takes under a minute. Each night an agent adds a factual summary (tasks done, calls, decisions, habits) so every day has a page even when he skips the check-in.

The **Log** view is a month calendar: each day tinted by energy, with dots for habits done. Tap a day to see the whole day: the check-in, what got done, calls, notes and decisions made, habits. Search can be limited to a date range ("what was I doing in March?").

```
daily_log(day date pk, energy smallint check (energy between 1 and 5), mood smallint check (mood between 1 and 5),
          line text, win text, lesson text, body text,   -- body: optional longer journal
          summary text, summary_at timestamptz,          -- agent-written facts of the day
          private boolean default true, created_at, updated_at)
```

- Journal entries are **private by default**: agents may write `summary` but don't read `line`/`win`/`body` unless Vimal turns that on (decision needed, see the end).
- The weekly review shows the energy line for the week and the wins.

## B6. Reviews: weekly, monthly, quarterly, yearly

**What Vimal gets:** a guided review screen, one step at a time, with the draft already filled in by an agent. He reads, edits, decides, and it's saved.

| Review | When | Steps |
|---|---|---|
| **Weekly** | Sunday evening (the Friday *work* review stays) | 1 Wins and what got done · 2 Energy and habits this week · 3 Goals: moved / stalled · 4 Areas: still good? · 5 Inbox to zero (notes and suggested) · 6 Pick next week's focus (3–5 themes, each tied to a goal) |
| **Monthly** | 1st of the month | 1 The month in numbers (done, habits %, energy average, metrics) · 2 Goals progress · 3 Area statuses · 4 Life admin due next month · 5 One change for next month |
| **Quarterly** | First week of Jan/Apr/Jul/Oct | 1 Quarter goals: done / carry / drop · 2 Compass check · 3 Set next quarter's 3–5 goals under the year goals · 4 Archive finished projects |
| **Yearly** | Last week of December | 1 The year in review (log highlights, wins, goals) · 2 Rewrite the compass · 3 Set the year's goals · 4 Areas: new standards |

```
reviews(id text pk default 'r-'||uuid, kind text check (kind in ('weekly','monthly','quarterly','yearly')),
        period_start date, draft jsonb,     -- agent-prepared numbers and lists, one key per step
        answers jsonb default '{}',         -- Vimal's notes and choices per step
        status text default 'draft' check (status in ('draft','in_progress','done','skipped')),
        done_at timestamptz, created_at, updated_at, unique (kind, period_start))
```

- The 9 AM lead creates the draft on the review's day and its push says "Your weekly review is ready (about 10 minutes)".
- Choices made in a review write through normal paths: themes into `focus_themes`, goals into `goals`, area statuses into `life_areas`, archive into `projects.archived_at`.
- Unfinished reviews stay one tap away on the Life view until the next one is due, then they're marked skipped.

## B7. Life admin: renewals, documents, subscriptions

**What Vimal gets:** a list of the things adult life needs kept track of, grouped by area, sorted by what's due next: passport and visa expiry, insurance, car, subscriptions, warranties, tax dates, important documents (with a link to where the file lives, e.g. Google Drive). Thirty days before something renews, a task appears automatically.

```
records(id text pk default 'rec-'||uuid, title text, area_id text references life_areas(id),
        kind text check (kind in ('document','policy','subscription','id','account','warranty','other')),
        renews_on date, every_months int,       -- repeats; null = one-off
        amount numeric, currency text default 'INR', url text, notes text,
        remind_days int default 30, private boolean default true, archived_at timestamptz, created_at, updated_at)
```

- The 9 AM lead creates one `todo` task "Renew <title>" (project = the area's admin project, due = `renews_on`) when `renews_on - remind_days` is reached, and links it to the record. When that task is done, `renews_on` rolls forward by `every_months`.
- Never store numbers like passport or account numbers in plain text; store where the document is.

## B8. Area metrics (light)

A few numbers worth watching per area (weight, sleep hours, savings, runway months, words written). Logged from Capture → Log or the area page; shown as a small line chart on the area page and in the monthly review. A goal with `measure='number'` can follow a metric.

```
metrics(id text pk default 'm-'||uuid, area_id text references life_areas(id), name text, unit text,
        better text check (better in ('up','down')) default 'up', target numeric, active boolean default true, "order" int)
metric_logs(metric_id text references metrics(id) on delete cascade, day date, value numeric, note text,
            primary key (metric_id, day))
```

## B9. The Life view (the overview)

One screen, top to bottom:
1. **This quarter**: the quarter's goals as rows with a progress bar, area tag and "last moved"; stalled ones flagged.
2. **Areas**: a grid of cards, one per area: name, status (Good / Watch / Off, shown with a word and a mark, never colour alone), the standard, and one line of evidence ("Habits 5/7 · weight ↓").
3. **Habits this week**: each habit with 7 dots.
4. **Energy**: the last 4 weeks as a small bar strip from the log.
5. **Coming up**: next review, renewals in 30 days, birthdays and keep-in-touch nudges.
6. **Compass** (folded).

## B10. Agents: what changes

All changes are new `agent_config` addenda (mirrored in `agents/meeting-agent.md`) or edits to the 9 AM lead's prompt, so each lane stays as decided on 24 Oct.

| Agent | New work |
|---|---|
| **Hourly agent** | Email-forward captures (A3) · person matching through `person_match`, `last_contact_at`, suggested new people, member links (A2) · suggested note links (A1) |
| **9 AM lead** | Review drafts on their days (B6) · renewal tasks (B7) · keep-in-touch and birthday line (A2) · weekly area-status suggestions (B2) · stalled-goal line in the Monday push (B3) |
| **Nightly sweep (01:11)** | Writes `daily_log.summary` for the day just ended (B5) |
| **New: nightly vault (02:13)** | Markdown export to `ambalam-vault` and commit (A4) |
| **Monthly (1st)** | Already folds decisions into briefs; also drafts the monthly review if the 9 AM lead hasn't |

The skill (`skills/task-hub/SKILL.md`) gets a "Life OS" section: goals, habits, log, reviews, records, people records, links, plus recipes in `reference/queries.md`. New commands: **"how's my life"** (Life view in words), **"log today"** (check-in by chat), **"start my weekly review"**.

## B11. Rules that keep it safe

- Allowed values are checked by the database (the `check` constraints above).
- New tables get the same row-level security as the others (signed-in owner only) and the same `changes` triggers, so the feed and undo keep working.
- App writes go through `S.db` / `upd()` (extended to the new tables), never `sb.from(...)` directly.
- New columns go in `MAP` in `index.html` (camelCase ↔ snake_case).
- `tasks.status`, `priority`, `notes.kind` and `owner` values don't change. People get their own table instead of a new note kind.
- `hub_delete` gains the new tables.

---

# Build plan

Each phase ships on its own, with tests, and is usable the day it lands.

| Phase | What | Rough size |
|---|---|---|
| **1. Second brain complete** | A2 people records + connections + people map · A1 links and backlinks · A5 archive · A4 offline queue and export · A3 voice capture and email forward · A6 private toggle and chat link | Largest; 2 sessions |
| **2. Life OS core** | B2 areas · B3 goals · B4 habits · B5 check-in and log · B9 Life view · new navigation (Do / Know / Live, phone tabs) | 2 sessions |
| **3. Rhythm** | B6 reviews (guided screens + agent drafts) · B7 life admin · B8 metrics · agent changes in B10 · skill update | 1–2 sessions |
| **4. Outside the app** | Telegram bot (Edge Function) · nightly vault | 1 session, needs Vimal's setup steps |

**Tests:** one new test file per feature in `tests/` (people, links, offline, goals, habits, log, reviews, records), all against the in-memory mock, plus updates to `ui.mjs` for the new navigation. All must print `errors []`.

# Decisions (Vimal, 26 Oct 2026)

1. **Life areas:** start with the eight above (Work, Products, Health, Money, Family & home, Friends & people, Growth, Rest & fun).
2. **Journal privacy:** agents may read the evening check-ins (to write summaries and review drafts).
3. **Reviews:** keep them separate: Sunday evening for life, the Friday work review stays.
4. **Vault:** yes, a private repo `ambalam-vault` for the nightly Markdown copy.
5. **Outside capture:** Telegram (easiest interface). WhatsApp isn't planned (paid API).
6. **Phone tabs:** Today · Week · Life · Notes · More.
7. **Look:** the live colour scheme (white, slate ink, navy accent) replaces Cream; the canvas was recoloured to match.

# Build log

**Phase 1, 26 Oct 2026 (built):**
- `people` and `links` tables, `projects.archived_at`, `tasks.chat_url`, and the `person_match()` RPC. Small changes from the spec: a person's state is `people.status` (`active` | `suggested` | `archived`) instead of `archived_at`, and ids are `p-<uuid>` (agents find people by name through `person_match`, so slugs weren't needed). `hub_delete` was not extended (the change needed an approval prompt that never appeared): people are archived, never deleted, and the app removes links itself.
- Backfill: 32 people from the person notes and call attendees, with member links (from each person's note and the main project of calls they joined; other projects their calls touched are weaker `related` links, "Also came up in"). Skipped on purpose: Cabo (dog) and "Card-game group" (still person notes, shown in People until tidied). Not merged, to check: DJ, Daranjee and Dhananjay may be one person.
- App: People list (circles filter, they owe me, haven't spoken in a while, "New from calls"), people map, person page (projects with roles, works with, keep in touch, birthday, linked here), person editor, People strip on project pages, Keep in touch card on Today; `[[` links in notes and task notes with "Linked here" and "Might be related"; Archive; offline outbox; Export everything; dictation in Capture; private lock on notes and tasks; a task remembers its Claude chat.
- Agent: `agent_config` row `meeting-agent-9f-people-links` (person matching and last contact, suggested people, member links, email captures to `+ambalam`, note links, private rows).
- Still to do from Part A: Telegram bot and the nightly vault (phase 4).
- Fix, 26 Oct: Daranjee was a typo for Dhananjay (DJ); merged into one person (aliases DJ, Daranjee).

**Phase 2, 26 Oct 2026 (built):**
- Tables `life_areas` (the 8 areas, standards left as placeholders for Vimal), `goals`, `habits`, `habit_logs` (with `skipped`), `daily_log`, `compass`; `projects.life_area` (backfilled: Career → Work, Products → Products, the two books → Growth, Health, Admin & finance and Aahista → Money, Home & family and Canada → Family & home, Travel, Gardening and Last Drag → Rest & fun); `focus_themes.goal_id`.
- App: sidebar grouped Do / Know / Live; phone bar Today · Week · Life · Notes · More (a sheet with everything else); habits row and evening check-in on Today; Life page (quarter goals, areas, habits this week, energy, coming up, compass); area page (status, standard, goals, habits, projects); Goals (year → quarter tree, goal page with linked tasks and projects, number goals); Habits (28-day dots, streaks, skip); Log (month calendar, a page per day); week themes can serve a goal; projects have a life area.
- Skill: "Life OS" section. Still to do in phase 3: reviews, life admin, metrics, and the agent changes (nightly `daily_log.summary`, review drafts, renewal tasks, area-status suggestions, stalled-goal line).
