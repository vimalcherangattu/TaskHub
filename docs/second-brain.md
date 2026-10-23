# Ambalam as a second brain

What makes a second brain good, how Ambalam measures up today (21 Oct 2026), and what to build next.

## The short answer on tasks vs. brain

Keep them as **two spaces that share one front door**:

- **Do**: Today, Week, Waiting, Attention, Projects. Things with a next action and a date.
- **Know**: Notes, People, Mind map, calls, briefs. Things you keep so you can find or reuse them later.
- **Shared**: Capture (one box for both) and Search (one box over both). A task can link to the notes behind it, and a note can spawn a task. But neither space's screens fill up with the other's items.

This avoids the most common failure, where reference material clutters the to-do list. It also means nothing has to be merged later: the link between the spaces is capture, search and cross-links, not a shared list. This is how the app is now set up. Notes has its own view and inbox. Tasks stay where they were.

## What makes a second brain great

| # | Quality | What it means | Ambalam today |
|---|---|---|---|
| 1 | **Capture with no friction** | Anything, from anywhere, in under 5 seconds. If capture is slow, things stay in your head or in WhatsApp. | **Good.** One capture box (C key, the Capture button on phone, an Android share link, or a `?url=` link for a bookmarklet). Calls are filed automatically. *Missing:* voice, forwarding an email in, WhatsApp. |
| 2 | **One inbox, emptied regularly** | Capture first, sort later, but *do* sort. | **Started.** The Notes inbox holds anything saved without a project. *Missing:* a weekly nudge to empty it, and AI that files it for you. |
| 3 | **Organised by how actionable it is** | PARA: Projects (have a finish line), Areas (ongoing), Resources (topics), Archive (done). | **Partly.** There are projects and areas (Career, Products, Life). *Missing:* **Resources/Topics** (e.g. "Pricing", "Parenting", "Storytelling"), which cut across projects, and an Archive for finished projects. |
| 4 | **Finding things fast** | Search that returns the right thing even when you don't remember the words. | **Good.** One search over tasks, notes, calls and briefs, plus full call transcripts. *Missing:* meaning-based search (finding "rate card" when you type "pricing sheet"), and **Ask Ambalam**: a question box answered from your own notes, with sources. |
| 5 | **Connections** | Notes link to each other, to people, to tasks, to calls. Value grows with links, not with volume. | **Partly.** Notes link to projects and to the calls they came from, and the mind map shows the tree. *Missing:* note-to-note links, "related" suggestions, and backlinks ("what points here?"). |
| 6 | **People at the centre** | For each person: who they are, last contact, what you owe them, what they owe you, every call and decision they're in. | **Partly.** Person notes, `waiting_on`, call attendees and call prep all exist, but they're scattered. *Missing:* **a page for each person** that pulls it all together. |
| 7 | **Resurfacing** | Old ideas come back at the right moment, so you don't have to remember to look. | **Missing.** For example: on Today, "From your notes" shows notes related to today's tasks, plus one old idea a day. |
| 8 | **Distillation** | Raw material is condensed into what matters (progressive summarisation). | **Good for projects.** Briefs rewrite themselves after every call. *Missing:* the same for Topics and People. |
| 9 | **Low upkeep** | The system files, tags and links on its own; you only review. | **Good for calls** (the hourly agent). *Missing:* the same for your manual captures (suggest a project, kind and tags; split out tasks). |
| 10 | **Trust and durability** | Never lose a capture; your data stays yours. | **Partly.** Data is in your own Supabase, with undo and redo. *Missing:* captures queued while offline, a one-click export (Markdown/JSON), and a scheduled backup. |
| 11 | **Speed** | It opens instantly and responds instantly, or you stop using it. | **Better as of today.** It opens from a local copy, renders 2–2.5× faster, and clicks show in about 10 ms. |

## What to build next, in order

1. **AI filing for the inbox** (fixes 2 and 9). The hourly agent reads unfiled captures and assigns project, kind and tags, splits out any task, and links each one to related notes. You only review. This is the biggest win for the least effort, because the agent already does this for calls.
2. **People pages** (6). One page per person with their note, open loops both ways, recent calls, decisions and the next call. It reuses data that already exists.
3. **Resurfacing on Today** (7). A small "From your notes" card in the rail: notes linked to today's tasks, plus one older idea or decision.
4. **Topics** (3 and 8). Reference areas that aren't projects, each with an auto-written brief like a project's. *Built 23 Oct.*
5. **Ask Ambalam** (4). A question box that answers from your notes, calls and briefs, and cites them.
6. **More ways in** (1): forward an email to an address, voice notes, and WhatsApp or Telegram.
7. **Safety** (10): an offline capture queue, export and a weekly backup.

## Built on 21 Oct 2026

- **Capture**: one box for a task, idea, note, decision, link or person.
  - Press C, use Capture in the sidebar, or tap Capture on phone. Ctrl+Enter saves.
  - A link is detected automatically; anything saved without a project goes to the Notes inbox.
  - Sharing a page from another Android app works once the app is installed; any page can be sent in by opening `https://task-hub-one-delta.vercel.app/?url=<link>&title=<title>`.
- **Search**: Ctrl/⌘+K or `/`.
  - Covers tasks, notes, calls and project briefs on the device, plus full call transcripts through `brain_search`.
  - Arrow keys and Enter open a task in the quick look and a note in its editor.
- **Notes view**: filters by kind, an inbox of unfiled items at the top, then grouped by project. It replaces Map in the phone tab bar; the mind map is linked from the Notes page.
- **Speed**: the screen comes from a local copy at open, then refreshes. Tasks draw before the slower data arrives, d3 loads only when needed, and date formatting is cached.

## Built on 22 Oct 2026 (from the "second brain without RAG" video)

The video's points that apply here, and what changed:

- **Recency weighting.** Search treats an old price and a new one the same unless it knows their dates. Both searches now multiply the word-match score by `0.5 + 0.5·e^(−age/90 days)`: ×1.0 today, ×0.68 at 3 months, ×0.51 at a year, never below ×0.5. Old items still show up; they just lose ties to newer ones.
  - `brain_search` (server; used by the app, the hourly agent and the skill) does this, and also normalises `ts_rank` by document length (flag 1), which is close to how BM25 treats long documents. Its signature is unchanged.
  - The on-device search (Ctrl/⌘+K) now ranks like a light BM25: rarer words count more than common ones, a title hit counts 3× a body hit, and recency is applied as above. Note results show their date.
- **Plain-text search, not embeddings.** Ambalam already uses Postgres full-text search, which the video argues is enough. "Meaning-based search" (item 4 above) drops in priority; better summaries help more.
- **Keep the feeds fresh.** A second brain fails silently when a connector stops. The Notes page shows when each feed in `sync_state` last had a successful read (calls = `wispr`, Gmail, Linear). A feed goes red after 26 hours, because the hourly agent only runs 18:05–23:05 IST. The banner shows the agent's reason from `sync_state.note`. The agent records this through the `meeting-agent-8-run-record` addendum (live in `agent_config`, mirrored in `agents/meeting-agent.md`).
  - **Found on 23 Oct:** the hourly agent's scheduled task had only the Supabase and Wispr Flow connectors attached, so it skipped Gmail, Linear and session sync on every run. It also fell back to the general Supabase connector, which can stall on writes. The fix is to attach Gmail, Linear, Supabase_Connector and Claude_Code_Remote to that scheduled task.
- **Summaries and "atoms" from a cheap model.** Calls already get this (segments, notes, briefs). Manual captures don't yet: that is item 1 above (AI filing for the inbox), which should also write a one-line summary and the question you'd type to find each capture.

## Built on 23 Oct 2026

- **AI filing for the inbox (#1).** The hourly agent now files Notes inbox captures: project, kind, 2–4 tags, a one-line "Filed: … Find it by: …" line, and any task split out as a suggestion. Duplicates are merged with `superseded_by`; anything it can't place stays in the inbox. Each capture is logged once as `processing_log` `inbox:<note id>`. Live as `agent_config` row `meeting-agent-9-inbox-filing`, mirrored in `agents/meeting-agent.md`.
- **People pages (#2).** Notes → People (and the sidebar) lists every person note, with open loops or a coming call first. A person page shows their note, the next call, what they owe you (waiting tasks and inputs), open tasks that mention them, agenda points for their calls, recent calls they attended and decisions that name them. Matching is by first name, so a common first name can pull in extra items.
- **Resurfacing on Today (#3).** A "From your notes" card in the rail shows up to 3 notes that share two or more words with today's or started tasks in the same workspace, plus one idea or decision over 3 weeks old (a different one each day).
- **Work with Claude.** Each open task's quick look opens a new claude.ai chat with the task's context and asks Claude to write progress back through the task-hub skill.

- **Topics (#4), late 23 Oct.** A note tag becomes a topic once 3 current notes in 2 different top-level projects use it (meta tags like `handoff` and `decision` are skipped). Notes → Topics (and the sidebar) lists them; a topic page shows its brief, decisions, open tasks and calls that mention it, and its other notes. Briefs live in `topic_briefs`; the hourly agent rewrites up to 3 a run, picked by `topics_due()` (no brief yet, or a note newer than the brief). Live as `agent_config` row `meeting-agent-9b-topic-briefs`, mirrored in `agents/meeting-agent.md`. 13 topics qualified on day one (Flow, Pricing, GTM, Instantly…).
- **High impact and merging** (Do side, same evening): see `STATUS.md`. The 9 AM routine now stars up to 3 tasks (or sets one theme) when Vimal hasn't picked any for the day.

### Bookmarklet (desktop)

Make a bookmark with this as the address. Clicking it on any page sends that page to Capture:

```
javascript:location.href='https://task-hub-one-delta.vercel.app/?title='+encodeURIComponent(document.title)+'&url='+encodeURIComponent(location.href)
```
