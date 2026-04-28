import type { Delivery, Return } from "@hallederiz/types";

export function buildReturnFromDelivery(delivery: Delivery): Return {
  const returnId = `return_${delivery.id}`;

  return {
    id: returnId,
    tenantId: delivery.tenantId,
    returnNo: `RET-${delivery.deliveryNo.replace(/\D/g, "") || delivery.id}`,
    customerId: delivery.customerId,
    orderId: delivery.orderId,
    orderNo: delivery.orderNo,
    deliveryId: delivery.id,
    deliveryNo: delivery.deliveryNo,
    status: "draft",
    note: "Teslimattan baslatilan iade taslagi.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lines: delivery.lines.slice(0, 1).map((line) => ({
      id: `return_line_${line.id}`,
      returnId,
      orderLineId: line.orderLineId,
      deliveryLineId: line.id,
      productId: line.productId,
      productCode: line.productCode,
      productName: line.productName,
      quantity: Math.max(line.deliveredQuantity || line.preparedQuantity || 1, 1),
      reasonCategory: "damaged",
      note: "Operator sebep guncelleyecek."
    }))
  };
}
