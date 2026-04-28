import type { PaymentReceipt, SaleOrder, SaleOrderLine, WarehouseOrder } from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";
import { buildRepositoryRuntime } from "../../shared/db-runtime";
import {
  addOrderLine,
  assignWarehouseOrder,
  cancelOrder,
  cancelWarehouseOrder,
  confirmOrder,
  confirmPayment,
  createFactoryOrders,
  createOrder,
  createPayment,
  createWarehouseOrder,
  createWarehouseOrderFromOrder,
  getOrder,
  getPayment,
  getPaymentAllocations,
  getWarehouseOrder,
  listOrders,
  listPayments,
  listWarehouseOrders,
  markWarehouseOrderPrepared,
  patchOrder,
  patchOrderLine,
  planSourcing,
  reversePayment,
  startWarehouseOrder
} from "../../commercial-operations/mock-store";

type Row = Record<string, unknown>;
const asString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const asNumber = (value: unknown, fallback = 0) => (typeof value === "number" ? value : fallback);

function mapOrderRowToEntity(row: Row, base: SaleOrder): SaleOrder {
  return {
    ...base,
    id: asString(row.id),
    tenantId: asString(row.tenant_id, base.tenantId),
    orderNo: asString(row.order_no, base.orderNo),
    customerId: asString(row.customer_id, base.customerId),
    status: asString(row.status, base.status) as SaleOrder["status"],
    paymentStatus: asString(row.payment_status, base.paymentStatus) as SaleOrder["paymentStatus"],
    deliveryStatus: asString(row.delivery_status, base.deliveryStatus) as SaleOrder["deliveryStatus"],
    grandTotal: asNumber(row.grand_total, base.grandTotal),
    updatedAt: asString(row.updated_at, base.updatedAt),
    createdAt: asString(row.created_at, base.createdAt)
  };
}

export class CommercialCoreRepository {
  constructor(private readonly context: RequestContext) {}

  private runtime() {
    return buildRepositoryRuntime(this.context);
  }

  async listOrders() {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return listOrders();
    try {
      const rows = await runtime.executor.query<Row>(
        `select id, tenant_id, order_no, customer_id, status, payment_status, delivery_status, grand_total, created_at, updated_at
         from sale_orders where tenant_id = $1 order by created_at desc`,
        [this.context.tenantId]
      );
      const mock = listOrders();
      const byId = new Map(mock.map((order) => [order.id, order]));
      return rows
        .map((row) => {
          const base = byId.get(asString(row.id));
          return base ? mapOrderRowToEntity(row, base) : null;
        })
        .filter((item): item is SaleOrder => item !== null);
    } catch {
      return listOrders();
    }
  }

  async getOrder(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getOrder(id);
    try {
      const rows = await runtime.executor.query<Row>(
        `select id, tenant_id, order_no, customer_id, status, payment_status, delivery_status, grand_total, created_at, updated_at
         from sale_orders where tenant_id = $1 and id = $2 limit 1`,
        [this.context.tenantId, id]
      );
      if (!rows[0]) return undefined;
      const base = getOrder(id);
      if (!base) return undefined;
      return mapOrderRowToEntity(rows[0], base);
    } catch {
      return getOrder(id);
    }
  }

  createOrder(payload: Partial<SaleOrder>) { return createOrder(payload); }
  patchOrder(id: string, payload: Partial<SaleOrder>) { return patchOrder(id, payload); }
  addOrderLine(id: string, payload: Partial<SaleOrderLine>) { return addOrderLine(id, payload); }
  patchOrderLine(id: string, lineId: string, payload: Partial<SaleOrderLine>) { return patchOrderLine(id, lineId, payload); }
  confirmOrder(id: string) { return confirmOrder(id); }
  planSourcing(id: string) { return planSourcing(id); }
  createWarehouseOrderFromOrder(id: string) { return createWarehouseOrderFromOrder(id); }
  createFactoryOrders(id: string) { return createFactoryOrders(id); }
  cancelOrder(id: string) { return cancelOrder(id); }

  listPayments() { return listPayments(); }
  getPayment(id: string) { return getPayment(id); }
  createPayment(payload: Partial<PaymentReceipt>) { return createPayment(payload); }
  confirmPayment(id: string) { return confirmPayment(id); }
  reversePayment(id: string, reason?: string) { return reversePayment(id, reason); }
  getPaymentAllocations(id: string) { return getPaymentAllocations(id); }

  listWarehouseOrders() { return listWarehouseOrders(); }
  getWarehouseOrder(id: string) { return getWarehouseOrder(id); }
  createWarehouseOrder(payload: Partial<WarehouseOrder>) { return createWarehouseOrder(payload); }
  assignWarehouseOrder(id: string, assignedTo: string) { return assignWarehouseOrder(id, assignedTo); }
  startWarehouseOrder(id: string) { return startWarehouseOrder(id); }
  markWarehouseOrderPrepared(id: string) { return markWarehouseOrderPrepared(id); }
  cancelWarehouseOrder(id: string) { return cancelWarehouseOrder(id); }
}
