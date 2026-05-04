import { buildWarehouseOrderFromSale, buildWarehouseTaskList } from "@hallederiz/domain";
import type { WarehouseOrder, WarehouseOrderLine, WarehouseOrderStatus, WarehouseTaskStatus } from "@hallederiz/types";
import { customers } from "../../customers/queries/customer-mock-data";
import { getOrderMockData } from "../../orders/queries/order-mock-data";

const RACKS = ["A1", "A2", "B3", "M-A1-01", "B1", "C2", "A3", "B2"] as const;

function rackAt(index: number): string {
  return RACKS[index % RACKS.length] ?? "A1";
}

/** Bugün (yerel) — KPI “bugün hazırlanacak” ile uyum için bekleyen/eksik fişlerde kullanılır. */
function isoLocalToday(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const TODAY_MORNING = isoLocalToday(8, 30);
const TODAY_MID = isoLocalToday(10, 15);
const TODAY_AFTER = isoLocalToday(14, 0);
const TODAY_DUE = isoLocalToday(18, 0);

function finalizeOrder(order: WarehouseOrder): WarehouseOrder {
  const lines: WarehouseOrderLine[] = order.lines.map((line, i) => ({
    ...line,
    id: `${order.id}_wl_${i + 1}`,
    warehouseOrderId: order.id,
    rackNo: line.rackNo ?? rackAt(i),
    locationCode: line.locationCode ?? `L${(i % 4) + 1}`,
    warehouseName: line.warehouseName || "Merkez Depo"
  }));
  const next: WarehouseOrder = { ...order, lines, tasks: [] };
  return { ...next, tasks: buildWarehouseTaskList(next) };
}

function setLinePrep(order: WarehouseOrder, getPrepared: (line: WarehouseOrderLine, idx: number) => number): WarehouseOrder {
  const lines = order.lines.map((line, idx) => ({
    ...line,
    preparedQuantity: getPrepared(line, idx)
  }));
  return finalizeOrder({ ...order, lines, tasks: [] });
}

function cloneBase(order: WarehouseOrder, overrides: Partial<WarehouseOrder>): WarehouseOrder {
  return { ...order, ...overrides, lines: order.lines.map((l) => ({ ...l })), tasks: [] };
}

export async function getWarehouseOrderMockData(): Promise<WarehouseOrder[]> {
  const orders = await getOrderMockData();
  const o1 = orders[0];
  const o3 = orders[2];
  const o4 = orders[3];
  const o5 = orders[4];

  if (!o1 || !o3 || !o4 || !o5) {
    return [];
  }

  const b1 = buildWarehouseOrderFromSale(o1);
  const b3 = buildWarehouseOrderFromSale(o3);
  const b4 = buildWarehouseOrderFromSale(o4);
  const b5 = buildWarehouseOrderFromSale(o5);

  const seededWarehouseOrders: WarehouseOrder[] = [
    setLinePrep(
      {
        ...b1,
        id: "warehouse_order_1",
        warehouseOrderNo: "DHB-2026-014",
        status: "picking" as WarehouseOrderStatus,
        assignedTo: "Mehmet Depo",
        dueAt: TODAY_DUE,
        createdAt: TODAY_MORNING,
        updatedAt: TODAY_MID,
        startedAt: TODAY_MID,
        note: "A1 ve A2 raflarından toplama sürüyor; satır bazında kısmi."
      },
      (_, idx) => (idx === 0 ? 8 : 0)
    ),
    setLinePrep(
      {
        ...b1,
        id: "warehouse_order_2",
        warehouseOrderNo: "DHB-2026-011",
        status: "picking" as WarehouseOrderStatus,
        assignedTo: "Ayhan Depo",
        dueAt: TODAY_DUE,
        createdAt: TODAY_MORNING,
        updatedAt: TODAY_MID,
        startedAt: TODAY_MORNING,
        note: "Çift satır; toplama devam."
      },
      (line, idx) => (idx === 0 ? Math.floor(line.requestedQuantity * 0.4) : Math.floor(line.requestedQuantity * 0.15))
    ),
    setLinePrep(
      {
        ...b3,
        id: "warehouse_order_3",
        warehouseOrderNo: "DHB-2026-009",
        status: "picking" as WarehouseOrderStatus,
        assignedTo: "Depo Ekibi",
        dueAt: TODAY_AFTER,
        createdAt: TODAY_MORNING,
        updatedAt: TODAY_MID,
        startedAt: TODAY_MID,
        note: "WhatsApp siparişi; raf A1."
      },
      (line) => Math.max(0, Math.floor(line.requestedQuantity * 0.35))
    ),
    setLinePrep(
      {
        ...b4,
        id: "warehouse_order_4",
        warehouseOrderNo: "DHB-2026-008",
        status: "prepared" as WarehouseOrderStatus,
        assignedTo: "Selim Depo",
        dueAt: "2026-04-28T13:00:00.000Z",
        createdAt: "2026-04-28T09:00:00.000Z",
        updatedAt: "2026-04-28T11:40:00.000Z",
        startedAt: "2026-04-28T09:15:00.000Z",
        preparedAt: "2026-04-28T11:45:00.000Z",
        note: "Teslim için çıkış alanında bekliyor."
      },
      (line) => line.requestedQuantity
    ),
    setLinePrep(
      {
        ...b5,
        id: "warehouse_order_5",
        warehouseOrderNo: "DHB-2026-007",
        status: "prepared" as WarehouseOrderStatus,
        assignedTo: "Mehmet Depo",
        dueAt: "2026-04-29T10:00:00.000Z",
        createdAt: "2026-04-29T08:00:00.000Z",
        updatedAt: "2026-04-29T09:30:00.000Z",
        startedAt: "2026-04-29T08:20:00.000Z",
        preparedAt: "2026-04-29T09:35:00.000Z",
        note: "Hızlı İşlem üzerinden ürün teslimi için hazır."
      },
      (line) => line.requestedQuantity
    ),
    setLinePrep(
      {
        ...b4,
        id: "warehouse_order_6",
        warehouseOrderNo: "DHB-2026-006",
        status: "picking" as WarehouseOrderStatus,
        assignedTo: "Depo Ekibi",
        dueAt: TODAY_DUE,
        createdAt: TODAY_MORNING,
        updatedAt: TODAY_MID,
        startedAt: TODAY_MID,
        note: "Ege bayi; kısmi toplama."
      },
      (line) => Math.max(0, line.requestedQuantity - 6)
    ),
    setLinePrep(
      {
        ...b5,
        id: "warehouse_order_7",
        warehouseOrderNo: "DHB-2026-005",
        status: "delivered" as WarehouseOrderStatus,
        assignedTo: "Ayhan Depo",
        dueAt: "2026-04-20T12:00:00.000Z",
        createdAt: "2026-04-20T08:00:00.000Z",
        updatedAt: "2026-04-20T14:00:00.000Z",
        startedAt: "2026-04-20T08:30:00.000Z",
        preparedAt: "2026-04-20T10:00:00.000Z",
        note: "Ürün teslim fişi arşivlendi."
      },
      (line) => line.requestedQuantity
    ),
    setLinePrep(
      {
        ...b3,
        id: "warehouse_order_8",
        warehouseOrderNo: "DHB-2026-004",
        status: "cancelled" as WarehouseOrderStatus,
        assignedTo: undefined,
        dueAt: "2026-04-25T12:00:00.000Z",
        createdAt: "2026-04-25T09:00:00.000Z",
        updatedAt: "2026-04-25T10:00:00.000Z",
        note: "Sipariş iptali nedeniyle belge kapatıldı."
      },
      () => 0
    ),
    setLinePrep(
      {
        ...b1,
        id: "warehouse_order_9",
        warehouseOrderNo: "DHB-2026-003",
        status: "picking" as WarehouseOrderStatus,
        assignedTo: "Selim Depo",
        dueAt: TODAY_DUE,
        createdAt: TODAY_MID,
        updatedAt: TODAY_MID,
        startedAt: TODAY_MID,
        note: "İlk satırda ilerleme var; ikinci satır rafta."
      },
      (line, idx) => (idx === 0 ? Math.min(5, line.requestedQuantity) : 0)
    ),
    setLinePrep(
      {
        ...b3,
        id: "warehouse_order_10",
        warehouseOrderNo: "DHB-2026-002",
        status: "waiting" as WarehouseOrderStatus,
        assignedTo: "Mehmet Depo",
        dueAt: TODAY_DUE,
        createdAt: TODAY_AFTER,
        updatedAt: TODAY_AFTER,
        note: "Henüz raftan çıkış yok; operasyon eksikliği (Eksik fiş)."
      },
      () => 0
    ),
    setLinePrep(
      cloneBase(b3, {
        id: "warehouse_order_11",
        warehouseOrderNo: "DHB-2026-021",
        status: "picking" as WarehouseOrderStatus,
        assignedTo: "Ayhan Depo",
        dueAt: TODAY_DUE,
        createdAt: TODAY_MORNING,
        updatedAt: TODAY_MID,
        startedAt: TODAY_MORNING,
        note: "Tek satır; kısmi toplama."
      }),
      (line) => Math.max(0, line.requestedQuantity - 4)
    ),
    setLinePrep(
      cloneBase(b3, {
        id: "warehouse_order_12",
        warehouseOrderNo: "DHB-2026-022",
        status: "picking" as WarehouseOrderStatus,
        assignedTo: "Depo Ekibi",
        dueAt: TODAY_AFTER,
        createdAt: TODAY_MORNING,
        updatedAt: TODAY_MID,
        startedAt: TODAY_MID,
        note: "B3 kopyası; sınırlı hazırlık."
      }),
      (line) => Math.floor(line.requestedQuantity * 0.2)
    ),
    setLinePrep(
      cloneBase(b4, {
        id: "warehouse_order_13",
        warehouseOrderNo: "DHB-2026-023",
        status: "picking" as WarehouseOrderStatus,
        assignedTo: "Mehmet Depo",
        dueAt: TODAY_DUE,
        createdAt: TODAY_MID,
        updatedAt: TODAY_MID,
        startedAt: TODAY_MID,
        note: "Showroom çıkışı; toplama."
      }),
      (line) => Math.floor(line.requestedQuantity * 0.55)
    ),
    setLinePrep(
      cloneBase(b5, {
        id: "warehouse_order_14",
        warehouseOrderNo: "DHB-2026-024",
        status: "picking" as WarehouseOrderStatus,
        assignedTo: "Selim Depo",
        dueAt: TODAY_DUE,
        createdAt: TODAY_MORNING,
        updatedAt: TODAY_MID,
        startedAt: TODAY_MORNING,
        note: "Bayi siparişi; devam ediyor."
      }),
      (line) => Math.max(0, line.requestedQuantity - 3)
    ),
    setLinePrep(
      cloneBase(b1, {
        id: "warehouse_order_15",
        warehouseOrderNo: "DHB-2026-025",
        status: "picking" as WarehouseOrderStatus,
        assignedTo: "Depo Ekibi",
        dueAt: TODAY_AFTER,
        createdAt: TODAY_MORNING,
        updatedAt: TODAY_MID,
        startedAt: TODAY_MORNING,
        note: "Çok satırlı; dengeli kısmi."
      }),
      (line, idx) => Math.floor(line.requestedQuantity * (idx === 0 ? 0.25 : 0.5))
    ),
    setLinePrep(
      cloneBase(b4, {
        id: "warehouse_order_16",
        warehouseOrderNo: "DHB-2026-026",
        status: "picking" as WarehouseOrderStatus,
        assignedTo: "Ayhan Depo",
        dueAt: TODAY_DUE,
        createdAt: TODAY_AFTER,
        updatedAt: TODAY_AFTER,
        startedAt: TODAY_AFTER,
        note: "Son toplama emri; bugün vade."
      }),
      (line) => Math.floor(line.requestedQuantity * 0.12)
    )
  ];

  return seededWarehouseOrders;
}

export async function getWarehouseOrderById(warehouseOrderId?: string): Promise<WarehouseOrder | null> {
  const warehouseOrders = await getWarehouseOrderMockData();
  return (
    warehouseOrders.find((warehouseOrder) => warehouseOrder.id === warehouseOrderId || warehouseOrder.warehouseOrderNo === warehouseOrderId) ??
    warehouseOrders[0] ??
    null
  );
}

/** Ham domain durumu için kısa etiket (detay üst bilgisinde yardımcı). */
export function getWarehouseOrderStatusLabel(status: WarehouseOrderStatus): string {
  const labels: Record<WarehouseOrderStatus, string> = {
    waiting: "Beklemede",
    picking: "Beklemede",
    prepared: "Hazırlandı",
    delivered: "Teslim edildi",
    cancelled: "İptal"
  };
  return labels[status];
}

export function getWarehouseTaskStatusLabel(status: WarehouseTaskStatus): string {
  const labels: Record<WarehouseTaskStatus, string> = {
    open: "Açık",
    in_progress: "Devam",
    done: "Tamam",
    cancelled: "İptal",
    overdue: "Gecikti"
  };
  return labels[status];
}

export { customers };
