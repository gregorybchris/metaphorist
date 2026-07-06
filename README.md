# MetaNet Metaphor Repository (English) — Curated

This is a cleaned-up, English-only export of the [MetaNet Metaphor Repository](https://metaphor.icsi.berkeley.edu/) built at UC Berkeley's ICSI, originally funded by IARPA to study how metaphor shapes political and economic reasoning. It's built on Conceptual Metaphor Theory (Lakoff & Johnson): the idea that we understand abstract concepts (argument, anger, time, government) systematically in terms of more concrete ones (war, heat, money, machines), and that this shows up as everyday patterns in language rather than just poetic flourish. `metaphors.yaml`, `frames.yaml`, `metaphor-families.yaml`, and `frame-families.yaml` are the data; `build_curated.py` regenerates them from the original ontology in `data/`; the `tests/` suite sanity-checks the output. Set up with `uv sync`, then run `uv run build_curated.py` to regenerate and `make test` (or `make check` to also lint) to validate.

## Terminology

- **Frame** — a scenario or domain (e.g. `war`, `heating-fluid`), borrowed from FrameNet, with its own **roles** (slots, e.g. `container`, `fluid`) and **lexical_units** (words that evoke it, e.g. `boil.v`).
- **Metaphor** — a mapping from a **source_frame** (the concrete domain doing the explaining) to a **target_frame** (the abstract domain being explained), e.g. `ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER` maps `heating-fluid` onto `anger`.
- **mappings** — the role-by-role correspondences within one metaphor (`fluid → anger`, `container → body`, ...).
- **examples** — real sentences the metaphor is attested in (`"You make my blood boil."`).
- **entailments** — what you're implicitly committed to believing once you accept the metaphor (e.g. more heat entails more pressure, on both the source and target side).
- **families** — named thematic groupings (`Anger metaphors`, `Governance metaphors`), one per metaphor or frame, each with a `members` list for easy lookup. Live in their own files: `metaphor-families.yaml`, `frame-families.yaml`.
- **type** — `Primary` (a basic, experientially-grounded metaphor), `Composed/complex` (built out of primary metaphors), or `Entailed` (follows from another metaphor).

## Relations

Both metaphors and frames carry a `relations` map, cross-referencing other entries of the same kind. A couple of relation types carry most of the data (`entailed_by`/`subcase_of_*` for metaphors, `subcase_of`/`uses` for frames); the rest are a long, thin tail — real when present, but rare. Run `uv run pytest` for current coverage counts (the warning-level checks report their counts in the warnings summary).

**Metaphor relations** (`metaphors[].relations`):

| Key | Meaning |
|---|---|
| `entailed_by` | This metaphor's entailments come from another metaphor |
| `subcase_of_source` | A more specific version of another metaphor, sharing its *source* domain |
| `subcase_of_target` | A more specific version of another metaphor, sharing its *target* domain |
| `related` | Loosely associated, with no strict subcase/entailment direction |
| `uses` | Draws on another metaphor as a building block |
| `dual_of` | The same mapping viewed from the opposite evaluative angle |
| `related_by_source` | Related specifically via a shared source domain |
| `related_by_target` | Related specifically via a shared target domain |
| `mapping_within` | This is a sub-mapping nested inside a larger metaphor |
| `transitive_subpart_1` / `transitive_subpart_2` | The two chained halves of a composed metaphor (A→B and B→C, implying A→C) |

**Frame relations** (`frames[].relations`):

| Key | Meaning |
|---|---|
| `subcase_of` | A more specific frame nested under a general one |
| `uses` | Draws on another frame as a component |
| `related_to` | Loosely associated, with no strict hierarchy |
| `scalar_opposition_to` | Opposite ends of the same scale |
| `incorporates_as_role` | Another frame is folded in as one of this frame's roles |
| `perspective_on` | A viewpoint-specific framing of a more neutral frame |
| `causal_relation_with` | One frame causes or enables the other |

## Naming conventions

- Metaphor names are `SCREAMING_SNAKE_CASE` (`ANGER_IS_HEAT`).
- Frame names are `kebab-case` (`heating-fluid`).
- Role names are `lower_snake_case` (`fluid_heat_level`).

`build_curated.py` enforces these when regenerating the dataset, including merging source-ontology frames that only differed by casing/separators (e.g. `Physical entity` and `physical entity` both become `physical-entity`); the `tests/` suite flags anything that doesn't conform.

Some fields are sparse or inconsistent because this is a research database assembled by many contributors over time, not a finished product — run `make test` to see exactly where and how.
