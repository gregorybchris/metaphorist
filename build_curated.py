import re
from pathlib import Path

import rdflib
import yaml

ROOT = Path(__file__).parent
SRC = ROOT / "data" / "mr_en.owl"
OUT_METAPHORS = ROOT / "metaphors.yaml"
OUT_FRAMES = ROOT / "frames.yaml"
OUT_METAPHOR_FAMILIES = ROOT / "metaphor-families.yaml"
OUT_FRAME_FAMILIES = ROOT / "frame-families.yaml"

g = rdflib.Graph()
g.parse(SRC, format="xml")

METANET = rdflib.Namespace("https://metaphor.icsi.berkeley.edu/metaphor/MetaphorOntology.owl#")
RDF = rdflib.RDF
RDFS = rdflib.RDFS

CLASS_PREFIX_STRIP = {
    "Metaphor": "Metaphor_",
    "Frame": "Frame_",
    "MetaphorFamily": "Metaphor_family_",
    "FrameFamily": "Frame_",  # families are also Frame_..._frames, stripped same way
}


def local_name(node):
    return str(node).split("#")[-1]


NAME_JUNK_RE = re.compile(r"['()]")
NAME_SEPARATOR_RE = re.compile(r"[.\s_-]+")
NAME_MULTI_UNDERSCORE_RE = re.compile(r"_+")


def normalize_metaphor_name(name):
    """Metaphor names mix underscores/spaces/dots/hyphens as word separators
    and occasionally carry apostrophes or parentheses. Unify on '_' and
    uppercase for standard SCREAMING_SNAKE_CASE."""
    name = NAME_JUNK_RE.sub("", name)
    name = NAME_SEPARATOR_RE.sub("_", name)
    name = NAME_MULTI_UNDERSCORE_RE.sub("_", name).strip("_")
    return name.upper()


FRAME_JUNK_RE = re.compile(r"['\"]")
FRAME_SEPARATOR_RE = re.compile(r"[.,/_\s-]+")


def normalize_frame_name(name):
    """Frame names mix underscores/spaces/casing conventions and occasionally
    carry quotes. Unify on '-' and lowercase for standard kebab-case. A name
    with no alphanumeric content at all (e.g. the stub frame '-') falls back
    to its lowercased original rather than collapsing to an empty string."""
    cleaned = FRAME_JUNK_RE.sub("", name)
    cleaned = FRAME_SEPARATOR_RE.sub("-", cleaned)
    cleaned = cleaned.strip("-").lower()
    return cleaned or name.lower()


ROLE_JUNK_RE = re.compile(r"[\"'()]")
ROLE_SEPARATOR_RE = re.compile(r"[.,/_\s-]+")


def normalize_role_name(name):
    """Role names mix separators and occasionally carry quotes/parens.
    Unify on '_' and lowercase for standard snake_case. A name with no
    alphanumeric content at all falls back to its lowercased original
    rather than collapsing to an empty string."""
    cleaned = ROLE_JUNK_RE.sub("", name)
    cleaned = ROLE_SEPARATOR_RE.sub("_", cleaned)
    cleaned = cleaned.strip("_").lower()
    return cleaned or name.lower()


ROLE_TYPE_JUNK_RE = re.compile(r"""[?'"()]""")
ROLE_TYPE_SEPARATOR_RE = re.compile(r"[-_/,\s]+")


def normalize_role_type(value):
    """Role types are freeform and wildly inconsistent (casing, separators,
    a stray '?'). Split into words and title-case each for PascalCase --
    this also merges obvious duplicates like 'x-schema'/'X-schema'."""
    cleaned = ROLE_TYPE_JUNK_RE.sub("", value)
    words = ROLE_TYPE_SEPARATOR_RE.split(cleaned)
    return "".join(w[:1].upper() + w[1:].lower() for w in words if w)


def normalize_family_name(name):
    """Metaphor family names are mostly sentence case but occasionally slip
    into Title Case, and some singular 'Metaphor' should be 'metaphors'.
    Keep the first word and any ALL-CAPS word (a deliberate acronym or
    emphasis, e.g. 'LOVE IS A JOURNEY Cascade') as-is; lowercase every other
    word; then pluralize a trailing 'metaphor'."""
    words = name.split()
    fixed = [w if i == 0 or w.isupper() else w.lower() for i, w in enumerate(words)]
    name = " ".join(fixed)
    if name == "metaphor" or name.endswith(" metaphor"):
        name += "s"
    return name


def entity_name(node, cls=None):
    n = g.value(node, METANET.hasName)
    if n:
        name = str(n)
    else:
        name = local_name(node)
        if cls and cls in CLASS_PREFIX_STRIP:
            prefix = CLASS_PREFIX_STRIP[cls]
            if name.startswith(prefix):
                name = name[len(prefix) :]
    if cls == "Metaphor":
        name = normalize_metaphor_name(name)
    elif cls == "Frame":
        name = normalize_frame_name(name)
    elif cls == "MetaphorFamily":
        name = normalize_family_name(name)
    return name


def literal_list(node, prop):
    return [str(o) for o in g.objects(node, prop)]


ALIAS_CITATION_RE = re.compile(r"^(.*)\(([^()]*)\)$")


def aliases_of(node):
    """hasAlias values look like 'NAME(Source:Page)' -- keep just the name."""
    out = []
    for raw in literal_list(node, METANET.hasAlias):
        m = ALIAS_CITATION_RE.match(raw)
        name = m.group(1).strip() if m else raw.strip()
        if name:
            out.append(name)
    return out


def literal_one(node, prop):
    v = g.value(node, prop)
    return str(v) if v is not None else None


def ref_names(node, prop, cls=None):
    return [entity_name(o, cls) for o in g.objects(node, prop)]


def definition_of(node):
    desc = literal_one(node, METANET.hasDescription)
    comment = literal_one(node, RDFS.comment)
    if desc and comment:
        return desc + "\n\n" + comment
    return desc or comment


def compact(d):
    """Drop keys with falsy/empty values for a clean output."""
    return {k: v for k, v in d.items() if v not in (None, [], {}, "")}


# ---------------------------------------------------------------------------
# Inferences (only used to resolve Entailment source/target text)
# ---------------------------------------------------------------------------
inference_text = {}
for s in g.subjects(RDF.type, METANET.Inference):
    inference_text[s] = literal_one(s, METANET.hasInferentialContent)


def entailments_of(node):
    out = []
    for ent in g.objects(node, METANET.hasEntailment):
        src_inf = g.value(ent, METANET.hasSourceInference)
        tgt_inf = g.value(ent, METANET.hasTargetInference)
        item = compact(
            {
                "source": inference_text.get(src_inf) if src_inf else None,
                "target": inference_text.get(tgt_inf) if tgt_inf else None,
            }
        )
        if item:
            out.append(item)
    return out


def examples_of(node):
    return [
        s
        for s in (
            literal_one(ex, METANET.hasSentence) for ex in g.objects(node, METANET.hasExample)
        )
        if s
    ]


def mappings_of(node):
    out = []
    for mp in g.objects(node, METANET.hasMappings):
        sr = g.value(mp, METANET.hasSourceRole)
        tr = g.value(mp, METANET.hasTargetRole)
        sr_name = normalize_role_name(str(g.value(sr, METANET.hasName))) if sr is not None else None
        tr_name = normalize_role_name(str(g.value(tr, METANET.hasName))) if tr is not None else None
        item = compact({"source_role": sr_name, "target_role": tr_name})
        if item:
            out.append(item)
    return out


METAPHOR_RELATION_PROPS = [
    ("isSourceSubcaseOfMetaphor", "subcase_of_source"),
    ("isTargetSubcaseOfMetaphor", "subcase_of_target"),
    ("makesUseOfMetaphor", "uses"),
    ("isADualOfMetaphor", "dual_of"),
    ("isAMappingWithinMetaphor", "mapping_within"),
    ("isEntailedByMetaphor", "entailed_by"),
    ("isRelatedToMetaphor", "related"),
    ("isRelatedToMetaphorBySource", "related_by_source"),
    ("isRelatedToMetaphorByTarget", "related_by_target"),
    ("hasTransitiveSubpart1Metaphor", "transitive_subpart_1"),
    ("hasTransitiveSubpart2Metaphor", "transitive_subpart_2"),
]

FRAME_RELATION_PROPS = [
    ("isSubcaseOfFrame", "subcase_of"),
    ("makesUseOfFrame", "uses"),
    ("isAPerspectiveOnFrame", "perspective_on"),
    ("isInAScalarOppositionToFrame", "scalar_opposition_to"),
    ("isInCausalRelationWithFrame", "causal_relation_with"),
    ("isRelatedToFrame", "related_to"),
    ("incorporatesFrameAsRole", "incorporates_as_role"),
]


def relations_of(node, prop_list, cls=None):
    out = {}
    for prop_name, label in prop_list:
        prop = METANET[prop_name]
        names = ref_names(node, prop, cls)
        if names:
            out[label] = names
    return out


# ---------------------------------------------------------------------------
# Metaphors
# ---------------------------------------------------------------------------
DELETED_FAMILY = "Metaphors slated for deletion"

metaphors = []
for s in g.subjects(RDF.type, METANET.Metaphor):
    src_frame = g.value(s, METANET.hasSourceFrame)
    tgt_frame = g.value(s, METANET.hasTargetFrame)
    all_family_names = [
        entity_name(f, "MetaphorFamily") for f in g.objects(s, METANET.isInMetaphorFamily)
    ]
    family_names = sorted(f for f in all_family_names if f != DELETED_FAMILY)

    if not family_names and DELETED_FAMILY in all_family_names:
        continue

    record = compact(
        {
            "name": entity_name(s, "Metaphor"),
            "aliases": aliases_of(s),
            "type": literal_one(s, METANET.hasMetaphorType),
            "definition": definition_of(s),
            "source_frame": entity_name(src_frame, "Frame") if src_frame is not None else None,
            "target_frame": entity_name(tgt_frame, "Frame") if tgt_frame is not None else None,
            "families": family_names,
            "mappings": mappings_of(s),
            "examples": examples_of(s),
            "entailments": entailments_of(s),
            "relations": relations_of(s, METAPHOR_RELATION_PROPS, "Metaphor"),
        }
    )
    metaphors.append(record)

metaphors.sort(key=lambda m: m["name"])

# ---------------------------------------------------------------------------
# Frames (with roles + lexical units folded in)
# ---------------------------------------------------------------------------
frames = []
for s in g.subjects(RDF.type, METANET.Frame):
    frame_family_names = sorted(
        entity_name(f, "FrameFamily") for f in g.objects(s, METANET.isInFrameFamily)
    )

    roles = []
    for role in g.objects(s, METANET.hasRoles):
        role_name = literal_one(role, METANET.hasName)
        role_type = literal_one(role, METANET.hasRoleType)
        roles.append(
            compact(
                {
                    "name": normalize_role_name(role_name) if role_name else None,
                    "role_type": normalize_role_type(role_type) if role_type else None,
                }
            )
        )

    lexical_units = sorted(
        literal_list(lu, METANET.hasLemma)[0]
        if literal_list(lu, METANET.hasLemma)
        else literal_one(lu, RDFS.label)
        for lu in g.objects(s, METANET.hasLexicalUnit)
    )

    record = compact(
        {
            "name": entity_name(s, "Frame"),
            "aliases": aliases_of(s),
            "definition": definition_of(s),
            "frame_type": sorted(set(literal_list(s, METANET.hasFrameType))),
            "frame_families": frame_family_names,
            "roles": roles,
            "lexical_units": lexical_units,
            "relations": relations_of(s, FRAME_RELATION_PROPS, "Frame"),
        }
    )
    frames.append(record)


def merge_frame_records(records):
    """Kebab-casing frame names occasionally collapses two source-ontology
    individuals for the same real-world concept (e.g. 'Physical entity' and
    'physical entity' both become 'physical-entity'). Merge such groups
    instead of silently dropping one -- union list fields, dedup roles by
    name, and keep every distinct scalar value."""
    groups = {}
    for r in records:
        groups.setdefault(r["name"], []).append(r)

    merged = []
    for name, group in groups.items():
        if len(group) == 1:
            merged.append(group[0])
            continue

        combined = {"name": name}
        for key in ("definition",):
            values = list(dict.fromkeys(g[key] for g in group if g.get(key)))
            if values:
                combined[key] = "\n\n".join(values)
        for key in ("aliases", "frame_type", "frame_families", "lexical_units"):
            values = sorted({v for g in group for v in g.get(key, [])})
            if values:
                combined[key] = values
        roles_by_name = {}
        for g in group:
            for role in g.get("roles", []):
                roles_by_name.setdefault(role["name"], role)
        if roles_by_name:
            combined["roles"] = sorted(roles_by_name.values(), key=lambda r: r["name"])
        rel = {}
        for g in group:
            for key, values in g.get("relations", {}).items():
                rel.setdefault(key, set()).update(values)
        if rel:
            combined["relations"] = {k: sorted(v) for k, v in sorted(rel.items())}
        merged.append(combined)
    return merged


frames = merge_frame_records(frames)
frames.sort(key=lambda f: f["name"])

# ---------------------------------------------------------------------------
# Families (with member lists for easy cross-reference)
# ---------------------------------------------------------------------------
# NOTE: family names are derived from what metaphors/frames actually
# reference (not by iterating MetaphorFamily/FrameFamily individuals directly)
# because the source ontology contains duplicate family individuals with a
# doubled name prefix (e.g. Frame_family_Harm and Frame_family_Frame_family_Harm)
# that both legitimately get referenced under the same display name.
all_metaphor_family_names = sorted({n for m in metaphors for n in m.get("families", [])})
metaphor_families = [
    {"name": name, "members": sorted(m["name"] for m in metaphors if name in m.get("families", []))}
    for name in all_metaphor_family_names
]

all_frame_family_names = sorted({n for f in frames for n in f.get("frame_families", [])})
frame_families = [
    {
        "name": name,
        "members": sorted(f["name"] for f in frames if name in f.get("frame_families", [])),
    }
    for name in all_frame_family_names
]
frame_families.sort(key=lambda f: f["name"])

# ---------------------------------------------------------------------------
# Write out -- one file per top-level section, since the combined dataset
# was getting too large to work with as a single YAML file.
# ---------------------------------------------------------------------------
YAML_KWARGS = {"allow_unicode": True, "sort_keys": False, "default_flow_style": False, "width": 100}


def dump(path, data):
    with open(path, "w") as f:
        yaml.safe_dump(data, f, **YAML_KWARGS)
    print("wrote", path)


dump(OUT_METAPHORS, {"metaphors": metaphors})
dump(OUT_FRAMES, {"frames": frames})
dump(OUT_METAPHOR_FAMILIES, {"metaphor_families": metaphor_families})
dump(OUT_FRAME_FAMILIES, {"frame_families": frame_families})

print(f"metaphors: {len(metaphors)}")
print(f"frames: {len(frames)}")
print(f"metaphor_families: {len(metaphor_families)}")
print(f"frame_families: {len(frame_families)}")
