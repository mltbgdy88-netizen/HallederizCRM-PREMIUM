import type { CurrencyCode, SaleOrderLine } from "@hallederiz/types";

export interface OrderTotals {
  subtotal: number;
  taxRate: number;
  taxTotal: number;
  grandTotal: number;
  currency: CurrencyCode;
}

export function calculateOrderTotals({
  lines,
  currency,
  taxRate = 20
}: {
  lines: SaleOrderLine[];
  currency: CurrencyCode;
  taxRate?: number;
}): OrderTotals {
  const subtotal = lines.reduce((total, line) => total + line.tlLineTotal, 0);
  const taxTotal = Number(((subtotal * taxRate) / 100).toFixed(2));

  return {
    subtotal,
    taxRate,
    taxTotal,
    grandTotal: Number((subtotal + taxTotal).toFixed(2)),
    currency
  };
}
