import type { QuickOperationLine, QuickOperationType, QuickOperationWorkflowImpact } from "@hallederiz/types";

function createImpact(
  id: string,
  key: QuickOperationWorkflowImpact["key"],
  title: string,
  description: string,
  severity: QuickOperationWorkflowImpact["severity"]
): QuickOperationWorkflowImpact {
  return { id, key, title, description, severity };
}

export function mapLineSourceToWorkflowImpact(line: QuickOperationLine): QuickOperationWorkflowImpact[] {
  switch (line.sourceType) {
    case "center_warehouse":
      return [
        createImpact(
          `impact_${line.id}_warehouse`,
          "warehouse_prepare",
          "Depo hazirlik emri olusacak",
          `${line.productCode} satiri merkez depodan hazirlama akisina alinacak.`,
          "info"
        )
      ];
    case "factory":
      return [
        createImpact(
          `impact_${line.id}_factory`,
          "factory_plan",
          "Fabrika plani olusacak",
          `${line.productCode} satiri icin fabrika kaynak plani olusturulacak.`,
          "info"
        )
      ];
    case "supplier":
      return [
        createImpact(
          `impact_${line.id}_supplier`,
          "supplier_procurement",
          "Tedarik takip gorevi olusacak",
          `${line.productCode} satiri icin tedarik/procurement takibi acilacak.`,
          "warning"
        )
      ];
    case "split":
      return [
        createImpact(
          `impact_${line.id}_split`,
          "multi_source",
          "Coklu kaynak plani olusacak",
          `${line.productCode} satiri depo/fabrika/tedarik arasinda bolunecek.`,
          "warning"
        )
      ];
    case "auto":
    default:
      return [
        createImpact(
          `impact_${line.id}_auto`,
          "recommendation_required",
          "Kaynak onerisi gerekli",
          `${line.productCode} satiri icin sistem kaynak onerisi gerekecek.`,
          "info"
        )
      ];
  }
}

export function buildQuickOperationWorkflowImpacts(operationType: QuickOperationType, lines: QuickOperationLine[]): QuickOperationWorkflowImpact[] {
  const impacts = lines.flatMap((line) => mapLineSourceToWorkflowImpact(line));

  if (operationType === "offer") {
    impacts.push(
      createImpact(
        "impact_operation_offer",
        "offer_no_reservation",
        "Teklif stok rezervasyonu yapmaz",
        "Bu islem teklif olusturur; stok rezervasyonu yapmaz.",
        "success"
      )
    );
  }

  if (operationType === "sale_order") {
    impacts.push(
      createImpact(
        "impact_operation_sale_order",
        "sale_order_source_plan",
        "Siparis ve kaynak plani olusacak",
        "Siparis satirlari kaynak planina gore depo/fabrika/tedarik akisina dagitilacak.",
        "success"
      )
    );
  }

  if (operationType === "payment") {
    impacts.push(
      createImpact(
        "impact_operation_payment",
        "payment_allocation_required",
        "Tahsilat allocation gerekli",
        "Tahsilat kaydi sonrasi siparis/fatura allocation adimi gerekecek.",
        "warning"
      )
    );
  }

  if (operationType === "return") {
    impacts.push(
      createImpact(
        "impact_operation_return",
        "return_approval_may_be_required",
        "Iade icin approval gerekebilir",
        "Iade miktari ve sebebine gore ek onay akisina dusebilir.",
        "warning"
      )
    );
  }

  return impacts;
}
