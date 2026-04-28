import {
  buildOrderSourcePlan,
  buildDeliveryFromOrder,
  buildDocumentDeliveryRequest,
  buildDocumentRecord,
  buildInvoiceFromOrder,
  buildReturnFromDelivery,
  buildWarehouseOrderFromSale,
  calculateOrderTotals,
  deriveOrderPaymentStatus
} from "@hallederiz/domain";
import type {
  Delivery,
  Document,
  DocumentDelivery,
  DocumentType,
  Invoice,
  PaymentAllocation,
  PaymentReceipt,
  PaymentReversal,
  Return,
  SaleOrder,
  SaleOrderLine,
  WarehouseOrder
} from "@hallederiz/types";

const tenantId = "tenant_1";
const createdBy = "user_1";

let orders: SaleOrder[] = [
  {
    id: "order_1",
    tenantId,
    orderNo: "SO-2481",
    customerId: "customer_1",
    offerId: "offer_2",
    status: "in_preparation",
    paymentStatus: "partial",
    deliveryStatus: "preparing",
    channel: "offer_conversion",
    deliveryType: "hybrid",
    note: "API mock siparis kaydi.",
    priceSlotNoSnapshot: 4,
    priceSlotLabelSnapshot: "Bayi",
    currency: "TRY",
    subtotal: 28500,
    taxRate: 20,
    taxTotal: 5700,
    grandTotal: 34200,
    paidTotal: 25000,
    source: "teklif_donusumu",
    createdBy,
    createdAt: "2026-04-28T08:30:00.000Z",
    updatedAt: "2026-04-28T10:00:00.000Z",
    confirmedAt: "2026-04-28T09:00:00.000Z",
    lines: [
      {
        id: "order_line_1",
        orderId: "order_1",
        productId: "prod_1",
        productCode: "DK-1001",
        productName: "Linen Soft Ivory",
        quantity: 20,
        unitPrice: 840,
        currency: "TRY",
        exchangeRate: 1,
        tlUnitPrice: 840,
        lineTotal: 16800,
        tlLineTotal: 16800,
        priceSlotNo: 4,
        priceSlotLabelSnapshot: "Bayi",
        sourcePreference: "warehouse",
        centerStockSnapshot: 38,
        factoryStockSnapshot: 420,
        preparedQuantity: 8,
        deliveredQuantity: 0
      }
    ],
    sourcePlans: []
  }
];

orders = orders.map((order) => ({
  ...order,
  sourcePlans: buildOrderSourcePlan(order)
}));

let payments: PaymentReceipt[] = [
  {
    id: "payment_1",
    tenantId,
    receiptNo: "PAY-930",
    customerId: "customer_1",
    amount: 25000,
    currency: "TRY",
    method: "transfer",
    status: "allocated",
    description: "SO-2481 kismi tahsilat.",
    referenceNo: "TRF-001",
    documentCount: 1,
    receivedAt: "2026-04-28T10:10:00.000Z",
    createdBy,
    createdAt: "2026-04-28T10:00:00.000Z",
    confirmedAt: "2026-04-28T10:15:00.000Z",
    allocations: [
      {
        id: "allocation_1",
        tenantId,
        paymentId: "payment_1",
        customerId: "customer_1",
        targetType: "order",
        targetId: "order_1",
        targetNo: "SO-2481",
        targetTotal: 34200,
        openBalance: 9200,
        allocatedAmount: 25000,
        currency: "TRY",
        createdAt: "2026-04-28T10:15:00.000Z"
      }
    ]
  }
];

let reversals: PaymentReversal[] = [];
let warehouseOrders: WarehouseOrder[] = [buildWarehouseOrderFromSale(orders[0] as SaleOrder)];
let deliveries: Delivery[] = [
  buildDeliveryFromOrder({
    order: orders[0] as SaleOrder,
    warehouseOrders,
    policy: { blockDeliveryWhenPaymentMissing: false, requireApprovalWhenPartial: true }
  })
];
let invoices: Invoice[] = [buildInvoiceFromOrder(orders[0] as SaleOrder)];
let returns: Return[] = deliveries[0] ? [buildReturnFromDelivery(deliveries[0])] : [];
let documents: Document[] = [
  buildDocumentRecord({
    tenantId,
    type: "delivery_note_pdf",
    entityType: "delivery",
    entityId: deliveries[0]?.id ?? "delivery_1",
    entityNo: deliveries[0]?.deliveryNo ?? "DLV-401",
    customerId: deliveries[0]?.customerId,
    createdBy,
    title: "Teslim Fisi"
  })
];

function recalculateOrder(order: SaleOrder): SaleOrder {
  const totals = calculateOrderTotals({ lines: order.lines, currency: order.currency, taxRate: order.taxRate });
  const nextOrder = {
    ...order,
    ...totals,
    updatedAt: new Date().toISOString()
  };

  return {
    ...nextOrder,
    paymentStatus: deriveOrderPaymentStatus(nextOrder, payments.flatMap((payment) => payment.allocations)),
    sourcePlans: buildOrderSourcePlan(nextOrder)
  };
}

export function listOrders(): SaleOrder[] {
  return orders;
}

export function getOrder(orderId: string): SaleOrder | undefined {
  return orders.find((order) => order.id === orderId || order.orderNo === orderId);
}

export function createOrder(input: Partial<SaleOrder>): SaleOrder {
  const id = `order_${orders.length + 1}`;
  const order = recalculateOrder({
    id,
    tenantId,
    orderNo: input.orderNo ?? `SO-${2481 + orders.length}`,
    customerId: input.customerId ?? "customer_1",
    offerId: input.offerId,
    status: input.status ?? "draft",
    paymentStatus: "unpaid",
    deliveryStatus: "none",
    channel: input.channel ?? "field",
    deliveryType: input.deliveryType ?? "warehouse",
    note: input.note,
    priceSlotNoSnapshot: input.priceSlotNoSnapshot ?? 1,
    priceSlotLabelSnapshot: input.priceSlotLabelSnapshot ?? "Perakende",
    currency: input.currency ?? "TRY",
    subtotal: 0,
    taxRate: input.taxRate ?? 20,
    taxTotal: 0,
    grandTotal: 0,
    paidTotal: input.paidTotal ?? 0,
    source: input.source ?? "manual",
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lines: input.lines ?? [],
    sourcePlans: []
  });
  orders = [...orders, order];
  return order;
}

export function patchOrder(orderId: string, input: Partial<SaleOrder>): SaleOrder | null {
  const order = getOrder(orderId);
  if (!order) {
    return null;
  }

  const updated = recalculateOrder({ ...order, ...input, id: order.id, tenantId: order.tenantId });
  orders = orders.map((item) => (item.id === order.id ? updated : item));
  return updated;
}

export function addOrderLine(orderId: string, input: Partial<SaleOrderLine>): SaleOrder | null {
  const order = getOrder(orderId);
  if (!order) {
    return null;
  }

  const line: SaleOrderLine = {
    id: `order_line_${order.lines.length + 1}`,
    orderId: order.id,
    productId: input.productId ?? "prod_1",
    productCode: input.productCode ?? "DK-0000",
    productName: input.productName ?? "Yeni Urun",
    quantity: input.quantity ?? 1,
    unitPrice: input.unitPrice ?? 0,
    currency: input.currency ?? order.currency,
    exchangeRate: input.exchangeRate ?? 1,
    tlUnitPrice: input.tlUnitPrice ?? input.unitPrice ?? 0,
    lineTotal: input.lineTotal ?? 0,
    tlLineTotal: input.tlLineTotal ?? input.lineTotal ?? 0,
    priceSlotNo: input.priceSlotNo ?? order.priceSlotNoSnapshot,
    priceSlotLabelSnapshot: input.priceSlotLabelSnapshot ?? order.priceSlotLabelSnapshot,
    sourcePreference: input.sourcePreference ?? "auto",
    centerStockSnapshot: input.centerStockSnapshot ?? 0,
    factoryStockSnapshot: input.factoryStockSnapshot ?? 0,
    preparedQuantity: input.preparedQuantity ?? 0,
    deliveredQuantity: input.deliveredQuantity ?? 0
  };

  return patchOrder(order.id, { lines: [...order.lines, line] });
}

export function patchOrderLine(orderId: string, lineId: string, input: Partial<SaleOrderLine>): SaleOrder | null {
  const order = getOrder(orderId);
  if (!order) {
    return null;
  }

  return patchOrder(order.id, {
    lines: order.lines.map((line) => (line.id === lineId ? { ...line, ...input, id: line.id, orderId: order.id } : line))
  });
}

export function confirmOrder(orderId: string): SaleOrder | null {
  return patchOrder(orderId, {
    status: "confirmed",
    confirmedAt: new Date().toISOString()
  });
}

export function planSourcing(orderId: string): SaleOrder | null {
  const order = getOrder(orderId);
  if (!order) {
    return null;
  }

  return patchOrder(order.id, { sourcePlans: buildOrderSourcePlan(order) });
}

export function createWarehouseOrderFromOrder(orderId: string): WarehouseOrder | null {
  const order = getOrder(orderId);
  if (!order) {
    return null;
  }

  const warehouseOrder = buildWarehouseOrderFromSale(order);
  warehouseOrders = [...warehouseOrders.filter((item) => item.orderId !== order.id), warehouseOrder];
  patchOrder(order.id, { status: "in_preparation", deliveryStatus: "preparing" });
  return warehouseOrder;
}

export function createFactoryOrders(orderId: string) {
  const order = getOrder(orderId);
  if (!order) {
    return null;
  }

  return {
    orderId: order.id,
    sourcePlans: order.sourcePlans.filter((plan) => plan.factoryQuantity > 0),
    message: "Fabrika siparisleri icin foundation contract olustu."
  };
}

export function cancelOrder(orderId: string): SaleOrder | null {
  return patchOrder(orderId, { status: "cancelled" });
}

export function listPayments(): PaymentReceipt[] {
  return payments;
}

export function getPayment(paymentId: string): PaymentReceipt | undefined {
  return payments.find((payment) => payment.id === paymentId || payment.receiptNo === paymentId);
}

export function createPayment(input: Partial<PaymentReceipt>): PaymentReceipt {
  const id = `payment_${payments.length + 1}`;
  const payment: PaymentReceipt = {
    id,
    tenantId,
    receiptNo: input.receiptNo ?? `PAY-${930 + payments.length}`,
    customerId: input.customerId ?? "customer_1",
    amount: input.amount ?? 0,
    currency: input.currency ?? "TRY",
    method: input.method ?? "transfer",
    status: input.status ?? "draft",
    description: input.description,
    referenceNo: input.referenceNo,
    documentCount: input.documentCount ?? 0,
    receivedAt: input.receivedAt ?? new Date().toISOString(),
    createdBy,
    createdAt: new Date().toISOString(),
    allocations: input.allocations ?? []
  };
  payments = [...payments, payment];
  return payment;
}

export function confirmPayment(paymentId: string): PaymentReceipt | null {
  const payment = getPayment(paymentId);
  if (!payment) {
    return null;
  }

  const updated: PaymentReceipt = { ...payment, status: payment.allocations.length > 0 ? "allocated" : "confirmed", confirmedAt: new Date().toISOString() };
  payments = payments.map((item) => (item.id === payment.id ? updated : item));
  return updated;
}

export function reversePayment(paymentId: string, reason = "Operator ters kayit talebi."): PaymentReversal | null {
  const payment = getPayment(paymentId);
  if (!payment) {
    return null;
  }

  const reversal: PaymentReversal = {
    id: `reversal_${reversals.length + 1}`,
    tenantId,
    paymentId: payment.id,
    reason,
    reversedBy: createdBy,
    reversedAt: new Date().toISOString()
  };
  reversals = [...reversals, reversal];
  payments = payments.map((item) => (item.id === payment.id ? { ...item, status: "reversed" } : item));
  return reversal;
}

export function getPaymentAllocations(paymentId: string): PaymentAllocation[] {
  return getPayment(paymentId)?.allocations ?? [];
}

export function listWarehouseOrders(): WarehouseOrder[] {
  return warehouseOrders;
}

export function getWarehouseOrder(warehouseOrderId: string): WarehouseOrder | undefined {
  return warehouseOrders.find((warehouseOrder) => warehouseOrder.id === warehouseOrderId || warehouseOrder.warehouseOrderNo === warehouseOrderId);
}

export function createWarehouseOrder(input: Partial<WarehouseOrder>): WarehouseOrder {
  const id = `warehouse_order_${warehouseOrders.length + 1}`;
  const warehouseOrder: WarehouseOrder = {
    id,
    tenantId,
    warehouseOrderNo: input.warehouseOrderNo ?? `WO-${114 + warehouseOrders.length}`,
    orderId: input.orderId ?? "order_1",
    orderNo: input.orderNo ?? "SO-2481",
    customerId: input.customerId ?? "customer_1",
    warehouseId: input.warehouseId ?? "wh_1",
    warehouseName: input.warehouseName ?? "Merkez Depo",
    status: input.status ?? "waiting",
    assignedTo: input.assignedTo,
    dueAt: input.dueAt ?? new Date().toISOString(),
    note: input.note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lines: input.lines ?? [],
    tasks: input.tasks ?? []
  };
  warehouseOrders = [...warehouseOrders, warehouseOrder];
  return warehouseOrder;
}

export function patchWarehouseOrder(warehouseOrderId: string, input: Partial<WarehouseOrder>): WarehouseOrder | null {
  const warehouseOrder = getWarehouseOrder(warehouseOrderId);
  if (!warehouseOrder) {
    return null;
  }

  const updated = { ...warehouseOrder, ...input, id: warehouseOrder.id, tenantId: warehouseOrder.tenantId, updatedAt: new Date().toISOString() };
  warehouseOrders = warehouseOrders.map((item) => (item.id === warehouseOrder.id ? updated : item));
  return updated;
}

export function assignWarehouseOrder(warehouseOrderId: string, assignedTo: string): WarehouseOrder | null {
  return patchWarehouseOrder(warehouseOrderId, { assignedTo });
}

export function startWarehouseOrder(warehouseOrderId: string): WarehouseOrder | null {
  return patchWarehouseOrder(warehouseOrderId, { status: "picking", startedAt: new Date().toISOString() });
}

export function markWarehouseOrderPrepared(warehouseOrderId: string): WarehouseOrder | null {
  return patchWarehouseOrder(warehouseOrderId, { status: "prepared", preparedAt: new Date().toISOString() });
}

export function cancelWarehouseOrder(warehouseOrderId: string): WarehouseOrder | null {
  return patchWarehouseOrder(warehouseOrderId, { status: "cancelled" });
}

export function listDeliveries(): Delivery[] {
  return deliveries;
}

export function getDelivery(deliveryId: string): Delivery | undefined {
  return deliveries.find((delivery) => delivery.id === deliveryId || delivery.deliveryNo === deliveryId);
}

export function createDelivery(input: Partial<Delivery>): Delivery {
  const order = input.orderId ? getOrder(input.orderId) : orders[0];
  const delivery = order
    ? {
        ...buildDeliveryFromOrder({ order, warehouseOrders, policy: { blockDeliveryWhenPaymentMissing: false, requireApprovalWhenPartial: true } }),
        ...input,
        id: input.id ?? `delivery_${deliveries.length + 1}`,
        tenantId
      }
    : ({
        id: `delivery_${deliveries.length + 1}`,
        tenantId,
        deliveryNo: `DLV-${401 + deliveries.length}`,
        orderId: input.orderId ?? "order_1",
        orderNo: input.orderNo ?? "SO-2481",
        customerId: input.customerId ?? "customer_1",
        status: "pending",
        plannedAt: new Date().toISOString(),
        documentStatus: "missing",
        validation: {
          customerVerified: false,
          orderMatched: false,
          warehouseReady: false,
          paymentMissing: false,
          approvalRequired: false,
          riskNote: "Siparis baglantisi bekleniyor.",
          valid: false,
          blockers: ["Siparis baglantisi bekleniyor."]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lines: []
      } satisfies Delivery);
  deliveries = [...deliveries, delivery];
  return delivery;
}

export function validateDelivery(deliveryId: string): Delivery | null {
  const delivery = getDelivery(deliveryId);
  if (!delivery) return null;
  const order = getOrder(delivery.orderId);
  if (!order) return delivery;
  const updated = {
    ...delivery,
    ...buildDeliveryFromOrder({ order, warehouseOrders, policy: { blockDeliveryWhenPaymentMissing: false, requireApprovalWhenPartial: true } }),
    id: delivery.id,
    deliveryNo: delivery.deliveryNo
  };
  deliveries = deliveries.map((item) => (item.id === delivery.id ? updated : item));
  return updated;
}

export function completeDelivery(deliveryId: string): Delivery | null {
  const delivery = getDelivery(deliveryId);
  if (!delivery) return null;
  const updated: Delivery = {
    ...delivery,
    status: "delivered",
    deliveredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lines: delivery.lines.map((line) => ({ ...line, deliveredQuantity: line.preparedQuantity || line.orderedQuantity })),
    confirmation: { confirmedBy: createdBy, confirmedAt: new Date().toISOString(), customerNotified: false }
  };
  deliveries = deliveries.map((item) => (item.id === delivery.id ? updated : item));
  patchOrder(delivery.orderId, { status: "delivered", deliveryStatus: "delivered" });
  return updated;
}

export function rollbackDelivery(deliveryId: string): Delivery | null {
  const delivery = getDelivery(deliveryId);
  if (!delivery) return null;
  const updated = { ...delivery, status: "rolled_back" as const, updatedAt: new Date().toISOString() };
  deliveries = deliveries.map((item) => (item.id === delivery.id ? updated : item));
  return updated;
}

export function notifyDeliveryCustomer(deliveryId: string): Delivery | null {
  const delivery = getDelivery(deliveryId);
  if (!delivery) return null;
  const updated = {
    ...delivery,
    confirmation: {
      confirmedBy: delivery.confirmation?.confirmedBy ?? createdBy,
      confirmedAt: delivery.confirmation?.confirmedAt ?? new Date().toISOString(),
      customerNotified: true,
      note: "Musteriye WhatsApp bildirimi gonderildi."
    }
  };
  deliveries = deliveries.map((item) => (item.id === delivery.id ? updated : item));
  return updated;
}

export function listInvoices(): Invoice[] {
  return invoices;
}

export function getInvoice(invoiceId: string): Invoice | undefined {
  return invoices.find((invoice) => invoice.id === invoiceId || invoice.invoiceNo === invoiceId);
}

export function createInvoice(input: Partial<Invoice>): Invoice {
  const order = input.orderId ? getOrder(input.orderId) : orders[0];
  const invoice = order ? { ...buildInvoiceFromOrder(order), ...input, id: input.id ?? `invoice_${invoices.length + 1}`, tenantId } : ({ ...input, id: `invoice_${invoices.length + 1}`, tenantId } as Invoice);
  invoices = [...invoices, invoice];
  return invoice;
}

export function issueInvoice(invoiceId: string): Invoice | null {
  const invoice = getInvoice(invoiceId);
  if (!invoice) return null;
  const updated = { ...invoice, status: "issued" as const, issueDate: new Date().toISOString(), updatedAt: new Date().toISOString() };
  invoices = invoices.map((item) => (item.id === invoice.id ? updated : item));
  return updated;
}

export function cancelInvoice(invoiceId: string): Invoice | null {
  const invoice = getInvoice(invoiceId);
  if (!invoice) return null;
  const updated = { ...invoice, status: "cancelled" as const, updatedAt: new Date().toISOString() };
  invoices = invoices.map((item) => (item.id === invoice.id ? updated : item));
  return updated;
}

export function sendInvoice(invoiceId: string): Invoice | null {
  const invoice = getInvoice(invoiceId);
  if (!invoice) return null;
  const updated = { ...invoice, deliveryStatus: "sent" as const, updatedAt: new Date().toISOString() };
  invoices = invoices.map((item) => (item.id === invoice.id ? updated : item));
  return updated;
}

export function listReturns(): Return[] {
  return returns;
}

export function getReturn(returnId: string): Return | undefined {
  return returns.find((returnRecord) => returnRecord.id === returnId || returnRecord.returnNo === returnId);
}

export function createReturn(input: Partial<Return>): Return {
  const delivery = input.deliveryId ? getDelivery(input.deliveryId) : deliveries[0];
  const returnRecord = delivery ? { ...buildReturnFromDelivery(delivery), ...input, id: input.id ?? `return_${returns.length + 1}`, tenantId } : ({ ...input, id: `return_${returns.length + 1}`, tenantId } as Return);
  returns = [...returns, returnRecord];
  return returnRecord;
}

function patchReturnStatus(returnId: string, status: Return["status"]): Return | null {
  const returnRecord = getReturn(returnId);
  if (!returnRecord) return null;
  const updated = { ...returnRecord, status, updatedAt: new Date().toISOString() };
  returns = returns.map((item) => (item.id === returnRecord.id ? updated : item));
  return updated;
}

export function approveReturn(returnId: string): Return | null { return patchReturnStatus(returnId, "approved"); }
export function receiveReturn(returnId: string): Return | null { return patchReturnStatus(returnId, "received"); }
export function completeReturn(returnId: string): Return | null { return patchReturnStatus(returnId, "completed"); }
export function cancelReturn(returnId: string): Return | null { return patchReturnStatus(returnId, "cancelled"); }

export function listDocuments(): Document[] {
  return documents;
}

export function getDocument(documentId: string): Document | undefined {
  return documents.find((document) => document.id === documentId || document.documentNo === documentId);
}

export function renderDocument(input: { type: DocumentType; entityType: Document["entityType"]; entityId: string; entityNo: string; customerId?: string }): Document {
  const document = buildDocumentRecord({ tenantId, createdBy, ...input });
  documents = [...documents, document];
  return document;
}

function sendDocument(documentId: string, channel: DocumentDelivery["channel"], recipient?: string): Document | null {
  const document = getDocument(documentId);
  if (!document) return null;
  const delivery = { ...buildDocumentDeliveryRequest(document, channel, recipient), status: "sent" as const, sentAt: new Date().toISOString() };
  const updated = { ...document, deliveries: [...document.deliveries, delivery] };
  documents = documents.map((item) => (item.id === document.id ? updated : item));
  return updated;
}

export function sendDocumentWhatsApp(documentId: string): Document | null { return sendDocument(documentId, "whatsapp", "whatsapp-placeholder"); }
export function sendDocumentEmail(documentId: string): Document | null { return sendDocument(documentId, "email", "email-placeholder"); }
