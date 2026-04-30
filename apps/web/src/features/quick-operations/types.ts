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
  paidAmount: number;
  remainingAmount: number;
}

export interface QuickOperationImpact {
  id: string;
  title: string;
  description: string;
  tone: "info" | "success" | "warning" | "danger";
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
