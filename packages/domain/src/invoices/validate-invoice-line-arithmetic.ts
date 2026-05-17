import type { InvoiceLine } from "@hallederiz/types";

const EPS = 0.05;

export function validateInvoiceLineArithmetic(lines: InvoiceLine[]): { valid: boolean; blockers: string[] } {
  const blockers: string[] = [];

  for (const line of lines) {
    const expectedLineTotal = Number((line.quantity * line.unitPrice).toFixed(2));
    if (Math.abs(expectedLineTotal - line.lineTotal) > EPS) {
      blockers.push(`Fatura satiri ${line.productCode}: satir tutari beklenen ${expectedLineTotal} iken ${line.lineTotal}.`);
    }
    const expectedTax = Number((line.quantity * line.unitPrice * (line.taxRate / 100)).toFixed(2));
    if (Math.abs(expectedTax - line.taxTotal) > EPS) {
      blockers.push(`Fatura satiri ${line.productCode}: vergi tutari beklenen ${expectedTax} iken ${line.taxTotal}.`);
    }
  }

  return { valid: blockers.length === 0, blockers };
}
