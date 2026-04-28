import type { FastifyInstance } from "fastify";
import type { Customer, CustomerAddress, CustomerContact, CustomerPricingProfile, Offer, OfferFollowUp, OfferLine } from "@hallederiz/types";
import {
  addAddress,
  addContact,
  addOfferFollowUp,
  addOfferLine,
  convertOffer,
  createCustomer,
  createOffer,
  getAccountSummary,
  getCustomer,
  getLedger,
  getOffer,
  listCustomers,
  listOffers,
  patchCustomer,
  patchOffer,
  patchOfferLine,
  patchPricingProfile,
  sendOffer
} from "./mock-store";

export async function registerSalesCrmRoutes(server: FastifyInstance) {
  server.get("/customers", async () => ({ items: listCustomers(), total: listCustomers().length }));

  server.get<{ Params: { id: string } }>("/customers/:id", async (request, reply) => {
    const customer = getCustomer(request.params.id);
    if (!customer) {
      return reply.status(404).send({ message: "Customer not found" });
    }
    return { item: customer };
  });

  server.post<{ Body: Partial<Customer> }>("/customers", async (request, reply) => {
    return reply.status(201).send({ item: createCustomer(request.body) });
  });

  server.patch<{ Params: { id: string }; Body: Partial<Customer> }>("/customers/:id", async (request, reply) => {
    const customer = patchCustomer(request.params.id, request.body);
    if (!customer) {
      return reply.status(404).send({ message: "Customer not found" });
    }
    return { item: customer };
  });

  server.get<{ Params: { id: string } }>("/customers/:id/account-summary", async (request, reply) => {
    const summary = getAccountSummary(request.params.id);
    if (!summary) {
      return reply.status(404).send({ message: "Customer account not found" });
    }
    return { item: summary };
  });

  server.get<{ Params: { id: string } }>("/customers/:id/ledger", async (request) => ({
    items: getLedger(request.params.id)
  }));

  server.post<{ Params: { id: string }; Body: Partial<CustomerContact> }>("/customers/:id/contacts", async (request, reply) => {
    return reply.status(201).send({ item: addContact(request.params.id, request.body) });
  });

  server.post<{ Params: { id: string }; Body: Partial<CustomerAddress> }>("/customers/:id/addresses", async (request, reply) => {
    return reply.status(201).send({ item: addAddress(request.params.id, request.body) });
  });

  server.patch<{ Params: { id: string }; Body: Partial<CustomerPricingProfile> }>("/customers/:id/pricing-profile", async (request, reply) => {
    const customer = patchPricingProfile(request.params.id, request.body);
    if (!customer) {
      return reply.status(404).send({ message: "Customer not found" });
    }
    return { item: customer.pricingProfile };
  });

  server.get("/offers", async () => ({ items: listOffers(), total: listOffers().length }));

  server.get<{ Params: { id: string } }>("/offers/:id", async (request, reply) => {
    const offer = getOffer(request.params.id);
    if (!offer) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return { item: offer };
  });

  server.post<{ Body: Partial<Offer> }>("/offers", async (request, reply) => {
    return reply.status(201).send({ item: createOffer(request.body) });
  });

  server.patch<{ Params: { id: string }; Body: Partial<Offer> }>("/offers/:id", async (request, reply) => {
    const offer = patchOffer(request.params.id, request.body);
    if (!offer) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return { item: offer };
  });

  server.post<{ Params: { id: string }; Body: Partial<OfferLine> }>("/offers/:id/lines", async (request, reply) => {
    const offer = addOfferLine(request.params.id, request.body);
    if (!offer) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return reply.status(201).send({ item: offer });
  });

  server.patch<{ Params: { id: string; lineId: string }; Body: Partial<OfferLine> }>("/offers/:id/lines/:lineId", async (request, reply) => {
    const offer = patchOfferLine(request.params.id, request.params.lineId, request.body);
    if (!offer) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return { item: offer };
  });

  server.post<{ Params: { id: string }; Body: Partial<OfferFollowUp> }>("/offers/:id/followups", async (request, reply) => {
    const offer = addOfferFollowUp(request.params.id, request.body);
    if (!offer) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return reply.status(201).send({ item: offer });
  });

  server.post<{ Params: { id: string } }>("/offers/:id/send", async (request, reply) => {
    const offer = sendOffer(request.params.id);
    if (!offer) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return { item: offer };
  });

  server.post<{ Params: { id: string } }>("/offers/:id/convert-to-order", async (request, reply) => {
    const draft = convertOffer(request.params.id);
    if (!draft) {
      return reply.status(404).send({ message: "Offer not found" });
    }
    return { item: draft };
  });
}
