# Meeting agent: dry run (report only, nothing written)

**Call:** Wispr "Bambi Training and Onboarding", `fa9a32e6-f06d-4f8d-b4a2-4b78ca595ffb`
**When:** 14 Oct 00:24–00:36 IST (13 Oct 18:54–19:06 UTC), 12 minutes
**Run:** 14 Oct 2026, report-only

---

## 1. Pick up and dedupe

| Check | Result |
| --- | --- |
| Finalized, has transcript | Yes |
| `wispr:fa9a32e6…` already in `processing_log` or `sources` | No |
| Cross-tool dedupe with the brief's rule (±20 min of start) | **No match.** It would have created a duplicate. |
| What actually happened | This recording is the **last ~12 minutes of "Weekly commercial sync, 13 Oct 2026"** (`s-7b5a82bf…`, filed by hand, `occurred_at` 18:00 UTC). That source's text already covers Bambi's 19–23 Oct training, Pratik's exit and the knowledge source, Assess + Flow as one implementation process, Kara's January call, Chelsea Weeks and the claims doc delay. The recorder simply started late. |

**Would write:**

```sql
update sources set
  external_id = 'wispr:fa9a32e6-f06d-4f8d-b4a2-4b78ca595ffb',
  url = 'https://notes.wisprflow.ai/shared/Pcv7sn3SilbyqN2pQ3gIbBbwKgymr7JK0LMZ-_xPjis',   -- was "Project doc: …"; the doc path is already in content
  related_projects = '{zenara-launches,zenara-ops,zenara-content}'
where id = 's-7b5a82bf-5678-47cd-8be1-8430b8783701';
```

No new source row. `project_id` stays `zenara`, since it's a cross-team sync.

## 2. Routing

- **Primary:** `zenara`, the existing source's project. On a fresh call the agent would also pick `zenara`. Matched rules: Pratik, David, Ravi, Bambi, Tyler, Shilpa, Deepak, Assess, NeuroCoach, Intuitive Psychiatry, Kara, Chelsea Weeks, HLTH, Abhijeet.
- **Related:**
  - `zenara-launches`: NeuroCoach/Assess implementation, Chelsea Weeks, Assess→Flow onboarding
  - `zenara-ops`: Pratik's handover, hiring via Abhijeet
  - `zenara-content`: Kara, HLTH recap

## 3. Notes

Each candidate was checked with `brain_search` and against the notes already linked to `s-7b5a82bf`.

| Candidate from transcript | Existing note | Action |
| --- | --- | --- |
| Pratik leaves in ~3 weeks; knowledge source/agent; Ravi is backup; Deepak tapped out | fact "Pratik is leaving Zenara within about a month (13 Oct)" | **None**, already covered |
| One implementation process for Assess and Flow; ground an LLM on NeuroCoach transcripts | idea "Ravi: one implementation process…" | **None** |
| Bambi trained 19–25 Oct by Pratik + Shilpa, in parallel with feedback; asset issues may delay | fact "NeuroCoach implementation (13 Oct)…" | **Update** (small): add "Training week 19–25 Oct runs alongside feedback fixes; asset issues may delay it. Past recordings cover full Assess Pro with validation call (Pratik to share via group with Shilpa/Bambi)." |
| Chelsea Weeks: no intake form after 2 follow-ups; IP sensitivity; ask for a sample report | person "Dr. Chelsea Weeks…" (already says this) | **None** |
| Kara January Zoom call, HLTH recap angle | person "Kara…" | **None** |
| Use NeuroCoach + Intuitive Psychiatry to build the implementation model | in the sync source's decisions, **no note yet** | **Insert** decision (`zenara-launches`): "13 Oct – Build the implementation model (training, processes) on NeuroCoach and Intuitive Psychiatry, refining Bambi's clinically based process with real customers (David)." |

## 4. Tasks

| Task | Action |
| --- | --- |
| `t-9979ba68` "Chase Pratik on claims…" (waiting on Pratik, follow-up 14 Oct) | **Update**: Pratik said "give me a couple more days" for the doc. Set `follow_up_on = 2026-10-16`; activity: "Pratik (13 Oct sync): claims doc needs a couple more days; follow-up moved to 16 Oct." No `carry_count` change: the due date isn't moved and it isn't overdue. *Assumption:* "that document" is the claims doc, as the sync's own notes say. The other waiting-on-Pratik task (Slice 1 two-pager) is left alone. |
| `t-43d94d97` "Join Bambi's NeuroCoach / Assess workflow training (19–23 Oct)" | **Update**: due 23 → 25 Oct (Pratik said 19th–25th). Activity: "Training week is 19–25 Oct (Pratik)." Not overdue, so no `carry_count`. |
| `t-4cc83939` (suggested) "Capture Pratik's product + claims knowledge before he leaves" | **Update** steps (it has none): `[{"text":"Get Pratik's past training recordings (group with Shilpa/Bambi)","done":false},{"text":"Claims doc","done":false},{"text":"Slice 1 facts + live vs roadmap","done":false},{"text":"Demo walkthrough","done":false},{"text":"Draft implementation guide from NeuroCoach transcripts (Commercial AI)","done":false}]` |
| New: Kara January call | **Suggested** (`zenara-content`, low, due 2026-12-15): "Prep HLTH recap + new-year pitch for Kara's January Zoom call". Notes: Tyler: "keep that in the back of your mind… a recap from HLTH and new opportunities going into the new year." `source='scheduled:meeting'`, `source_chat='Call: Weekly commercial sync (13 Oct)'`. |
| Chelsea follow-up | Owned by David, not Vimal. **No task.** |
| Completions | **None**. Nothing in the call finishes an open task. |
| Dependencies | **None new.** "Capture Pratik's knowledge" relates to the Slice 1 plan and claims but doesn't block them. |

## 5. Briefs

None exist yet, so each touched project gets a first brief built from its notes, open tasks, recent sources and this call. Two are shown in full; the other two would follow the same structure.

### `zenara-launches`

**Status:** NeuroCoach (Assess) goes live ~26 Oct; Flow reaches Intuitive Psychiatry ~23 Nov (may slip to 30 Nov). Pratik leaving before ~5 Nov is the main risk.

**Where it stands:**
- Assess Instantly campaign (13 Oct): ~400 sent, ~202 opens, 4 clicks, 1 booking (Dr. Pennington, 15 Oct), now 50/day.
- NeuroCoach: demo 16 Oct, implementation ~26 Oct on a simplified Assess workflow (no validation call). Pratik and Shilpa train Bambi 19–25 Oct; David, Tyler and Vimal join.
- Flow at Intuitive Psychiatry ~23 Nov (maybe 30 Nov). V2 care-plan backend mid-Dec. MindPath demo for now; refined demo before ~5 Nov.
- Bookings via Bambi's link send no conversion event. Call with Deepak is next.
- Dr. Chelsea Weeks is keen on Assess but still hasn't sent her intake form after 2 follow-ups.

**Decisions:**
- 13 Oct – Build the implementation model on NeuroCoach + Intuitive Psychiatry (refine Bambi's process with real customers).
- 13 Oct – One implementation process for Assess and Flow; Assess Pro merges into Flow (Ravi's direction).
- 13 Oct – Conversion tracking: Deepak first, else marketing-owned; best engine, not cheapest (David).
- 13 Oct – Cold outreach gets its own M365 account.
- 13 Oct – Keep the current HTML campaign running.

**Open questions:**
- Who covers implementation and technical sales after Pratik? (Ravi / David)
- Intake form or a sample report from Chelsea? (David)
- Revised dates for COM-434 / COM-490 / COM-413 (David)

**Owners:**
- Bambi: customer onboarding and implementation
- Pratik: training recordings and Bambi walkthrough, until ~5 Nov
- David: Chelsea
- Vimal: Flow one-pager, Slice 1 plan, campaign brief
- Sam: Assess campaign (away until ~21 Oct)

**Depends on / feeds into:**
- Waits on `zenara-positioning`: messaging house + Pratik's claims before the Slice 1 plan and COM-413 launch.
- Waits on `zenara-ops`: Pratik knowledge capture and hiring to cover implementation.
- Feeds `zenara-content`: Kara's January call (HLTH recap).

**Risks:**
- Pratik's exit (claims, Slice 1, implementation).
- The simplified workflow drops the validation call, which weakens the AI-trust story.
- Flow lands after HLTH.
- Manual campaign ops while Sam is away.

### `zenara` (parent: an overview pointing at the sub-briefs)

**Status:** Month 1 of 3 pilots by end of Dec. Flow slips to ~23 Nov at Intuitive Psychiatry; Pratik's exit is the biggest cross-team risk.

**Where it stands:**
- Goal: 3 pilot customers by end of Dec 2026 (David).
- NeuroCoach (Assess) live ~26 Oct; Flow at Intuitive Psychiatry ~23 Nov; HLTH 15–18 Nov (Ravi attending).
- Positioning: Flow = "psychiatric practice optimization system"; messaging house v2.1 approved 12 Oct.
- Pratik leaves ~5 Nov (effectively ~3 weeks). Ravi is backup; knowledge capture is underway.
- Weekly commercial sync, Tue 11:00 PT (23:30 IST); Vimal coordinates.

**Decisions:**
- 13 Oct – Assess and Flow share one implementation process (Ravi).
- 13 Oct – Flow descriptor adopted (zenara-positioning).
- 06 Oct – ICP: Segments A/B/C, A+ = Segment A on Charm, first wave 3–5 pilots.
- 05 Oct – Assess is Flow's first module (80/20).
- 05 Oct – Marketing split: Vimal (ICP, positioning, launch, website, TL), Sam (campaigns, tools, analytics).

**Open questions:**
- Replacing Pratik's implementation and claims roles. (Ravi / David)

**Owners:**
- David: commercial and GTM
- Ravi: product and clinical voice
- Vimal: marketing lead
- Sam: campaigns
- Tyler: sales (~10 hrs/week)
- Bambi: clinical concierge and implementation

**Depends on / feeds into:**
- `zenara-positioning` → `zenara-launches` (messaging + claims before launch).
- `zenara-ops` → `zenara-launches` (Pratik handover).
- `zenara-content` runs largely in parallel (Healio, HLTH, PR).

**Risks:**
- Pratik's exit.
- Flow slipping past 23 Nov.
- Booking conversion still untracked.

### `zenara-ops` and `zenara-content`

These would get the same treatment. Their status lines:

- `zenara-ops`: "Pratik handover is the priority. Knowledge source + hiring (Abhijeet, 5–6 roles) before ~5 Nov."
- `zenara-content`: "Healio series and HLTH (15–18 Nov) on track; US PR agency shortlist pending; Kara call set for January."

## 6. Log and push

```
processing_log: wispr:fa9a32e6… · filed · source s-7b5a82bf (matched existing "Weekly commercial sync, 13 Oct")
summary: Matched to existing source; linked Wispr id + link. 1 note updated, 1 decision added; 2 tasks updated (claims follow-up → 16 Oct; training → 25 Oct); steps added to Pratik handover; 1 suggestion (Kara January call); 4 first briefs written.
```

Push:

> 1 call filed. Bambi training (part of weekly commercial sync) → zenara (+ launches, ops, content): matched existing source, 1 decision, 2 task updates, 1 suggestion, 4 briefs created.

---

## Fixes this dry run found (go into the prompt before the real run)

1. **Dedupe window is too narrow.** Recorders start late or stop early, and manual filings use rounded times. Match an existing source when the Wispr call **starts between 30 min before and 2 h after** the source's `occurred_at` **and** shares at least two distinctive names or topics. Exact title similarity isn't required.
2. **Speaker labels are unreliable.** Wispr labelled Vimal's own line ("I was going to follow up with you tomorrow") as Ravi, and Bambi is "Speaker 3". Work out who's speaking from context: "You're on mute, Vimal", names used in replies.
3. **"Only what's new" check.** When attaching to an existing source, compare against that source's `content`/`summary`, its linked notes and tasks whose `source_chat` names that call before writing anything.
4. **The `url` rule.** If the matched source's `url` isn't an http link, replace it with the Wispr `share_link` (the doc path is already in `content`).
5. **Dates in titles.** Use the call's local business date when deduping onto an existing source; otherwise use the IST date of the start time.
