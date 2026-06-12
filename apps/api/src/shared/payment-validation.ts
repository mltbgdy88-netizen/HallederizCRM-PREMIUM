export function validatePaymentAmount(amount: unknown): { ok: true; value: number } | { ok: false; reason: string } {
  const numeric = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return { ok: false, reason: "invalid_payment_amount" };
  }
  return { ok: true, value: numeric };
}
