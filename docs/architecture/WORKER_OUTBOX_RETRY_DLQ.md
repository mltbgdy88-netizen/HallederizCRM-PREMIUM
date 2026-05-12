# Worker Outbox Retry DLQ Foundation

## Scope

Bu dokuman, production worker loop veya DB migration eklemeden worker/outbox/retry/DLQ foundation katmanini aciklar.

## Domain Modelleri

- `WorkerJob`
- `WorkerJobStatus`: `pending | processing | completed | failed | dead_letter`
- `ProcessNextJobResult`

## Outbox Contract

- `createOutboxJob`
- `markJobProcessing`
- `markJobCompleted`
- `markJobFailed`
- `moveJobToDeadLetter`
- `shouldRetryJob`
- `calculateNextRetryAt`
- `classifyWorkerError`

## Repository Port

- `OutboxJobRepository`
  - `enqueue`
  - `claimNext`
  - `complete`
  - `fail`
  - `moveToDeadLetter`
  - `findByIdempotencyKey`
  - `listJobs`

## In-Memory Adapter

- `InMemoryOutboxJobRepository`
- Sadece foundation/test-development kullanimi icin tasarlanmistir.
- Production persistence yerine sessiz fail-open davranisi uretmez.

## Handler Registry

- `registerWorkerJobHandler`
- `getWorkerJobHandler`
- `hasWorkerJobHandler`
- `listWorkerJobHandlers`

Default foundation handler'lar:
- `approval.execution.dispatch`
- `audit.timeline.writeback`
- `notification.dispatch`

Bu handler'lar `dry_run` modundadir ve gercek provider veya gercek mutation yazmaz.

## Runner

- `processNextJob(repository, options)`
- Job yoksa `no_job`
- Handler yoksa `dead_letter`
- Retryable hata: `failed` + ileri `availableAt`
- Max attempt veya non-retryable hata: `dead_letter`
- Idempotency: duplicate key icin ikinci job uretimi engellenir.

## Sonraki Fazlar

- DB-backed `outbox_jobs` / `dead_letter_jobs` migration
- Distributed claim lock / lease
- Worker process lifecycle ve graceful shutdown
- Retry ve DLQ admin operasyonlari
- Provider-specific real handlers
- Real audit/timeline write-back pipeline
- Metrics, alerts, tracing

## DB-Backed Table Phase

- Bu dokumandaki domain-level worker/outbox foundation artik DB migration tabanli tablo hazirligina sahip:
  - `outbox_jobs`
  - `dead_letter_jobs`
- Bu faz sadece schema temelidir; distributed lock/lease, claim timeout recovery, DLQ replay UI ve provider-specific handlerlar sonraki adimlardadir.

## DB Repository + Transaction Foundation (Phase)

- Worker/outbox foundation icin DB repository adapter + transaction boundary katmani eklendi.
- `DatabaseOutboxJobRepository` claim/complete/fail/dead-letter akisini kalici tablo sozlesmesine baglayacak foundation olarak eklendi.
- `postgres` persistence mode zorunlu tutuldu; demo mode fail-open davranmaz.
- Sonraki faz: runtime wiring, distributed lock/lease hardening ve DLQ replay operasyonlari.

## Transactional Approval-Outbox Bridge Foundation (Phase)

- Approval execution dispatch sonucu, execution/audit/timeline persistence adimlari ile outbox enqueue tek bridge akisi olarak modellenmistir.
- Outbox payload tenantId, actionKey, approvalRequestId, executionId ve handler mode bilgilerini tasir.
- Duplicate idempotencyKey ikinci outbox kaydini uretmez.
- Runtime worker lifecycle ve production orchestration sonraki faz olarak kalir.

## Approval API -> Outbox Trigger Foundation (Phase)

- Approval API `approve` endpoint'i transactional bridge tetikleyerek outbox payload uretimini baslatir.
- Outbox payload tenant/action/approval/execution baglamini tasir.
- Bu fazda production worker lifecycle ve real provider handler wiring kapsam disidir.

## Pending Approval Repository Foundation Note

- Approval API ve policy bridge tarafi pending approval request lifecycle'ini repository kontratiyla yonetecek sekilde standardize edildi.
- Bu faz in-memory/test adapter ile sinirlidir.
- DB-backed `pending_approval_requests` tablo + adapter wiring sonraki fazdadir.

## Pending Approval DB Foundation Update

- `pending_approval_requests` migration ve schema foundation eklendi.
- DB pending approval repository adapter foundation eklendi.
- Worker/outbox dokumani acisindan pending approval kaliciligi artik migration + adapter seviyesinde hazirdir.
- Kalan faz: production runtime wiring, UI inbox ve channel command entegrasyonu.

## Worker Runtime Claim/Lease Foundation (Phase)

- Outbox job processing icin tick-bazli runtime claim/lease foundation eklendi.
- `processWorkerTick` ve `processClaimedJob` ile:
  - claim (pending|failed + availableAt)
  - lease metadata (workerId/lockedAt/claimLeaseMs)
  - retry/dead-letter karar akisi
  - duplicate idempotency korumasi
  modelleri foundation seviyesinde calisir.
- `approval.execution.dispatch` handler'i dry_run/noop guvenli modda payload validation yapar.
- Bu fazda production sonsuz worker loop/daemon baslatilmaz.
- Sonraki faz: DB-level atomic distributed claim lock/lease hardening ve runtime lifecycle orchestration.

## DB-Level Atomic Worker Claim Foundation (Phase)

- DB outbox claim contract foundation eklendi: `buildClaimNextOutboxJobSql`, `mapClaimedOutboxJobRow`, `calculateLeaseExpiresAt`, `isOutboxJobClaimEligible`.
- Claim yalnizca `pending|failed`, `available_at <= now` ve `locked_at IS NULL OR lease expired` kosullarinda calisir.
- `FOR UPDATE SKIP LOCKED` foundation seviyesinde kullanilir; production distributed worker daemon lifecycle sonraki fazdir.
- `leaseExpiresAt` domain metadata olarak `locked_at + claimLeaseMs` turetilir; ayri DB kolonu yoktur.
- Demo/non-postgres persistence fail-open claim success uretmez.
- Sonraki faz:
  - production worker daemon lifecycle orchestration
  - DLQ replay/admin API
  - monitoring/metrics/alerts
  - real mutation handler activation

## Worker Runtime Processing Pack Foundation (Phase)

- `createWorkerRuntimeApp` lifecycle contract eklendi; import sirasinda sonsuz worker loop baslatilmaz.
- Outbox processor tick summary (`processed`, `completed`, `failed`, `deadLettered`, `retried`, `noJob`, `mode`, `workerId`, `persistenceMode`) foundation seviyesinde modellenir.
- Worker admin API foundation eklendi: `/worker/health`, `/worker/outbox`, `/worker/dead-letter`, `/worker/dead-letter/:jobId/replay`.
- DLQ replay foundation yalnizca guvenli test adapter ile pending job uretir; gercek provider/mutation calistirmaz.
- Production daemon lifecycle, metrics exporter ve admin UI sonraki fazdir.

## Approval Execution Runtime Handoff (Phase)

- Approval approve runtime orchestration, bridge sonrasi outbox handoff metadata'sini API response'una standardize eder.
- `approval.execution.dispatch` payload contract'i (`tenantId`, `actionKey`, `approvalRequestId`, `executionId`) worker runtime ile uyumlu kalir.
- Duplicate approve outbox tekrar uretmez; worker tarafina yeni job dispatch edilmez.
- Bridge failure approval status'u `approved` yapmadan fail-closed kalir; worker queue'ya yanlis handoff yapilmaz.

## Audit/Timeline Write-Back Handoff (Phase)

- Transactional bridge outbox payload'i audit/timeline write-back icin gerekli payload metadata'sini tasir.
- `audit.timeline.writeback` handler kontrati su alanlari bekler:
  - `tenantId`
  - `actionKey`
  - `approvalRequestId`
  - `executionId`
  - `auditTimelineWritebackPayload`
- Missing/invalid payload non-retryable dead-letter davranisina gider.
- Valid payload foundation modda guvenli tamamlanir; external provider/mutation execution acikca kapali kalir.
