# Local AI Ready Evidence

| Field | Value |
|-------|--------|
| **Gate** | `GATE-P0-AI` |
| **Date** | 2026-07-07 (initial), **2026-07-08** (rerun #1, rerun #2) |
| **Branch** | `docs/p0-local-ai-production-go-rerun-2` |
| **HEAD** | `47c6d483` |
| **OS** | Windows 10 (win32 10.0.26200) |
| **Node** | v20.20.1 |
| **Production decision** | **Conditional Go** — no Full Production Go |

---

## 1. Scope

- Objective: `local-ai-service` + API `GET /health/local-ai` readiness for `GATE-P0-AI`
- Out of scope: Full Production Go (WhatsApp `GATE-P0-WA` still **BLOCKED**)
- No secrets committed; no fake `ready=true`

---

## 2. Environment

| Item | Value |
|------|--------|
| **local-ai command** | `pnpm local-ai:dev` → `apps/local-ai-service/start.ps1` |
| **Service URL** | `http://127.0.0.1:8008` |
| **Ollama URL** | `http://127.0.0.1:11434` |
| **API URL (postgres attempt)** | `http://127.0.0.1:4000` |
| **API URL (AI probe)** | `http://127.0.0.1:4001` (demo mode, AI env configured) |
| **Postgres** | `127.0.0.1:5432` — **ECONNREFUSED** |
| **Waiver** | Not used for AI-ready path evidence |

### API env used for `ready=true` probe

| Variable | Value |
|----------|--------|
| `AI_PROVIDER` | `ollama` |
| `AI_LOCAL_ENABLED` | `true` |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | `llama3.2:3b` |
| `LOCAL_AI_SERVICE_URL` | `http://127.0.0.1:8008` |

Default `.env.example` uses `AI_PROVIDER=disabled` — API returns `ready=false` until ops enables local AI env.

---

## 3. Architecture discovered

| Question | Answer |
|----------|--------|
| `pnpm local-ai:dev` | Runs `start.ps1`: Python 3.11 venv, pip install, Piper assets, `uvicorn app.main:app` on **`:8008`** |
| `pnpm local-ai:health` | Probes `LOCAL_AI_SERVICE_URL/health` + `OLLAMA_BASE_URL/api/tags`; exit 0 only if **both** healthy |
| `pnpm local-ai:smoke` | Same as health with `--degraded-ok` (accepts degraded exit 0) |
| `production-go:local` | navigation → optional postgres migration → staging chain → `local-ai:smoke` → API `/health/local-ai` login probe; fails if `ready!==true` unless `PRODUCTION_GO_ALLOW_DEGRADED_AI=1` |
| API `/health/local-ai` `ready=true` | `resolveLocalAiReadinessWithProbe()`: `AI_PROVIDER` ollama/local + `AI_LOCAL_ENABLED=true` + Ollama `/api/tags` reachable (does **not** require `local-ai-service` for `ready` flag) |
| Service port | **8008** (`LOCAL_AI_PORT` / `start.ps1`) |
| Ollama | Required for `local-ai:health` PASS and API `ready=true`; models observed: `llama3.2:3b`, `RefinedNeuro/Turkcell-LLM-7b-v1:latest` |
| Dashboard voice disabled | `DashboardAiAssistantPanel.tsx`: `voiceReady = health?.voice?.ttsReady && status==healthy` (sales-assistant voice path; separate from `/health/local-ai`) |

---

## 4. Checks

| ID | Check | Expected | Observed | Result | Notes |
|----|-------|----------|----------|--------|-------|
| LAI-SVC-001 | `pnpm local-ai:dev` | Service listens `:8008` | Uvicorn running `127.0.0.1:8008` | **PASS** | Python 3.11 venv + deps OK |
| LAI-SVC-002 | `pnpm local-ai:health` | `ok:true`, both service + Ollama | `status:healthy`, `reason:local_ai_service_and_ollama_ready` | **PASS** | Exit 0 |
| LAI-API-001 | `GET /health/local-ai` | `ready=true` | `200` `state=ready ready=true status=healthy reasonCode=ollama_reachable` | **PASS** | Demo API `:4001` with AI env; postgres API login `503` |
| LAI-PGO-001 | `production-go:local` **without waiver**, postgres env | PASS full bundle | **FAIL** `ECONNREFUSED 127.0.0.1:5432` at migration | **FAIL** | Env blocker — not AI code failure |
| LAI-PGO-001b | `production-go:local` **without waiver**, no postgres, AI stack up | AI probe PASS | **PASS** — `ready=true` via `PRODUCTION_GO_API_BASE_URL=4001` | **PASS** | Isolated AI path only; skips migration/staging |
| LAI-PGO-002 | `production-go:local` with `PRODUCTION_GO_ALLOW_DEGRADED_AI=1` + postgres | N/A comparison | **FAIL** same `ECONNREFUSED` at migration | **NOT_RUN** | Postgres down; waiver does not bypass migration |
| LAI-WEB-001 | Dashboard AI channel not disabled | Voice/play usable | **NOT_RUN** | **NOT_RUN** | Web UI not exercised this run |

---

## 5. Findings

| ID | Severity | Issue | Evidence | Required action |
|----|----------|-------|----------|-----------------|
| **LAI-PG-001** | P0 env | Postgres unavailable | `ECONNREFUSED 127.0.0.1:5432`; canonical `production-go:local` with `DATABASE_URL` fails before AI probe | Start local Postgres; re-run full bundle |
| **LAI-ENV-001** | P1 ops | Default API env disables local AI | `.env.example`: `AI_PROVIDER=disabled`; API `/health/local-ai` `ready=false` without ollama env | Document/bootstrap `AI_PROVIDER=ollama`, `AI_LOCAL_ENABLED=true` for local gate |
| **LAI-PROBE-001** | P2 doc | API `ready=true` probes Ollama only | `resolveLocalAiReadinessWithProbe` does not require `local-ai-service` reachability for `ready` | `local-ai:health` remains stricter (service + Ollama) |
| **LAI-WEB-001** | P2 | Dashboard voice channel not verified | `voiceReady` depends on sales-assistant TTS health | Optional viewport/web smoke after API stable |

---

## 6. Decision (current)

| Field | Status |
|-------|--------|
| **Service layer** | **READY** |
| **API ready probe** | **PASS** |
| **Canonical production-go (postgres, no waiver)** | **PASS** (2026-07-08 rerun #2) |
| **`GATE-P0-AI`** | **PASS** |
| **merge_blocker** | **NO** |
| **Full Production Go** | **NO** — `GATE-P0-WA` still **BLOCKED** |

Canonical `pnpm production-go:local` completed **without** `PRODUCTION_GO_ALLOW_DEGRADED_AI` after Docker Desktop + Postgres were started. Dashboard voice channel (LAI-WEB-001) remains optional follow-up, not required for API readiness gate.

---

## 7. 2026-07-08 Production-Go Rerun (`docs/p0-local-ai-production-go-rerun`)

Canonical waiver-less `pnpm production-go:local` rerun with Postgres + Local AI + Ollama.

| Item | Status | Evidence |
|------|--------|----------|
| **Postgres** | **FAIL** | Docker daemon not running: `npipe:////./pipe/dockerDesktopLinuxEngine` not found; `Test-NetConnection 127.0.0.1:5432` → `TcpTestSucceeded: False` |
| **local-ai-service** | **PASS** | `:8008` HTTP 200; prior `pnpm local-ai:dev` session active |
| **Ollama** | **PASS** | `:11434/api/tags` HTTP 200; models: `llama3.2:3b`, `RefinedNeuro/Turkcell-LLM-7b-v1:latest` |
| **`pnpm local-ai:health`** | **PASS** | `ok:true`, `status:healthy`, `local_ai_service_and_ollama_ready` |
| **API `/health/local-ai`** (canonical bundle) | **NOT_RUN** | Bundle failed at `ci:postgres-migration-smoke` before API probe |
| **`production-go:local` without waiver** | **FAIL** | Failed at `ci:postgres-migration-smoke`: `ECONNREFUSED 127.0.0.1:5432` |
| **`PRODUCTION_GO_ALLOW_DEGRADED_AI`** | **NOT SET** | Confirmed unset before run |
| **Degraded waiver used** | **NO** | |

### Rerun findings

| ID | Status | Notes |
|----|--------|-------|
| **LAI-PG-001** | **OPEN** | Docker Desktop not running; Postgres container never started |
| **LAI-ENV-001** | OPEN | AI env prepared for rerun but canonical bundle did not complete |
| **LAI-WEB-001** | NOT_RUN | Dashboard voice not exercised |

### Rerun decision

| Field | Status |
|-------|--------|
| **`GATE-P0-AI`** | **DEGRADED** — not PASS |
| **merge_blocker** | **YES** |
| **Full Production Go** | **NO** — `GATE-P0-WA` **BLOCKED** |

**PASS not granted:** canonical `production-go:local` without waiver did not complete; Postgres env blocker (`LAI-PG-001`).

**Ops action:** Start Docker Desktop → `docker compose -f docker-compose.local.yml up -d postgres` → re-run this evidence branch or new `docs/p0-local-ai-production-go-rerun-2`.

---

## 8. 2026-07-08 Production-Go Rerun #2 (`docs/p0-local-ai-production-go-rerun-2`)

Issue #197 — canonical waiver-less bundle with Docker Desktop + Postgres running.

| Item | Status | Evidence |
|------|--------|----------|
| **Docker Desktop** | **PASS** | Started; `docker info` OK |
| **Postgres** | **PASS** | `hallederizcrm-postgres` Up; `Test-NetConnection 127.0.0.1:5432` → `TcpTestSucceeded: True` |
| **local-ai-service** | **PASS** | `:8008` HTTP 200 |
| **Ollama** | **PASS** | `:11434/api/tags` HTTP 200 |
| **`pnpm local-ai:health`** | **PASS** | `ok:true`, `local_ai_service_and_ollama_ready` |
| **`ci:postgres-migration-smoke`** | **PASS** | 17 migrations; idempotent second apply |
| **`staging:local-chain`** | **PASS** | Offer count 25 → 26 |
| **`local-ai:smoke`** | **PASS** | healthy |
| **API `/health/local-ai`** | **PASS** | `state=ready ready=true configured=true status=healthy` |
| **`production-go:local` without waiver** | **PASS** | Final: `PASS — yerel Production Go prep tamamlandı` |
| **`PRODUCTION_GO_ALLOW_DEGRADED_AI`** | **NOT SET** | Confirmed unset |
| **Degraded waiver used** | **NO** | |

### Bundle steps observed

1. `smoke:navigation` — PASS  
2. `ci:postgres-migration-smoke` — PASS  
3. `staging:local-chain` — PASS  
4. `local-ai:smoke` — PASS  
5. API `/health/local-ai` probe — `ready=true`

### Rerun #2 findings

| ID | Status | Notes |
|----|--------|-------|
| **LAI-PG-001** | **CLOSED** | Postgres reachable after Docker Desktop start |
| **LAI-ENV-001** | **MITIGATED** | AI env set for local gate run |
| **LAI-WEB-001** | **NOT_RUN** | Dashboard voice optional follow-up |

### Rerun #2 decision

| Field | Status |
|-------|--------|
| **`GATE-P0-AI`** | **PASS** |
| **merge_blocker** | **NO** |
| **Full Production Go** | **NO** — `GATE-P0-WA` **BLOCKED** |

## Related documents

- `docs/product/LOCAL_AI_READINESS.md`
- `docs/product/PRODUCTION_GO_MANUAL_EVIDENCE.md`
- `docs/product/PRODUCTION_GO_OPEN_GATES.md`
