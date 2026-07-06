import re
import warnings

# Mirrors build_curated.py's normalize_metaphor_name -- duplicated rather than
# imported since importing build_curated.py would re-run the whole OWL parse.
NAME_JUNK_RE = re.compile(r"['()]")
NAME_SEPARATOR_RE = re.compile(r"[.\s_-]+")
NAME_MULTI_UNDERSCORE_RE = re.compile(r"_+")


def _normalize(name):
    name = NAME_JUNK_RE.sub("", name)
    name = NAME_SEPARATOR_RE.sub("_", name)
    name = NAME_MULTI_UNDERSCORE_RE.sub("_", name).strip("_")
    return name.upper()


def test_alias_does_not_collide_with_a_different_metaphor(metaphors):
    """An alias that normalizes to another metaphor's real name is a sign the
    two entries might be undetected duplicates of the same metaphor, rather
    than just an alternate name worth dropping."""
    name_set = {m["name"] for m in metaphors}
    collisions = [
        f"{m['name']} alias {alias!r} -> {norm}"
        for m in metaphors
        for alias in m.get("aliases", [])
        for norm in [_normalize(alias)]
        if norm != m["name"] and norm in name_set
    ]
    if collisions:
        warnings.warn(
            f"{len(collisions)} alias(es) normalize to a different existing metaphor "
            f"(possible undetected duplicate): {collisions[:10]}",
            stacklevel=2,
        )
