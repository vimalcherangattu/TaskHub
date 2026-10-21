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
4. **Topics** (3 and 8). Reference areas that aren't projects, each with an auto-written brief like a project's.
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

### Bookmarklet (desktop)

Make a bookmark with this as the address. Clicking it on any page sends that page to Capture:

```
javascript:location.href='https://task-hub-one-delta.vercel.app/?title='+encodeURIComponent(document.title)+'&url='+encodeURIComponent(location.href)
```
