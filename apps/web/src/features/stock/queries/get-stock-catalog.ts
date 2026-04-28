import { normalizeBarcode } from "@hallederiz/domain";
import type {
  Brand,
  CategorySlotConfig,
  CustomerPricingProfile,
  ExchangeRate,
  ExchangeRatePolicy,
  Factory,
  PriceSlotConfig,
  Product,
  Warehouse
} from "@hallederiz/types";

const tenantId = "tenant_1";

const brands: Brand[] = [
  { id: "brand_1", tenantId, code: "ALFA", name: "Alfa Duvar Kagidi", active: true },
  { id: "brand_2", tenantId, code: "NOVA", name: "Nova Surface", active: true },
  { id: "brand_3", tenantId, code: "LUXE", name: "Luxe Wallcover", active: true }
];

const factories: Factory[] = [
  { id: "factory_1", tenantId, code: "ANK", name: "Ankara Fabrika", integrationCode: "F-ANK", active: true },
  { id: "factory_2", tenantId, code: "IZM", name: "Izmir Fabrika", integrationCode: "F-IZM", active: true }
];

const warehouses: Warehouse[] = [
  { id: "wh_1", tenantId, code: "MERKEZ", name: "Merkez Depo", isCentral: true, active: true },
  { id: "wh_2", tenantId, code: "AVRUPA", name: "Avrupa Depo", isCentral: false, active: true },
  { id: "wh_3", tenantId, code: "ANADOLU", name: "Anadolu Depo", isCentral: false, active: true }
];

const categorySlots: CategorySlotConfig[] = [
  { slotNumber: 1, slotName: "Doku", active: true },
  { slotNumber: 2, slotName: "Desen", active: true },
  { slotNumber: 3, slotName: "Renk", active: true },
  { slotNumber: 4, slotName: "Tema", active: true }
];

const priceSlots: PriceSlotConfig[] = [
  { slotNumber: 1, slotName: "Perakende", currency: "TRY", amount: 0, active: true },
  { slotNumber: 2, slotName: "Proje", currency: "TRY", amount: 0, active: true },
  { slotNumber: 3, slotName: "Mimar", currency: "TRY", amount: 0, active: true },
  { slotNumber: 4, slotName: "Bayi", currency: "TRY", amount: 0, active: true },
  { slotNumber: 5, slotName: "Kampanya", currency: "USD", amount: 0, active: false },
  { slotNumber: 6, slotName: "Ihracat", currency: "EUR", amount: 0, active: false }
];

const exchangeRates: ExchangeRate[] = [
  {
    currency: "USD",
    buyingRate: 38.2,
    sellingRate: 38.45,
    fetchedAt: "2026-04-28T09:20:00.000Z",
    source: "tcmb"
  },
  {
    currency: "EUR",
    buyingRate: 41.3,
    sellingRate: 41.6,
    fetchedAt: "2026-04-28T09:20:00.000Z",
    source: "tcmb"
  }
];

const exchangeRatePolicy: ExchangeRatePolicy = {
  baseCurrency: "TRY",
  useSellingRateForOrder: true,
  additionalSpreadPercent: 0.5,
  roundingPrecision: 2,
  snapshotOnOrder: true
};

const customerPricingProfiles: CustomerPricingProfile[] = [
  {
    id: "cpp_1",
    tenantId,
    customerId: "customer_1",
    selectedPriceSlotNo: 2,
    assignedPriceSlot: 2,
    priceSlotLabelSnapshot: "Proje",
    preferredCurrency: "TRY",
    active: true
  },
  {
    id: "cpp_2",
    tenantId,
    customerId: "customer_2",
    selectedPriceSlotNo: 4,
    assignedPriceSlot: 4,
    priceSlotLabelSnapshot: "Bayi",
    preferredCurrency: "TRY",
    active: true
  }
];

const products: Product[] = [
  {
    id: "prod_1",
    tenantId,
    code: "DK-1001",
    name: "Linen Soft Ivory",
    brandId: "brand_1",
    collectionId: "col_1",
    factoryId: "factory_1",
    manufacturerIntegrationCode: "INT-1001",
    defaultSource: "warehouse",
    active: true,
    criticalStockLevel: 25,
    primaryBarcode: "8690001001001",
    qrCodeValue: "QR-DK-1001",
    barcodeAliases: [
      {
        id: "alias_1",
        productId: "prod_1",
        value: "DK1001A",
        normalizedValue: normalizeBarcode("DK1001A")
      }
    ],
    categoryValues: [
      { productId: "prod_1", slotNumber: 1, value: "Linen" },
      { productId: "prod_1", slotNumber: 2, value: "Duz" },
      { productId: "prod_1", slotNumber: 3, value: "Ivory" },
      { productId: "prod_1", slotNumber: 4, value: "Premium" }
    ],
    warehouseStocks: [
      { productId: "prod_1", warehouseId: "wh_1", onHand: 38, reserved: 6 },
      { productId: "prod_1", warehouseId: "wh_2", onHand: 11, reserved: 2 },
      { productId: "prod_1", warehouseId: "wh_3", onHand: 14, reserved: 0 }
    ],
    locations: [
      { productId: "prod_1", warehouseId: "wh_1", rackNo: "A1", locationCode: "M-A1-01" },
      { productId: "prod_1", warehouseId: "wh_2", rackNo: "B3", locationCode: "E-B3-11" },
      { productId: "prod_1", warehouseId: "wh_3", rackNo: "C2", locationCode: "A-C2-04" }
    ],
    priceTiers: [
      { productId: "prod_1", slotNumber: 1, currency: "TRY", amount: 980, active: true },
      { productId: "prod_1", slotNumber: 2, currency: "TRY", amount: 910, active: true },
      { productId: "prod_1", slotNumber: 3, currency: "TRY", amount: 870, active: true },
      { productId: "prod_1", slotNumber: 4, currency: "TRY", amount: 840, active: true },
      { productId: "prod_1", slotNumber: 5, currency: "USD", amount: 27, active: false },
      { productId: "prod_1", slotNumber: 6, currency: "EUR", amount: 25, active: false }
    ],
    factoryStockSummary: {
      totalStock: 420,
      lastSyncedAt: "2026-04-28T08:00:00.000Z",
      syncStatus: "synced"
    }
  },
  {
    id: "prod_2",
    tenantId,
    code: "DK-2022",
    name: "Geo Line Ash",
    brandId: "brand_2",
    collectionId: "col_2",
    factoryId: "factory_2",
    manufacturerIntegrationCode: "INT-2022",
    defaultSource: "hybrid",
    active: true,
    criticalStockLevel: 18,
    primaryBarcode: "8690002002002",
    qrCodeValue: "QR-DK-2022",
    barcodeAliases: [
      {
        id: "alias_2",
        productId: "prod_2",
        value: "GEO-2022",
        normalizedValue: normalizeBarcode("GEO-2022")
      }
    ],
    categoryValues: [
      { productId: "prod_2", slotNumber: 1, value: "Geo" },
      { productId: "prod_2", slotNumber: 2, value: "Cizgili" },
      { productId: "prod_2", slotNumber: 3, value: "Gri" },
      { productId: "prod_2", slotNumber: 4, value: "Modern" }
    ],
    warehouseStocks: [
      { productId: "prod_2", warehouseId: "wh_1", onHand: 8, reserved: 2 },
      { productId: "prod_2", warehouseId: "wh_2", onHand: 6, reserved: 1 },
      { productId: "prod_2", warehouseId: "wh_3", onHand: 4, reserved: 0 }
    ],
    locations: [
      { productId: "prod_2", warehouseId: "wh_1", rackNo: "A2", locationCode: "M-A2-08" },
      { productId: "prod_2", warehouseId: "wh_2", rackNo: "B1", locationCode: "E-B1-10" },
      { productId: "prod_2", warehouseId: "wh_3", rackNo: "C4", locationCode: "A-C4-03" }
    ],
    priceTiers: [
      { productId: "prod_2", slotNumber: 1, currency: "TRY", amount: 760, active: true },
      { productId: "prod_2", slotNumber: 2, currency: "TRY", amount: 710, active: true },
      { productId: "prod_2", slotNumber: 3, currency: "TRY", amount: 690, active: true },
      { productId: "prod_2", slotNumber: 4, currency: "TRY", amount: 650, active: true },
      { productId: "prod_2", slotNumber: 5, currency: "USD", amount: 21, active: false },
      { productId: "prod_2", slotNumber: 6, currency: "EUR", amount: 19.5, active: false }
    ],
    factoryStockSummary: {
      totalStock: 168,
      lastSyncedAt: "2026-04-28T05:30:00.000Z",
      syncStatus: "stale"
    }
  },
  {
    id: "prod_3",
    tenantId,
    code: "DK-3308",
    name: "Concrete Mist",
    brandId: "brand_3",
    collectionId: "col_3",
    factoryId: "factory_1",
    manufacturerIntegrationCode: "INT-3308",
    defaultSource: "factory",
    active: true,
    criticalStockLevel: 12,
    primaryBarcode: "8690003003003",
    qrCodeValue: "QR-DK-3308",
    barcodeAliases: [
      {
        id: "alias_3",
        productId: "prod_3",
        value: "CNC-3308",
        normalizedValue: normalizeBarcode("CNC-3308")
      }
    ],
    categoryValues: [
      { productId: "prod_3", slotNumber: 1, value: "Beton" },
      { productId: "prod_3", slotNumber: 2, value: "Doku" },
      { productId: "prod_3", slotNumber: 3, value: "Acik Gri" },
      { productId: "prod_3", slotNumber: 4, value: "Endustriyel" }
    ],
    warehouseStocks: [
      { productId: "prod_3", warehouseId: "wh_1", onHand: 22, reserved: 5 },
      { productId: "prod_3", warehouseId: "wh_2", onHand: 5, reserved: 0 },
      { productId: "prod_3", warehouseId: "wh_3", onHand: 0, reserved: 0 }
    ],
    locations: [
      { productId: "prod_3", warehouseId: "wh_1", rackNo: "A5", locationCode: "M-A5-02" },
      { productId: "prod_3", warehouseId: "wh_2", rackNo: "B4", locationCode: "E-B4-01" },
      { productId: "prod_3", warehouseId: "wh_3", rackNo: "C1", locationCode: "A-C1-09" }
    ],
    priceTiers: [
      { productId: "prod_3", slotNumber: 1, currency: "TRY", amount: 640, active: true },
      { productId: "prod_3", slotNumber: 2, currency: "TRY", amount: 610, active: true },
      { productId: "prod_3", slotNumber: 3, currency: "TRY", amount: 590, active: true },
      { productId: "prod_3", slotNumber: 4, currency: "TRY", amount: 560, active: true },
      { productId: "prod_3", slotNumber: 5, currency: "USD", amount: 17.5, active: false },
      { productId: "prod_3", slotNumber: 6, currency: "EUR", amount: 16.4, active: false }
    ],
    factoryStockSummary: {
      totalStock: 310,
      lastSyncedAt: null,
      syncStatus: "not_connected"
    }
  }
];

export interface StockCatalogQueryResult {
  products: Product[];
  brands: Brand[];
  factories: Factory[];
  warehouses: Warehouse[];
  categorySlots: CategorySlotConfig[];
  priceSlots: PriceSlotConfig[];
  exchangeRates: ExchangeRate[];
  exchangeRatePolicy: ExchangeRatePolicy;
  customerPricingProfiles: CustomerPricingProfile[];
}

export async function getStockCatalog(): Promise<StockCatalogQueryResult> {
  return {
    products,
    brands,
    factories,
    warehouses,
    categorySlots,
    priceSlots,
    exchangeRates,
    exchangeRatePolicy,
    customerPricingProfiles
  };
}
