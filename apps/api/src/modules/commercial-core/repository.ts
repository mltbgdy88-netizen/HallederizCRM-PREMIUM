import { buildOrderSourcePlan, calculateOrderTotals, deriveOrderDeliveryStatus, deriveOrderPaymentStatus, validateOrderTransition } from "@hallederiz/domain";
import type { QueryExecutor } from "@hallederiz/database";
import type { PaymentReceipt, SaleOrder, SaleOrderLine, WarehouseOrder, OrderSourcePlan } from "@hallederiz/types";
import { ApiDomainError, assertOptimisticConcurrency } from "../../shared/errors";
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
const nowIso = () => new Date().toISOString();

function mapOrderRow(row: Row): SaleOrder {
  return {
    id: asString(row.id),
    tenantId: asString(row.tenant_id, "tenant_1"),
    orderNo: asString(row.order_no),
    customerId: asString(row.customer_id),
    offerId: asString(row.offer_id, undefined),
    status: asString(row.status, "draft") as SaleOrder["status"],
    paymentStatus: asString(row.payment_status, "unpaid") as SaleOrder["paymentStatus"],
    deliveryStatus: asString(row.delivery_status, "none") as SaleOrder["deliveryStatus"],
    channel: asString(row.channel, "field") as SaleOrder["channel"],
    deliveryType: asString(row.delivery_type, "warehouse") as SaleOrder["deliveryType"],
    note: asString(row.note, undefined),
    priceSlotNoSnapshot: Math.max(1, Math.min(6, Math.trunc(asNumber(row.price_slot_no_snapshot, 1)))) as SaleOrder["priceSlotNoSnapshot"],
    priceSlotLabelSnapshot: asString(row.price_slot_label_snapshot, "Fiyat Alani 1"),
    currency: asString(row.currency, "TRY") as SaleOrder["currency"],
    subtotal: asNumber(row.subtotal, 0),
    taxRate: asNumber(row.tax_rate, 20),
    taxTotal: asNumber(row.tax_total, 0),
    grandTotal: asNumber(row.grand_total, 0),
    paidTotal: asNumber(row.paid_total, 0),
    source: asString(row.source, "manual") as SaleOrder["source"],
    createdBy: asString(row.created_by, "user_admin"),
    createdAt: asString(row.created_at, nowIso()),
    updatedAt: asString(row.updated_at, nowIso()),
    confirmedAt: asString(row.confirmed_at, undefined),
    lines: [],
    sourcePlans: []
  };
}

function mapOrderLineRow(row: Row): SaleOrderLine {
  return {
    id: asString(row.id),
    orderId: asString(row.order_id),
    productId: asString(row.product_id),
    productCode: asString(row.product_code),
    productName: asString(row.product_name),
    quantity: asNumber(row.quantity, 0),
    unitPrice: asNumber(row.unit_price, 0),
    currency: asString(row.currency, "TRY") as SaleOrderLine["currency"],
    exchangeRate: asNumber(row.exchange_rate, 1),
    tlUnitPrice: asNumber(row.tl_unit_price, 0),
    lineTotal: asNumber(row.line_total, 0),
    tlLineTotal: asNumber(row.tl_line_total, 0),
    priceSlotNo: Math.max(1, Math.min(6, Math.trunc(asNumber(row.price_slot_no, 1)))) as SaleOrderLine["priceSlotNo"],
    priceSlotLabelSnapshot: asString(row.price_slot_label_snapshot, "Fiyat Alani 1"),
    sourcePreference: asString(row.source_preference, "warehouse") as SaleOrderLine["sourcePreference"],
    centerStockSnapshot: asNumber(row.center_stock_snapshot, 0),
    factoryStockSnapshot: asNumber(row.factory_stock_snapshot, 0),
    preparedQuantity: asNumber(row.prepared_quantity, 0),
    deliveredQuantity: asNumber(row.delivered_quantity, 0)
  };
}

function mapSourcePlanRow(row: Row): OrderSourcePlan {
  return {
    id: asString(row.id),
    tenantId: asString(row.tenant_id, "tenant_1"),
    orderId: asString(row.order_id),
    lineId: asString(row.line_id),
    productId: asString(row.product_id),
    sourcePreference: asString(row.source_preference, "auto") as OrderSourcePlan["sourcePreference"],
    warehouseQuantity: asNumber(row.warehouse_quantity, 0),
    factoryQuantity: asNumber(row.factory_quantity, 0),
    status: asString(row.status, "not_planned") as OrderSourcePlan["status"],
    note: asString(row.note, undefined),
    createdAt: asString(row.created_at, nowIso())
  };
}

function validateSourcePlanQuantities(lines: SaleOrderLine[], plans: OrderSourcePlan[]) {
  const lineById = new Map(lines.map((line) => [line.id, line]));
  const aggregateByLine = new Map<string, { warehouse: number; factory: number }>();
  for (const plan of plans) {
    const line = lineById.get(plan.lineId);
    if (!line) {
      throw new ApiDomainError("validation_error", "Source plan line id gecersiz.", { lineId: plan.lineId });
    }
    const bucket = aggregateByLine.get(plan.lineId) ?? { warehouse: 0, factory: 0 };
    bucket.warehouse += plan.warehouseQuantity;
    bucket.factory += plan.factoryQuantity;
    aggregateByLine.set(plan.lineId, bucket);
  }
  for (const [lineId, totals] of aggregateByLine.entries()) {
    const line = lineById.get(lineId);
    if (!line) continue;
    if (totals.warehouse + totals.factory > line.quantity) {
      throw new ApiDomainError("validation_error", "Source plan miktari satir miktarini asamaz.", {
        lineId,
        planned: totals.warehouse + totals.factory,
        quantity: line.quantity
      });
    }
  }
}

export class CommercialCoreRepository {
  constructor(private readonly context: RequestContext) {}

  private runtime() {
    return buildRepositoryRuntime(this.context);
  }

  private async loadOrderAggregate(executor: QueryExecutor, orderId: string): Promise<SaleOrder | undefined> {
    const row = (await executor.query<Row>(
      `select * from sale_orders where tenant_id = $1 and id = $2 limit 1`,
      [this.context.tenantId, orderId]
    ))[0];
    if (!row) return undefined;
    const [lineRows, planRows] = await Promise.all([
      executor.query<Row>(`select * from sale_order_lines where tenant_id = $1 and order_id = $2 order by id asc`, [this.context.tenantId, orderId]),
      executor.query<Row>(`select * from order_source_plans where tenant_id = $1 and order_id = $2 order by created_at asc`, [this.context.tenantId, orderId])
    ]);
    const order = mapOrderRow(row);
    order.lines = lineRows.map(mapOrderLineRow);
    order.sourcePlans = planRows.map(mapSourcePlanRow);
    return order;
  }

  private async replaceOrderLinesTx(tx: QueryExecutor, orderId: string, lines: SaleOrderLine[]) {
    await tx.query(`delete from sale_order_lines where tenant_id = $1 and order_id = $2`, [this.context.tenantId, orderId]);
    for (const line of lines) {
      const lineTotal = Number((line.quantity * line.unitPrice).toFixed(2));
      const tlUnitPrice = Number((line.unitPrice * line.exchangeRate).toFixed(2));
      const tlLineTotal = Number((lineTotal * line.exchangeRate).toFixed(2));
      await tx.query(
        `insert into sale_order_lines
         (id, tenant_id, order_id, product_id, product_code, product_name, quantity, unit_price, currency, exchange_rate, tl_unit_price, line_total, tl_line_total,
          price_slot_no, price_slot_label_snapshot, source_preference, center_stock_snapshot, factory_stock_snapshot, prepared_quantity, delivered_quantity)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
        [
          line.id,
          this.context.tenantId,
          orderId,
          line.productId,
          line.productCode,
          line.productName,
          line.quantity,
          line.unitPrice,
          line.currency,
          line.exchangeRate,
          tlUnitPrice,
          lineTotal,
          tlLineTotal,
          line.priceSlotNo,
          line.priceSlotLabelSnapshot,
          line.sourcePreference,
          line.centerStockSnapshot,
          line.factoryStockSnapshot,
          line.preparedQuantity,
          line.deliveredQuantity
        ]
      );
    }
  }

  private async replaceOrderSourcePlansTx(tx: QueryExecutor, orderId: string, lines: SaleOrderLine[], plans: OrderSourcePlan[]) {
    validateSourcePlanQuantities(lines, plans);
    await tx.query(`delete from order_source_plans where tenant_id = $1 and order_id = $2`, [this.context.tenantId, orderId]);
    for (const plan of plans) {
      await tx.query(
        `insert into order_source_plans
         (id, tenant_id, order_id, line_id, product_id, source_preference, warehouse_quantity, factory_quantity, status, note, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          plan.id,
          this.context.tenantId,
          orderId,
          plan.lineId,
          plan.productId,
          plan.sourcePreference,
          plan.warehouseQuantity,
          plan.factoryQuantity,
          plan.status,
          plan.note ?? null,
          plan.createdAt ?? nowIso()
        ]
      );
    }
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
      const items: SaleOrder[] = [];
      for (const row of rows) {
        const order = await this.loadOrderAggregate(runtime.executor, asString(row.id));
        if (order) items.push(order);
      }
      return items;
    } catch {
      return listOrders();
    }
  }

  async getOrder(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getOrder(id);
    try {
      return await this.loadOrderAggregate(runtime.executor, id);
    } catch {
      return getOrder(id);
    }
  }

  async createOrder(payload: Partial<SaleOrder>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return createOrder(payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const id = payload.id ?? `order_${Date.now()}`;
        const now = nowIso();
        const lines = (payload.lines ?? []).map((line, index) => ({
          id: line.id ?? `order_line_${Date.now()}_${index}`,
          orderId: id,
          productId: line.productId ?? "",
          productCode: line.productCode ?? "",
          productName: line.productName ?? "",
          quantity: line.quantity ?? 0,
          unitPrice: line.unitPrice ?? 0,
          currency: line.currency ?? payload.currency ?? "TRY",
          exchangeRate: line.exchangeRate ?? 1,
          tlUnitPrice: line.tlUnitPrice ?? 0,
          lineTotal: line.lineTotal ?? 0,
          tlLineTotal: line.tlLineTotal ?? 0,
          priceSlotNo: line.priceSlotNo ?? (payload.priceSlotNoSnapshot ?? 1),
          priceSlotLabelSnapshot: line.priceSlotLabelSnapshot ?? payload.priceSlotLabelSnapshot ?? "Fiyat Alani 1",
          sourcePreference: line.sourcePreference ?? "auto",
          centerStockSnapshot: line.centerStockSnapshot ?? 0,
          factoryStockSnapshot: line.factoryStockSnapshot ?? 0,
          preparedQuantity: line.preparedQuantity ?? 0,
          deliveredQuantity: line.deliveredQuantity ?? 0
        })) satisfies SaleOrderLine[];

        const totals = calculateOrderTotals({ lines, currency: payload.currency ?? "TRY", taxRate: payload.taxRate ?? 20 });
        const sourcePlans = payload.sourcePlans ?? buildOrderSourcePlan({
          ...(payload as SaleOrder),
          id,
          tenantId: this.context.tenantId,
          lines
        } as SaleOrder);

        await tx.query(
          `insert into sale_orders
           (id, tenant_id, order_no, customer_id, offer_id, status, payment_status, delivery_status, channel, delivery_type, note,
            price_slot_no_snapshot, price_slot_label_snapshot, currency, subtotal, tax_rate, tax_total, grand_total, paid_total, source, created_by, created_at, updated_at, confirmed_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
          [
            id,
            this.context.tenantId,
            payload.orderNo ?? `SO-${Date.now().toString().slice(-6)}`,
            payload.customerId ?? "customer_1",
            payload.offerId ?? null,
            payload.status ?? "draft",
            payload.paymentStatus ?? "unpaid",
            payload.deliveryStatus ?? "none",
            payload.channel ?? "field",
            payload.deliveryType ?? "warehouse",
            payload.note ?? null,
            payload.priceSlotNoSnapshot ?? 1,
            payload.priceSlotLabelSnapshot ?? "Fiyat Alani 1",
            totals.currency,
            totals.subtotal,
            totals.taxRate,
            totals.taxTotal,
            totals.grandTotal,
            payload.paidTotal ?? 0,
            payload.source ?? "manual",
            payload.createdBy ?? this.context.userId,
            now,
            now,
            payload.confirmedAt ?? null
          ]
        );

        await this.replaceOrderLinesTx(tx, id, lines);
        await this.replaceOrderSourcePlansTx(tx, id, lines, sourcePlans);
        const created = await this.loadOrderAggregate(tx, id);
        if (!created) throw new ApiDomainError("validation_error", "Siparis kaydi olusturulamadi.");
        return created;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      return createOrder(payload);
    }
  }

  async patchOrder(id: string, payload: Partial<SaleOrder>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return patchOrder(id, payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const existing = await this.loadOrderAggregate(tx, id);
        if (!existing) return null;

        assertOptimisticConcurrency({
          expectedUpdatedAt: payload.updatedAt,
          currentUpdatedAt: existing.updatedAt,
          resource: "order",
          resourceId: id
        });

        const nextStatus = payload.status ?? existing.status;
        const transition = validateOrderTransition(existing.status, nextStatus);
        if (!transition.valid) {
          throw new ApiDomainError("validation_error", transition.reason ?? "Siparis gecisi gecersiz.");
        }

        const lines = payload.lines ?? existing.lines;
        const totals = calculateOrderTotals({ lines, currency: payload.currency ?? existing.currency, taxRate: payload.taxRate ?? existing.taxRate });
        const paidTotal = payload.paidTotal ?? existing.paidTotal;
        const paymentStatus = deriveOrderPaymentStatus({ id, grandTotal: totals.grandTotal, paidTotal }, []);
        const deliveryStatus = deriveOrderDeliveryStatus({ lines }, []);
        const sourcePlans = payload.sourcePlans ?? existing.sourcePlans;

        await tx.query(
          `update sale_orders set
             order_no = coalesce($3, order_no),
             customer_id = coalesce($4, customer_id),
             offer_id = coalesce($5, offer_id),
             status = $6,
             payment_status = $7,
             delivery_status = $8,
             channel = coalesce($9, channel),
             delivery_type = coalesce($10, delivery_type),
             note = coalesce($11, note),
             price_slot_no_snapshot = coalesce($12, price_slot_no_snapshot),
             price_slot_label_snapshot = coalesce($13, price_slot_label_snapshot),
             currency = $14,
             subtotal = $15,
             tax_rate = $16,
             tax_total = $17,
             grand_total = $18,
             paid_total = $19,
             source = coalesce($20, source),
             updated_at = $21
           where tenant_id = $1 and id = $2`,
          [
            this.context.tenantId,
            id,
            payload.orderNo ?? null,
            payload.customerId ?? null,
            payload.offerId ?? null,
            nextStatus,
            paymentStatus,
            deliveryStatus,
            payload.channel ?? null,
            payload.deliveryType ?? null,
            payload.note ?? null,
            payload.priceSlotNoSnapshot ?? null,
            payload.priceSlotLabelSnapshot ?? null,
            totals.currency,
            totals.subtotal,
            totals.taxRate,
            totals.taxTotal,
            totals.grandTotal,
            paidTotal,
            payload.source ?? null,
            nowIso()
          ]
        );

        await this.replaceOrderLinesTx(tx, id, lines);
        await this.replaceOrderSourcePlansTx(tx, id, lines, sourcePlans);
        return this.loadOrderAggregate(tx, id) ?? null;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      return patchOrder(id, payload);
    }
  }

  async addOrderLine(id: string, payload: Partial<SaleOrderLine>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return addOrderLine(id, payload);
    const existing = await this.getOrder(id);
    if (!existing) return null;
    const nextLine: SaleOrderLine = {
      id: payload.id ?? `order_line_${Date.now()}`,
      orderId: id,
      productId: payload.productId ?? "",
      productCode: payload.productCode ?? "",
      productName: payload.productName ?? "",
      quantity: payload.quantity ?? 0,
      unitPrice: payload.unitPrice ?? 0,
      currency: payload.currency ?? existing.currency,
      exchangeRate: payload.exchangeRate ?? 1,
      tlUnitPrice: payload.tlUnitPrice ?? 0,
      lineTotal: payload.lineTotal ?? 0,
      tlLineTotal: payload.tlLineTotal ?? 0,
      priceSlotNo: payload.priceSlotNo ?? existing.priceSlotNoSnapshot,
      priceSlotLabelSnapshot: payload.priceSlotLabelSnapshot ?? existing.priceSlotLabelSnapshot,
      sourcePreference: payload.sourcePreference ?? "auto",
      centerStockSnapshot: payload.centerStockSnapshot ?? 0,
      factoryStockSnapshot: payload.factoryStockSnapshot ?? 0,
      preparedQuantity: payload.preparedQuantity ?? 0,
      deliveredQuantity: payload.deliveredQuantity ?? 0
    };
    return this.patchOrder(id, { updatedAt: existing.updatedAt, lines: [...existing.lines, nextLine] });
  }

  async patchOrderLine(id: string, lineId: string, payload: Partial<SaleOrderLine>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return patchOrderLine(id, lineId, payload);
    const existing = await this.getOrder(id);
    if (!existing) return null;
    return this.patchOrder(id, {
      updatedAt: existing.updatedAt,
      lines: existing.lines.map((line) => (line.id === lineId ? { ...line, ...payload, id: line.id } : line))
    });
  }

  async confirmOrder(id: string) {
    const order = await this.getOrder(id);
    if (!order) return null;
    return this.patchOrder(id, { updatedAt: order.updatedAt, status: "confirmed", confirmedAt: nowIso() });
  }

  async planSourcing(id: string) {
    const order = await this.getOrder(id);
    if (!order) return null;
    const plans = buildOrderSourcePlan(order);
    return this.patchOrder(id, { updatedAt: order.updatedAt, sourcePlans: plans });
  }

  async createWarehouseOrderFromOrder(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return createWarehouseOrderFromOrder(id);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const order = await this.loadOrderAggregate(tx, id);
        if (!order) return null;
        const warehouseOrderId = `warehouse_order_${Date.now()}`;
        await tx.query(
          `insert into warehouse_orders (id, tenant_id, warehouse_order_no, order_id, warehouse_id, status, created_at)
           values ($1,$2,$3,$4,$5,$6,$7)`,
          [warehouseOrderId, this.context.tenantId, `WO-${Date.now().toString().slice(-5)}`, id, "wh_1", "waiting", nowIso()]
        );
        await tx.query(
          `update sale_orders set status = $3, delivery_status = $4, updated_at = $5 where tenant_id = $1 and id = $2`,
          [this.context.tenantId, id, "in_preparation", "preparing", nowIso()]
        );
        return {
          id: warehouseOrderId,
          tenantId: this.context.tenantId,
          warehouseOrderNo: `WO-${Date.now().toString().slice(-5)}`,
          orderId: id,
          orderNo: order.orderNo,
          customerId: order.customerId,
          warehouseId: "wh_1",
          warehouseName: "Merkez Depo",
          status: "waiting",
          dueAt: nowIso(),
          createdAt: nowIso(),
          updatedAt: nowIso(),
          lines: [],
          tasks: []
        } satisfies WarehouseOrder;
      });
    } catch {
      return createWarehouseOrderFromOrder(id);
    }
  }

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
