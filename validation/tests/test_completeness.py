import warnings

from dataset_lib import find_mapping_role_mismatches


def test_mapping_roles_present_in_frame_roles(metaphors, frame_roles):
    mismatched = find_mapping_role_mismatches(metaphors, frame_roles)
    assert not mismatched, f"mapping role(s) absent from their frame's roles list: {mismatched}"


def test_frame_roles_used_by_a_mapping(metaphors, frames):
    used = {}
    for m in metaphors:
        for mp in m.get("mappings", []):
            if m.get("source_frame") and mp.get("source_role"):
                used.setdefault(m["source_frame"], set()).add(mp["source_role"])
            if m.get("target_frame") and mp.get("target_role"):
                used.setdefault(m["target_frame"], set()).add(mp["target_role"])

    unused = [
        f"{f['name']}.{r['name']}"
        for f in frames
        for r in f.get("roles", [])
        if r["name"] not in used.get(f["name"], set())
    ]
    assert not unused, f"frame role(s) not used by any metaphor mapping: {unused}"


def test_frames_used_by_a_metaphor(metaphors, frames):
    used = set()
    for m in metaphors:
        if m.get("source_frame"):
            used.add(m["source_frame"])
        if m.get("target_frame"):
            used.add(m["target_frame"])

    unused = [f["name"] for f in frames if f["name"] not in used]
    assert not unused, (
        f"frame(s) not used as a source_frame or target_frame by any metaphor: {unused}"
    )


# These checks flag known, long-standing gaps inherited from the source
# ontology rather than defects introduced by edits to this repo, so they warn
# instead of failing the build.


def test_metaphors_have_mappings(metaphors):
    empty = [m["name"] for m in metaphors if not m.get("mappings")]
    if empty:
        warnings.warn(
            f"{len(empty)} metaphor(s) with no mappings: {empty[:5]}",
            stacklevel=2,
        )


def test_metaphors_have_examples(metaphors):
    empty = [m["name"] for m in metaphors if not m.get("examples")]
    if empty:
        warnings.warn(
            f"{len(empty)} metaphor(s) with no examples: {empty[:5]}",
            stacklevel=2,
        )


def test_frames_have_roles(frames):
    empty = [f["name"] for f in frames if not f.get("roles")]
    if empty:
        warnings.warn(
            f"{len(empty)} frame(s) with no roles: {empty[:5]}",
            stacklevel=2,
        )


def test_frames_have_lexical_units(frames):
    empty = [f["name"] for f in frames if not f.get("lexical_units")]
    if empty:
        warnings.warn(
            f"{len(empty)} frame(s) with no lexical units: {empty[:5]}",
            stacklevel=2,
        )
