import assert from "node:assert/strict";
import test from "node:test";
import {
  validateInvoiceLineArithmetic,
  validateInvoiceLinesAgainstOrder,
  validateReturnLinesAgainstOrder
} from "@hallederiz/domain";
import type { InvoiceLine, ReturnLine, SaleOrder } from "@hallederiz/types";

const sampleOrder: SaleOrder = {
  id: "order_x",
  tenantId: "tenant_1",
  orderNo: "SO-X",
  customerId: "customer_1",
  offerId: undefined,
  status: "confirmed",
  paymentStatus: "unpaid",
  deliveryStatus: "none",
  channel: "field",
  deliveryType: "warehouse",
  currency: "TRY",
  subtotal: 100,
  taxRate: 20,
  taxTotal: 20,
  grandTotal: 120,
  paidTotal: 0,
  priceSlotNoSnapshot: 1,
  priceSlotLabelSnapshot: "A",
  source: "manual",
  createdBy: "user_admin",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  lines: [
    {
      id: "ol_1",
      orderId: "order_x",
      productId: "p1",
      productCode: "P1",
      productName: "Urun 1",
      quantity: 10,
      unitPrice: 100,
      currency: "TRY",
      exchangeRate: 1,
      tlUnitPrice: 100,
      lineTotal: 1000,
      tlLineTotal: 1000,
      priceSlotNo: 1,
      priceSlotLabelSnapshot: "A",
      sourcePreference: "warehouse",
      centerStockSnapshot: 0,
      factoryStockSnapshot: 0,
      preparedQuantity: 0,
      deliveredQuantity: 0
    }
  ],
  sourcePlans: []
};

function invoiceLine(overrides: Partial<InvoiceLine> & Pick<InvoiceLine, "quantity" | "unitPrice" | "taxRate">): InvoiceLine {
  const quantity = overrides.quantity;
  const unitPrice = overrides.unitPrice;
  const taxRate = overrides.taxRate;
  const lineTotal = overrides.lineTotal ?? Number((quantity * unitPrice).toFixed(2));
  const taxTotal = overrides.taxTotal ?? Number((quantity * unitPrice * (taxRate / 100)).toFixed(2));
  return {
    id: overrides.id ?? "il_1",
    invoiceId: overrides.invoiceId ?? "inv_1",
    orderLineId: overrides.orderLineId,
    productId: overrides.productId ?? "p1",
    productCode: overrides.productCode ?? "P1",
    productName: overrides.productName ?? "Urun 1",
    quantity,
    unitPrice,
    currency: overrides.currency ?? "TRY",
    taxRate,
    taxTotal,
    lineTotal
  };
}

test("validateInvoiceLinesAgainstOrder rejects quantity above order line", () => {
  const lines = [invoiceLine({ quantity: 11, unitPrice: 10, taxRate: 20, orderLineId: "ol_1" })];
  const result = validateInvoiceLinesAgainstOrder(sampleOrder, lines);
  assert.equal(result.valid, false);
  assert.ok(result.blockers.some((b) => b.includes("asamaz")));
});

test("validateInvoiceLinesAgainstOrder allows matching quantity", () => {
  const lines = [invoiceLine({ quantity: 10, unitPrice: 100, taxRate: 20, orderLineId: "ol_1" })];
  const result = validateInvoiceLinesAgainstOrder(sampleOrder, lines);
  assert.equal(result.valid, true);
});

test("validateInvoiceLinesAgainstOrder requires order when orderLineId set", () => {
  const lines = [invoiceLine({ quantity: 1, unitPrice: 10, taxRate: 20, orderLineId: "ol_1" })];
  const result = validateInvoiceLinesAgainstOrder(null, lines);
  assert.equal(result.valid, false);
});

test("validateInvoiceLineArithmetic detects tax mismatch", () => {
  const lines = [invoiceLine({ quantity: 2, unitPrice: 50, taxRate: 20, taxTotal: 99, lineTotal: 100, orderLineId: undefined })];
  const result = validateInvoiceLineArithmetic(lines);
  assert.equal(result.valid, false);
});

test("validateReturnLinesAgainstOrder rejects quantity above order line", () => {
  const lines: ReturnLine[] = [
    {
      id: "rl1",
      returnId: "ret_1",
      orderLineId: "ol_1",
      productId: "p1",
      productCode: "P1",
      productName: "Urun 1",
      quantity: 20,
      reasonCategory: "other",
      note: ""
    }
  ];
  const result = validateReturnLinesAgainstOrder(sampleOrder, lines);
  assert.equal(result.valid, false);
});

test("validateReturnLinesAgainstOrder allows within bound", () => {
  const lines: ReturnLine[] = [
    {
      id: "rl1",
      returnId: "ret_1",
      orderLineId: "ol_1",
      productId: "p1",
      productCode: "P1",
      productName: "Urun 1",
      quantity: 4,
      reasonCategory: "other",
      note: ""
    }
  ];
  assert.equal(validateReturnLinesAgainstOrder(sampleOrder, lines).valid, true);
});
