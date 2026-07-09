# Metaphorist

Metaphorist is a browsable explorer for a curated, English-language dataset of
conceptual metaphors, built on the MetaNet Metaphor Repository and the Master
Metaphor List.

The dataset formalizes Conceptual Metaphor Theory (Lakoff & Johnson): the idea
that we understand abstract concepts (theories, ideas, time, life) systematically
in terms of more concrete ones (buildings, food, money, journeys), and that this
shows up as everyday patterns in language.

## Repo layout

- `dataset/` — the data itself: four YAML files, the source of truth
- `src/` — the React/Vite frontend that browses the dataset
- `validation/` — a Python test suite that checks `dataset/*.yaml` for structural integrity

## The dataset

Four YAML files in `dataset/`:

| File                     | Top-level key       | Description                                                                                 |
| ------------------------ | ------------------- | ------------------------------------------------------------------------------------------- |
| `metaphors.yaml`         | `metaphors`         | Conceptual metaphors: a mapping from a source frame to a target frame                       |
| `frames.yaml`            | `frames`            | Semantic frames (source or target concepts, e.g. `journey`, `building`) with a set of roles |
| `metaphor-families.yaml` | `metaphor_families` | Named groupings of related metaphors (e.g. "Action is motion")                              |
| `frame-families.yaml`    | `frame_families`    | Named groupings of related frames (e.g. "Access to education")                              |

### Metaphor

```yaml
- name: ABILITY_TO_ACT_IS_ABILITY_TO_MOVE
  type: Entailed # Primary | Composed/complex | Entailed
  source_frame: ability-to-move
  target_frame: ability-to-act
  families:
    - Action is motion
  mappings:
    - source_role: mover
      target_role: actor
  examples:
    - His hands were tied until the board approved the budget.
  related:
    - ACTION_IS_MOTION
```

### Frame

```yaml
- name: ability-to-act
  frame_type:
    - Cog # Frame | Cog | Composed | Primary
  frame_families:
    - Action
  lexical_units:
    - ability.n
    - able.a
  related:
    - action
  roles:
    - name: actor
```

`metaphor-families.yaml` and `frame-families.yaml` are both just `{ name, members: [...] }` lists, where `members` holds the names of the metaphors/frames in that family.

### Sources

This dataset derives from the MetaNet Metaphor Repository and the Master Metaphor List. If you use this data, please cite the underlying sources:

- Lakoff, George, and Mark Johnson. 1980. _Metaphors We Live By_. Chicago: University of Chicago Press.
- Dodge, Ellen, Jisup Hong, and Elise Stickles. 2015. "MetaNet: Deep semantic automatic metaphor analysis." In _Proceedings of the Third Workshop on Metaphor in NLP_, 40–49. Denver, Colorado: Association for Computational Linguistics.
- Lakoff, George, Jane Espenson, and Alan Schwartz. 1991. _Master Metaphor List_, 2nd draft copy. Berkeley: Cognitive Linguistics Group, University of California, Berkeley.
- David, Oana. 2017. "Computational approaches to metaphor: The case of MetaNet." In _The Cambridge Handbook of Cognitive Linguistics_, edited by Barbara Dancygier, 574–589. Cambridge: Cambridge University Press.

## Running the app

Requirements: Node 20+, pnpm.

```bash
pnpm install
pnpm dev       # start the dev server
pnpm build     # type-check and build for production
pnpm preview   # preview a production build
pnpm lint      # oxlint
```

The frontend reads `dataset/*.yaml` at build/dev time through a Vite plugin
(`vite-plugin-dataset.ts`) rather than fetching it at runtime — editing any
dataset file triggers a full reload in dev.

## Validating the dataset

A Python test suite in `validation/` checks `dataset/*.yaml` for structural
integrity: no duplicate names, no dangling frame/family/metaphor references,
name-format conventions, and collection sizes within expected bounds. A couple
of known, long-standing gaps inherited from the source ontology (mapping roles
not declared on their frame, frame roles unused by any mapping) warn instead
of failing the build.

Requirements: Python 3.11+, [uv](https://docs.astral.sh/uv/).

```bash
cd validation
uv run pytest    # or: make test
make lint         # ruff + ty
make check        # lint and test
```
