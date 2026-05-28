# Live Worker + Commercial Execution Report

## Özet

PR #121 sonrası `feat/live-worker-and-commercial-execution` branch’inde worker handler sonuç sözleşmesi sıkılaştırıldı, domain execution port eklendi, ticari line read route’ları ve payment reversal / document delivery API foundation tamamlandı, payment detail timeline paneli bağlandı.

## Değişen modüller

| Modül | Değişiklik |
|-------|------------|
| `packages/domain/src/worker` | `handle-result`, `execution-port`, async handler contract, `completed` yalnız `mutation_executed:true` |
| `apps/api/src/shared` | `worker-domain-execution-port`, `approval-commercial-action-handlers`, `mutation-timeline-summary` |
| `apps/api/src/commercial-operations` | Reversal/delivery/line route’ları |
| `apps/api/src/modules/commercial-core` | Repository: reversal/delivery/line + queued document delivery |
| `packages/database` | `commercial-line-repository` |
| `packages/sdk` | Payments reversals, documents deliveries |
| `apps/web` | Payment detail `EntityTimelinePanel` |

## Worker live domain execution

- `approval_execution`, `ai_reply_send`, `integration_sync`, `document_render`, `document_archive` → `WorkerDomainExecutionPort` üzerinden yönlendirilir.
- Port kayıtlı değilse veya gerçek mutation yoksa **deferred** (`ok:false`, `mutation_executed:false`).
- `approval.execution.dispatch` / `audit.timeline.writeback` foundation handler’ları artık `ok:true` + fake complete dönmüyor; deferred.
- Production: handler `liveReady` + gerçek mutation olmadan job **complete edilmez**.

## Approval → outbox → worker

- Quick Operation action handler’ları (`platform.offers|orders|payments.create`) kayıtlı; approve anında payload doğrulanır, mutation approve path’te yapılmaz (`worker_follow_up_required`).
- Worker tick testi: `approval.execution.dispatch` ve `approval_execution` job’ları mutation olmadan complete edilmez.
- Duplicate idempotency: ikinci tick `duplicate` status.

## Quick Operation approval execution

- Payload validation: `customerId`, `lines`, `operationType` zorunlu.
- Sahte `entityId` üretilmez.
- Postgres + port ile worker tarafında gerçek create denemesi (demo ortamda deferred).
- Full entity line mapping sonraki faz.

## Payment reversal API/service

- `GET /payments/:id/reversals`
- `POST /payments/:id/reversals` (`withMutationPolicy`, `platform.payments.reverse`)
- Postgres: `DatabasePaymentReversalRepository.insert` + payment status `reversed`
- SDK: `listReversals`, `createReversal`

## Document delivery API/service

- `GET /documents/:id/deliveries`
- Send route’lar: `document_deliveries` kaydı **queued** (sahte `sent` kaldırıldı)
- SDK: `documents.listDeliveries`

## Commercial line routes

- `GET /deliveries/:id/lines`
- `GET /invoices/:id/lines`
- `GET /returns/:id/lines`
- Postgres read via `DatabaseCommercialLineRepository`; demo boş liste.

## Payment detail timeline

- `PaymentDetailPage` sidebar: `EntityTimelinePanel` (`entityType="payment"`).
- Türkçe empty/error metinleri; teknik reason UI’da yok.

## Audit/timeline enrichment

- `mutation-timeline-summary.ts`: order/delivery/invoice/return/document/payment action’ları için Türkçe title/description.

## Demo / production davranışı

- Demo: line/reversal/delivery listeleri boş; worker port quick-op için deferred.
- Production postgres: reversal insert + queued delivery; worker handler `liveReady` gerekir.
- Fail-closed: mutation policy audit production’da korunur.

## Security / redaction

- Mevcut audit redaction korunur; timeline summary teknik terim içermez.

## Kalan boşluklar

- Full `DATABASE_URL` Postgres E2E (external harness).
- Quick Operation satır mapping ile tam entity create.
- AI `ai_reply_send` live provider (Meta/WhatsApp).
- `document_archive` persistence + `ArchiveService` postgres write.
- `DOCUMENT_RENDERER_URL` adapter implementasyonu.
- Payment detail reversals list UI (API/SDK hazır).

## Sonraki faz önerileri

1. Postgres E2E: approve → outbox → worker → audit/timeline assert.
2. Omnichannel outbound adapter + `ai_reply_jobs` processor.
3. Archive write repository + worker `document_archive` completed path.
4. Payment detail reversals panel + live confirm/reverse mutations (web).

## Test sonuçları

Test matrisi commit öncesi `pnpm test` ve smoke komutları ile doğrulanır.
