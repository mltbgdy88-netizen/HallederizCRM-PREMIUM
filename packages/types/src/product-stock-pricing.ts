import type {
  BrandId,
  CollectionId,
  CustomerId,
  FactoryId,
  ProductId,
  TenantId,
  WarehouseId
} from "./identifiers";

export type CurrencyCode = "TRY" | "USD" | "EUR";
export type ProductSource = "warehouse" | "factory" | "hybrid";
export type CriticalStockStatus = "ok" | "critical";
export type ExchangeRateSource = "tcmb";

export type PriceSlotNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type CategorySlotNumber = 1 | 2 | 3 | 4;

export interface Brand {
  id: BrandId;
  tenantId: TenantId;
  code: string;
  name: string;
  active: boolean;
}

export interface Factory {
  id: FactoryId;
  tenantId: TenantId;
  code: string;
  name: string;
  integrationCode?: string;
  active: boolean;
}

export interface Collection {
  id: CollectionId;
  tenantId: TenantId;
  brandId: BrandId;
  code: string;
  name: string;
  active: boolean;
}

export interface Warehouse {
  id: WarehouseId;
  tenantId: TenantId;
  code: string;
  name: string;
  isCentral: boolean;
  active: boolean;
}

export interface WarehouseStock {
  productId: ProductId;
  warehouseId: WarehouseId;
  onHand: number;
  reserved: number;
}

export interface ProductLocation {
  productId: ProductId;
  warehouseId: WarehouseId;
  rackNo: string;
  locationCode: string;
}

export interface ProductBarcodeAlias {
  id: string;
  productId: ProductId;
  value: string;
  normalizedValue: string;
}

export interface ProductCategoryValue {
  productId: ProductId;
  slotNumber: CategorySlotNumber;
  value: string;
}

export interface PriceSlotConfig {
  slotNumber: PriceSlotNumber;
  slotName: string;
  currency: CurrencyCode;
  amount: number;
  active: boolean;
}

export interface CategorySlotConfig {
  slotNumber: CategorySlotNumber;
  slotName: string;
  active: boolean;
}

export interface ProductPriceTier {
  productId: ProductId;
  slotNumber: PriceSlotNumber;
  currency: CurrencyCode;
  amount: number;
  active: boolean;
}

export interface FactoryStockSummary {
  totalStock: number;
  lastSyncedAt: string | null;
  syncStatus: "synced" | "stale" | "not_connected";
}

export interface Product {
  id: ProductId;
  tenantId: TenantId;
  code: string;
  name: string;
  brandId: BrandId;
  collectionId?: CollectionId;
  factoryId?: FactoryId;
  manufacturerIntegrationCode?: string;
  defaultSource: ProductSource;
  active: boolean;
  criticalStockLevel: number;
  primaryBarcode: string;
  qrCodeValue: string;
  barcodeAliases: ProductBarcodeAlias[];
  categoryValues: ProductCategoryValue[];
  warehouseStocks: WarehouseStock[];
  locations: ProductLocation[];
  priceTiers: ProductPriceTier[];
  factoryStockSummary: FactoryStockSummary;
}

export interface ExchangeRate {
  currency: Exclude<CurrencyCode, "TRY">;
  buyingRate: number;
  sellingRate: number;
  fetchedAt: string;
  source: ExchangeRateSource;
}

export interface ExchangeRatePolicy {
  baseCurrency: "TRY";
  useSellingRateForOrder: boolean;
  additionalSpreadPercent: number;
  roundingPrecision: number;
  snapshotOnOrder: boolean;
}

export interface OrderPriceSnapshot {
  productId: ProductId;
  customerId: CustomerId;
  slotNumber: PriceSlotNumber;
  sourceCurrency: CurrencyCode;
  targetCurrency: CurrencyCode;
  amountInSourceCurrency: number;
  amountInTargetCurrency: number;
  exchangeRates: ExchangeRate[];
  exchangeRatePolicy: ExchangeRatePolicy;
  capturedAt: string;
}

export interface CustomerPricingProfile {
  id: string;
  tenantId: TenantId;
  customerId: CustomerId;
  selectedPriceSlotNo: PriceSlotNumber;
  assignedPriceSlot?: PriceSlotNumber;
  priceSlotLabelSnapshot?: string;
  discountPolicy?: {
    type: "none" | "percentage" | "manual_review";
    value?: number;
    note?: string;
  };
  preferredCurrency?: CurrencyCode;
  active: boolean;
}
