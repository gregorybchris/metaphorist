# Backfilling mappings for existing metaphors

A repeatable process for adding the missing role-by-role `mappings` to metaphors that
already exist in `dataset/metaphors.yaml` but have none. Companion to
`docs/metaphor-drafting-spec.md` (which drafts wholly **new** metaphors from an external
source into the dataset) — this process instead edits **existing** entries in place, using
`scripts/mapping_gaps/*` instead of `scripts/mml/*`. Read that spec first for the parts this
one reuses by reference rather than restating: step 4 (creating a new frame, naming idiom)
and step 5 (the invariance principle a mapping has to satisfy).

## Scope

Only add `mappings`, and `source_frame`/`target_frame`/frame `roles` when a mapping actually
needs them. Don't touch a metaphor's `type`, `families`, `related`, or `examples` even where
they look thin or missing — out of scope for this pass, so the diff stays reviewable as
"mappings added," not a mix of unrelated cleanup.

## Input

One batch: `planning/mapping-batches/<NN>-context.yaml` (built by
`scripts/mapping_gaps/context_pack.py <NN>` from `planning/mapping-batches/manifest.yaml`).
For each candidate metaphor it gives the full existing entry (name, type, families, examples,
related, source_frame/target_frame if set) and, for every frame it references: `status`
(`existing_with_roles` / `existing_empty` / `missing`) plus current `roles` and
`lexical_units`, and up to 5 sibling metaphors already mapping to/from that same frame (their
full `mappings`, as a role-naming style example).

## Process, per metaphor

### 1. Resolve source_frame and target_frame, if either is missing

Follow `metaphor-drafting-spec.md` steps 2-4: exact/near name match against
`dataset/frames.yaml` first, then a semantic fit even under a different name, then create a
new frame only if nothing fits — matching the nearest analogous frame's role-naming idiom
(don't invent a new naming convention from scratch).

### 2. Read what's already there

The frame's current `roles` (if any) and the sibling mappings the context pack surfaced for
it. If siblings exist, they're the strongest signal for how this frame's roles get used in a
mapping — match that convention rather than deriving one independently.

### 3. Draft 1-5 mapping pairs

Ask: what does this metaphor's name, plus its examples, say is actually carried over from the
source frame to the target frame? Draft `source_role`/`target_role` pairs that satisfy the
invariance principle (`metaphor-drafting-spec.md` step 5) — the source role's relational
position in its frame has to actually match the target role's position in its frame, not
just "these two words seem related."

- **Prefer existing roles on both sides.** Most gap metaphors' frames already have a
  populated role list — the job is usually selecting the right existing pair, not inventing
  new roles.
- **Only propose a new role** when no existing role on that frame captures the
  correspondence. Before adding a role to a frame used by other metaphors, check how many
  (`grep` `dataset/metaphors.yaml` for the frame name) — flag it in the review notes as a
  shared-frame extension, don't fold it in silently.
- Not every existing role needs to be used, and not every metaphor needs the full 5 — a
  partial mapping matching just the load-bearing correspondence is normal and matches
  existing dataset entries.
- If, after genuinely thinking it through, no defensible pair emerges — some metaphors are
  quite abstract or thin on examples — leave that metaphor out of `metaphor_updates`
  entirely and flag it as unresolved in the review notes, rather than forcing a weak or
  tautological pair just to hit "at least 1."

## Output format

Two files per batch:

- `planning/mapping-batches/<NN>-mappings.yaml`:
  ```yaml
  metaphor_updates:
    - name: EXISTING_METAPHOR_NAME
      source_frame: some-frame   # only if it was missing from the dataset entry
      target_frame: some-frame   # only if it was missing from the dataset entry
      mappings:
        - source_role: role_a
          target_role: role_b
  frame_updates:
    - name: some-existing-frame  # frame already in dataset/frames.yaml, just role-thin
      new_roles:
        - name: some_new_role
  new_frames:                    # only for genuinely new frames (source or target)
    - name: some-new-frame
      roles:
        - name: some_role
      lexical_units: [some_word.v]
  ```
- `planning/mapping-batches/<NN>-review-notes.md`: one short paragraph per metaphor —
  which roles were paired and why (or which frame was resolved and how), or why it was
  flagged as an unresolved/shared-frame-extension case instead. This is the actual
  deliverable for review; the YAML is easy to regenerate, the reasoning isn't.

## Validate before returning

Run `uv run python -m scripts.mapping_gaps.validate_batch
planning/mapping-batches/<NN>-mappings.yaml` and fix anything it flags before finishing.
It checks every referenced metaphor already exists, every mapping role resolves against the
frame's existing roles plus this batch's own proposed extensions, naming conventions on any
new frame/role, and that a supplied `source_frame`/`target_frame` doesn't conflict with a
value the dataset entry already has (the merge step never overwrites an existing one).
Getting this to pass is necessary, not sufficient — it only catches what's mechanically
checkable; the judgment call is still whether the mapping actually preserves structure.
