import type { QuickOperationLine, QuickOperationTotals } from "@hallederiz/types";

function toFixedNumber(value: number): number {
  return Number(value.toFixed(2));
}

export function calculateQuickOperationTotals(lines: QuickOperationLine[]): QuickOperationTotals {
  const subtotal = toFixedNumber(lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0));
  const discountTotal = toFixedNumber(
    lines.reduce((total, line) => {
      const lineSubtotal = line.unitPrice * line.quantity;
      const discountRate = line.discountRate ?? 0;
      return total + (lineSubtotal * discountRate) / 100;
    }, 0)
  );
  const taxTotal = toFixedNumber(
    lines.reduce((total, line) => {
      const lineSubtotal = line.unitPrice * line.quantity;
      const discount = (lineSubtotal * (line.discountRate ?? 0)) / 100;
      const taxable = lineSubtotal - discount;
      return total + (taxable * line.taxRate) / 100;
    }, 0)
  );
  const grandTotal = toFixedNumber(subtotal - discountTotal + taxTotal);

  return {
    subtotal,
    discountTotal,
    taxTotal,
    grandTotal,
    paidAmount: 0,
    remainingAmount: grandTotal
  };
}
