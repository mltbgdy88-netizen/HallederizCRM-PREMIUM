import type { CustomerId, OfferId, ProductId, TenantId, UserId } from "./identifiers";
import type {
  CurrencyCode,
  CustomerPricingProfile,
  PriceSlotNumber,
  ProductSource
} from "./product-stock-pricing";

export type CustomerType = "bayi" | "perakende" | "mimar" | "usta" | "kurumsal" | "ozel";
export type CustomerRiskLevel = "low" | "medium" | "high" | "blocked";
export type CustomerBalanceState = "all" | "open_balance" | "credit" | "zero";

export interface Customer {
  id: CustomerId;
  tenantId: TenantId;
  code: string;
  name: string;
  type: CustomerType;
  taxOffice?: string;
  taxNumber?: string;
  phone: string;
  email?: string;
  city: string;
  district?: string;
  addressLine: string;
  active: boolean;
  riskLevel: CustomerRiskLevel;
  pricingProfile: CustomerPricingProfile;
  whatsappMatched: boolean;
  lastOrderAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerContact {
  id: string;
  tenantId: TenantId;
  customerId: CustomerId;
  fullName: string;
  title?: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export type CustomerAddressType = "billing" | "delivery" | "alternate";

export interface CustomerAddress {
  id: string;
  tenantId: TenantId;
  customerId: CustomerId;
  type: CustomerAddressType;
  title: string;
  city: string;
  district?: string;
  line: string;
  isDefault: boolean;
}

export interface CustomerAccount {
  id: string;
  tenantId: TenantId;
  customerId: CustomerId;
  balance: number;
  currency: CurrencyCode;
  creditLimit?: number;
  overdueAmount: number;
  openOfferCount: number;
  openOrderCount: number;
  lastPaymentAt?: string;
}

export type CustomerLedgerDirection = "debit" | "credit";

export interface CustomerLedgerEntry {
  id: string;
  tenantId: TenantId;
  customerId: CustomerId;
  direction: CustomerLedgerDirection;
  amount: number;
  currency: CurrencyCode;
  description: string;
  referenceType: "offer" | "order" | "payment" | "invoice" | "return" | "manual";
  referenceId?: string;
  occurredAt: string;
}

export type OfferStatus =
  | "draft"
  | "sent"
  | "waiting_response"
  | "approved"
  | "rejected"
  | "expired"
  | "converted";

export type OfferContactChannel = "whatsapp" | "phone" | "email" | "face_to_face";
export type OfferResponseState = "planned" | "waiting" | "positive" | "negative" | "no_response";

export interface OfferLine {
  id: string;
  offerId: OfferId;
  productId: ProductId;
  productCode: string;
  productName: string;
  quantity: number;
  priceSlotNo: PriceSlotNumber;
  priceSlotLabelSnapshot: string;
  unitPrice: number;
  currency: CurrencyCode;
  exchangeRate: number;
  discountPercent: number;
  lineTotal: number;
  sourcePreference: ProductSource;
  centerStockSnapshot: number;
  factoryStockSnapshot: number;
  priceOverride: boolean;
  pricingWarning?: string;
}

export interface OfferFollowUp {
  id: string;
  offerId: OfferId;
  contactChannel: OfferContactChannel;
  responseState: OfferResponseState;
  note: string;
  plannedAt: string;
  completedAt?: string;
  createdBy: UserId;
  createdAt: string;
}

export interface Offer {
  id: OfferId;
  tenantId: TenantId;
  offerNo: string;
  customerId: CustomerId;
  status: OfferStatus;
  validUntil: string;
  note?: string;
  priceSlotNoSnapshot: PriceSlotNumber;
  priceSlotLabelSnapshot: string;
  currency: CurrencyCode;
  subtotal: number;
  discountTotal: number;
  taxRate: number;
  taxTotal: number;
  grandTotal: number;
  createdBy: UserId;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  convertedOrderDraftId?: string;
  lines: OfferLine[];
  followUps: OfferFollowUp[];
  documentStatus?: "not_created" | "previewed" | "sent";
}

export interface OfferTotals {
  subtotal: number;
  discountTotal: number;
  taxRate: number;
  taxTotal: number;
  grandTotal: number;
  currency: CurrencyCode;
}

export interface OfferOrderDraft {
  id: string;
  customer: {
    id: CustomerId;
    code?: string;
    name?: string;
  };
  customerId: CustomerId;
  offerId: OfferId;
  offerNo: string;
  source: "teklif_donusumu";
  orderSource: "teklif_donusumu";
  note?: string;
  priceSlotNoSnapshot: PriceSlotNumber;
  priceSlotLabelSnapshot: string;
  lines: Array<{
    productId: ProductId;
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    currency: CurrencyCode;
    exchangeRate: number;
    priceSlotNo: PriceSlotNumber;
    priceSlotLabelSnapshot: string;
    sourcePreference: ProductSource;
    centerStockSnapshot: number;
    factoryStockSnapshot: number;
    linePriceSnapshot: OfferLine;
  }>;
  warning: string;
  navigationPath: string;
  createdAt: string;
}
