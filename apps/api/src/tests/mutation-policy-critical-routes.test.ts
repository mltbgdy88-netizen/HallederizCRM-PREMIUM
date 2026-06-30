import assert from "node:assert/strict";
import test from "node:test";
import { getPolicyAction } from "@hallederiz/domain";

const CRITICAL_ACTION_KEYS = [
  "platform.orders.confirm",
  "platform.orders.cancel",
  "platform.deliveries.complete",
  "platform.invoices.issue",
  "platform.documents.generate",
  "platform.documents.regenerate",
  "platform.documents.send_whatsapp",
  "platform.documents.send_email",
  "platform.returns.approve"
];

test("critical commercial mutation actions are registered with audit and idempotency", () => {
  for (const actionKey of CRITICAL_ACTION_KEYS) {
    const action = getPolicyAction(actionKey);
    assert.ok(action, `missing action ${actionKey}`);
    assert.equal(action?.auditRequired, true);
    assert.equal(action?.idempotencyRequired, true);
  }
});
