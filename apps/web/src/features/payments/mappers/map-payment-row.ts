import type { Customer, PaymentReceipt } from "@hallederiz/types";
import { dateLabel, money } from "../utils";
import { getPaymentMethodLabel, getPaymentStatusLabel } from "../queries/payment-mock-data";

export interface PaymentRow {
  paymentId: string;
  receiptNo: string;
  customerName: string;
  amountLabel: string;
  methodLabel: string;
  statusLabel: string;
  statusTone: "info" | "success" | "warning" | "danger" | "neutral";
  receivedAtLabel: string;
  documentCountLabel: string;
}

function resolveTone(payment: PaymentReceipt): PaymentRow["statusTone"] {
  if (payment.status === "reversed") {
    return "danger";
  }

  if (payment.status === "draft" || payment.status === "partially_allocated") {
    return "warning";
  }

  if (payment.status === "allocated") {
    return "success";
  }

  return "info";
}

export function mapPaymentRow(payment: PaymentReceipt, customers: Customer[]): PaymentRow {
  return {
    paymentId: payment.id,
    receiptNo: payment.receiptNo,
    customerName: customers.find((customer) => customer.id === payment.customerId)?.name ?? payment.customerId,
    amountLabel: money(payment.amount, payment.currency),
    methodLabel: getPaymentMethodLabel(payment.method),
    statusLabel: getPaymentStatusLabel(payment.status),
    statusTone: resolveTone(payment),
    receivedAtLabel: dateLabel(payment.receivedAt),
    documentCountLabel: String(payment.documentCount)
  };
}
