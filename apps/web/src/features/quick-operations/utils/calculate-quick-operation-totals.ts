import type { QuickOperationLine, QuickOperationTotals } from "../types";

export function calculateQuickOperationTotals(lines: QuickOperationLine[], paidAmount = 0): QuickOperationTotals {
  const subtotal = lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);
  const discountTotal = 0;
  const taxTotal = lines.reduce((total, line) => total + line.quantity * line.unitPrice * (line.taxRate / 100), 0);
  const grandTotal = subtotal - discountTotal + taxTotal;
  return {
    subtotal,
    discountTotal,
    taxTotal,
    grandTotal,
    paidAmount,
    remainingAmount: Math.max(grandTotal - paidAmount, 0)
  };
}
