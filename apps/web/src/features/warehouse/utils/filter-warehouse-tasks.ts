import type { WarehouseOrder } from "@hallederiz/types";
import type { WarehouseTaskFilters } from "../schemas/warehouse-filter-schema";

export function filterWarehouseOrders(warehouseOrders: WarehouseOrder[], filters: WarehouseTaskFilters): WarehouseOrder[] {
  return warehouseOrders.filter((warehouseOrder) => {
    const matchesWarehouse = filters.warehouse ? warehouseOrder.warehouseName.toLocaleLowerCase("tr-TR").includes(filters.warehouse.toLocaleLowerCase("tr-TR")) : true;
    const matchesAssignee = filters.assignee ? (warehouseOrder.assignedTo ?? "").toLocaleLowerCase("tr-TR").includes(filters.assignee.toLocaleLowerCase("tr-TR")) : true;
    const matchesStatus =
      filters.status === "all" ||
      warehouseOrder.status === filters.status ||
      warehouseOrder.tasks.some((task) => task.status === filters.status);
    const matchesCritical = !filters.criticalOnly || warehouseOrder.tasks.some((task) => task.critical);
    const matchesReady = !filters.readyOnly || warehouseOrder.status === "prepared";
    const matchesOverdue = !filters.overdueOnly || warehouseOrder.tasks.some((task) => task.status === "overdue" || new Date(task.dueAt) < new Date());

    return matchesWarehouse && matchesAssignee && matchesStatus && matchesCritical && matchesReady && matchesOverdue;
  });
}
