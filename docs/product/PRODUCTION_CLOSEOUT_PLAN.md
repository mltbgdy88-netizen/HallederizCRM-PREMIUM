# Production Closeout — PR #225

Reviewed 2026-10-02. Branch: `completion/production-closeout`.
Base main: `d2ca26006d5055a4dd3caea0c86fc50261d38ee0`.
Starting PR head: `fec0778b94d1ccac6b941cf0b577fa4c7a7026e8`.

**Release decision: NO GO pending remaining production evidence.** Previous
Conditional Go notes are historical; they do not certify this revision.
No merge, production deploy, live customer messages or credentials were created.

## Priority and execution

| Priority | Gate | Status | Work / acceptance evidence |
|---|---|---|---|
| P0 | Dependency security | PASS | fast-uri 4.1.5 and brace-expansion 5.0.12; current audit reports zero vulnerabilities. Audit threshold retained. |
| P0 | Durable production sessions | PARTIAL | Login saves to Redis before success; request-local hydration supplies all existing tenant/policy guards; logout revokes centrally; no process-memory production fallback. Cross-instance, tenant spoof, malformed token, Redis outage and revoke regression tests pass. Real Redis integration added to PostgreSQL CI; deployment evidence still required. |
| P0 | Plain Node/container startup | PARTIAL | Existing compiler emitted nested paths and extensionless imports. Build preparation now supplies entrypoints and resolvable ESM imports for API/worker Docker images. Plain Node production API boot and unavailable-Redis readiness smoke pass; actual Docker build/deploy still required. |
| P0 | Render configuration | PARTIAL | Blueprint validates against official JSON schema. Correct DB plan spelling, private Redis access list, required encryption key, explicit browser API build argument, demo flags disabled, `/ready` deployment health. Real service URLs/CORS/custom domains must be supplied. |
| P0 | Worker lifecycle | PARTIAL | Idle poll abort now resolves its promise and removes listeners; six worker tests pass. Durable outbox processing/retry and bounded in-flight shutdown still require real database/deployment proof. |
| P0 | PostgreSQL migrations/persistence | PARTIAL | Starting PR PostgreSQL CI was green (run 36930143286). Readiness now verifies migration checksums and reuses its pool. Rerun on updated commit; verify real deployment migration and restart persistence. |
| P0 | CI/build/typecheck | PARTIAL | All 13 typecheck tasks and web production build pass locally. Final API regression: 490 passed, 0 failed, 2 skipped. Updated GitHub checks remain required. Never treat old checks as new commit evidence. |
| P0 | Backup / restore | OPS INPUT REQUIRED | Restore an actual encrypted backup into an isolated database, validate migration checksums, tenant counts, financial records and attachments. Record backup age, elapsed restore time, RPO/RTO and operator. A runbook alone is not PASS. |
| P0 | WhatsApp Cloud API | OPS INPUT REQUIRED | Provider remains disabled. Configure approved account binding and secrets in secret manager; verify webhook signature/replay/inbound/approved outbox outbound with an explicitly approved test recipient. No messages sent in this closeout. |
| P1 | Local AI/Ollama | OPS INPUT REQUIRED | Supply reachable endpoint/model; run `pnpm local-ai:health` and proposal-only mutation-denial smoke on this release. Historical evidence is not current live proof. |
| P1 | Core commercial chain | PARTIAL | Existing domain/API test coverage retained. Run `pnpm staging:local-chain` on isolated real Postgres; record customer → offer → order → payment → document/approval IDs, denied cross-tenant reads and restart persistence. |
| P1 | Invoice/return/product/stock/warehouse/delivery/KPI | PARTIAL | Existing route and API code is present; no blanket completion claim from screen presence. Run real-data detail/mutation/approval and KPI reconciliation per module before closing. |
| P1 | Desktop/mobile and real-ID detail | PARTIAL | Route (37) and navigation (24 critical links) smoke pass. 1920×1080 / 390×844 authenticated real-data, loading/empty/error and detail-ID QA must be rerun against deployed revision. |

## Changes included

- Root manifest/lockfile: patched vulnerable transitive packages without disabling audit.
- API session store, Redis repository, auth routes and request context: durable session lifecycle and fail-closed hydration; malformed cookie handling; strict token framing.
- API readiness: Redis reachability plus database/migration checksum gates.
- Config: production Redis and 32-character session-secret requirements.
- Worker: interruptible polling without accumulating abort listeners.
- Dockerfiles, runtime preparation/smoke scripts, Render Blueprint: executable Node artifacts and explicit deployment settings.
- Web data-source default: no implicit demo mode in production.
- Tests/workflows: session regression, Redis wire integration, worker shutdown and compiled production smoke.

## Local validation (Node 20.20.1 / pnpm 9.12.0)

- `pnpm typecheck`: PASS, 13/13 tasks.
- `pnpm --filter @hallederiz/web build` with demo disabled: PASS, 92 pages generated.
- `pnpm test:worker`: PASS, 6/6.
- Session/security/usage targeted rerun: PASS, 8 tests; Redis wire test skipped locally because no Redis server is installed. CI supplies Redis 7 and runs it explicitly.
- `node scripts/ci/compiled-runtime-smoke.cjs`: PASS (API boot, worker entrypoint, unavailable Redis → 503).
- `pnpm audit --json`: PASS, 0 vulnerabilities.
- Secret scan, 37-route smoke, 24-link navigation smoke: PASS.
- Render JSON Schema validation: PASS. This is not proof of a successful deployment.
- `pnpm test:api` final run: PASS, 490 passed / 0 failed / 2 skipped. Two obsolete memory-session fixtures were adapted to the durable-session boundary without relaxing endpoint assertions.

## Operations handoff and finishing order

1. Require all updated PR CI checks green; keep this PR draft until P0 evidence is complete.
2. Set actual HTTPS `NEXT_PUBLIC_API_BASE_URL` at web **build time**, `API_BASE_URL` at server runtime, and matching API `API_CORS_ORIGINS` / `WEB_URL` / `APP_BASE_URL`. Browser cookie flow needs same-site HTTPS app/API domains (or a separately validated same-origin proxy); verify refresh and logout in the deployed browser. Never put secrets in `NEXT_PUBLIC_*`.
3. Apply migrations with the release image; seed only an explicitly provisioned real administrator. Deploy API/web/worker, verify `/ready`, Redis outage refusal, API restart session persistence and shared logout across replicas.
4. Execute real business chain and module/KPI checks; capture IDs and test evidence without customer secrets.
5. Complete isolated backup restore and live integration checks; run viewport QA.
6. Update each row only from observed evidence. All required rows must be PASS before declaring production complete.
