# Production Go Manual Evidence

| Field | Value |
|-------|--------|
| **Document role** | Manual evidence ledger and checklist template |
| **Baseline `main` HEAD** | `7912bfb6` |
| **Production decision** | **Conditional Go** (not full Production Go) |
| **Last automated gate run** | 2026-07-01 (local) |
| **Related** | `RELEASE_PRODUCTION_GO_NO_GO.md`, `PRODUCTION_GO_OPEN_GATES.md` |

---

## 1. Current baseline

| Item | Status |
|------|--------|
| `main` HEAD | `47c6d483` |
| Working tree | Clean (post PR #186 artifact hygiene) |
| Mod B technical sign-off | Complete (`MOD_B_SIGNOFF.md`) |
| Sprint 9 local prep | Complete (`SPRINT_9_PRODUCTION_GO_PREP.md`) |
| Artifact hygiene | PR [#186](https://github.com/mltbgdy88-netizen/HallederizCRM-PREMIUM/pull/186) merged — narrow `.gitignore` for `packages/domain/src/**` and `packages/types/src/**` emit artifacts |
| Production state | **Conditional Go** — automated gates strong; manual P0 gates open |

---

## 2. Automated gate evidence

Recorded on `main` @ `22d4ce07`, 2026-07-01 (local operator session).

| Gate | Result | Evidence |
|------|--------|----------|
| `pnpm smoke:navigation` | **PASS** | 24 critical link checks |
| `pnpm smoke:routes` | **PASS** | 37 route files + demo ID checks |
| `pnpm test` | **PASS** | 475 total / **474 pass** / 0 fail / **1 skipped** (clean env) |
| `pnpm lint` | **PASS** | 13/13 packages |
| `pnpm security:audit` | **PASS** | No known vulnerabilities (high threshold) |
| `pnpm security:audit:report` | **PASS** | No known vulnerabilities (moderate threshold) |
| `pnpm production-go:local` | **PASS** | See §3 |

**Note:** `pnpm test` fails when shell env is polluted (`DATABASE_URL`, `PERSISTENCE_MODE`, `AUTH_SEED_*`, `AUTH_SESSION_SECRET`). Clear env before API tests. See `docs/development/local-worktree-hygiene.md`.

---

## 3. Production Go local evidence

Command:

```powershell
$env:DATABASE_URL="postgres://hallederiz:hallederiz_dev@127.0.0.1:5432/hallederizcrm"
$env:AUTH_SEED_ADMIN_EMAIL="admin@hallederiz.local"
$env:AUTH_SEED_ADMIN_PASSWORD="change-me-local-only"
$env:AUTH_SESSION_SECRET="local-staging-chain-secret-min-32-chars"
$env:PERSISTENCE_MODE="postgres"
$env:PRODUCTION_GO_ALLOW_DEGRADED_AI="1"
pnpm production-go:local
```

| Step | Result | Detail |
|------|--------|--------|
| `smoke:navigation` (bundle) | PASS | 24 checks |
| `ci:postgres-migration-smoke` | PASS | 17 migrations; idempotent second apply |
| `staging:local-chain` | PASS | Quick-op offer → approval → Postgres offer record |
| Offer count change | **13 → 14** | Observed 2026-07-01 local run |
| `local-ai:smoke` | degraded | `ollama_available_service_missing` |
| API `GET /health/local-ai` | **disabled** | `ready=false`, `configured=false` |
| Degraded acceptance | **YES** | `PRODUCTION_GO_ALLOW_DEGRADED_AI=1` (local/staging only) |

### What degraded means

- **Ollama** (`http://127.0.0.1:11434`) is healthy with models available.
- **`local-ai-service`** (`http://127.0.0.1:8008`) is not running — fetch fails.
- API reports Local AI as **disabled**, not ready for live proposal/channel flows.

### Why degraded is not production-ready

- Production Go requires honest health: dashboard/AI channel must not show disabled while claiming readiness.
- `PRODUCTION_GO_ALLOW_DEGRADED_AI=1` is an explicit **local/staging waiver** in `scripts/production-go/local-bundle.cjs`; it must not be interpreted as production sign-off.
- Full Production Go needs `local-ai-service` up and API `/health/local-ai` with `ready=true` (or documented scoped N/A with product approval).

---

## 4. Manual viewport QA evidence

| Field | Value |
|-------|--------|
| **Status** | **PASS** |
| **Canonical ledger** | [`VIEWPORT_QA_EVIDENCE.md`](./VIEWPORT_QA_EVIDENCE.md) |
| **Last run** | 2026-07-04 |
| **Operator** | Cursor Agent QA (`admin@hallederiz.local`) |
| **HEAD at run** | `6ef1645c` |
| **Blocker findings** | `VP-DESK-001`, `VP-DESK-002`, `VP-MOB-001` — **CLOSED** (PR #190 alias fix + re-run PASS) |

Live session: web `http://127.0.0.1:3000`, API `http://127.0.0.1:4000`, live mode (`NEXT_PUBLIC_USE_DEMO_DATA=false`). Playwright Chromium headless; no screenshots committed.

### Desktop — 1920×1080

| Route | Viewport | Expected evidence | Status | Blocker | Notes |
|-------|----------|-------------------|--------|---------|-------|
| `/dashboard` | 1920×1080 | Shell loads; AI column dashboard-only; no body scroll | **PASS** | YES | Shell OK; no h-scroll |
| `/hizli-islem/satis-masasi` | 1920×1080 | Workbench usable; customer catalog loads in live mode | **PASS** | YES | Cari alanı + aksiyonlar görünür |
| `/onaylar` | 1920×1080 | Command desk; ≥5 list rows or valid empty state | **PASS** | YES | Komut masası / empty state OK |
| `/teklifler` | 1920×1080 | List density; first row selected; right panel populated | **PASS** | YES | Liste + sağ panel OK |
| `/operator` | 1920×1080 | Operator shell; platform context visible | **PASS** | YES | SaaS konsol OK |
| `/operator/announcement-videos` | 1920×1080 | Alias redirect; CRUD list | **PASS** | YES | Redirect → duyuru-videolari |
| `/operator/tenants` | 1920×1080 | Alias redirect; tenant directory | **PASS** | YES | Redirect → kiracilar |

### Mobile — 390×844

| Route | Viewport | Expected evidence | Status | Blocker | Notes |
|-------|----------|-------------------|--------|---------|-------|
| `/dashboard` | 390×844 | Drawer nav; no horizontal scroll | **PASS** | YES | Menü OK |
| `/hizli-islem/satis-masasi` | 390×844 | Core actions reachable | **PASS** | YES | Cari alanı erişilebilir |
| `/onaylar` | 390×844 | Approve/reject reachable | **PASS** | YES | Onay masası mobilde OK |
| `/teklifler` | 390×844 | List + detail accessible | **PASS** | YES | Liste OK; h-scroll yok |
| `/operator` | 390×844 | Operator entry usable | **PASS** | YES | Konsol mobilde OK |
| `/operator/announcement-videos` | 390×844 | Alias redirect; list readable | **PASS** | NO | Redirect → duyuru-videolari |
| `/operator/tenants` | 390×844 | Alias redirect; list readable | **PASS** | NO | Redirect → kiracilar |

---

## 5. WhatsApp production credential evidence

Credentials must live in secret manager only — **never commit**.

| Field | Value |
|-------|--------|
| **Status** | **BLOCKED** |
| **Canonical ledger** | [`WHATSAPP_WEBHOOK_EVIDENCE.md`](./WHATSAPP_WEBHOOK_EVIDENCE.md) |
| **Last run** | 2026-07-08 (credential rerun #199) |
| **Operator** | Cursor Agent |
| **HEAD at run** | `ac608c67` |
| **Branch** | `docs/p0-whatsapp-credential-rerun` |

### Credential presence (canonical, redacted)

| Variable | Status |
|----------|--------|
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | **MISSING** |
| `WHATSAPP_WEBHOOK_APP_SECRET` | **MISSING** |
| `WHATSAPP_API_TOKEN` | **MISSING** |
| `WHATSAPP_PHONE_NUMBER_ID` | **MISSING** |
| `WHATSAPP_PROVIDER` | **MISSING** |
| `WHATSAPP_API_BASE_URL` | **MISSING** |

### Smoke summary

| Check | Status | Blocker | Notes |
|-------|--------|---------|-------|
| Webhook verify (wrong/missing token) | **PARTIAL** | YES | 403 fail-closed on running API; correct token **NOT_RUN** |
| Webhook verify (correct token) | **NOT_RUN** | YES | Ops verify token missing on running API |
| Signature fail-closed (live) | **PASS** (isolated) | YES | Isolated `WHATSAPP_PROVIDER=live` route harness: 503/403/403/200; demo API legacy 200 without provider |
| Full API live boot | **BLOCKED** | YES | `runtime_env_validation_failed` without ops credentials |
| Inbound message smoke | **PARTIAL** | YES | Isolated signed synthetic inbound only |
| Approval command smoke (`ONAY`/`RED`/`INCELE`) | **PARTIAL** | YES | Isolated signed command → `ticket_not_found` (no fixture) |
| Outbound live send | **NOT_RUN** | YES | WA-OUTBOUND-001 — not marked PASS |
| Retry/error logging | **NOT_RUN** | NO | Observability follow-up |

### Findings

| ID | Severity | Summary |
|----|----------|---------|
| WA-ENV-001 | P0 | Required staging/prod credentials missing |
| WA-BOOT-001 | P0 | Full API cannot boot `WHATSAPP_PROVIDER=live` without ops secrets |
| WA-VERIFY-001 | PARTIAL | Wrong/missing verify token → 403; correct verify not run on running API |
| WA-SIG-001 | P0 (closed) | Signature fail-closed proven (automated + isolated live harness) |
| WA-CMD-001 | PARTIAL | Isolated signed inbound/approval only; live Meta + ticket fixture pending |
| WA-OUTBOUND-001 | NOT_RUN | Live outbound not tested |

---

## 6. Local AI readiness evidence

| Field | Value |
|-------|--------|
| **Status** | **PASS** |
| **Canonical ledger** | [`LOCAL_AI_READY_EVIDENCE.md`](./LOCAL_AI_READY_EVIDENCE.md) |
| **Last run** | 2026-07-08 (production-go rerun #2) |
| **Operator** | Cursor Agent |
| **HEAD at run** | `47c6d483` |

### Runtime signals (2026-07-07)

| Signal | Status | Notes |
|--------|--------|-------|
| Ollama `:11434` | **healthy** | Models: `llama3.2:3b`, `RefinedNeuro/Turkcell-LLM-7b-v1:latest` |
| `local-ai-service` `:8008` | **healthy** | After `pnpm local-ai:dev`; `pnpm local-ai:health` PASS |
| API `/health/local-ai` | **ready=true** | With `AI_PROVIDER=ollama`, `AI_LOCAL_ENABLED=true`; default API env still `disabled` |
| `production-go:local` (postgres, no waiver) | **FAIL** | `ECONNREFUSED 127.0.0.1:5432` — LAI-PG-001 |
| `production-go:local` (AI-only path, no waiver) | **PASS** | Services up + configured API; skips migration when no `DATABASE_URL` |
| Dashboard voice channel | **NOT_RUN** | LAI-WEB-001 |

### Findings

| ID | Summary |
|----|---------|
| LAI-PG-001 | Postgres unavailable — canonical bundle blocked |
| LAI-ENV-001 | API needs explicit ollama env (not default `.env.example`) |
| LAI-PROBE-001 | API `ready` probes Ollama; `local-ai:health` stricter |
| LAI-WEB-001 | Dashboard voice not verified |

| Decision | Value |
|----------|--------|
| **GATE-P0-AI** | **PASS** (2026-07-08 rerun #2; canonical bundle without waiver) |
| Production-ready (local AI gate) | **YES** (local/staging) |
| Full Production Go | **NO** (`GATE-P0-WA` BLOCKED) |

### Production-go rerun #2 (2026-07-08, issue #197)

| Signal | Status | Notes |
|--------|--------|-------|
| Docker / Postgres | **PASS** | Container `hallederizcrm-postgres` Up; port 5432 open |
| `local-ai:health` | **PASS** | Service + Ollama healthy |
| `production-go:local` (canonical, no waiver) | **PASS** | All bundle steps green |
| API `/health/local-ai` | **PASS** | `ready=true`, `status=healthy` |
| `PRODUCTION_GO_ALLOW_DEGRADED_AI` | **NOT SET** | |
| **GATE-P0-AI** | **PASS** | LAI-PG-001 closed |

---

## 7. Go / No-Go summary

| Area | Status |
|------|--------|
| Automated gate | **PASS** |
| Repo hygiene | **PASS** (PR #186) |
| Viewport QA | **PASS** (2026-07-04 re-run @ `6ef1645c`; 14/14 routes) |
| WhatsApp prod credential / webhook | **BLOCKED** ([`WHATSAPP_WEBHOOK_EVIDENCE.md`](./WHATSAPP_WEBHOOK_EVIDENCE.md)) |
| Local AI ready | **PASS** ([`LOCAL_AI_READY_EVIDENCE.md`](./LOCAL_AI_READY_EVIDENCE.md) §8) |
| **Production decision** | **CONDITIONAL_GO** — not **FULL_GO** |

---

## 8. Evidence policy

1. **No manual item may be marked PASS** without: date, operator name, command or screenshot reference, and observed result.
2. **Degraded Local AI** cannot be silently treated as production-ready.
3. **WhatsApp credentials** must not be committed to the repository.
4. **Screenshot/media evidence** should not be committed unless explicitly approved by engineering lead.
5. This document is a **ledger template**; updating status here does not by itself change `RELEASE_PRODUCTION_GO_NO_GO.md` signed decision.

---

## Related documents

- `docs/product/PRODUCTION_GO_OPEN_GATES.md`
- `docs/product/VIEWPORT_QA_EVIDENCE.md`
- `docs/product/WHATSAPP_WEBHOOK_EVIDENCE.md`
- `docs/product/LOCAL_AI_READY_EVIDENCE.md`
- `docs/product/RELEASE_PRODUCTION_GO_NO_GO.md`
- `docs/product/PRODUCTION_SMOKE_CHECKLIST.md`
- `docs/development/SPRINT_9_PRODUCTION_GO_PREP.md`
- `docs/development/LOCAL_STAGING_CHAIN.md`
