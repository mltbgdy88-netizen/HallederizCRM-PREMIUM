import {
  detectCriticalStock,
  findBarcodeConflict,
  normalizeBarcode,
  resolveProductAvailability
} from "@hallederiz/domain";
import type {
  Brand,
  CategorySlotConfig,
  ExchangeRate,
  ExchangeRatePolicy,
  Factory,
  PriceSlotConfig,
  Product,
  Warehouse
} from "@hallederiz/types";

const tenantId = "tenant_1";

export const brands: Brand[] = [
  { id: "brand_1", tenantId, code: "ALFA", name: "Alfa Duvar Kagidi", active: true },
  { id: "brand_2", tenantId, code: "NOVA", name: "Nova Surface", active: true }
];

export const factories: Factory[] = [
  {
    id: "factory_1",
    tenantId,
    code: "ANK",
    name: "Ankara Fabrika",
    integrationCode: "F-ANK",
    active: true
  },
  {
    id: "factory_2",
    tenantId,
    code: "IZM",
    name: "Izmir Fabrika",
    integrationCode: "F-IZM",
    active: true
  }
];

export const warehouses: Warehouse[] = [
  { id: "wh_1", tenantId, code: "MERKEZ", name: "Merkez Depo", isCentral: true, active: true },
  { id: "wh_2", tenantId, code: "AVRUPA", name: "Avrupa Depo", isCentral: false, active: true },
  { id: "wh_3", tenantId, code: "ANADOLU", name: "Anadolu Depo", isCentral: false, active: true }
];

const fallbackBrandId = brands[0]?.id ?? "brand_1";
const fallbackFactoryId = factories[0]?.id ?? "factory_1";

let priceSlots: PriceSlotConfig[] = [
  { slotNumber: 1, slotName: "Perakende", currency: "TRY", amount: 0, active: true },
  { slotNumber: 2, slotName: "Proje", currency: "TRY", amount: 0, active: true },
  { slotNumber: 3, slotName: "Mimar", currency: "TRY", amount: 0, active: true },
  { slotNumber: 4, slotName: "Bayi", currency: "TRY", amount: 0, active: true },
  { slotNumber: 5, slotName: "Kampanya", currency: "USD", amount: 0, active: false },
  { slotNumber: 6, slotName: "Ihracat", currency: "EUR", amount: 0, active: false }
];

let categorySlots: CategorySlotConfig[] = [
  { slotNumber: 1, slotName: "Doku", active: true },
  { slotNumber: 2, slotName: "Desen", active: true },
  { slotNumber: 3, slotName: "Renk", active: true },
  { slotNumber: 4, slotName: "Tema", active: true }
];

let exchangeRatePolicy: ExchangeRatePolicy = {
  baseCurrency: "TRY",
  useSellingRateForOrder: true,
  additionalSpreadPercent: 0,
  roundingPrecision: 2,
  snapshotOnOrder: true
};

let exchangeRates: ExchangeRate[] = [
  {
    currency: "USD",
    buyingRate: 38.2,
    sellingRate: 38.45,
    fetchedAt: new Date().toISOString(),
    source: "tcmb"
  },
  {
    currency: "EUR",
    buyingRate: 41.3,
    sellingRate: 41.6,
    fetchedAt: new Date().toISOString(),
    source: "tcmb"
  }
];

let products: Product[] = [
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
      lastSyncedAt: new Date().toISOString(),
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
      lastSyncedAt: new Date().toISOString(),
      syncStatus: "stale"
    }
  }
];

function matchesSearch(product: Product, query: string): boolean {
  if (!query) {
    return true;
  }

  const normalizedQuery = normalizeBarcode(query);
  const textQuery = query.toLowerCase();

  if (product.code.toLowerCase().includes(textQuery) || product.name.toLowerCase().includes(textQuery)) {
    return true;
  }

  const barcodeCandidates = [
    product.primaryBarcode,
    product.qrCodeValue,
    ...product.barcodeAliases.map((alias) => alias.value)
  ];

  return barcodeCandidates.some((candidate) => normalizeBarcode(candidate).includes(normalizedQuery));
}

export function listProducts(filters: {
  query?: string;
  brandId?: string;
  factoryId?: string;
  criticalOnly?: boolean;
  inStockOnly?: boolean;
  category1?: string;
  category2?: string;
  category3?: string;
  category4?: string;
}): Product[] {
  return products.filter((product) => {
    const availability = resolveProductAvailability({ product, warehouses });
    const criticalStatus = detectCriticalStock(product, availability);

    if (!matchesSearch(product, filters.query ?? "")) {
      return false;
    }

    if (filters.brandId && product.brandId !== filters.brandId) {
      return false;
    }

    if (filters.factoryId && product.factoryId !== filters.factoryId) {
      return false;
    }

    if (filters.criticalOnly && criticalStatus !== "critical") {
      return false;
    }

    if (filters.inStockOnly && availability.centerStockTotal <= 0) {
      return false;
    }

    const categoryFilterPairs = [
      { slotNumber: 1 as const, value: filters.category1 },
      { slotNumber: 2 as const, value: filters.category2 },
      { slotNumber: 3 as const, value: filters.category3 },
      { slotNumber: 4 as const, value: filters.category4 }
    ];

    for (const pair of categoryFilterPairs) {
      if (!pair.value) {
        continue;
      }

      const categoryValue = product.categoryValues.find((item) => item.slotNumber === pair.slotNumber)?.value;
      if (categoryValue !== pair.value) {
        return false;
      }
    }

    return true;
  });
}

export function getProductById(productId: string): Product | undefined {
  return products.find((product) => product.id === productId);
}

export function createProduct(input: Partial<Product>): Product {
  const id = `prod_${products.length + 1}`;
  const createdProduct: Product = {
    id,
    tenantId,
    code: input.code ?? `NEW-${id.toUpperCase()}`,
    name: input.name ?? "Yeni Urun",
    brandId: input.brandId ?? fallbackBrandId,
    collectionId: input.collectionId,
    factoryId: input.factoryId ?? fallbackFactoryId,
    manufacturerIntegrationCode: input.manufacturerIntegrationCode,
    defaultSource: input.defaultSource ?? "warehouse",
    active: input.active ?? true,
    criticalStockLevel: input.criticalStockLevel ?? 0,
    primaryBarcode: input.primaryBarcode ?? "",
    qrCodeValue: input.qrCodeValue ?? "",
    barcodeAliases: input.barcodeAliases ?? [],
    categoryValues: input.categoryValues ?? [],
    warehouseStocks: input.warehouseStocks ?? [],
    locations: input.locations ?? [],
    priceTiers: input.priceTiers ?? [],
    factoryStockSummary: input.factoryStockSummary ?? {
      totalStock: 0,
      lastSyncedAt: null,
      syncStatus: "not_connected"
    }
  };

  const conflict = findBarcodeConflict({
    products,
    value: createdProduct.primaryBarcode,
    excludeProductId: createdProduct.id
  });

  if (createdProduct.primaryBarcode && conflict) {
    throw new Error(`Primary barcode conflict with product ${conflict.productCode}`);
  }

  products = [...products, createdProduct];
  return createdProduct;
}

export function patchProduct(productId: string, input: Partial<Product>): Product | null {
  const existing = getProductById(productId);
  if (!existing) {
    return null;
  }

  const updatedProduct: Product = {
    ...existing,
    ...input,
    id: existing.id,
    tenantId: existing.tenantId
  };

  const conflict = findBarcodeConflict({
    products,
    value: updatedProduct.primaryBarcode,
    excludeProductId: updatedProduct.id
  });

  if (updatedProduct.primaryBarcode && conflict) {
    throw new Error(`Primary barcode conflict with product ${conflict.productCode}`);
  }

  products = products.map((product) => (product.id === productId ? updatedProduct : product));
  return updatedProduct;
}

export function getProductAvailability(productId: string) {
  const product = getProductById(productId);
  if (!product) {
    return null;
  }

  const availability = resolveProductAvailability({ product, warehouses });
  const criticalStatus = detectCriticalStock(product, availability);

  return {
    productId: product.id,
    ...availability,
    criticalStatus
  };
}

export function getPriceSlots(): PriceSlotConfig[] {
  return priceSlots;
}

export function patchPriceSlots(nextSlots: PriceSlotConfig[]): PriceSlotConfig[] {
  priceSlots = nextSlots;
  return priceSlots;
}

export function getCategorySlots(): CategorySlotConfig[] {
  return categorySlots;
}

export function patchCategorySlots(nextSlots: CategorySlotConfig[]): CategorySlotConfig[] {
  categorySlots = nextSlots;
  return categorySlots;
}

export function getCurrentExchangeRates() {
  return {
    policy: exchangeRatePolicy,
    rates: exchangeRates
  };
}

export function patchExchangeRatePolicy(input: Partial<ExchangeRatePolicy>): ExchangeRatePolicy {
  exchangeRatePolicy = {
    ...exchangeRatePolicy,
    ...input
  };
  return exchangeRatePolicy;
}

export function getStockLookupOptions() {
  return {
    brands,
    factories,
    warehouses
  };
}
