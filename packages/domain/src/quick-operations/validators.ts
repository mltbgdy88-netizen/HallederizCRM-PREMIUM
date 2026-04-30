import type { QuickOperationSubmitRequest, QuickOperationValidationIssue } from "@hallederiz/types";

function createIssue(
  code: string,
  field: string,
  message: string,
  level: QuickOperationValidationIssue["level"] = "error",
  lineId?: string
): QuickOperationValidationIssue {
  return { code, field, message, level, lineId };
}

export function validateQuickOperationRequest(request: QuickOperationSubmitRequest): QuickOperationValidationIssue[] {
  const issues: QuickOperationValidationIssue[] = [];

  if (!request.customerId || request.customerId.trim().length === 0) {
    issues.push(createIssue("customer_required", "customerId", "Cari secimi zorunludur."));
  }

  const hasLines = Array.isArray(request.lines) && request.lines.length > 0;
  if (!hasLines) {
    if (request.operationType === "delivery" && request.orderId) {
      // Delivery can proceed with reference order even when explicit lines are omitted.
    } else {
      issues.push(createIssue("line_required", "lines", "En az bir satir girilmelidir."));
      return issues;
    }
  }

  for (const line of request.lines) {
    if (!line.productId && !line.productCode.trim()) {
      issues.push(createIssue("product_required", "productCode", "Urun kodu veya urun referansi zorunludur.", "error", line.id));
    }

    if (line.quantity <= 0) {
      issues.push(createIssue("quantity_invalid", "quantity", "Miktar sifirdan buyuk olmalidir.", "error", line.id));
    }

    if (line.unitPrice < 0) {
      issues.push(createIssue("unit_price_invalid", "unitPrice", "Birim fiyat negatif olamaz.", "error", line.id));
    }

    if (line.taxRate < 0) {
      issues.push(createIssue("tax_rate_invalid", "taxRate", "KDV orani negatif olamaz.", "error", line.id));
    }

    if (request.operationType === "sale_order" && !line.sourceType) {
      issues.push(createIssue("source_type_required", "sourceType", "Satis/siparis satirlarinda kaynak secimi zorunludur.", "error", line.id));
    }
  }

  if (request.operationType === "delivery" && !request.orderId && !hasLines) {
    issues.push(createIssue("delivery_reference_or_lines_required", "orderId", "Teslim islemi icin siparis referansi veya satir bilgisi gereklidir."));
  }

  if (request.operationType === "return") {
    if (!request.note?.trim() && !request.reason?.trim()) {
      issues.push(createIssue("return_reason_required", "note", "Iade islemi icin aciklama veya iade sebebi girilmelidir."));
    }
  }

  return issues;
}
