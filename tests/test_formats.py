import warnings

from scripts.dataset_lib import (
    FRAME_NAME_RE,
    LEXICAL_UNIT_POS_RE,
    METAPHOR_NAME_RE,
    ROLE_NAME_RE,
)

KNOWN_METAPHOR_TYPES = {"Composed/complex", "Primary", "Entailed"}
KNOWN_FRAME_TYPES = {"Frame", "Cog", "Composed", "Primary"}


def _normalized_family_name(name):
    """Sentence case -- mirrors the rule described under 'Naming conventions' in the
    README. The first word and any ALL-CAPS word (a deliberate acronym/emphasis) are
    preserved as-is; every other word is lowercased; a bare lowercase first word gets
    its first letter capitalized (e.g. 'x-schema' -> 'X-schema')."""
    words = name.split()
    fixed = []
    for i, w in enumerate(words):
        if i == 0:
            fixed.append(w if (w.isupper() or not w.islower()) else w[0].upper() + w[1:])
        elif w.isupper():
            fixed.append(w)
        else:
            fixed.append(w.lower())
    return " ".join(fixed)


def test_metaphor_name_format(metaphors):
    bad = [m["name"] for m in metaphors if not METAPHOR_NAME_RE.match(m["name"])]
    assert not bad, f"metaphor names not in SCREAMING_SNAKE_CASE (A-Z, 0-9, _): {bad}"


def test_metaphor_types_known(metaphors):
    unknown = sorted({m["type"] for m in metaphors if m.get("type")} - KNOWN_METAPHOR_TYPES)
    assert not unknown, f"unexpected metaphor.type values: {unknown}"


def test_family_name_format(metaphor_families, frame_families):
    bad = [
        f["name"]
        for f in metaphor_families + frame_families
        if _normalized_family_name(f["name"]) != f["name"]
    ]
    assert not bad, f"family names not in sentence case (see README): {bad}"


def test_lexical_unit_has_pos(frames):
    bad = [
        f"{f['name']}.{lu}"
        for f in frames
        for lu in f.get("lexical_units", [])
        if not LEXICAL_UNIT_POS_RE.search(lu)
    ]
    assert not bad, f"lexical unit(s) missing a .pos tag (.n/.v/.a/.prep/.adv): {bad[:10]}"


# The checks below flag known, long-standing gaps inherited from the source
# ontology rather than defects introduced by edits to this repo, so they warn
# instead of failing the build.


def test_frame_name_format(frames):
    bad = [f["name"] for f in frames if not FRAME_NAME_RE.match(f["name"])]
    if bad:
        warnings.warn(
            f"{len(bad)} frame name(s) not in kebab-case (a-z, 0-9, -): {bad[:10]}",
            stacklevel=2,
        )


def test_role_name_format(frames):
    bad = [
        f"{f['name']}.{r['name']}"
        for f in frames
        for r in f.get("roles", [])
        if not ROLE_NAME_RE.match(r["name"])
    ]
    if bad:
        warnings.warn(
            f"{len(bad)} role name(s) not in snake_case (a-z, 0-9, _): {bad[:10]}",
            stacklevel=2,
        )


def test_frame_types_known(frames):
    unknown = sorted({t for f in frames for t in f.get("frame_type", [])} - KNOWN_FRAME_TYPES)
    if unknown:
        warnings.warn(f"unexpected frame.frame_type values: {unknown}", stacklevel=2)
