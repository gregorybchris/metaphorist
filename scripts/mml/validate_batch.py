"""Phase 3/4 mechanical validator for MML integration batches
(planning/mml-batches/<NN>-additions.yaml, or an ad hoc draft file like
planning/pilot-mml-additions.yaml) -- runs the checks described in
docs/metaphor-drafting-spec.md step 10, pre-merge, reusing the exact logic
tests/ runs post-merge (scripts/dataset_lib.py) so the two can't drift.

Getting this to pass is necessary, not sufficient -- it only catches what's
mechanically checkable (naming, dangling references, mapping-role presence).
Structural/semantic judgment (does the mapping actually preserve structure,
is this a genuine duplicate, is the family fit real) is not this script's job.

Run: uv run python -m scripts.mml.validate_batch <batch.yaml> [<batch.yaml> ...]
Multiple paths are combined into one batch scope, so cross-references between
them (e.g. a metaphor in one file `related` to a metaphor in another) resolve
correctly -- pass every not-yet-merged batch that's part of the same review
round, not just the one you're actively drafting.
"""

import sys
from pathlib import Path

import yaml

from scripts.dataset_lib import (
    FRAME_NAME_RE,
    METAPHOR_NAME_RE,
    ROLE_NAME_RE,
    find_dangling_frame_refs,
    find_dangling_related,
    find_mapping_role_mismatches,
)

REPO_ROOT = Path(__file__).parent.parent.parent
DATASET_DIR = REPO_ROOT / "dataset"


def load_dataset():
    def _load(name):
        with open(DATASET_DIR / name) as f:
            return yaml.safe_load(f)

    return (
        _load("metaphors.yaml")["metaphors"],
        _load("frames.yaml")["frames"],
        _load("metaphor-families.yaml")["metaphor_families"],
    )


def load_batches(paths):
    """Frames declared with the same name and identical content in more than one
    batch file are collapsed to one -- batches drafted independently against the
    same not-yet-merged frame plan will often redeclare a shared new frame
    verbatim (e.g. two batches both needing a `fashion` frame). Frames with the
    same name but DIFFERING content are a real conflict, reported separately so
    the caller can surface it rather than silently picking one."""
    metaphors = []
    frames_by_name = {}
    conflicting_frame_names = set()
    for path in paths:
        with open(path) as f:
            batch = yaml.safe_load(f) or {}
        metaphors.extend(batch.get("metaphors", []))
        for frame in batch.get("new_frames", []):
            name = frame["name"]
            if name in frames_by_name and frames_by_name[name] != frame:
                conflicting_frame_names.add(name)
            frames_by_name[name] = frame
    return metaphors, list(frames_by_name.values()), conflicting_frame_names


def validate(batch_paths):
    existing_metaphors, existing_frames, existing_families = load_dataset()
    batch_metaphors, batch_frames, conflicting_frame_names = load_batches(batch_paths)

    errors = []

    if conflicting_frame_names:
        errors.append(
            f"frame name declared with conflicting content across batches "
            f"(resolve by hand before merging): {sorted(conflicting_frame_names)}"
        )

    bad_metaphor_names = [
        m["name"] for m in batch_metaphors if not METAPHOR_NAME_RE.match(m["name"])
    ]
    if bad_metaphor_names:
        errors.append(f"metaphor names not SCREAMING_SNAKE_CASE: {bad_metaphor_names}")

    bad_frame_names = [f["name"] for f in batch_frames if not FRAME_NAME_RE.match(f["name"])]
    if bad_frame_names:
        errors.append(f"frame names not kebab-case: {bad_frame_names}")

    bad_role_names = [
        f"{f['name']}.{r['name']}"
        for f in batch_frames
        for r in f.get("roles", [])
        if not ROLE_NAME_RE.match(r["name"])
    ]
    if bad_role_names:
        errors.append(f"role names not snake_case: {bad_role_names}")

    existing_metaphor_names = {m["name"] for m in existing_metaphors}
    existing_frame_names = {f["name"] for f in existing_frames}

    seen_metaphor_names = set()
    for m in batch_metaphors:
        if m["name"] in existing_metaphor_names:
            errors.append(f"metaphor name collides with existing dataset entry: {m['name']}")
        if m["name"] in seen_metaphor_names:
            errors.append(f"duplicate metaphor name within batch scope: {m['name']}")
        seen_metaphor_names.add(m["name"])

    seen_frame_names = set()
    for f in batch_frames:
        if f["name"] in existing_frame_names:
            errors.append(f"frame name collides with existing dataset entry: {f['name']}")
        if f["name"] in seen_frame_names:
            errors.append(f"duplicate frame name within batch scope: {f['name']}")
        seen_frame_names.add(f["name"])

    # Reference-resolution checks run against existing dataset + this batch scope combined.
    all_frames = existing_frames + batch_frames
    all_metaphor_names = existing_metaphor_names | seen_metaphor_names
    all_frame_names = existing_frame_names | seen_frame_names

    dangling_src = find_dangling_frame_refs(batch_metaphors, all_frames, "source_frame")
    if dangling_src:
        errors.append(f"dangling source_frame: {dangling_src}")

    dangling_tgt = find_dangling_frame_refs(batch_metaphors, all_frames, "target_frame")
    if dangling_tgt:
        errors.append(f"dangling target_frame: {dangling_tgt}")

    frame_roles = {f["name"]: {r["name"] for r in f.get("roles", [])} for f in all_frames}
    mismatched = find_mapping_role_mismatches(batch_metaphors, frame_roles)
    if mismatched:
        errors.append(f"mapping roles absent from frame's role list: {mismatched}")

    dangling_related_m = find_dangling_related(batch_metaphors, all_metaphor_names)
    if dangling_related_m:
        errors.append(f"metaphor related target doesn't exist: {dangling_related_m}")

    dangling_related_f = find_dangling_related(batch_frames, all_frame_names)
    if dangling_related_f:
        errors.append(f"frame related target doesn't exist: {dangling_related_f}")

    # Not in the spec's step-10 checklist, but cheap and enforces step 8's rule
    # (never invent a new family name at draft time -- that's a taxonomy decision).
    existing_family_names = {f["name"] for f in existing_families}
    dangling_family = [
        f"{m['name']} -> {fam}"
        for m in batch_metaphors
        for fam in m.get("families", [])
        if fam not in existing_family_names
    ]
    if dangling_family:
        errors.append(f"metaphor references a family that doesn't exist yet: {dangling_family}")

    return errors


def main():
    if len(sys.argv) < 2:
        print("usage: uv run python -m scripts.mml.validate_batch <batch.yaml> [<batch.yaml> ...]")
        sys.exit(2)

    errors = validate(sys.argv[1:])
    if errors:
        print(f"FAIL: {len(errors)} problem(s)")
        for e in errors:
            print(f"- {e}")
        sys.exit(1)

    print("OK: no problems found")


if __name__ == "__main__":
    main()
