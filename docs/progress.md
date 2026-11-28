# Execution status

## Current pixel reboot — 2026-11-28

Working branch `feat/pixel-first-voyage`, separate worktree and future implementation PR based on plan PR #6. Main and earlier3D implementation branches remain untouched. **P0 ACTIVE; P1 NOT YET COMPLETE. No creator approval. No P2 expansion.**

| Task | Owner | Acceptance / observed state |
| --- | --- | --- |
| P0a engine / projection | Coordinator | Phaser3.90 WebGL production spike works;4 unit tests and typecheck/build pass. D-008 records tested versions. |
| P0b art golden sample | Coordinator + independent reviewer | v1 rejected; v2 independently accepted for checkpoint direction; final v3 actual-engine screenshot/raw metrics recorded, final lamp placement independently closed; golden sample GO for First Voyage production. No town mass production yet. |
| P0c asset factory | Coordinator + tool auditor |199 original/credited frames, four facings, distinct animation, shared foot anchors, padded atlas, paginated source contacts. Deterministic asset audit passes; actual PixelFX subset runs offline. |
| P0d state / save | Coordinator + preservation auditor | Existing domain/economy/IDs audited; pixel-world migration must preserve legacy progress without overwriting old saves. Implementation follows golden sample. |
| P1 integrated voyage | Coordinator | Pending: two authored islands, complete walk/sail/dock/work/fish/Mira/save route and regression proof. |
| Browser / deployment / approval | Independent reviewer + coordinator | Local sample4190 works; no public pixel game claimed. Pages branch policy and full-site artifact require explicit configuration before verified publishing. |

Current proof: [golden-v3](evidence/pixel/golden-v3.png), [raw metrics](evidence/pixel/golden-v3.json), [independent review](review-pixel.md), [tool audit](pixel-tool-audit.md), [preservation/deployment audit](pixel-preservation-audit.md). Renderer sample raw render-callback p50/p95≈16.70/16.80ms on Chrome158, not a complete-session performance claim. `npm run assets:build`, `npm run assets:check`, `npm test`(4), `npm run build` pass. Full-game browser and live-deployment tests have **not** run yet. Standard Phaser chunk-size warning disclosed.

The older planning status below is retained as history. Its3D rendering direction is superseded by PR #6. Stop after the complete First Voyage for creator hands-on approval.

---

**Last updated: 2026-11-27.** Planning playbook initialised in GitHub. **No game implementation, demo, automated tests or GitHub Pages deployment are claimed completed.**

## Stage board

| Stage | State | Gate | Evidence |
| --- | --- | --- | --- |
| 0 — Foundation / terrain spike | NOT STARTED | Technical review | None yet |
| 1 — First Voyage | NOT STARTED | **Creator hands-on approval required** | None yet |
| 2 — Neighbourhood & livelihoods | LOCKED | Stage 1 approved | — |
| 3 — Full archipelago | LOCKED | Stage 2 approved | — |
| 4 — Love & home | LOCKED | Stage 3 approved | — |
| 5 — Polish / release | LOCKED | Stage 4 approved | — |

## GitHub stage tickets

- [#1 — Stage 0: foundation and terrain spike](https://github.com/JEDIx420/thehousebythesea/issues/1)
- [#2 — Stage 1: the First Voyage approval build](https://github.com/JEDIx420/thehousebythesea/issues/2)

## Next authorised work
Follow prompts/00-foundation.md, then prompts/01-first-voyage.md. Validate locally and in browser, open PR(s), get independent review and verify actual Pages deployment. Collect the creator's feedback, then update the stage state. **Do not start Stage 2 on agent initiative.**

## Progress update template
### YYYY-MM-DD — Stage N — status
- Delivered (with commit/PR links):
- Player-visible behaviour actually verified:
- Test commands / outcomes:
- Browser proof / environment:
- Pages deployment (confirmed link or blocker):
- Known defects/severity:
- Review batches and unresolved findings:
- Decisions updated:
- Approval required:
- Next authorised action:

## Deferred backlog
Later stages: remaining ten islands, richer regional activities, three land plots, staged cottage construction, deeper relationship scenes, festival content, mobile controls and release polish. Do not substitute this backlog for current Stage 1 acceptance.
