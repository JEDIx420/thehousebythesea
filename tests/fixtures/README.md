# Historical pixel save fixtures

These four immutable JSON snapshots are copied byte-for-data from `docs/evidence/pixel/live/gameplay-metrics.json` at PR #7 baseline262e536 (committed public browser run19b94d9): walk01-havenport, midsea03-sailing, saltglass04-docking, complete09-credits. They retain historical schema2/worldv1, positions, story and original three settings fields. They are not generated from the new initialState. Invalid-coordinate/version test cases clone and deliberately alter these literals in disposable tests only.
