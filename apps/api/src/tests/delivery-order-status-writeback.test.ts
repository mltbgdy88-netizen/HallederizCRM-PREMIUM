import assert from "node:assert/strict";
import test from "node:test";
import { calculateReturnImpact, deriveOrderCompletionState, resolveOrderStatusAfterDeliveryRollback } from "@hallederiz/domain";
import type { Delivery, Return } from "@hallederiz/types";

function deliveryWithStatus(status: Delivery["status"]): Delivery {
  return {
    id: "delivery_test_1",
    tenantId: "tenant_1",
    deliveryNo: "DLV-T1",
    orderId: "order_1",
    orderNo: "SO-1",
    customerId: "customer_1",
    status,
    plannedAt: "2026-01-01T00:00:00.000Z",
    documentStatus: "missing",
    validation: {
      customerVerified: true,
      orderMatched: true,
      warehouseReady: true,
      paymentMissing: false,
      approvalRequired: false,
      riskNote: "",
      valid: true,
      blockers: []
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    lines: []
  };
}

test("deriveOrderCompletionState: all delivered -> delivered", () => {
  assert.equal(deriveOrderCompletionState([deliveryWithStatus("delivered")]), "delivered");
});

test("deriveOrderCompletionState: rolled_back dominates -> ready", () => {
  assert.equal(
    deriveOrderCompletionState([deliveryWithStatus("delivered"), deliveryWithStatus("rolled_back")]),
    "ready"
  );
});

test("deriveOrderCompletionState: partially_delivered", () => {
  assert.equal(deriveOrderCompletionState([deliveryWithStatus("partially_delivered")]), "partially_delivered");
});

test("deriveOrderCompletionState: ready without full delivery -> ready", () => {
  assert.equal(deriveOrderCompletionState([deliveryWithStatus("ready")]), "ready");
});

test("deriveOrderCompletionState: empty -> in_preparation", () => {
  assert.equal(deriveOrderCompletionState([]), "in_preparation");
});

test("resolveOrderStatusAfterDeliveryRollback: completed -> partially_delivered", () => {
  assert.equal(resolveOrderStatusAfterDeliveryRollback("completed"), "partially_delivered");
});

test("resolveOrderStatusAfterDeliveryRollback: other statuses unchanged", () => {
  assert.equal(resolveOrderStatusAfterDeliveryRollback("in_preparation"), "in_preparation");
  assert.equal(resolveOrderStatusAfterDeliveryRollback("delivered"), "delivered");
});

test("calculateReturnImpact: quantity drives stockImpact and approval threshold", () => {
  const base: Return = {
    id: "return_1",
    tenantId: "tenant_1",
    returnNo: "RET-1",
    customerId: "customer_1",
    orderId: "order_1",
    status: "draft",
    note: "test",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    lines: [
      {
        id: "rl1",
        returnId: "return_1",
        orderLineId: "ol1",
        productId: "p1",
        productCode: "X",
        productName: "Y",
        quantity: 12,
        reasonCategory: "other",
        note: ""
      }
    ]
  };
  const impact = calculateReturnImpact(base);
  assert.equal(impact.stockImpact, 12);
  assert.equal(impact.approvalRequired, true);
});

test("calculateReturnImpact: quality reason forces approval", () => {
  const ret: Return = {
    id: "return_2",
    tenantId: "tenant_1",
    returnNo: "RET-2",
    customerId: "customer_1",
    orderId: "order_1",
    status: "draft",
    note: "test",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    lines: [
      {
        id: "rl2",
        returnId: "return_2",
        orderLineId: "ol1",
        productId: "p1",
        productCode: "X",
        productName: "Y",
        quantity: 2,
        reasonCategory: "quality",
        note: ""
      }
    ]
  };
  assert.equal(calculateReturnImpact(ret).approvalRequired, true);
});
