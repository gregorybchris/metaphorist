"""Phase 4: merge one or more approved MML batch files
(planning/mml-batches/<NN>-additions.yaml) into dataset/frames.yaml and
dataset/metaphors.yaml, updating dataset/metaphor-families.yaml back-references
for any existing family a new metaphor joins.

Re-validates the merge against scripts.mml.validate_batch before writing
anything -- a batch should already be clean by the time it's approved, but
this refuses to merge rather than trust that blindly.

Dataset files round-trip byte-identical through PyYAML with an indenting
Dumper and unlimited line width (verified empirically against all four
dataset/*.yaml files), so a full load-append-dump only ever changes the lines
that were actually added -- no reformatting noise on unrelated entries.

Run: uv run python -m scripts.mml.merge_batch <batch.yaml> [<batch.yaml> ...]
"""

import re
import sys
from pathlib import Path

import yaml

from scripts.mml.validate_batch import load_batches, load_dataset, validate

REPO_ROOT = Path(__file__).parent.parent.parent
DATASET_DIR = REPO_ROOT / "dataset"
MANIFEST_YAML = REPO_ROOT / "planning/mml-batches/manifest.yaml"

METAPHORS_PATH = DATASET_DIR / "metaphors.yaml"
FRAMES_PATH = DATASET_DIR / "frames.yaml"
METAPHOR_FAMILIES_PATH = DATASET_DIR / "metaphor-families.yaml"

BATCH_ID_RE = re.compile(r"(\d+)-additions\.yaml$")


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
    existing_metaphors, existing_frames, existing_families = load_dataset()
    batch_metaphors, batch_frames, _conflicting_frame_names = load_batches(batch_paths)

    errors = validate(batch_paths)
    if errors:
        raise SystemExit(
            "Refusing to merge -- validate_batch found problems:\n"
            + "\n".join(f"- {e}" for e in errors)
        )

    all_metaphors = existing_metaphors + batch_metaphors
    all_frames = existing_frames + batch_frames

    families_by_name = {f["name"]: f for f in existing_families}
    for m in batch_metaphors:
        for fam_name in m.get("families", []):
            fam = families_by_name[fam_name]  # validate() already confirmed this exists
            if m["name"] not in fam["members"]:
                fam["members"].append(m["name"])
                fam["members"].sort()

    with open(METAPHORS_PATH, "w") as f:
        f.write(dump({"metaphors": all_metaphors}))
    with open(FRAMES_PATH, "w") as f:
        f.write(dump({"frames": all_frames}))
    with open(METAPHOR_FAMILIES_PATH, "w") as f:
        f.write(dump({"metaphor_families": existing_families}))

    return len(batch_metaphors), len(batch_frames)


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
        print("usage: uv run python -m scripts.mml.merge_batch <batch.yaml> [<batch.yaml> ...]")
        sys.exit(2)

    batch_paths = sys.argv[1:]
    n_metaphors, n_frames = merge(batch_paths)
    mark_batches_merged(batch_paths)
    print(
        f"Merged {n_metaphors} metaphor(s) and {n_frames} frame(s) "
        f"from {len(batch_paths)} batch file(s)."
    )
    print("Run `make check` now to confirm no regressions before committing.")


if __name__ == "__main__":
    main()
