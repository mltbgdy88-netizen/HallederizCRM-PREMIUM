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
