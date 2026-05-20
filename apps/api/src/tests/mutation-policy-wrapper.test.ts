import assert from "node:assert/strict";
import test from "node:test";
import { getPolicyAction, validateStandardOutboxPayload } from "@hallederiz/domain";

test("payments.confirm action requires idempotency and approval", () => {
  const action = getPolicyAction("platform.payments.confirm");
  assert.ok(action);
  assert.equal(action?.idempotencyRequired, true);
  assert.equal(action?.approvalRequired, true);
  assert.equal(action?.auditRequired, true);
});

test("standard outbox payload rejects missing tenantId", () => {
  const reasons = validateStandardOutboxPayload({
    actionKey: "approval.execution.dispatch",
    idempotencyKey: "idem_1"
  });
  assert.ok(reasons.includes("missing_tenant_id"));
});
