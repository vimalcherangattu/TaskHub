# 9 AM lead: STEP 7, Life OS (phase 3)

Live copy: `agent_config` row `lead-7-life-os`. The 9 AM lead's prompt (`trig_011BLdwdUmAJxr7ccRKQFuNr`) says to read and follow it. Keep the two in step.

```
STEP 7: LIFE OS (every day; added 26 Oct 2026). Tables: life_areas(id, name, standard, status good|watch|off, status_note), goals(id, title, horizon year|quarter, period_start, area_id, parent_id, measure, target, current, unit, metric_id, status active|done|dropped|paused, updated_at), habits(id, title, area_id, cadence daily|weekdays|weekly, per_week, active), habit_logs(habit_id, day, done, skipped), daily_log(day, energy, mood, line, win, lesson, summary), metrics(id, area_id, name, unit, better up|down, target, active), metric_logs(metric_id, day, value), records(id, title, area_id, kind, renews_on, every_months, remind_days, amount, currency, url, task_id, archived_at), reviews(id, kind weekly|monthly|quarterly|yearly, period_start, draft jsonb, answers jsonb, status draft|in_progress|done|skipped, drafted_by), people(id, name, cadence_days, last_contact_at, birthday, status), links(from_type, from_id, to_type, to_id, kind). Today = (now() at time zone 'Asia/Kolkata')::date. Begin writes with select set_config('app.actor','routine:9am',true);
Check-ins (daily_log energy/mood/line/win/lesson/body) may be read for review drafts, but NEVER quote them in the push or in any task: the push only says a review is ready.

7A RENEWALS (every day).
1. Roll forward a renewal that was done: for each record with archived_at is null and task_id set whose task has status 'done': if every_months is set, move renews_on forward by every_months months (repeat until renews_on >= today); then set task_id = null. update records set renews_on = <new date>, task_id = null where id = '<id>';
2. Make renewal tasks: select r.* from records r where r.archived_at is null and r.renews_on is not null and r.task_id is null and r.renews_on - r.remind_days <= <today>; For each (skip if an open task titled 'Renew <title>' already exists; then just set task_id to it): INSERT a task with title 'Renew <title>', status 'todo', owner 'me', due = renews_on, priority 'high' if renews_on <= today + 7 else 'med', source 'scheduled:lead', source_chat 'Life admin: <title>', project_id = a project with life_area = the record's area_id and name ilike '%admin%', else any non-archived project with that life_area, else 'admin-finance', notes = where the file lives (url) and the last amount, never any document number. Then update records set task_id = '<new task id>' where id = '<record id>'; Never set due_firm. Push line: "Renewals: <title> (<d Mon>)".

7B REVIEW DRAFTS (only on their days). Create the draft row; never touch a review whose status isn't 'draft'.
- Sunday: weekly, period_start = today - 6 (that week's Monday).
- 1st of the month: monthly, period_start = the 1st of last month.
- 1st of Jan, Apr, Jul, Oct: quarterly, period_start = the first day of the quarter that just ended.
- 24 Dec: yearly, period_start = 1 Jan of this year.
INSERT INTO reviews (kind, period_start, draft, status, drafted_by) VALUES ('<kind>', '<start>', '<draft json>'::jsonb, 'draft', 'routine:9am') ON CONFLICT (kind, period_start) DO UPDATE SET draft = excluded.draft, drafted_by = excluded.drafted_by WHERE reviews.status = 'draft';
draft = one key per step, each {"text": "<2-5 short Markdown lines>"}: plain facts and one suggestion, no praise, no padding.
- weekly: wins (count of owner='me' tasks done that week, the 3 that mattered most, wins written in daily_log), energy (average energy, best and worst day, habits done vs due), goals (active quarter goals: which moved, which are stalled = nothing linked changed in 21 days), areas (for each area: "Maybe Watch: <why>" when its habits were under 50% for two weeks, a goal in it is stalled, or one of its records is past renews_on; otherwise nothing; NEVER change life_areas yourself), inbox (unfiled notes and suggested tasks counts), focus (3-5 week themes for next week, each with the goal it serves).
- monthly: numbers (tasks done, habits %, energy average, each active metric's first and last value that month), goals, areas (as weekly), admin (records renewing before the end of next month), change (one suggestion).
- quarterly: qgoals (each goal of that quarter: done / carry / drop, with a reason), compass (one line: does the quarter fit the vision and values?), nextq (3-5 goal ideas for the new quarter under the year goals), archive (non-archived projects with no open tasks).
- yearly: year (tasks done, goals done, the best wins), compass, ygoals, standards (areas whose standard is still a [placeholder]).
Push line on the day: "Your <kind> review is ready (about 10 minutes)" (15 for monthly, 30 quarterly, 60 yearly). On Monday and Tuesday, if last week's weekly review is still 'draft' or 'in_progress', say "Weekly review still open".

7C PEOPLE (every day; one line, at most 3 names). Active people whose cadence_days is set and last_contact_at < now() - cadence_days days: "Get in touch: <name> (<n> days)". People with a birthday today or in the next 3 days: "Birthday: <name> <d Mon>". Leave the line out when there are none.

7D STALLED GOALS (Mondays only). Active goals of this quarter where nothing moved in 21 days (goal updated_at, linked tasks' or projects' tasks' updated_at/done_at, metric_logs of goals.metric_id, habit_logs of habits with goal_id) and created over 21 days ago: "Stalled goals: <title>; <title>". Don't change the goals.

You may write only: reviews rows in 7B (draft status only), records.renews_on / records.task_id in 7A, and the renewal tasks in 7A. Agents never tick habits, never write daily_log check-in fields, never set an area's status.
```
