import type { QuickOperationSubmitRequest, QuickOperationSubmitResponse } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../lib/data-source";

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
          previewText: "Demo modunda belge taslagi olusturuldu."
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
          summary: "Demo modunda AI operasyon notu template kaynaktan uretildi.",
          warnings: [],
          recommendations: ["Gercek gonderim ve belge uretimi sonraki asamada acilacaktir."],
          source: "mock"
        }
      },
      mode: "foundation"
    };
  }

  const response = await sdk.quickOperations.submitQuickOperation(payload);
  return response.item;
}
