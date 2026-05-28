# Production Blocker Foundation Report

## Özet

Sprint 1 kapsamında migration registry deterministik hale getirildi, audit/timeline DB persistence foundation eklendi, action registry genişletildi, `withMutationPolicy` wrapper tanımlandı, production readiness gate `mutationSafe` / `readOnlySafe` bayraklarıyla güçlendirildi ve outbox job payload standardı netleştirildi.

## Değişen modüller

- `packages/database` — migration registry, audit/timeline repositories, redaction
- `packages/domain` — action registry genişletme, outbox job types
- `apps/api` — audit-service, mutation-policy, production readiness, payments confirm/reverse wrapper
- `apps/api/src/tests` — migration, audit, policy, readiness testleri

## Migration registry ve schema parity

- `buildOrderedDatabaseMigrations()` — ai foundation + `0001`…`0013` sıralı SQL
- `ORDERED_SQL_MIGRATION_FILES` ve `FOUNDATION_TABLE_NAMES` export
- Parity tabloları migration SQL içinde doğrulandı (payment_allocations, outbox_jobs, timeline_events, vb.)

## Eklenen / doğrulanan tablolar

Doğrulandı (yeni duplicate migration yok):

- audit_events, timeline_events, outbox_jobs, dead_letter_jobs, pending_approval_requests
- approval_execution_logs, payment_allocations, warehouse_order_lines, warehouse_tasks

## Audit DB-backed foundation

- `DatabaseAuditEventRepository`, `DatabaseTimelineEventRepository`
- `persistAuditAndTimeline` — postgres modda DB insert, demo modda memory
- Production DB hatasında fail-closed (`audit_persistence_unavailable`)
- `redactAuditPayload` — phone/email/token/password/secret alanları maskelenir

## Timeline foundation

- Timeline insert `timeline_events` tablosuna bağlandı (subject_type/subject_id)

## Action registry

Yeni kritik action key örnekleri:

- `platform.payments.confirm`, `platform.payments.reverse`
- `platform.deliveries.complete`, `platform.invoices.issue`
- `platform.documents.send_whatsapp`, `platform.documents.send_email`, `platform.documents.archive`
- `platform.ai.plan.persist`

## Mutation policy wrapper

- `withMutationPolicy` — production gate, idempotency, policy decision, audit strict
- Uygulandı: `POST /payments/:id/confirm`, `POST /payments/:id/reverse`
- Backlog: diğer ticari mutation route’ları

## Approval / outbox / worker chain

- `STANDARD_OUTBOX_JOB_TYPES` ve `validateStandardOutboxPayload`
- Mevcut worker handler’lar unsupported iken completed yapmıyor (önceki faz korundu)

## Production readiness gate

Yeni alanlar:

- `mutationSafe`, `readOnlySafe`, `workerSafe`, `providerSafe`, `checks[]`

Yeni blocker kaynakları:

- `PERSISTENCE_MODE=demo`, `NEXT_PUBLIC_USE_DEMO_DATA=true`, `ALLOW_DEMO_FALLBACK=true`
- demo auth flags, `OMNICHANNEL_ALLOW_MOCK_PROVIDERS=true`

## Parity backlog tabloları (sonraki modül fazı)

`PARITY_BACKLOG_TABLE_NAMES`: payment_reversals, delivery_lines, invoice_lines, return_lines, document_deliveries — migration SQL corpus’ta henüz yok; repository kullanımı sonraki sprintte doğrulanacak.

## Test sonuçları

| Komut | Sonuç |
|-------|-------|
| `pnpm --filter @hallederiz/types build` | geçti |
| `pnpm --filter @hallederiz/database build` | geçti |
| `pnpm --filter @hallederiz/domain build` | geçti |
| `pnpm --filter @hallederiz/sdk build` | geçti |
| `pnpm --filter @hallederiz/api typecheck` | geçti |
| `pnpm --filter @hallederiz/web typecheck` | geçti |
| `pnpm --filter @hallederiz/web build` | geçti |
| `pnpm test` | 392/392 geçti |
| `pnpm test:web-navigation` | geçti |
| `pnpm smoke:routes` | geçti |
| `pnpm smoke:navigation` | geçti |
| `pnpm smoke:api-offline` | geçti |
| `pnpm smoke:all` | geçti |

## Kalan P0 boşlukları

- Tüm kritik mutation route’ları `withMutationPolicy` ile sarılmadı
- Audit postgres insert için integration test (gerçek DB) yok
- Worker live domain handler’lar (document render/archive execution) eksik
- `document_deliveries` tablosu ayrı migration parity kontrolü sonraki modül fazında

## Sonraki sprint önerisi

1. Kritik mutation route coverage (%100 action registry eşleşmesi)
2. Approval approve → outbox enqueue otomasyon testi (postgres integration)
3. Worker live handler implementasyonu (document.send, approval.dispatch)
