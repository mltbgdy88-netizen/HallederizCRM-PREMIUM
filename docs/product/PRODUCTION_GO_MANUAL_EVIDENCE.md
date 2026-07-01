# Production Go Manual Evidence

| Field | Value |
|-------|--------|
| **Document role** | Manual evidence ledger and checklist template |
| **Baseline `main` HEAD** | `e2f21450` |
| **Production decision** | **Conditional Go** (not full Production Go) |
| **Last automated gate run** | 2026-07-01 (local) |
| **Related** | `RELEASE_PRODUCTION_GO_NO_GO.md`, `PRODUCTION_GO_OPEN_GATES.md` |

---

## 1. Current baseline

| Item | Status |
|------|--------|
| `main` HEAD | `e2f21450` |
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
| **Status** | **PARTIAL** |
| **Canonical ledger** | [`VIEWPORT_QA_EVIDENCE.md`](./VIEWPORT_QA_EVIDENCE.md) |
| **Last run** | 2026-07-01 |
| **Operator** | Cursor Agent QA (`admin@hallederiz.local`) |
| **HEAD at run** | `9d267b5e` |
| **Blocker findings** | `VP-DESK-001`, `VP-DESK-002` — **resolved** via `fix/p0-operator-route-aliases`; full viewport re-run pending |

Live session: web `http://127.0.0.1:3000`, API `http://127.0.0.1:4000`, live mode (`NEXT_PUBLIC_USE_DEMO_DATA=false`). No screenshots committed.

### Desktop — 1920×1080

| Route | Viewport | Expected evidence | Status | Blocker | Notes |
|-------|----------|-------------------|--------|---------|-------|
| `/dashboard` | 1920×1080 | Shell loads; AI column dashboard-only; no body scroll | **PASS** | YES | Shell OK; no h-scroll |
| `/hizli-islem/satis-masasi` | 1920×1080 | Workbench usable; customer catalog loads in live mode | **PASS** | YES | Cari alanı + aksiyonlar görünür |
| `/onaylar` | 1920×1080 | Command desk; ≥5 list rows or valid empty state | **PASS** | YES | Empty state: bekleyen onay yok |
| `/teklifler` | 1920×1080 | List density; first row selected; right panel populated | **PASS** | YES | ≥5 satır; ilk kayıt seçili |
| `/operator` | 1920×1080 | Operator shell; platform context visible | **PASS** | YES | SaaS konsol OK |
| `/operator/announcement-videos` | 1920×1080 | CRUD list; Postgres-backed | **FAIL** | YES | **404** — bkz. `VP-DESK-001` |
| `/operator/tenants` | 1920×1080 | Tenant directory list; plan/status columns | **FAIL** | YES | **404** — bkz. `VP-DESK-002` |

### Mobile — 390×844

| Route | Viewport | Expected evidence | Status | Blocker | Notes |
|-------|----------|-------------------|--------|---------|-------|
| `/dashboard` | 390×844 | Drawer nav; no horizontal scroll | **PASS** | YES | Menü butonu OK |
| `/hizli-islem/satis-masasi` | 390×844 | Core actions reachable | **PASS** | YES | Cari alanı erişilebilir |
| `/onaylar` | 390×844 | Approve/reject reachable | **PASS** | YES | Empty state; UI OK |
| `/teklifler` | 390×844 | List + detail accessible | **PASS** | YES | Liste OK; h-scroll yok |
| `/operator` | 390×844 | Operator entry usable | **PASS** | YES | Konsol mobilde OK |
| `/operator/announcement-videos` | 390×844 | List readable | **FAIL** | NO | 404 (slug) |
| `/operator/tenants` | 390×844 | List readable | **FAIL** | NO | 404 (slug) |

---

## 5. WhatsApp production credential evidence

Credentials must live in secret manager only — **never commit**.

| Check | Status | Blocker | Notes |
|-------|--------|---------|-------|
| Webhook verify URL configured | **NOT_RUN** | YES | Meta app dashboard |
| App secret configured | **NOT_RUN** | YES | Secret manager |
| Access token configured | **NOT_RUN** | YES | Secret manager |
| Phone number ID configured | **NOT_RUN** | YES | Secret manager |
| Test recipient configured | **NOT_RUN** | YES | Ops-owned |
| Inbound message smoke | **NOT_RUN** | YES | Staging/prod webhook |
| Approval command smoke (`ONAY`/`RED`/`INCELE`) | **NOT_RUN** | YES | See `docs/product/WHATSAPP_READINESS.md` |
| Signature fail-closed smoke | **NOT_RUN** | YES | Invalid signature must reject |
| Retry/error logging | **NOT_RUN** | NO | Observability follow-up |

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
| Viewport QA | **PARTIAL** — alias fix spot-checked; full viewport re-run pending (`VP-DESK-001`, `VP-DESK-002` resolved) |
| WhatsApp prod credential | **NOT_RUN** / **BLOCKED** (no credentials in repo) |
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
- `docs/product/RELEASE_PRODUCTION_GO_NO_GO.md`
- `docs/product/PRODUCTION_SMOKE_CHECKLIST.md`
- `docs/development/SPRINT_9_PRODUCTION_GO_PREP.md`
- `docs/development/LOCAL_STAGING_CHAIN.md`
