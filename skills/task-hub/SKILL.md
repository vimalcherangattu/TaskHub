---
name: task-hub
description: Read and write Vimal's Task Hub (Supabase project "Task-Hub", id mbbucsageoyxhekzbmyq) — tasks, projects and notes. Use whenever a task, to-do, deadline, follow-up, waiting-on, dependency, project or note comes up; whenever something is done, sent, moved, changed or partly done; and for "check my email", "sweep my week", "what's on my plate", "who am I waiting on?" and "what do I know/decide about X".
---

# Task Hub

Vimal's tasks, projects and notes live in Supabase project **Task-Hub** (`mbbucsageoyxhekzbmyq`). Use the Supabase connector (`execute_sql`). The app at https://task-hub-one-delta.vercel.app/ updates live from the database, so a write is visible there within seconds.

Today's date comes from the conversation. Weeks start Monday. "Working day" = Mon–Fri.

## Tables

**projects**: `id` text (slug, e.g. `work`, `canada-move`), `name`, `area` (`Career` | `Products` | `Life`), `color`, `parent_id` (workspace it sits in), `order`.

**tasks**: `id` text (default `t-<uuid>`; omit on insert), `title`, `project_id`, `status` (`todo` | `doing` | `waiting` | `suggested` | `done`), `priority` (`high` | `med` | `low`), `due` date, `today_date` date (on today's list), `week_of` date (Monday of the week it should finish), `start_date`, `effort_days` int, `notes`, `resume_note` (where it was left / the very next step), `started_at`, `done_at`, `waiting_on`, `waiting_since`, `follow_up_on`, `follow_ups` int, `carry_count`, `source`, `source_chat`, `steps` jsonb, `activity` jsonb, `blocked_by` text[], `created_at`, `updated_at`.

- `steps`: `[{"text": "...", "done": false}, ...]` in order.
- `activity`: change log, newest last: `[{"at": "<ISO timestamp>", "by": "claude", "text": "<what changed and why>"}]`. Keep the last 20.
- `blocked_by`: ids of tasks that must be finished before this one can start.

**notes**: `id` (default `n-<uuid>`), `project_id` (or null), `kind` (`fact` | `person` | `idea` | `decision` | `link` | `note`), `title`, `body`, `url`, `tags` text[], `source`, `superseded_by`.

Always look up existing rows before writing: match projects by name, and check for an existing task or note on the same thing before adding a new one.

## Adding tasks

- No asking first. The Suggested list in the hub is the review step.
- When Vimal says he needs to do, follow up on, decide or finish something, **add it straight away** as `status = 'todo'` with project, deadline and priority, and confirm in one line (e.g. "Added 'Call bank' to Home, due Fri 16 Oct, med"). If he gave no deadline, pick a sensible one and say so.
- Use an existing project id. If nothing fits, put it in Unsorted (`project_id = null`) and ask whether to create a project. That is the only thing to ask about.
- Work over a day: include `effort_days` and say the start date, e.g. "due 15 Oct, ~10 days, start by 5 Oct".
- Several related tasks: link them in order with `blocked_by` and say so ("B waits on A").
- Insert with `source = 'claude'` and the chat topic in `source_chat`.

## Claude's own suggestions

When you recommend a concrete next step he hasn't rejected, add it **without asking**: `status = 'suggested'`, right project, suggested `due`, `source_chat` = chat topic. Only real actions, not general advice or options he is still weighing.

## Keeping tasks current (no need to ask)

As the chat goes on, keep the matching task up to date and confirm each change in one line, e.g. "Updated 'Move flat': deposit done, 1 step left."

- **Done**: `status = 'done'`, `done_at = now()`. Only when every part is finished.
- **Partly done**: tick the matching step. If the task has no steps but clearly has several parts, add them.
- **Changed shape**: rename, rewrite steps, move `due` or `project_id` to match.
- **Moved**: new `due` (and clear `today_date` if it's no longer today).
- **No longer relevant**: delete it.
- After each change, append one line to `activity` (`by: "claude"`) and set `resume_note` to the next step when there is one.
- **Can't start until another task is done**: add that task's id to `blocked_by`.

## Waiting on people

- "I sent / shared / asked X for …": `status = 'waiting'`, `waiting_on = 'X'`, `waiting_since = now()`, `follow_ups = 0`, `follow_up_on` = next working day.
- "Followed up with X": `follow_ups + 1`; next `follow_up_on` 2 working days out (3 after the third follow-up).
- "X replied": close it (`done`), or if more work is needed set `status = 'todo'`, `today_date = today`, `follow_up_on = null`.
- "Who am I waiting on?": list waiting tasks grouped by `waiting_on`, oldest first, flag follow-ups due today or earlier.

## Notes (second brain)

- Save things worth keeping as notes with the right `kind` and project, and confirm in one line: an idea, a decision and why, a person and how he knows them, a useful link, a lasting fact about a project.
- If a note on the same thing exists, update it instead of adding a duplicate.
- Don't save passing remarks, moods, or your own suggestions unless he agrees.
- "What do I know / did I decide about X": answer from notes **and** tasks together.

## Commands

- **"Check my email"**: read Gmail from the last 3 days. Add a **suggested** task for anything needing action from him (replies owed, deadlines, payments, documents to send), with `source_chat = 'Email: <sender/subject>'`. Skip newsletters and notifications. Then summarise what was added, grouped by project.
- **"Sweep my week"**: review recent chats for tasks and notes never logged. Add missed tasks as **suggested**, save clear notes directly, then summarise by project.
- **"What's on my plate"**: answer from the hub in this order: today (`today_date = today` or due today), overdue, then the rest of this week. Mention anything blocked (`blocked_by` not done) separately as "can't start yet".

## Useful queries

```sql
-- open tasks with project names
select t.id, t.title, coalesce(p.name,'Unsorted') project, t.status, t.priority, t.due, t.today_date, t.blocked_by
from tasks t left join projects p on p.id = t.project_id
where t.status <> 'done' order by project, t.due nulls last;

-- tick step N (0-based) and log it
update tasks set
  steps = jsonb_set(steps, '{N,done}', 'true'),
  activity = activity || jsonb_build_array(jsonb_build_object('at', now(), 'by', 'claude', 'text', '<what was done>')),
  resume_note = '<next step>', updated_at = now()
where id = '<task id>';

-- add a dependency (task waits on another)
update tasks set blocked_by = array(select distinct unnest(blocked_by || array['<prerequisite id>'])), updated_at = now()
where id = '<task id>';

-- trim activity to the last 20 entries
update tasks set activity = (select coalesce(jsonb_agg(e order by i), '[]') from jsonb_array_elements(activity) with ordinality a(e, i) where i > jsonb_array_length(activity) - 20)
where id = '<task id>';
```
