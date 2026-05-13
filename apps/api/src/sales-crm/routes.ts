import type { FastifyInstance } from "fastify";
import type { Customer, CustomerAddress, CustomerContact, CustomerPricingProfile, Offer, OfferFollowUp, OfferLine } from "@hallederiz/types";
import { SalesCrmService } from "../modules/sales-crm/service";
import { buildRequestContext } from "../shared/request-context";
import { asApiErrorPayload } from "../shared/errors";
import { assertAnyPermission, assertAuthenticated, assertTenantAccess, withGuards } from "../shared/auth-guards";
import { recordAuditEvent } from "../shared/audit-timeline";
import { readPermissions, requireReadAccess } from "../shared/read-guards";
import { enforcePolicyForRoute } from "../shared/policy-route-enforcement";

export async function registerSalesCrmRoutes(server: FastifyInstance) {
  server.get("/customers", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.customers), async (context) => {
    const service = new SalesCrmService(context);
    const items = await service.listCustomers();
    return { items, total: items.length };
  }));

  server.get<{ Params: { id: string } }>("/customers/:id", async (request, reply) => {
    return withGuards(request, reply, requireReadAccess(readPermissions.customers), async (context) => {
      const service = new SalesCrmService(context);
      const customer = await service.getCustomer(request.params.id);
      if (!customer) {
        return reply.status(404).send({ message: "Customer not found" });
      }
      return { item: customer };
    });
  });

  server.post<{ Body: Partial<Customer> }>("/customers", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertPermissionSet(context, ["customers.write", "customers.manage"]), (context) => assertTenantAccess(context, request.body?.tenantId)], async (context) => {
      const policyResult = await enforcePolicyForRoute(context, {
        actionKey: "platform.customers.create",
        requiredPermissions: ["customers.write", "customers.manage"],
        tenantId: request.body?.tenantId,
        payload: { customerCode: request.body?.code }
      });
      if (policyResult.handled) {
        return reply.status(policyResult.statusCode).send(policyResult.body);
      }

      const service = new SalesCrmService(context);
      const item = await service.createCustomer(request.body);
      recordAuditEvent(context, {
        entityType: "customer",
        entityId: item.id,
        eventType: "customer.created",
        title: "Cari kaydi olusturuldu",
        description: `${item.code} - ${item.name} olusturuldu.`
      });
      return reply.status(201).send({ item });
    });
  });

  server.patch<{ Params: { id: string }; Body: Partial<Customer> }>("/customers/:id", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertPermissionSet(context, ["customers.write", "customers.manage"]), (context) => assertTenantAccess(context, request.body?.tenantId)], async (context) => {
      const policyResult = await enforcePolicyForRoute(context, {
        actionKey: "platform.customers.update",
        requiredPermissions: ["customers.write", "customers.manage"],
        tenantId: request.body?.tenantId,
        payload: { customerId: request.params.id }
      });
      if (policyResult.handled) {
        return reply.status(policyResult.statusCode).send(policyResult.body);
      }

      const service = new SalesCrmService(context);
      try {
        const customer = await service.patchCustomer(request.params.id, request.body);
        if (!customer) {
          return reply.status(404).send({ message: "Customer not found" });
        }
        recordAuditEvent(context, {
          entityType: "customer",
          entityId: customer.id,
          eventType: "customer.updated",
          title: "Cari kaydi guncellendi",
          description: `${customer.code} kaydi guncellendi.`
        });
        return { item: customer };
      } catch (error) {
        const payload = asApiErrorPayload(error);
        return reply.status(payload.statusCode).send(payload.body);
      }
    });
  });

  server.get<{ Params: { id: string } }>("/customers/:id/account-summary", async (request, reply) => {
    return withGuards(request, reply, requireReadAccess(readPermissions.customers), async (context) => {
      const service = new SalesCrmService(context);
      const summary = await service.getAccountSummary(request.params.id);
      if (!summary) {
        return reply.status(404).send({ message: "Customer account not found" });
      }
      return { item: summary };
    });
  });

  server.get<{ Params: { id: string } }>("/customers/:id/ledger", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.customers), async (context) => {
    const service = new SalesCrmService(context);
    return { items: await service.getLedger(request.params.id) };
  }));

  server.post<{ Params: { id: string }; Body: Partial<CustomerContact> }>("/customers/:id/contacts", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertPermissionSet(context, ["customers.write", "customers.manage"])], async (context) => {
      try {
        const service = new SalesCrmService(context);
        const item = await service.addContact(request.params.id, request.body);
        recordAuditEvent(context, {
          entityType: "customer",
          entityId: request.params.id,
          eventType: "customer.contact.upserted",
          title: "Cari yetkili kisi guncellendi",
          description: `${item.fullName} yetkili kisi kaydi yazildi.`
        });
        return reply.status(201).send({ item });
      } catch (error) {
        const payload = asApiErrorPayload(error);
        return reply.status(payload.statusCode).send(payload.body);
      }
    });
  });

  server.post<{ Params: { id: string }; Body: Partial<CustomerAddress> }>("/customers/:id/addresses", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertPermissionSet(context, ["customers.write", "customers.manage"])], async (context) => {
      try {
        const service = new SalesCrmService(context);
        const item = await service.addAddress(request.params.id, request.body);
        recordAuditEvent(context, {
          entityType: "customer",
          entityId: request.params.id,
          eventType: "customer.address.upserted",
          title: "Cari adres kaydi guncellendi",
          description: `${item.title} adres kaydi yazildi.`
        });
        return reply.status(201).send({ item });
      } catch (error) {
        const payload = asApiErrorPayload(error);
        return reply.status(payload.statusCode).send(payload.body);
      }
    });
  });

  server.patch<{ Params: { id: string }; Body: Partial<CustomerPricingProfile> }>("/customers/:id/pricing-profile", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertPermissionSet(context, ["customers.write", "pricing.write"])], async (context) => {
      const service = new SalesCrmService(context);
      try {
        const customer = await service.patchPricingProfile(request.params.id, request.body);
        if (!customer) {
          return reply.status(404).send({ message: "Customer not found" });
        }
        recordAuditEvent(context, {
          entityType: "customer",
          entityId: customer.id,
          eventType: "customer.pricing_profile.updated",
          title: "Cari fiyat profili guncellendi",
          description: `${customer.code} fiyat profili guncellendi.`
        });
        return { item: customer.pricingProfile };
      } catch (error) {
        const payload = asApiErrorPayload(error);
        return reply.status(payload.statusCode).send(payload.body);
      }
    });
  });

  server.get("/offers", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.offers), async (context) => {
    const service = new SalesCrmService(context);
    const items = await service.listOffers();
    return { items, total: items.length };
  }));

  server.get<{ Params: { id: string } }>("/offers/:id", async (request, reply) => {
    return withGuards(request, reply, requireReadAccess(readPermissions.offers), async (context) => {
      const service = new SalesCrmService(context);
      const offer = await service.getOffer(request.params.id);
      if (!offer) {
        return reply.status(404).send({ message: "Offer not found" });
      }
      return { item: offer };
    });
  });

  server.post<{ Body: Partial<Offer> }>("/offers", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertPermissionSet(context, ["offers.write", "offers.manage"]), (context) => assertTenantAccess(context, request.body?.tenantId)], async (context) => {
      const policyResult = await enforcePolicyForRoute(context, {
        actionKey: "platform.offers.create",
        requiredPermissions: ["offers.write", "offers.manage"],
        tenantId: request.body?.tenantId,
        payload: { customerId: request.body?.customerId }
      });
      if (policyResult.handled) {
        return reply.status(policyResult.statusCode).send(policyResult.body);
      }

      try {
        const service = new SalesCrmService(context);
        const item = await service.createOffer(request.body);
        recordAuditEvent(context, {
          entityType: "offer",
          entityId: item.id,
          eventType: "offer.created",
          title: "Teklif olusturuldu",
          description: `${item.offerNo} olusturuldu.`
        });
        return reply.status(201).send({ item });
      } catch (error) {
        const payload = asApiErrorPayload(error);
        return reply.status(payload.statusCode).send(payload.body);
      }
    });
  });

  server.patch<{ Params: { id: string }; Body: Partial<Offer> }>("/offers/:id", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertPermissionSet(context, ["offers.write", "offers.manage"])], async (context) => {
      const service = new SalesCrmService(context);
      try {
        const offer = await service.patchOffer(request.params.id, request.body);
        if (!offer) {
          return reply.status(404).send({ message: "Offer not found" });
        }
        recordAuditEvent(context, {
          entityType: "offer",
          entityId: offer.id,
          eventType: "offer.updated",
          title: "Teklif guncellendi",
          description: `${offer.offerNo} guncellendi.`
        });
        return { item: offer };
      } catch (error) {
        const payload = asApiErrorPayload(error);
        return reply.status(payload.statusCode).send(payload.body);
      }
    });
  });

  server.post<{ Params: { id: string }; Body: Partial<OfferLine> }>("/offers/:id/lines", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertPermissionSet(context, ["offers.write", "offers.manage"])], async (context) => {
      const service = new SalesCrmService(context);
      try {
        const offer = await service.addOfferLine(request.params.id, request.body);
        if (!offer) {
          return reply.status(404).send({ message: "Offer not found" });
        }
        recordAuditEvent(context, {
          entityType: "offer",
          entityId: offer.id,
          eventType: "offer.lines.updated",
          title: "Teklif satirlari guncellendi",
          description: `${offer.offerNo} satirlari degisti.`
        });
        return reply.status(201).send({ item: offer });
      } catch (error) {
        const payload = asApiErrorPayload(error);
        return reply.status(payload.statusCode).send(payload.body);
      }
    });
  });

  server.patch<{ Params: { id: string; lineId: string }; Body: Partial<OfferLine> }>("/offers/:id/lines/:lineId", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertPermissionSet(context, ["offers.write", "offers.manage"])], async (context) => {
      const service = new SalesCrmService(context);
      try {
        const offer = await service.patchOfferLine(request.params.id, request.params.lineId, request.body);
        if (!offer) {
          return reply.status(404).send({ message: "Offer not found" });
        }
        recordAuditEvent(context, {
          entityType: "offer",
          entityId: offer.id,
          eventType: "offer.lines.updated",
          title: "Teklif satiri guncellendi",
          description: `${offer.offerNo} satir guncellemesi yapildi.`
        });
        return { item: offer };
      } catch (error) {
        const payload = asApiErrorPayload(error);
        return reply.status(payload.statusCode).send(payload.body);
      }
    });
  });

  server.post<{ Params: { id: string }; Body: Partial<OfferFollowUp> }>("/offers/:id/followups", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertPermissionSet(context, ["offers.write", "offers.manage"])], async (context) => {
      const service = new SalesCrmService(context);
      try {
        const offer = await service.addOfferFollowUp(request.params.id, request.body);
        if (!offer) {
          return reply.status(404).send({ message: "Offer not found" });
        }
        recordAuditEvent(context, {
          entityType: "offer",
          entityId: offer.id,
          eventType: "offer.followup.created",
          title: "Teklif follow-up eklendi",
          description: `${offer.offerNo} follow-up kaydi eklendi.`
        });
        return reply.status(201).send({ item: offer });
      } catch (error) {
        const payload = asApiErrorPayload(error);
        return reply.status(payload.statusCode).send(payload.body);
      }
    });
  });

  server.post<{ Params: { id: string } }>("/offers/:id/send", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertPermissionSet(context, ["offers.write", "offers.manage"])], async (context) => {
      const service = new SalesCrmService(context);
      const offer = await service.sendOffer(request.params.id);
      if (!offer) {
        return reply.status(404).send({ message: "Offer not found" });
      }
      recordAuditEvent(context, {
        entityType: "offer",
        entityId: offer.id,
        eventType: "offer.sent",
        title: "Teklif gonderildi",
        description: `${offer.offerNo} musteriye gonderildi.`
      });
      return { item: offer };
    });
  });

  server.post<{ Params: { id: string } }>("/offers/:id/convert-to-order", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertPermissionSet(context, ["offers.write", "orders.write"])], async (context) => {
      const service = new SalesCrmService(context);
      const draft = await service.convertOffer(request.params.id);
      if (!draft) {
        return reply.status(404).send({ message: "Offer not found" });
      }
      recordAuditEvent(context, {
        entityType: "offer",
        entityId: request.params.id,
        eventType: "offer.converted_to_order_draft",
        title: "Teklif siparis taslagina donusturuldu",
        description: `${request.params.id} teklifinden siparis taslagi uretildi.`
      });
      return { item: draft };
    });
  });
}

function assertPermissionSet(context: ReturnType<typeof buildRequestContext>, permissions: string[]) {
  assertAnyPermission(context, permissions);
}
