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

## Database-Backed Execution and Worker Event Tables (Phase 2)

- `audit_events` mevcut tablo yapisi bozulmadan kolon-genisletme ile execution/action metadata tasiyacak hale getirildi.
- Yeni `timeline_events` tablosu subject bazli timeline okumalarini kalici hale getirmek icin migration foundation olarak eklendi.
- Event write-back transaction boundary ve retention/archival policy sonraki release gorevlerindedir.

## Repository + Transaction Write-Back Foundation (Phase)

- Execution/audit/timeline write-back icin DB repository adapter foundation eklendi.
- Transaction boundary helper ile execution log + audit event draft + timeline event draft atomik yazim modeli tanimlandi.
- Bu fazda canli runtime wiring zorunlu kilinmadi; DB client baglantisi sonraki gorevde production akisina baglanacak.

## Transactional Execution-to-Outbox Bridge (Phase)

- Execution sonucundan uretilecek audit/timeline write-back draft'lari artik transactional bridge icinde outbox enqueue adimiyla birlikte ele alinabilir.
- Bridge sonucu executionLog/auditEvent/timelineEvent/outbox adimlarinin hangilerinin persisted oldugunu explicit metadata ile raporlar.
- Transaction/repository eksiginde fail-open davranis yoktur; explicit unsupported/failed sonucu donulur.

## Approval API Trigger Foundation (Phase)

- Approval API approve flow, execution/audit/timeline/outbox metadata'sini response seviyesinde gorunur kilar.
- Bu fazda metadata write-back foundation seviyesinde kalir; real provider write veya mutation activation acilmaz.
- Tenant/auth/permission guard zinciri korunur; repository/bridge eksiginde fail-open success yoktur.
