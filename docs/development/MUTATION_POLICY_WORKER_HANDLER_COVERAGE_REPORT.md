# Mutation Policy + Worker Handler Coverage Report

## Özet

Sprint 2 kapsamında kritik ticari mutation route’ları `withMutationPolicy` ile genişletildi, commercial line tabloları migration registry’ye alındı, worker contract handler’ları payload doğrulama ve deferred semantiği ile güçlendirildi, timeline read API ve detail ekranlarında işlem geçmişi paneli eklendi.

## Değişen modüller

- `packages/database` — `0014_commercial_line_tables.sql`, repositories, migration registry
- `packages/domain` — action registry, outbox job validation, contract handlers
- `packages/types` — `commercial-lines.ts`, `EntityTimelineItem`
- `packages/sdk` — `PlatformClient.listEntityTimeline`
- `apps/api` — commercial routes, timeline routes, entity timeline service, tests
- `apps/web` — `EntityTimelinePanel`, document/customer/approval detail wiring

## Mutation policy coverage

### Sarılan route’lar (ek)

| Route | Action key |
|-------|------------|
| POST `/orders/:id/confirm` | `platform.orders.confirm` |
| POST `/orders/:id/cancel` | `platform.orders.cancel` |
| POST `/deliveries/:id/complete` | `platform.deliveries.complete` |
| POST `/invoices/:id/issue` | `platform.invoices.issue` |
| POST `/returns/:id/approve` | `platform.returns.approve` |
| POST `/documents/:id/regenerate` | `platform.documents.regenerate` |
| POST `/documents/:id/send-whatsapp` | `platform.documents.send_whatsapp` |
| POST `/documents/:id/send-email` | `platform.documents.send_email` |
| POST `/payments/:id/confirm` | (PR #120, korundu) |
| POST `/payments/:id/reverse` | (PR #120, korundu) |

### Backlog

- `POST /documents/render` — hâlâ `enforcePolicyForRoute` (migrate edilebilir)
- `POST /quick-operations/submit`
- `POST /approvals/:id/execute` (operations-engine; platform approval bridge ayrı)
- Omnichannel reply — `enforcePolicyForRoute` + provider guard (wrapper birleştirilebilir)
- Warehouse/factory/ERP mutation’ları
- `POST /documents/:id/queue-save|queue-print` (ai-local-output-routes)

## Approval → outbox enqueue integration

- Mevcut `executeApprovalWithOutboxBridge` korundu (platform approval routes + postgres path).
- Yeni test: `approval-outbox-enqueue.integration.test.ts` (memory repository + duplicate idempotency).
- Postgres E2E: `DATABASE_URL` yoksa placeholder test skip.

## Worker live handler foundation

| Job type | Davranış |
|----------|----------|
| `approval_execution` | Payload validate → `deferred` (`domain_execution_handler_not_wired`) |
| `ai_reply_send` | Payload validate → deferred |
| `integration_sync` | Payload validate → deferred |
| `document_render` / `document_archive` | Mevcut handler (renderer/archive yoksa deferred) |

`validateStandardJobPayload` job type’a göre ek alan kontrolü yapar. `ok: true` yalnızca gerçek mutation sonrası (handler implementasyonu sonraki sprint).

## Commercial line table migration parity

Migration: `0014_commercial_line_tables.sql`

Tablolar: `payment_reversals`, `delivery_lines`, `invoice_lines`, `return_lines`, `document_deliveries`

Repositories (foundation): `DatabasePaymentReversalRepository`, `DatabaseDocumentDeliveryRepository`

## Audit/timeline UI visibility

- API: `GET /timeline?entityType=&entityId=`
- SDK: `sdk.platform.listEntityTimeline`
- UI: `EntityTimelinePanel` — Document detail, Customer sidebar, Approval detail
- Demo modda panel boş state (API çağrısı yapılmaz)

## Demo / production davranışı

- Production audit failure → 503 (korundu)
- Worker unsupported → `mutation_executed:false`
- Timeline panel teknik hata göstermez

## Kalan boşluklar

- Worker live domain execution (approval → gerçek order/payment create)
- Full Postgres integration test suite
- Omnichannel reply `withMutationPolicy` birleşimi
- Payment detail sayfasında timeline panel
- Line table read/write route’ları (repository insert-only foundation)

## Test sonuçları

| Komut | Sonuç |
|-------|--------|
| types/database/domain/sdk build | geçti |
| api/web typecheck | geçti |
| web build | geçti |
| pnpm test | 400/400 geçti |
| test:web-navigation | geçti |
| smoke:routes/navigation/api-offline/all | geçti |

## Sonraki faz önerisi

1. Quick operation submit + approval execute unified policy wrapper
2. Worker approval_execution → domain handler mapping
3. Postgres integration test CI job
4. Document delivery status transitions + UI
