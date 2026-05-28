import { buildDeliveryFromOrder } from "@hallederiz/domain";
import type { Delivery, DeliveryStatus } from "@hallederiz/types";
import { customers, getCustomerById } from "../../customers/queries/customer-mock-data";
import { getOrderMockData } from "../../orders/queries/order-mock-data";
import { getWarehouseOrderMockData } from "../../warehouse/queries/warehouse-mock-data";

export async function getDeliveryMockData(): Promise<Delivery[]> {
  const orders = await getOrderMockData();
  const warehouseOrders = await getWarehouseOrderMockData();

  return orders.slice(0, 3).map((order, index) => {
    const delivery = buildDeliveryFromOrder({
      order,
      customer: getCustomerById(order.customerId),
      warehouseOrders,
      policy: { blockDeliveryWhenPaymentMissing: false, requireApprovalWhenPartial: true }
    });

    if (index === 0) {
      return { ...delivery, id: "delivery_1", deliveryNo: "DLV-401", status: "ready", documentStatus: "ready" };
    }

    if (index === 1) {
      return { ...delivery, id: "delivery_2", deliveryNo: "DLV-398", status: "pending", documentStatus: "missing" };
    }

    return {
      ...delivery,
      id: "delivery_3",
      deliveryNo: "DLV-390",
      status: "delivered",
      documentStatus: "sent",
      deliveredAt: "2026-04-26T16:30:00.000Z",
      confirmation: {
        confirmedBy: "user_1",
        confirmedAt: "2026-04-26T16:30:00.000Z",
        customerNotified: true,
        note: "Musteriye WhatsApp ile teslim bilgisi gonderildi."
      },
      lines: delivery.lines.map((line) => ({ ...line, deliveredQuantity: line.preparedQuantity || line.orderedQuantity }))
    };
  });
}

export async function getDeliveryById(deliveryId?: string): Promise<Delivery | null> {
  const deliveries = await getDeliveryMockData();
  if (!deliveryId) {
    return deliveries[0] ?? null;
  }
  return deliveries.find((delivery) => delivery.id === deliveryId || delivery.deliveryNo === deliveryId) ?? null;
}

export function getDeliveryStatusLabel(status: DeliveryStatus): string {
  const labels: Record<DeliveryStatus, string> = {
    pending: "Bekliyor",
    ready: "Hazir",
    partially_delivered: "Kismi Teslim",
    delivered: "Teslim Edildi",
    failed: "Basarisiz",
    rolled_back: "Rollback"
  };
  return labels[status];
}

export { customers };
