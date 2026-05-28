import type { FastifyInstance } from "fastify";
import type {
  CategorySlotConfig,
  ExchangeRatePolicy,
  PriceSlotConfig,
  Product
} from "@hallederiz/types";
import { ProductStockPricingService } from "../modules/product-stock-pricing/service";
import { buildRequestContext } from "../shared/request-context";
import { asApiErrorPayload } from "../shared/errors";
import { assertAnyPermission, assertAuthenticated, assertTenantAccess, withGuards } from "../shared/auth-guards";
import { recordAuditEvent } from "../shared/audit-timeline";
import { readPermissions, requireReadAccess } from "../shared/read-guards";

interface ProductQuerystring {
  q?: string;
  brandId?: string;
  factoryId?: string;
  category1?: string;
  category2?: string;
  category3?: string;
  category4?: string;
  criticalOnly?: string;
  inStockOnly?: string;
}

function parseBoolean(value?: string): boolean {
  return value === "true" || value === "1";
}

export async function registerProductStockPricingRoutes(server: FastifyInstance) {
  server.get<{ Querystring: ProductQuerystring }>("/products", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.products), async (context) => {
    const service = new ProductStockPricingService(context);
    const query = request.query;
    const items = await service.listProducts({
      query: query.q,
      brandId: query.brandId,
      factoryId: query.factoryId,
      category1: query.category1,
      category2: query.category2,
      category3: query.category3,
      category4: query.category4,
      criticalOnly: parseBoolean(query.criticalOnly),
      inStockOnly: parseBoolean(query.inStockOnly)
    });

    return {
      items,
      total: items.length,
      options: service.getStockLookupOptions()
    };
  }));

  server.get<{ Params: { id: string } }>("/products/:id", async (request, reply) => {
    return withGuards(request, reply, requireReadAccess(readPermissions.products), async (context) => {
      const service = new ProductStockPricingService(context);
      const product = await service.getProductById(request.params.id);
      if (!product) {
        return reply.status(404).send({ message: "Product not found" });
      }

      return {
        item: product
      };
    });
  });

  server.post<{ Body: Partial<Product> }>("/products", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [
        assertAuthenticated,
        (context) => assertAnyPermission(context, ["products.write", "products.manage"]),
        (context) => assertTenantAccess(context, request.body?.tenantId)
      ],
      async (context) => {
        try {
          const service = new ProductStockPricingService(context);
          const product = await service.createProduct(request.body);
          recordAuditEvent(context, {
            entityType: "product",
            entityId: product.id,
            eventType: "product.created",
            title: "Urun olusturuldu",
            description: `${product.code} - ${product.name} urunu olusturuldu.`
          });
          return reply.status(201).send({ item: product });
        } catch (error) {
          const payload = asApiErrorPayload(error);
          return reply.status(payload.statusCode).send(payload.body);
        }
      }
    );
  });

  server.patch<{ Params: { id: string }; Body: Partial<Product> }>("/products/:id", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [
        assertAuthenticated,
        (context) => assertAnyPermission(context, ["products.write", "products.manage"]),
        (context) => assertTenantAccess(context, request.body?.tenantId)
      ],
      async (context) => {
        try {
          const service = new ProductStockPricingService(context);
          const product = await service.patchProduct(request.params.id, request.body);
          if (!product) {
            return reply.status(404).send({ message: "Product not found" });
          }
          recordAuditEvent(context, {
            entityType: "product",
            entityId: product.id,
            eventType: "product.updated",
            title: "Urun guncellendi",
            description: `${product.code} urunu guncellendi.`
          });

          return { item: product };
        } catch (error) {
          const payload = asApiErrorPayload(error);
          return reply.status(payload.statusCode).send(payload.body);
        }
      }
    );
  });

  server.get<{ Params: { id: string } }>("/products/:id/availability", async (request, reply) => {
    return withGuards(request, reply, requireReadAccess(readPermissions.products), async (context) => {
      const service = new ProductStockPricingService(context);
      const availability = await service.getProductAvailability(request.params.id);
      if (!availability) {
        return reply.status(404).send({ message: "Product not found" });
      }

      return availability;
    });
  });

  server.get("/price-slots", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.pricing), async (context) => {
    const service = new ProductStockPricingService(context);
    return {
      items: await service.getPriceSlots()
    };
  }));

  server.patch<{ Body: { slots: PriceSlotConfig[] } }>("/price-slots", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["products.write", "pricing.write", "pricing.manage"])],
      async (context) => {
        if (!Array.isArray(request.body?.slots) || request.body.slots.length !== 6) {
          return reply.status(400).send({ message: "Exactly 6 price slots are required." });
        }

        const service = new ProductStockPricingService(context);
        const updatedSlots = await service.patchPriceSlots(request.body.slots);
        recordAuditEvent(context, {
          entityType: "pricing",
          entityId: "price-slots",
          eventType: "pricing.price_slots.updated",
          title: "Fiyat slotlari guncellendi",
          description: "Fiyat slot ayarlari guncellendi."
        });
        return { items: updatedSlots };
      }
    );
  });

  server.get("/category-slots", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.pricing), async (context) => {
    const service = new ProductStockPricingService(context);
    return {
      items: await service.getCategorySlots()
    };
  }));

  server.patch<{ Body: { slots: CategorySlotConfig[] } }>("/category-slots", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["products.write", "pricing.write", "pricing.manage"])],
      async (context) => {
        if (!Array.isArray(request.body?.slots) || request.body.slots.length !== 4) {
          return reply.status(400).send({ message: "Exactly 4 category slots are required." });
        }

        const service = new ProductStockPricingService(context);
        const updatedSlots = await service.patchCategorySlots(request.body.slots);
        recordAuditEvent(context, {
          entityType: "pricing",
          entityId: "category-slots",
          eventType: "pricing.category_slots.updated",
          title: "Kategori slotlari guncellendi",
          description: "Kategori alan slot ayarlari guncellendi."
        });
        return { items: updatedSlots };
      }
    );
  });

  server.get("/exchange-rates/current", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.pricing), async (context) => {
    const service = new ProductStockPricingService(context);
    return service.getCurrentExchangeRates();
  }));

  server.patch<{ Body: Partial<ExchangeRatePolicy> }>("/exchange-rate-policy", async (request, reply) => {
    return withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, ["products.write", "pricing.write", "pricing.manage"])],
      async (context) => {
        const service = new ProductStockPricingService(context);
        const policy = await service.patchExchangeRatePolicy(request.body);
        recordAuditEvent(context, {
          entityType: "pricing",
          entityId: "exchange-rate-policy",
          eventType: "pricing.exchange_policy.updated",
          title: "Kur politikasi guncellendi",
          description: "Doviz kur politikasi ayarlari guncellendi."
        });
        return {
          policy
        };
      }
    );
  });
}
