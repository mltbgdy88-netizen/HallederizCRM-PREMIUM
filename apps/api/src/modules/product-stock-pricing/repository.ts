import { findBarcodeConflict, normalizeBarcode, resolveProductAvailability } from "@hallederiz/domain";
import type {
  CategorySlotConfig,
  ExchangeRatePolicy,
  PriceSlotConfig,
  Product,
  ProductBarcodeAlias,
  ProductCategoryValue,
  ProductLocation,
  ProductPriceTier,
  WarehouseStock
} from "@hallederiz/types";
import type { QueryExecutor } from "@hallederiz/database";
import { ApiDomainError, assertOptimisticConcurrency } from "../../shared/errors";
import type { RequestContext } from "../../shared/request-context";
import { buildRepositoryRuntime } from "../../shared/db-runtime";
import {
  brands,
  createProduct,
  factories,
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
  patchProduct,
  warehouses
} from "../../product-stock-pricing/mock-store";

type Row = Record<string, unknown>;
const asString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const asNumber = (value: unknown, fallback = 0) => (typeof value === "number" ? value : fallback);
const asBoolean = (value: unknown, fallback = false) => (typeof value === "boolean" ? value : fallback);
const nowId = (prefix: string) => `${prefix}_${Date.now()}`;
const nowIso = () => new Date().toISOString();

function mapProductCoreRow(row: Row): Product {
  return {
    id: asString(row.id),
    tenantId: asString(row.tenant_id, "tenant_1"),
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
    qrCodeValue: asString(row.qr_code_value, ""),
    barcodeAliases: [],
    categoryValues: [],
    warehouseStocks: [],
    locations: [],
    priceTiers: [],
    factoryStockSummary: {
      totalStock: 0,
      lastSyncedAt: null,
      syncStatus: "not_connected"
    }
  };
}

function ensurePriceSlot(value: number): number {
  return Math.max(1, Math.min(6, Math.trunc(value || 1)));
}
function ensureCategorySlot(value: number): number {
  return Math.max(1, Math.min(4, Math.trunc(value || 1)));
}

export class ProductStockPricingRepository {
  constructor(private readonly context: RequestContext) {}

  private runtime() {
    return buildRepositoryRuntime(this.context);
  }

  private async loadProductAggregate(executor: QueryExecutor, id: string): Promise<Product | undefined> {
    const coreRow = (await executor.query<Row>(`select * from products where tenant_id = $1 and id = $2 limit 1`, [this.context.tenantId, id]))[0];
    if (!coreRow) return undefined;
    const [aliasRows, categoryRows, tierRows, locationRows, stockRows] = await Promise.all([
      executor.query<Row>(`select * from product_barcode_aliases where tenant_id = $1 and product_id = $2`, [this.context.tenantId, id]),
      executor.query<Row>(`select * from product_category_values where tenant_id = $1 and product_id = $2`, [this.context.tenantId, id]),
      executor.query<Row>(`select * from product_price_tiers where tenant_id = $1 and product_id = $2`, [this.context.tenantId, id]),
      executor.query<Row>(`select * from product_locations where tenant_id = $1 and product_id = $2`, [this.context.tenantId, id]),
      executor.query<Row>(`select * from warehouse_stocks where tenant_id = $1 and product_id = $2`, [this.context.tenantId, id])
    ]);

    const product = mapProductCoreRow(coreRow);
    product.barcodeAliases = aliasRows.map((row) => ({
      id: asString(row.id),
      productId: asString(row.product_id),
      value: asString(row.value),
      normalizedValue: asString(row.normalized_value)
    }));
    product.categoryValues = categoryRows.map((row) => ({
      productId: asString(row.product_id),
      slotNumber: ensureCategorySlot(asNumber(row.slot_no, 1)) as ProductCategoryValue["slotNumber"],
      value: asString(row.value)
    }));
    product.priceTiers = tierRows.map((row) => ({
      productId: asString(row.product_id),
      slotNumber: ensurePriceSlot(asNumber(row.slot_no, 1)) as ProductPriceTier["slotNumber"],
      currency: asString(row.currency, "TRY") as ProductPriceTier["currency"],
      amount: asNumber(row.amount, 0),
      active: asBoolean(row.is_active, true)
    }));
    product.locations = locationRows.map((row) => ({
      productId: asString(row.product_id),
      warehouseId: asString(row.warehouse_id),
      rackNo: asString(row.rack_no, ""),
      locationCode: asString(row.location_code, "")
    }));
    product.warehouseStocks = stockRows.map((row) => ({
      productId: asString(row.product_id),
      warehouseId: asString(row.warehouse_id),
      onHand: asNumber(row.on_hand, 0),
      reserved: asNumber(row.reserved, 0)
    }));

    const factoryTotal = product.warehouseStocks.reduce((total, stock) => total + stock.onHand, 0);
    product.factoryStockSummary = {
      totalStock: factoryTotal,
      lastSyncedAt: null,
      syncStatus: "not_connected"
    };

    return product;
  }

  private async replaceProductAliasesTx(tx: QueryExecutor, productId: string, aliases: ProductBarcodeAlias[]) {
    await tx.query(`delete from product_barcode_aliases where tenant_id = $1 and product_id = $2`, [this.context.tenantId, productId]);
    for (const alias of aliases) {
      await tx.query(
        `insert into product_barcode_aliases (id, tenant_id, product_id, value, normalized_value) values ($1,$2,$3,$4,$5)`,
        [alias.id, this.context.tenantId, productId, alias.value, alias.normalizedValue || normalizeBarcode(alias.value)]
      );
    }
  }

  private async replaceProductCategoriesTx(tx: QueryExecutor, productId: string, categories: ProductCategoryValue[]) {
    await tx.query(`delete from product_category_values where tenant_id = $1 and product_id = $2`, [this.context.tenantId, productId]);
    for (const category of categories) {
      if (ensureCategorySlot(category.slotNumber) !== category.slotNumber) {
        throw new ApiDomainError("validation_error", "Kategori slot numarasi 1-4 araliginda olmali.");
      }
      await tx.query(
        `insert into product_category_values (id, tenant_id, product_id, slot_no, value) values ($1,$2,$3,$4,$5)`,
        [nowId("pcv"), this.context.tenantId, productId, category.slotNumber, category.value]
      );
    }
  }

  private async replaceProductTiersTx(tx: QueryExecutor, productId: string, tiers: ProductPriceTier[]) {
    await tx.query(`delete from product_price_tiers where tenant_id = $1 and product_id = $2`, [this.context.tenantId, productId]);
    for (const tier of tiers) {
      if (ensurePriceSlot(tier.slotNumber) !== tier.slotNumber) {
        throw new ApiDomainError("validation_error", "Fiyat slot numarasi 1-6 araliginda olmali.");
      }
      await tx.query(
        `insert into product_price_tiers (id, tenant_id, product_id, slot_no, currency, amount, is_active) values ($1,$2,$3,$4,$5,$6,$7)`,
        [nowId("ppt"), this.context.tenantId, productId, tier.slotNumber, tier.currency, tier.amount, tier.active]
      );
    }
  }

  private async replaceProductLocationsTx(tx: QueryExecutor, productId: string, locations: ProductLocation[]) {
    await tx.query(`delete from product_locations where tenant_id = $1 and product_id = $2`, [this.context.tenantId, productId]);
    for (const location of locations) {
      await tx.query(
        `insert into product_locations (id, tenant_id, product_id, warehouse_id, rack_no, location_code) values ($1,$2,$3,$4,$5,$6)`,
        [nowId("pl"), this.context.tenantId, productId, location.warehouseId, location.rackNo || null, location.locationCode || null]
      );
    }
  }

  private async upsertWarehouseStocksFoundationTx(tx: QueryExecutor, productId: string, stocks: WarehouseStock[]) {
    await tx.query(`delete from warehouse_stocks where tenant_id = $1 and product_id = $2`, [this.context.tenantId, productId]);
    for (const stock of stocks) {
      await tx.query(
        `insert into warehouse_stocks (id, tenant_id, product_id, warehouse_id, on_hand, reserved)
         values ($1,$2,$3,$4,$5,$6)`,
        [nowId("ws"), this.context.tenantId, productId, stock.warehouseId, stock.onHand, stock.reserved]
      );
    }
  }

  async listProducts(filters: Parameters<typeof listProducts>[0]) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return listProducts(filters);
    try {
      const rows = await runtime.executor.query<Row>(
        `select id from products
         where tenant_id = $1 and ($2::text is null or code ilike $2 or name ilike $2)
         order by code asc`,
        [this.context.tenantId, filters.query ? `%${filters.query}%` : null]
      );
      const products: Product[] = [];
      for (const row of rows) {
        const product = await this.loadProductAggregate(runtime.executor, asString(row.id));
        if (product) products.push(product);
      }
      return products;
    } catch (error) {
      runtime.handleDbFailure(error);
      return listProducts(filters);
    }
  }

  async getProductById(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getProductById(id);
    try {
      return await this.loadProductAggregate(runtime.executor, id);
    } catch (error) {
      runtime.handleDbFailure(error);
      return getProductById(id);
    }
  }

  async createProduct(payload: Partial<Product>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return createProduct(payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const id = payload.id ?? nowId("product");
        const allExisting = await this.listProducts({ query: undefined });
        const nextProductLike = {
          ...createProduct({}),
          ...payload,
          id,
          barcodeAliases: payload.barcodeAliases ?? [],
          primaryBarcode: payload.primaryBarcode ?? "",
          qrCodeValue: payload.qrCodeValue ?? ""
        } as Product;
        const conflict = findBarcodeConflict({ products: allExisting, value: nextProductLike.primaryBarcode, excludeProductId: id });
        if (nextProductLike.primaryBarcode && conflict) {
          throw new ApiDomainError("validation_error", `Barkod cakismasi: ${conflict.productCode}`);
        }

        await tx.query(
          `insert into products
           (id, tenant_id, code, name, brand_id, collection_id, factory_id, manufacturer_integration_code, default_source, is_active, critical_stock_level, primary_barcode, qr_code_value, created_at, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          [
            id,
            this.context.tenantId,
            payload.code ?? `PRD-${Date.now().toString().slice(-6)}`,
            payload.name ?? "Yeni Urun",
            payload.brandId ?? brands[0]?.id ?? "brand_1",
            payload.collectionId ?? null,
            payload.factoryId ?? factories[0]?.id ?? "factory_1",
            payload.manufacturerIntegrationCode ?? null,
            payload.defaultSource ?? "warehouse",
            payload.active ?? true,
            payload.criticalStockLevel ?? 0,
            payload.primaryBarcode ?? null,
            payload.qrCodeValue ?? null,
            nowIso(),
            nowIso()
          ]
        );

        await this.replaceProductAliasesTx(tx, id, payload.barcodeAliases ?? []);
        await this.replaceProductCategoriesTx(tx, id, payload.categoryValues ?? []);
        await this.replaceProductTiersTx(tx, id, payload.priceTiers ?? []);
        await this.replaceProductLocationsTx(tx, id, payload.locations ?? []);
        await this.upsertWarehouseStocksFoundationTx(tx, id, payload.warehouseStocks ?? []);

        const aggregate = await this.loadProductAggregate(tx, id);
        if (!aggregate) throw new ApiDomainError("validation_error", "Urun olusturuldu ancak okunamadi.");
        return aggregate;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      runtime.handleDbFailure(error);
      return createProduct(payload);
    }
  }

  async patchProduct(id: string, payload: Partial<Product>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return patchProduct(id, payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const existing = await this.loadProductAggregate(tx, id);
        if (!existing) return null;

        const dbRow = (
          await tx.query<Row>(`select updated_at from products where tenant_id = $1 and id = $2 limit 1`, [this.context.tenantId, id])
        )[0];
        assertOptimisticConcurrency({
          expectedUpdatedAt: (payload as { updatedAt?: string }).updatedAt,
          currentUpdatedAt: asString(dbRow?.updated_at, undefined),
          resource: "product",
          resourceId: id
        });

        const allExisting = await this.listProducts({ query: undefined });
        const candidate = { ...existing, ...payload };
        const conflict = findBarcodeConflict({ products: allExisting, value: candidate.primaryBarcode, excludeProductId: id });
        if (candidate.primaryBarcode && conflict) {
          throw new ApiDomainError("validation_error", `Barkod cakismasi: ${conflict.productCode}`);
        }

        await tx.query(
          `update products set
             code = coalesce($3, code),
             name = coalesce($4, name),
             brand_id = coalesce($5, brand_id),
             collection_id = coalesce($6, collection_id),
             factory_id = coalesce($7, factory_id),
             manufacturer_integration_code = coalesce($8, manufacturer_integration_code),
             default_source = coalesce($9, default_source),
             is_active = coalesce($10, is_active),
             critical_stock_level = coalesce($11, critical_stock_level),
             primary_barcode = coalesce($12, primary_barcode),
             qr_code_value = coalesce($13, qr_code_value),
             updated_at = $14
           where tenant_id = $1 and id = $2`,
          [
            this.context.tenantId,
            id,
            payload.code ?? null,
            payload.name ?? null,
            payload.brandId ?? null,
            payload.collectionId ?? null,
            payload.factoryId ?? null,
            payload.manufacturerIntegrationCode ?? null,
            payload.defaultSource ?? null,
            payload.active ?? null,
            payload.criticalStockLevel ?? null,
            payload.primaryBarcode ?? null,
            payload.qrCodeValue ?? null,
            nowIso()
          ]
        );

        await this.replaceProductAliasesTx(tx, id, payload.barcodeAliases ?? existing.barcodeAliases);
        await this.replaceProductCategoriesTx(tx, id, payload.categoryValues ?? existing.categoryValues);
        await this.replaceProductTiersTx(tx, id, payload.priceTiers ?? existing.priceTiers);
        await this.replaceProductLocationsTx(tx, id, payload.locations ?? existing.locations);
        await this.upsertWarehouseStocksFoundationTx(tx, id, payload.warehouseStocks ?? existing.warehouseStocks);

        return this.loadProductAggregate(tx, id) ?? null;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      runtime.handleDbFailure(error);
      return patchProduct(id, payload);
    }
  }

  async getProductAvailability(id: string) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getProductAvailability(id);
    const product = await this.getProductById(id);
    if (!product) return null;
    const availability = resolveProductAvailability({ product, warehouses });
    return {
      productId: product.id,
      ...availability
    };
  }

  async getPriceSlots() {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getPriceSlots();
    try {
      const rows = await runtime.executor.query<Row>(`select slot_no, name, currency, is_active from price_slot_configs where tenant_id = $1 order by slot_no asc`, [this.context.tenantId]);
      if (!rows.length) return getPriceSlots();
      return rows.map((row) => ({
        slotNumber: ensurePriceSlot(asNumber(row.slot_no, 1)) as PriceSlotConfig["slotNumber"],
        slotName: asString(row.name, "Fiyat"),
        currency: asString(row.currency, "TRY") as PriceSlotConfig["currency"],
        amount: 0,
        active: asBoolean(row.is_active, true)
      }));
    } catch (error) {
      runtime.handleDbFailure(error);
      return getPriceSlots();
    }
  }

  async patchPriceSlots(slots: PriceSlotConfig[]) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return patchPriceSlots(slots);
    try {
      return await runtime.executor.transaction(async (tx) => {
        await tx.query(`delete from price_slot_configs where tenant_id = $1`, [this.context.tenantId]);
        for (const slot of slots) {
          await tx.query(
            `insert into price_slot_configs (id, tenant_id, slot_no, name, currency, is_active) values ($1,$2,$3,$4,$5,$6)`,
            [nowId("psc"), this.context.tenantId, slot.slotNumber, slot.slotName, slot.currency, slot.active]
          );
        }
        return slots;
      });
    } catch (error) {
      runtime.handleDbFailure(error);
      return patchPriceSlots(slots);
    }
  }

  async getCategorySlots() {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getCategorySlots();
    try {
      const rows = await runtime.executor.query<Row>(`select slot_no, name, is_active from category_slot_configs where tenant_id = $1 order by slot_no asc`, [this.context.tenantId]);
      if (!rows.length) return getCategorySlots();
      return rows.map((row) => ({
        slotNumber: ensureCategorySlot(asNumber(row.slot_no, 1)) as CategorySlotConfig["slotNumber"],
        slotName: asString(row.name, "Kategori"),
        active: asBoolean(row.is_active, true)
      }));
    } catch (error) {
      runtime.handleDbFailure(error);
      return getCategorySlots();
    }
  }

  async patchCategorySlots(slots: CategorySlotConfig[]) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return patchCategorySlots(slots);
    try {
      return await runtime.executor.transaction(async (tx) => {
        await tx.query(`delete from category_slot_configs where tenant_id = $1`, [this.context.tenantId]);
        for (const slot of slots) {
          await tx.query(
            `insert into category_slot_configs (id, tenant_id, slot_no, name, is_active) values ($1,$2,$3,$4,$5)`,
            [nowId("csc"), this.context.tenantId, slot.slotNumber, slot.slotName, slot.active]
          );
        }
        return slots;
      });
    } catch (error) {
      runtime.handleDbFailure(error);
      return patchCategorySlots(slots);
    }
  }

  getCurrentExchangeRates() {
    return getCurrentExchangeRates();
  }

  async patchExchangeRatePolicy(payload: Partial<ExchangeRatePolicy>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return patchExchangeRatePolicy(payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const id = "erp_1";
        await tx.query(
          `insert into exchange_rate_policies (id, tenant_id, base_currency, use_selling_rate_for_order, additional_spread_percent, rounding_precision, snapshot_on_order)
           values ($1,$2,$3,$4,$5,$6,$7)
           on conflict (id) do update set
             base_currency = excluded.base_currency,
             use_selling_rate_for_order = excluded.use_selling_rate_for_order,
             additional_spread_percent = excluded.additional_spread_percent,
             rounding_precision = excluded.rounding_precision,
             snapshot_on_order = excluded.snapshot_on_order`,
          [
            id,
            this.context.tenantId,
            payload.baseCurrency ?? "TRY",
            payload.useSellingRateForOrder ?? true,
            payload.additionalSpreadPercent ?? 0,
            payload.roundingPrecision ?? 2,
            payload.snapshotOnOrder ?? true
          ]
        );
        return {
          baseCurrency: payload.baseCurrency ?? "TRY",
          useSellingRateForOrder: payload.useSellingRateForOrder ?? true,
          additionalSpreadPercent: payload.additionalSpreadPercent ?? 0,
          roundingPrecision: payload.roundingPrecision ?? 2,
          snapshotOnOrder: payload.snapshotOnOrder ?? true
        } satisfies ExchangeRatePolicy;
      });
    } catch (error) {
      runtime.handleDbFailure(error);
      return patchExchangeRatePolicy(payload);
    }
  }

  getStockLookupOptions() {
    return getStockLookupOptions();
  }
}
