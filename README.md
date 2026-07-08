# MetaNet Metaphor Repository (English) — Curated

This is a cleaned-up, English-only export of the [MetaNet Metaphor Repository](https://metaphor.icsi.berkeley.edu/) built at UC Berkeley's ICSI, originally funded by IARPA to study how metaphor shapes political and economic reasoning. It's built on Conceptual Metaphor Theory (Lakoff & Johnson): the idea that we understand abstract concepts (argument, anger, time, government) systematically in terms of more concrete ones (war, heat, money, machines), and that this shows up as everyday patterns in language rather than just poetic flourish.

`dataset/metaphors.yaml`, `dataset/frames.yaml`, `dataset/metaphor-families.yaml`, and `dataset/frame-families.yaml` are the dataset, and are hand- and agent-edited directly -- there's no build step. They were originally derived, once, from the raw MetaNet ontology (name normalization, duplicate merging, field pruning) by a one-time script that isn't part of this repo, so there's nothing to run or regenerate from. Set up with `uv sync`, then run `make test` (or `make check` to also lint) to validate the current data.

## The data model

The sections below build on each other, and mostly trace through one running example: **`ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER`** — the idea that anger is like fluid heating up in a sealed container (your blood boils, you blow off steam, you reach the boiling point).

### Frames

A **frame** is a scenario or domain, borrowed from FrameNet — `war`, `anger`, `heating-fluid`. A frame is defined by:

- **roles** — the slots that make up the scenario. `heating-fluid`'s roles are `container`, `fluid`, `container_heat`, `container_pressure`, `container_pressure_limit`, `container_top`, `fluid_agitation`, `fluid_boiling_point`, and `fluid_heat_level`.
- **lexical_units** — the words that evoke it, e.g. `boil.v`, `simmer.v`.

### Metaphors

A **metaphor** is a mapping from a **source_frame** (the concrete domain doing the explaining) to a **target_frame** (the abstract domain being explained). `ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER` maps `heating-fluid` onto `anger`: heat, containers, and pressure (concrete, physical, easy to reason about) get borrowed to explain anger (abstract, internal, harder to reason about directly).

### Mappings

Naming the two frames only tells you they're linked — the **mappings** are what actually make the metaphor concrete: the role-by-role correspondence between source and target. For `ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER`:

| source_role                | target_role      |
| -------------------------- | ---------------- |
| `container`                | `body`           |
| `fluid`                    | `anger`          |
| `container_top`            | `mind`           |
| `fluid_heat_level`         | `anger_level`    |
| `container_heat`           | `body_heat`      |
| `fluid_agitation`          | `body_agitation` |
| `container_pressure_limit` | `anger_limit`    |

This is what says heat corresponds to anger specifically — not to something else.

### Examples

- **examples** — real sentences the metaphor is attested in: `"You make my blood boil."`, `"I had reached the boiling point."`

### X-schema roles

Many frames declare a role named `<something>_x_schema` (87 of them across the dataset) — short for **executing schema**, a term from Srini Narayanan's work at ICSI Berkeley, the same lab this repository comes from. An x-schema models the general control structure of any goal-directed action — starting, being in progress, getting interrupted, resuming, completing — independent of what the action actually is. It's the piece a FrameNet-style role list doesn't cover: a frame's other roles describe _who's involved_ (a mover, a container, an actor); its x-schema role describes _how the action unfolds over time_.

That's why mappings so often pair one frame's x-schema role with another's, e.g. `self_motion_x_schema -> action_x_schema` in `ACTION_IS_SELF_PROPELLED_MOTION_ALONG_A_PATH`. That isn't mapping a participant onto a participant — it's claiming that abstract _action_ inherits the entire temporal shape of physical _self-propelled motion_. Conceptually: manner of movement → manner of action, stage of movement → stage of action, speed of motion → rate of action, impediments to motion → impediments to action. Every pair is aspectual vocabulary (manner, stage, speed, obstacles), not "who did what to whom" — that's the x-schema mapping doing its job.

### Type

Every metaphor has a `type`, describing how it was arrived at:

- **`Primary`** — a basic, experientially-grounded metaphor. `ANGER_IS_HEAT` (mapping bare `heat` onto `anger`) is Primary: it comes straight from the bodily experience of getting hot when angry.
- **`Composed/complex`** — built by combining primary metaphors. `ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER` is Composed/complex — it elaborates `ANGER_IS_HEAT` with a whole container-and-pressure scenario borrowed from other primary metaphors (see Relations, below).
- **`Entailed`** — follows automatically from another metaphor, rather than being independently grounded. `HAPPY_IS_UP` ("My spirits rose.") is Entailed from `HAPPINESS_IS_VERTICALITY`, a Primary metaphor: accepting it commits you to something like "being upright entails being happy" and "being low/horizontal entails being sad." `HAPPY_IS_UP` (and its sibling `SAD_IS_DOWN`) just split that Primary metaphor's two directions out into their own named entries.

Frames have a loosely analogous `frame_type` tag list, but it's a coarser, less consistently-applied classification than a metaphor's `type`: 213 of 554 frames carry no tag at all, and the rest carry one or more of:

- **`Frame`** — an ordinary, FrameNet-style scenario invoked by its own lexical units, e.g. `election` (`elect.v`, `electoral.a`) or `disease-treatment` (`doctor.n`, `patient.n`). This is the majority case (430 frames) and, alone, mostly just means "a regular content frame" rather than anything more specific.
- **`Cog`** — a "cognitive" frame: a basic image-schematic or relational category (`bounded-region`, `animate-entity`, `causation`, `entity`) used for reasoning about mappings rather than a scenario evoked by its own vocabulary — several `Cog` frames (`entity`, `animate-entity`, `bounded-entity`) have no lexical units at all.
- **`Primary`** — basic and not decomposed further, the frame-level analogue of a metaphor's `Primary` type. Paired with `Cog` it marks foundational image schemas (`motion`, `heat`, `contact`, `entity`); paired with plain `Frame` it marks basic embodied scenarios that are still ordinary lexical frames (`ingestion`, `perception`, `understanding`).
- **`Composed`** — built by combining other frames, the frame-level analogue of a metaphor's `Composed/complex` type. Paired with `Cog` it marks compound schemas (`agentive-causation` = agent + causation, `affected-motion` = motion + causation); paired with plain `Frame` it marks complex real-world scenarios assembled from simpler frames (`election`, `disease-treatment`, `economic-competition`).

Tags combine freely — `heating-fluid` is tagged `[Composed, Frame]` — except that `Primary` and `Composed` never co-occur on the same frame.

## Families

Both metaphors and frames can belong to named thematic groupings, or **families** — `Anger metaphors`, `Emotion frames`, `Governance metaphors`. A metaphor lists its families under a `families` key (`ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER`'s `families` includes `Anger metaphors`); a frame lists its under `frame_families` instead (the `anger` frame's `frame_families` includes `Emotion frames`).

Each family is also defined from the other direction, as its own entry in `metaphor-families.yaml` or `frame-families.yaml` — a `name` plus a `members` list. The `Anger metaphors` family's `members` include `ANGER_IS_HEAT`, `ANGER_IS_FIRE`, `ANGER_IS_INSANITY`, `ANGER_IS_PRESSURE_IN_A_CONTAINER`, and `ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER`. These two directions have to agree — a member listed in a family that doesn't list that family back (or vice versa) is a test failure, not just a warning.

## Relations

Both metaphors and frames carry a flat, alphabetically-sorted `related` list — the names of other entries of the same kind this one is meaningfully connected to. There's no distinction of relation _kind_ recorded: things that used to be separate types (a subcase/hierarchy link, drawing on another entry as a building block, sharing a source or target domain, a dual/opposite framing, and so on) are all folded into one undifferentiated list. Run `uv run pytest` for current coverage counts (the warning-level checks report their counts in the warnings summary).

Relations are recorded one-directionally: an entry's own `related` list only contains what _it_ points to, not what points back at it — e.g. `ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER`'s `related` list includes `ANGER_IS_HEAT`, but `ANGER_IS_HEAT`'s own `related` list doesn't mention it back. The frontend computes that reverse view at build time (`frontend/src/data/index.ts`) so a detail page can show both what an entry points at and what points at it, but the underlying YAML only ever stores the forward direction.

`ANGER_IS_THE_HEAT_OF_FLUID_IN_A_CONTAINER`'s own `related` list is `[ANGER_IS_HEAT, ANGER_IS_PRESSURE_IN_A_CONTAINER, BODY_IS_A_CONTAINER_FOR_EMOTIONS, EMOTIONS_ARE_SUBSTANCES]` — a mix of metaphors it's a more specific version of and metaphors it draws on as building blocks. And `HAPPY_IS_UP`'s `related` list includes `HAPPINESS_IS_VERTICALITY` — the relation-level version of the Type example above.

`heating-fluid` itself has a `related` list of `[containment, heat]` — a more specific version of the general `heat` frame, built using `containment` as a component.

## Naming conventions

- Metaphor names are `SCREAMING_SNAKE_CASE` (`ANGER_IS_HEAT`).
- Frame names are `kebab-case` (`heating-fluid`).
- Role names are `lower_snake_case` (`fluid_heat_level`).
- Family names are sentence case, without a redundant trailing category word like "metaphors"/"frames"/"family" (`Anger`, `Access to education`) — the first word and any ALL-CAPS word (a deliberate acronym or emphasis) are preserved as-is; every other word is lowercased. Don't strip a trailing "family"/"families" if it's actually part of the substantive name rather than the generic grouping suffix (e.g. a family whose topic is literally kinship or household structure) — none of the current families need this caution, but check before renaming one that might.

These were enforced by the original one-time derivation script when the dataset was first built (metaphor names, frame names, role names, and metaphor family names), and by hand afterward for frame families once the build step was retired. Duplicate source-ontology entries that only differed by casing/separators were merged rather than dropped -- e.g. frames `Physical entity` and `physical entity` both become `physical-entity`, and frame families `X-schema family` and `x-schema family` both become `X-schema`, each with their content unioned. Family names originally carried a trailing category word ("Anger metaphors", "Access to education frames") to mirror the metaphor/frame vocabulary; that suffix was dropped later as redundant given the surrounding `metaphor_families`/`frame_families` context, including merging any families that only differed by that suffix (e.g. "Causation" and "Causation frames" became one "Causation" family). The `tests/` suite flags anything that doesn't conform going forward, including in new hand- or agent-added entries.

## Data quality

Some fields are sparse or inconsistent because this is a research database assembled by many contributors over time, not a finished product — run `make test` to see exactly where and how.

## Citing this data

This dataset derives from the MetaNet Metaphor Repository, which in turn builds on Conceptual Metaphor Theory and the Master Metaphor List. If you use this data, please cite the underlying sources:

> Dodge, Ellen, Jisup Hong, and Elise Stickles. 2015. "MetaNet: Deep semantic automatic metaphor analysis." In _Proceedings of the Third Workshop on Metaphor in NLP_, 40–49. Denver, Colorado: Association for Computational Linguistics.

> Lakoff, George, Jane Espenson, and Alan Schwartz. 1991. _Master Metaphor List_, 2nd draft copy. Berkeley: Cognitive Linguistics Group, University of California, Berkeley.

For a broader overview of the MetaNet project, see also:

> David, Oana. 2017. "Computational approaches to metaphor: The case of MetaNet." In _The Cambridge Handbook of Cognitive Linguistics_, edited by Barbara Dancygier, 574–589. Cambridge: Cambridge University Press.
