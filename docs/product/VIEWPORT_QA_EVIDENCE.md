# Viewport QA Evidence

| Field | Value |
|-------|--------|
| **Gate** | Production Go P0 — `GATE-P0-VP` |
| **Baseline `main` HEAD** | `ab2af61e` |
| **Evidence pack branch** | `docs/p0-viewport-qa-evidence` |
| **Last updated** | 2026-07-01 |
| **Viewport gate status** | **NOT_RUN** |

---

## 1. Scope

### Production Go P0 manual gate

Viewport QA is a **merge blocker** for full Production Go (`PRODUCTION_GO_OPEN_GATES.md` → `GATE-P0-VP`). This document is the canonical evidence ledger for visual/layout checks at fixed viewports.

### Viewports (required)

| id | Size | Use |
|----|------|-----|
| `VP-DESKTOP` | **1920×1080** | Desktop operator cockpit |
| `VP-MOBILE` | **390×844** | Mobile field / approval access |

### Routes (critical)

| Route | Desktop blocker | Mobile blocker |
|-------|-----------------|----------------|
| `/dashboard` | YES | YES |
| `/hizli-islem/satis-masasi` | YES | YES |
| `/onaylar` | YES | YES |
| `/teklifler` | YES | YES |
| `/operator` | YES | YES |
| `/operator/announcement-videos` | YES | NO |
| `/operator/tenants` | YES | NO |

### Evidence policy

A row may be marked **PASS** only when all of the following are recorded:

1. **Date** (UTC or local with timezone noted)
2. **Operator** (human name or approved QA account)
3. **Viewport** (exact pixels)
4. **Route** (path)
5. **Result** (PASS / FAIL)
6. **Evidence** — operator session note, external screenshot reference, or CDP inspection log (screenshots **not** committed to repo unless explicitly approved)
7. **Observation notes** — scroll, row count, panel overflow, CTA visibility

**FAIL** or **NOT_RUN** on any `blocker=YES` route blocks `viewport_gate_status=PASS`.

---

## 2. Environment

| Field | Value |
|-------|--------|
| **date** | 2026-07-01 |
| **operator** | *Pending — human QA sign-off* |
| **branch** | `docs/p0-viewport-qa-evidence` |
| **HEAD** | `ab2af61e` |
| **data mode** | *To be set at QA time* — recommend demo (`NEXT_PUBLIC_USE_DEMO_DATA=true`) for layout; live (`false`) for integration spot-check |
| **API mode** | *To be set at QA time* — recommend `http://127.0.0.1:4000` when live |
| **browser** | *To be recorded* — e.g. Chrome 124+ |
| **viewport** | 1920×1080 and 390×844 (separate runs) |
| **notes** | Web UI was **not running** on `http://127.0.0.1:3000` during evidence pack creation; visual inspection deferred to operator session. |

### Recommended pre-QA commands

```powershell
# Terminal 1 — API (postgres or demo per matrix)
pnpm --filter @hallederiz/api dev

# Terminal 2 — Web
pnpm --filter @hallederiz/web dev
```

---

## 3. Desktop 1920×1080 results

| route | expected | result | blocker | evidence | notes |
|-------|----------|--------|---------|----------|-------|
| `/dashboard` | Shell loads; AI column dashboard-only; no body scroll; ≥5 rows where list applies | **NOT_RUN** | YES | — | |
| `/hizli-islem/satis-masasi` | Workbench usable; customer catalog; no horizontal scroll | **NOT_RUN** | YES | — | |
| `/onaylar` | Command desk; ≥5 list rows without page scroll; action column visible | **NOT_RUN** | YES | — | |
| `/teklifler` | List density; first row selected; right panel populated | **NOT_RUN** | YES | — | |
| `/operator` | Operator shell; platform context readable | **NOT_RUN** | YES | — | |
| `/operator/announcement-videos` | CRUD list; no clipped filters | **NOT_RUN** | YES | — | |
| `/operator/tenants` | Tenant directory; plan/status columns visible | **NOT_RUN** | YES | — | |

### Desktop QA criteria checklist (per route)

- [ ] Page loads without error boundary
- [ ] Global shell intact (sidebar, header)
- [ ] Main content visible
- [ ] No unintended horizontal scroll (`document.documentElement.scrollWidth <= clientWidth`)
- [ ] Primary CTAs reachable
- [ ] No critical text/button clipping
- [ ] List routes: **≥5 rows visible** without scrolling list body (where applicable)
- [ ] Right/detail panel does not overflow page
- [ ] No wrong demo fallback in live mode (if live run)

---

## 4. Mobile 390×844 results

| route | expected | result | blocker | evidence | notes |
|-------|----------|--------|---------|----------|-------|
| `/dashboard` | Drawer nav; no horizontal scroll | **NOT_RUN** | YES | — | |
| `/hizli-islem/satis-masasi` | Core actions reachable | **NOT_RUN** | YES | — | |
| `/onaylar` | Approve/reject actions visible | **NOT_RUN** | YES | — | |
| `/teklifler` | List + detail accessible | **NOT_RUN** | YES | — | |
| `/operator` | Operator entry usable | **NOT_RUN** | YES | — | |
| `/operator/announcement-videos` | List readable | **NOT_RUN** | NO | — | |
| `/operator/tenants` | List readable | **NOT_RUN** | NO | — | |

### Mobile QA criteria checklist (per route)

- [ ] Navigation drawer opens/closes
- [ ] Primary actions reachable without horizontal scroll
- [ ] Table/list overflow controlled
- [ ] Approval actions visible on `/onaylar`

---

## 5. Findings

| id | route | viewport | severity | issue | reproduction | recommended next action | fix PR required |
|----|-------|----------|----------|-------|--------------|-------------------------|-----------------|
| VP-ENV-001 | *all* | *all* | **P0** | Visual QA not executed — web dev server unreachable at evidence pack creation | `http://127.0.0.1:3000` connection refused on 2026-07-01 | Operator starts web+API; completes §3–§4 tables; updates gate status | **NO** (process) |
| — | — | — | — | *No UI defects logged yet* | — | Complete manual pass; log FAIL rows here with severity | Per finding |

---

## 6. Summary

| Metric | Count |
|--------|-------|
| **desktop_pass_count** | 0 |
| **desktop_fail_count** | 0 |
| **desktop_not_run_count** | 7 |
| **mobile_pass_count** | 0 |
| **mobile_fail_count** | 0 |
| **mobile_not_run_count** | 7 |
| **production_go_impact** | Viewport P0 gate remains open — **Conditional Go** unchanged |
| **viewport_gate_status** | **NOT_RUN** |

### Status decision rules (applied)

| Condition | Status |
|-----------|--------|
| All `blocker=YES` routes PASS | PASS |
| Any P0/P1 UI blocker finding | BLOCKED |
| Some low-priority routes NOT_RUN only | PARTIAL |
| **No visual inspection performed** | **NOT_RUN** ← current |

---

## Related documents

- `docs/product/PRODUCTION_GO_MANUAL_EVIDENCE.md` §4
- `docs/product/PRODUCTION_GO_OPEN_GATES.md` → `GATE-P0-VP`
- `docs/product/PRODUCTION_SMOKE_CHECKLIST.md` §3 (manual web smoke)
- `.cursor/rules/ui-designer-rules.mdc` (≥5 rows at 1920×1080)
