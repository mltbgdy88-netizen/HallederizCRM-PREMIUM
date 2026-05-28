import type { PaymentMethod, QuickOperationSubmitRequest, QuickOperationValidationIssue } from "@hallederiz/types";
import { calculateQuickOperationTotals } from "./totals";

export interface ResolvedQuickOperationPayment {
  enabled: boolean;
  amount: number;
  method: PaymentMethod;
  receivedAt: string;
  referenceNo?: string;
  note?: string;
  allocateToOrder: boolean;
}

function createIssue(
  code: string,
  field: string,
  message: string,
  level: QuickOperationValidationIssue["level"] = "error"
): QuickOperationValidationIssue {
  return { code, field, message, level };
}

export function resolveQuickOperationPayment(request: QuickOperationSubmitRequest): ResolvedQuickOperationPayment {
  const payment = request.payment;
  if (payment) {
    return {
      enabled: payment.enabled,
      amount: payment.enabled ? payment.amount : 0,
      method: payment.method,
      receivedAt: payment.receivedAt ?? new Date().toISOString(),
      referenceNo: payment.referenceNo,
      note: payment.note,
      allocateToOrder: payment.allocateToOrder ?? true
    };
  }

  const legacyAmount = request.paidAmount ?? 0;
  const enabled = legacyAmount > 0 || Boolean(request.paymentMethod);
  return {
    enabled,
    amount: enabled ? legacyAmount : 0,
    method: request.paymentMethod ?? "transfer",
    receivedAt: request.paymentReceivedAt ?? new Date().toISOString(),
    referenceNo: request.paymentReferenceNo,
    note: request.paymentNote,
    allocateToOrder: request.allocatePaymentToOrder ?? true
  };
}

export function validateQuickOperationPayment(
  request: QuickOperationSubmitRequest,
  grandTotal: number
): QuickOperationValidationIssue[] {
  const issues: QuickOperationValidationIssue[] = [];
  const resolved = resolveQuickOperationPayment(request);

  if (request.operationType !== "sale_order" && request.operationType !== "payment") {
    return issues;
  }

  if (!resolved.enabled) {
    if (request.operationType === "payment") {
      issues.push(createIssue("payment_amount_required", "paidAmount", "Tahsilat tutarı sıfırdan büyük olmalıdır."));
    }
    return issues;
  }

  if (resolved.amount <= 0) {
    issues.push(createIssue("payment_amount_required", "payment.amount", "Tahsilat tutarı sıfırdan büyük olmalıdır."));
  }

  if (!resolved.method) {
    issues.push(createIssue("payment_method_required", "payment.method", "Ödeme yöntemi seçilmelidir."));
  }

  if (request.operationType === "sale_order" && grandTotal > 0 && resolved.amount > grandTotal) {
    issues.push(
      createIssue(
        "payment_over_grand_total",
        "payment.amount",
        "Tahsilat tutarı sipariş toplamını aşamaz. Fazla tahsilat için ayrı tahsilat kaydı kullanın.",
        "error"
      )
    );
  }

  if (request.operationType === "sale_order" && grandTotal > 0 && resolved.amount > 0 && resolved.amount < grandTotal) {
    issues.push(
      createIssue(
        "payment_partial",
        "payment.amount",
        "Kısmi tahsilat: sipariş ödeme durumu kısmi olarak işlenecektir.",
        "warning"
      )
    );
  }

  return issues;
}

export function deriveOrderPaymentStatusFromAmount(grandTotal: number, paidAmount: number): "unpaid" | "partial" | "paid" | "overpaid" {
  if (paidAmount <= 0) {
    return "unpaid";
  }
  if (paidAmount > grandTotal) {
    return "overpaid";
  }
  if (paidAmount >= grandTotal) {
    return "paid";
  }
  return "partial";
}
