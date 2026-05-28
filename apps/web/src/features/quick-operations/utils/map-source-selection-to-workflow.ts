import type { QuickOperationImpact, QuickOperationLine, QuickOperationType } from "../types";

const sourceImpactText: Record<string, string> = {
  center_warehouse: "Depo hazırlık emri oluşacak",
  factory: "Fabrika plan satırı oluşacak",
  supplier: "Tedarik takip görevi oluşacak",
  split: "Çoklu kaynak planı oluşacak",
  auto: "Sistem kaynak önerisi üretecek"
};

export function mapSourceSelectionToWorkflow(operationType: QuickOperationType, lines: QuickOperationLine[]): QuickOperationImpact[] {
  const impacts = new Map<string, QuickOperationImpact>();

  for (const line of lines) {
    const description = `${line.productCode} için ${sourceImpactText[line.sourceType] ?? "kaynak etkisi hesaplanacak"}.`;
    if (line.sourceType === "center_warehouse") {
      impacts.set("warehouse", {
        id: "warehouse",
        title: "Depo hazırlık",
        description,
        tone: "info"
      });
    }
    if (line.sourceType === "factory") {
      impacts.set("factory", {
        id: "factory",
        title: "Fabrika planı",
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
        title: line.sourceType === "auto" ? "Otomatik kaynak önerisi" : "Çoklu kaynak planı",
        description,
        tone: "success"
      });
    }
  }

  if (operationType === "offer") {
    impacts.set("offer", {
      id: "offer",
      title: "Teklif modu",
      description: "Belge ve WhatsApp taslağı hazırlanabilir; stok rezervasyonu yapılmaz.",
      tone: "success"
    });
  }
  if (operationType === "sale_order") {
    impacts.set("sale_order", {
      id: "sale_order",
      title: "Sipariş ve kaynak planı",
      description: "Sipariş taslağı, satır kaynak planı ve operasyon etkileri önizlenir.",
      tone: "info"
    });
  }
  if (operationType === "delivery") {
    impacts.set("delivery", {
      id: "delivery",
      title: "Teslim kontrolü",
      description: "Depo hazırlık ve ödeme durumu kontrol edilerek teslim süreci başlatılır.",
      tone: "info"
    });
  }
  if (operationType === "payment") {
    impacts.set("payment", {
      id: "payment",
      title: "Tahsilat dağılımı",
      description: "Tahsilat, onay sonrası sipariş ve fatura bakiyesine dağıtılacak şekilde planlanır.",
      tone: "warning"
    });
  }
  if (operationType === "return") {
    impacts.set("return", {
      id: "return",
      title: "İade onay kontrolü",
      description: "İade etkisi stok ve finans üzerinde hesaplanır; gerekirse onay gerekir.",
      tone: "danger"
    });
  }

  return Array.from(impacts.values());
}
