import type {
  CustomerId,
  AlertId,
  ApprovalId,
  OfferId,
  PaymentReceiptId,
  DeliveryId,
  DocumentId,
  FactoryId,
  InvoiceId,
  ProductId,
  ReturnId,
  SaleOrderId,
  TaskId,
  TenantId,
  UserId,
  WorkflowId,
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

export type WorkflowEntityType =
  | "offer"
  | "order"
  | "payment"
  | "warehouse_order"
  | "delivery"
  | "factory_order"
  | "invoice"
  | "return"
  | "customer"
  | "product"
  | "document"
  | "ai_proposal";

export type WorkflowStatus = "active" | "completed" | "failed" | "cancelled";
export type WorkflowStepStatus = "pending" | "active" | "completed" | "skipped" | "failed";

export interface WorkflowStep {
  id: string;
  workflowId: WorkflowId;
  key: string;
  title: string;
  description?: string;
  status: WorkflowStepStatus;
  sortOrder: number;
  entityType?: WorkflowEntityType;
  entityId?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface WorkflowInstance {
  id: WorkflowId;
  tenantId: TenantId;
  workflowNo: string;
  entityType: WorkflowEntityType;
  entityId: string;
  entityNo: string;
  status: WorkflowStatus;
  currentStepKey?: string;
  createdAt: string;
  updatedAt: string;
  steps: WorkflowStep[];
}

export type TaskStatus = "open" | "in_progress" | "done" | "cancelled" | "overdue";
export type TaskPriority = "low" | "normal" | "high" | "critical";
export type TaskType =
  | "new_order"
  | "payment_followup"
  | "warehouse_picking"
  | "factory_order_needed"
  | "factory_inbound"
  | "delivery_waiting"
  | "critical_stock"
  | "customer_risk"
  | "high_debt"
  | "customer_reactivation"
  | "approval_required"
  | "ai_risk"
  | "ai_payment_priority"
  | "ai_sales_opportunity"
  | "ai_operation_reminder"
  | "ai_stockout_prediction";

export interface Task {
  id: TaskId;
  tenantId: TenantId;
  taskNo: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  source: DashboardCardSource;
  entityType: WorkflowEntityType;
  entityId: string;
  entityNo: string;
  customerId?: CustomerId;
  customerName?: string;
  assigneeId?: UserId;
  assigneeName?: string;
  dueAt: string;
  createdAt: string;
  updatedAt: string;
  approvalId?: ApprovalId;
}

export interface TaskComment {
  id: string;
  taskId: TaskId;
  authorId: UserId;
  authorName: string;
  body: string;
  createdAt: string;
}

export type ApprovalType =
  | "order_high_value"
  | "delivery_payment_missing"
  | "return_approval"
  | "price_override"
  | "ai_action_proposal"
  | "manual_operation";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "executed";
export type ApprovalDecision = "approve" | "reject" | "expire" | "execute";

export interface ApprovalPolicySnapshot {
  policyId: string;
  requiredRole: string;
  minApproverCount: number;
  reason: string;
  serverActionKey?: string;
}

export interface Approval {
  id: ApprovalId;
  tenantId: TenantId;
  approvalNo: string;
  type: ApprovalType;
  status: ApprovalStatus;
  entityType: WorkflowEntityType;
  entityId: string;
  entityNo: string;
  requestedBy: UserId;
  requestedByName: string;
  requestedRole: string;
  decidedBy?: UserId;
  decidedByName?: string;
  decidedAt?: string;
  createdAt: string;
  expiresAt?: string;
  riskNote?: string;
  payloadSummary: string;
  payload: Record<string, unknown>;
  policySnapshot: ApprovalPolicySnapshot;
  execution: {
    executable: boolean;
    executedAt?: string;
    result?: string;
  };
}

export type AlertSeverity = "info" | "warning" | "critical";

export interface Alert {
  id: AlertId;
  tenantId: TenantId;
  title: string;
  severity: AlertSeverity;
  entityType: WorkflowEntityType;
  entityId: string;
  entityNo: string;
  message: string;
  createdAt: string;
}

export type DashboardCardSource = "system" | "ai";
export type DashboardCardType =
  | "new_orders"
  | "pending_payments"
  | "warehouse_preparation"
  | "factory_order_needed"
  | "factory_inbound"
  | "delivery_waiting"
  | "critical_stock"
  | "inactive_payers"
  | "high_risk_customers"
  | "high_debt_customers"
  | "payment_request_needed"
  | "inactive_customers"
  | "ai_risk_alerts"
  | "ai_payment_priorities"
  | "ai_sales_opportunities"
  | "ai_operation_reminders"
  | "ai_stockout_predictions";

export interface DashboardTaskLink {
  taskId: TaskId;
  entityType: WorkflowEntityType;
  entityId: string;
  href: string;
}

export interface DashboardCard {
  id: string;
  type: DashboardCardType;
  source: DashboardCardSource;
  title: string;
  value: number;
  detail: string;
  severity: AlertSeverity;
  icon: string;
  pulse?: boolean;
  taskIds: TaskId[];
  links: DashboardTaskLink[];
}

export type WhatsAppContactType = "dealer" | "customer" | "staff" | "manager";
export type WhatsAppMessageDirection = "inbound" | "outbound";
export type WhatsAppMessageType = "text" | "document" | "image" | "template";
export type WhatsAppTemplateType = "dealer_self_service" | "staff_task" | "manager_approval" | "document_delivery";
export type WhatsAppActionRequestStatus = "pending" | "confirmed" | "rejected" | "executed";
export type WhatsAppIntent = "stok" | "fiyat" | "ekstre" | "siparis" | "odeme" | "iade" | "fatura" | "hatali_urun" | "diger";
export type WhatsAppBusinessIntent = WhatsAppIntent;
export type WhatsAppRuleMode = "menu" | "ai" | "hybrid";
export type WhatsAppApprovalPolicyMode =
  | "none"
  | "confirmation_required"
  | "approval_required"
  | "internal_approval"
  | "sales_only"
  | "accounting_only"
  | "sales_and_accounting"
  | "crm_and_sales";
export type WhatsAppRuleTemplateKey = "stock" | "price" | "statement" | "order" | "payment" | "return" | "invoice" | "defect" | "generic";
export type WhatsAppApproverRole = "sales" | "accounting" | "crm";

export interface WhatsAppContact {
  id: string;
  tenantId: TenantId;
  displayName: string;
  phone: string;
  type: WhatsAppContactType;
  customerId?: CustomerId;
  userId?: UserId;
  registered: boolean;
  active: boolean;
}

export interface WhatsAppRuleResolution {
  intent: WhatsAppIntent;
  allowed: boolean;
  policyMode: WhatsAppApprovalPolicyMode;
  requiresRegisteredPhone: boolean;
  requiresCustomerLink: boolean;
  reason: string;
  fallbackMessage?: string;
  mode?: WhatsAppRuleMode;
  requiresCustomerConfirmation?: boolean;
  requiresLinkedCustomer?: boolean;
  canAutoReply?: boolean;
  requiresInternalApproval?: boolean;
  requiresSalesApproval?: boolean;
  requiresAccountingApproval?: boolean;
  requiresCrmApproval?: boolean;
  approvalPolicyMode?: WhatsAppApprovalPolicyMode;
  requiredRoles?: WhatsAppApproverRole[];
  approverPhones?: string[];
  approvalPolicy?: {
    mode: WhatsAppApprovalPolicyMode;
    requiredRoles: WhatsAppApproverRole[];
    approverPhones: string[];
    requiresInternalApproval: boolean;
    requiresCrmApproval: boolean;
  };
  templateKey?: WhatsAppRuleTemplateKey;
}

export interface WhatsAppConversation {
  id: string;
  tenantId: TenantId;
  contactId: string;
  title: string;
  lastMessagePreview: string;
  intent: WhatsAppIntent;
  unreadCount: number;
  pendingActionCount: number;
  relatedCustomerId?: CustomerId;
  relatedOrderId?: SaleOrderId;
  relatedPaymentId?: PaymentReceiptId;
  relatedDocumentId?: DocumentId;
  updatedAt: string;
  ruleResolution: WhatsAppRuleResolution;
}

export interface WhatsAppMessage {
  id: string;
  tenantId: TenantId;
  conversationId: string;
  direction: WhatsAppMessageDirection;
  type: WhatsAppMessageType;
  body: string;
  attachmentTitle?: string;
  quotedMessageId?: string;
  sentAt: string;
  status: "received" | "queued" | "sent" | "delivered" | "failed";
}

export interface WhatsAppTemplate {
  id: string;
  tenantId: TenantId;
  code: string;
  name: string;
  type: WhatsAppTemplateType;
  intent: WhatsAppIntent;
  body: string;
  active: boolean;
}

export interface WhatsAppActionRequest {
  id: string;
  tenantId: TenantId;
  conversationId: string;
  contactId: string;
  intent: WhatsAppIntent;
  status: WhatsAppActionRequestStatus;
  title: string;
  payloadSummary: string;
  targetEntityType: WorkflowEntityType;
  targetEntityId: string;
  approvalId?: ApprovalId;
  createdAt: string;
  confirmedAt?: string;
  executedAt?: string;
}

export type ErpConnectionType = "api" | "excel";
export type ErpConnectionMode = "import_only" | "export_only" | "bidirectional";
export type ErpSyncDirection = "import" | "export";
export type ErpEntityType = "customer" | "product" | "stock" | "price" | "payment" | "invoice" | "order" | "return";
export type IntegrationHealthStatus = "healthy" | "warning" | "error" | "passive";

export interface ErpConnection {
  id: string;
  tenantId: TenantId;
  name: string;
  type: ErpConnectionType;
  mode: ErpConnectionMode;
  status: IntegrationHealthStatus;
  baseUrl?: string;
  lastSyncedAt?: string;
  lastTestResult: "success" | "failed" | "not_tested";
  active: boolean;
}

export interface ErpMapping {
  id: string;
  tenantId: TenantId;
  connectionId: string;
  entityType: ErpEntityType;
  localField: string;
  remoteField: string;
  active: boolean;
}

export interface ErpSyncLog {
  id: string;
  tenantId: TenantId;
  connectionId: string;
  direction: ErpSyncDirection;
  entityType: ErpEntityType;
  status: "success" | "warning" | "failed";
  recordCount: number;
  message: string;
  startedAt: string;
  finishedAt?: string;
}

export type FactoryIntegrationType = "api" | "excel" | "email" | "manual";
export type FactoryIntegrationStatus = "active" | "passive" | "error";
export type FactoryOrderStatus = "draft" | "pending_approval" | "sent" | "confirmed" | "producing" | "shipped" | "completed" | "failed" | "cancelled";

export interface FactoryIntegration {
  id: string;
  tenantId: TenantId;
  factoryId: FactoryId;
  name: string;
  type: FactoryIntegrationType;
  status: FactoryIntegrationStatus;
  lastHealthCheckAt?: string;
  lastSyncAt?: string;
  errorMessage?: string;
}

export interface FactoryStockItem {
  id: string;
  tenantId: TenantId;
  snapshotId: string;
  factoryId: FactoryId;
  productId: ProductId;
  productCode: string;
  productName: string;
  availableQuantity: number;
  reservedQuantity: number;
  lastSyncedAt?: string;
  integrationStatus: FactoryIntegrationStatus;
}

export interface FactoryStockSnapshot {
  id: string;
  tenantId: TenantId;
  factoryId: FactoryId;
  integrationId: string;
  capturedAt: string;
  itemCount: number;
  status: "synced" | "stale" | "failed";
  items: FactoryStockItem[];
}

export interface FactoryOrderLine {
  id: string;
  tenantId: TenantId;
  factoryOrderId: string;
  saleOrderLineId?: string;
  productId: ProductId;
  productCode: string;
  productName: string;
  quantity: number;
  note?: string;
}

export interface FactoryOrder {
  id: string;
  tenantId: TenantId;
  factoryOrderNo: string;
  factoryId: FactoryId;
  factoryName: string;
  saleOrderId?: SaleOrderId;
  saleOrderNo?: string;
  status: FactoryOrderStatus;
  lineCount: number;
  lastUpdatedAt: string;
  approvalId?: ApprovalId;
  lines: FactoryOrderLine[];
}

export interface IntegrationLog {
  id: string;
  tenantId: TenantId;
  integrationType: "erp" | "factory" | "whatsapp";
  integrationId: string;
  level: "info" | "warning" | "error";
  message: string;
  createdAt: string;
  entityType?: WorkflowEntityType | ErpEntityType;
  entityId?: string;
}

export interface IntegrationHealthSummary {
  status: IntegrationHealthStatus;
  activeConnectionCount: number;
  warningCount: number;
  errorCount: number;
  lastSyncedAt?: string;
  message: string;
}

export type AiProposalStatus = "draft" | "waiting_approval" | "approved" | "rejected" | "executed" | "failed";
export type AiProposalActionType =
  | "read_summary"
  | "create_offer"
  | "create_order"
  | "create_payment"
  | "mark_warehouse_ready"
  | "complete_delivery"
  | "create_invoice"
  | "create_return"
  | "send_document_whatsapp"
  | "queue_document_save"
  | "queue_document_print";
export type AiOperationType = AiProposalActionType;
export type AiInsightSeverity = "info" | "warning" | "critical";
export type AiExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type AiChannelType = "crm_ui" | "whatsapp" | "mobile";
export type AiInputMode = "text" | "voice";

export interface AiOperation {
  id: string;
  type: AiOperationType;
  targetType: WorkflowEntityType;
  targetId: string;
  targetNo: string;
  mutation: boolean;
  summary: string;
  payload: Record<string, unknown>;
}

export interface AiProposal {
  id: string;
  tenantId: TenantId;
  proposalNo: string;
  sessionId: string;
  status: AiProposalStatus;
  actionType: AiProposalActionType;
  channel: AiChannelType;
  inputMode: AiInputMode;
  title: string;
  summary: string;
  requestedBy: UserId;
  requestedByName: string;
  targetType: WorkflowEntityType;
  targetId: string;
  targetNo: string;
  requiresApproval: boolean;
  approvalId?: ApprovalId;
  createdAt: string;
  updatedAt: string;
  operations: AiOperation[];
}

export interface AiSession {
  id: string;
  tenantId: TenantId;
  channel: AiChannelType;
  inputMode: AiInputMode;
  title: string;
  createdBy: UserId;
  createdAt: string;
  updatedAt: string;
  readOnlyDefault: boolean;
  messages: AiMessage[];
  proposals: AiProposal[];
}

export interface AiMessage {
  id: string;
  tenantId: TenantId;
  sessionId: string;
  role: "user" | "assistant" | "system";
  inputMode: AiInputMode;
  body: string;
  createdAt: string;
  proposalId?: string;
}

export interface AiInsight {
  id: string;
  tenantId: TenantId;
  title: string;
  category: "risk" | "stock" | "payment" | "factory" | "opportunity" | "operation";
  severity: AiInsightSeverity;
  confidence: number;
  summary: string;
  targetType: WorkflowEntityType;
  targetId: string;
  targetNo: string;
  suggestedAction?: AiProposalActionType;
  createdAt: string;
}

export interface AiExecutionResult {
  id: string;
  tenantId: TenantId;
  proposalId: string;
  operationId: string;
  status: AiExecutionStatus;
  message: string;
  auditEventId?: string;
  startedAt?: string;
  completedAt?: string;
}

export type ApprovalExecutionStatus = "pending" | "authorized" | "executed" | "failed" | "cancelled";
export type ApprovalTargetType = WorkflowEntityType | "ai_proposal" | "local_output";

export interface ApprovalExecution {
  id: string;
  tenantId: TenantId;
  approvalId: ApprovalId;
  proposalId?: string;
  targetType: ApprovalTargetType;
  targetId: string;
  operationType: AiOperationType;
  status: ApprovalExecutionStatus;
  requestedBy: UserId;
  authorizedBy?: UserId;
  createdAt: string;
  authorizedAt?: string;
  executedAt?: string;
  result?: AiExecutionResult;
}

export type LocalOutputType =
  | "offer_pdf"
  | "order_pdf"
  | "payment_receipt_pdf"
  | "warehouse_note_pdf"
  | "delivery_note_pdf"
  | "dispatch_note_pdf"
  | "invoice_pdf"
  | "statement_pdf"
  | "return_note_pdf";
export type LocalOutputDestination = "local_folder" | "printer" | "both";
export type PrintJobStatus = "queued" | "printing" | "completed" | "failed" | "cancelled";
export type FileSaveJobStatus = "queued" | "saving" | "completed" | "failed" | "cancelled";
export type LocalAgentStatus = "online" | "offline" | "disabled" | "safe_mode" | "error";

export interface LocalOutputRule {
  id: string;
  tenantId: TenantId;
  documentType: LocalOutputType;
  destination: LocalOutputDestination;
  subfolder: string;
  autoSave: boolean;
  autoPrint: boolean;
  printerName?: string;
  copies: number;
  safeMode: boolean;
  active: boolean;
}

export interface PrintJob {
  id: string;
  tenantId: TenantId;
  documentId: DocumentId;
  documentType: LocalOutputType;
  status: PrintJobStatus;
  printerName: string;
  copies: number;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface FileSaveJob {
  id: string;
  tenantId: TenantId;
  documentId: DocumentId;
  documentType: LocalOutputType;
  status: FileSaveJobStatus;
  targetFolder: string;
  fileName: string;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}
