import {
  buildDocumentDeliveryRequest,
  buildDocumentRecord,
  buildOrderSourcePlan,
  buildWarehouseOrderFromSale,
  buildWarehouseTaskList,
  calculateInvoiceTotals,
  calculateOrderTotals,
  calculateReturnImpact,
  deriveOrderCompletionState,
  deriveOrderDeliveryStatus,
  deriveOrderPaymentStatus,
  validateDeliveryCustomerLink,
  validateDeliveryPaymentRule,
  validateDeliveryWarehouseState,
  validateOrderTransition
} from "@hallederiz/domain";
import type { QueryExecutor } from "@hallederiz/database";
import type {
  Delivery,
  DeliveryLine,
  Document,
  DocumentDelivery,
  DocumentType,
  Invoice,
  InvoiceLine,
  PaymentAllocation,
  PaymentReceipt,
  Return,
  ReturnLine,
  SaleOrder,
  SaleOrderLine,
  WarehouseOrder,
  WarehouseOrderLine,
  WarehouseTask,
  OrderSourcePlan
} from "@hallederiz/types";
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
  getDelivery as getDeliveryMock,
  listDeliveries as listDeliveriesMock,
  createDelivery as createDeliveryMock,
  validateDelivery as validateDeliveryMock,
  completeDelivery as completeDeliveryMock,
  rollbackDelivery as rollbackDeliveryMock,
  notifyDeliveryCustomer as notifyDeliveryCustomerMock,
  getInvoice as getInvoiceMock,
  listInvoices as listInvoicesMock,
  createInvoice as createInvoiceMock,
  issueInvoice as issueInvoiceMock,
  cancelInvoice as cancelInvoiceMock,
  sendInvoice as sendInvoiceMock,
  getReturn as getReturnMock,
  listReturns as listReturnsMock,
  createReturn as createReturnMock,
  approveReturn as approveReturnMock,
  receiveReturn as receiveReturnMock,
  completeReturn as completeReturnMock,
  cancelReturn as cancelReturnMock,
  getDocument as getDocumentMock,
  listDocuments as listDocumentsMock,
  renderDocument as renderDocumentMock,
  sendDocumentEmail as sendDocumentEmailMock,
  sendDocumentWhatsApp as sendDocumentWhatsAppMock,
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

function mapDeliveryRow(row: Row): Delivery {
  return {
    id: asString(row.id),
    tenantId: asString(row.tenant_id, "tenant_1"),
    deliveryNo: asString(row.delivery_no),
    orderId: asString(row.order_id),
    orderNo: asString(row.order_no),
    customerId: asString(row.customer_id),
    warehouseOrderId: asString(row.warehouse_order_id, undefined),
    status: asString(row.status, "pending") as Delivery["status"],
    plannedAt: asString(row.planned_at, nowIso()),
    deliveredAt: asString(row.delivered_at, undefined),
    documentStatus: asString(row.document_status, "missing") as Delivery["documentStatus"],
    note: asString(row.note, undefined),
    validation: {
      customerVerified: Boolean(row.validation_customer_verified ?? false),
      orderMatched: Boolean(row.validation_order_matched ?? false),
      warehouseReady: Boolean(row.validation_warehouse_ready ?? false),
      paymentMissing: Boolean(row.validation_payment_missing ?? false),
      approvalRequired: Boolean(row.validation_approval_required ?? false),
      riskNote: asString(row.validation_risk_note, ""),
      valid: Boolean(row.validation_valid ?? false),
      blockers: []
    },
    confirmation: row.confirmed_at
      ? {
          confirmedBy: asString(row.confirmed_by, "user_admin"),
          confirmedAt: asString(row.confirmed_at),
          note: asString(row.confirmation_note, undefined),
          customerNotified: Boolean(row.customer_notified ?? false)
        }
      : undefined,
    createdAt: asString(row.created_at, nowIso()),
    updatedAt: asString(row.updated_at, nowIso()),
    lines: []
  };
}

function mapDeliveryLineRow(row: Row): DeliveryLine {
  return {
    id: asString(row.id),
    deliveryId: asString(row.delivery_id),
    orderLineId: asString(row.order_line_id),
    productId: asString(row.product_id),
    productCode: asString(row.product_code),
    productName: asString(row.product_name),
    orderedQuantity: asNumber(row.ordered_quantity, 0),
    preparedQuantity: asNumber(row.prepared_quantity, 0),
    deliveredQuantity: asNumber(row.delivered_quantity, 0)
  };
}

function mapInvoiceRow(row: Row): Invoice {
  return {
    id: asString(row.id),
    tenantId: asString(row.tenant_id, "tenant_1"),
    invoiceNo: asString(row.invoice_no),
    customerId: asString(row.customer_id),
    orderId: asString(row.order_id, undefined),
    orderNo: asString(row.order_no, undefined),
    status: asString(row.status, "draft") as Invoice["status"],
    deliveryStatus: asString(row.delivery_status, "not_sent") as Invoice["deliveryStatus"],
    paymentStatus: asString(row.payment_status, "unpaid") as Invoice["paymentStatus"],
    issueDate: asString(row.issue_date, undefined),
    currency: asString(row.currency, "TRY") as Invoice["currency"],
    subtotal: asNumber(row.subtotal, 0),
    taxTotal: asNumber(row.tax_total, 0),
    grandTotal: asNumber(row.grand_total, 0),
    documentId: asString(row.document_id, undefined),
    createdAt: asString(row.created_at, nowIso()),
    updatedAt: asString(row.updated_at, nowIso()),
    lines: []
  };
}

function mapInvoiceLineRow(row: Row): InvoiceLine {
  return {
    id: asString(row.id),
    invoiceId: asString(row.invoice_id),
    orderLineId: asString(row.order_line_id, undefined),
    productId: asString(row.product_id),
    productCode: asString(row.product_code),
    productName: asString(row.product_name),
    quantity: asNumber(row.quantity, 0),
    unitPrice: asNumber(row.unit_price, 0),
    currency: asString(row.currency, "TRY") as InvoiceLine["currency"],
    taxRate: asNumber(row.tax_rate, 20),
    taxTotal: asNumber(row.tax_total, 0),
    lineTotal: asNumber(row.line_total, 0)
  };
}

function mapReturnRow(row: Row): Return {
  return {
    id: asString(row.id),
    tenantId: asString(row.tenant_id, "tenant_1"),
    returnNo: asString(row.return_no),
    customerId: asString(row.customer_id),
    orderId: asString(row.order_id, undefined),
    orderNo: asString(row.order_no, undefined),
    deliveryId: asString(row.delivery_id, undefined),
    deliveryNo: asString(row.delivery_no, undefined),
    status: asString(row.status, "draft") as Return["status"],
    note: asString(row.note, undefined),
    createdAt: asString(row.created_at, nowIso()),
    updatedAt: asString(row.updated_at, nowIso()),
    lines: []
  };
}

function mapReturnLineRow(row: Row): ReturnLine {
  return {
    id: asString(row.id),
    returnId: asString(row.return_id),
    orderLineId: asString(row.order_line_id, undefined),
    deliveryLineId: asString(row.delivery_line_id, undefined),
    productId: asString(row.product_id),
    productCode: asString(row.product_code),
    productName: asString(row.product_name),
    quantity: asNumber(row.quantity, 0),
    reasonCategory: asString(row.reason_category, "other") as ReturnLine["reasonCategory"],
    note: asString(row.note, undefined)
  };
}

function mapDocumentRow(row: Row): Document {
  return {
    id: asString(row.id),
    tenantId: asString(row.tenant_id, "tenant_1"),
    documentNo: asString(row.document_no),
    type: asString(row.document_type, "order_pdf") as DocumentType,
    entityType: asString(row.entity_type, "order") as Document["entityType"],
    entityId: asString(row.entity_id),
    entityNo: asString(row.entity_no),
    customerId: asString(row.customer_id, undefined),
    title: asString(row.title, "Belge"),
    previewText: asString(row.preview_text, ""),
    createdAt: asString(row.created_at, nowIso()),
    createdBy: asString(row.created_by, "user_admin"),
    deliveries: []
  };
}

function mapDocumentDeliveryRow(row: Row): DocumentDelivery {
  return {
    id: asString(row.id),
    tenantId: asString(row.tenant_id, "tenant_1"),
    documentId: asString(row.document_id),
    channel: asString(row.channel, "download") as DocumentDelivery["channel"],
    status: asString(row.status, "queued") as DocumentDelivery["status"],
    recipient: asString(row.recipient, undefined),
    requestedAt: asString(row.requested_at, nowIso()),
    sentAt: asString(row.sent_at, undefined),
    deliveredAt: asString(row.delivered_at, undefined),
    errorMessage: asString(row.error_message, undefined)
  };
}

function mapPaymentAllocationRow(row: Row): PaymentAllocation {
  return {
    id: asString(row.id),
    tenantId: asString(row.tenant_id, "tenant_1"),
    paymentId: asString(row.payment_id),
    customerId: asString(row.customer_id),
    targetType: asString(row.target_type, "order") as PaymentAllocation["targetType"],
    targetId: asString(row.target_id, undefined),
    targetNo: asString(row.target_no),
    targetTotal: asNumber(row.target_total, 0),
    openBalance: asNumber(row.open_balance, 0),
    allocatedAmount: asNumber(row.allocated_amount, 0),
    currency: asString(row.currency, "TRY") as PaymentAllocation["currency"],
    createdAt: asString(row.created_at, nowIso())
  };
}

function mapPaymentRow(row: Row, allocations: PaymentAllocation[] = []): PaymentReceipt {
  return {
    id: asString(row.id),
    tenantId: asString(row.tenant_id, "tenant_1"),
    receiptNo: asString(row.receipt_no),
    customerId: asString(row.customer_id),
    amount: asNumber(row.amount, 0),
    currency: asString(row.currency, "TRY") as PaymentReceipt["currency"],
    method: asString(row.method, "transfer") as PaymentReceipt["method"],
    status: asString(row.status, "draft") as PaymentReceipt["status"],
    description: asString(row.description, undefined),
    referenceNo: asString(row.reference_no, undefined),
    documentCount: asNumber(row.document_count, 0),
    receivedAt: asString(row.received_at, asString(row.created_at, nowIso())),
    createdBy: asString(row.created_by, "user_admin"),
    createdAt: asString(row.created_at, nowIso()),
    confirmedAt: asString(row.confirmed_at, undefined),
    allocations
  };
}

function mapWarehouseOrderLineRow(row: Row): WarehouseOrderLine {
  return {
    id: asString(row.id),
    warehouseOrderId: asString(row.warehouse_order_id),
    orderLineId: asString(row.order_line_id),
    productId: asString(row.product_id),
    productCode: asString(row.product_code),
    productName: asString(row.product_name),
    requestedQuantity: asNumber(row.requested_quantity, 0),
    preparedQuantity: asNumber(row.prepared_quantity, 0),
    warehouseId: asString(row.warehouse_id, undefined),
    warehouseName: asString(row.warehouse_name, "Merkez Depo"),
    rackNo: asString(row.rack_no, undefined),
    locationCode: asString(row.location_code, undefined)
  };
}

function mapWarehouseTaskRow(row: Row): WarehouseTask {
  return {
    id: asString(row.id),
    tenantId: asString(row.tenant_id, "tenant_1"),
    warehouseOrderId: asString(row.warehouse_order_id),
    taskNo: asString(row.task_no),
    title: asString(row.title),
    status: asString(row.status, "open") as WarehouseTask["status"],
    assigneeName: asString(row.assignee_name, undefined),
    dueAt: asString(row.due_at, nowIso()),
    critical: Boolean(row.critical ?? false)
  };
}

function mapWarehouseOrderRow(row: Row, lines: WarehouseOrderLine[] = [], tasks: WarehouseTask[] = []): WarehouseOrder {
  return {
    id: asString(row.id),
    tenantId: asString(row.tenant_id, "tenant_1"),
    warehouseOrderNo: asString(row.warehouse_order_no),
    orderId: asString(row.order_id),
    orderNo: asString(row.order_no, ""),
    customerId: asString(row.customer_id, ""),
    warehouseId: asString(row.warehouse_id, undefined),
    warehouseName: asString(row.warehouse_name, "Merkez Depo"),
    status: asString(row.status, "waiting") as WarehouseOrder["status"],
    assignedTo: asString(row.assigned_to, undefined),
    dueAt: asString(row.due_at, asString(row.created_at, nowIso())),
    startedAt: asString(row.started_at, undefined),
    preparedAt: asString(row.prepared_at, undefined),
    note: asString(row.note, undefined),
    createdAt: asString(row.created_at, nowIso()),
    updatedAt: asString(row.updated_at, asString(row.created_at, nowIso())),
    lines,
    tasks
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

  private buildFoundationPaymentAllocations(payment: PaymentReceipt, orders: SaleOrder[]): PaymentAllocation[] {
    const candidateOrder = orders.find((order) => order.customerId === payment.customerId && order.status !== "cancelled");
    if (!candidateOrder) return [];
    return [
      {
        id: `allocation_${payment.id}_${candidateOrder.id}`,
        tenantId: this.context.tenantId,
        paymentId: payment.id,
        customerId: payment.customerId,
        targetType: "order",
        targetId: candidateOrder.id,
        targetNo: candidateOrder.orderNo,
        targetTotal: candidateOrder.grandTotal,
        openBalance: Math.max(0, candidateOrder.grandTotal - payment.amount),
        allocatedAmount: Math.min(payment.amount, candidateOrder.grandTotal),
        currency: payment.currency,
        createdAt: payment.confirmedAt ?? payment.createdAt
      }
    ];
  }

  private async fetchPaymentAllocationsMap(runtime: ReturnType<typeof buildRepositoryRuntime>, paymentIds: string[]): Promise<Map<string, PaymentAllocation[]>> {
    const result = new Map<string, PaymentAllocation[]>();
    if (paymentIds.length === 0) return result;
    const params: unknown[] = [this.context.tenantId, ...paymentIds];
    const placeholders = paymentIds.map((_, index) => `$${index + 2}`).join(", ");
    const rows = await runtime.executor.query<Row>(
      `select * from payment_allocations where tenant_id = $1 and payment_id in (${placeholders}) order by created_at asc`,
      params
    );
    for (const row of rows) {
      const pid = asString(row.payment_id);
      const list = result.get(pid) ?? [];
      list.push(mapPaymentAllocationRow(row));
      result.set(pid, list);
    }
    return result;
  }

  private async loadPaymentAllocationsForPayment(runtime: ReturnType<typeof buildRepositoryRuntime>, paymentId: string): Promise<PaymentAllocation[]> {
    const map = await this.fetchPaymentAllocationsMap(runtime, [paymentId]);
    return map.get(paymentId) ?? [];
  }

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

  private async fetchWarehouseLinesMap(executor: QueryExecutor, warehouseOrderIds: string[]): Promise<Map<string, WarehouseOrderLine[]>> {
    const result = new Map<string, WarehouseOrderLine[]>();
    if (warehouseOrderIds.length === 0) return result;
    const params: unknown[] = [this.context.tenantId, ...warehouseOrderIds];
    const placeholders = warehouseOrderIds.map((_, index) => `$${index + 2}`).join(", ");
    const rows = await executor.query<Row>(
      `select * from warehouse_order_lines where tenant_id = $1 and warehouse_order_id in (${placeholders}) order by created_at asc`,
      params
    );
    for (const row of rows) {
      const wid = asString(row.warehouse_order_id);
      const list = result.get(wid) ?? [];
      list.push(mapWarehouseOrderLineRow(row));
      result.set(wid, list);
    }
    return result;
  }

  private async fetchWarehouseTasksMap(executor: QueryExecutor, warehouseOrderIds: string[]): Promise<Map<string, WarehouseTask[]>> {
    const result = new Map<string, WarehouseTask[]>();
    if (warehouseOrderIds.length === 0) return result;
    const params: unknown[] = [this.context.tenantId, ...warehouseOrderIds];
    const placeholders = warehouseOrderIds.map((_, index) => `$${index + 2}`).join(", ");
    const rows = await executor.query<Row>(
      `select * from warehouse_tasks where tenant_id = $1 and warehouse_order_id in (${placeholders}) order by created_at asc`,
      params
    );
    for (const row of rows) {
      const wid = asString(row.warehouse_order_id);
      const list = result.get(wid) ?? [];
      list.push(mapWarehouseTaskRow(row));
      result.set(wid, list);
    }
    return result;
  }

  private async loadWarehouseOrderAggregate(executor: QueryExecutor, idOrNo: string): Promise<WarehouseOrder | undefined> {
    const row = (
      await executor.query<Row>(
        `select * from warehouse_orders where tenant_id = $1 and (id = $2 or warehouse_order_no = $2) limit 1`,
        [this.context.tenantId, idOrNo]
      )
    )[0];
    if (!row) return undefined;
    const wid = asString(row.id);
    const [lineMap, taskMap] = await Promise.all([
      this.fetchWarehouseLinesMap(executor, [wid]),
      this.fetchWarehouseTasksMap(executor, [wid])
    ]);
    return mapWarehouseOrderRow(row, lineMap.get(wid) ?? [], taskMap.get(wid) ?? []);
  }

  private async insertWarehouseOrderHeaderTx(tx: QueryExecutor, wo: WarehouseOrder) {
    await tx.query(
      `insert into warehouse_orders
      (id, tenant_id, warehouse_order_no, order_id, warehouse_id, status, order_no, customer_id, warehouse_name, assigned_to, due_at, note, created_at, updated_at, started_at, prepared_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        wo.id,
        wo.tenantId,
        wo.warehouseOrderNo,
        wo.orderId,
        wo.warehouseId ?? null,
        wo.status,
        wo.orderNo,
        wo.customerId,
        wo.warehouseName,
        wo.assignedTo ?? null,
        wo.dueAt,
        wo.note ?? null,
        wo.createdAt,
        wo.updatedAt,
        wo.startedAt ?? null,
        wo.preparedAt ?? null
      ]
    );
  }

  private async insertWarehouseOrderChildrenTx(tx: QueryExecutor, wo: WarehouseOrder) {
    for (const line of wo.lines) {
      await tx.query(
        `insert into warehouse_order_lines
        (id, tenant_id, warehouse_order_id, order_line_id, product_id, product_code, product_name, requested_quantity, prepared_quantity, warehouse_id, warehouse_name, rack_no, location_code, created_at)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          line.id,
          wo.tenantId,
          wo.id,
          line.orderLineId,
          line.productId,
          line.productCode,
          line.productName,
          line.requestedQuantity,
          line.preparedQuantity,
          line.warehouseId ?? null,
          line.warehouseName,
          line.rackNo ?? null,
          line.locationCode ?? null,
          wo.createdAt
        ]
      );
    }
    for (const task of wo.tasks) {
      await tx.query(
        `insert into warehouse_tasks
        (id, tenant_id, warehouse_order_id, task_no, title, status, assignee_name, due_at, critical, created_at)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          task.id,
          wo.tenantId,
          wo.id,
          task.taskNo,
          task.title,
          task.status,
          task.assigneeName ?? null,
          task.dueAt,
          task.critical,
          wo.createdAt
        ]
      );
    }
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

  private async loadDeliveryAggregate(executor: QueryExecutor, deliveryId: string): Promise<Delivery | undefined> {
    const row = (await executor.query<Row>(`select * from deliveries where tenant_id = $1 and id = $2 limit 1`, [this.context.tenantId, deliveryId]))[0];
    if (!row) return undefined;
    const lines = await executor.query<Row>(`select * from delivery_lines where tenant_id = $1 and delivery_id = $2 order by id asc`, [this.context.tenantId, deliveryId]);
    const delivery = mapDeliveryRow(row);
    delivery.lines = lines.map(mapDeliveryLineRow);
    return delivery;
  }

  private async replaceDeliveryLinesTx(tx: QueryExecutor, deliveryId: string, lines: DeliveryLine[]) {
    await tx.query(`delete from delivery_lines where tenant_id = $1 and delivery_id = $2`, [this.context.tenantId, deliveryId]);
    for (const line of lines) {
      await tx.query(
        `insert into delivery_lines
         (id, tenant_id, delivery_id, order_line_id, product_id, product_code, product_name, ordered_quantity, prepared_quantity, delivered_quantity)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [line.id, this.context.tenantId, deliveryId, line.orderLineId, line.productId, line.productCode, line.productName, line.orderedQuantity, line.preparedQuantity, line.deliveredQuantity]
      );
    }
  }

  private validateDeliveryLineParity(lines: DeliveryLine[], orderLines: SaleOrderLine[]) {
    const orderLineMap = new Map(orderLines.map((line) => [line.id, line]));
    for (const line of lines) {
      const source = orderLineMap.get(line.orderLineId);
      if (!source) {
        throw new ApiDomainError("validation_error", "Teslim satiri siparis satiri ile eslesmiyor.", { lineId: line.id, orderLineId: line.orderLineId });
      }
      if (line.deliveredQuantity > source.quantity) {
        throw new ApiDomainError("validation_error", "Teslim edilen miktar siparis miktarini asamaz.", { lineId: line.id, delivered: line.deliveredQuantity, ordered: source.quantity });
      }
    }
  }

  private async loadInvoiceAggregate(executor: QueryExecutor, invoiceId: string): Promise<Invoice | undefined> {
    const row = (await executor.query<Row>(`select * from invoices where tenant_id = $1 and id = $2 limit 1`, [this.context.tenantId, invoiceId]))[0];
    if (!row) return undefined;
    const lineRows = await executor.query<Row>(`select * from invoice_lines where tenant_id = $1 and invoice_id = $2 order by id asc`, [this.context.tenantId, invoiceId]);
    const invoice = mapInvoiceRow(row);
    invoice.lines = lineRows.map(mapInvoiceLineRow);
    return invoice;
  }

  private async replaceInvoiceLinesTx(tx: QueryExecutor, invoiceId: string, lines: InvoiceLine[]) {
    await tx.query(`delete from invoice_lines where tenant_id = $1 and invoice_id = $2`, [this.context.tenantId, invoiceId]);
    for (const line of lines) {
      await tx.query(
        `insert into invoice_lines
         (id, tenant_id, invoice_id, order_line_id, product_id, product_code, product_name, quantity, unit_price, currency, tax_rate, tax_total, line_total)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [line.id, this.context.tenantId, invoiceId, line.orderLineId ?? null, line.productId, line.productCode, line.productName, line.quantity, line.unitPrice, line.currency, line.taxRate, line.taxTotal, line.lineTotal]
      );
    }
  }

  private async loadReturnAggregate(executor: QueryExecutor, returnId: string): Promise<Return | undefined> {
    const row = (await executor.query<Row>(`select * from returns where tenant_id = $1 and id = $2 limit 1`, [this.context.tenantId, returnId]))[0];
    if (!row) return undefined;
    const lineRows = await executor.query<Row>(`select * from return_lines where tenant_id = $1 and return_id = $2 order by id asc`, [this.context.tenantId, returnId]);
    const ret = mapReturnRow(row);
    ret.lines = lineRows.map(mapReturnLineRow);
    return ret;
  }

  private async replaceReturnLinesTx(tx: QueryExecutor, returnId: string, lines: ReturnLine[]) {
    await tx.query(`delete from return_lines where tenant_id = $1 and return_id = $2`, [this.context.tenantId, returnId]);
    for (const line of lines) {
      await tx.query(
        `insert into return_lines
         (id, tenant_id, return_id, order_line_id, delivery_line_id, product_id, product_code, product_name, quantity, reason_category, note)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [line.id, this.context.tenantId, returnId, line.orderLineId ?? null, line.deliveryLineId ?? null, line.productId, line.productCode, line.productName, line.quantity, line.reasonCategory, line.note ?? null]
      );
    }
  }

  private async loadDocumentAggregate(executor: QueryExecutor, documentId: string): Promise<Document | undefined> {
    const row = (await executor.query<Row>(`select * from documents where tenant_id = $1 and id = $2 limit 1`, [this.context.tenantId, documentId]))[0];
    if (!row) return undefined;
    const deliveryRows = await executor.query<Row>(`select * from document_deliveries where tenant_id = $1 and document_id = $2 order by requested_at desc`, [this.context.tenantId, documentId]);
    const document = mapDocumentRow(row);
    document.deliveries = deliveryRows.map(mapDocumentDeliveryRow);
    return document;
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
    } catch (error) {
      runtime.handleDbFailure(error);
      return listOrders();
    }
  }

  async getOrder(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getOrder(id);
    try {
      return await this.loadOrderAggregate(runtime.executor, id);
    } catch (error) {
      runtime.handleDbFailure(error);
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
      runtime.handleDbFailure(error);
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
      runtime.handleDbFailure(error);
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
      let resultId: string | undefined;
      await runtime.executor.transaction(async (tx) => {
        const order = await this.loadOrderAggregate(tx, id);
        if (!order) {
          resultId = undefined;
          return;
        }
        const wo = buildWarehouseOrderFromSale(order);
        wo.tenantId = this.context.tenantId;
        const existing = (
          await tx.query<Row>(`select id from warehouse_orders where tenant_id = $1 and id = $2 limit 1`, [this.context.tenantId, wo.id])
        )[0];
        if (existing) {
          resultId = asString(existing.id);
          await tx.query(`update sale_orders set status = $3, delivery_status = $4, updated_at = $5 where tenant_id = $1 and id = $2`, [
            this.context.tenantId,
            id,
            "in_preparation",
            "preparing",
            nowIso()
          ]);
          return;
        }
        await this.insertWarehouseOrderHeaderTx(tx, wo);
        await this.insertWarehouseOrderChildrenTx(tx, wo);
        await tx.query(`update sale_orders set status = $3, delivery_status = $4, updated_at = $5 where tenant_id = $1 and id = $2`, [
          this.context.tenantId,
          id,
          "in_preparation",
          "preparing",
          nowIso()
        ]);
        resultId = wo.id;
      });
      if (!resultId) return null;
      return (await this.loadWarehouseOrderAggregate(runtime.executor, resultId)) ?? null;
    } catch (error) {
      runtime.handleDbFailure(error);
      return createWarehouseOrderFromOrder(id);
    }
  }

  async listDeliveries() {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return listDeliveriesMock();
    try {
      const rows = await runtime.executor.query<Row>(
        `select * from deliveries where tenant_id = $1 order by created_at desc`,
        [this.context.tenantId]
      );
      const items = await Promise.all(
        rows.map(async (row) => {
          const aggregate = await this.loadDeliveryAggregate(runtime.executor, asString(row.id));
          return aggregate ?? mapDeliveryRow(row);
        })
      );
      return items;
    } catch (error) {
      runtime.handleDbFailure(error);
      return listDeliveriesMock();
    }
  }

  async getDelivery(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getDeliveryMock(id);
    try {
      return await this.loadDeliveryAggregate(runtime.executor, id);
    } catch (error) {
      runtime.handleDbFailure(error);
      return getDeliveryMock(id);
    }
  }

  async createDelivery(payload: Partial<Delivery>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return createDeliveryMock(payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const id = payload.id ?? `delivery_${Date.now()}`;
        const now = nowIso();
        const order = payload.orderId ? await this.loadOrderAggregate(tx, payload.orderId) : null;
        if (!order) {
          throw new ApiDomainError("validation_error", "Teslimat olusturmak icin gecerli siparis baglantisi gerekli.");
        }

        const lines: DeliveryLine[] = (payload.lines ?? []).map((line) => ({
          id: line.id ?? `delivery_line_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          deliveryId: id,
          orderLineId: line.orderLineId,
          productId: line.productId,
          productCode: line.productCode,
          productName: line.productName,
          orderedQuantity: line.orderedQuantity,
          preparedQuantity: line.preparedQuantity,
          deliveredQuantity: line.deliveredQuantity
        }));
        this.validateDeliveryLineParity(lines, order.lines);

        const warehouseOrders = await this.listWarehouseOrders();
        const deliveryDraft: Delivery = {
          id,
          tenantId: this.context.tenantId,
          deliveryNo: payload.deliveryNo ?? `DLV-${Date.now().toString().slice(-5)}`,
          orderId: order.id,
          orderNo: order.orderNo,
          customerId: order.customerId,
          warehouseOrderId: payload.warehouseOrderId,
          status: payload.status ?? "pending",
          plannedAt: payload.plannedAt ?? now,
          deliveredAt: payload.deliveredAt,
          documentStatus: payload.documentStatus ?? "missing",
          note: payload.note,
          validation: payload.validation ?? {
            customerVerified: false,
            orderMatched: false,
            warehouseReady: false,
            paymentMissing: false,
            approvalRequired: false,
            riskNote: "Teslimat dogrulamasi henuz tamamlanmadi.",
            valid: false,
            blockers: []
          },
          confirmation: payload.confirmation,
          createdAt: now,
          updatedAt: now,
          lines
        };

        const linkValidation = validateDeliveryCustomerLink(deliveryDraft, order, { id: order.customerId, active: true });
        const paymentValidation = validateDeliveryPaymentRule(order);
        const warehouseValidation = validateDeliveryWarehouseState(deliveryDraft, warehouseOrders);
        const validation = {
          customerVerified: linkValidation.valid,
          orderMatched: deliveryDraft.orderId === order.id && deliveryDraft.customerId === order.customerId,
          warehouseReady: warehouseValidation.warehouseReady,
          paymentMissing: paymentValidation.paymentMissing,
          approvalRequired: paymentValidation.approvalRequired,
          riskNote: [...linkValidation.blockers, ...paymentValidation.blockers, ...warehouseValidation.blockers][0] ?? "Dogrulama uygun.",
          valid: linkValidation.valid && paymentValidation.valid && warehouseValidation.valid,
          blockers: [...linkValidation.blockers, ...paymentValidation.blockers, ...warehouseValidation.blockers]
        } satisfies Delivery["validation"];

        await tx.query(
          `insert into deliveries
          (id, tenant_id, delivery_no, order_id, status, created_at)
          values ($1,$2,$3,$4,$5,$6)`,
          [id, this.context.tenantId, deliveryDraft.deliveryNo, order.id, deliveryDraft.status, now]
        );
        await this.replaceDeliveryLinesTx(tx, id, lines);
        await tx.query(
          `update sale_orders set delivery_status = $3, updated_at = $4 where tenant_id = $1 and id = $2`,
          [this.context.tenantId, order.id, deliveryDraft.status === "ready" ? "ready" : "preparing", now]
        );
        const created = await this.loadDeliveryAggregate(tx, id);
        if (!created) throw new ApiDomainError("validation_error", "Teslimat kaydi olusturulamadi.");
        return { ...created, validation };
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      runtime.handleDbFailure(error);
      return createDeliveryMock(payload);
    }
  }

  async validateDelivery(id: string) {
    const delivery = await this.getDelivery(id);
    if (!delivery) return null;
    const order = await this.getOrder(delivery.orderId);
    if (!order) {
      throw new ApiDomainError("validation_error", "Teslimat siparis baglantisi bulunamadi.");
    }
    const warehouseOrders = await this.listWarehouseOrders();
    const linkValidation = validateDeliveryCustomerLink(delivery, order, { id: order.customerId, active: true });
    const paymentValidation = validateDeliveryPaymentRule(order);
    const warehouseValidation = validateDeliveryWarehouseState(delivery, warehouseOrders);
    return {
      customerVerified: linkValidation.valid,
      orderMatched: delivery.orderId === order.id && delivery.customerId === order.customerId,
      warehouseReady: warehouseValidation.warehouseReady,
      paymentMissing: paymentValidation.paymentMissing,
      approvalRequired: paymentValidation.approvalRequired,
      riskNote: [...linkValidation.blockers, ...paymentValidation.blockers, ...warehouseValidation.blockers][0] ?? "Dogrulama uygun.",
      valid: linkValidation.valid && paymentValidation.valid && warehouseValidation.valid,
      blockers: [...linkValidation.blockers, ...paymentValidation.blockers, ...warehouseValidation.blockers]
    } satisfies Delivery["validation"];
  }

  async completeDelivery(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return completeDeliveryMock(id);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const delivery = await this.loadDeliveryAggregate(tx, id);
        if (!delivery) return null;
        const validation = await this.validateDelivery(id);
        if (!validation?.valid) {
          throw new ApiDomainError("validation_error", `Teslimat tamamlanamadi: ${(validation?.blockers ?? []).join(" | ")}`);
        }
        await tx.query(
          `update deliveries set status = $3 where tenant_id = $1 and id = $2`,
          [this.context.tenantId, id, "delivered"]
        );
        const order = await this.loadOrderAggregate(tx, delivery.orderId);
        if (order) {
          await tx.query(
            `update sale_orders set delivery_status = $3, status = $4, updated_at = $5 where tenant_id = $1 and id = $2`,
            [this.context.tenantId, order.id, "delivered", deriveOrderCompletionState([{ ...delivery, status: "delivered" }]), nowIso()]
          );
        }
        const updated = await this.loadDeliveryAggregate(tx, id);
        return updated ? { ...updated, validation } : null;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      runtime.handleDbFailure(error);
      return completeDeliveryMock(id);
    }
  }

  async rollbackDelivery(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return rollbackDeliveryMock(id);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const delivery = await this.loadDeliveryAggregate(tx, id);
        if (!delivery) return null;
        await tx.query(`update deliveries set status = $3 where tenant_id = $1 and id = $2`, [this.context.tenantId, id, "rolled_back"]);
        const order = await this.loadOrderAggregate(tx, delivery.orderId);
        if (order) {
          await tx.query(
            `update sale_orders set delivery_status = $3, status = $4, updated_at = $5 where tenant_id = $1 and id = $2`,
            [this.context.tenantId, order.id, "none", order.status === "completed" ? "partially_delivered" : order.status, nowIso()]
          );
        }
        return this.loadDeliveryAggregate(tx, id);
      });
    } catch (error) {
      runtime.handleDbFailure(error);
      return rollbackDeliveryMock(id);
    }
  }

  async notifyDeliveryCustomer(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return notifyDeliveryCustomerMock(id);
    const delivery = await this.getDelivery(id);
    if (!delivery) return null;
    return { ...delivery, confirmation: { confirmedBy: this.context.userId, confirmedAt: nowIso(), customerNotified: true, note: "Musteriye teslimat bildirimi gonderildi." } };
  }

  async listInvoices() {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return listInvoicesMock();
    try {
      const rows = await runtime.executor.query<Row>(`select * from invoices where tenant_id = $1 order by created_at desc`, [this.context.tenantId]);
      const items = await Promise.all(rows.map(async (row) => (await this.loadInvoiceAggregate(runtime.executor, asString(row.id))) ?? mapInvoiceRow(row)));
      return items;
    } catch (error) {
      runtime.handleDbFailure(error);
      return listInvoicesMock();
    }
  }

  async getInvoice(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getInvoiceMock(id);
    try {
      return await this.loadInvoiceAggregate(runtime.executor, id);
    } catch (error) {
      runtime.handleDbFailure(error);
      return getInvoiceMock(id);
    }
  }

  async createInvoice(payload: Partial<Invoice>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return createInvoiceMock(payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const id = payload.id ?? `invoice_${Date.now()}`;
        const now = nowIso();
        const order = payload.orderId ? await this.loadOrderAggregate(tx, payload.orderId) : null;
        const lines: InvoiceLine[] = (payload.lines ?? []).map((line) => ({
          id: line.id ?? `invoice_line_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          invoiceId: id,
          orderLineId: line.orderLineId,
          productId: line.productId,
          productCode: line.productCode,
          productName: line.productName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          currency: line.currency ?? payload.currency ?? "TRY",
          taxRate: line.taxRate ?? 20,
          taxTotal: line.taxTotal ?? Number((line.quantity * line.unitPrice * ((line.taxRate ?? 20) / 100)).toFixed(2)),
          lineTotal: line.lineTotal ?? Number((line.quantity * line.unitPrice).toFixed(2))
        }));
        const totals = calculateInvoiceTotals(lines, payload.currency ?? order?.currency ?? "TRY");
        await tx.query(
          `insert into invoices (id, tenant_id, invoice_no, order_id, status, grand_total, created_at)
           values ($1,$2,$3,$4,$5,$6,$7)`,
          [id, this.context.tenantId, payload.invoiceNo ?? `INV-${Date.now().toString().slice(-5)}`, payload.orderId ?? null, payload.status ?? "draft", totals.grandTotal, now]
        );
        await this.replaceInvoiceLinesTx(tx, id, lines);
        const created = await this.loadInvoiceAggregate(tx, id);
        if (!created) throw new ApiDomainError("validation_error", "Fatura kaydi olusturulamadi.");
        return created;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      runtime.handleDbFailure(error);
      return createInvoiceMock(payload);
    }
  }

  async issueInvoice(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return issueInvoiceMock(id);
    try {
      const invoice = await this.getInvoice(id);
      if (!invoice) return null;
      await runtime.executor.query(
        `update invoices set status = $3 where tenant_id = $1 and id = $2`,
        [this.context.tenantId, id, "issued"]
      );
      return this.getInvoice(id);
    } catch (error) {
      runtime.handleDbFailure(error);
      return issueInvoiceMock(id);
    }
  }

  async cancelInvoice(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return cancelInvoiceMock(id);
    try {
      await runtime.executor.query(`update invoices set status = $3 where tenant_id = $1 and id = $2`, [this.context.tenantId, id, "cancelled"]);
      return this.getInvoice(id);
    } catch (error) {
      runtime.handleDbFailure(error);
      return cancelInvoiceMock(id);
    }
  }

  async sendInvoice(id: string) {
    const invoice = await this.getInvoice(id);
    if (!invoice) return null;
    return { ...invoice, deliveryStatus: "sent" };
  }

  async listReturns() {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return listReturnsMock();
    try {
      const rows = await runtime.executor.query<Row>(`select * from returns where tenant_id = $1 order by created_at desc`, [this.context.tenantId]);
      const items = await Promise.all(rows.map(async (row) => (await this.loadReturnAggregate(runtime.executor, asString(row.id))) ?? mapReturnRow(row)));
      return items;
    } catch (error) {
      runtime.handleDbFailure(error);
      return listReturnsMock();
    }
  }

  async getReturn(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getReturnMock(id);
    try {
      return await this.loadReturnAggregate(runtime.executor, id);
    } catch (error) {
      runtime.handleDbFailure(error);
      return getReturnMock(id);
    }
  }

  async createReturn(payload: Partial<Return>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return createReturnMock(payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const id = payload.id ?? `return_${Date.now()}`;
        const now = nowIso();
        const lines: ReturnLine[] = (payload.lines ?? []).map((line) => ({
          id: line.id ?? `return_line_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          returnId: id,
          orderLineId: line.orderLineId,
          deliveryLineId: line.deliveryLineId,
          productId: line.productId,
          productCode: line.productCode,
          productName: line.productName,
          quantity: line.quantity,
          reasonCategory: line.reasonCategory ?? "other",
          note: line.note
        }));
        await tx.query(
          `insert into returns (id, tenant_id, return_no, customer_id, status, created_at)
           values ($1,$2,$3,$4,$5,$6)`,
          [id, this.context.tenantId, payload.returnNo ?? `RET-${Date.now().toString().slice(-5)}`, payload.customerId ?? "customer_1", payload.status ?? "draft", now]
        );
        await this.replaceReturnLinesTx(tx, id, lines);
        const created = await this.loadReturnAggregate(tx, id);
        if (!created) throw new ApiDomainError("validation_error", "Iade kaydi olusturulamadi.");
        return created;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      runtime.handleDbFailure(error);
      return createReturnMock(payload);
    }
  }

  async approveReturn(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return approveReturnMock(id);
    try {
      await runtime.executor.query(`update returns set status = $3 where tenant_id = $1 and id = $2`, [this.context.tenantId, id, "approved"]);
      return this.getReturn(id);
    } catch (error) {
      runtime.handleDbFailure(error);
      return approveReturnMock(id);
    }
  }

  async receiveReturn(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return receiveReturnMock(id);
    try {
      await runtime.executor.query(`update returns set status = $3 where tenant_id = $1 and id = $2`, [this.context.tenantId, id, "received"]);
      return this.getReturn(id);
    } catch (error) {
      runtime.handleDbFailure(error);
      return receiveReturnMock(id);
    }
  }

  async completeReturn(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return completeReturnMock(id);
    try {
      await runtime.executor.query(`update returns set status = $3 where tenant_id = $1 and id = $2`, [this.context.tenantId, id, "completed"]);
      return this.getReturn(id);
    } catch (error) {
      runtime.handleDbFailure(error);
      return completeReturnMock(id);
    }
  }

  async cancelReturn(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return cancelReturnMock(id);
    try {
      await runtime.executor.query(`update returns set status = $3 where tenant_id = $1 and id = $2`, [this.context.tenantId, id, "cancelled"]);
      return this.getReturn(id);
    } catch (error) {
      runtime.handleDbFailure(error);
      return cancelReturnMock(id);
    }
  }

  async listDocuments() {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return listDocumentsMock();
    try {
      const rows = await runtime.executor.query<Row>(`select * from documents where tenant_id = $1 order by created_at desc`, [this.context.tenantId]);
      const items = await Promise.all(rows.map(async (row) => (await this.loadDocumentAggregate(runtime.executor, asString(row.id))) ?? mapDocumentRow(row)));
      return items;
    } catch (error) {
      runtime.handleDbFailure(error);
      return listDocumentsMock();
    }
  }

  async getDocument(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getDocumentMock(id);
    try {
      return await this.loadDocumentAggregate(runtime.executor, id);
    } catch (error) {
      runtime.handleDbFailure(error);
      return getDocumentMock(id);
    }
  }

  async renderDocument(payload: { type: DocumentType; entityType: Document["entityType"]; entityId: string; entityNo: string; customerId?: string }) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return renderDocumentMock(payload);
    try {
      if (!payload.entityId || !payload.entityNo) {
        throw new ApiDomainError("validation_error", "Belge olusturma icin entity baglantisi zorunludur.");
      }
      const record = buildDocumentRecord({
        tenantId: this.context.tenantId,
        type: payload.type,
        entityType: payload.entityType,
        entityId: payload.entityId,
        entityNo: payload.entityNo,
        customerId: payload.customerId,
        createdBy: this.context.userId
      });
      await runtime.executor.query(
        `insert into documents (id, tenant_id, document_no, document_type, entity_type, entity_id, entity_no, customer_id, title, preview_text, status, created_by, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          record.id,
          this.context.tenantId,
          record.documentNo,
          record.type,
          record.entityType,
          record.entityId,
          record.entityNo,
          record.customerId ?? null,
          record.title,
          record.previewText,
          "queued",
          this.context.userId,
          record.createdAt
        ]
      );
      return record;
    } catch (error) {
      runtime.handleDbFailure(error);
      return renderDocumentMock(payload);
    }
  }

  async regenerateDocument(id: string) {
    const source = await this.getDocument(id);
    if (!source) return null;
    return this.renderDocument({
      type: source.type,
      entityType: source.entityType,
      entityId: source.entityId,
      entityNo: source.entityNo,
      customerId: source.customerId
    });
  }

  private async createDocumentDelivery(documentId: string, channel: DocumentDelivery["channel"], recipient?: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return null;
    const document = await this.getDocument(documentId);
    if (!document) return null;
    const request = buildDocumentDeliveryRequest(document, channel, recipient);
    try {
      await runtime.executor.query(
        `insert into document_deliveries
         (id, tenant_id, document_id, channel, status, recipient, requested_at, sent_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [request.id, this.context.tenantId, request.documentId, request.channel, "sent", request.recipient ?? null, request.requestedAt, nowIso()]
      );
      return { ...request, status: "sent", sentAt: nowIso() };
    } catch (error) {
      runtime.handleDbFailure(error);
      return null;
    }
  }

  async sendDocumentWhatsApp(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return sendDocumentWhatsAppMock(id);
    const document = await this.getDocument(id);
    if (!document) return null;
    await this.createDocumentDelivery(id, "whatsapp", "whatsapp-placeholder");
    return this.getDocument(id);
  }

  async sendDocumentEmail(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return sendDocumentEmailMock(id);
    const document = await this.getDocument(id);
    if (!document) return null;
    await this.createDocumentDelivery(id, "email", "email-placeholder");
    return this.getDocument(id);
  }

  createFactoryOrders(id: string) { return createFactoryOrders(id); }
  cancelOrder(id: string) { return cancelOrder(id); }

  async listPayments() {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return listPayments();
    try {
      const rows = await runtime.executor.query<Row>(`select * from payment_receipts where tenant_id = $1 order by created_at desc`, [this.context.tenantId]);
      const paymentIds = rows.map((row) => asString(row.id));
      const allocationMap = await this.fetchPaymentAllocationsMap(runtime, paymentIds);
      return rows.map((row) => mapPaymentRow(row, allocationMap.get(asString(row.id)) ?? []));
    } catch (error) {
      runtime.handleDbFailure(error);
      return listPayments();
    }
  }

  async getPayment(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getPayment(id);
    try {
      const row = (await runtime.executor.query<Row>(`select * from payment_receipts where tenant_id = $1 and (id = $2 or receipt_no = $2) limit 1`, [this.context.tenantId, id]))[0];
      if (!row) return undefined;
      const paymentId = asString(row.id);
      const allocations = await this.loadPaymentAllocationsForPayment(runtime, paymentId);
      return mapPaymentRow(row, allocations);
    } catch (error) {
      runtime.handleDbFailure(error);
      return getPayment(id);
    }
  }

  async createPayment(payload: Partial<PaymentReceipt>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return createPayment(payload);
    try {
      const id = payload.id ?? `payment_${Date.now()}`;
      const now = nowIso();
      await runtime.executor.query(
        `insert into payment_receipts
        (id, tenant_id, receipt_no, customer_id, amount, status, method, currency, description, reference_no, document_count, received_at, created_by, created_at, confirmed_at)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          id,
          this.context.tenantId,
          payload.receiptNo ?? `PAY-${Date.now().toString().slice(-5)}`,
          payload.customerId ?? "customer_1",
          payload.amount ?? 0,
          payload.status ?? "draft",
          payload.method ?? "transfer",
          payload.currency ?? "TRY",
          payload.description ?? null,
          payload.referenceNo ?? null,
          payload.documentCount ?? 0,
          payload.receivedAt ?? now,
          this.context.userId,
          now,
          payload.confirmedAt ?? null
        ]
      );
      const created = await this.getPayment(id);
      return created ?? createPayment(payload);
    } catch (error) {
      runtime.handleDbFailure(error);
      return createPayment(payload);
    }
  }

  async confirmPayment(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return confirmPayment(id);
    try {
      const payment = await this.getPayment(id);
      if (!payment) return null;
      const orders = await this.listOrders();
      const foundation = this.buildFoundationPaymentAllocations(payment, orders);
      const nextStatus: PaymentReceipt["status"] =
        payment.allocations.length > 0 || foundation.length > 0 ? "allocated" : "confirmed";
      await runtime.executor.transaction(async (tx) => {
        await tx.query(
          `update payment_receipts set status = $3, confirmed_at = $4 where tenant_id = $1 and id = $2`,
          [this.context.tenantId, payment.id, nextStatus, nowIso()]
        );
        if (payment.allocations.length === 0 && foundation.length > 0) {
          for (const allocation of foundation) {
            await tx.query(
              `insert into payment_allocations
            (id, tenant_id, payment_id, customer_id, target_type, target_id, target_no, target_total, open_balance, allocated_amount, currency, created_at)
            values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
              [
                allocation.id,
                this.context.tenantId,
                allocation.paymentId,
                allocation.customerId,
                allocation.targetType,
                allocation.targetId ?? null,
                allocation.targetNo,
                allocation.targetTotal,
                allocation.openBalance,
                allocation.allocatedAmount,
                allocation.currency,
                allocation.createdAt
              ]
            );
          }
        }
      });
      return this.getPayment(payment.id);
    } catch (error) {
      runtime.handleDbFailure(error);
      return confirmPayment(id);
    }
  }

  async reversePayment(id: string, reason?: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return reversePayment(id, reason);
    try {
      const payment = await this.getPayment(id);
      if (!payment) return null;
      await runtime.executor.query(`update payment_receipts set status = $3 where tenant_id = $1 and id = $2`, [this.context.tenantId, payment.id, "reversed"]);
      return {
        id: `reversal_${Date.now()}`,
        tenantId: this.context.tenantId,
        paymentId: payment.id,
        reason: reason ?? "Operator ters kayit talebi.",
        reversedBy: this.context.userId,
        reversedAt: nowIso()
      };
    } catch (error) {
      runtime.handleDbFailure(error);
      return reversePayment(id, reason);
    }
  }

  async getPaymentAllocations(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getPaymentAllocations(id);
    const payment = await this.getPayment(id);
    if (!payment) return [];
    if (payment.allocations.length > 0) return payment.allocations;
    const orders = await this.listOrders();
    return this.buildFoundationPaymentAllocations(payment, orders);
  }

  async listWarehouseOrders() {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return listWarehouseOrders();
    try {
      const rows = await runtime.executor.query<Row>(`select * from warehouse_orders where tenant_id = $1 order by created_at desc`, [this.context.tenantId]);
      const warehouseOrderIds = rows.map((row) => asString(row.id));
      const [lineMap, taskMap] = await Promise.all([
        this.fetchWarehouseLinesMap(runtime.executor, warehouseOrderIds),
        this.fetchWarehouseTasksMap(runtime.executor, warehouseOrderIds)
      ]);
      return rows.map((row) => {
        const wid = asString(row.id);
        return mapWarehouseOrderRow(row, lineMap.get(wid) ?? [], taskMap.get(wid) ?? []);
      });
    } catch (error) {
      runtime.handleDbFailure(error);
      return listWarehouseOrders();
    }
  }

  async getWarehouseOrder(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getWarehouseOrder(id);
    try {
      return (await this.loadWarehouseOrderAggregate(runtime.executor, id)) ?? undefined;
    } catch (error) {
      runtime.handleDbFailure(error);
      return getWarehouseOrder(id);
    }
  }

  async createWarehouseOrder(payload: Partial<WarehouseOrder>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return createWarehouseOrder(payload);
    try {
      const id = payload.id ?? `warehouse_order_${Date.now()}`;
      const now = nowIso();
      const warehouseOrderNo = payload.warehouseOrderNo ?? `WO-${Date.now().toString().slice(-5)}`;
      const lines = payload.lines ?? [];
      const wo: WarehouseOrder = {
        id,
        tenantId: this.context.tenantId,
        warehouseOrderNo,
        orderId: payload.orderId ?? "order_1",
        orderNo: payload.orderNo ?? "",
        customerId: payload.customerId ?? "",
        warehouseId: payload.warehouseId ?? "wh_1",
        warehouseName: payload.warehouseName ?? "Merkez Depo",
        status: payload.status ?? "waiting",
        assignedTo: payload.assignedTo,
        dueAt: payload.dueAt ?? now,
        startedAt: payload.startedAt,
        preparedAt: payload.preparedAt,
        note: payload.note,
        createdAt: now,
        updatedAt: now,
        lines,
        tasks: buildWarehouseTaskList({
          id,
          tenantId: this.context.tenantId,
          warehouseOrderNo,
          lines,
          dueAt: payload.dueAt ?? now
        })
      };
      await runtime.executor.transaction(async (tx) => {
        await this.insertWarehouseOrderHeaderTx(tx, wo);
        await this.insertWarehouseOrderChildrenTx(tx, wo);
      });
      return (await this.loadWarehouseOrderAggregate(runtime.executor, id)) ?? createWarehouseOrder(payload);
    } catch (error) {
      runtime.handleDbFailure(error);
      return createWarehouseOrder(payload);
    }
  }

  async assignWarehouseOrder(id: string, assignedTo: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return assignWarehouseOrder(id, assignedTo);
    try {
      await runtime.executor.query(`update warehouse_orders set assigned_to = $3, updated_at = $4 where tenant_id = $1 and id = $2`, [this.context.tenantId, id, assignedTo, nowIso()]);
      return this.getWarehouseOrder(id) ?? null;
    } catch (error) {
      runtime.handleDbFailure(error);
      return assignWarehouseOrder(id, assignedTo);
    }
  }

  async startWarehouseOrder(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return startWarehouseOrder(id);
    try {
      await runtime.executor.query(`update warehouse_orders set status = $3, started_at = $4, updated_at = $4 where tenant_id = $1 and id = $2`, [this.context.tenantId, id, "picking", nowIso()]);
      return this.getWarehouseOrder(id) ?? null;
    } catch (error) {
      runtime.handleDbFailure(error);
      return startWarehouseOrder(id);
    }
  }

  async markWarehouseOrderPrepared(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return markWarehouseOrderPrepared(id);
    try {
      await runtime.executor.query(`update warehouse_orders set status = $3, prepared_at = $4, updated_at = $4 where tenant_id = $1 and id = $2`, [this.context.tenantId, id, "prepared", nowIso()]);
      return this.getWarehouseOrder(id) ?? null;
    } catch (error) {
      runtime.handleDbFailure(error);
      return markWarehouseOrderPrepared(id);
    }
  }

  async cancelWarehouseOrder(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return cancelWarehouseOrder(id);
    try {
      await runtime.executor.query(`update warehouse_orders set status = $3, updated_at = $4 where tenant_id = $1 and id = $2`, [this.context.tenantId, id, "cancelled", nowIso()]);
      return this.getWarehouseOrder(id) ?? null;
    } catch (error) {
      runtime.handleDbFailure(error);
      return cancelWarehouseOrder(id);
    }
  }
}
