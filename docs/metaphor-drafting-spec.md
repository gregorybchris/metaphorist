# Drafting new metaphors from external sources

A repeatable process for turning metaphor candidates from an external dataset (the
Master Metaphor List, a future corpus, anything in `data/external/`) into entries that
match `dataset/metaphors.yaml` and `dataset/frames.yaml`'s existing schema and
conventions. Validated on a pilot batch of 8 candidates from
`data/external/master-metaphor-list/` — see `planning/pilot-mml-additions.yaml` and
`planning/pilot-mml-review-notes.md` for the worked example this spec was extracted from.

## Why this process, not just "write the entries"

The pilot's finding: the mechanical parts (naming conventions, does every mapping role
actually exist in its frame) are fully automatable and cheap to check. The parts that
need a human in the loop are judgment calls — does this mapping actually preserve
structure, does an existing frame really fit or just share a keyword, is this shared
frame worth extending. The process below is deliberately split the same way: do the
mechanical work and verify it yourself; produce an explicit, itemized list of the
judgment calls for a human to review rather than resolving them silently.

## Input

One candidate per metaphor, minimally: a name (`X IS Y` form), some example sentences,
and a source/target domain description if the source material has one. Notes,
alternate names, and bibliography are useful context but not required.

## Process

### 1. Normalize the name

`X IS Y` → `X_IS_Y` (SCREAMING_SNAKE_CASE, matching `tests/test_formats.py`'s
convention). Strip punctuation. Check it doesn't already exist in
`dataset/metaphors.yaml` under a different surface form — a fuzzy/token-overlap pass
against existing names catches near-duplicates that an exact-string check won't (this is
what the earlier MML coverage report did across the whole candidate set; re-run that
comparison rather than eyeballing 800+ names by hand).

### 2. Resolve source_frame and target_frame

For each of source and target domain, in order:

1. **Exact or near-exact name match** against `dataset/frames.yaml`. Prefer the
   dataset's own naming (kebab-case, usually the bare noun — `body`, `problem`,
   `animal` — not a compound).
2. **If no exact match, check for a frame that's semantically the right fit** even
   under a different name (e.g. the target for "compliance" might already be modeled
   under a different frame entirely). Don't force a shallow name-string match onto a
   frame that means something different once you read its roles/lexical_units — check
   the frame's actual role list, not just its name.
3. **If nothing fits, plan to create a new frame** (step 4).

Do this for both frames before drafting the mapping — you need to know both role sets to
know whether a real mapping is even possible.

### 3. Decide: reuse as-is, extend, or create

Three distinct situations, each handled differently:

| Situation | Action |
|---|---|
| Matching frame exists with roles rich enough for a real mapping | Reuse it as-is, draft the mapping (step 5). |
| Matching frame exists but is role-thin/empty, **and it's used by other existing metaphors** | This is a shared-frame edit, not a single-entry decision. Draft the proposed new roles anyway — don't just note the gap in prose — but label it explicitly as a separate "frame extension proposal" for review, and don't fold it silently into the metaphor entry. Search `dataset/metaphors.yaml` for how many other entries use this frame before proposing new roles, so the reviewer knows the blast radius. |
| No matching frame exists at all | Create it fresh (step 4) — this is comparatively low-risk since nothing else depends on it yet. |

The failure mode from the pilot to avoid: treating "existing frame has no roles" as a
stop condition and silently going mapping-less, without ever drafting what the extension
would look like. Always produce the candidate roles; let the reviewer decide whether to
apply them.

### 4. Creating a new frame

- Name it kebab-case, matching an existing frame's granularity (usually a bare noun or
  short compound, not a full sentence).
- **Don't invent role-naming conventions from scratch.** Find the nearest existing
  analogous frame and mirror its idiom. Emotion frames in this dataset follow a
  `<x>_feeler` / `degree_of_<x>` / `target_of_<x>` pattern (see `affection`) — a new
  emotion frame should use the same shape, not a one-off naming scheme.
  Entity-plus-intensity frames (`cold`, `heat`) use a bare `entity` role plus a
  `<x>_level` role. Check 2-3 existing frames in the same rough category before naming
  anything.
- A frame can have a role with the same name as the frame itself (`anger` frame has an
  `anger` role) when the emotion/entity itself needs to be a mappable target, not just
  its intensity or experiencer.
- Add plausible `lexical_units` (the words that evoke the frame) even though nothing
  requires it — it's cheap and matches the existing frames' convention.

### 5. Draft the mapping

Every `source_role`/`target_role` in a mapping must literally exist in the
corresponding frame's role list — this is mechanically checkable (step 9) so get it
right, but getting it to *validate* is not the same as getting it *right*. The actual
judgment is whether the correspondence preserves structure (the invariance principle):
does the source role's relational position in its frame actually match the target
role's position in its frame, not just "these two words seem related." Not every target
role needs a source counterpart, and not every source role needs to be used — partial
mappings are normal and match existing dataset entries.

### 6. Curate examples

Prefer the source material's own example sentences over inventing new ones — they're
more likely to read as attested rather than synthetic. But don't include all of them
uncritically:
- If the source material itself flags an example as ambiguous or possibly belonging to
  a different metaphor, drop it or note the disagreement rather than including it
  silently.
- Prefer sentences that clearly instantiate *this* metaphor over ones that are
  generically on-topic.

### 7. Classify `type`

Use the existing taxonomy (see `README.md` § Type): `Primary` (basic, experientially
grounded — usually single bodily-experience source), `Composed/complex` (built from
combining primary metaphors — usually has a `related` link to the primaries it
combines), `Entailed` (follows automatically from another named metaphor). When in
doubt, find the closest existing sibling (same source or target frame) and match its
type rather than deciding from the abstract definition alone.

### 8. Assign families

Reuse an existing family (`dataset/metaphor-families.yaml`) only on genuine semantic
fit — not because a keyword overlaps. This dataset's family taxonomy skews
political/economic/social (its origin domain), so a psychologically-basic metaphor
(disgust, intoxication, lust) may legitimately have no good existing family. Leave
`families` off rather than force a wrong tag, and flag the gap — don't invent a new
family name unilaterally; that's a taxonomy decision, not a per-entry one.

### 9. Assign relations

Search `dataset/metaphors.yaml` for existing metaphors sharing the same source or
target frame, a subcase/hierarchy relationship, or serving as a building block this
metaphor draws on — these are candidates for this metaphor's `related` list. **Only
ever link to a metaphor that actually exists** — either already in
`dataset/metaphors.yaml` or elsewhere in the same batch. If the source material
references a sibling metaphor that isn't actually in this dataset, don't invent the
link; note it as a gap instead.

### 10. Validate mechanically before showing anyone

Write and run a script against the draft batch that checks, at minimum:

- Metaphor names are `SCREAMING_SNAKE_CASE`; frame names are `kebab-case`.
- No name collides with an existing entry (or another entry in the same batch).
- Every `source_frame`/`target_frame` referenced actually exists (in the existing
  dataset or the batch's own new frames).
- Every `mappings[].source_role` / `target_role` exists in the corresponding frame's
  role list — this is the same check `tests/test_completeness.py::
  test_mapping_roles_present_in_frame_roles` runs on the real dataset, just run
  pre-merge instead of post-merge.
- Every `related` target exists somewhere (existing dataset or batch).

This is cheap (a few dozen lines of Python against the YAML, see the pilot's inline
script) and catches real bugs — the pilot's own `HOPE_IS_A_CHILD` draft referenced a
role that didn't exist in the frame it had just proposed, until this check caught it.

### 11. Write the judgment-call log

For each entry, one short paragraph: what you decided, what alternative you rejected
and why, and anything you're genuinely unsure about. This is the actual deliverable —
the YAML is easy to regenerate, the reasoning is what a reviewer needs to grade quickly
without re-deriving your research. Explicitly call out:
- Any shared-frame extension proposed (not just new frames).
- Any close-but-not-identical existing entry you considered and decided this is
  distinct from.
- Any dropped example, unresolved type/family classification, or relation you couldn't
  verify.

## Output format

Two files per batch, not merged into `dataset/` until reviewed:

- `<batch>-additions.yaml` — `new_frames:` list and `metaphors:` list, same field
  shapes as `dataset/frames.yaml` / `dataset/metaphors.yaml`.
- `<batch>-review-notes.md` — per-entry reasoning per step 11, plus a short summary of
  what fraction needed a flag vs. went cleanly, so the reviewer can calibrate how much
  scrutiny the batch needs before spot-checking individual entries.

## Batch size and review cadence

Start small (the pilot used 8) and have the domain expert grade the full batch against
their own rubric before scaling up. The more informative question as batch size grows
isn't "does Claude draft plausible entries" — that part held up — it's whether the
flag rate (shared-frame extensions, dropped examples, unresolved family/type calls)
stays proportionate at 20-30 entries, or whether judgment calls start getting resolved
silently as volume increases. Re-run the mechanical validator (step 10) on every batch
regardless of size — it's nearly free and catches a real class of error every time.
