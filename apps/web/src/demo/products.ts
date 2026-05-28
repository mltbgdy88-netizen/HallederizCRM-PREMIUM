import { normalizeBarcode } from "@hallederiz/domain";
import type { Brand, CustomerPricingProfile, Factory, Product, ProductSource, Warehouse } from "@hallederiz/types";
import { customers } from "./customers";
import { demoCategorySlots, demoExchangeRatePolicy, demoExchangeRates, demoPriceSlots, demoTenantId } from "./pricing";

export const brands: Brand[] = [
  { id: "brand_1", tenantId: demoTenantId, code: "ALFA", name: "Alfa Duvar Kagidi", active: true },
  { id: "brand_2", tenantId: demoTenantId, code: "NOVA", name: "Nova Surface", active: true },
  { id: "brand_3", tenantId: demoTenantId, code: "LUXE", name: "Luxe Wallcover", active: true },
  { id: "brand_4", tenantId: demoTenantId, code: "MIRA", name: "Mira Texture", active: true }
];

export const factories: Factory[] = [
  { id: "factory_1", tenantId: demoTenantId, code: "ANK", name: "Ankara Fabrika", integrationCode: "F-ANK", active: true },
  { id: "factory_2", tenantId: demoTenantId, code: "IZM", name: "Izmir Fabrika", integrationCode: "F-IZM", active: true }
];

export const warehouses: Warehouse[] = [
  { id: "wh_1", tenantId: demoTenantId, code: "MERKEZ", name: "Merkez Depo", isCentral: true, active: true },
  { id: "wh_2", tenantId: demoTenantId, code: "AVRUPA", name: "Avrupa Depo", isCentral: false, active: true },
  { id: "wh_3", tenantId: demoTenantId, code: "ANADOLU", name: "Anadolu Depo", isCentral: false, active: true }
];

type ProductSeed = {
  id: string;
  code: string;
  name: string;
  brandId: string;
  factoryId: string;
  collectionId: string;
  source: ProductSource;
  critical: number;
  center: number;
  europe: number;
  anatolia: number;
  reserved: number;
  factoryStock: number;
  sync: "synced" | "stale" | "not_connected";
  slot1: number;
  texture: string;
  pattern: string;
  color: string;
  theme: string;
};

const seeds: ProductSeed[] = [
  { id: "prod_1", code: "DK-1001", name: "Linen Soft Ivory", brandId: "brand_1", factoryId: "factory_1", collectionId: "col_1", source: "warehouse", critical: 25, center: 38, europe: 11, anatolia: 14, reserved: 6, factoryStock: 420, sync: "synced", slot1: 980, texture: "Linen", pattern: "Duz", color: "Ivory", theme: "Premium" },
  { id: "prod_2", code: "DK-2022", name: "Geo Line Ash", brandId: "brand_2", factoryId: "factory_2", collectionId: "col_2", source: "hybrid", critical: 18, center: 8, europe: 6, anatolia: 4, reserved: 2, factoryStock: 168, sync: "stale", slot1: 760, texture: "Geo", pattern: "Cizgili", color: "Gri", theme: "Modern" },
  { id: "prod_3", code: "DK-3308", name: "Concrete Mist", brandId: "brand_3", factoryId: "factory_1", collectionId: "col_3", source: "factory", critical: 12, center: 22, europe: 5, anatolia: 0, reserved: 5, factoryStock: 310, sync: "not_connected", slot1: 640, texture: "Beton", pattern: "Doku", color: "Acik Gri", theme: "Endustriyel" },
  { id: "prod_4", code: "DK-4105", name: "Botanic Sage", brandId: "brand_1", factoryId: "factory_2", collectionId: "col_4", source: "warehouse", critical: 20, center: 44, europe: 9, anatolia: 7, reserved: 3, factoryStock: 95, sync: "synced", slot1: 720, texture: "Mat", pattern: "Botanik", color: "Yesil", theme: "Dogal" },
  { id: "prod_5", code: "DK-5110", name: "Marble Pearl", brandId: "brand_3", factoryId: "factory_1", collectionId: "col_5", source: "factory", critical: 16, center: 5, europe: 2, anatolia: 1, reserved: 1, factoryStock: 520, sync: "synced", slot1: 1250, texture: "Mermer", pattern: "Damarlı", color: "Beyaz", theme: "Luxury" },
  { id: "prod_6", code: "DK-6120", name: "Kids Cloud Blue", brandId: "brand_4", factoryId: "factory_2", collectionId: "col_6", source: "warehouse", critical: 10, center: 28, europe: 3, anatolia: 12, reserved: 0, factoryStock: 80, sync: "synced", slot1: 540, texture: "Soft", pattern: "Cocuk", color: "Mavi", theme: "Kids" },
  { id: "prod_7", code: "DK-7101", name: "Classic Damask Gold", brandId: "brand_3", factoryId: "factory_1", collectionId: "col_7", source: "hybrid", critical: 14, center: 13, europe: 4, anatolia: 2, reserved: 3, factoryStock: 240, sync: "synced", slot1: 1120, texture: "Kabartma", pattern: "Damask", color: "Gold", theme: "Klasik" },
  { id: "prod_8", code: "DK-8124", name: "Loft Brick Terra", brandId: "brand_2", factoryId: "factory_2", collectionId: "col_8", source: "warehouse", critical: 22, center: 19, europe: 10, anatolia: 6, reserved: 5, factoryStock: 130, sync: "stale", slot1: 690, texture: "Tugla", pattern: "Loft", color: "Terra", theme: "Endustriyel" },
  { id: "prod_9", code: "DK-9100", name: "Velvet Navy", brandId: "brand_4", factoryId: "factory_1", collectionId: "col_9", source: "factory", critical: 8, center: 2, europe: 0, anatolia: 1, reserved: 0, factoryStock: 360, sync: "synced", slot1: 1480, texture: "Kadife", pattern: "Duz", color: "Lacivert", theme: "Premium" },
  { id: "prod_10", code: "DK-9902", name: "Minimal Sand", brandId: "brand_1", factoryId: "factory_2", collectionId: "col_10", source: "warehouse", critical: 18, center: 51, europe: 13, anatolia: 9, reserved: 4, factoryStock: 70, sync: "synced", slot1: 580, texture: "Mat", pattern: "Minimal", color: "Kum", theme: "Modern" }
];

function productFromSeed(seed: ProductSeed, index: number): Product {
  const base = seed.slot1;
  return {
    id: seed.id,
    tenantId: demoTenantId,
    code: seed.code,
    name: seed.name,
    brandId: seed.brandId,
    collectionId: seed.collectionId,
    factoryId: seed.factoryId,
    manufacturerIntegrationCode: `INT-${seed.code.replace("DK-", "")}`,
    defaultSource: seed.source,
    active: true,
    criticalStockLevel: seed.critical,
    primaryBarcode: `869000${String(index + 1).padStart(3, "0")}${String(index + 1).padStart(4, "0")}`,
    qrCodeValue: `QR-${seed.code}`,
    barcodeAliases: [{ id: `alias_${index + 1}`, productId: seed.id, value: seed.code.replace("-", ""), normalizedValue: normalizeBarcode(seed.code.replace("-", "")) }],
    categoryValues: [
      { productId: seed.id, slotNumber: 1, value: seed.texture },
      { productId: seed.id, slotNumber: 2, value: seed.pattern },
      { productId: seed.id, slotNumber: 3, value: seed.color },
      { productId: seed.id, slotNumber: 4, value: seed.theme }
    ],
    warehouseStocks: [
      { productId: seed.id, warehouseId: "wh_1", onHand: seed.center, reserved: seed.reserved },
      { productId: seed.id, warehouseId: "wh_2", onHand: seed.europe, reserved: Math.floor(seed.reserved / 2) },
      { productId: seed.id, warehouseId: "wh_3", onHand: seed.anatolia, reserved: 0 }
    ],
    locations: [
      { productId: seed.id, warehouseId: "wh_1", rackNo: `A${(index % 6) + 1}`, locationCode: `M-A${(index % 6) + 1}-${String(index + 1).padStart(2, "0")}` },
      { productId: seed.id, warehouseId: "wh_2", rackNo: `B${(index % 5) + 1}`, locationCode: `E-B${(index % 5) + 1}-${String(index + 2).padStart(2, "0")}` },
      { productId: seed.id, warehouseId: "wh_3", rackNo: `C${(index % 4) + 1}`, locationCode: `A-C${(index % 4) + 1}-${String(index + 3).padStart(2, "0")}` }
    ],
    priceTiers: [
      { productId: seed.id, slotNumber: 1, currency: "TRY", amount: base, active: true },
      { productId: seed.id, slotNumber: 2, currency: "TRY", amount: Math.round(base * 0.93), active: true },
      { productId: seed.id, slotNumber: 3, currency: "TRY", amount: Math.round(base * 0.89), active: true },
      { productId: seed.id, slotNumber: 4, currency: "TRY", amount: Math.round(base * 0.86), active: true },
      { productId: seed.id, slotNumber: 5, currency: "USD", amount: Math.round((base / 38.45) * 10) / 10, active: false },
      { productId: seed.id, slotNumber: 6, currency: "EUR", amount: Math.round((base / 41.6) * 10) / 10, active: false }
    ],
    factoryStockSummary: { totalStock: seed.factoryStock, lastSyncedAt: seed.sync === "not_connected" ? null : seed.sync === "stale" ? "2026-04-28T05:30:00.000Z" : "2026-04-28T09:45:00.000Z", syncStatus: seed.sync }
  };
}

export const products = seeds.map(productFromSeed);
export const customerPricingProfiles: CustomerPricingProfile[] = customers.map((customer) => customer.pricingProfile);

export const stockCatalog = {
  products,
  brands,
  factories,
  warehouses,
  categorySlots: demoCategorySlots,
  priceSlots: demoPriceSlots,
  exchangeRates: demoExchangeRates,
  exchangeRatePolicy: demoExchangeRatePolicy,
  customerPricingProfiles
};

