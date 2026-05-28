import type { OrderSourcePlan, SaleOrder } from "@hallederiz/types";

export function buildOrderSourcePlan(order: SaleOrder): OrderSourcePlan[] {
  return order.lines.map((line) => {
    const hasWarehouseStock = line.centerStockSnapshot >= line.quantity;
    const factoryQuantity =
      line.sourcePreference === "factory"
        ? line.quantity
        : line.sourcePreference === "split"
          ? Math.max(line.quantity - line.centerStockSnapshot, 0)
          : line.sourcePreference === "auto" && !hasWarehouseStock
            ? Math.max(line.quantity - line.centerStockSnapshot, 0)
            : 0;
    const warehouseQuantity = Math.max(line.quantity - factoryQuantity, 0);

    return {
      id: `source_plan_${order.id}_${line.id}`,
      tenantId: order.tenantId,
      orderId: order.id,
      lineId: line.id,
      productId: line.productId,
      sourcePreference: line.sourcePreference,
      warehouseQuantity,
      factoryQuantity,
      status: factoryQuantity > 0 ? "needs_factory_order" : "planned",
      note: factoryQuantity > 0 ? "Fabrika kaynagi veya split plan gerekli." : "Merkez depo stokundan karsilanabilir.",
      createdAt: new Date().toISOString()
    };
  });
}
