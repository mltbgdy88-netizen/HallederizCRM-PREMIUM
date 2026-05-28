import type { DeliveryLine, SaleOrder, WarehouseOrder } from "@hallederiz/types";

export function buildDeliveryLines(order: SaleOrder, deliveryId: string, warehouseOrder?: WarehouseOrder | null): DeliveryLine[] {
  return order.lines.map((line) => {
    const warehouseLine = warehouseOrder?.lines.find((item) => item.orderLineId === line.id);

    return {
      id: `delivery_line_${deliveryId}_${line.id}`,
      deliveryId,
      orderLineId: line.id,
      productId: line.productId,
      productCode: line.productCode,
      productName: line.productName,
      orderedQuantity: line.quantity,
      preparedQuantity: warehouseLine?.preparedQuantity ?? line.preparedQuantity,
      deliveredQuantity: line.deliveredQuantity
    };
  });
}
