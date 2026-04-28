import type { FastifyInstance } from "fastify";
import type { Customer, CustomerAddress, CustomerContact, CustomerPricingProfile, Offer, OfferFollowUp, OfferLine } from "@hallederiz/types";
import { SalesCrmService } from "../modules/sales-crm/service";
import { buildRequestContext } from "../shared/request-context";

export async function registerSalesCrmRoutes(server: FastifyInstance) {
  server.get("/customers", async (request) => {
    const service = new SalesCrmService(buildRequestContext(request));
    const items = await service.listCustomers();
    return { items, total: items.length };
  });

  server.get<{ Params: { id: string } }>("/customers/:id", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    const customer = await service.getCustomer(request.params.id);
    if (!customer) {
      return reply.status(404).send({ message: "Customer not found" });
    }
    return { item: customer };
  });

  server.post<{ Body: Partial<Customer> }>("/customers", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    return reply.status(201).send({ item: await service.createCustomer(request.body) });
  });

  server.patch<{ Params: { id: string }; Body: Partial<Customer> }>("/customers/:id", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    const customer = await service.patchCustomer(request.params.id, request.body);
    if (!customer) {
      return reply.status(404).send({ message: "Customer not found" });
    }
    return { item: customer };
  });

  server.get<{ Params: { id: string } }>("/customers/:id/account-summary", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    const summary = await service.getAccountSummary(request.params.id);
    if (!summary) {
      return reply.status(404).send({ message: "Customer account not found" });
    }
    return { item: summary };
  });

  server.get<{ Params: { id: string } }>("/customers/:id/ledger", async (request) => {
    const service = new SalesCrmService(buildRequestContext(request));
    return { items: await service.getLedger(request.params.id) };
  });

  server.post<{ Params: { id: string }; Body: Partial<CustomerContact> }>("/customers/:id/contacts", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    return reply.status(201).send({ item: service.addContact(request.params.id, request.body) });
  });

  server.post<{ Params: { id: string }; Body: Partial<CustomerAddress> }>("/customers/:id/addresses", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    return reply.status(201).send({ item: service.addAddress(request.params.id, request.body) });
  });

  server.patch<{ Params: { id: string }; Body: Partial<CustomerPricingProfile> }>("/customers/:id/pricing-profile", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    const customer = service.patchPricingProfile(request.params.id, request.body);
    if (!customer) {
      return reply.status(404).send({ message: "Customer not found" });
    }
    return { item: customer.pricingProfile };
  });

  server.get("/offers", async (request) => {
    const service = new SalesCrmService(buildRequestContext(request));
    const items = await service.listOffers();
    return { items, total: items.length };
  });

  server.get<{ Params: { id: string } }>("/offers/:id", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    const offer = await service.getOffer(request.params.id);
    if (!offer) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return { item: offer };
  });

  server.post<{ Body: Partial<Offer> }>("/offers", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    return reply.status(201).send({ item: service.createOffer(request.body) });
  });

  server.patch<{ Params: { id: string }; Body: Partial<Offer> }>("/offers/:id", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    const offer = service.patchOffer(request.params.id, request.body);
    if (!offer) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return { item: offer };
  });

  server.post<{ Params: { id: string }; Body: Partial<OfferLine> }>("/offers/:id/lines", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    const offer = service.addOfferLine(request.params.id, request.body);
    if (!offer) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return reply.status(201).send({ item: offer });
  });

  server.patch<{ Params: { id: string; lineId: string }; Body: Partial<OfferLine> }>("/offers/:id/lines/:lineId", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    const offer = service.patchOfferLine(request.params.id, request.params.lineId, request.body);
    if (!offer) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return { item: offer };
  });

  server.post<{ Params: { id: string }; Body: Partial<OfferFollowUp> }>("/offers/:id/followups", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    const offer = service.addOfferFollowUp(request.params.id, request.body);
    if (!offer) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return reply.status(201).send({ item: offer });
  });

  server.post<{ Params: { id: string } }>("/offers/:id/send", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    const offer = service.sendOffer(request.params.id);
    if (!offer) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return { item: offer };
  });

  server.post<{ Params: { id: string } }>("/offers/:id/convert-to-order", async (request, reply) => {
    const service = new SalesCrmService(buildRequestContext(request));
    const draft = service.convertOffer(request.params.id);
    if (!draft) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return { item: draft };
  });
}
