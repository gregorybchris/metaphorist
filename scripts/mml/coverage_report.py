"""Phase 1 of the MML integration pipeline (docs/metaphor-drafting-spec.md,
planning behind /Users/chris/.claude/plans/we-re-ready-to-integrate-zippy-mochi.md):
dedup every entry in data/external/master-metaphor-list/master-metaphor-list.yaml
against dataset/metaphors.yaml so later phases only draft genuinely new entries.

Purely mechanical -- no LLM calls. Run: uv run python scripts/mml/coverage_report.py
"""

import re
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).parent.parent.parent
MML_YAML = REPO_ROOT / "data/external/master-metaphor-list/master-metaphor-list.yaml"
METAPHORS_YAML = REPO_ROOT / "dataset/metaphors.yaml"
OUT_YAML = REPO_ROOT / "planning/mml-coverage-report.yaml"

# Short function words that show up as filler in both MML's "X IS Y" statements
# and this dataset's SCREAMING_SNAKE_CASE names -- excluded so token overlap
# scores on content words, not sentence glue.
STOPWORDS = {
    "IS",
    "ARE",
    "A",
    "AN",
    "THE",
    "OF",
    "TO",
    "WITH",
    "ON",
    "IN",
    "AS",
    "AND",
    "FOR",
    "AT",
    "BY",
}

TOKEN_SPLIT_RE = re.compile(r"[^A-Za-z0-9]+")

EXACT_MATCH_THRESHOLD = 0.9
LIKELY_DUPLICATE_THRESHOLD = 0.4
HUB_EXAMPLE_THRESHOLD = 25
DOMAIN_MATCH_BONUS = 0.2


def tokenize(text):
    words = TOKEN_SPLIT_RE.split(text.upper())
    return {w for w in words if w and w not in STOPWORDS}


def jaccard(a, b):
    if not a and not b:
        return 0.0
    return len(a & b) / len(a | b)


def domain_bonus(mml_entry, existing):
    """+DOMAIN_MATCH_BONUS if the MML entry's source_domain/target_domain
    phrases each token-overlap the existing metaphor's source_frame/
    target_frame name -- a stronger signal than name overlap alone that
    these are the same mapping, not just similarly-worded."""
    src_domain = mml_entry.get("source_domain")
    tgt_domain = mml_entry.get("target_domain")
    if not src_domain or not tgt_domain:
        return 0.0
    src_frame = existing.get("source_frame")
    tgt_frame = existing.get("target_frame")
    if not src_frame or not tgt_frame:
        return 0.0
    src_match = tokenize(src_domain) & tokenize(src_frame.replace("-", " "))
    tgt_match = tokenize(tgt_domain) & tokenize(tgt_frame.replace("-", " "))
    return DOMAIN_MATCH_BONUS if src_match and tgt_match else 0.0


def best_match(mml_entry, existing_metaphors, existing_tokens):
    mml_tokens = tokenize(mml_entry["name"])
    best_name, best_score = None, 0.0
    for existing in existing_metaphors:
        score = jaccard(mml_tokens, existing_tokens[existing["name"]])
        score += domain_bonus(mml_entry, existing)
        if score > best_score:
            best_name, best_score = existing["name"], score
    return best_name, min(best_score, 1.0)


def bucket_for(score):
    if score >= EXACT_MATCH_THRESHOLD:
        return "exact_match"
    if score >= LIKELY_DUPLICATE_THRESHOLD:
        return "likely_duplicate"
    return "no_match"


def main():
    with open(MML_YAML) as f:
        mml_entries = yaml.safe_load(f)["metaphors"]
    with open(METAPHORS_YAML) as f:
        existing_metaphors = yaml.safe_load(f)["metaphors"]

    existing_tokens = {m["name"]: tokenize(m["name"]) for m in existing_metaphors}

    candidates = []
    counts = {"exact_match": 0, "likely_duplicate": 0, "no_match": 0}
    for entry in mml_entries:
        matched_name, score = best_match(entry, existing_metaphors, existing_tokens)
        bucket = bucket_for(score)
        counts[bucket] += 1
        example_count = len(entry.get("examples", []))
        candidates.append(
            {
                "id": entry["id"],
                "name": entry["name"],
                "section": entry.get("section"),
                "bucket": bucket,
                "match_score": round(score, 3),
                "matched_metaphor": matched_name if score > 0 else None,
                "needs_splitting": example_count > HUB_EXAMPLE_THRESHOLD,
                "no_domain_fields": not entry.get("source_domain")
                and not entry.get("target_domain"),
                "example_count": example_count,
            }
        )

    report = {
        "meta": {
            "mml_entry_count": len(mml_entries),
            "existing_metaphor_count": len(existing_metaphors),
            "bucket_counts": counts,
            "generated_by": "scripts/mml/coverage_report.py",
        },
        "candidates": candidates,
    }

    with open(OUT_YAML, "w") as f:
        yaml.safe_dump(
            report, f, allow_unicode=True, sort_keys=False, default_flow_style=False, width=100
        )

    print(f"Wrote {OUT_YAML.relative_to(REPO_ROOT)}: {counts}")


if __name__ == "__main__":
    main()
