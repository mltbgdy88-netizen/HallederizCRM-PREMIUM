import type { Product } from "@hallederiz/types";
import { normalizeBarcode } from "./normalize-barcode";

export interface BarcodeConflict {
  productId: string;
  productCode: string;
  conflictType: "primary" | "alias" | "qr";
  matchedValue: string;
}

export function findBarcodeConflict(params: {
  products: Product[];
  value: string;
  excludeProductId?: string;
}): BarcodeConflict | null {
  const normalizedInput = normalizeBarcode(params.value);
  if (!normalizedInput) {
    return null;
  }

  for (const product of params.products) {
    if (params.excludeProductId && product.id === params.excludeProductId) {
      continue;
    }

    if (normalizeBarcode(product.primaryBarcode) === normalizedInput) {
      return {
        productId: product.id,
        productCode: product.code,
        conflictType: "primary",
        matchedValue: product.primaryBarcode
      };
    }

    if (normalizeBarcode(product.qrCodeValue) === normalizedInput) {
      return {
        productId: product.id,
        productCode: product.code,
        conflictType: "qr",
        matchedValue: product.qrCodeValue
      };
    }

    const aliasMatch = product.barcodeAliases.find(
      (alias) => normalizeBarcode(alias.normalizedValue || alias.value) === normalizedInput
    );

    if (aliasMatch) {
      return {
        productId: product.id,
        productCode: product.code,
        conflictType: "alias",
        matchedValue: aliasMatch.value
      };
    }
  }

  return null;
}
