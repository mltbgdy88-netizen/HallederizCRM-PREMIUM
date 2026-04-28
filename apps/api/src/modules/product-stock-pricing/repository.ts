import type {
  CategorySlotConfig,
  ExchangeRatePolicy,
  PriceSlotConfig,
  Product
} from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";
import { buildRepositoryRuntime } from "../../shared/db-runtime";
import {
  createProduct,
  getCategorySlots,
  getCurrentExchangeRates,
  getPriceSlots,
  getProductAvailability,
  getProductById,
  getStockLookupOptions,
  listProducts,
  patchCategorySlots,
  patchExchangeRatePolicy,
  patchPriceSlots,
  patchProduct
} from "../../product-stock-pricing/mock-store";

type Row = Record<string, unknown>;
const asString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const asNumber = (value: unknown, fallback = 0) => (typeof value === "number" ? value : fallback);
const asBoolean = (value: unknown, fallback = false) => (typeof value === "boolean" ? value : fallback);

export class ProductStockPricingRepository {
  constructor(private readonly context: RequestContext) {}

  private runtime() {
    return buildRepositoryRuntime(this.context);
  }

  async listProducts(filters: Parameters<typeof listProducts>[0]) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return listProducts(filters);
    try {
      const rows = await runtime.executor.query<Row>(
        `select id, tenant_id, code, name, brand_id, collection_id, factory_id, manufacturer_integration_code,
                default_source, is_active, critical_stock_level, primary_barcode, qr_code_value
         from products
         where tenant_id = $1
           and ($2::text is null or code ilike $2 or name ilike $2)
         order by code asc`,
        [this.context.tenantId, filters.query ? `%${filters.query}%` : null]
      );
      const mock = listProducts(filters);
      const mockById = new Map(mock.map((item) => [item.id, item]));
      return rows.flatMap((row) => {
        const id = asString(row.id);
        const base = mockById.get(id);
        if (!base) {
          return [];
        }
        const mapped: Product = {
          ...base,
          id,
          tenantId: asString(row.tenant_id, this.context.tenantId),
          code: asString(row.code),
          name: asString(row.name),
          brandId: asString(row.brand_id, base.brandId),
          collectionId: asString(row.collection_id, "") || undefined,
          factoryId: asString(row.factory_id, "") || undefined,
          manufacturerIntegrationCode: asString(row.manufacturer_integration_code, "") || undefined,
          defaultSource: asString(row.default_source, "warehouse") as Product["defaultSource"],
          active: asBoolean(row.is_active, true),
          criticalStockLevel: asNumber(row.critical_stock_level, 0),
          primaryBarcode: asString(row.primary_barcode, ""),
          qrCodeValue: asString(row.qr_code_value, "")
        };
        return [mapped];
      });
    } catch {
      return listProducts(filters);
    }
  }

  async getProductById(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getProductById(id);
    try {
      const rows = await runtime.executor.query<Row>(
        `select id, tenant_id, code, name, brand_id, collection_id, factory_id, manufacturer_integration_code,
                default_source, is_active, critical_stock_level, primary_barcode, qr_code_value
         from products where tenant_id = $1 and id = $2 limit 1`,
        [this.context.tenantId, id]
      );
      if (!rows[0]) return undefined;
      const base = getProductById(id);
      if (!base) return undefined;
      const row = rows[0];
      return {
        ...base,
        id: asString(row.id),
        tenantId: asString(row.tenant_id, this.context.tenantId),
        code: asString(row.code),
        name: asString(row.name),
        brandId: asString(row.brand_id),
        collectionId: asString(row.collection_id, undefined),
        factoryId: asString(row.factory_id, undefined),
        manufacturerIntegrationCode: asString(row.manufacturer_integration_code, undefined),
        defaultSource: asString(row.default_source, "warehouse") as Product["defaultSource"],
        active: asBoolean(row.is_active, true),
        criticalStockLevel: asNumber(row.critical_stock_level, 0),
        primaryBarcode: asString(row.primary_barcode, ""),
        qrCodeValue: asString(row.qr_code_value, "")
      } satisfies Product;
    } catch {
      return getProductById(id);
    }
  }

  createProduct(payload: Partial<Product>) {
    return createProduct(payload);
  }

  patchProduct(id: string, payload: Partial<Product>) {
    return patchProduct(id, payload);
  }

  getProductAvailability(id: string) {
    return getProductAvailability(id);
  }

  async getPriceSlots() {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getPriceSlots();
    try {
      const rows = await runtime.executor.query<Row>(
        `select slot_no, slot_name, currency, amount, is_active
         from price_slot_configs where tenant_id = $1 order by slot_no asc`,
        [this.context.tenantId]
      );
      if (rows.length === 0) return getPriceSlots();
      return rows.map((row) => ({
        slotNumber: Number(asNumber(row.slot_no, 1)) as PriceSlotConfig["slotNumber"],
        slotName: asString(row.slot_name, "Fiyat Alani"),
        currency: asString(row.currency, "TRY") as PriceSlotConfig["currency"],
        amount: asNumber(row.amount, 0),
        active: asBoolean(row.is_active, true)
      }));
    } catch {
      return getPriceSlots();
    }
  }

  patchPriceSlots(slots: PriceSlotConfig[]) {
    return patchPriceSlots(slots);
  }

  async getCategorySlots() {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getCategorySlots();
    try {
      const rows = await runtime.executor.query<Row>(
        `select slot_no, slot_name, is_active
         from category_slot_configs where tenant_id = $1 order by slot_no asc`,
        [this.context.tenantId]
      );
      if (rows.length === 0) return getCategorySlots();
      return rows.map((row) => ({
        slotNumber: Number(asNumber(row.slot_no, 1)) as CategorySlotConfig["slotNumber"],
        slotName: asString(row.slot_name, "Kategori"),
        active: asBoolean(row.is_active, true)
      }));
    } catch {
      return getCategorySlots();
    }
  }

  patchCategorySlots(slots: CategorySlotConfig[]) {
    return patchCategorySlots(slots);
  }

  getCurrentExchangeRates() {
    return getCurrentExchangeRates();
  }

  patchExchangeRatePolicy(payload: Partial<ExchangeRatePolicy>) {
    return patchExchangeRatePolicy(payload);
  }

  getStockLookupOptions() {
    return getStockLookupOptions();
  }
}
