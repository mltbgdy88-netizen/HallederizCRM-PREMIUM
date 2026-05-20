/**
 * Approval execute → outbox enqueue — reuses bridge contract tests.
 * See transactional-approval-outbox-bridge.test.ts for full harness.
 */
import test from "node:test";

test("approval outbox enqueue covered by transactional-approval-outbox-bridge suite", () => {
  // Integration contract validated in transactional-approval-outbox-bridge.test.ts:
  // - successful dry_run dispatch persists execution/audit/timeline and enqueues outbox
  // - duplicate idempotencyKey does not enqueue second outbox job
});
