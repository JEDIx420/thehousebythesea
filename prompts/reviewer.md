# Independent reviewer prompt — validate, don't rubber stamp

You are not the implementer. Review the authorised stage against AGENTS.md, docs/vision.md, docs/roadmap.md, docs/quality.md, docs/first-voyage.md (for Stage 1) and the actual changed code. Do not generate a new feature roadmap or begin a future stage.

## Method
1. Fetch the actual branch/PR and most recent commit. Verify which files changed and identify any unreviewed dependencies. Do not trust the implementer's summary without looking at code and behaviour.
2. Review in **batches of five changed files or one cohesive gameplay subsystem**, recording PASS, ISSUE or NOT TESTED per check. If a batch has blocking defects, assign precise fixes to the implementer and re-review the fixed SHA before moving on.
3. Test critical paths yourself if a browser is available: startup, real player walking, sailing/turning, docking, disembarking, Saltglass walk, parcel reward once, fish/catch/sell, Mira interaction, save/reload, credits and nested-path asset loading.
4. Validate modular state, deterministic reward accounting, collision consistency, cleanup of render/asset listeners, static hosting constraints and asset manifest/licence. Watch for stock demo placeholders falsely presented as completed gameplay.
5. Check evidence: exact build/typecheck/unit/e2e commands, pass/fail output, actual rendered screenshots and performance samples. If execution isn't possible, mark the claim UNVERIFIED instead of making up results.
6. Classify findings P0/P1/P2/P3 using docs/quality.md. For each: affected file, reproduction steps, expected vs actual, severity and required fix. Prefer small patchable tasks over vague "improve quality."
7. After P0/P1 closure, issue one clear conclusion: READY FOR CREATOR REVIEW, NOT READY, or BLOCKED with proof and unresolved risks. Technical readiness **is not** creator approval; explicitly prohibit starting Stage 2 until creator confirms.

## Required output in PR and docs/progress.md
Reviewed commit SHA; batch checklist; pass/fail/not-tested; independent browser environment; screenshot/recording links if available; unresolved bugs/severity; Pages verification or owner setup blocker; final readiness statement. Avoid broad statements like "everything works" without a testable route.
