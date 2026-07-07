# CLAUDE.md

This repo is a curated English export of the MetaNet Metaphor Repository. See README.md for the
data model (metaphors, frames, families, relations).

## Setup

Dependencies are managed with `uv`. Run `uv sync` once to create `.venv` and install both the
runtime and dev dependency groups (`pyyaml`, `rdflib`, `pytest`, `ruff`, `ty`).

## Common commands

- `make test` — run the pytest suite (`tests/`) against `dataset/metaphors.yaml`,
  `dataset/frames.yaml`, `dataset/metaphor-families.yaml`, `dataset/frame-families.yaml`.
- `make lint` — `ruff check`, `ruff format --check`, and `ty check`.
- `make format` — auto-fix formatting and lint issues in place.
- `make check` — lint + test; run this before considering a change to the YAML data or the Python
  scripts done.

All targets shell out through `uv run`, so there's no need to activate the venv manually.

## Test suite conventions

`tests/` replaced the old standalone `validate.py` script. The data-integrity checks it ran are now
individual pytest tests, split by concern:

- `test_uniqueness.py` — no duplicate names within a collection.
- `test_references.py` — no dangling references between metaphors/frames/families, and
  family/member back-references agree in both directions.
- `test_formats.py` — naming convention checks (metaphor `SCREAMING_SNAKE_CASE`, frame
  `kebab-case`, role `snake_case`) and known `type`/`frame_type` values.
- `test_completeness.py` — mapping roles present in their frame's role list, and
  per-field coverage checks (metaphors missing mappings/examples, frames
  missing roles/lexical_units), each reported as its own warning.
- `test_collection_sizes.py` — sanity bounds on collection sizes.
- `conftest.py` — session-scoped fixtures that load each YAML file once (`metaphors`, `frames`,
  `metaphor_families`, `frame_families`, `frame_roles`).

Two severities, preserved from the original script:

- **Errors** (structural problems — dangling refs, duplicates, bad metaphor names, out-of-range
  collection sizes) are plain `assert`s and fail the test.
- **Warnings** (known, long-standing gaps inherited from the source ontology — e.g. mapping roles
  not listed on the frame, sparse frames) use `warnings.warn(..., stacklevel=2)` instead of
  `assert`. These tests always pass; the warning text (with counts and examples) shows up in
  pytest's warnings summary. Run `uv run pytest` directly (not `-q`) if you want to see that
  summary.

When adding a new validation check, decide which bucket it belongs in: if it should ever block a
change to the data, assert; if it's just useful visibility into a known gap, warn.

## Data model changes

`dataset/metaphors.yaml`, `dataset/frames.yaml`, `dataset/metaphor-families.yaml`, and
`dataset/frame-families.yaml` are hand- and agent-edited directly -- there is no build/regenerate
step. The dataset was originally derived, once, from the raw ontology by a one-time script that
isn't part of this repo -- there's nothing to run or regenerate from it.

When adding or editing YAML data, run `make check` and skim the warnings summary for regressions
before committing.
