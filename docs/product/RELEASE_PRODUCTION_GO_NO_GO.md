# Release Production Go / No-Go

| Field | Value |
|-------|--------|
| **Current decision** | **Conditional Go** |
| Codebase RC-ready | **Yes** (`2d2430f` on `main`) |
| Production Go (live traffic) | **No** — until manual gates below pass |
| Date | 2026-05-21 |
| Release commit | `2d2430f` — docs(release): finalize ui release candidate (#137) |
| Cutover docs branch | `release/production-cutover` |

## Decision options

| Option | When to use |
|--------|-------------|
| **Go** | All automated + manual gates PASS; stakeholder sign-off complete |
| **Conditional Go** | Code deploy acceptable; WhatsApp/AI/viewport/real-data manual work outstanding |
| **No-Go** | P0/P1 blocker, failed tests/guards, or rollback in progress |

**Conditional Go → Production Go** requires:

1. `PRODUCTION_ENV_CHECKLIST.md` signed off
2. `PRODUCTION_SMOKE_CHECKLIST.md` manual sections PASS (or scoped N/A with approval)
3. WhatsApp credential + webhook smoke PASS (if WhatsApp in go-live scope)
4. Local AI endpoint smoke PASS (if AI in go-live scope)
5. Viewport QA 1920×1080 and 390×844 PASS
6. Real-data detail QA PASS where data exists
7. Monitoring clean 30 minutes post-deploy

---

## Preconditions (codebase)

| Gate | Status |
|------|--------|
| PR chain #123–#137 on `main` | **Met** |
| `pnpm ui:guard` | **Pass** (cutover branch 2026-05-21) |
| Web/UI typecheck + build | **Pass** |
| `pnpm smoke:navigation` / `smoke:routes` | **Pass** |
| API tests | **Pass** (421/421) |
| Runtime fake provider/output | **None** (guard + scans) |
| P0 RC blocker | **None** |
| P1 RC blocker | **None** (closed #134–#135) |

---

## Automated gates (required for any deploy)

| Gate | Required | Status |
|------|----------|--------|
| CI Quality Gate on deploy SHA | Yes | Verify at deploy time |
| `pnpm ui:guard` | Yes | Pass on `2d2430f` |
| Full API test suite | Yes | 421/421 |
| Navigation + route smoke | Yes | 24 + 37 |

---

## Manual gates (required for Production Go)

### WhatsApp

| Gate | Status |
|------|--------|
| Production credentials in secret manager | ☐ Pending |
| Webhook verify challenge | ☐ Pending |
| Inbound manual smoke | ☐ Pending |
| Outbound test recipient smoke | ☐ Pending |
| No fake connected state | ☐ Code OK — verify in prod |

### Local AI

| Gate | Status |
|------|--------|
| Endpoint reachable from API | ☐ Pending |
| Model available (`ollama pull` or equivalent) | ☐ Pending |
| `GET /health/local-ai` ready | ☐ Pending |
| Review-only UI verified | ☐ Code OK — verify in prod |

### QA / viewport

| Gate | Status |
|------|--------|
| 1920×1080 screenshot pass | ☐ Pending |
| 390×844 screenshot pass | ☐ Pending |
| Real-data detail routes | ☐ Pending |

---

## Blockers

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| PROD-P0 | P0 | Automated test/guard failure on deploy SHA | **None** at doc time |
| PROD-P1 | P1 | Critical route broken in production | **None** at doc time |
| PROD-WA | Conditional | WhatsApp not configured/smoked | **Open** until ops pass |
| PROD-AI | Conditional | Local AI not configured/smoked | **Open** until ops pass |
| PROD-QA | Conditional | Viewport / real-data QA | **Open** until QA pass |

---

## Non-blocking follow-ups

| Item | Notes |
|------|-------|
| P2 legacy `globals.css` color cleanup | Visual debt |
| WhatsApp QR/device pairing UI | Not in readiness scope |
| Backend live report KPI contract | Separate workstream |
| Full design screenshot archive | Optional |
| Stash `wip-mockup-inspiration-before-agent04` | Do not restore on release branches |

---

## Final sign-off

| Role | Checklist | Sign-off | Date |
|------|-----------|----------|------|
| Engineering lead | Automated gates + rollback plan reviewed | ☐ | |
| Ops lead | `PRODUCTION_ENV_CHECKLIST.md` complete | ☐ | |
| Ops / omnichannel | WhatsApp smoke (§4 smoke doc) | ☐ | |
| Platform | Local AI smoke (§5 smoke doc) | ☐ | |
| QA | Viewport + web smoke | ☐ | |
| Security | No secrets in repo; webhook fail-closed | ☐ | |
| Product | Production Go vs Conditional Go decision | ☐ | |

**Signed decision:** ☐ Go  ☐ Conditional Go  ☐ No-Go

**Notes:**

---

## Related documents

- `PRODUCTION_CUTOVER_RUNBOOK.md`
- `PRODUCTION_ENV_CHECKLIST.md`
- `PRODUCTION_SMOKE_CHECKLIST.md`
- `PRODUCTION_ROLLBACK_PLAN.md`
- `RELEASE_UI_RC_GO_NO_GO.md`
- `RELEASE_UI_RC_FINAL_REPORT.md`

## Automated evidence (cutover branch, 2026-05-21)

```
pnpm ui:guard                          → PASS
pnpm --filter @hallederiz/web typecheck → PASS
pnpm --filter @hallederiz/ui typecheck  → PASS
pnpm --filter @hallederiz/ui build        → PASS
pnpm --filter @hallederiz/web build       → PASS
pnpm smoke:navigation                     → PASS (24)
pnpm smoke:routes                         → PASS (37)
pnpm --filter @hallederiz/api test        → PASS (421/421)
```

Safety scans: no runtime PNG import; no AI forbidden copy in scoped paths; no production secret patterns in repo (see cutover report).
