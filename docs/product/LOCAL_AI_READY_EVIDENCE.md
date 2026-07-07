# Local AI Ready Evidence

| Field | Value |
|-------|--------|
| **Gate** | `GATE-P0-AI` |
| **Date** | 2026-07-07 |
| **Operator** | Cursor Agent |
| **Branch** | `feature/local-ai-ready-gate` |
| **HEAD** | `7912bfb6` |
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

## 6. Decision

| Field | Status |
|-------|--------|
| **Service layer** | **READY** when `pnpm local-ai:dev` + Ollama running |
| **API ready probe** | **PASS** with correct AI env + Ollama |
| **Canonical production-go (postgres)** | **FAIL** — Postgres env blocker |
| **`GATE-P0-AI`** | **DEGRADED** (improved; not PASS) |
| **merge_blocker** | **YES** |
| **Full Production Go** | **NO** — `GATE-P0-WA` still **BLOCKED** |

### Why not PASS

Per gate rules: canonical `production-go:local` with postgres env **failed** (Postgres down). Degraded waiver not used for PASS claim. Dashboard channel not verified.

### Next actions

1. Start Postgres; re-run `production-go:local` **without** `PRODUCTION_GO_ALLOW_DEGRADED_AI` with full env (`DATABASE_URL`, AI env, `local-ai:dev` running).
2. Document local dev bootstrap env in ops runbook (no secret commit).
3. Optional: `docs/p0-local-ai-production-go-rerun` after Postgres up.

---

## Related documents

- `docs/product/LOCAL_AI_READINESS.md`
- `docs/product/PRODUCTION_GO_MANUAL_EVIDENCE.md`
- `docs/product/PRODUCTION_GO_OPEN_GATES.md`
