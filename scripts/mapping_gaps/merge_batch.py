"""Merge one or more approved mapping-backfill batch files
(planning/mapping-batches/<NN>-mappings.yaml) into dataset/metaphors.yaml and
dataset/frames.yaml, updating existing entries in place.

Unlike scripts/mml/merge_batch.py (which appends wholly new metaphors), this
only ever mutates metaphors/frames that already exist: `mappings` gets set on
an existing metaphor, `source_frame`/`target_frame` only if currently absent,
and frame_updates append new_roles to an existing frame's role list. Wholly
new frames (new_frames) are appended, same as the MML script.

Re-validates the merge against scripts.mapping_gaps.validate_batch before
writing anything -- a batch should already be clean by the time it's
approved, but this refuses to merge rather than trust that blindly.

Dataset files round-trip byte-identical through PyYAML with an indenting
Dumper and unlimited line width (verified empirically in scripts/mml, reused
here unchanged), so a full load-mutate-dump only ever changes the lines that
actually changed -- no reformatting noise on unrelated entries.

Run: uv run python -m scripts.mapping_gaps.merge_batch <batch.yaml> [...]
"""

import re
import sys
from pathlib import Path

import yaml

from scripts.mapping_gaps.validate_batch import load_batches, load_dataset, validate

REPO_ROOT = Path(__file__).parent.parent.parent
DATASET_DIR = REPO_ROOT / "dataset"
MANIFEST_YAML = REPO_ROOT / "planning/mapping-batches/manifest.yaml"

METAPHORS_PATH = DATASET_DIR / "metaphors.yaml"
FRAMES_PATH = DATASET_DIR / "frames.yaml"

BATCH_ID_RE = re.compile(r"(\d+)-mappings\.yaml$")


class IndentedDumper(yaml.SafeDumper):
    """PyYAML's default dumper doesn't indent sequences nested under a mapping
    key; this dataset's files do. Verified to round-trip all four
    dataset/*.yaml files byte-identical with width=float('inf')."""

    def increase_indent(self, flow=False, indentless=False):
        return super().increase_indent(flow, False)


def dump(data):
    return yaml.dump(
        data,
        Dumper=IndentedDumper,
        sort_keys=False,
        allow_unicode=True,
        default_flow_style=False,
        width=float("inf"),
    )


def merge(batch_paths):
    existing_metaphors, existing_frames = load_dataset()
    metaphor_updates, frame_updates, new_frames, _conflicting = load_batches(batch_paths)

    errors = validate(batch_paths)
    if errors:
        raise SystemExit(
            "Refusing to merge -- validate_batch found problems:\n"
            + "\n".join(f"- {e}" for e in errors)
        )

    metaphors_by_name = {m["name"]: m for m in existing_metaphors}
    for mu in metaphor_updates:
        m = metaphors_by_name[mu["name"]]
        m["mappings"] = mu["mappings"]
        if not m.get("source_frame") and mu.get("source_frame"):
            m["source_frame"] = mu["source_frame"]
        if not m.get("target_frame") and mu.get("target_frame"):
            m["target_frame"] = mu["target_frame"]

    frames_by_name = {f["name"]: f for f in existing_frames}
    for fu in frame_updates:
        f = frames_by_name[fu["name"]]
        existing_role_names = {r["name"] for r in f.get("roles", [])}
        f.setdefault("roles", [])
        for r in fu.get("new_roles", []):
            if r["name"] not in existing_role_names:
                f["roles"].append(r)
                existing_role_names.add(r["name"])

    all_frames = existing_frames + new_frames

    with open(METAPHORS_PATH, "w") as f:
        f.write(dump({"metaphors": existing_metaphors}))
    with open(FRAMES_PATH, "w") as f:
        f.write(dump({"frames": all_frames}))

    return len(metaphor_updates), len(frame_updates), len(new_frames)


def mark_batches_merged(batch_paths):
    if not MANIFEST_YAML.exists():
        return
    batch_ids = set()
    for path in batch_paths:
        m = BATCH_ID_RE.search(Path(path).name)
        if m:
            batch_ids.add(m.group(1))
    if not batch_ids:
        return
    with open(MANIFEST_YAML) as f:
        manifest = yaml.safe_load(f)
    for b in manifest.get("batches", []):
        if b["batch_id"] in batch_ids:
            b["status"] = "merged"
    with open(MANIFEST_YAML, "w") as f:
        yaml.safe_dump(
            manifest, f, allow_unicode=True, sort_keys=False, default_flow_style=False, width=100
        )


def main():
    if len(sys.argv) < 2:
        print("usage: uv run python -m scripts.mapping_gaps.merge_batch <batch.yaml> [...]")
        sys.exit(2)

    batch_paths = sys.argv[1:]
    n_metaphors, n_frame_updates, n_new_frames = merge(batch_paths)
    mark_batches_merged(batch_paths)
    print(
        f"Merged {n_metaphors} metaphor mapping(s), {n_frame_updates} frame role "
        f"extension(s), and {n_new_frames} new frame(s) from {len(batch_paths)} batch file(s)."
    )
    print("Run `make check` now to confirm no regressions before committing.")


if __name__ == "__main__":
    main()
