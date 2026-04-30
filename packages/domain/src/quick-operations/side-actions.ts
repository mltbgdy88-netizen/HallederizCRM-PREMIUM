import type {
  QuickOperationAiInsight,
  QuickOperationDocumentPreview,
  QuickOperationSubmitRequest,
  QuickOperationSubmitResponse,
  QuickOperationWhatsappDraft
} from "@hallederiz/types";
import { calculateQuickOperationTotals } from "./totals";

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
      return "Islem Onizleme";
  }
}

export function buildQuickOperationDocumentPreview(
  draft: QuickOperationSubmitRequest,
  result: Pick<QuickOperationSubmitResponse, "createdEntityNo" | "mode">
): QuickOperationDocumentPreview {
  const totals = calculateQuickOperationTotals(draft.lines);
  return {
    documentType: draft.operationType,
    title: resolveDocumentTitle(draft.operationType),
    referenceNo: result.createdEntityNo ?? `QO-${Date.now()}`,
    customerName: draft.customerName ?? "Cari secimi yok",
    lines: draft.lines.map((line, index) => ({
      no: index + 1,
      productCode: line.productCode,
      productName: line.productName,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      taxRate: line.taxRate,
      lineTotal: line.lineTotal
    })),
    totals,
    notes: draft.note,
    previewText: `${resolveDocumentTitle(draft.operationType)} · ${draft.customerName ?? "Cari"} · ${
      result.mode === "executed" ? "Kayit olusturuldu" : "Foundation onizleme"
    }`
  };
}

export function buildQuickOperationWhatsappDraft(
  draft: QuickOperationSubmitRequest,
  result: Pick<QuickOperationSubmitResponse, "createdEntityNo">
): QuickOperationWhatsappDraft {
  const reference = result.createdEntityNo ?? "QO-TASLAK";
  const customerName = draft.customerName ?? "Musteri";

  switch (draft.operationType) {
    case "offer":
      return {
        message: `${customerName} icin ${reference} nolu teklif taslagi hazirlandi. Onayinizla paylasima alinabilir.`,
        intent: "offer",
        requiresApproval: true,
        sendEnabled: false
      };
    case "sale_order":
      return {
        message: `${customerName} icin ${reference} nolu siparis kaydi alindi. Kaynak plani olusturma adimi takip edilmelidir.`,
        intent: "sale_order",
        requiresApproval: true,
        sendEnabled: false
      };
    case "payment":
      return {
        message: `${customerName} icin ${reference} nolu tahsilat kaydi alindi. Allocation kontrolu sonraki adimdir.`,
        intent: "payment",
        requiresApproval: true,
        sendEnabled: false
      };
    case "delivery":
      return {
        message: `${customerName} icin teslim bilgilendirme taslagi hazirlandi. Teslim sureci kontrol adimlariyla tamamlanacaktir.`,
        intent: "delivery",
        requiresApproval: true,
        sendEnabled: false
      };
    case "return":
      return {
        message: `${customerName} icin iade talebi alindi. Inceleme ve onay sonrasi geri bildirim paylasilacaktir.`,
        intent: "return",
        requiresApproval: true,
        sendEnabled: false
      };
    default:
      return {
        message: `${customerName} icin islem taslagi olusturuldu.`,
        intent: "generic",
        sendEnabled: false
      };
  }
}

export function buildQuickOperationAiInsight(draft: QuickOperationSubmitRequest): QuickOperationAiInsight {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (draft.lines.some((line) => line.sourceType === "center_warehouse")) {
    recommendations.push("Merkez depo satirlari icin hazirlik emri olusacagi icin raf uygunlugu kontrol edilmelidir.");
  }
  if (draft.lines.some((line) => line.sourceType === "factory")) {
    recommendations.push("Fabrika kaynakli satirlarda tahmini gelis suresi teyit edilmelidir.");
  }
  if (draft.operationType === "payment") {
    warnings.push("Tahsilat kaydi sonrasi allocation adimi tamamlanmadan bakiye kapatma tamamlanmis sayilmaz.");
  }
  if (draft.operationType === "delivery") {
    warnings.push("Teslim oncesi odeme durumu ve depo hazirlik kontrolu tamamlanmalidir.");
    recommendations.push("Teslim satirlari siparis satirlari ile miktar uyumunda olmali ve bloke kontrolu yapilmalidir.");
  }
  if (draft.operationType === "return") {
    warnings.push("Iade taleplerinde approval ve stok/finans etki dogrulama adimlari tamamlanmadan kesinlestirme yapilmaz.");
    recommendations.push("Iade satirlari icin teslim/siparis baglantisi ve iade sebebi kanitlari kontrol edilmelidir.");
  }
  if (draft.lines.some((line) => line.sourceType === "auto" || line.sourceType === "split")) {
    warnings.push("Auto/Split kaynakli satirlar operasyon ekibi tarafindan manuel dogrulanmalidir.");
  }

  const summary =
    draft.operationType === "sale_order"
      ? "Siparis kaydi kaynak planina gore operasyon modullerine dagilacak."
      : draft.operationType === "offer"
      ? "Teklif islemi stok rezervasyonu yapmadan dokuman ve iletisim taslaklarini hazirlar."
      : draft.operationType === "payment"
      ? "Tahsilat kaydi finans akisina yazilir, allocation kontrolu gerekir."
      : draft.operationType === "delivery"
      ? "Teslim islemi depo hazirlik ve odeme durumu kontrolleriyle ilerler."
      : "Iade islemi inceleme ve onay adimlariyla ilerler.";

  if (recommendations.length === 0) {
    recommendations.push("Operasyon etkisi panelindeki adimlar sirasiyla takip edilmelidir.");
  }

  return {
    summary,
    warnings,
    recommendations,
    source: "template"
  };
}
