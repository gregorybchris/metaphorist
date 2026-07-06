from pathlib import Path

import pytest
import yaml

ROOT = Path(__file__).parent.parent


def _load(name):
    with open(ROOT / name) as f:
        return yaml.safe_load(f)


@pytest.fixture(scope="session")
def metaphors():
    return _load("metaphors.yaml")["metaphors"]


@pytest.fixture(scope="session")
def frames():
    return _load("frames.yaml")["frames"]


@pytest.fixture(scope="session")
def metaphor_families():
    return _load("metaphor-families.yaml")["metaphor_families"]


@pytest.fixture(scope="session")
def frame_families():
    return _load("frame-families.yaml")["frame_families"]


@pytest.fixture(scope="session")
def frame_roles(frames):
    return {f["name"]: {r["name"] for r in f.get("roles", [])} for f in frames}
