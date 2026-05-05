import type { Customer, WarehouseOrder } from "@hallederiz/types";
import type { WarehouseTaskFilters } from "../schemas/warehouse-filter-schema";
import { getPrepDisplayStatus } from "./warehouse-prep-status";

function matchesDocumentQuery(order: WarehouseOrder, q: string, customers: Customer[]): boolean {
  const needle = q.trim().toLocaleLowerCase("tr-TR");
  if (!needle) return true;
  const customerName = customers.find((c) => c.id === order.customerId)?.name ?? "";
  const lineHay = order.lines
    .map((line) =>
      [line.productCode, line.productName, line.rackNo ?? "", line.locationCode ?? "", line.warehouseName].join(" ")
    )
    .join(" ");
  const hay = [order.warehouseOrderNo, order.orderNo, customerName, order.assignedTo ?? "", lineHay]
    .join(" ")
    .toLocaleLowerCase("tr-TR");
  return hay.includes(needle);
}

function matchesDatePreset(order: WarehouseOrder, preset: WarehouseTaskFilters["datePreset"]): boolean {
  if (preset !== "today") return true;
  const d = new Date(order.createdAt);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

function matchesPrepTab(order: WarehouseOrder, tab: WarehouseTaskFilters["prepTab"]): boolean {
  const prep = getPrepDisplayStatus(order);
  if (tab === "tumu") return true;
  if (tab === "bekleyenler") return prep === "beklemede";
  if (tab === "hazirlananlar") return prep === "hazirlandi";
  if (tab === "eksikler") return prep === "eksik";
  return true;
}

function matchesPrepDisplayFilter(order: WarehouseOrder, filter: WarehouseTaskFilters["prepDisplayFilter"]): boolean {
  if (filter === "all") return true;
  return getPrepDisplayStatus(order) === filter;
}

export function filterWarehouseOrders(
  warehouseOrders: WarehouseOrder[],
  filters: WarehouseTaskFilters,
  customers: Customer[] = []
): WarehouseOrder[] {
  return warehouseOrders.filter((warehouseOrder) => {
    const matchesWarehouse = filters.warehouse
      ? warehouseOrder.warehouseName.toLocaleLowerCase("tr-TR").includes(filters.warehouse.toLocaleLowerCase("tr-TR"))
      : true;
    const matchesAssignee = filters.assignee
      ? (warehouseOrder.assignedTo ?? "").toLocaleLowerCase("tr-TR").includes(filters.assignee.toLocaleLowerCase("tr-TR"))
      : true;
    const matchesStatus =
      filters.status === "all" ||
      warehouseOrder.status === filters.status ||
      warehouseOrder.tasks.some((task) => task.status === filters.status);
    const matchesCritical = !filters.criticalOnly || warehouseOrder.tasks.some((task) => task.critical);
    const matchesReady = !filters.readyOnly || warehouseOrder.status === "prepared";
    const matchesOverdue =
      !filters.overdueOnly || warehouseOrder.tasks.some((task) => task.status === "overdue" || new Date(task.dueAt) < new Date());
    const matchesDoc = matchesDocumentQuery(warehouseOrder, filters.documentQuery, customers);
    const matchesDate = matchesDatePreset(warehouseOrder, filters.datePreset);
    const matchesTab = matchesPrepTab(warehouseOrder, filters.prepTab);
    const matchesPrepRow = matchesPrepDisplayFilter(warehouseOrder, filters.prepDisplayFilter);

    return (
      matchesWarehouse &&
      matchesAssignee &&
      matchesStatus &&
      matchesCritical &&
      matchesReady &&
      matchesOverdue &&
      matchesDoc &&
      matchesDate &&
      matchesTab &&
      matchesPrepRow
    );
  });
}

export { getPrepDisplayStatus, orderHasShortage } from "./warehouse-prep-status";
