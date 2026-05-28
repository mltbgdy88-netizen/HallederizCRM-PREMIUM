import type { InvoiceLine, SaleOrder } from "@hallederiz/types";

export function validateInvoiceLinesAgainstOrder(order: SaleOrder | null, lines: InvoiceLine[]): { valid: boolean; blockers: string[] } {
  const blockers: string[] = [];
  const orderLineById = new Map((order?.lines ?? []).map((line) => [line.id, line]));

  for (const line of lines) {
    if (!line.orderLineId) continue;
    if (!order) {
      blockers.push(`Fatura satiri ${line.productCode}: siparis baglami olmadan siparis satir referansi verilemez.`);
      continue;
    }
    const orderLine = orderLineById.get(line.orderLineId);
    if (!orderLine) {
      blockers.push(`Fatura satiri ${line.productCode}: siparis satiri bulunamadi (${line.orderLineId}).`);
      continue;
    }
    if (line.quantity > orderLine.quantity) {
      blockers.push(`Fatura satiri ${line.productCode}: miktar (${line.quantity}) siparis satir miktarini (${orderLine.quantity}) asamaz.`);
    }
  }

  return { valid: blockers.length === 0, blockers };
}
