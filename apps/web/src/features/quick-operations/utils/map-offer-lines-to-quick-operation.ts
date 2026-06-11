import type { Offer, OfferLine } from "@hallederiz/types";
import type { QuickOperationLine, QuickOperationSourceType } from "../types";

function mapSourcePreference(source?: string): QuickOperationSourceType {
  if (source === "factory") return "factory";
  if (source === "hybrid") return "split";
  if (source === "warehouse") return "center_warehouse";
  return "auto";
}

function sourceLabelForType(sourceType: QuickOperationSourceType): string {
  if (sourceType === "factory") return "Fabrika";
  if (sourceType === "supplier") return "Tedarikçi";
  if (sourceType === "split") return "Çoklu";
  if (sourceType === "center_warehouse") return "Merkez";
  return "—";
}

function isValidOfferLine(line: OfferLine): boolean {
  return line.quantity > 0 && Boolean(line.productCode.trim() || line.productName.trim());
}

export function mapOfferLineToQuickOperation(line: OfferLine, taxRate: number, index: number): QuickOperationLine {
  const sourceType = mapSourcePreference(line.sourcePreference);
  return {
    id: `line_offer_${line.id}_${index}`,
    productCode: line.productCode,
    productName: line.productName,
    unit: "Adet",
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    taxRate,
    sourceType,
    sourceLabel: sourceLabelForType(sourceType),
    warehouseName: "",
    rackCode: "",
    locationCode: "—"
  };
}

export function mapOfferLinesToQuickOperation(offer: Offer): QuickOperationLine[] {
  const taxRate = Number.isFinite(offer.taxRate) && offer.taxRate > 0 ? offer.taxRate : 20;
  return offer.lines.filter(isValidOfferLine).map((line, index) => mapOfferLineToQuickOperation(line, taxRate, index));
}
