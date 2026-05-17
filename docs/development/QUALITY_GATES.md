# Kalite kapıları (Quality gates)

Üretim yürütme kuyruğu: [PRODUCTION_EXECUTION_QUEUE.md](./PRODUCTION_EXECUTION_QUEUE.md). Ortam tablosu: [ENV_MATRIX.md](./ENV_MATRIX.md).

PR merge öncesi aşağıdaki kontroller **ilgili değişiklikte** zorunludur.

## Her PR (varsayılan)

| Kontrol | Komut |
|---------|--------|
| Typecheck | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Unit test | `pnpm test` |
| Build | `pnpm build` (CI ile uyumlu PR’larda) |
| Route smoke | `pnpm smoke:routes` |
| Navigation smoke | `pnpm smoke:navigation` |

CI: `.github/workflows/quality-gate.yml`

## Web UI değişikliği

- `pnpm --filter @hallederiz/web typecheck`
- `pnpm --filter @hallederiz/ui typecheck`
- `pnpm smoke:navigation`
- `apps/web/tsconfig.tsbuildinfo` commit dışı

## Koşullu zorunlu testler

| Değişiklik alanı | Ek doğrulama |
|------------------|--------------|
| Tenant / auth | Tenant isolation, login fail-closed, permission deny |
| Permission guard | Guard allow/deny unit veya integration |
| Approval / execution | Policy matrix, dispatcher, red/supersede |
| Webhook / kanal | Signature, duplicate, idempotency, token hash |
| AI proposal | Snapshot/structured parse, `requiresApproval` |
| Audit / timeline | `recordAuditEvent` write ve okuma endpointi |
| Integration | Adapter fallback reason; canlı outbound kapalı senaryo |

E2E: `pnpm smoke:e2e` — kritik akış değiştiyse.

## Tamamlanmış sayılmaz

Kritik guard, approval, webhook, AI action veya tenant değişikliği **testsiz**.

## Pilot / release

`docs/pilot-readiness-status.md`, `RELEASE_CHECKLIST.md`
