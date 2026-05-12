# Policy Engine Gap Report

## 2026-05-12 - Route Integration Phase 1

- Status: completed (controlled integration baseline)
- Scope:
  - `POST /users` mutation flow now runs policy decision after existing auth+permission guards.
  - `PATCH /settings` mutation flow now runs policy decision after existing auth+permission guards.
- Decision mapping:
  - `allow`: execution continues.
  - `deny`: fail-closed (`403 forbidden` via domain error handling).
  - `require_approval`: safe response (`202`), execution is not performed.
  - `require_more_info` / `require_handoff` / `draft_only`: fail-closed safe block response.
- Notes:
  - Existing tenant/auth/permission guard semantics were preserved.
  - Webhook signature/idempotency/duplicate guard behavior was not changed.
  - Read routes were intentionally left unchanged in this phase.

## 2026-05-12 - Approval Request ID Bridge (Phase)

- Status: completed
- `require_approval` kararinda response artik `approvalRequestId` icerir.
- Pending request metadata: `tenantId`, `actorId`, `actionKey`, `reasons`, `status=pending`, `createdAt`.
- Mutation execution bu fazda halen bloklu kalir, approval sonrasý replay yapýlmaz.
- DB yazimi bu fazin disinda tutuldu; bridge metadata ve test coverage eklendi.

## 2026-05-12 - Approval Execution Dispatcher Phase 1

- Status: completed (foundation)
- Added domain-level `dispatchApprovedAction(request)` with fail-closed behavior.
- Unknown action registry keys return `unsupported_action`.
- Critical actions without `approvalRequestId` are blocked.
- Duplicate `idempotencyKey` returns `duplicate` without re-dispatch.
- Handlers for `platform.users.create` and `platform.settings.update` are intentionally safe no-op (no real mutation wiring in this phase).
- `auditRequired` and `timelineRequired` flags are preserved from action registry into execution result.
- Note: idempotency store is in-memory foundation only; persistent idempotency storage remains a separate phase.

## 2026-05-12 - Action Execution Handler Registry Phase 1

- Status: completed (foundation)
- Added action execution handler contract and registry API:
  - `registerActionExecutionHandler`
  - `getActionExecutionHandler`
  - `hasActionExecutionHandler`
  - `listActionExecutionHandlers`
- Dispatcher now resolves handlers from handler registry (not inline map).
- Foundation handlers are registered for:
  - `platform.users.create`
  - `platform.settings.update`
- Both handlers are intentionally `supported=true` and `mode=dry_run`.
- No real domain mutation wiring is introduced in this phase.
- Duplicate idempotency guard and fail-closed `unsupported_action` behavior remain unchanged.

## 2026-05-12 - Execution Audit/Timeline Phase 1

- Status: completed (foundation)
- Dispatcher result now includes domain-level `executionLog` metadata.
- `auditEvent` and `timelineEvent` draft payloads are generated with:
  - `tenantId`
  - `actionKey`
  - `approvalRequestId`
  - `executionId`
  - `idempotencyKey`
  - `handlerKey` and `handlerMode`
- Handler safety checklist added:
  - `requiresApproval`
  - `mutatesState`
  - `externalWrite`
  - `idempotencyRequired`
  - `auditRequired`
  - `timelineRequired`
  - `dryRunOnly`
  - `realExecutionEnabled`
- `platform.users.create` and `platform.settings.update` remain `dry_run` with `realExecutionEnabled=false`.
- Duplicate idempotency remains fail-closed and does not re-run handler execution.
- Remaining gap (next phase): persistent execution log storage, real audit/timeline DB write-back, real handler wiring, rollback/replay strategy.

## 2026-05-12 - DB-Backed Execution Log/Audit/Timeline Phase 1

- Status: completed (persistence-ready foundation)
- Added execution persistence port contract:
  - `saveExecutionLog`
  - `saveAuditEventDraft`
  - `saveTimelineEventDraft`
  - `findByIdempotencyKey`
  - `getExecutionLog`
- Added safe in-memory repository adapter for test/development foundation.
- Dispatcher now accepts optional repository:
  - Repository provided: execution log and audit/timeline draft events are persisted via port.
  - Repository missing: result keeps current behavior with explicit `persistenceMode=none` and `persistenceSkipped=true`.
  - Repository save failure: fail-closed `failed` result with explicit persistence failure reasons.
- Duplicate idempotency behavior remains guarded and does not re-run handler execution.
- Remaining gap (next phase): real DB schema/migration, transaction boundary, retry/DLQ handling, worker write-back integration.

## 2026-05-12 - Worker/Outbox/Retry/DLQ Foundation

- Status: completed (domain-level foundation)
- Added worker job model with tenant-aware idempotent metadata and dead-letter fields.
- Added outbox contract primitives:
  - `createOutboxJob`
  - `markJobProcessing`
  - `markJobCompleted`
  - `markJobFailed`
  - `moveJobToDeadLetter`
  - `shouldRetryJob`
  - `calculateNextRetryAt`
- Added outbox repository port and in-memory adapter:
  - `enqueue`
  - `claimNext`
  - `complete`
  - `fail`
  - `moveToDeadLetter`
  - `findByIdempotencyKey`
  - `listJobs`
- Added worker handler registry and default safe handlers:
  - `approval.execution.dispatch`
  - `audit.timeline.writeback`
  - `notification.dispatch`
- Added worker runner foundation `processNextJob(...)` with fail-closed behavior:
  - no job -> `no_job`
  - unknown handler -> `dead_letter`
  - retryable failures -> `failed` + next retry time
  - max attempts / non-retryable -> `dead_letter`
- Duplicate idempotency key does not create/execute second job.
- Remaining gap (next phase): DB-backed outbox/dead-letter migrations, distributed claim lock/lease, worker lifecycle, retry-DLQ admin UI, provider-specific real handlers, real audit/timeline write-back, monitoring/alerts.

## 2026-05-12 - DB Schema Execution Worker Audit Phase 1

- Status: completed (schema/migration foundation)
- Added new migration: `0005_execution_worker_audit.sql`.
- Added persistent table foundations:
  - `approval_execution_logs`
  - `timeline_events`
  - `outbox_jobs`
  - `dead_letter_jobs`
- `audit_events` existing table was extended via safe `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` to avoid migration conflicts.
- Tenant-scoped idempotency constraints/indexes added for execution and outbox tables.
- Outbox scheduling index added: `(status, available_at)`.
- Remaining gap (next phase):
  - DB-backed write adapters with transaction boundaries
  - distributed lock / claim lease semantics
  - worker process lifecycle orchestration
  - retry/DLQ admin UI and replay
  - provider-specific real handlers
  - production migration apply/release sequencing validation

## 2026-05-12 - DB Repository + Transaction Foundation Phase

- Status: completed (foundation)
- Added database transaction boundary contract:
  - `withDatabaseTransaction(...)`
  - `createDatabaseTransactionRunner(...)`
  - transactional write helper for execution/audit/timeline grouping
- Added DB repository adapter foundations:
  - `DatabaseApprovalExecutionLogRepository`
  - `DatabaseOutboxJobRepository`
- Repository adapters are tenant-aware and idempotency-aware by contract.
- Persistence mode is fail-closed: `postgres` is required, demo mode does not silently succeed.
- Added repository mapping helpers and contract-level tests without requiring a live DB instance.
- Remaining gap (next phase):
  - real production DB client wiring into API/worker runtime
  - transactional approval-execution + outbox enqueue orchestration
  - distributed lock/lease hardening for job claim concurrency
  - DLQ admin replay and operational tooling

## 2026-05-12 - Transactional Approval Execution + Outbox Bridge Foundation

- Status: completed (foundation)
- Added transactional bridge function:
  - `executeApprovalWithOutboxBridge(request, options)`
- Bridge models these steps in one transaction boundary contract:
  1. approval execution dispatch
  2. execution log persistence
  3. audit event draft persistence
  4. timeline event draft persistence
  5. outbox enqueue
- Fail-closed behavior:
  - Missing transaction runner/repositories/dispatch returns explicit `unsupported`/`failed` (no fail-open success).
  - Partial persistence is not reported as success.
- Outbox behavior:
  - tenant-aware + idempotency-aware
  - payload carries `tenantId`, `actionKey`, `approvalRequestId`, `executionId`, handler mode and audit/timeline metadata
  - duplicate idempotency does not create second outbox job
- Remaining gap (next phase):
  - production DB transaction wiring into runtime
  - approval approve/reject API wiring
  - worker lifecycle orchestration and distributed lease hardening
  - real mutation handler activation under approval controls

## 2026-05-12 - Approval API + Transactional Bridge Trigger Foundation

- Status: completed (foundation)
- Added platform-core approval endpoints (prefixed to avoid route collisions):
  - `GET /platform/approvals`
  - `GET /platform/approvals/:approvalRequestId`
  - `POST /platform/approvals/:approvalRequestId/approve`
  - `POST /platform/approvals/:approvalRequestId/reject`
- Guard chain kept fail-closed: tenant/auth/permission checks enforced before approval actions.
- `approve` now triggers transactional approval-outbox bridge safely.
- `reject` does not trigger execution bridge.
- Duplicate approve/reject transitions handled safely (`already_processed` / conflict).
- Missing repository/bridge returns explicit unsupported/unavailable errors (no fail-open success).
- Remaining gap (next phase):
  - DB-backed pending approval repository/table
  - production runtime bridge wiring hardening
  - UI approval inbox integration
  - WhatsApp/Instagram approval command integration
