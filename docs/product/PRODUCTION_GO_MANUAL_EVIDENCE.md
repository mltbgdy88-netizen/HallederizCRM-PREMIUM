# Production Go Manual Evidence

| Field | Value |
|-------|--------|
| **Document role** | Manual evidence ledger and checklist template |
| **Baseline `main` HEAD** | `2a009763` |
| **Production decision** | **Conditional Go** (not full Production Go) |
| **Last automated gate run** | 2026-07-01 (local) |
| **Related** | `RELEASE_PRODUCTION_GO_NO_GO.md`, `PRODUCTION_GO_OPEN_GATES.md` |

---

## 1. Current baseline

| Item | Status |
|------|--------|
| `main` HEAD | `2a009763` |
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
| **Last run** | 2026-07-06 |
| **Operator** | Cursor Agent (docs-only evidence) |
| **HEAD at run** | `2a009763` |
| **Branch** | `docs/p0-whatsapp-webhook-evidence` |

### Credential presence (redacted)

| Variable | Status |
|----------|--------|
| `WHATSAPP_VERIFY_TOKEN` | **MISSING** |
| `WHATSAPP_WEBHOOK_SECRET` | **MISSING** |
| `WHATSAPP_PHONE_NUMBER_ID` | **MISSING** |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | **MISSING** |
| `WHATSAPP_PROVIDER` | **MISSING** |

### Smoke summary

| Check | Status | Blocker | Notes |
|-------|--------|---------|-------|
| Webhook verify (wrong/missing token) | **PARTIAL** | YES | 403 fail-closed; correct token **NOT_RUN** |
| Webhook verify (correct token) | **NOT_RUN** | YES | `WHATSAPP_VERIFY_TOKEN` missing |
| Signature fail-closed (live) | **BLOCKED** | YES | `POST_NO_SIG` → 200; `POST_BAD_SIG` → 200 |
| Inbound message smoke | **NOT_RUN** | YES | Credentials + signature path not ready |
| Approval command smoke (`ONAY`/`RED`/`INCELE`) | **NOT_RUN** | YES | WA-CMD-001 |
| Outbound live send | **NOT_RUN** | YES | WA-OUTBOUND-001 — not marked PASS |
| Retry/error logging | **NOT_RUN** | NO | Observability follow-up |

### Findings

| ID | Severity | Summary |
|----|----------|---------|
| WA-ENV-001 | P0 | Required staging/prod credentials missing |
| WA-VERIFY-001 | PARTIAL | Wrong/missing verify token → 403; correct verify not run |
| WA-SIG-001 | P0 BLOCKER | Live POST accepted missing/invalid signature (200) |
| WA-CMD-001 | BLOCKED / NOT_RUN | Approval command live smoke not completed |
| WA-OUTBOUND-001 | NOT_RUN | Live outbound not tested |

---

## 6. Local AI readiness evidence

| Signal | Current state |
|--------|----------------|
| Ollama | **healthy** (`:11434`) |
| `local-ai-service` | **down** (`:8008` fetch failed) |
| API `/health/local-ai` | **disabled**, `ready=false` |
| Local bundle waiver | `PRODUCTION_GO_ALLOW_DEGRADED_AI=1` accepted for local/staging |

| Decision | Value |
|----------|--------|
| Production-ready | **NO** |
| Allowed for local/staging | **YES**, with explicit degraded flag |
| Required for production-ready | `pnpm local-ai:dev` (or equivalent); API `ready=true`; dashboard AI channel not disabled |

---

## 7. Go / No-Go summary

| Area | Status |
|------|--------|
| Automated gate | **PASS** |
| Repo hygiene | **PASS** (PR #186) |
| Viewport QA | **PASS** (2026-07-04 re-run @ `6ef1645c`; 14/14 routes) |
| WhatsApp prod credential / webhook | **BLOCKED** ([`WHATSAPP_WEBHOOK_EVIDENCE.md`](./WHATSAPP_WEBHOOK_EVIDENCE.md)) |
| Local AI ready | **BLOCKED** / **DEGRADED** |
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
- `docs/product/RELEASE_PRODUCTION_GO_NO_GO.md`
- `docs/product/PRODUCTION_SMOKE_CHECKLIST.md`
- `docs/development/SPRINT_9_PRODUCTION_GO_PREP.md`
- `docs/development/LOCAL_STAGING_CHAIN.md`
