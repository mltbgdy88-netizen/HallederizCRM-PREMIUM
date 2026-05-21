# UI Agent 10 — Release Candidate QA Report

## Branch

| Alan | Değer |
|------|--------|
| Branch | `ui/10-qa-bugfix-or-release-candidate` |
| Base commit | `282289d` — fix(ui): polish visual qa across adopted routes (#133) |
| Commit | `fix(ui): address release candidate qa findings` |
| Commit tipi | UI fix + docs |

## Scope

- Release-candidate UI QA / P0–P1 bugfix only.
- No new route adoption, no backend/API/business logic changes.
- Stash `wip-mockup-inspiration-before-agent04` **not restored**.

## QA method

| Method | Coverage |
|--------|----------|
| Static `rg` scans | PNG import, leakage, AI mutation, fake behavior |
| File/CSS review | Agent 01–09 CSS chain, approval surfaces |
| Build/smoke | typecheck, build, navigation, routes |
| Manual viewport QA | **Not performed** — CSS/build/smoke level only |

## Route groups checked

All Agent 01–09 route groups reviewed at file/smoke level. Detail routes with IDs: **gerçek veriyle yerel QA gerekir**.

## Findings

### P0

- None identified in static scan or automated tests.

### P1 (fixed in this branch)

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| RC-P1-01 | Onaylar API errors | `Worker foundation`, ASCII Turkish, HTTP jargon in default error messages | `approval-client.ts` safe Turkish copy |
| RC-P1-02 | Onaylar detail | User-visible `outboxJobId`, `Outbox job`, English labels | `ApprovalDetailPanel`, `ApprovalOutboxStatusCard`, `ApprovalOperatorSmokePanel` |

### P2/P3 deferred

- `globals.css` legacy purple/navy residue (low visibility).
- Mock data files with ASCII Turkish (not user-visible in normal flows).
- `/unauthorized` dedicated route missing.
- Full 1920×1080 / 390×844 screenshot pass.
- Approval operator smoke panel remaining technical field names in dev-only areas.

## Fixes applied

- `apps/web/src/features/approvals/api/approval-client.ts`
- `apps/web/src/features/approvals/components/ApprovalOutboxStatusCard.tsx`
- `apps/web/src/features/approvals/components/ApprovalDetailPanel.tsx`
- `apps/web/src/features/approvals/components/ApprovalOperatorSmokePanel.tsx`

## Safety scans

| Scan | Result |
|------|--------|
| Runtime PNG import | Clean |
| AI forbidden mutation copy | Clean (product name "Uygulama / servis" OK) |
| Fake behavior runtime copy | Clean |
| User-facing Foundation in TSX | Internal prop names only (`onFoundationAction`) |

## Tests

| Command | Result |
|---------|--------|
| `pnpm --filter @hallederiz/web typecheck` | Pass |
| `pnpm --filter @hallederiz/ui typecheck` | Pass |
| `pnpm --filter @hallederiz/ui build` | Pass |
| `pnpm --filter @hallederiz/web build` | Pass |
| `pnpm smoke:navigation` | Pass (24) |
| `pnpm smoke:routes` | Pass (37) |

## RC readiness decision

**Go** for UI release candidate from automated/static gate perspective, with **manual viewport QA** as post-merge follow-up (not a blocker if P0/P1 absent in manual pass).

## Known gaps

- Manual screenshot QA 1920×1080 and 390×844.
- Detail routes with real entity IDs.
- Legacy color cleanup in `globals.css`.

## Audit gap closure (same branch)

| Area | Status |
|------|--------|
| `/raporlar/[...]` | `ReportDetailPage` — safe empty/chart/table |
| `/whatsapp` | `PageHeader` + provider notice |
| Route `error.tsx` | 9 critical segments |
| `platform-route-meta.ts` | Shell meta/search registry |
| `/unauthorized` | Safe page |
| `pnpm ui:guard` | `scripts/ui-guard.cjs` + CI step |

See `UI_AUDIT_GAP_CLOSURE_REPORT.md`, `UI_HARDENING_CHECKLIST.md`.

## Handoff

- Merge PR for Agent 10 when ready.
- Tag or branch `release/ui-rc-final` for deployment QA.
- Post-RC: P2/P3 polish backlog in product docs.
