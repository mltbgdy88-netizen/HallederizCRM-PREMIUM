import type {
  CustomerId,
  OfferId,
  PaymentReceiptId,
  DeliveryId,
  DocumentId,
  InvoiceId,
  ProductId,
  ReturnId,
  SaleOrderId,
  TenantId,
  UserId,
  WarehouseId,
  WarehouseOrderId
} from "./identifiers";
import type { CurrencyCode, PriceSlotNumber } from "./product-stock-pricing";

export type SaleOrderStatus =
  | "draft"
  | "confirmed"
  | "waiting_stock"
  | "in_preparation"
  | "ready"
  | "partially_delivered"
  | "delivered"
  | "completed"
  | "cancelled";

export type OrderChannel = "field" | "phone" | "whatsapp" | "web" | "offer_conversion";
export type OrderPaymentStatus = "unpaid" | "partial" | "paid" | "overpaid";
export type OrderDeliveryStatus = "none" | "preparing" | "ready" | "partial" | "delivered";
export type OrderSourcePreference = "warehouse" | "factory" | "split" | "auto";
export type OrderSourcePlanStatus = "not_planned" | "planned" | "needs_factory_order" | "reserved";

export interface SaleOrderLine {
  id: string;
  orderId: SaleOrderId;
  productId: ProductId;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: CurrencyCode;
  exchangeRate: number;
  tlUnitPrice: number;
  lineTotal: number;
  tlLineTotal: number;
  priceSlotNo: PriceSlotNumber;
  priceSlotLabelSnapshot: string;
  sourcePreference: OrderSourcePreference;
  centerStockSnapshot: number;
  factoryStockSnapshot: number;
  preparedQuantity: number;
  deliveredQuantity: number;
}

export interface OrderSourcePlan {
  id: string;
  tenantId: TenantId;
  orderId: SaleOrderId;
  lineId: string;
  productId: ProductId;
  sourcePreference: OrderSourcePreference;
  warehouseQuantity: number;
  factoryQuantity: number;
  status: OrderSourcePlanStatus;
  note?: string;
  createdAt: string;
}

export interface SaleOrder {
  id: SaleOrderId;
  tenantId: TenantId;
  orderNo: string;
  customerId: CustomerId;
  offerId?: OfferId;
  status: SaleOrderStatus;
  paymentStatus: OrderPaymentStatus;
  deliveryStatus: OrderDeliveryStatus;
  channel: OrderChannel;
  deliveryType: "warehouse" | "factory" | "hybrid";
  note?: string;
  priceSlotNoSnapshot: PriceSlotNumber;
  priceSlotLabelSnapshot: string;
  currency: CurrencyCode;
  subtotal: number;
  taxRate: number;
  taxTotal: number;
  grandTotal: number;
  paidTotal: number;
  source: "manual" | "teklif_donusumu" | "whatsapp" | "erp";
  createdBy: UserId;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  lines: SaleOrderLine[];
  sourcePlans: OrderSourcePlan[];
}

export type PaymentMethod = "cash" | "card" | "transfer" | "check" | "mixed";
export type PaymentStatus = "draft" | "confirmed" | "reversed" | "partially_allocated" | "allocated";
export type PaymentAllocationTargetType = "order" | "invoice" | "open_account";

export interface PaymentAllocation {
  id: string;
  tenantId: TenantId;
  paymentId: PaymentReceiptId;
  customerId: CustomerId;
  targetType: PaymentAllocationTargetType;
  targetId?: string;
  targetNo: string;
  targetTotal: number;
  openBalance: number;
  allocatedAmount: number;
  currency: CurrencyCode;
  createdAt: string;
}

export interface PaymentReceipt {
  id: PaymentReceiptId;
  tenantId: TenantId;
  receiptNo: string;
  customerId: CustomerId;
  amount: number;
  currency: CurrencyCode;
  method: PaymentMethod;
  status: PaymentStatus;
  description?: string;
  referenceNo?: string;
  documentCount: number;
  receivedAt: string;
  createdBy: UserId;
  createdAt: string;
  confirmedAt?: string;
  allocations: PaymentAllocation[];
}

export interface PaymentReversal {
  id: string;
  tenantId: TenantId;
  paymentId: PaymentReceiptId;
  reason: string;
  reversedBy: UserId;
  reversedAt: string;
}

export type WarehouseOrderStatus = "waiting" | "picking" | "prepared" | "delivered" | "cancelled";
export type WarehouseTaskStatus = "open" | "in_progress" | "done" | "cancelled" | "overdue";

export interface WarehouseOrderLine {
  id: string;
  warehouseOrderId: WarehouseOrderId;
  orderLineId: string;
  productId: ProductId;
  productCode: string;
  productName: string;
  requestedQuantity: number;
  preparedQuantity: number;
  warehouseId: WarehouseId;
  warehouseName: string;
  rackNo?: string;
  locationCode?: string;
}

export interface WarehouseTask {
  id: string;
  tenantId: TenantId;
  warehouseOrderId: WarehouseOrderId;
  taskNo: string;
  title: string;
  status: WarehouseTaskStatus;
  assigneeName?: string;
  dueAt: string;
  critical: boolean;
}

export interface WarehouseOrder {
  id: WarehouseOrderId;
  tenantId: TenantId;
  warehouseOrderNo: string;
  orderId: SaleOrderId;
  orderNo: string;
  customerId: CustomerId;
  warehouseId: WarehouseId;
  warehouseName: string;
  status: WarehouseOrderStatus;
  assignedTo?: string;
  dueAt: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  preparedAt?: string;
  lines: WarehouseOrderLine[];
  tasks: WarehouseTask[];
}

export interface OrderOperationalImpact {
  warehouseLineCount: number;
  factoryLineCount: number;
  splitLineCount: number;
  needsWarehouseOrder: boolean;
  needsFactoryOrder: boolean;
  paymentMissing: boolean;
  approvalMayBeRequired: boolean;
  messages: string[];
}

export interface PaymentAllocationSummary {
  paymentAmount: number;
  allocatedTotal: number;
  remainingAmount: number;
  allocationCount: number;
  status: PaymentStatus;
}

export type DeliveryStatus = "pending" | "ready" | "partially_delivered" | "delivered" | "failed" | "rolled_back";
export type DeliveryDocumentStatus = "missing" | "ready" | "sent";

export interface DeliveryLine {
  id: string;
  deliveryId: DeliveryId;
  orderLineId: string;
  productId: ProductId;
  productCode: string;
  productName: string;
  orderedQuantity: number;
  preparedQuantity: number;
  deliveredQuantity: number;
}

export interface DeliveryConfirmation {
  confirmedBy: UserId;
  confirmedAt: string;
  note?: string;
  customerNotified: boolean;
}

export interface DeliveryValidationResult {
  customerVerified: boolean;
  orderMatched: boolean;
  warehouseReady: boolean;
  paymentMissing: boolean;
  approvalRequired: boolean;
  riskNote: string;
  valid: boolean;
  blockers: string[];
}

export interface Delivery {
  id: DeliveryId;
  tenantId: TenantId;
  deliveryNo: string;
  orderId: SaleOrderId;
  orderNo: string;
  customerId: CustomerId;
  warehouseOrderId?: WarehouseOrderId;
  status: DeliveryStatus;
  plannedAt: string;
  deliveredAt?: string;
  documentStatus: DeliveryDocumentStatus;
  note?: string;
  validation: DeliveryValidationResult;
  confirmation?: DeliveryConfirmation;
  createdAt: string;
  updatedAt: string;
  lines: DeliveryLine[];
}

export type InvoiceStatus = "draft" | "issued" | "cancelled";
export type InvoiceDeliveryStatus = "not_sent" | "queued" | "sent" | "delivered" | "failed";
export type InvoicePaymentStatus = "unpaid" | "partial" | "paid";

export interface InvoiceLine {
  id: string;
  invoiceId: InvoiceId;
  orderLineId?: string;
  productId: ProductId;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: CurrencyCode;
  taxRate: number;
  taxTotal: number;
  lineTotal: number;
}

export interface Invoice {
  id: InvoiceId;
  tenantId: TenantId;
  invoiceNo: string;
  customerId: CustomerId;
  orderId?: SaleOrderId;
  orderNo?: string;
  status: InvoiceStatus;
  deliveryStatus: InvoiceDeliveryStatus;
  paymentStatus: InvoicePaymentStatus;
  issueDate?: string;
  currency: CurrencyCode;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  documentId?: DocumentId;
  createdAt: string;
  updatedAt: string;
  lines: InvoiceLine[];
}

export type ReturnStatus = "draft" | "approved" | "received" | "completed" | "cancelled";
export type ReturnReasonCategory = "damaged" | "wrong_product" | "quality" | "customer_request" | "other";

export interface ReturnLine {
  id: string;
  returnId: ReturnId;
  orderLineId?: string;
  deliveryLineId?: string;
  productId: ProductId;
  productCode: string;
  productName: string;
  quantity: number;
  reasonCategory: ReturnReasonCategory;
  note?: string;
}

export interface Return {
  id: ReturnId;
  tenantId: TenantId;
  returnNo: string;
  customerId: CustomerId;
  orderId?: SaleOrderId;
  orderNo?: string;
  deliveryId?: DeliveryId;
  deliveryNo?: string;
  status: ReturnStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
  lines: ReturnLine[];
}

export interface ReturnImpact {
  stockImpact: number;
  balanceImpact: number;
  documentImpact: string;
  approvalRequired: boolean;
  messages: string[];
}

export type DocumentType =
  | "offer_pdf"
  | "order_pdf"
  | "payment_receipt_pdf"
  | "warehouse_note_pdf"
  | "delivery_note_pdf"
  | "dispatch_note_pdf"
  | "invoice_pdf"
  | "statement_pdf"
  | "return_note_pdf";

export type DocumentDeliveryStatus = "queued" | "sent" | "delivered" | "failed";
export type DocumentEntityType = "offer" | "order" | "payment" | "warehouse_order" | "delivery" | "dispatch" | "invoice" | "statement" | "return";

export interface Document {
  id: DocumentId;
  tenantId: TenantId;
  documentNo: string;
  type: DocumentType;
  entityType: DocumentEntityType;
  entityId: string;
  entityNo: string;
  customerId?: CustomerId;
  title: string;
  previewText: string;
  createdAt: string;
  createdBy: UserId;
  deliveries: DocumentDelivery[];
}

export interface DocumentDelivery {
  id: string;
  tenantId: TenantId;
  documentId: DocumentId;
  channel: "whatsapp" | "email" | "download" | "print";
  status: DocumentDeliveryStatus;
  recipient?: string;
  requestedAt: string;
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
}

export interface DocumentAvailabilitySummary {
  entityType: DocumentEntityType;
  entityId: string;
  availableTypes: DocumentType[];
  missingTypes: DocumentType[];
  latestDocument?: Document;
}
