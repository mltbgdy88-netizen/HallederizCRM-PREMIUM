import assert from "node:assert/strict";
import test from "node:test";

test("demo submit does not return live success", async () => {
  const original = process.env.NEXT_PUBLIC_USE_DEMO_DATA;
  process.env.NEXT_PUBLIC_USE_DEMO_DATA = "true";
  try {
    const { submitQuickOperationRecord } = await import("../quick-operations.service.js");
    const result = await submitQuickOperationRecord({
      operationType: "sale_order",
      customerId: "customer_1",
      customerName: "Demo Cari",
      lines: [
        {
          id: "line_1",
          productCode: "DKG-1001",
          productName: "Demo Urun",
          quantity: 1,
          unitPrice: 100,
          taxRate: 20,
          sourceType: "center_warehouse",
          lineTotal: 120
        }
      ]
    });
    assert.equal(result.ok, false);
    assert.equal(result.demoPreviewOnly, true);
    assert.equal(result.mode, "foundation_blocked");
    assert.equal(result.createdEntityId, undefined);
  } finally {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_USE_DEMO_DATA;
    } else {
      process.env.NEXT_PUBLIC_USE_DEMO_DATA = original;
    }
  }
});
