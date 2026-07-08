"""Shared dataset-validation logic: format rules and structural checks used by
both tests/ (against dataset/*.yaml) and scripts/mml/ (against draft batches
pre-merge, see docs/metaphor-drafting-spec.md step 10)."""

import re

METAPHOR_NAME_RE = re.compile(r"^[A-Z0-9_]+$")
FRAME_NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
ROLE_NAME_RE = re.compile(r"^[a-z0-9]+(_[a-z0-9]+)*$")

# A lexical unit carries its part of speech as a `.pos` tag on its head word,
# e.g. "boil.v" or, for multiword units, "hold.v back" / "highest level.n" --
# the tag can sit anywhere as long as the rest of the string is a trailing
# " particle/complement", not another content word standing alone.
LEXICAL_UNIT_POS_RE = re.compile(r"\.(n|v|a|prep|adv)( .*)?$")


def find_dangling_frame_refs(metaphors, frames, field):
    """metaphors[].source_frame / .target_frame values absent from frames."""
    frame_names = {f["name"] for f in frames}
    return [
        f"{m['name']} -> {m[field]}"
        for m in metaphors
        if m.get(field) and m[field] not in frame_names
    ]


def find_dangling_related(items, valid_names):
    """items[].related entries absent from valid_names (same-kind collection)."""
    return [
        f"{item['name']}.related -> {other}"
        for item in items
        for other in item.get("related", [])
        if other not in valid_names
    ]


def find_mapping_role_mismatches(metaphors, frame_roles):
    """metaphors[].mappings[] source_role/target_role values absent from their
    frame's role list. frame_roles: {frame_name: {role_name, ...}}."""
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
    return mismatched
