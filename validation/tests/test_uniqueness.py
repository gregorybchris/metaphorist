from collections import Counter

import pytest

COLLECTIONS = ["metaphors", "frames", "metaphor_families", "frame_families"]


@pytest.mark.parametrize("fixture_name", COLLECTIONS)
def test_no_duplicate_names(request, fixture_name):
    items = request.getfixturevalue(fixture_name)
    names = [item["name"] for item in items]
    dupes = [n for n, c in Counter(names).items() if c > 1]
    assert not dupes, f"duplicate {fixture_name} names: {dupes}"
