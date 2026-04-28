import test from "node:test";
import assert from "node:assert/strict";
import { SalesCrmService } from "../modules/sales-crm/service";
import { ProductStockPricingService } from "../modules/product-stock-pricing/service";
import { CommercialCoreService } from "../modules/commercial-core/service";
import { ConcurrencyConflictError, assertOptimisticConcurrency } from "../shared/errors";
import type { RequestContext } from "../shared/request-context";

const context: RequestContext = {
  tenantId: "tenant_1",
  userId: "user_admin",
  persistenceMode: "demo"
};

test("customers write foundation: create + update + pricing profile", async () => {
  const service = new SalesCrmService(context);
  const created = await service.createCustomer({
    code: "CUS-TST-01",
    name: "Test Cari",
    phone: "05000000000",
    city: "Istanbul"
  });
  assert.ok(created.id);
  const updated = await service.patchCustomer(created.id, { name: "Test Cari Guncel" });
  assert.equal(updated?.name, "Test Cari Guncel");
  const pricingUpdated = await service.patchPricingProfile(created.id, { selectedPriceSlotNo: 3 });
  assert.equal(pricingUpdated?.pricingProfile.selectedPriceSlotNo, 3);
});

test("products write foundation: create + update aggregate", async () => {
  const service = new ProductStockPricingService(context);
  const created = await service.createProduct({
    code: "PRD-TST-01",
    name: "Test Urun",
    primaryBarcode: "8690009990001",
    barcodeAliases: [{ id: "a1", productId: "tmp", value: "TST-ALIAS", normalizedValue: "TSTALIAS" }],
    categoryValues: [{ productId: "tmp", slotNumber: 1, value: "Doku Test" }],
    priceTiers: [{ productId: "tmp", slotNumber: 1, currency: "TRY", amount: 100, active: true }],
    locations: [{ productId: "tmp", warehouseId: "wh_1", rackNo: "R1", locationCode: "L1" }]
  });
  assert.ok(created.id);
  const updated = await service.patchProduct(created.id, { name: "Test Urun Guncel" });
  assert.equal(updated?.name, "Test Urun Guncel");
});

test("offers write foundation: create with lines + follow-up", async () => {
  const service = new SalesCrmService(context);
  const created = await service.createOffer({
    customerId: "customer_1",
    priceSlotNoSnapshot: 1,
    priceSlotLabelSnapshot: "Perakende",
    lines: [
      {
        id: "ol_t_1",
        offerId: "tmp",
        productId: "prod_1",
        productCode: "DK-1001",
        productName: "Linen Soft Ivory",
        quantity: 2,
        unitPrice: 100,
        currency: "TRY",
        exchangeRate: 1,
        discountPercent: 0,
        lineTotal: 200,
        priceSlotNo: 1,
        priceSlotLabelSnapshot: "Perakende",
        sourcePreference: "warehouse",
        centerStockSnapshot: 10,
        factoryStockSnapshot: 20,
        priceOverride: false
      }
    ]
  });
  assert.ok(created.id);
  const withFollowup = await service.addOfferFollowUp(created.id, {
    note: "Arama planlandi",
    contactChannel: "phone",
    responseState: "planned"
  });
  assert.ok((withFollowup?.followUps.length ?? 0) > 0);
});

test("orders write foundation: create + line update + sourcing", async () => {
  const service = new CommercialCoreService(context);
  const created = await service.createOrder({
    customerId: "customer_1",
    lines: [
      {
        id: "sl_t_1",
        orderId: "tmp",
        productId: "prod_1",
        productCode: "DK-1001",
        productName: "Linen Soft Ivory",
        quantity: 1,
        unitPrice: 100,
        currency: "TRY",
        exchangeRate: 1,
        tlUnitPrice: 100,
        lineTotal: 100,
        tlLineTotal: 100,
        priceSlotNo: 1,
        priceSlotLabelSnapshot: "Perakende",
        sourcePreference: "auto",
        centerStockSnapshot: 5,
        factoryStockSnapshot: 10,
        preparedQuantity: 0,
        deliveredQuantity: 0
      }
    ]
  });
  assert.ok(created.id);
  const planned = await service.planSourcing(created.id);
  assert.ok((planned?.sourcePlans.length ?? 0) >= 1);
});

test("concurrency foundation: stale update throws conflict", () => {
  assert.throws(
    () =>
      assertOptimisticConcurrency({
        expectedUpdatedAt: "2026-01-01T10:00:00.000Z",
        currentUpdatedAt: "2026-01-01T11:00:00.000Z",
        resource: "offer",
        resourceId: "offer_1"
      }),
    (error: unknown) => error instanceof ConcurrencyConflictError
  );
});
