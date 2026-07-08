export const meta = {
  name: 'mml-batch',
  description: 'Draft, mechanically validate, and independently review one batch of Master Metaphor List candidates against the approved frame plan',
  whenToUse: 'Phase 3 of the MML integration pipeline (see docs/metaphor-drafting-spec.md and planning/mml-frame-plan.yaml). Run once per batch_id in planning/mml-batches/manifest.yaml, after Phase 2\'s frame plan has been human-approved.',
  phases: [
    { title: 'Draft' },
    { title: 'Validate+Repair' },
    { title: 'Review' },
    { title: 'Synthesize' },
  ],
}

const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    metaphor_names: { type: 'array', items: { type: 'string' } },
    new_frame_names: { type: 'array', items: { type: 'string' } },
    dropped_candidate_ids: {
      type: 'array',
      items: { type: 'string' },
      description: 'candidate ids from the context pack you deliberately did not draft an entry for, and why (put the why in judgment_notes)',
    },
    judgment_notes: {
      type: 'string',
      description: 'one short paragraph per drafted entry: what you decided, what alternative you rejected and why, anything genuinely unsure about -- per docs/metaphor-drafting-spec.md step 11',
    },
  },
  required: ['metaphor_names', 'judgment_notes'],
}

const VALIDATION_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    errors: { type: 'array', items: { type: 'string' } },
    raw_output: { type: 'string' },
  },
  required: ['ok', 'errors'],
}

const REPAIR_SCHEMA = {
  type: 'object',
  properties: {
    fixed: { type: 'boolean' },
    changes_made: { type: 'array', items: { type: 'string' } },
    could_not_fix: { type: 'array', items: { type: 'string' } },
  },
  required: ['fixed', 'changes_made'],
}

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    flags: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          metaphor: { type: 'string' },
          issue: { type: 'string' },
          severity: { type: 'string', enum: ['note', 'concern', 'blocker'] },
        },
        required: ['metaphor', 'issue', 'severity'],
      },
    },
    clean_count: { type: 'number', description: 'entries this lens checked and found no issue with' },
  },
  required: ['lens', 'flags', 'clean_count'],
}

const REVIEW_LENSES = [
  {
    key: 'structure-invariance',
    prompt: `Check every metaphor's mappings against the invariance principle (docs/metaphor-drafting-spec.md step 5): does each source_role/target_role pair actually preserve the role's relational position in its own frame, not just share a keyword? A mapping can validate mechanically (every role exists in its frame) and still be structurally wrong -- that's what you're checking for. Flag any mapping where the correspondence looks like a coincidence rather than a real structural parallel. Also flag any metaphor with no mappings at all if the frames involved are role-rich enough that a real mapping should have been possible (partial/absent mappings are normal per the spec when frames are role-thin -- only flag when it looks like the drafter just skipped it).`,
  },
  {
    key: 'example-quality',
    prompt: `Check every metaphor's examples (docs/metaphor-drafting-spec.md step 6): do they read as attested language rather than synthetic/invented-sounding? Cross-reference the original MML source entry (in the context pack) -- if the MML compiler's own notes flagged an example as ambiguous or probably belonging to a different metaphor and the drafter kept it anyway, flag that. Also flag examples that are generically on-topic but don't clearly instantiate this specific metaphor.`,
  },
  {
    key: 'duplicate-check',
    prompt: `This is a second, independent semantic duplicate check -- Phase 1's mechanical token-overlap pass already screened these candidates, but that only catches lexical overlap, not conceptual duplication. For every drafted metaphor, search dataset/metaphors.yaml (and the rest of this batch) for an existing entry that means the same thing in different words. Flag anything you think is a near-duplicate the mechanical pass missed, with the specific existing metaphor name it duplicates.`,
  },
  {
    key: 'family-relation-fit',
    prompt: `Check two things per docs/metaphor-drafting-spec.md steps 8-9: (1) every assigned family is a genuine semantic fit, not a keyword-forced tag -- this dataset's family taxonomy skews political/economic/social, so a psychologically-basic metaphor may legitimately have no good existing family; flag any family assignment that looks forced. (2) every entry in the flat related list is an actual real connection to that other metaphor, not just something that happened to share a frame -- flag any related link that doesn't hold up.`,
  },
]

function draftPrompt(batchId) {
  return `You're drafting one batch of new metaphor dataset entries as part of a larger pipeline integrating the Master Metaphor List (MML) into a curated conceptual-metaphor dataset. Full context: read /Users/chris/.claude/plans/we-re-ready-to-integrate-zippy-mochi.md (the whole plan) and docs/metaphor-drafting-spec.md (the exact per-entry process, steps 1-11) before starting.

Steps:
1. Run \`uv run python -m scripts.mml.context_pack ${batchId}\` (from the repo root) to generate planning/mml-batches/${batchId}-context.yaml. Read that file -- it has every candidate's original MML content (examples, notes, special_cases, etc.), each candidate's pre-resolved source_frame/target_frame (decided in Phase 2 -- do NOT invent or second-guess these frame resolutions, that decision is already made and approved), the full role/lexical_unit definitions for those frames (including ones not yet in dataset/frames.yaml if the frame plan says "create" or "extend" for them), and a sample of existing metaphors that already use those frames for style/relation matching.
2. For every candidate in the context pack, follow docs/metaphor-drafting-spec.md steps 1, 5-9, 11 (steps 2-4, frame resolution, are already done -- use the resolved frames as given):
   - Draft the mapping (step 5): every source_role/target_role must literally exist in its frame's role list (you have the role lists in the context pack). Judge whether the correspondence actually preserves relational structure, not just keyword association. Partial mappings are normal.
   - Curate examples (step 6): prefer the MML source's own examples. Drop any the MML compiler's own notes flagged as ambiguous or probably belonging elsewhere. Prefer examples that clearly instantiate this specific metaphor.
   - Classify type (step 7): Primary / Composed/complex / Entailed -- match the closest existing sibling (same source or target frame, visible in the context pack's sibling_metaphors) rather than deciding from the abstract definition alone.
   - Assign families (step 8): only reuse an EXISTING family from dataset/metaphor-families.yaml on genuine semantic fit. Never invent a new family name. It's normal and expected for many entries to have no family.
   - Assign relations (step 9): the flat, alphabetically-sorted \`related\` list (NOT the old typed relations map -- that schema was removed, see the plan file's schema note). Only link to a metaphor that actually exists -- already in dataset/metaphors.yaml, or elsewhere in this same batch. Candidates: sibling_metaphors sharing a frame, and anything MML's own related_metaphors/special_cases field names IF it actually exists in the dataset -- if MML references a sibling that isn't in the dataset, don't invent the link, just skip it.
   - Hub entries: if a candidate's needs_splitting is true (its MML entry collapsed a whole sub-metaphor system into one record, per the plan's "Hub entries" section), prefer drafting a relation to the sub-metaphors' own separate MML headings (if any exist as their own no_match candidate, possibly in a different batch, or already in the dataset) rather than hand-splitting the huge example blob. If a genuinely orphaned sub-case has no separate heading anywhere, you may draft it as its own entry using examples you can confidently attribute from the blob -- but say so explicitly in judgment_notes.
   - It's fine, and expected, to skip drafting an entry entirely for a candidate that turns out to be a poor fit on closer inspection (e.g. the MML entry is too thin, ambiguous, or turns out to be a duplicate after all) -- record its id in dropped_candidate_ids with why in judgment_notes, rather than forcing a low-quality entry.
3. If any candidate's resolved_source_frame/resolved_target_frame is missing (the frame plan didn't cover it) or a frame's status in the context pack is "UNRESOLVED", do NOT invent a frame -- drop that candidate and note it.
4. Write the batch file to planning/mml-batches/${batchId}-additions.yaml with this top-level shape (matching dataset/frames.yaml / dataset/metaphors.yaml field shapes exactly):
   \`\`\`yaml
   new_frames:  # only frames whose context-pack status was new_from_frame_plan and you actually used
   - name: <kebab-case>
     roles: [...]
     lexical_units: [...]
   metaphors:
   - name: <SCREAMING_SNAKE_CASE, derived from the MML name>
     type: <Primary|Composed/complex|Entailed>
     source_frame: <...>
     target_frame: <...>
     families: [...]        # omit if none fit
     mappings: [...]        # omit if none
     examples: [...]
     related: [...]         # omit if none, alphabetically sorted
   \`\`\`
   Field presence matches the existing dataset's convention: omit empty fields entirely rather than writing empty lists/nulls.
5. Return the structured summary (metaphor_names drafted, new_frame_names used, dropped_candidate_ids, and judgment_notes covering every drafted AND dropped entry).`
}

function repairPrompt(batchId, errors) {
  return `planning/mml-batches/${batchId}-additions.yaml failed mechanical validation (uv run python -m scripts.mml.validate_batch). Fix ONLY the specific errors below by editing that file in place -- don't redraft entries that weren't flagged. These are mechanical problems (naming format, dangling references, mapping roles absent from a frame's role list, unknown family), not judgment calls, so there should be an unambiguous fix for each:

${errors.map((e) => `- ${e}`).join('\n')}

After fixing, do not re-run the validator yourself -- just report what you changed.`
}

function synthesizePrompt(batchId, draftNotes, reviews) {
  const reviewSummary = reviews
    .map((r) => `### ${r.lens} (${r.clean_count} clean)\n${r.flags.map((f) => `- [${f.severity}] ${f.metaphor}: ${f.issue}`).join('\n') || '(no flags)'}`)
    .join('\n\n')

  return `Write planning/mml-batches/${batchId}-review-notes.md, the actual human-facing deliverable for this batch (docs/metaphor-drafting-spec.md step 11 and the "Output format" section). Match the shape of planning/pilot-mml-review-notes.md (read it first as your template).

Inputs:
- planning/mml-batches/${batchId}-additions.yaml -- the final drafted batch (read it for the actual entries).
- The drafting agent's own judgment notes:
${draftNotes}

- Four independent review lenses ran against the draft and returned these flags:
${reviewSummary}

Write one short paragraph per drafted entry combining the drafter's own reasoning with any review flags that landed on it (merge them -- don't just concatenate raw dumps). Weight "blocker" severity flags prominently; "note" severity can be one clause. End with a short summary: fraction of entries that needed a flag vs. went cleanly, and specifically call out any "blocker"-severity flags that should stop this batch from being merged without a second look. This mirrors pilot-mml-review-notes.md's own closing section.`
}

async function validateWithRepair(batchId) {
  let validation = null
  for (let attempt = 0; attempt < 3; attempt++) {
    validation = await agent(
      `Run: uv run python -m scripts.mml.validate_batch planning/mml-batches/${batchId}-additions.yaml (from the repo root). Report the exit status and every line of output verbatim.`,
      { label: `validate:${batchId}:attempt${attempt}`, phase: 'Validate+Repair', schema: VALIDATION_SCHEMA }
    )
    if (validation.ok) return validation
    if (attempt === 2) break
    await agent(repairPrompt(batchId, validation.errors), {
      label: `repair:${batchId}:attempt${attempt}`,
      phase: 'Validate+Repair',
      schema: REPAIR_SCHEMA,
    })
  }
  return validation
}

// NOTE: args.batchId does not reliably reach the script (confirmed empirically --
// it arrived as JS `undefined` in a real run despite passing args: {batchId: "00"}
// to the Workflow tool call). Don't rely on args for this. This file is a TEMPLATE:
// replace the __BATCH_ID__ placeholder below with the literal batch id before
// passing the result as Workflow's `script` parameter.
const batchId = '__BATCH_ID__'

phase('Draft')
const draft = await agent(draftPrompt(batchId), { label: `draft:${batchId}`, schema: DRAFT_SCHEMA })

phase('Validate+Repair')
const validation = await validateWithRepair(batchId)

phase('Review')
const reviews = (
  await parallel(
    REVIEW_LENSES.map((lens) => () =>
      agent(
        `Review planning/mml-batches/${batchId}-additions.yaml (and the batch's original context in planning/mml-batches/${batchId}-context.yaml) through this lens: ${lens.prompt} Return lens: "${lens.key}", your flags, and clean_count (entries you checked and found no issue with).`,
        { label: `review:${batchId}:${lens.key}`, phase: 'Review', schema: REVIEW_SCHEMA }
      )
    )
  )
).filter(Boolean)

phase('Synthesize')
await agent(synthesizePrompt(batchId, draft.judgment_notes, reviews), {
  label: `synthesize:${batchId}`,
  phase: 'Synthesize',
})

const blockerCount = reviews.reduce(
  (n, r) => n + r.flags.filter((f) => f.severity === 'blocker').length,
  0
)

return {
  batchId,
  metaphorCount: draft.metaphor_names.length,
  newFrameCount: (draft.new_frame_names || []).length,
  droppedCount: (draft.dropped_candidate_ids || []).length,
  validationOk: validation ? validation.ok : false,
  blockerCount,
  reviewFlagCounts: Object.fromEntries(reviews.map((r) => [r.lens, r.flags.length])),
}
