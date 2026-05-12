# Audit Timeline Model

## Model

`AuditEventRecord`

- `id`
- `tenantId`
- `entityType`
- `entityId`
- `eventType`
- `title`
- `description`
- `actorType` (`user|system|ai|whatsapp`)
- `actorId`
- `actorName`
- `createdAt`
- `payload`

## Yazan Katman

- `recordAuditEvent(context, input)` helper'i
- merkezi dosya: `apps/api/src/shared/audit-timeline.ts`

## Okuma Endpointleri

- `GET /audit-events?entityType=&entityId=`
- `GET /entity-timelines/:entityType/:entityId`

## Batch-2 Icinde Timeline'a Dusen Olaylar

- customer create/update/relations/pricing-profile
- product create/update + price/category/exchange policy update
- offer create/update/line/followup/send/convert
- order/payment/warehouse/delivery/invoice/return kritik writes
- approval approve/reject/execute
- ai proposal approve/reject + execution sonuc olaylari
- document render/regenerate/queue-save/queue-print

## Not

Bu batch'te audit olaylari in-memory tutulur. Sonraki batch'te DB persistence (`audit_events`, `entity_timelines`) katmanina tasinacaktir.


## Core Completion Batch Ekleri

- Payment confirm/reverse eventleri timeline'a yazilir.
- Warehouse assign/start/prepared/cancel eventleri timeline'a yazilir.
- Local output print/file job start-complete-fail eventleri timeline'a yazilir.
- Approval execution cancel eventleri timeline'a yazilir.


## Execution Write-Back Foundation (Phase 1)

- Approval execution sonucu uretilecek execution log ve audit/timeline eventleri icin repository portu tanimlandi.
- Port sadece write-back kontratini netlestirir; bu fazda production DB write zorunlu kilinmadi.
- Event draft payload minimum olarak `tenantId`, `actionKey`, `approvalRequestId`, `executionId`, `idempotencyKey` alanlarini tasir.
- Kalici DB schema/migration, transactional write-back ve retry/DLQ stratejisi sonraki fazlara birakildi.
