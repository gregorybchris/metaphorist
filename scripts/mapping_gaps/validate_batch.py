"""Mechanical validator for mapping-backfill batches
(planning/mapping-batches/<NN>-mappings.yaml) -- run by a drafting agent
before it finishes (docs/mapping-backfill-spec.md) and again before merging
(scripts/mapping_gaps/merge_batch.py), reusing scripts/dataset_lib.py so the
rules can't drift from what tests/ checks post-merge.

Unlike scripts/mml/validate_batch.py (which validates wholly new metaphors),
this batch shape only ever *updates* metaphors that already exist in
dataset/metaphors.yaml -- so the checks here are about resolving against the
current dataset plus this batch's own proposed frame/role extensions, not
about drafting a self-contained new entry.

Run: uv run python -m scripts.mapping_gaps.validate_batch <batch.yaml> [...]
Multiple paths are combined into one validation scope so cross-batch new-frame
declarations (two batches both needing the same new frame) resolve correctly.
"""

import sys
from pathlib import Path

import yaml

from scripts.dataset_lib import (
    FRAME_NAME_RE,
    ROLE_NAME_RE,
    find_mapping_role_mismatches,
)

REPO_ROOT = Path(__file__).parent.parent.parent
DATASET_DIR = REPO_ROOT / "dataset"


def load_dataset():
    def _load(name):
        with open(DATASET_DIR / name) as f:
            return yaml.safe_load(f)

    return _load("metaphors.yaml")["metaphors"], _load("frames.yaml")["frames"]


def load_batches(paths):
    """Frames declared identically as a `new_frame` in more than one batch file
    collapse to one (batches drafted independently may both need the same new
    frame). Same name, differing content is a real conflict, reported
    separately rather than silently picking one -- mirrors
    scripts/mml/validate_batch.py's load_batches."""
    metaphor_updates = []
    frame_updates = []
    new_frames_by_name = {}
    conflicting_frame_names = set()
    for path in paths:
        with open(path) as f:
            batch = yaml.safe_load(f) or {}
        metaphor_updates.extend(batch.get("metaphor_updates", []))
        frame_updates.extend(batch.get("frame_updates", []))
        for frame in batch.get("new_frames", []):
            name = frame["name"]
            if name in new_frames_by_name and new_frames_by_name[name] != frame:
                conflicting_frame_names.add(name)
            new_frames_by_name[name] = frame
    return (
        metaphor_updates,
        frame_updates,
        list(new_frames_by_name.values()),
        conflicting_frame_names,
    )


def validate(batch_paths):
    existing_metaphors, existing_frames = load_dataset()
    metaphor_updates, frame_updates, new_frames, conflicting_frame_names = load_batches(batch_paths)

    errors = []

    if conflicting_frame_names:
        errors.append(
            f"new frame declared with conflicting content across batches "
            f"(resolve by hand before merging): {sorted(conflicting_frame_names)}"
        )

    existing_metaphors_by_name = {m["name"]: m for m in existing_metaphors}
    existing_frames_by_name = {f["name"]: f for f in existing_frames}
    new_frame_names = {f["name"] for f in new_frames}

    bad_new_frame_names = [f["name"] for f in new_frames if not FRAME_NAME_RE.match(f["name"])]
    if bad_new_frame_names:
        errors.append(f"new frame names not kebab-case: {bad_new_frame_names}")

    bad_new_role_names = [
        f"{f['name']}.{r['name']}"
        for f in new_frames
        for r in f.get("roles", [])
        if not ROLE_NAME_RE.match(r["name"])
    ]
    if bad_new_role_names:
        errors.append(f"new frame role names not snake_case: {bad_new_role_names}")

    for name in new_frame_names:
        if name in existing_frames_by_name:
            errors.append(f"new_frames entry collides with an existing frame: {name}")

    seen_metaphor_names = set()
    for mu in metaphor_updates:
        name = mu["name"]
        if name not in existing_metaphors_by_name:
            errors.append(f"metaphor_updates references a metaphor that doesn't exist: {name}")
        if name in seen_metaphor_names:
            errors.append(f"duplicate metaphor_updates entry within batch scope: {name}")
        seen_metaphor_names.add(name)
        if not mu.get("mappings"):
            errors.append(f"{name}: metaphor_updates entry has no mappings -- omit it instead")

    seen_frame_update_names = set()
    for fu in frame_updates:
        name = fu["name"]
        if name in new_frame_names:
            errors.append(f"{name}: declared in both frame_updates and new_frames -- pick one")
        elif name not in existing_frames_by_name:
            errors.append(f"frame_updates references a frame that doesn't exist yet: {name}")
        if name in seen_frame_update_names:
            errors.append(f"duplicate frame_updates entry within batch scope: {name}")
        seen_frame_update_names.add(name)
        bad = [r["name"] for r in fu.get("new_roles", []) if not ROLE_NAME_RE.match(r["name"])]
        if bad:
            errors.append(f"{name}: new_roles name(s) not snake_case: {bad}")

    # frame_roles: union of existing roles + this batch's proposed extensions,
    # for every frame -- what a metaphor_update's mapping is allowed to reference.
    frame_roles = {f["name"]: {r["name"] for r in f.get("roles", [])} for f in existing_frames}
    for fu in frame_updates:
        frame_roles.setdefault(fu["name"], set()).update(r["name"] for r in fu.get("new_roles", []))
    for nf in new_frames:
        frame_roles[nf["name"]] = {r["name"] for r in nf.get("roles", [])}

    # Resolve each metaphor_update's effective source_frame/target_frame: the
    # dataset's current value takes priority (merge_batch.py never overwrites
    # a value that's already set); the batch may only supply one when the
    # dataset's is currently absent.
    pseudo_metaphors = []
    for mu in metaphor_updates:
        existing = existing_metaphors_by_name.get(mu["name"])
        if existing is None:
            continue  # already reported above
        for field in ("source_frame", "target_frame"):
            current = existing.get(field)
            supplied = mu.get(field)
            if current and supplied and current != supplied:
                errors.append(
                    f"{mu['name']}: metaphor_updates.{field} ({supplied!r}) conflicts with "
                    f"the dataset's existing value ({current!r}) -- merge_batch.py never "
                    f"overwrites an existing frame reference"
                )
            elif not current and not supplied:
                errors.append(
                    f"{mu['name']}: has no {field} in the dataset and none supplied in "
                    f"metaphor_updates -- resolve a frame before drafting a mapping"
                )
        effective_source = existing.get("source_frame") or mu.get("source_frame")
        effective_target = existing.get("target_frame") or mu.get("target_frame")
        for field, effective in (
            ("source_frame", effective_source),
            ("target_frame", effective_target),
        ):
            if effective and effective not in frame_roles and effective not in new_frame_names:
                errors.append(
                    f"{mu['name']}: {field} {effective!r} is not an existing frame, a "
                    f"frame_updates entry, or a new_frames entry in this batch scope"
                )
        pseudo_metaphors.append(
            {
                "name": mu["name"],
                "source_frame": effective_source,
                "target_frame": effective_target,
                "mappings": mu.get("mappings", []),
            }
        )

    mismatched = find_mapping_role_mismatches(pseudo_metaphors, frame_roles)
    if mismatched:
        errors.append(f"mapping roles absent from frame's role list: {mismatched}")

    return errors


def main():
    if len(sys.argv) < 2:
        print("usage: uv run python -m scripts.mapping_gaps.validate_batch <batch.yaml> [...]")
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
