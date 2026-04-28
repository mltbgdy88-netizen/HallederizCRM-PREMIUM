import { buildWarehouseOrderFromSale, buildWarehouseTaskList } from "@hallederiz/domain";
import type { WarehouseOrder, WarehouseOrderStatus, WarehouseTaskStatus } from "@hallederiz/types";
import { customers } from "../../customers/queries/customer-mock-data";
import { getOrderMockData } from "../../orders/queries/order-mock-data";

export async function getWarehouseOrderMockData(): Promise<WarehouseOrder[]> {
  const orders = await getOrderMockData();
  const orderOne = orders[0];
  const orderThree = orders[2];
  const orderFive = orders[4];

  if (!orderOne || !orderThree || !orderFive) {
    return [];
  }

  const first = buildWarehouseOrderFromSale(orderOne);
  const second = buildWarehouseOrderFromSale(orderThree);
  const third = buildWarehouseOrderFromSale(orderFive);

  const seededWarehouseOrders: WarehouseOrder[] = [
    {
      ...first,
      id: "warehouse_order_1",
      warehouseOrderNo: "WO-114",
      status: "picking",
      assignedTo: "Mehmet Depo",
      dueAt: "2026-04-28T18:00:00.000Z",
      startedAt: "2026-04-28T11:10:00.000Z",
      note: "Kritik satirlar once A1 ve A2 rafindan toplanacak.",
      lines: first.lines.map((line, index) => ({
        ...line,
        warehouseOrderId: "warehouse_order_1",
        preparedQuantity: index === 0 ? 8 : 0,
        rackNo: index === 0 ? "A1" : "A2",
        locationCode: index === 0 ? "M-A1-01" : "M-A2-08"
      }))
    },
    {
      ...second,
      id: "warehouse_order_2",
      warehouseOrderNo: "WO-111",
      status: "waiting",
      assignedTo: "Depo Ekibi",
      dueAt: "2026-04-29T12:00:00.000Z",
      note: "WhatsApp siparisi icin hazirlik emri.",
      lines: second.lines.map((line) => ({
        ...line,
        warehouseOrderId: "warehouse_order_2",
        rackNo: "A1",
        locationCode: "M-A1-01"
      }))
    },
    {
      ...third,
      id: "warehouse_order_3",
      warehouseOrderNo: "WO-108",
      status: "prepared",
      assignedTo: "Ayhan Depo",
      dueAt: "2026-04-28T13:00:00.000Z",
      startedAt: "2026-04-28T09:10:00.000Z",
      preparedAt: "2026-04-28T11:45:00.000Z",
      note: "Teslimat icin cikis alaninda bekliyor.",
      lines: third.lines.map((line) => ({
        ...line,
        warehouseOrderId: "warehouse_order_3",
        preparedQuantity: line.requestedQuantity,
        rackNo: "A1",
        locationCode: "M-A1-01"
      }))
    }
  ];

  return seededWarehouseOrders.map((warehouseOrder) => ({
    ...warehouseOrder,
    tasks: buildWarehouseTaskList(warehouseOrder)
  }));
}

export async function getWarehouseOrderById(warehouseOrderId?: string): Promise<WarehouseOrder | null> {
  const warehouseOrders = await getWarehouseOrderMockData();
  return warehouseOrders.find((warehouseOrder) => warehouseOrder.id === warehouseOrderId || warehouseOrder.warehouseOrderNo === warehouseOrderId) ?? warehouseOrders[0] ?? null;
}

export function getWarehouseOrderStatusLabel(status: WarehouseOrderStatus): string {
  const labels: Record<WarehouseOrderStatus, string> = {
    waiting: "Bekliyor",
    picking: "Toplaniyor",
    prepared: "Hazirlandi",
    delivered: "Teslim Edildi",
    cancelled: "Iptal"
  };
  return labels[status];
}

export function getWarehouseTaskStatusLabel(status: WarehouseTaskStatus): string {
  const labels: Record<WarehouseTaskStatus, string> = {
    open: "Acik",
    in_progress: "Devam",
    done: "Tamam",
    cancelled: "Iptal",
    overdue: "Gecikti"
  };
  return labels[status];
}

export { customers };
