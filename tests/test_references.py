from scripts.dataset_lib import find_dangling_frame_refs, find_dangling_related


def test_no_dangling_source_frame(metaphors, frames):
    dangling = find_dangling_frame_refs(metaphors, frames, "source_frame")
    assert not dangling, f"metaphors with a dangling source_frame: {dangling}"


def test_no_dangling_target_frame(metaphors, frames):
    dangling = find_dangling_frame_refs(metaphors, frames, "target_frame")
    assert not dangling, f"metaphors with a dangling target_frame: {dangling}"


def test_no_dangling_metaphor_family_ref(metaphors, metaphor_families):
    family_names = {f["name"] for f in metaphor_families}
    dangling = [
        f"{m['name']} -> {fam}"
        for m in metaphors
        for fam in m.get("families", [])
        if fam not in family_names
    ]
    assert not dangling, f"metaphors referencing an unknown family: {dangling}"


def test_no_dangling_metaphor_relations(metaphors):
    metaphor_names = {m["name"] for m in metaphors}
    dangling = find_dangling_related(metaphors, metaphor_names)
    assert not dangling, f"metaphor relations pointing to an unknown metaphor: {dangling}"


def test_no_dangling_frame_family_ref(frames, frame_families):
    family_names = {f["name"] for f in frame_families}
    dangling = [
        f"{f['name']} -> {fam}"
        for f in frames
        for fam in f.get("frame_families", [])
        if fam not in family_names
    ]
    assert not dangling, f"frames referencing an unknown frame family: {dangling}"


def test_no_dangling_frame_relations(frames):
    frame_names = {f["name"] for f in frames}
    dangling = find_dangling_related(frames, frame_names)
    assert not dangling, f"frame relations pointing to an unknown frame: {dangling}"


def test_metaphor_family_members_backed_by_metaphor(metaphors, metaphor_families):
    by_name = {m["name"]: m for m in metaphors}
    mismatched = [
        f"{fam['name']} -> {member}"
        for fam in metaphor_families
        for member in fam["members"]
        if member not in by_name or fam["name"] not in by_name[member].get("families", [])
    ]
    assert not mismatched, (
        f"metaphor_families members not backed by a matching metaphor.families entry: {mismatched}"
    )


def test_frame_family_members_backed_by_frame(frames, frame_families):
    by_name = {f["name"]: f for f in frames}
    mismatched = [
        f"{fam['name']} -> {member}"
        for fam in frame_families
        for member in fam["members"]
        if member not in by_name or fam["name"] not in by_name[member].get("frame_families", [])
    ]
    assert not mismatched, (
        f"frame_families members not backed by a matching frame.frame_families entry: {mismatched}"
    )
