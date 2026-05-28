import type { QuickOperationLine, QuickOperationTotals } from "../types";

/** Satır ara toplamları üzerinden %5 iskonto ve KDV %20 (iskonto sonrası matrah). */
export function calculateQuickOperationTotals(lines: QuickOperationLine[], paidAmount = 0): QuickOperationTotals {
  const subtotal = lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);
  const discountTotal = Math.round(subtotal * 0.05 * 100) / 100;
  const taxable = Math.max(0, subtotal - discountTotal);
  const taxTotal = Math.round(taxable * 0.2 * 100) / 100;
  const grandTotal = Math.round((taxable + taxTotal) * 100) / 100;
  return {
    subtotal,
    discountTotal,
    taxTotal,
    grandTotal,
    paidAmount,
    remainingAmount: Math.max(grandTotal - paidAmount, 0)
  };
}
