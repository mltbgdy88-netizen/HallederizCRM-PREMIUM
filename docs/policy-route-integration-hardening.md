# Policy Route Integration Hardening

## Standard Enforcement Order
1. `withGuards` + request context resolve
2. `assertAuthenticated`
3. tenant mismatch fail-closed
4. permission assertion
5. `evaluatePolicyEngine`
6. route decision mapping:
- `deny` -> fail-closed
- `dry_run_only` -> 202 metadata, no mutation
- `require_approval` -> approval persistence response, no mutation
- `allow` -> controlled route mutation
7. audit/timeline/usage obligations metadata propagation

## Guard Boundary Rule
Policy engine does not replace tenant/auth/permission guards. Guard chain must pass first. Policy is an additional decision layer.

## Approval-First Mutation Standard
Critical write/execute actions are approval-first. Route mutation is blocked when policy returns `require_approval` or `dry_run_only`.

## AI Action Safety Boundary
- `platform.ai.propose` can proceed in controlled proposal mode.
- `platform.ai.execute` cannot run direct critical mutation from API route.
- API route returns policy metadata (`dry_run_only` or `require_approval`) and keeps mutation blocked.

## WhatsApp and Channel Safety Boundary
- Existing webhook signature/token/phone/channel-window security remains primary.
- Policy channel metadata is additive and cannot bypass webhook security checks.
- `platform.whatsapp.approval_command` remains constrained with channel obligations.

## Worker Approved Execution Standard
- Worker dispatch continues to require approved context, idempotency key, and audit/timeline metadata.
- `worker.approval.dispatch` path is policy-evaluated in handler-level foundation checks.

## Usage and Obligation Handling
Route-level enforcement now propagates obligations (`requireApproval`, `requireIdempotencyKey`, `requireAuditTimeline`, `requireUsageRecord`) in policy response metadata.

## New Route Integration Checklist
1. Add guard chain (`assertAuthenticated`, tenant, permission).
2. Call shared route policy enforcement helper with `actionKey`.
3. Return policy response immediately when handled.
4. Keep mutation path unchanged for `allow`.
5. Include minimal payload metadata for approval/usage context.
6. Add tests for unauth, tenant mismatch, permission deny, policy decision, and mutation block behavior.

## Out of Scope in This PR
- Full omnichannel inbox orchestration
- Durable workflow migration
- Full refactor across all commercial routes
- Autonomous AI execution
- Real social channel provider implementations
