# Durable Workflow / Outbox Hardening

Bu faz, approval sonrası execution akışını daha dayanıklı ve gözlemlenebilir hale getirir.

## Amaç

- Approval -> execution -> outbox -> worker zincirini tenant-safe ve fail-closed tutmak.
- Claim/lease davranışını DB alanlarıyla netleştirmek.
- Retry/DLQ geçişlerini idempotency ile güvenli hale getirmek.

## Outbox Lifecycle

- `pending` -> `claimed` -> `completed`
- Hata durumunda: `failed` (retryable)
- Retry limiti aşılırsa veya non-retryable hata olursa: `dead_letter`
- İptal edilen işler: `cancelled` (execute edilmez)

## Claim / Lease Semantics

- Sadece `pending|failed` ve `available_at <= now` işler claim edilir.
- `lease_expires_at > now` olan aktif lease yeniden claim edilmez.
- Lease süresi dolmuş işler tekrar claim edilebilir.
- Claim SQL atomik `FOR UPDATE SKIP LOCKED` yaklaşımıyla çalışır.

## Approval Execution Integration

- Approve akışı durable outbox metadata döndürür (`outboxJobId`, `outboxMode`, `outboxQueued`).
- `tenantId`, `approvalRequestId`, `actionKey`, `idempotencyKey` metadata zorunlu tutulur.
- Bridge/repository yoksa success fail-open dönülmez.

## Idempotency Standardı

- `tenant_id + idempotency_key` uniqueness korunur.
- Duplicate approve ikinci outbox üretmez.
- Duplicate outbox enqueue aynı işi tekrar üretmez.

## Audit / Timeline Writeback

- Worker payload validation tenant/action/execution metadata zorunlu kılar.
- Eksik metadata non-retryable/dead-letter davranışına düşer.
- Partial success true gibi raporlanmaz.

## Worker Observability

- `/worker/*` yanında `/platform/worker/*` endpoint alias’ları bulunur.
- Health response outbox/dead-letter sayıları ve persistence mode bilgisi taşır.

## Production Fail-Closed Rules

- Production + postgres dışı worker persistence: unsupported/degraded.
- Silent in-memory fallback production’da kullanılmaz.
- Approved context/idempotency/audit-timeline metadata olmadan worker execution allow edilmez.

## Bu PR'da Yapılmayanlar

- Temporal/Cadence migration
- Tüm domain mutation’ların real execute edilmesi
- Full omnichannel provider live send
- Distributed scheduler orchestration
- Autonomous AI execution
