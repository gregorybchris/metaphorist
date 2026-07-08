"""Phase 2 helper for the MML integration pipeline: for every distinct
source/target domain phrase among the coverage report's `no_match`
candidates, retrieve a shortlist of existing dataset/frames.yaml frames by
token overlap against the frame's name, lexical_units, and role names.

Pure retrieval -- narrows the search space for the frame-plan agent pass in
Phase 2, doesn't decide reuse/extend/create itself. For the ~70 no_match
candidates with neither source_domain nor target_domain set in MML, falls
back to splitting the metaphor name on its first IS/ARE ("X IS Y" -> target
phrase X, source phrase Y, matching this dataset's own naming convention).

Run: uv run python scripts/mml/frame_candidates.py
"""

import re
from pathlib import Path

import yaml

from scripts.mml.coverage_report import tokenize

REPO_ROOT = Path(__file__).parent.parent.parent
COVERAGE_YAML = REPO_ROOT / "planning/mml-coverage-report.yaml"
MML_YAML = REPO_ROOT / "data/external/master-metaphor-list/master-metaphor-list.yaml"
FRAMES_YAML = REPO_ROOT / "dataset/frames.yaml"
OUT_YAML = REPO_ROOT / "planning/mml-frame-candidates.yaml"

NAME_SPLIT_RE = re.compile(r"\b(IS|ARE)\b")
TOP_N = 8
MIN_COVERAGE = 0.2  # fraction of domain-phrase tokens that must be found in a frame


def domain_phrases_for(entry):
    """(target_phrase, source_phrase) for one MML entry -- from source_domain/
    target_domain if present, else parsed from the "X IS Y" name itself."""
    src = entry.get("source_domain")
    tgt = entry.get("target_domain")
    if src and tgt:
        return tgt, src
    parts = NAME_SPLIT_RE.split(entry["name"], maxsplit=1)
    if len(parts) != 3:
        return None, None
    target_phrase, _, source_phrase = parts
    return target_phrase.strip(), source_phrase.strip()


def frame_vocab(frame):
    tokens = set(tokenize(frame["name"].replace("-", " ")))
    for lu in frame.get("lexical_units", []):
        tokens |= tokenize(lu.split(".")[0])
    for role in frame.get("roles", []):
        tokens |= tokenize(role["name"])
    return tokens


def candidates_for(phrase_tokens, frames, frame_vocabs):
    if not phrase_tokens:
        return []
    scored = []
    for frame in frames:
        overlap = phrase_tokens & frame_vocabs[frame["name"]]
        if not overlap:
            continue
        coverage = len(overlap) / len(phrase_tokens)
        if coverage >= MIN_COVERAGE:
            scored.append((coverage, frame["name"], sorted(overlap)))
    scored.sort(key=lambda x: (-x[0], x[1]))
    return [
        {"frame": name, "coverage": round(cov, 2), "matched_on": tokens}
        for cov, name, tokens in scored[:TOP_N]
    ]


def main():
    with open(COVERAGE_YAML) as f:
        coverage = yaml.safe_load(f)
    with open(MML_YAML) as f:
        mml_by_id = {e["id"]: e for e in yaml.safe_load(f)["metaphors"]}
    with open(FRAMES_YAML) as f:
        frames = yaml.safe_load(f)["frames"]

    frame_vocabs = {f["name"]: frame_vocab(f) for f in frames}

    no_match_ids = [c["id"] for c in coverage["candidates"] if c["bucket"] == "no_match"]

    phrases = {}  # normalized phrase -> {"raw": str, "used_by": [ids]}
    for mid in no_match_ids:
        entry = mml_by_id[mid]
        target_phrase, source_phrase = domain_phrases_for(entry)
        for phrase in (target_phrase, source_phrase):
            if not phrase:
                continue
            key = phrase.lower()
            phrases.setdefault(key, {"raw": phrase, "used_by": []})
            phrases[key]["used_by"].append(mid)

    results = []
    for _key, info in sorted(phrases.items()):
        phrase_tokens = tokenize(info["raw"])
        results.append(
            {
                "domain_phrase": info["raw"],
                "used_by_mml_ids": info["used_by"],
                "candidate_frames": candidates_for(phrase_tokens, frames, frame_vocabs),
            }
        )

    no_shortlist = sum(1 for r in results if not r["candidate_frames"])

    out = {
        "meta": {
            "no_match_candidate_count": len(no_match_ids),
            "distinct_domain_phrase_count": len(results),
            "phrases_with_no_candidate_frame": no_shortlist,
            "generated_by": "scripts/mml/frame_candidates.py",
        },
        "domain_phrases": results,
    }

    with open(OUT_YAML, "w") as f:
        yaml.safe_dump(
            out, f, allow_unicode=True, sort_keys=False, default_flow_style=False, width=100
        )

    print(
        f"Wrote {OUT_YAML.relative_to(REPO_ROOT)}: {len(results)} distinct domain phrases "
        f"from {len(no_match_ids)} no_match candidates, {no_shortlist} with no candidate frame"
    )


if __name__ == "__main__":
    main()
