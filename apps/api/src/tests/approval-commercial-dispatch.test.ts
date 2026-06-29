import assert from "node:assert/strict";
import test from "node:test";
import { resetExecutionDispatcherState } from "@hallederiz/domain";
import { bootstrapApprovalCommercialActionHandlers } from "../shared/approval-commercial-action-handlers";
import { dispatchApprovedActionWithCommercialExecution } from "../shared/approval-commercial-dispatch";
import { withDemoAuth } from "./test-env";

test("commercial dispatch executes quick operation offer with real mutation in demo", async () => {
  await withDemoAuth(async () => {
    resetExecutionDispatcherState();
    bootstrapApprovalCommercialActionHandlers();

    const result = await dispatchApprovedActionWithCommercialExecution(
      {
        tenantId: "tenant_1",
        approvalRequestId: "apr_dispatch_1",
        actionKey: "platform.offers.create",
        actorId: "user_1",
        approvedBy: "user_1",
        payload: {
          source: "quick-operations.submit",
          operationType: "offer",
          customerId: "customer_1",
          lines: [
            {
              id: "line_1",
              productCode: "P1",
              productName: "Test Urun",
              quantity: 1,
              unitPrice: 100,
              lineTotal: 100
            }
          ]
        },
        idempotencyKey: "idem_dispatch_offer_1",
        requestedAt: "2026-06-29T10:00:00.000Z",
        approvedAt: "2026-06-29T10:01:00.000Z"
      },
      {
        tenantId: "tenant_1",
        userId: "user_1",
        persistenceMode: "demo",
        isAuthenticated: true,
        roles: ["admin"],
        permissions: ["offers.write", "orders.write", "payments.write"]
      }
    );

    assert.equal(result.status, "executed");
    assert.equal(result.mutationExecuted, true);
    assert.ok(result.reasons.some((reason) => reason.includes("quick_operation_entity_created")));
    assert.ok(result.reasons.some((reason) => reason.startsWith("entity_id:")));
  });
});
