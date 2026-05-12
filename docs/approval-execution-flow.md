# Approval Execution Flow

## Zincir

`approval -> execution record -> dispatcher -> domain action -> audit/timeline`

## Adimlar

1. AI veya sistem bir mutation onerisi uretir.
2. Onay kaydi (`approval`) olusur.
3. Onaylandiginda execution kaydi (`approval_execution`) authorized olur.
4. `POST /approval-executions/:id/run` cagrisi dispatcher'i tetikler.
5. Dispatcher `operationType` uzerinden domain aksiyonu calistirir.
6. Sonuc:
   - `executed` + result
   - veya `failed` + error message
7. Audit event yazilir.

## Dispatch Edilen Aksiyonlar

- `create_offer`
- `create_order`
- `update_order_status`
- `create_payment`
- `mark_warehouse_ready`
- `complete_delivery`
- `create_invoice`
- `create_return`
- `send_document_whatsapp`
- `queue_document_save`
- `queue_document_print`

## Hata Davranisi

- Desteklenmeyen action: failed
- Domain kaydi bulunamadi: failed
- Execution result `message` alanina acik hata nedeni yazilir.
- Failure message sonuna retryability etiketi eklenir:
  - `[RETRYABLE]`
  - `[NON_RETRYABLE]`
- Cancel edilen execution kayitlari `approval.execution.cancelled` audit eventi uretir.

## Sonraki Asama

- Retryable vs non-retryable hata siniflamasi DB seviyesinde saklanacak.
- Job retry policy ve backoff stratejisi eklenecek.

## Phase 1 Execution Log + Audit/Timeline Event Draft

- Dispatcher sonucu artik domain-level `executionLog` metadata'si uretir.
- `auditEvent` ve `timelineEvent` draft payload'lari tenant/action/approval/execution baglami ile result icinde tasinir.
- Bu fazda DB kaliciligi yoktur; sadece foundation metadata uretimi vardir.
- Gercek audit/timeline write-back ve execution log persistence sonraki fazlara birakilmistir.

## Phase 2 DB-Backed Persistence Preparation

- Dispatcher artik opsiyonel execution persistence repository portu alabilir.
- Repository verildiginde execution log + audit/timeline draft eventleri repository kontrati uzerinden kaydedilir.
- Repository yoksa davranis bozulmaz; result `persistenceMode` ve `persistenceSkipped` alanlari ile acikca isaretlenir.
- Repository save hatalarinda fail-closed `failed` sonucu uretilir.
- Bu fazda gercek DB schema/migration, transaction boundary, retry/DLQ ve worker write-back kapsam disinda kalir.

## Phase 3 Worker Outbox Retry DLQ Foundation

- Approval execution sonrasi write-back isleri icin worker/outbox/retry/DLQ foundation katmani eklendi.
- Worker flow su an domain-level ve dry_run odaklidir; production loop veya provider write acilmadi.
- Outbox job contract idempotency, retry backoff ve dead-letter gecisini fail-closed prensibiyle tanimlar.
- Sonraki fazda DB-backed outbox/dead-letter tablolari, distributed claim lock ve gercek handler wiring eklenecek.

## Phase 4 Database Table Foundation (Execution + Worker)

- `approval_execution_logs`, `timeline_events`, `outbox_jobs` ve `dead_letter_jobs` icin kalici tablo migration foundation'i eklendi.
- `audit_events` tablosu mevcut AI foundation ile cakismayi onlemek icin `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` ile genisletildi.
- Bu faz sadece schema/migration hazirligidir; gercek transaction boundary, replay orchestration ve worker process lifecycle sonraki fazlardadir.

## Phase 5 DB Repository + Transaction Boundary Foundation

- `approval_execution_logs`, `audit_events`, `timeline_events`, `outbox_jobs`, `dead_letter_jobs` tablolari icin DB repository adapter foundation eklendi.
- Transaction boundary helper ile execution log + audit/timeline event draft yazimlari tek transaction sozlesmesine alinabildi.
- Fail-closed guvenlik: demo mode persistence denemeleri sessiz basari donmez, explicit hata uretir.
- Bu fazda production runtime wiring, distributed lock/lease orchestration ve replay pipeline kapsam disinda tutuldu.
