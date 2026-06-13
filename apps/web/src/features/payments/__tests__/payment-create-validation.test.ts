import assert from "node:assert/strict";
import test from "node:test";
import { ApiError } from "@hallederiz/sdk";
import {
  createPaymentIdempotencyKey,
  mapPaymentCreateApiError,
  PAYMENT_CREATE_MSG
} from "../utils/payment-create-feedback";
import {
  formatTurkishAmountInput,
  hasBlockingValidationIssues,
  isSubmitDisabledWhilePending,
  parseTurkishAmountInput,
  validatePaymentCreateForm
} from "../utils/payment-create-validation";

test("parseTurkishAmountInput handles Turkish decimal format", () => {
  assert.equal(parseTurkishAmountInput("1.250,50"), 1250.5);
  assert.equal(parseTurkishAmountInput("0"), 0);
});

test("formatTurkishAmountInput formats positive amounts", () => {
  assert.equal(formatTurkishAmountInput(1250.5), "1.250,50");
  assert.equal(formatTurkishAmountInput(0), "");
});

test("validatePaymentCreateForm blocks zero and overpayment", () => {
  const zeroAmount = validatePaymentCreateForm({
    customerId: "c1",
    amount: 0,
    method: "transfer",
    receivedAt: "2026-06-08",
    openAmount: 100,
    orderSelected: true
  });
  assert.ok(hasBlockingValidationIssues(zeroAmount));

  const overpay = validatePaymentCreateForm({
    customerId: "c1",
    amount: 150,
    method: "transfer",
    receivedAt: "2026-06-08",
    openAmount: 100,
    orderSelected: true
  });
  assert.ok(overpay.some((issue) => issue.id === "overpayment"));
});

test("isSubmitDisabledWhilePending blocks duplicate submit", () => {
  assert.equal(isSubmitDisabledWhilePending(true), true);
  assert.equal(isSubmitDisabledWhilePending(false), false);
});

test("mapPaymentCreateApiError maps idempotency conflict to Turkish message", () => {
  const mapped = mapPaymentCreateApiError(
    new ApiError("Ayni Idempotency-Key farkli istek govdesi ile kullanilamaz.", 409)
  );
  assert.equal(mapped.message, PAYMENT_CREATE_MSG.IDEMPOTENCY_CONFLICT);
  assert.equal(mapped.rotateKey, true);
});

test("mapPaymentCreateApiError maps missing idempotency key", () => {
  const mapped = mapPaymentCreateApiError(
    new ApiError("Idempotency-Key basligi zorunludur.", 400)
  );
  assert.equal(mapped.message, PAYMENT_CREATE_MSG.IDEMPOTENCY_REQUIRED);
});

test("createPaymentIdempotencyKey returns prefixed uuid", () => {
  const key = createPaymentIdempotencyKey();
  assert.match(key, /^pay_create_/);
});
