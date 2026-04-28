import type { WarehouseOrder, WarehouseTask } from "@hallederiz/types";

export function buildWarehouseTaskList(warehouseOrder: Pick<WarehouseOrder, "id" | "tenantId" | "warehouseOrderNo" | "lines" | "dueAt">): WarehouseTask[] {
  return warehouseOrder.lines.map((line, index) => ({
    id: `task_${warehouseOrder.id}_${line.id}`,
    tenantId: warehouseOrder.tenantId,
    warehouseOrderId: warehouseOrder.id,
    taskNo: `${warehouseOrder.warehouseOrderNo}-T${index + 1}`,
    title: `${line.productCode} icin ${line.requestedQuantity} adet hazirla`,
    status: line.preparedQuantity >= line.requestedQuantity ? "done" : "open",
    assigneeName: index === 0 ? "Depo Ekibi" : undefined,
    dueAt: warehouseOrder.dueAt,
    critical: line.preparedQuantity < line.requestedQuantity && line.requestedQuantity > 15
  }));
}
