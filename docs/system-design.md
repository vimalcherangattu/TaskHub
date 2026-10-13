# Task Hub system design (calls → context)

One Supabase project (`Task-Hub`) is the single source of truth. Every writer uses the same tables: the app, chats (via the `task-hub` skill), the 9 AM routine and the hourly meeting agent.

```
Wispr Flow ──hourly──▶ meeting agent ──▶ sources (1 row per call, full transcript)
                                       ├▶ source_segments (1 row per call × project it touched)
                                       ├▶ notes / tasks (decisions, facts, suggested tasks, done, moved, linked, replaced)
                                       └▶ project_briefs (living "where it stands", last 10 versions kept)
every write ──triggers──▶ changes (automatic feed: who changed what, when, from which call)

chat ──▶ project_context('<project>')  → brief + parent/siblings + changes + call segments + decisions + open tasks
chat ──▶ whats_new(since, project)      → everything that changed, grouped by project
app  ──realtime──▶ all of the above, live
```

## Why no table per project
Projects and sub-projects share the same tables, keyed by `project_id`, with `projects.parent_id` giving the hierarchy. This keeps dependencies (`blocked_by`), search (`brain_search`) and cross-project views working. Isolation comes from **segments**: a call touching five sub-projects is stored once and summarised five times, once per sub-project.

## Routing
1. `projects.scope` describes what belongs in each project and what doesn't. This is the main signal.
2. `routing_rules` hold name and keyword hints. They're editable in the app ("Always route here…").
3. The agent splits a transcript into topics, picks a top-level project for each, then the most specific sub-project. The parent is used only for cross-team topics.
4. If it can't place a call, the call goes into "Calls to file" (Needs attention) for a one-tap fix.

## Freshness
- The meeting agent runs every hour: `trig_01VKWQV67JJLvzwVZB7HjokL`. Its prompt is a bootstrap that loads `agent_config.meeting-agent`.
- It backfills segments and briefs for calls filed by hand (`processing_log` rows `segment:<source>`).
- `processing_log` makes runs idempotent; `external_id` is unique, so the same call is never filed twice.

## Files
- `agents/meeting-agent.md`: the agent's instructions (live copy in `agent_config`).
- `skills/task-hub/`: the chat skill. `reference/meetings.md` = the same call rules; `reference/queries.md` = tested SQL.
