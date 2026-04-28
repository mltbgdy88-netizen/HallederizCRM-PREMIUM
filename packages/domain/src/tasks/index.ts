import type { Customer, Delivery, SaleOrder, Task, TaskStatus, WarehouseOrder } from "@hallederiz/types";

const tenantId = "tenant_1";

export function deriveTaskOverdueState(task: Task, now = new Date()): TaskStatus {
  if (["done", "cancelled"].includes(task.status)) {
    return task.status;
  }

  return new Date(task.dueAt).getTime() < now.getTime() ? "overdue" : task.status;
}

export function buildTaskFromOrder(order: SaleOrder, customer?: Customer): Task[] {
  const tasks: Task[] = [];
  const customerName = customer?.name;

  if (order.status === "confirmed" || order.status === "in_preparation") {
    tasks.push({
      id: `task_order_${order.id}_source`,
      tenantId: order.tenantId,
      taskNo: `TSK-${order.orderNo}-01`,
      title: "Siparis kaynak plani ve operasyon etkisini kontrol et",
      description: "Depo, fabrika ve split kaynak tercihleri operasyon planina baglanmali.",
      type: "new_order",
      status: "open",
      priority: order.sourcePlans.some((plan) => plan.factoryQuantity > 0) ? "high" : "normal",
      source: "system",
      entityType: "order",
      entityId: order.id,
      entityNo: order.orderNo,
      customerId: order.customerId,
      customerName,
      assigneeName: "Satis Operasyon",
      dueAt: "2026-04-28T17:00:00.000Z",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });
  }

  if (order.paymentStatus !== "paid" && order.paymentStatus !== "overpaid") {
    tasks.push({
      id: `task_order_${order.id}_payment`,
      tenantId: order.tenantId,
      taskNo: `TSK-${order.orderNo}-02`,
      title: "Tahsilat eksigini takip et",
      description: "Siparis teslim oncesi tahsilat/allocation kontrolu gerektiriyor.",
      type: "payment_followup",
      status: "open",
      priority: order.paymentStatus === "unpaid" ? "high" : "normal",
      source: "system",
      entityType: "order",
      entityId: order.id,
      entityNo: order.orderNo,
      customerId: order.customerId,
      customerName,
      assigneeName: "Muhasebe",
      dueAt: "2026-04-29T12:00:00.000Z",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });
  }

  if (order.sourcePlans.some((plan) => plan.factoryQuantity > 0 && plan.status !== "reserved")) {
    tasks.push({
      id: `task_order_${order.id}_factory`,
      tenantId: order.tenantId,
      taskNo: `TSK-${order.orderNo}-03`,
      title: "Fabrika siparisi veya stok teyidi olustur",
      description: "Fabrika kaynakli satirlar icin entegrasyon/fallback takip kaydi acilmali.",
      type: "factory_order_needed",
      status: "open",
      priority: "high",
      source: "system",
      entityType: "order",
      entityId: order.id,
      entityNo: order.orderNo,
      customerId: order.customerId,
      customerName,
      assigneeName: "Operasyon",
      dueAt: "2026-04-28T18:30:00.000Z",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });
  }

  return tasks;
}

export function buildTaskFromDelivery(delivery: Delivery, customer?: Customer): Task | null {
  if (delivery.status === "delivered") {
    return null;
  }

  return {
    id: `task_delivery_${delivery.id}`,
    tenantId: delivery.tenantId,
    taskNo: `TSK-${delivery.deliveryNo}`,
    title: delivery.status === "ready" ? "Hazir teslimati tamamla" : "Teslimat dogrulama blokajlarini kontrol et",
    description: delivery.validation.riskNote,
    type: "delivery_waiting",
    status: "open",
    priority: delivery.validation.approvalRequired ? "critical" : "normal",
    source: "system",
    entityType: "delivery",
    entityId: delivery.id,
    entityNo: delivery.deliveryNo,
    customerId: delivery.customerId,
    customerName: customer?.name,
    assigneeName: "Teslimat",
    dueAt: delivery.plannedAt,
    createdAt: delivery.createdAt,
    updatedAt: delivery.updatedAt
  };
}

export function buildTaskFromWarehouseOrder(warehouseOrder: WarehouseOrder, customer?: Customer): Task | null {
  if (["prepared", "delivered", "cancelled"].includes(warehouseOrder.status)) {
    return null;
  }

  return {
    id: `task_warehouse_${warehouseOrder.id}`,
    tenantId: warehouseOrder.tenantId,
    taskNo: `TSK-${warehouseOrder.warehouseOrderNo}`,
    title: "Depo hazirlik emrini tamamla",
    description: `${warehouseOrder.lines.length} satir icin toplama ve raf kontrolu gerekiyor.`,
    type: "warehouse_picking",
    status: warehouseOrder.status === "picking" ? "in_progress" : "open",
    priority: warehouseOrder.tasks.some((task) => task.critical) ? "critical" : "high",
    source: "system",
    entityType: "warehouse_order",
    entityId: warehouseOrder.id,
    entityNo: warehouseOrder.warehouseOrderNo,
    customerId: warehouseOrder.customerId,
    customerName: customer?.name,
    assigneeName: warehouseOrder.assignedTo,
    dueAt: warehouseOrder.dueAt,
    createdAt: warehouseOrder.createdAt,
    updatedAt: warehouseOrder.updatedAt
  };
}
