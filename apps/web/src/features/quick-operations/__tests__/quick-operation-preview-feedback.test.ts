import assert from "node:assert/strict";
import test from "node:test";
import {
  mapPreviewActionError,
  mapPreviewNotice,
  sanitizePreviewUserText,
  validateQuickOperationLinesForPreview
} from "../utils/quick-operation-preview-feedback";

test("preview success mapping", () => {
  const notice = mapPreviewNotice({
    ok: true,
    operationType: "offer",
    totals: { subtotal: 100, discountTotal: 0, taxTotal: 20, grandTotal: 120 },
    workflowImpacts: [],
    validationIssues: []
  });
  assert.equal(notice, "İşlem önizlemesi hazır.");
});

test("preview technical text sanitize", () => {
  const sanitized = sanitizePreviewUserText("worker outbox mutation failed");
  assert.equal(sanitized, "İşlem etkisi önizlendi.");
});

test("preview offline safe error", () => {
  const message = mapPreviewActionError(new TypeError("Failed to fetch"));
  assert.equal(message, "Önizleme şu anda alınamıyor.");
});

test("invalid line validation", () => {
  const issues = validateQuickOperationLinesForPreview({
    operationType: "offer",
    customerId: "",
    lines: [{ id: "l1", productCode: "", productName: "", quantity: 0, unitPrice: -1, taxRate: 120, sourceType: "auto", lineTotal: 0 }]
  });
  assert.ok(issues.some((issue) => issue.code === "customer_required"));
  assert.ok(issues.some((issue) => issue.code === "quantity_invalid"));
});

