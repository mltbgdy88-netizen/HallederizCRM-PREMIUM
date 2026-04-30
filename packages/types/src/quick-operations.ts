export type QuickOperationType = "offer" | "sale_order" | "delivery" | "payment" | "return";

export type QuickOperationSourceType = "center_warehouse" | "factory" | "supplier" | "split" | "auto";

export interface QuickOperationLine {
  id: string;
  productId?: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate?: number;
  sourceType: QuickOperationSourceType;
  warehouseId?: string;
  warehouseName?: string;
  rackCode?: string;
  locationCode?: string;
  factoryId?: string;
  supplierId?: string;
  sourceNote?: string;
  lineTotal: number;
}

export interface QuickOperationDraft {
  id: string;
  operationType: QuickOperationType;
  customerId: string;
  customerName?: string;
  note?: string;
  lines: QuickOperationLine[];
  createdAt: string;
}

export interface QuickOperationTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount?: number;
  remainingAmount?: number;
}

export interface QuickOperationWorkflowImpact {
  id: string;
  key:
    | "warehouse_prepare"
    | "factory_plan"
    | "supplier_procurement"
    | "multi_source"
    | "recommendation_required"
    | "offer_no_reservation"
    | "offer_created"
    | "document_preview_available"
    | "whatsapp_draft_available"
    | "sale_order_source_plan"
    | "payment_recorded"
    | "payment_allocation_required"
    | "return_approval_may_be_required"
    | "delivery_execution_pending"
    | "return_review_required";
  title: string;
  description: string;
  severity: "info" | "warning" | "success";
}

export interface QuickOperationValidationIssue {
  code: string;
  field: string;
  message: string;
  level: "error" | "warning";
  lineId?: string;
}

export interface QuickOperationSubmitRequest {
  operationType: QuickOperationType;
  customerId: string;
  customerName?: string;
  note?: string;
  paidAmount?: number;
  lines: QuickOperationLine[];
}

export interface QuickOperationPreviewResponse {
  ok: boolean;
  operationType: QuickOperationType;
  totals: QuickOperationTotals;
  workflowImpacts: QuickOperationWorkflowImpact[];
  validationIssues: QuickOperationValidationIssue[];
}

export interface QuickOperationSubmitResponse {
  ok: boolean;
  operationType: QuickOperationType;
  draftId?: string;
  createdEntityType?: "offer" | "order" | "delivery" | "payment" | "return";
  createdEntityId?: string;
  createdEntityNo?: string;
  workflowImpacts: QuickOperationWorkflowImpact[];
  documentIds: string[];
  auditEventIds: string[];
  validationIssues?: QuickOperationValidationIssue[];
  mode: "foundation" | "executed";
}
