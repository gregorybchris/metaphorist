"""Phase 2 helper: for one batch (planning/mapping-batches/manifest.yaml),
slice out just what a drafting agent needs -- each candidate metaphor's full
existing entry, the current state of every frame it references (roles +
lexical_units, or "missing" if it has none yet), and a sample of sibling
metaphors that already map to/from those same frames (as a role-naming style
example) -- instead of handing the agent the full 400KB+ dataset/metaphors.yaml
and 250KB+ dataset/frames.yaml on every batch.

Run: uv run python -m scripts.mapping_gaps.context_pack <batch_id>
"""

import argparse
from pathlib import Path

import yaml

from scripts.mapping_gaps.find_gaps import has_real_mapping

REPO_ROOT = Path(__file__).parent.parent.parent
MANIFEST_YAML = REPO_ROOT / "planning/mapping-batches/manifest.yaml"
FRAMES_YAML = REPO_ROOT / "dataset/frames.yaml"
METAPHORS_YAML = REPO_ROOT / "dataset/metaphors.yaml"

SIBLING_SAMPLE_SIZE = 5
METAPHOR_FIELDS_FOR_DRAFTING = [
    "name",
    "type",
    "source_frame",
    "target_frame",
    "families",
    "examples",
    "related",
]


def build_frames_out(needed_frame_names, existing_frames):
    frames_out = {}
    for name in sorted(needed_frame_names):
        f = existing_frames.get(name)
        if f is None:
            frames_out[name] = {"status": "missing"}
            continue
        roles = f.get("roles") or []
        frames_out[name] = {
            "status": "existing_with_roles" if roles else "existing_empty",
            "roles": [r["name"] for r in roles],
            "lexical_units": f.get("lexical_units", []),
        }
    return frames_out


def build_siblings_out(needed_frame_names, existing_metaphors):
    by_frame = {}
    for m in existing_metaphors:
        if not has_real_mapping(m):
            continue
        for frame in (m.get("source_frame"), m.get("target_frame")):
            if frame in needed_frame_names:
                by_frame.setdefault(frame, []).append(
                    {
                        "name": m["name"],
                        "source_frame": m.get("source_frame"),
                        "target_frame": m.get("target_frame"),
                        "mappings": m.get("mappings"),
                    }
                )
    return {name: ms[:SIBLING_SAMPLE_SIZE] for name, ms in by_frame.items()}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("batch_id")
    args = parser.parse_args()

    with open(MANIFEST_YAML) as f:
        manifest = yaml.safe_load(f)
    batch = next((b for b in manifest["batches"] if b["batch_id"] == args.batch_id), None)
    if batch is None:
        raise SystemExit(f"no batch {args.batch_id!r} in {MANIFEST_YAML}")

    with open(FRAMES_YAML) as f:
        existing_frames = {fr["name"]: fr for fr in yaml.safe_load(f)["frames"]}
    with open(METAPHORS_YAML) as f:
        existing_metaphors = yaml.safe_load(f)["metaphors"]
    metaphors_by_name = {m["name"]: m for m in existing_metaphors}

    needed_frame_names = set()
    candidates_out = []
    for c in batch["candidates"]:
        m = metaphors_by_name[c["name"]]
        candidates_out.append({k: m[k] for k in METAPHOR_FIELDS_FOR_DRAFTING if k in m})
        needed_frame_names.update(f for f in (m.get("source_frame"), m.get("target_frame")) if f)

    out = {
        "batch_id": args.batch_id,
        "candidates": candidates_out,
        "frames": build_frames_out(needed_frame_names, existing_frames),
        "sibling_metaphors": build_siblings_out(needed_frame_names, existing_metaphors),
    }

    out_path = REPO_ROOT / f"planning/mapping-batches/{args.batch_id}-context.yaml"
    with open(out_path, "w") as f:
        yaml.safe_dump(
            out, f, allow_unicode=True, sort_keys=False, default_flow_style=False, width=100
        )

    print(
        f"Wrote {out_path.relative_to(REPO_ROOT)}: {len(candidates_out)} candidates, "
        f"{len(out['frames'])} frames"
    )


if __name__ == "__main__":
    main()
