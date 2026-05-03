export type QuickOperationType = "offer" | "sale_order" | "delivery" | "payment" | "return";

export type QuickOperationSourceType = "center_warehouse" | "factory" | "supplier" | "split" | "auto";

export interface QuickOperationCustomer {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  priceGroup: string;
  risk: "Dusuk" | "Orta" | "Yuksek";
  balance: number;
  address: string;
  /** Gösterim: Alacak tutarı (₺) */
  receivableDisplay?: string;
  /** Gösterim: Verecek tutarı (₺) */
  payableDisplay?: string;
  /** Gösterim: Uyarı metni */
  warningDisplay?: string;
}

export interface QuickOperationProduct {
  code: string;
  name: string;
  price: number;
  taxRate: number;
}

export interface QuickOperationLine {
  id: string;
  productCode: string;
  productName: string;
  /** Satır birimi (Adet, Paket, Takım …) */
  unit: string;
  quantity: number;
  sourceType: QuickOperationSourceType;
  sourceLabel: string;
  warehouseName: string;
  rackCode: string;
  locationCode: string;
  unitPrice: number;
  taxRate: number;
}

export interface QuickOperationTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount?: number;
  remainingAmount?: number;
}

export interface QuickOperationImpact {
  id: string;
  title: string;
  description: string;
  tone: "info" | "success" | "warning" | "danger";
}

export interface QuickOperationDocumentPreviewLine {
  no: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

export interface QuickOperationDocumentPreview {
  documentType: "offer" | "sale_order" | "delivery" | "payment" | "return";
  title: string;
  referenceNo: string;
  customerName: string;
  lines: QuickOperationDocumentPreviewLine[];
  totals: QuickOperationTotals;
  notes?: string;
  previewText?: string;
}

export interface QuickOperationWhatsappDraft {
  toPhone?: string;
  message: string;
  intent: "offer" | "sale_order" | "delivery" | "payment" | "return" | "generic";
  requiresApproval?: boolean;
  sendEnabled: false;
}

export interface QuickOperationAiInsight {
  summary: string;
  warnings: string[];
  recommendations: string[];
  source: "template" | "local-ai" | "mock";
}

export interface QuickOperationSideActions {
  documentPreview?: QuickOperationDocumentPreview;
  whatsappDraft?: QuickOperationWhatsappDraft;
  aiInsight?: QuickOperationAiInsight;
}

export interface SourceOption {
  type: QuickOperationSourceType;
  title: string;
  badge: string;
  description: string;
  sourceLabel: string;
  warehouseName: string;
  rackCode: string;
  locationCode: string;
}
