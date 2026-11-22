# Tharavad: Library v2 and the Talent bench (22 Nov 2026)

Why: the library had 16 cards and none had ever been used, and every "review" was one agent checking itself on the same model with the same context. This adds a hunt for sources, cheap transcripts, cards that reach agents on their own, and outside personas who disagree on purpose.

## Library (Librarian, weekly via the runner; playbook `playbook-librarian`)
- **Demand first:** hunt questions come from kill questions, decisions that proved wrong, low-confidence panels, and requests (`library_sources` rows from agents or Vimal; a url starting `q:` is a search request).
- **Reading queue:** `library_sources` (url, kind, question, score, status queued/reading/carded/rejected/failed, transcript_via, minutes, cost_credits, digest). Full text is not stored; it can be fetched again for free.
- **Cheap transcripts:** `tools/library/fetch.py <url>`. The route is chosen per source:
  - **Podcast:** the feed's own `<podcast:transcript>` first. If there is none, Whisper `base.en` runs on the episode audio on the run's own machine. That's about 20x real time on 4 CPUs, and free.
  - **YouTube:** yt-dlp subtitles. Cloud machines often get "confirm you're not a bot", so it exits with code 3 and the run uses vidIQ instead (5 credits).
  - **Articles and PDFs:** a plain download, then strip to text.
  - **Fallbacks when a free route fails:** Exa web fetch for articles, and ElevenLabs Scribe for podcasts with no transcript and no audio file.
  - **Caps a month:** 30 vidIQ videos and 3 hours of Scribe.
- **Finding:** `tools/library/find.py` searches Apple Podcasts and YouTube for free. Open Library, OpenAlex and arXiv refused cloud machines on 22 Nov, so books and studies go through Exa. Books are read through the author's interviews, talks and essays plus one review, never the book file.
- **Cards:** `library_cards` now has `source_id`, `quote`, `at_ts`, `conflicts_with`, `right_n`, `wrong_n` and `weight`. A new card is checked against `library_search()` first: a duplicate gets merged, and a contradiction is linked both ways.
- **How agents use them:**
  - `context_pack()` now carries the top 6 cards per agent from `cards_for(agent)`. It matches on `agents.library_domains` and the agent's unit, weighting case cards and high-weight cards higher.
  - Agents cite the cards they relied on in `agent_decisions.cards_used`.
  - A trigger counts each citation in `uses`. When a decision is marked `correct`, its cards' right or wrong count goes up and their weight moves.
  - Every agent has a weekly reading hour: take one new card and either set up a test or say why not (`tharavad-sop-0-common`).

## Panels and the bench (Talent office; playbooks `playbook-panel`, `playbook-panel-rules`, `playbook-talent`)
- **When an agent must call one** (`playbook-panel-rules`, printed in every context pack):
  - **Debate:** a call Vimal must approve or can veto, start/scale/shut, more than ₹5,000 a month, or two agents (or a card and our numbers) disagreeing.
  - **Consultant:** the key number missed its bar 3 times, or before a new venture.
  - **Pre-mortem:** before a launch.
  - **Budget:** at most 2 panels a week.
- **How it runs:**
  - A one-page brief that every member sees, with no history.
  - Members are cast from `bench` by domain and track record: 1 for, 2 against, with different archetypes.
  - Each writes a position independently with its own cards, then one rebuttal round.
  - A fresh judge, on a different model where possible, decides, weighting our numbers above our case cards above books above opinion.
  - It's recorded in `panels`, and the decision in `agent_decisions` with `panel_id`.
- **Scoring:** when the decision is checked, a trigger scores each persona: on the winning side and the call proved right counts as right, and so on. Talent retires personas under 40% after 5 scored calls, and adds a contrarian when debates keep agreeing.
- **Starting bench (9):** etsy-seller, kdp-marketer, yt-packager, bootstrapped-founder, skeptic-cfo, customer-voice, contrarian-growth, outbound-operator, agent-skeptic. Their `source_ids` fill in as the Librarian reads.

## First uses (22 Nov)
- **Idea order 1** (a Gary Vee clip on Substack): read through vidIQ, which made cards #17 and #18 (low confidence); the order was closed with a verdict.
- **Panel #3, "Cut Instantly to one plan?"**
  - Positions: the CFO argued for cutting; the outbound operator and the contrarian argued against.
  - In the rebuttal round all three came to the same position: check credit usage first.
  - The judge's verdict: if no credits were used, drop the $47 plan, and keep the $97 plan against a bar checked on 22 Dec.
  - The decision is logged as #2.
