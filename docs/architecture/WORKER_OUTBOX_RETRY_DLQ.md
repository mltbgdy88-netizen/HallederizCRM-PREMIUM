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
