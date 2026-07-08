"""Phase 3 helper: for one batch (planning/mml-batches/manifest.yaml), slice
out just what a drafting agent needs -- the batch's own MML source content,
full definitions of the frames its candidates resolve to (whether already in
dataset/frames.yaml or newly proposed in the frame plan), and a sample of
existing metaphors that already use those frames (for example/relation
style-matching) -- instead of handing the agent the full 400KB+
dataset/{frames,metaphors}.yaml on every batch.

Run: uv run python -m scripts.mml.context_pack <batch_id>
"""

import argparse
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).parent.parent.parent
MANIFEST_YAML = REPO_ROOT / "planning/mml-batches/manifest.yaml"
FRAME_PLAN_YAML = REPO_ROOT / "planning/mml-frame-plan.yaml"
MML_YAML = REPO_ROOT / "data/external/master-metaphor-list/master-metaphor-list.yaml"
FRAMES_YAML = REPO_ROOT / "dataset/frames.yaml"
METAPHORS_YAML = REPO_ROOT / "dataset/metaphors.yaml"

SIBLING_SAMPLE_SIZE = 10
MML_FIELDS_FOR_DRAFTING = [
    "name",
    "section",
    "page",
    "source_domain",
    "target_domain",
    "examples",
    "notes",
    "alternate_names",
    "related_metaphors",
    "special_cases",
    "bibliography",
]


def load_frame_plan_frames():
    """frame_name -> {plan_action, roles?, lexical_units?, proposed_new_roles?}"""
    with open(FRAME_PLAN_YAML) as f:
        plan = yaml.safe_load(f)

    out = {}
    for entry in plan.get("create", []):
        out[entry["name"]] = {
            "plan_action": "create",
            "roles": entry.get("roles", []),
            "lexical_units": entry.get("lexical_units", []),
        }
    for entry in plan.get("extend", []):
        out[entry["frame"]] = {
            "plan_action": "extend",
            "proposed_new_roles": entry.get("proposed_new_roles", []),
        }
    for entry in plan.get("reuse", []):
        out.setdefault(entry["frame"], {"plan_action": "reuse"})
    return out


def build_frames_out(needed_frame_names, existing_frames, plan_frames):
    frames_out = {}
    for name in sorted(needed_frame_names):
        if name in existing_frames:
            ef = existing_frames[name]
            entry = {
                "status": "existing",
                "roles": ef.get("roles", []),
                "lexical_units": ef.get("lexical_units", []),
            }
            plan_info = plan_frames.get(name)
            if plan_info and plan_info["plan_action"] == "extend":
                entry["status"] = "existing_pending_extend"
                entry["proposed_new_roles"] = plan_info.get("proposed_new_roles", [])
        elif name in plan_frames:
            entry = {
                "status": "new_from_frame_plan",
                **{k: v for k, v in plan_frames[name].items() if k != "plan_action"},
            }
        else:
            entry = {"status": "UNRESOLVED - not in dataset or frame plan"}
        frames_out[name] = entry
    return frames_out


def build_siblings_out(needed_frame_names, existing_metaphors):
    by_frame = {}
    for m in existing_metaphors:
        for frame in (m.get("source_frame"), m.get("target_frame")):
            if frame in needed_frame_names:
                by_frame.setdefault(frame, []).append(m)
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

    with open(MML_YAML) as f:
        mml_by_id = {e["id"]: e for e in yaml.safe_load(f)["metaphors"]}
    with open(FRAMES_YAML) as f:
        existing_frames = {fr["name"]: fr for fr in yaml.safe_load(f)["frames"]}
    with open(METAPHORS_YAML) as f:
        existing_metaphors = yaml.safe_load(f)["metaphors"]

    plan_frames = load_frame_plan_frames()

    needed_frame_names = set()
    for c in batch["candidates"]:
        needed_frame_names.update(f for f in (c.get("source_frame"), c.get("target_frame")) if f)

    candidates_out = []
    for c in batch["candidates"]:
        entry = mml_by_id[c["id"]]
        mml_slice = {k: entry[k] for k in MML_FIELDS_FOR_DRAFTING if k in entry}
        candidates_out.append(
            {
                "id": c["id"],
                "resolved_source_frame": c.get("source_frame"),
                "resolved_target_frame": c.get("target_frame"),
                "needs_splitting": c.get("needs_splitting", False),
                "mml": mml_slice,
            }
        )

    out = {
        "batch_id": args.batch_id,
        "candidates": candidates_out,
        "frames": build_frames_out(needed_frame_names, existing_frames, plan_frames),
        "sibling_metaphors": build_siblings_out(needed_frame_names, existing_metaphors),
    }

    out_path = REPO_ROOT / f"planning/mml-batches/{args.batch_id}-context.yaml"
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
