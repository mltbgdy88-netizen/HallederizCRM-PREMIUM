import type { CurrencyCode, OfferLine, OfferTotals } from "@hallederiz/types";

export function calculateOfferTotals(params: {
  lines: OfferLine[];
  taxRate?: number;
  currency?: CurrencyCode;
}): OfferTotals {
  const { lines, taxRate = 20, currency = "TRY" } = params;
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const discountTotal = lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice * (line.discountPercent / 100),
    0
  );
  const taxableTotal = Math.max(subtotal - discountTotal, 0);
  const taxTotal = taxableTotal * (taxRate / 100);
  const grandTotal = taxableTotal + taxTotal;

  return {
    subtotal,
    discountTotal,
    taxRate,
    taxTotal,
    grandTotal,
    currency
  };
}
