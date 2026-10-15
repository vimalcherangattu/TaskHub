# Task Hub: tested SQL recipes

All recipes were run against the live schema. Replace `<…>` placeholders. `TODAY` below means `(now() at time zone 'Asia/Kolkata')::date`.

## Read

```sql
-- Projects (to pick an id)
select id, name, area, parent_id from projects order by area, coalesce(parent_id, id), id;

-- Open tasks with project names and dependency state
select t.id, t.title, coalesce(p.name,'Unsorted') project, t.status, t.priority, t.due, t.today_date,
       t.steps, t.blocked_by, t.waiting_on, t.follow_up_on
from tasks t left join projects p on p.id = t.project_id
where t.status <> 'done'
order by project, t.due nulls last;

-- Find a task by words in its title or notes
select id, title, status, due from tasks
where status <> 'done' and (title ilike '%<word>%' or notes ilike '%<word>%');
```

## What's on my plate (mirrors the app's Today screen)

```sql
with d as (select (now() at time zone 'Asia/Kolkata')::date as today),
o as (
  select t.*, coalesce(p.name,'Unsorted') project,
    coalesce(t.start_date, case when t.due is not null and t.effort_days > 0 then t.due - t.effort_days end) start_by,
    exists (select 1 from unnest(t.blocked_by) b join tasks x on x.id = b where x.status <> 'done') blocked,
    (select string_agg(x.title, '; ') from unnest(t.blocked_by) b join tasks x on x.id = b where x.status <> 'done') waits_on_titles
  from tasks t left join projects p on p.id = t.project_id
  where t.status not in ('done','suggested'))
select case
    when o.status = 'doing' then '1 on it now'
    when o.status = 'waiting' then '2 follow up today'
    when o.blocked and (o.today_date = d.today or o.due <= d.today or o.start_by <= d.today) then '5 cannot start yet'
    when o.due < d.today then '3 overdue'
    when o.today_date = d.today or o.due = d.today then '4 today'
    when o.start_by <= d.today then '4 start today'
    when o.due <= d.today + 6 then '6 later this week'
  end as bucket, o.project, o.title, o.priority, o.due, o.waiting_on, o.waits_on_titles
from o, d
where (o.status <> 'waiting' or coalesce(o.follow_up_on, d.today) <= d.today)
order by 1 nulls last, case o.priority when 'high' then 0 when 'med' then 1 else 2 end, o.due nulls last;
-- Rows with a null bucket are later than this week; leave them out of the answer.
```

## Add

```sql
-- Task (id is generated; never set it)
insert into tasks (title, project_id, status, priority, due, today_date, effort_days, notes, source, source_chat, steps)
values ('<title>', '<project id or null>', 'todo', 'med', '<YYYY-MM-DD>', null, null, '<why / context>', 'chat', 'Chat: <topic>',
        '[]'::jsonb)
returning id;
-- Use status 'suggested' for your own recommendations.
-- Steps on insert: '[{"text":"First part","done":false},{"text":"Second part","done":false}]'::jsonb

-- Note
insert into notes (project_id, kind, title, body, url, tags, source)
values ('<project id or null>', '<fact|person|idea|decision|link|note>', '<title>', '<body>', null, '{<tag>,<tag>}', 'chat: <topic>')
returning id;
```

## Status changes

```sql
-- Start
update tasks set status = 'doing', started_at = coalesce(case when status = 'doing' then started_at end, now()) where id = '<id>';

-- Done
update tasks set status = 'done', done_at = now() where id = '<id>' and status <> 'done';

-- Reopen
update tasks set status = 'todo', done_at = null where id = '<id>';

-- Put on today / take off today
update tasks set today_date = (now() at time zone 'Asia/Kolkata')::date where id = '<id>';
update tasks set today_date = null where id = '<id>';

-- Finish this week (week_of must be Monday)
update tasks set week_of = (now() at time zone 'Asia/Kolkata')::date
  - (extract(isodow from (now() at time zone 'Asia/Kolkata'))::int - 1)
where id = '<id>';

-- Move the deadline (adds to carry_count when the task was already past due or past its today date)
update tasks set
  carry_count = carry_count + case when (due < (now() at time zone 'Asia/Kolkata')::date and '<new due>'::date > due)
                                     or (today_date < (now() at time zone 'Asia/Kolkata')::date) then 1 else 0 end,
  due = '<new due>',
  today_date = case when today_date < (now() at time zone 'Asia/Kolkata')::date then null else today_date end
where id = '<id>';
```

## Waiting on people

```sql
-- "I sent / asked X"  (next working day: Fri→Mon, Sat→Mon, else +1)
update tasks set status = 'waiting', waiting_on = '<X>', waiting_since = now(), follow_ups = 0,
  follow_up_on = (select d from generate_series((now() at time zone 'Asia/Kolkata')::date + 1, (now() at time zone 'Asia/Kolkata')::date + 7, interval '1 day') g(d)
                  where extract(isodow from d) < 6 order by d limit 1)::date
where id = '<id>';

-- "Followed up with X"  (2 working days out, 3 once follow_ups reaches 3)
update tasks set follow_ups = follow_ups + 1,
  follow_up_on = (select d from generate_series((now() at time zone 'Asia/Kolkata')::date + 1, (now() at time zone 'Asia/Kolkata')::date + 10, interval '1 day') g(d)
                  where extract(isodow from d) < 6 order by d offset (case when follow_ups + 1 >= 3 then 2 else 1 end) limit 1)::date
where id = '<id>';

-- "X replied, more work needed"
update tasks set status = 'todo', today_date = (now() at time zone 'Asia/Kolkata')::date, follow_up_on = null where id = '<id>';

-- Who am I waiting on?
select waiting_on, title, waiting_since::date since, follow_ups, follow_up_on,
       follow_up_on <= (now() at time zone 'Asia/Kolkata')::date as follow_up_due
from tasks where status = 'waiting' order by waiting_on, waiting_since;
```

## Steps (positions are 0-based)

```sql
-- Tick step N
update tasks set steps = jsonb_set(steps, '{<N>,done}', 'true') where id = '<id>';

-- Untick step N
update tasks set steps = jsonb_set(steps, '{<N>,done}', 'false') where id = '<id>';

-- Add a step at the end
update tasks set steps = steps || jsonb_build_array(jsonb_build_object('text', '<step>', 'done', false)) where id = '<id>';

-- Rename step N
update tasks set steps = jsonb_set(steps, '{<N>,text}', to_jsonb('<new text>'::text)) where id = '<id>';

-- Remove step N
update tasks set steps = steps - <N> where id = '<id>';

-- Replace all steps
update tasks set steps = '[{"text":"…","done":true},{"text":"…","done":false}]'::jsonb where id = '<id>';
```

## Activity log (append and keep the last 20)

```sql
update tasks set activity = (
  select coalesce(jsonb_agg(e order by i), '[]'::jsonb)
  from jsonb_array_elements(activity || jsonb_build_array(jsonb_build_object('at', now(), 'by', 'claude', 'text', '<what changed and why>')))
       with ordinality a(e, i)
  where i > jsonb_array_length(activity) + 1 - 20)
where id = '<id>';
```

Combine with the change in one statement when convenient, e.g. tick step 1, log it and set the next step:

```sql
update tasks set
  steps = jsonb_set(steps, '{1,done}', 'true'),
  resume_note = '<next step>',
  activity = (select coalesce(jsonb_agg(e order by i), '[]'::jsonb)
              from jsonb_array_elements(activity || jsonb_build_array(jsonb_build_object('at', now(), 'by', 'claude', 'text', '<what was done>')))
                   with ordinality a(e, i)
              where i > jsonb_array_length(activity) + 1 - 20)
where id = '<id>';
```

## Dependencies

```sql
-- 1. Loop check BEFORE linking "<task> waits on <prereq>": must return false.
with recursive up(id) as (
  select unnest(blocked_by) from tasks where id = '<prereq>'
  union select unnest(t.blocked_by) from tasks t join up on t.id = up.id)
select '<prereq>' = '<task>' or exists (select 1 from up where id = '<task>') as would_loop;

-- 2. Link (no duplicates)
update tasks set blocked_by = array(select distinct unnest(blocked_by || array['<prereq>'])) where id = '<task>';

-- Unlink
update tasks set blocked_by = array_remove(blocked_by, '<prereq>') where id = '<task>';

-- What does this task unblock?
select id, title, due from tasks where '<id>' = any(blocked_by) and status <> 'done';

-- Dependents now due before their prerequisite (ask before moving them)
select t.title dependent, t.due, x.title prerequisite, coalesce(x.today_date, x.due) prereq_planned
from tasks t join tasks x on x.id = any(t.blocked_by)
where t.status <> 'done' and x.status <> 'done' and t.due is not null
  and (x.due < (now() at time zone 'Asia/Kolkata')::date or coalesce(x.today_date, x.due) >= t.due);
```

## Deleting a task (always clean links first)

```sql
update tasks set blocked_by = array_remove(blocked_by, '<id>') where '<id>' = any(blocked_by);
delete from tasks where id = '<id>';
```

## Notes

```sql
-- Find an existing note first
select id, kind, title, left(body, 200) body, project_id from notes
where superseded_by is null and (title ilike '%<word>%' or body ilike '%<word>%');

-- Update in place
update notes set body = '<new body>', tags = '{<tags>}' where id = '<id>';

-- Reverse a decision: insert the new one, then point the old one at it
update notes set superseded_by = '<new note id>' where id = '<old note id>';

-- Search everything (null = all projects; a project id searches it and its sub-projects)
select * from brain_search('<words>', null, 15);
```

## Context

```sql
-- Everything about one project (brief, parent/siblings, changes, call segments, decisions, open tasks)
select project_context('zenara-positioning');
select project_context('zenara', now() - interval '30 days');   -- parent + sub-projects, 30-day window

-- What changed everywhere (or under one project) since a time
select whats_new(now() - interval '24 hours');
select whats_new(now() - interval '7 days', 'zenara');
```

## Briefs

```sql
-- Rewrite a brief (keeps the last 10 versions in history)
select set_config('app.actor','chat',true);
insert into project_briefs (project_id, body, updated_from) values ('<project>', '<full markdown brief>', '<source id or null>')
on conflict (project_id) do update set
  history = (select coalesce(jsonb_agg(e order by i), '[]'::jsonb) from jsonb_array_elements(project_briefs.history || jsonb_build_array(jsonb_build_object('at', project_briefs.updated_at, 'body', project_briefs.body, 'from', project_briefs.updated_from))) with ordinality a(e, i) where i > jsonb_array_length(project_briefs.history) + 1 - 10),
  body = excluded.body, updated_from = excluded.updated_from;
```

## Pending inputs

```sql
-- What's pending, and where it's used
select i.id, i.key, i.question, i.owner, i.project_id,
       (select string_agg(u.doc || coalesce(' → ' || u.location, ''), '; ') from input_uses u where u.input_id = i.id and u.status = 'pending') used_in
from inputs i where i.status = 'pending' order by i.project_id, i.key;

-- Register a missing value (key = short slug; reuse an existing key if it's the same thing)
select set_config('app.actor','chat',true);
insert into inputs (key, question, project_id, owner, ask_task_id)
values ('<key>', '<what is missing>', '<project>', '<who will provide it>', '<chase task id or null>')
returning id;

-- Record a place that uses it (one row per document + spot; the doc carries [[NEEDS:<key>]])
insert into input_uses (input_id, doc, location, url, project_id)
values ((select id from inputs where key = '<key>'), '<document>', '<section / slide / line>', '<url or null>', '<project>');

-- It arrived: the trigger creates the "Update N places" task and closes the chase task
select set_config('app.actor','chat',true);
update inputs set status = 'received', answer = '<exact answer + caveats>' where key = '<key>' and status = 'pending';
select id, title, steps from tasks where id = (select u.apply_task_id from input_uses u join inputs i on i.id = u.input_id where i.key = '<key>' limit 1);

-- No longer needed
update inputs set status = 'dropped' where key = '<key>';
```

## Call prep

```sql
-- Which calls, and when next (IST)
select id, name, people, to_char(next_call(id) at time zone 'Asia/Kolkata', 'Dy DD Mon HH12:MI AM') next from call_series where active order by next_call(id);

-- The prep sheet as text (agenda, my update, asks, blocked, open questions, decisions, last call)
select call_prep_md('david-1on1');
-- Same as JSON, for picking out parts
select call_prep('david-1on1');

-- Add a point to raise (kind: update | discuss | ask | decide)
select set_config('app.actor','chat',true);
insert into agenda_items (series_id, kind, text) values ('<series>', 'discuss', '<short point>') returning id;

-- Open agenda for a call
select id, kind, text, recurring from agenda_items where series_id = '<series>' and status = 'open' order by created_at;

-- Covered in the call / no longer needed
update agenda_items set status = 'covered', covered_at = now() where id = '<id>';
update agenda_items set status = 'dropped' where id = '<id>';

-- One-off move of the next call (the 9 AM routine also sets this from the calendar)
update call_series set next_at = '2026-10-21 21:00+05:30' where id = '<series>';
```

## Replace a task

```sql
select set_config('app.actor','chat',true);
-- insert the new task first (returning id), then:
update tasks set superseded_by = '<new id>', status = 'done', done_at = now() where id = '<old id>';
```
