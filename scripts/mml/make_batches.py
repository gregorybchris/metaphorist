"""Phase 3: split the coverage report's `no_match` candidates into stable,
deterministic batch manifests, each candidate pre-resolved to the frames
decided in Phase 2's frame plan -- batch-drafting agents don't invent new
frames, they only reference what's already in planning/mml-frame-plan.yaml.

Run: uv run python -m scripts.mml.make_batches [--batch-size 15]
Re-running is safe and idempotent except for the `status` field: an existing
manifest's per-batch `status` (pending/merged) is preserved across re-runs so
a partially-completed rollout doesn't get silently reset.
"""

import argparse
from pathlib import Path

import yaml

from scripts.mml.frame_candidates import domain_phrases_for

REPO_ROOT = Path(__file__).parent.parent.parent
COVERAGE_YAML = REPO_ROOT / "planning/mml-coverage-report.yaml"
FRAME_PLAN_YAML = REPO_ROOT / "planning/mml-frame-plan.yaml"
MML_YAML = REPO_ROOT / "data/external/master-metaphor-list/master-metaphor-list.yaml"
OUT_YAML = REPO_ROOT / "planning/mml-batches/manifest.yaml"

DEFAULT_BATCH_SIZE = 15


def load_phrase_to_frame():
    with open(FRAME_PLAN_YAML) as f:
        plan = yaml.safe_load(f)

    lookup = {}
    for entry in plan.get("reuse", []):
        for phrase in entry["domain_phrases"]:
            lookup[phrase.lower()] = entry["frame"]
    for entry in plan.get("extend", []):
        for phrase in entry["domain_phrases"]:
            lookup[phrase.lower()] = entry["frame"]
    for entry in plan.get("create", []):
        for phrase in entry["domain_phrases"]:
            lookup[phrase.lower()] = entry["name"]
    return lookup


def resolve_frames(entry, phrase_to_frame):
    target_phrase, source_phrase = domain_phrases_for(entry)
    target_frame = phrase_to_frame.get((target_phrase or "").lower())
    source_frame = phrase_to_frame.get((source_phrase or "").lower())
    unresolved = []
    if target_phrase and not target_frame:
        unresolved.append(f"target phrase {target_phrase!r} not in frame plan")
    if source_phrase and not source_frame:
        unresolved.append(f"source phrase {source_phrase!r} not in frame plan")
    return source_frame, target_frame, unresolved


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

    with open(COVERAGE_YAML) as f:
        coverage = yaml.safe_load(f)
    with open(MML_YAML) as f:
        mml_by_id = {e["id"]: e for e in yaml.safe_load(f)["metaphors"]}

    phrase_to_frame = load_phrase_to_frame()
    prior_status = load_existing_manifest()

    no_match = [c for c in coverage["candidates"] if c["bucket"] == "no_match"]
    # Deterministic order: MML section, then alphabetical by name -- stable
    # across re-runs so batch membership doesn't shuffle.
    no_match.sort(key=lambda c: (c.get("section") or "", c["name"]))

    resolved, unresolved_all = [], []
    for c in no_match:
        entry = mml_by_id[c["id"]]
        source_frame, target_frame, unresolved = resolve_frames(entry, phrase_to_frame)
        item = {
            "id": c["id"],
            "name": c["name"],
            "section": c.get("section"),
            "source_frame": source_frame,
            "target_frame": target_frame,
            "needs_splitting": c["needs_splitting"],
        }
        if unresolved:
            item["unresolved"] = unresolved
            unresolved_all.append(item)
        resolved.append(item)

    batches = []
    for i in range(0, len(resolved), args.batch_size):
        chunk = resolved[i : i + args.batch_size]
        batch_id = f"{len(batches) + 1:02d}"
        batches.append(
            {
                "batch_id": batch_id,
                "status": prior_status.get(batch_id, "pending"),
                "candidates": chunk,
            }
        )

    out = {
        "meta": {
            "no_match_candidate_count": len(no_match),
            "batch_count": len(batches),
            "batch_size": args.batch_size,
            "unresolved_candidate_count": len(unresolved_all),
            "generated_by": "scripts/mml/make_batches.py",
        },
        "batches": batches,
    }

    OUT_YAML.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_YAML, "w") as f:
        yaml.safe_dump(
            out, f, allow_unicode=True, sort_keys=False, default_flow_style=False, width=100
        )

    print(
        f"Wrote {OUT_YAML.relative_to(REPO_ROOT)}: {len(batches)} batches "
        f"of up to {args.batch_size}, {len(unresolved_all)} candidate(s) with an unresolved frame"
    )
    if unresolved_all:
        print("Unresolved (frame plan doesn't cover these phrases -- fix the plan):")
        for item in unresolved_all[:10]:
            print(f"  {item['name']}: {item['unresolved']}")


if __name__ == "__main__":
    main()
