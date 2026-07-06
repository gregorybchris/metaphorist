# MetaNet Metaphor Repository (English) — Curated

This is a cleaned-up, English-only export of the [MetaNet Metaphor Repository](https://metaphor.icsi.berkeley.edu/) built at UC Berkeley's ICSI, originally funded by IARPA to study how metaphor shapes political and economic reasoning. It's built on Conceptual Metaphor Theory (Lakoff & Johnson): the idea that we understand abstract concepts (argument, anger, time, government) systematically in terms of more concrete ones (war, heat, money, machines), and that this shows up as everyday patterns in language rather than just poetic flourish.

`dataset/metaphors.yaml`, `dataset/frames.yaml`, `dataset/metaphor-families.yaml`, and `dataset/frame-families.yaml` are the dataset, and are hand- and agent-edited directly -- there's no build step. They were originally derived, once, from the raw MetaNet ontology (name normalization, duplicate merging, field pruning) by a one-time script that isn't part of this repo, so there's nothing to run or regenerate from. Set up with `uv sync`, then run `make test` (or `make check` to also lint) to validate the current data.

## The data model

The sections below build on each other, and mostly trace through one running example: **`ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER`** — the idea that anger is like fluid heating up in a sealed container (your blood boils, you blow off steam, you reach the boiling point).

### Frames

A **frame** is a scenario or domain, borrowed from FrameNet — `war`, `anger`, `heating-fluid`. A frame is defined by:

- **roles** — the slots that make up the scenario. `heating-fluid`'s roles are `container`, `fluid`, `container_heat`, `container_pressure`, `container_pressure_limit`, `container_top`, `fluid_agitation`, `fluid_boiling_point`, and `fluid_heat_level`.
- **lexical_units** — the words that evoke it, e.g. `boil.v`, `simmer.v`.

Individual roles can also carry a `role_type` tag classifying what kind of thing they are (`Entity`, `Liquid`, `Scale`, ...) — present only where the source ontology happened to have one, so treat it as bonus detail rather than something every role has.

### Metaphors

A **metaphor** is a mapping from a **source_frame** (the concrete domain doing the explaining) to a **target_frame** (the abstract domain being explained). `ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER` maps `heating-fluid` onto `anger`: heat, containers, and pressure (concrete, physical, easy to reason about) get borrowed to explain anger (abstract, internal, harder to reason about directly).

### Mappings

Naming the two frames only tells you they're linked — the **mappings** are what actually make the metaphor concrete: the role-by-role correspondence between source and target. For `ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER`:

| source_role | target_role |
|---|---|
| `container` | `body` |
| `fluid` | `anger` |
| `container_top` | `mind` |
| `fluid_heat_level` | `anger_level` |
| `container_heat` | `body_heat` |
| `fluid_agitation` | `body_agitation` |
| `container_pressure_limit` | `anger_limit` |

This is what says heat corresponds to anger specifically — not to something else — and it's what `entailments` (below) reason across.

### Examples and entailments

- **examples** — real sentences the metaphor is attested in: `"You make my blood boil."`, `"I had reached the boiling point."`
- **entailments** — what you're implicitly committed to believing once you accept the metaphor, given as a `source`/`target` pair. For this metaphor: more `fluid_heat_level` entails more `container_heat` and `fluid_agitation` on the source side — carried across the mapping, that becomes more `anger_level` entails more `body_heat` and `body_agitation` on the target side.

### Type

Every metaphor has a `type`, describing how it was arrived at:

- **`Primary`** — a basic, experientially-grounded metaphor. `ANGER_IS_HEAT` (mapping bare `heat` onto `anger`) is Primary: it comes straight from the bodily experience of getting hot when angry.
- **`Composed/complex`** — built by combining primary metaphors. `ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER` is Composed/complex — it elaborates `ANGER_IS_HEAT` with a whole container-and-pressure scenario borrowed from other primary metaphors (see Relations, below).
- **`Entailed`** — follows automatically from another metaphor, rather than being independently grounded. `HAPPY_IS_UP` ("My spirits rose.") is Entailed from `HAPPINESS_IS_VERTICALITY`, a Primary metaphor whose own entailments are "being upright → being happy" and "being low/horizontal → being sad." `HAPPY_IS_UP` (and its sibling `SAD_IS_DOWN`) just split that Primary metaphor's two directions out into their own named entries.

Frames have a loosely analogous `frame_type` tag list (`Frame`, `Cog`, `Composed`, `Primary`) — e.g. `heating-fluid` is tagged `[Composed, Frame]` — but it's a coarser, less consistently-applied classification than a metaphor's `type`.

## Families

Both metaphors and frames can belong to named thematic groupings, or **families** — `Anger metaphors`, `Emotion frames`, `Governance metaphors`. A metaphor lists its families under a `families` key (`ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER`'s `families` includes `Anger metaphors`); a frame lists its under `frame_families` instead (the `anger` frame's `frame_families` includes `Emotion frames`).

Each family is also defined from the other direction, as its own entry in `metaphor-families.yaml` or `frame-families.yaml` — a `name` plus a `members` list. The `Anger metaphors` family's `members` include `ANGER_IS_HEAT`, `ANGER_IS_FIRE`, `ANGER_IS_INSANITY`, `ANGER_IS_PRESSURE_IN_A_CONTAINER`, and `ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER`. These two directions have to agree — a member listed in a family that doesn't list that family back (or vice versa) is a test failure, not just a warning.

## Relations

Both metaphors and frames carry a `relations` map, cross-referencing other entries of the same kind. A couple of relation types carry most of the data (`entailed_by`/`subcase_of_*` for metaphors, `subcase_of`/`uses` for frames); the rest are a long, thin tail — real when present, but rare. Run `uv run pytest` for current coverage counts (the warning-level checks report their counts in the warnings summary).

`ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER`'s own `relations` are a good illustration: `subcase_of_source: [ANGER_IS_HEAT, ANGER_IS_PRESSURE_IN_A_CONTAINER]` (it's a more specific version of both), and `uses: [BODY_IS_A_CONTAINER_FOR_EMOTIONS, EMOTIONS_ARE_SUBSTANCES]` (two more basic metaphors it draws on as building blocks). And `HAPPY_IS_UP`'s `entailed_by: [HAPPINESS_IS_VERTICALITY]` is the relation-level version of the Type example above.

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

`heating-fluid` itself has `subcase_of: [heat]` and `uses: [containment]` — a more specific version of the general `heat` frame, built using `containment` as a component.

## Naming conventions

- Metaphor names are `SCREAMING_SNAKE_CASE` (`ANGER_IS_HEAT`).
- Frame names are `kebab-case` (`heating-fluid`).
- Role names are `lower_snake_case` (`fluid_heat_level`).
- Family names are sentence case with a trailing plural category word (`Anger metaphors`, `Access to education frames`) — the first word and any ALL-CAPS word (a deliberate acronym or emphasis, e.g. `DEMO metaphors`, `LOVE IS A JOURNEY Cascade`) are preserved as-is; every other word is lowercased.

These were enforced by the original one-time derivation script when the dataset was first built (metaphor names, frame names, role names, and metaphor family names), and by hand afterward for frame families once the build step was retired. Duplicate source-ontology entries that only differed by casing/separators were merged rather than dropped -- e.g. frames `Physical entity` and `physical entity` both become `physical-entity`, and frame families `X-schema family` and `x-schema family` both become `X-schema family`, each with their content unioned. The `tests/` suite flags anything that doesn't conform going forward, including in new hand- or agent-added entries.

## Data quality

Some fields are sparse or inconsistent because this is a research database assembled by many contributors over time, not a finished product — run `make test` to see exactly where and how.
