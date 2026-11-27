# Agent coordination handbook

This is a repo-driven agent workflow: small jobs, explicit ownership, objective acceptance, independent review and transparent project status. No special agent framework or paid orchestration tool is required.

## Roles
**Coordinator (lead agent):** reads README / AGENTS / roadmap; inspects repo and current PRs; breaks authorised stage into tasks; assigns independent ownership by subsystem; maintains docs/progress.md and docs/decisions.md; integrates; verifies stage gate; briefs creator.

**Implementer:** owns the requested feature and relevant tests; changes no unrelated systems; builds a working slice; documents exact commands, screenshots and remaining defects; asks for review.

**Independent reviewer:** has no ownership of implementation commits being reviewed; checks code, gameplay, licences and acceptance separately in batches of five changed files or one coherent gameplay slice; reproduces issues with evidence; sends corrective tasks back to implementer; confirms fixes on the new commit.

**Visual / playtest reviewer (if a third agent is available):** plays in a real browser, compares with visual reference and player flow, records human-facing defects and camera/boat feel. If one agent is available, it must explicitly distinguish self-review from an independent review rather than claiming another agent checked it.

## Ground rules for parallel work
- Split by non-overlapping ownership: e.g. environment/terrain, controller/boat, gameplay/story state, UI/save/testing. Coordinator defines type contracts **before** parallelising.
- Prefer quick sequential integration for tightly coupled boarding, terrain collisions and quest state. Avoid four agents simultaneously editing the shared render loop or package file.
- Use dedicated branches or clearly assigned file scopes, merge integration only after tests. Never overwrite another agent's work or force push an unrelated branch.
- An agent cannot approve its own disputed findings. Reviewer defects stay open until a test or browser reproduction demonstrates the fix.
- Keep context small: root AGENTS.md + 1–3 relevant docs + one stage prompt. Summarise state in a PR and docs/progress.md, not chat history alone.

## Coordinator stage cycle
1. **Preflight:** fetch latest main/PR state, read instructions and existing implementation; list real blockers. Do not assume a fresh repo has app code.
2. **Plan:** choose the next authorised stage, divide into bounded deliverables (3–6 work packages) with dependencies, file owners and acceptance criteria.
3. **Implement:** smallest playable increments, no speculative downstream features. Record decisions when a test changes a planned technology.
4. **Local validation:** lockfile install, build, typecheck, tests, and real browser; fix issues as they arise.
5. **Review round:** separate reviewer examines at most five changed files or one logical subsystem per batch, logs P0–P3 findings with reproduction, then implementer patches. Repeat until blocking findings are resolved.
6. **Integrate & deploy:** consolidate a PR, include test evidence and screenshots, ensure GitHub Pages path is valid and deployment is confirmed if possible.
7. **Creator gate:** ask for hands-on review, apply requested changes, and **freeze next stage until explicit approval**.

## PR / issue handoff contract
Every task or PR should record: stage ID, owner, dependency, exact scope, target files/interfaces, acceptance checks, verification commands and artifacts, changed assumptions, unresolved risks and next action. Use the pull request template. For a decision with broad impact, append an ADR to docs/decisions.md. Do not rewrite history to remove mistakes; show what was tried and why.

## Stage 0 suggested work packages
A. Scaffold package + TypeScript/Vite + Pages base and workflow, local test scripts.
B. Terrain technology spike: live finite runtime vs authored/exported GLB, shore collisions, water rendering, asset/path/cost measurements; record decision.
C. Player + small boat interaction and safe boarding/docking in one scene.
D. Data/state/persistence skeleton with migration, quest and economy unit tests.
E. Independent browser/deployment and licence review.

## Stage 1 suggested work packages
A. Havenport and Saltglass authored and walkable; terrain, shoreline, NPC staging and paths.
B. Walking, boat, docking, camera and travel polish; integrate with real map.
C. Fishing, delivery, shop and home-fund UI; protect against repeated payouts.
D. Mira scene, optional outing, story prologue, journal/map, ambience and credits.
E. Autosave/resume, test matrix, Playwright flows, screenshots/performance, Pages verification and independent review.

## Communication
Short reports only when something actionable is known: completed, tested, blocker, next. Every technical claim includes a commit, test or screenshot. Avoid "100% completed" unless acceptance checklist is demonstrably green.

## Creator decision point
At the end of Stage 1, coordinator reports **WAITING FOR CREATOR APPROVAL**, provides actual demo/PR and a concise list of issues. Continue iterating Stage 1 based on feedback. Never automatically launch Stage 2 just because all agent tests passed.
