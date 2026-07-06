.PHONY: lint format test check

lint:
	uv run ruff check .
	uv run ruff format --check .
	uv run ty check

format:
	uv run ruff format .
	uv run ruff check --fix .

test:
	uv run pytest

check: lint test
