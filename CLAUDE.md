# CLAUDE.md

A curated, English-only export of the MetaNet Metaphor Repository (UC Berkeley ICSI) — conceptual metaphors (`ANGER_IS_HEAT`) as mappings between semantic frames (`heating-fluid` → `anger`), based on Lakoff & Johnson's Conceptual Metaphor Theory. See README.md for the full data model writeup (frames, metaphors, mappings, families, relations, x-schema roles, naming conventions).

## Layout

This repo has three independent parts that all read the same `dataset/`:

- **`dataset/`** — the data itself: `metaphors.yaml`, `frames.yaml`, `metaphor-families.yaml`, `frame-families.yaml`. Hand- and agent-edited directly; no build step, no generator script in this repo.
- **`src/`, `index.html`, `vite.config.ts`, `vite-plugin-*.ts`** (repo root) — the React/Vite frontend that browses the dataset. `vite-plugin-dataset.ts` reads the four `dataset/*.yaml` files at build/dev time and exposes them as the `virtual:metaphor-dataset` module (`src/data/index.ts` imports it) — the browser never parses YAML. `vite-plugin-curation.ts` backs a dev-only `/__curation` endpoint that reads/writes `curation/favorites.json` for the hidden curation UI (`?curate=true`, `src/pages/CuratePage.tsx`).
- **`validation/`** — a separate Python project (own `pyproject.toml`, `uv.lock`, `.venv`, `Makefile`) that validates the dataset: `validation/tests/` (pytest suite — structural/format/reference checks against `dataset/*.yaml`) and `validation/scripts/dataset_lib.py` (shared validation logic the tests import).

Frontend files live at the repo root (not under `frontend/`) and validation files live under `validation/` (not at the root) — this is intentional, not a leftover from a move. Path logic in `vite-plugin-*.ts` is relative to the repo root; path logic in `validation/**/*.py` (`Path(__file__).parent...`) needs to walk up far enough to reach the repo root from inside `validation/`, one level deeper than it looks.

Other top-level dirs: `curation/` (favorites data for the curation UI), `planning/` (scratch notes, gitignored contents).

## Commands

Frontend (run from repo root):
- `pnpm dev` — dev server
- `pnpm build` — typecheck + production build
- `pnpm lint` — oxlint

Validation (run from `validation/`, or `make -C validation <target>` from root):
- `make test` — `uv run pytest`
- `make check` — lint (ruff + ty) and test
- `make format` — `uv run ruff format` + `ruff check --fix`

## Conventions

- Metaphor names: `SCREAMING_SNAKE_CASE` (`ANGER_IS_HEAT`).
- Frame names: `kebab-case` (`heating-fluid`).
- Role names: `lower_snake_case` (`fluid_heat_level`).
- Family names: sentence case, no redundant trailing "metaphors"/"frames"/"family" (`Anger`, not `Anger metaphors`).

The `validation/tests/` suite enforces these plus structural completeness (dangling frame refs, mapping role mismatches, family back-reference symmetry) — run it after any dataset edit.
