import type { QuickOperationImpact, QuickOperationLine, QuickOperationType } from "../types";

const sourceImpactText: Record<string, string> = {
  center_warehouse: "Depo hazirlik emri olusacak",
  factory: "Fabrika plan satiri olusacak",
  supplier: "Tedarik takip gorevi olusacak",
  split: "Coklu kaynak plani olusacak",
  auto: "Sistem kaynak onerisi uretecek"
};

export function mapSourceSelectionToWorkflow(operationType: QuickOperationType, lines: QuickOperationLine[]): QuickOperationImpact[] {
  const impacts = new Map<string, QuickOperationImpact>();

  for (const line of lines) {
    const description = `${line.productCode} icin ${sourceImpactText[line.sourceType] ?? "kaynak etkisi hesaplanacak"}.`;
    if (line.sourceType === "center_warehouse") {
      impacts.set("warehouse", {
        id: "warehouse",
        title: "Depo hazirlik",
        description,
        tone: "info"
      });
    }
    if (line.sourceType === "factory") {
      impacts.set("factory", {
        id: "factory",
        title: "Fabrika plani",
        description,
        tone: "warning"
      });
    }
    if (line.sourceType === "supplier") {
      impacts.set("supplier", {
        id: "supplier",
        title: "Tedarik takip",
        description,
        tone: "warning"
      });
    }
    if (line.sourceType === "auto" || line.sourceType === "split") {
      impacts.set(line.sourceType, {
        id: line.sourceType,
        title: line.sourceType === "auto" ? "Otomatik kaynak onerisi" : "Coklu kaynak plani",
        description,
        tone: "success"
      });
    }
  }

  if (operationType === "offer") {
    impacts.set("offer", {
      id: "offer",
      title: "Teklif modu",
      description: "Belge/WhatsApp taslagi hazirlanabilir; stok rezervasyonu yapilmaz.",
      tone: "success"
    });
  }
  if (operationType === "sale_order") {
    impacts.set("sale_order", {
      id: "sale_order",
      title: "Siparis ve kaynak plani",
      description: "Siparis taslagi, satir kaynak plani ve operasyon etkileri onizlenir.",
      tone: "info"
    });
  }
  if (operationType === "delivery") {
    impacts.set("delivery", {
      id: "delivery",
      title: "Teslim kontrolu",
      description: "Depo hazirlik ve odeme durumu kontrol edilerek teslim foundation'i baslatilir.",
      tone: "info"
    });
  }
  if (operationType === "payment") {
    impacts.set("payment", {
      id: "payment",
      title: "Tahsilat allocation",
      description: "Tahsilat sonraki backend contract ile siparis/fatura bakiyesine dagitilacak.",
      tone: "warning"
    });
  }
  if (operationType === "return") {
    impacts.set("return", {
      id: "return",
      title: "Iade onay kontrolu",
      description: "Iade etkisi stok/finans uzerinde hesaplanir; gerekirse approval gerekir.",
      tone: "danger"
    });
  }

  return Array.from(impacts.values());
}
