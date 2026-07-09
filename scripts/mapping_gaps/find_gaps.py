"""Phase 1: find dataset/metaphors.yaml entries with no real mapping (a
role-by-role source_frame -> target_frame correspondence, not just the two
frame names) and split them into stable, deterministic batch manifests for
scripts/mapping_gaps/context_pack.py + docs/mapping-backfill-spec.md drafting.

A metaphor counts as a gap if it has no `mappings` at all, or its `mappings`
list exists but no entry carries both a `source_role` and a `target_role`
(handles a partially-drafted mapping being re-run through this pipeline).

Run: uv run python -m scripts.mapping_gaps.find_gaps [--batch-size 15]
Re-running is safe and idempotent except for the `status` field: an existing
manifest's per-batch `status` (pending/merged) is preserved across re-runs so
a partially-completed rollout doesn't get silently reset -- mirrors
scripts/mml/make_batches.py.
"""

import argparse
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).parent.parent.parent
DATASET_DIR = REPO_ROOT / "dataset"
OUT_YAML = REPO_ROOT / "planning/mapping-batches/manifest.yaml"

DEFAULT_BATCH_SIZE = 15


def has_real_mapping(m):
    return any(mp.get("source_role") and mp.get("target_role") for mp in m.get("mappings", []))


def load_existing_manifest():
    if not OUT_YAML.exists():
        return {}
    with open(OUT_YAML) as f:
        manifest = yaml.safe_load(f) or {}
    return {b["batch_id"]: b["status"] for b in manifest.get("batches", [])}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    args = parser.parse_args()

    with open(DATASET_DIR / "metaphors.yaml") as f:
        metaphors = yaml.safe_load(f)["metaphors"]

    gaps = [m for m in metaphors if not has_real_mapping(m)]
    # Deterministic order: cluster metaphors that share a target/source frame
    # adjacently (helps a drafting agent stay consistent on role naming for a
    # shared frame) without full graph clustering -- a quick check showed hub
    # source frames (verticality, object, force, ...) collapse nearly the
    # whole gap set into one connected component via graph clustering, so a
    # sort is the more useful signal here.
    gaps.sort(key=lambda m: (m.get("target_frame") or "", m.get("source_frame") or "", m["name"]))

    prior_status = load_existing_manifest()

    batches = []
    for i in range(0, len(gaps), args.batch_size):
        chunk = gaps[i : i + args.batch_size]
        batch_id = f"{len(batches) + 1:02d}"
        batches.append(
            {
                "batch_id": batch_id,
                "status": prior_status.get(batch_id, "pending"),
                "candidates": [
                    {
                        "name": m["name"],
                        "source_frame": m.get("source_frame"),
                        "target_frame": m.get("target_frame"),
                    }
                    for m in chunk
                ],
            }
        )

    out = {
        "meta": {
            "gap_count": len(gaps),
            "batch_count": len(batches),
            "batch_size": args.batch_size,
            "generated_by": "scripts/mapping_gaps/find_gaps.py",
        },
        "batches": batches,
    }

    OUT_YAML.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_YAML, "w") as f:
        yaml.safe_dump(
            out, f, allow_unicode=True, sort_keys=False, default_flow_style=False, width=100
        )

    print(
        f"Wrote {OUT_YAML.relative_to(REPO_ROOT)}: {len(gaps)} gap metaphor(s) in "
        f"{len(batches)} batch(es) of up to {args.batch_size}"
    )


if __name__ == "__main__":
    main()
