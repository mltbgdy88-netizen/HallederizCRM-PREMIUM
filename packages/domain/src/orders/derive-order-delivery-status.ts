import type { OrderDeliveryStatus, SaleOrder, WarehouseOrder } from "@hallederiz/types";

export function deriveOrderDeliveryStatus(
  order: Pick<SaleOrder, "lines">,
  warehouseOrders: WarehouseOrder[] = []
): OrderDeliveryStatus {
  const totalQuantity = order.lines.reduce((total, line) => total + line.quantity, 0);
  const deliveredQuantity = order.lines.reduce((total, line) => total + line.deliveredQuantity, 0);
  const preparedQuantity =
    warehouseOrders.length > 0
      ? warehouseOrders.flatMap((warehouseOrder) => warehouseOrder.lines).reduce((total, line) => total + line.preparedQuantity, 0)
      : order.lines.reduce((total, line) => total + line.preparedQuantity, 0);

  if (deliveredQuantity >= totalQuantity && totalQuantity > 0) {
    return "delivered";
  }

  if (deliveredQuantity > 0) {
    return "partial";
  }

  if (preparedQuantity >= totalQuantity && totalQuantity > 0) {
    return "ready";
  }

  if (preparedQuantity > 0 || warehouseOrders.some((warehouseOrder) => warehouseOrder.status === "picking")) {
    return "preparing";
  }

  return "none";
}
