import assert from "node:assert/strict";
import test from "node:test";
import { QuickOperationsService } from "../modules/quick-operations/service";
import type { RequestContext } from "../shared/request-context";

const context: RequestContext = {
  tenantId: "tenant_1",
  userId: "user_admin",
  persistenceMode: "demo",
  roles: ["admin"],
  permissions: ["offers.write", "orders.write", "payments.write", "customers.read"]
};

test("quick operation submit returns approvalId when policy requires approval", async () => {
  const service = new QuickOperationsService(context);
  const result = await service.submitQuickOperation({
    operationType: "offer",
    customerId: "customer_1",
    customerName: "Demo Cari",
    lines: [
      {
        id: "line_1",
        productCode: "DKG-1001",
        productName: "Test Urun",
        quantity: 1,
        unitPrice: 100,
        taxRate: 20,
        sourceType: "auto",
        lineTotal: 120
      }
    ]
  });

  assert.equal(result.ok, true);
  assert.ok(result.approvalId);
  assert.equal(result.createdEntityId, undefined);
});
