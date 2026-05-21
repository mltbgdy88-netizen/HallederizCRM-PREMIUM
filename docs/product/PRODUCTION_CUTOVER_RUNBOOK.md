# Production Cutover Runbook

| Alan | Değer |
|------|--------|
| Purpose | Operasyonel production cutover ve deployment handoff |
| Scope | Release documentation only — no deployment execution in-repo |
| Release commit | `2d2430f` — docs(release): finalize ui release candidate (#137) |
| Codebase integration commit | `f96680a` — feat(integrations): prepare whatsapp and local ai readiness (#136) |
| Branch | `release/production-cutover` |
| Date | 2026-05-21 |

## Preconditions

- [ ] `main` HEAD is `2d2430f` or later with green CI on release tag/commit
- [ ] PR chain #123–#137 merged (see `RELEASE_UI_RC_FINAL_REPORT.md`)
- [ ] `pnpm ui:guard`, typecheck, build, smoke, API tests pass on cutover commit
- [ ] No open P0/P1 release blockers (`RELEASE_UI_RC_GO_NO_GO.md`)
- [ ] Production cutover docs reviewed (`PRODUCTION_*` in `docs/product/`)
- [ ] Stash `wip-mockup-inspiration-before-agent04` **not** restored on cutover branches
- [ ] Database backup/snapshot plan approved
- [ ] Rollback owner assigned (see Owners)
- [ ] Deploy owner assigned (see Owners)

## Owners (placeholders)

| Role | Owner | Contact |
|------|-------|---------|
| Deploy lead | _TBD_ | |
| Rollback lead | _TBD_ | |
| DBA / migrations | _TBD_ | |
| WhatsApp / omnichannel | _TBD_ | |
| Local AI / platform | _TBD_ | |
| Security / secrets | _TBD_ | |
| Product sign-off | _TBD_ | |

## Related documents

- `PRODUCTION_ENV_CHECKLIST.md`
- `PRODUCTION_SMOKE_CHECKLIST.md`
- `PRODUCTION_ROLLBACK_PLAN.md`
- `RELEASE_PRODUCTION_GO_NO_GO.md`
- `WHATSAPP_READINESS.md`
- `LOCAL_AI_READINESS.md`
- `RELEASE_UI_RC_FINAL_REPORT.md`

---

## Phase 0 — Freeze

| Step | Action | Pass criteria |
|------|--------|---------------|
| 0.1 | Record `main` SHA: `git rev-parse main` | Matches approved release commit |
| 0.2 | Verify GitHub Quality Gate green on that SHA | All required checks SUCCESS |
| 0.3 | List open PRs blocking release | None on `main`, or documented exceptions |
| 0.4 | Confirm backup/snapshot | DB + config export documented |
| 0.5 | Assign rollback + deploy owners | Names in runbook / ticket |
| 0.6 | Communication channel ready | Incident + status channel named |

**Abort:** Any P0 test failure on freeze commit → **No-Go** until fixed on `main`.

---

## Phase 1 — Environment

Complete `PRODUCTION_ENV_CHECKLIST.md`. Secrets **only** in platform secret manager — never in git.

| Area | Key actions |
|------|-------------|
| General | `NODE_ENV=production`, public URLs, CORS, logging |
| Database | `DATABASE_URL` / `POSTGRES_URL`, `PERSISTENCE_MODE=postgres` |
| Auth | Session secrets; `DEMO_AUTH_ENABLED=false`, `NEXT_PUBLIC_ENABLE_DEMO_AUTH=false` |
| WhatsApp | Live provider env + webhook tokens (names only in docs) |
| Local AI | Ollama or openai-compatible endpoint + model |
| Demo | `NEXT_PUBLIC_USE_DEMO_DATA=false` in production unless explicitly approved |

**Abort:** Missing required production secret names for auth/DB → do not deploy.

---

## Phase 2 — Pre-deploy smoke (staging or local prod-like)

Run from repo root on **cutover commit** (not from uncommitted local edits):

```bash
pnpm ui:guard
pnpm --filter @hallederiz/web typecheck
pnpm --filter @hallederiz/ui typecheck
pnpm --filter @hallederiz/ui build
pnpm --filter @hallederiz/web build
pnpm smoke:navigation
pnpm smoke:routes
pnpm --filter @hallederiz/api test
```

Optional (when API reachable):

```bash
pnpm smoke:api-offline
pnpm smoke:production-data
```

Integration readiness (HTTP, staging URL):

- `GET /health/whatsapp` — expect honest state (not fake connected)
- `GET /health/local-ai` — expect `ready` or documented `not_configured`
- `GET /whatsapp/session` — connected only when env complete

**Abort:** Any command above fails → **No-Go**; do not proceed to Phase 3.

---

## Phase 3 — Deploy

> Platform-specific steps — fill in deployment target (Vercel, VM, K8s, etc.) in ticket.

| Step | Typical action |
|------|----------------|
| 3.1 | Deploy API service artifact / container |
| 3.2 | Run DB migrations if applicable (`packages/database` — owner confirms command) |
| 3.3 | Deploy web (Next.js) with production env |
| 3.4 | Deploy worker / AI service if in scope for tenant |
| 3.5 | Verify health endpoints return 200 |
| 3.6 | Tail logs 15–30 min — no spike in 5xx/auth errors |

**Abort criteria:**

- Migration failure
- Health check failure > 2 consecutive attempts
- Error rate above agreed threshold (define per environment)
- Auth/session completely broken on smoke login

---

## Phase 4 — Post-deploy smoke

Use `PRODUCTION_SMOKE_CHECKLIST.md`. Minimum manual pass:

| Area | Checks |
|------|--------|
| API | Health, auth login, tenant-scoped read |
| Web | Login, dashboard, navigation (24 links), critical routes |
| WhatsApp | Webhook verify challenge, inbound test, outbound to test recipient only |
| Local AI | `/health/local-ai`, sales assistant health, review-only UI (no auto-apply) |
| Safety | Error boundaries — no stack traces in UI |

**Do not** run destructive approval executions in production without explicit manual approval ticket.

---

## Phase 5 — Go / No-Go

Complete `RELEASE_PRODUCTION_GO_NO_GO.md` sign-off.

| Question | Required answer for **Production Go** |
|----------|--------------------------------------|
| P0 blocker? | No |
| P1 blocker? | No |
| Automated gates on deploy SHA? | Pass |
| WhatsApp credential + webhook smoke? | Pass |
| Local AI endpoint smoke? | Pass (or AI disabled by policy with sign-off) |
| Viewport QA 1920 + 390? | Pass |
| Monitoring baseline clean 30 min? | Pass |

Until all manual gates pass, decision remains **Conditional Go** (code deploy allowed only if business accepts partial integrations — document explicitly).

---

## Phase 6 — Rollback

Execute `PRODUCTION_ROLLBACK_PLAN.md` if abort criteria met.

Post-rollback validation:

- Previous known-good deployment serving traffic
- DB consistency per rollback plan
- WhatsApp webhook pointed to stable URL or disabled with comms
- Local AI env reverted or `AI_PROVIDER=disabled` if unstable

---

## Command reference

| Command | Purpose |
|---------|---------|
| `pnpm install --frozen-lockfile` | CI-parity install |
| `pnpm typecheck` | Monorepo typecheck |
| `pnpm lint` | Lint gate |
| `pnpm build` | Full build |
| `pnpm ui:guard` | PNG / fake / leakage guard |
| `pnpm smoke:navigation` | 24 critical nav links |
| `pnpm smoke:routes` | 37 route files + demo IDs |
| `pnpm --filter @hallederiz/api test` | API suite (421 tests) |
| `pnpm smoke:api-offline` | Offline HTTP smoke |
| `pnpm smoke:production-data` | Optional live data smoke |

## Communication template

**Pre-deploy (T-24h):**

> Production cutover scheduled for [DATE/TIME]. Release commit `2d2430f` (+ cutover docs). Freeze on `main`. Rollback owner: [NAME]. Manual gates: WhatsApp credentials, Local AI endpoint, viewport QA.

**Go:**

> Production cutover complete. Deploy SHA: [SHA]. Smoke: API/Web pass; WhatsApp [ready/pending]; Local AI [ready/pending]. Monitoring: [link]. Decision: Production Go.

**Rollback:**

> Rollback initiated: [REASON]. Reverted to deployment [VERSION/SHA]. WhatsApp webhook: [action]. Users notified: [channel]. Post-rollback smoke: [status].

## Post-release monitoring (first 24h)

- [ ] API 5xx rate and latency
- [ ] Auth failure rate
- [ ] WhatsApp webhook delivery errors
- [ ] Outbound 503 rate (integration not ready)
- [ ] Local AI timeout / probe failures
- [ ] Worker/outbox backlog if enabled
- [ ] User-reported UI regressions on critical routes

## Explicit out of scope (this runbook)

- Live WhatsApp broadcast to customers (without approved test plan)
- AI auto-mutation or approval bypass
- Credential values in documentation or git
- Runtime code changes as part of cutover docs branch
- Restoring stash `wip-mockup-inspiration-before-agent04`
