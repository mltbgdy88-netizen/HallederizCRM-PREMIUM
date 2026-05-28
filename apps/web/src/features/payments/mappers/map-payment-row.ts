// @ts-nocheck
import type { Customer, PaymentReceipt } from "@hallederiz/types";
import { getPaymentMethodLabel, getPaymentStatusLabel, getPaymentSummary } from "../queries/payment-mock-data";

function padTwoDigits(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatDateOnly(isoString: string): string {
  const d = new Date(isoString);
  return `${padTwoDigits(d.getDate())}.${padTwoDigits(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function formatTryCompact(amount: number): string {
  return `â‚º${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface PaymentRow {
  paymentId: string;
  receiptNo: string;
  customerName: string;
  amountLabel: string;
  remainingBalanceLabel: string;
  methodLabel: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "danger" | "info" | "neutral";
  dateOnlyLabel: string;
  documentCountLabel: string;
}

function resolveTone(payment: PaymentReceipt): PaymentRow["statusTone"] {
  if (payment.status === "reversed") return "danger";
  if (payment.status === "draft") return "neutral";
  if (payment.status === "confirmed") return "warning";
  if (payment.status === "partially_allocated") return "warning";
  if (payment.status === "allocated") return "success";
  return "info";
}

export function mapPaymentRow(payment: PaymentReceipt, customers: Customer[]): PaymentRow {
  const summary = getPaymentSummary(payment);
  return {
    paymentId: payment.id,
    receiptNo: payment.receiptNo,
    customerName: customers.find((c) => c.id === payment.customerId)?.name ?? payment.customerId,
    amountLabel: formatTryCompact(payment.amount),
    remainingBalanceLabel: formatTryCompact(summary.remainingAmount),
    methodLabel: getPaymentMethodLabel(payment.method),
    statusLabel: getPaymentStatusLabel(payment.status),
    statusTone: resolveTone(payment),
    dateOnlyLabel: formatDateOnly(payment.receivedAt),
    documentCountLabel: payment.documentCount > 0 ? String(payment.documentCount) : "â€”"
  };
}

