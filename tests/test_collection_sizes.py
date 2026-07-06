import pytest

SIZE_BOUNDS = {
    "metaphors": (500, 2000),
    "frames": (500, 2000),
    "metaphor_families": (20, 200),
    "frame_families": (20, 200),
}


@pytest.mark.parametrize("fixture_name,bounds", SIZE_BOUNDS.items())
def test_collection_size_in_range(request, fixture_name, bounds):
    items = request.getfixturevalue(fixture_name)
    low, high = bounds
    assert low <= len(items) <= high, (
        f"{fixture_name} count {len(items)} is outside expected range [{low}, {high}]"
    )
