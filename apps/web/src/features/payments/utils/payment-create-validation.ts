import type { PaymentMethod } from "@hallederiz/types";

export const PAYMENT_HIGH_AMOUNT_THRESHOLD = 50000;

export type PaymentCreateValidationIssue = {
  id: string;
  message: string;
  severity: "error" | "warning";
};

export function parseTurkishAmountInput(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) {
    return 0;
  }
  const normalized = trimmed.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatTurkishAmountInput(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function validatePaymentCreateForm(input: {
  customerId: string;
  amount: number;
  method: PaymentMethod | "";
  receivedAt: string;
  openAmount: number | null;
  orderSelected: boolean;
}): PaymentCreateValidationIssue[] {
  const issues: PaymentCreateValidationIssue[] = [];

  if (!input.customerId.trim()) {
    issues.push({ id: "customer", message: "Cari seçilmelidir.", severity: "error" });
  }

  if (input.amount <= 0) {
    issues.push({ id: "amount", message: "Tahsilat tutarı sıfırdan büyük olmalıdır.", severity: "error" });
  }

  if (!input.method) {
    issues.push({ id: "method", message: "Ödeme yöntemi seçilmelidir.", severity: "error" });
  }

  if (!input.receivedAt.trim()) {
    issues.push({ id: "date", message: "Tahsilat tarihi boş olamaz.", severity: "error" });
  }

  if (input.orderSelected && input.openAmount !== null && input.amount > input.openAmount) {
    issues.push({
      id: "overpayment",
      message: "Tahsilat tutarı sipariş açık bakiyesini aşamaz.",
      severity: "error"
    });
  }

  if (input.amount >= PAYMENT_HIGH_AMOUNT_THRESHOLD) {
    issues.push({
      id: "high_amount",
      message: "Yüksek tutarlı tahsilatlar onay gerektirebilir.",
      severity: "warning"
    });
  }

  return issues;
}

export function hasBlockingValidationIssues(issues: PaymentCreateValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === "error");
}

export function isSubmitDisabledWhilePending(saving: boolean): boolean {
  return saving;
}
