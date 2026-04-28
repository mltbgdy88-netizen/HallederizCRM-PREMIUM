import type { OrderOperationalImpact, SaleOrder } from "@hallederiz/types";

export function summarizeOrderOperationalImpact(order: SaleOrder): OrderOperationalImpact {
  const warehouseLineCount = order.lines.filter((line) => line.sourcePreference === "warehouse" || line.sourcePreference === "auto").length;
  const factoryLineCount = order.lines.filter((line) => line.sourcePreference === "factory").length;
  const splitLineCount = order.lines.filter((line) => line.sourcePreference === "split").length;
  const needsFactoryOrder = order.sourcePlans.some((plan) => plan.factoryQuantity > 0);
  const needsWarehouseOrder = order.sourcePlans.some((plan) => plan.warehouseQuantity > 0);
  const paymentMissing = order.paymentStatus !== "paid" && order.paymentStatus !== "overpaid";
  const approvalMayBeRequired = paymentMissing || needsFactoryOrder || order.grandTotal > 150000;

  const messages = [
    `${warehouseLineCount + splitLineCount} satir merkez depodan hazirlanacak.`,
    needsFactoryOrder ? `${factoryLineCount + splitLineCount} satir fabrika siparisi gerektiriyor.` : "Fabrika siparisi gerekmiyor.",
    needsWarehouseOrder ? "Depo gorevi acilacak veya mevcut emirle izlenecek." : "Depo emri gerekmeyen kaynak plani.",
    paymentMissing ? "Tahsilat eksik; teslim oncesi finans kontrolu gerekli." : "Tahsilat durumu teslim icin uygun.",
    approvalMayBeRequired ? "Teslim oncesi onay gerekebilir." : "Standart operasyon akisi uygulanabilir."
  ];

  return {
    warehouseLineCount,
    factoryLineCount,
    splitLineCount,
    needsWarehouseOrder,
    needsFactoryOrder,
    paymentMissing,
    approvalMayBeRequired,
    messages
  };
}
