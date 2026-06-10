import type {
  QuickOperationPreviewResponse,
  QuickOperationSubmitRequest,
  QuickOperationValidationIssue,
  QuickOperationWorkflowImpact
} from "@hallederiz/types";
import { containsTechnicalUserText, isOfflineLikeError } from "../../../lib/user-facing-data-error";

const TECHNICAL_PATTERN =
  /api|mock|fallback|dispatcher|worker|outbox|mutation|execution|not_configured|operation|failed to fetch|networkerror|econnrefused/i;

export function sanitizePreviewUserText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (TECHNICAL_PATTERN.test(trimmed) || containsTechnicalUserText(trimmed)) {
    return "İşlem etkisi önizlendi.";
  }
  return trimmed;
}

export function sanitizePreviewImpacts(impacts: QuickOperationWorkflowImpact[]): QuickOperationWorkflowImpact[] {
  return impacts.map((impact) => ({
    ...impact,
    title: sanitizePreviewUserText(impact.title),
    description: sanitizePreviewUserText(impact.description)
  }));
}

export function validateQuickOperationLinesForPreview(request: QuickOperationSubmitRequest): QuickOperationValidationIssue[] {
  const issues: QuickOperationValidationIssue[] = [];

  if (!request.customerId?.trim()) {
    issues.push({
      code: "customer_required",
      field: "customerId",
      message: "Cari seçimi zorunludur.",
      level: "error"
    });
  }

  if (!request.lines.length) {
    issues.push({
      code: "lines_required",
      field: "lines",
      message: "En az bir satır ekleyin.",
      level: "error"
    });
  }

  for (const line of request.lines) {
    if (line.quantity <= 0) {
      issues.push({
        code: "quantity_invalid",
        field: "quantity",
        message: "Miktar sıfırdan büyük olmalıdır.",
        level: "error",
        lineId: line.id
      });
    }
    if (!line.productCode?.trim() && !line.productName?.trim()) {
      issues.push({
        code: "product_required",
        field: "productCode",
        message: "Ürün veya hizmet bilgisi gerekir.",
        level: "error",
        lineId: line.id
      });
    }
    if (line.unitPrice < 0 || Number.isNaN(line.unitPrice)) {
      issues.push({
        code: "price_invalid",
        field: "unitPrice",
        message: "Birim fiyat geçersiz.",
        level: "error",
        lineId: line.id
      });
    }
    if (line.taxRate < 0 || line.taxRate > 100 || Number.isNaN(line.taxRate)) {
      issues.push({
        code: "tax_invalid",
        field: "taxRate",
        message: "Vergi oranı geçersiz.",
        level: "error",
        lineId: line.id
      });
    }
  }

  return issues;
}

export function mapPreviewNotice(result: QuickOperationPreviewResponse): string {
  const hasErrors = (result.validationIssues ?? []).some((issue) => issue.level === "error");
  if (hasErrors || !result.ok) {
    return "Önizleme doğrulaması tamamlanamadı. Eksik alanları kontrol edin.";
  }

  const requiresApproval = result.workflowImpacts.some(
    (impact) => impact.severity === "warning" || impact.key.includes("approval")
  );

  if (requiresApproval) {
    return "İşlem önizlemesi hazır. Onay gerektiren alanlar belirlendi.";
  }

  return "İşlem önizlemesi hazır.";
}

export function mapPreviewActionError(error: unknown): string {
  if (isOfflineLikeError(error)) {
    return "Önizleme şu anda alınamıyor.";
  }
  return "Önizleme şu anda alınamıyor.";
}

