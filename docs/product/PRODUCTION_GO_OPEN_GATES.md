# Production Go Open Gates

| Field | Value |
|-------|--------|
| **Baseline `main` HEAD** | `ac608c67` |
| **Production decision** | **Conditional Go** |
| **Evidence ledger** | `PRODUCTION_GO_MANUAL_EVIDENCE.md` |
| **Last updated** | 2026-07-08 |

This document lists open gates between **Conditional Go** and **full Production Go**. It does not grant Production Go by itself.

---

## 1. P0 open gates

| id | priority | title | current_status | why_it_matters | required_evidence | suggested_branch | estimated_pr_count | owner_type | merge_blocker |
|----|----------|-------|----------------|----------------|-------------------|------------------|--------------------|------------|---------------|
| GATE-P0-VP | P0 | Manual viewport QA | **PASS** | List pages must meet density/shell rules at desktop and mobile; regressions block operator trust | [`VIEWPORT_QA_EVIDENCE.md`](./VIEWPORT_QA_EVIDENCE.md) — full re-run 2026-07-04 @ `6ef1645c`; 7/7 desktop + 7/7 mobile blocker routes PASS; VP-DESK-001/002/VP-MOB-001 closed | `docs/p0-viewport-qa-rerun` | 1 | mixed | **NO** |
| GATE-P0-WA | P0 | WhatsApp staging/prod credential + webhook smoke | **BLOCKED** | Omnichannel outbound/inbound requires fail-closed webhook and real credentials | [`WHATSAPP_WEBHOOK_EVIDENCE.md`](./WHATSAPP_WEBHOOK_EVIDENCE.md) §10 — 2026-07-08 final live #201: ops credentials **MISSING** (not loadable); boot **FAIL**; verify wrong/missing **PASS**; correct verify / signed POST / inbound / approval / outbound **NOT_RUN** | `docs/p0-whatsapp-final-live-verification` | 1 | mixed | **YES** |
| GATE-P0-AI | P0 | Local AI `ready=true` or explicit production degraded policy | **PASS** | AI is proposal-only but channel health must be honest in production | [`LOCAL_AI_READY_EVIDENCE.md`](./LOCAL_AI_READY_EVIDENCE.md) §8 — 2026-07-08 rerun #2: Docker+Postgres PASS; `local-ai:health` PASS; canonical `production-go:local` PASS without waiver; API `ready=true` | closed (issue #197) | 1 | mixed | **NO** |

---

## 2. P1 open gates

| id | priority | title | current_status | why_it_matters | required_evidence | suggested_branch | estimated_pr_count | owner_type | merge_blocker |
|----|----------|-------|----------------|----------------|-------------------|------------------|--------------------|------------|---------------|
| GATE-P1-PG-CI | P1 | `production-go:local` CI workflow integration | **NOT_RUN** | Prevents regression of Sprint 9 local bundle on every main merge | GitHub Actions job green on PR; documented env secrets for CI Postgres service | `feature/ci-production-go-local` | 1 | code | NO |
| GATE-P1-TENANT-MOD | P1 | Tenant module metadata from Postgres | **OPEN** | Operator tenant `modules` currently plan-derived shortcut | Migration + API reads real module flags; operator UI matches | `feature/operator-tenant-modules-db` | 1 | code | NO |
| GATE-P1-ARCHIVE-API | P1 | Archive read API (live data) | **OPEN** | Archive still demo-heavy in some paths per integration matrix | Tenant-scoped read routes; SDK wiring; smoke | `feature/archive-read-api` | 1–2 | code | NO |
| GATE-P1-CSP | P1 | CSP reporting implementation | **OPEN** | Security visibility for production web surface | Report endpoint + doc; no unsafe relaxations | `hardening/csp-reporting` | 1 | code | NO |
| GATE-P1-ENV-POLLUTION | P1 | DATABASE_URL pollution hardening in test docs/scripts | **OPEN** | Shell env leaks cause false test failures (401 vs 503, cross-tenant tests) | Documented clean-env wrapper; optional test harness guard | `fix/test-env-pollution-docs` | 1 | code | NO |

---

## 3. P2 open gates

| id | priority | title | current_status | why_it_matters | required_evidence | suggested_branch | estimated_pr_count | owner_type | merge_blocker |
|----|----------|-------|----------------|----------------|-------------------|------------------|--------------------|------------|---------------|
| GATE-P2-E2E-VP | P2 | Playwright viewport E2E | **NOT_RUN** | Automates §4 manual viewport checks | E2E job on 1920×1080 + 390×844 for critical routes | `test/e2e-viewport-gates` | 1–2 | code | NO |
| GATE-P2-DEPENDABOT | P2 | Dependabot Actions maintenance | **OPEN** | Keeps CI actions current | Dependabot PRs reviewed and merged | — | ongoing | ops | NO |
| GATE-P2-NODE-CI | P2 | GitHub Actions Node deprecation maintenance | **OPEN** | Node 20 deprecation warnings in workflows | Workflow matrix updated; CI green | `chore/ci-node-version` | 1 | code | NO |

---

## 4. Recommended next sequence

1. ~~**Manual viewport QA evidence**~~ — **PASS** 2026-07-04 ([`VIEWPORT_QA_EVIDENCE.md`](./VIEWPORT_QA_EVIDENCE.md)).
2. **WhatsApp staging/prod verification** — **BLOCKED** ([`WHATSAPP_WEBHOOK_EVIDENCE.md`](./WHATSAPP_WEBHOOK_EVIDENCE.md) §10): ops secrets not loadable; final live smoke **NOT_RUN**; ops must populate secret manager / `.env.local` then re-run.
3. ~~**Local AI `ready=true` stabilization**~~ — **PASS** 2026-07-08 ([`LOCAL_AI_READY_EVIDENCE.md`](./LOCAL_AI_READY_EVIDENCE.md) §8).
4. **`production-go:local` CI workflow** — optional regression gate on main.
5. **P1 hardening backlog** — tenant modules, archive API, CSP reporting, test env docs.

---

## 5. Merge policy

| Rule | Detail |
|------|--------|
| This docs PR | Does **not** grant Production Go |
| Evidence format | Established by `PRODUCTION_GO_MANUAL_EVIDENCE.md` |
| Full Production Go | Requires **all P0 gates PASS** + stakeholder sign-off in `RELEASE_PRODUCTION_GO_NO_GO.md` |
| Conditional Go | Current state — deploy acceptable for controlled pilot; not full live-traffic Production Go |

---

## Related documents

- `docs/product/PRODUCTION_GO_MANUAL_EVIDENCE.md`
- `docs/product/VIEWPORT_QA_EVIDENCE.md`
- `docs/product/WHATSAPP_WEBHOOK_EVIDENCE.md`
- `docs/product/RELEASE_PRODUCTION_GO_NO_GO.md`
- `docs/product/PRODUCTION_ENV_CHECKLIST.md`
- `docs/product/PRODUCTION_SMOKE_CHECKLIST.md`
- `docs/product/WHATSAPP_READINESS.md`
- `docs/product/LOCAL_AI_READY_EVIDENCE.md`
- `docs/product/LOCAL_AI_READINESS.md`
