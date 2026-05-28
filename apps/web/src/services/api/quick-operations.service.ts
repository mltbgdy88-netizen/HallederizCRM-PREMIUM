import type {
  QuickOperationPreviewResponse,
  QuickOperationSubmitRequest,
  QuickOperationSubmitResponse
} from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../lib/data-source";
import { calculateQuickOperationTotals } from "@hallederiz/domain";

function resolveCreatedEntityType(operationType: QuickOperationSubmitRequest["operationType"]): QuickOperationSubmitResponse["createdEntityType"] {
  switch (operationType) {
    case "offer":
      return "offer";
    case "sale_order":
      return "order";
    case "delivery":
      return "delivery";
    case "payment":
      return "payment";
    case "return":
      return "return";
    default:
      return undefined;
  }
}

function resolveDocumentTitle(operationType: QuickOperationSubmitRequest["operationType"]): string {
  switch (operationType) {
    case "offer":
      return "Teklif Onizleme";
    case "sale_order":
      return "Siparis Onizleme";
    case "delivery":
      return "Teslim Fisi Onizleme";
    case "payment":
      return "Tahsilat Onizleme";
    case "return":
      return "Iade Talebi Onizleme";
    default:
      return "Belge Onizleme";
  }
}

export async function previewQuickOperationRecord(
  payload: QuickOperationSubmitRequest
): Promise<QuickOperationPreviewResponse> {
  if (dataSourceConfig.useDemoData) {
    const totals = calculateQuickOperationTotals(payload.lines);
    return {
      ok: payload.customerId.trim().length > 0 && payload.lines.length > 0,
      operationType: payload.operationType,
      totals,
      workflowImpacts: [
        {
          id: "demo_preview",
          key: "offer_no_reservation",
          title: "Önizleme modu",
          description: "Canlı önizleme bağlantısı olmadan taslak etkileri gösterilir.",
          severity: "info"
        }
      ],
      validationIssues: []
    };
  }

  const response = await sdk.quickOperations.previewQuickOperation(payload);
  return response.item;
}

export async function submitQuickOperationRecord(payload: QuickOperationSubmitRequest): Promise<QuickOperationSubmitResponse> {
  if (dataSourceConfig.useDemoData) {
    const referenceNo = `QO-DEMO-${String(Date.now()).slice(-6)}`;
    return {
      ok: true,
      operationType: payload.operationType,
      draftId: `qod_demo_${Date.now()}`,
      createdEntityType: resolveCreatedEntityType(payload.operationType),
      createdEntityId: `foundation_${payload.operationType}_${Date.now()}`,
      createdEntityNo: referenceNo,
      workflowImpacts: [],
      documentIds: [],
      auditEventIds: [],
      validationIssues: [],
      sideActions: {
        documentPreview: {
          documentType: payload.operationType,
          title: resolveDocumentTitle(payload.operationType),
          referenceNo,
          customerName: payload.customerName ?? "Cari",
          lines: payload.lines.map((line, index) => ({
            no: index + 1,
            productCode: line.productCode,
            productName: line.productName,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate,
            lineTotal: line.lineTotal
          })),
          totals: {
            subtotal: payload.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
            discountTotal: 0,
            taxTotal: payload.lines.reduce((sum, line) => sum + (line.unitPrice * line.quantity * line.taxRate) / 100, 0),
            grandTotal: payload.lines.reduce((sum, line) => sum + line.lineTotal, 0),
            paidAmount: payload.paidAmount ?? 0,
            remainingAmount: payload.lines.reduce((sum, line) => sum + line.lineTotal, 0) - (payload.paidAmount ?? 0)
          },
          previewText: "Onizleme modunda belge taslagi hazirlandi; canli kayit olusturulmaz."
        },
        whatsappDraft: {
          message:
            payload.operationType === "delivery"
              ? `${payload.customerName ?? "Cari"} icin teslim bilgilendirme taslagi hazirlandi.`
              : payload.operationType === "return"
              ? `${payload.customerName ?? "Cari"} icin iade talebi inceleme taslagi hazirlandi.`
              : `${payload.customerName ?? "Cari"} icin ${referenceNo} islem taslagi hazirlandi.`,
          intent: payload.operationType,
          requiresApproval: true,
          sendEnabled: false
        },
        aiInsight: {
          summary: "Onizleme modunda operasyon notu ornek olarak gosterilir.",
          warnings: [],
          recommendations: ["Canli gonderim ve belge uretimi islem kuyrugu baglandiginda acilir."],
          source: "template"
        }
      },
      mode: "foundation"
    };
  }

  const response = await sdk.quickOperations.submitQuickOperation(payload);
  return response.item;
}
