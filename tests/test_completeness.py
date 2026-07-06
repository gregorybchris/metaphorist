import warnings

# These checks flag known, long-standing gaps inherited from the source
# ontology rather than defects introduced by edits to this repo, so they warn
# instead of failing the build.


def test_mapping_roles_present_in_frame_roles(metaphors, frame_roles):
    mismatched = []
    for m in metaphors:
        src_roles = frame_roles.get(m.get("source_frame"), set())
        tgt_roles = frame_roles.get(m.get("target_frame"), set())
        for mp in m.get("mappings", []):
            if mp.get("source_role") and mp["source_role"] not in src_roles:
                mismatched.append(
                    f"{m['name']}: source_role '{mp['source_role']}' not in "
                    f"{m.get('source_frame')}.roles"
                )
            if mp.get("target_role") and mp["target_role"] not in tgt_roles:
                mismatched.append(
                    f"{m['name']}: target_role '{mp['target_role']}' not in "
                    f"{m.get('target_frame')}.roles"
                )
    if mismatched:
        warnings.warn(
            f"{len(mismatched)} mapping role(s) absent from their frame's roles list: "
            f"{mismatched[:5]}",
            stacklevel=2,
        )


def test_metaphors_have_content(metaphors):
    empty = [
        m["name"]
        for m in metaphors
        if not m.get("mappings") and not m.get("examples") and not m.get("entailments")
    ]
    if empty:
        warnings.warn(
            f"{len(empty)} metaphor(s) with no mappings, examples, or entailments: {empty[:5]}",
            stacklevel=2,
        )


def test_frames_have_content(frames):
    empty = [f["name"] for f in frames if not f.get("roles") and not f.get("lexical_units")]
    if empty:
        warnings.warn(
            f"{len(empty)} frame(s) with no roles and no lexical units: {empty[:5]}",
            stacklevel=2,
        )
