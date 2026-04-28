import type { CurrencyCode, InvoiceLine } from "@hallederiz/types";

export function calculateInvoiceTotals(lines: InvoiceLine[], currency: CurrencyCode) {
  const subtotal = lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);
  const taxTotal = lines.reduce((total, line) => total + line.taxTotal, 0);

  return {
    currency,
    subtotal: Number(subtotal.toFixed(2)),
    taxTotal: Number(taxTotal.toFixed(2)),
    grandTotal: Number((subtotal + taxTotal).toFixed(2))
  };
}
