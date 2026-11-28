# Historical pixel save fixtures

These four immutable JSON snapshots are copied byte-for-data from `docs/evidence/pixel/live/gameplay-metrics.json` at PR #7 baseline262e536 (committed public browser run19b94d9): walk01-havenport, midsea03-sailing, saltglass04-docking, complete09-credits. They retain historical schema2/worldv1, positions, story and original three settings fields. They are not generated from the new initialState. Invalid-coordinate/version test cases clone and deliberately alter these literals in disposable tests only.


`pixel-v1-art/` contains the exact three public atlas/metadata files from immutable90693e3 (P1 game262e536), original project MIT. The warm-cache regression serves these with the actual Pages600s cache policy, proves the canonical old280-frame metadata remains cached, then upgrades the server and loads current versioned art plus a real completed v1 save. It uses HTTP caching, not Playwright request routing (which would disable that cache), and real walking/dialogue afterwards.
