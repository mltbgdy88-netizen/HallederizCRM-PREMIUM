import type { FastifyInstance } from "fastify";
import type {
  CategorySlotConfig,
  ExchangeRatePolicy,
  PriceSlotConfig,
  Product
} from "@hallederiz/types";
import { ProductStockPricingService } from "../modules/product-stock-pricing/service";
import { buildRequestContext } from "../shared/request-context";

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
  server.get<{ Querystring: ProductQuerystring }>("/products", async (request) => {
    const service = new ProductStockPricingService(buildRequestContext(request));
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
  });

  server.get<{ Params: { id: string } }>("/products/:id", async (request, reply) => {
    const service = new ProductStockPricingService(buildRequestContext(request));
    const product = await service.getProductById(request.params.id);
    if (!product) {
      return reply.status(404).send({ message: "Product not found" });
    }

    return {
      item: product
    };
  });

  server.post<{ Body: Partial<Product> }>("/products", async (request, reply) => {
    try {
      const service = new ProductStockPricingService(buildRequestContext(request));
      const product = service.createProduct(request.body);
      return reply.status(201).send({ item: product });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      return reply.status(400).send({ message });
    }
  });

  server.patch<{ Params: { id: string }; Body: Partial<Product> }>("/products/:id", async (request, reply) => {
    try {
      const service = new ProductStockPricingService(buildRequestContext(request));
      const product = service.patchProduct(request.params.id, request.body);
      if (!product) {
        return reply.status(404).send({ message: "Product not found" });
      }

      return { item: product };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      return reply.status(400).send({ message });
    }
  });

  server.get<{ Params: { id: string } }>("/products/:id/availability", async (request, reply) => {
    const service = new ProductStockPricingService(buildRequestContext(request));
    const availability = await service.getProductAvailability(request.params.id);
    if (!availability) {
      return reply.status(404).send({ message: "Product not found" });
    }

    return availability;
  });

  server.get("/price-slots", async (request) => {
    const service = new ProductStockPricingService(buildRequestContext(request));
    return {
      items: await service.getPriceSlots()
    };
  });

  server.patch<{ Body: { slots: PriceSlotConfig[] } }>("/price-slots", async (request, reply) => {
    if (!Array.isArray(request.body?.slots) || request.body.slots.length !== 6) {
      return reply.status(400).send({ message: "Exactly 6 price slots are required." });
    }

    const service = new ProductStockPricingService(buildRequestContext(request));
    const updatedSlots = service.patchPriceSlots(request.body.slots);
    return { items: updatedSlots };
  });

  server.get("/category-slots", async (request) => {
    const service = new ProductStockPricingService(buildRequestContext(request));
    return {
      items: await service.getCategorySlots()
    };
  });

  server.patch<{ Body: { slots: CategorySlotConfig[] } }>("/category-slots", async (request, reply) => {
    if (!Array.isArray(request.body?.slots) || request.body.slots.length !== 4) {
      return reply.status(400).send({ message: "Exactly 4 category slots are required." });
    }

    const service = new ProductStockPricingService(buildRequestContext(request));
    const updatedSlots = service.patchCategorySlots(request.body.slots);
    return { items: updatedSlots };
  });

  server.get("/exchange-rates/current", async (request) => {
    const service = new ProductStockPricingService(buildRequestContext(request));
    return service.getCurrentExchangeRates();
  });

  server.patch<{ Body: Partial<ExchangeRatePolicy> }>("/exchange-rate-policy", async (request) => {
    const service = new ProductStockPricingService(buildRequestContext(request));
    return {
      policy: service.patchExchangeRatePolicy(request.body)
    };
  });
}
