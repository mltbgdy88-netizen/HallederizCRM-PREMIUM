import type { FastifyInstance } from "fastify";
import type { Delivery, Document, Invoice, PaymentReceipt, Return, SaleOrder, SaleOrderLine, WarehouseOrder } from "@hallederiz/types";
import {
  addOrderLine,
  assignWarehouseOrder,
  approveReturn,
  cancelOrder,
  cancelInvoice,
  cancelReturn,
  cancelWarehouseOrder,
  completeDelivery,
  completeReturn,
  confirmOrder,
  confirmPayment,
  createDelivery,
  createFactoryOrders,
  createInvoice,
  createOrder,
  createPayment,
  createReturn,
  createWarehouseOrder,
  createWarehouseOrderFromOrder,
  getDelivery,
  getDocument,
  getInvoice,
  getOrder,
  getPayment,
  getPaymentAllocations,
  getReturn,
  getWarehouseOrder,
  issueInvoice,
  listDeliveries,
  listDocuments,
  listInvoices,
  listOrders,
  listPayments,
  listReturns,
  listWarehouseOrders,
  markWarehouseOrderPrepared,
  notifyDeliveryCustomer,
  patchOrder,
  patchOrderLine,
  planSourcing,
  receiveReturn,
  renderDocument,
  reversePayment,
  rollbackDelivery,
  sendDocumentEmail,
  sendDocumentWhatsApp,
  sendInvoice,
  startWarehouseOrder,
  validateDelivery
} from "./mock-store";
import { CommercialCoreService } from "../modules/commercial-core/service";
import { DocumentGenerationService } from "../modules/documents/service";
import { buildRequestContext } from "../shared/request-context";
import { asApiErrorPayload } from "../shared/errors";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../shared/auth-guards";
import { recordAuditEvent } from "../shared/audit-timeline";

export async function registerCommercialOperationsRoutes(server: FastifyInstance) {
  server.get("/orders", async (request) => {
    const service = new CommercialCoreService(buildRequestContext(request));
    const items = await service.listOrders();
    return { items, total: items.length };
  });

  server.get<{ Params: { id: string } }>("/orders/:id", async (request, reply) => {
    const service = new CommercialCoreService(buildRequestContext(request));
    const order = await service.getOrder(request.params.id);
    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }
    return { item: order };
  });

  server.post<{ Body: Partial<SaleOrder> }>("/orders", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["orders.write", "orders.manage"])], async (context) => {
      try {
        const service = new CommercialCoreService(context);
        const item = await service.createOrder(request.body);
        recordAuditEvent(context, {
          entityType: "order",
          entityId: item.id,
          eventType: "order.created",
          title: "Siparis olusturuldu",
          description: `${item.orderNo} siparisi olusturuldu.`
        });
        return reply.status(201).send({ item });
      } catch (error) {
        const payload = asApiErrorPayload(error);
        return reply.status(payload.statusCode).send(payload.body);
      }
    });
  });

  server.patch<{ Params: { id: string }; Body: Partial<SaleOrder> }>("/orders/:id", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["orders.write", "orders.manage"])], async (context) => {
      const service = new CommercialCoreService(context);
      try {
        const order = await service.patchOrder(request.params.id, request.body);
        if (!order) {
          return reply.status(404).send({ message: "Order not found" });
        }
        return { item: order };
      } catch (error) {
        const payload = asApiErrorPayload(error);
        return reply.status(payload.statusCode).send(payload.body);
      }
    });
  });

  server.post<{ Params: { id: string }; Body: Partial<SaleOrderLine> }>("/orders/:id/lines", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["orders.write", "orders.manage"])], async (context) => {
      const service = new CommercialCoreService(context);
      try {
        const order = await service.addOrderLine(request.params.id, request.body);
        if (!order) {
          return reply.status(404).send({ message: "Order not found" });
        }
        return reply.status(201).send({ item: order });
      } catch (error) {
        const payload = asApiErrorPayload(error);
        return reply.status(payload.statusCode).send(payload.body);
      }
    });
  });

  server.patch<{ Params: { id: string; lineId: string }; Body: Partial<SaleOrderLine> }>("/orders/:id/lines/:lineId", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["orders.write", "orders.manage"])], async (context) => {
      const service = new CommercialCoreService(context);
      try {
        const order = await service.patchOrderLine(request.params.id, request.params.lineId, request.body);
        if (!order) {
          return reply.status(404).send({ message: "Order not found" });
        }
        return { item: order };
      } catch (error) {
        const payload = asApiErrorPayload(error);
        return reply.status(payload.statusCode).send(payload.body);
      }
    });
  });

  server.post<{ Params: { id: string } }>("/orders/:id/confirm", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["orders.write", "orders.confirm"])], async (context) => {
      const service = new CommercialCoreService(context);
      const order = await service.confirmOrder(request.params.id);
      if (!order) {
        return reply.status(404).send({ message: "Order not found" });
      }
      return { item: order };
    });
  });

  server.post<{ Params: { id: string } }>("/orders/:id/plan-sourcing", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["orders.write", "orders.plan_sourcing"])], async (context) => {
      const service = new CommercialCoreService(context);
      const order = await service.planSourcing(request.params.id);
      if (!order) {
        return reply.status(404).send({ message: "Order not found" });
      }
      return { item: order.sourcePlans };
    });
  });

  server.post<{ Params: { id: string } }>("/orders/:id/create-warehouse-order", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["orders.write", "warehouse.write"])], async (context) => {
      const service = new CommercialCoreService(context);
      const warehouseOrder = await service.createWarehouseOrderFromOrder(request.params.id);
      if (!warehouseOrder) {
        return reply.status(404).send({ message: "Order not found" });
      }
      return reply.status(201).send({ item: warehouseOrder });
    });
  });

  server.post<{ Params: { id: string } }>("/orders/:id/create-factory-orders", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["orders.write", "integrations.write"])], async (context) => {
      const service = new CommercialCoreService(context);
      const result = service.createFactoryOrders(request.params.id);
      if (!result) {
        return reply.status(404).send({ message: "Order not found" });
      }
      return { item: result };
    });
  });

  server.post<{ Params: { id: string } }>("/orders/:id/cancel", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["orders.write", "orders.cancel"])], async (context) => {
      const service = new CommercialCoreService(context);
      const order = service.cancelOrder(request.params.id);
      if (!order) {
        return reply.status(404).send({ message: "Order not found" });
      }
      return { item: order };
    });
  });

  server.get("/payments", async (request) => {
    const service = new CommercialCoreService(buildRequestContext(request));
    const items = await service.listPayments();
    return { items, total: items.length };
  });

  server.get<{ Params: { id: string } }>("/payments/:id", async (request, reply) => {
    const service = new CommercialCoreService(buildRequestContext(request));
    const payment = service.getPayment(request.params.id);
    if (!payment) {
      return reply.status(404).send({ message: "Payment not found" });
    }
    return { item: payment };
  });

  server.post<{ Body: Partial<PaymentReceipt> }>("/payments", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["payments.write", "payments.manage"])], async (context) => {
      const service = new CommercialCoreService(context);
      const item = service.createPayment(request.body);
      recordAuditEvent(context, {
        entityType: "payment",
        entityId: item.id,
        eventType: "payment.created",
        title: "Tahsilat olusturuldu",
        description: `${item.receiptNo} tahsilat kaydi olusturuldu.`
      });
      return reply.status(201).send({ item });
    });
  });

  server.post<{ Params: { id: string } }>("/payments/:id/confirm", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["payments.write", "payments.confirm"])], async (context) => {
      const service = new CommercialCoreService(context);
      const payment = service.confirmPayment(request.params.id);
      if (!payment) {
        return reply.status(404).send({ message: "Payment not found" });
      }
      return { item: payment };
    });
  });

  server.post<{ Params: { id: string }; Body: { reason?: string } }>("/payments/:id/reverse", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["payments.write", "payments.reverse"])], async (context) => {
      const service = new CommercialCoreService(context);
      const reversal = service.reversePayment(request.params.id, request.body?.reason);
      if (!reversal) {
        return reply.status(404).send({ message: "Payment not found" });
      }
      return { item: reversal };
    });
  });

  server.get<{ Params: { id: string } }>("/payments/:id/allocations", async (request) => {
    const service = new CommercialCoreService(buildRequestContext(request));
    return { items: service.getPaymentAllocations(request.params.id) };
  });

  server.get("/warehouse-orders", async (request) => {
    const service = new CommercialCoreService(buildRequestContext(request));
    const items = await service.listWarehouseOrders();
    return { items, total: items.length };
  });

  server.get<{ Params: { id: string } }>("/warehouse-orders/:id", async (request, reply) => {
    const service = new CommercialCoreService(buildRequestContext(request));
    const warehouseOrder = service.getWarehouseOrder(request.params.id);
    if (!warehouseOrder) {
      return reply.status(404).send({ message: "Warehouse order not found" });
    }
    return { item: warehouseOrder };
  });

  server.post<{ Body: Partial<WarehouseOrder> }>("/warehouse-orders", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["warehouse.write", "warehouse.manage"])], async (context) => {
      const service = new CommercialCoreService(context);
      const item = service.createWarehouseOrder(request.body);
      recordAuditEvent(context, {
        entityType: "warehouse_order",
        entityId: item.id,
        eventType: "warehouse_order.created",
        title: "Depo emri olusturuldu",
        description: `${item.warehouseOrderNo} depo emri olusturuldu.`
      });
      return reply.status(201).send({ item });
    });
  });

  server.post<{ Params: { id: string }; Body: { assignedTo?: string } }>("/warehouse-orders/:id/assign", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["warehouse.write", "warehouse.assign"])], async (context) => {
      const service = new CommercialCoreService(context);
      const warehouseOrder = service.assignWarehouseOrder(request.params.id, request.body?.assignedTo ?? "Depo Ekibi");
      if (!warehouseOrder) {
        return reply.status(404).send({ message: "Warehouse order not found" });
      }
      return { item: warehouseOrder };
    });
  });

  server.post<{ Params: { id: string } }>("/warehouse-orders/:id/start", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["warehouse.write", "warehouse.execute"])], async (context) => {
      const service = new CommercialCoreService(context);
      const warehouseOrder = service.startWarehouseOrder(request.params.id);
      if (!warehouseOrder) {
        return reply.status(404).send({ message: "Warehouse order not found" });
      }
      return { item: warehouseOrder };
    });
  });

  server.post<{ Params: { id: string } }>("/warehouse-orders/:id/mark-prepared", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["warehouse.write", "warehouse.execute"])], async (context) => {
      const service = new CommercialCoreService(context);
      const warehouseOrder = service.markWarehouseOrderPrepared(request.params.id);
      if (!warehouseOrder) {
        return reply.status(404).send({ message: "Warehouse order not found" });
      }
      return { item: warehouseOrder };
    });
  });

  server.post<{ Params: { id: string } }>("/warehouse-orders/:id/cancel", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["warehouse.write", "warehouse.cancel"])], async (context) => {
      const service = new CommercialCoreService(context);
      const warehouseOrder = service.cancelWarehouseOrder(request.params.id);
      if (!warehouseOrder) {
        return reply.status(404).send({ message: "Warehouse order not found" });
      }
      return { item: warehouseOrder };
    });
  });

  server.get("/deliveries", async () => ({ items: listDeliveries(), total: listDeliveries().length }));
  server.get<{ Params: { id: string } }>("/deliveries/:id", async (request, reply) => {
    const delivery = getDelivery(request.params.id);
    if (!delivery) return reply.status(404).send({ message: "Delivery not found" });
    return { item: delivery };
  });
  server.post<{ Body: Partial<Delivery> }>("/deliveries", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["deliveries.write", "deliveries.manage"])], async () =>
      reply.status(201).send({ item: createDelivery(request.body) })
    )
  );
  server.post<{ Params: { id: string } }>("/deliveries/:id/validate", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["deliveries.write", "deliveries.validate"])], async () => {
      const delivery = validateDelivery(request.params.id);
      if (!delivery) return reply.status(404).send({ message: "Delivery not found" });
      return { item: delivery.validation };
    })
  );
  server.post<{ Params: { id: string } }>("/deliveries/:id/complete", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["deliveries.write", "deliveries.complete"])], async (context) => {
      const delivery = completeDelivery(request.params.id);
      if (!delivery) return reply.status(404).send({ message: "Delivery not found" });
      recordAuditEvent(context, {
        entityType: "delivery",
        entityId: delivery.id,
        eventType: "delivery.completed",
        title: "Teslimat tamamlandi",
        description: `${delivery.deliveryNo} teslimati tamamlandi.`
      });
      return { item: delivery };
    })
  );
  server.post<{ Params: { id: string } }>("/deliveries/:id/rollback", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["deliveries.write", "deliveries.rollback"])], async (context) => {
      const delivery = rollbackDelivery(request.params.id);
      if (!delivery) return reply.status(404).send({ message: "Delivery not found" });
      recordAuditEvent(context, {
        entityType: "delivery",
        entityId: delivery.id,
        eventType: "delivery.rolled_back",
        title: "Teslimat geri alindi",
        description: `${delivery.deliveryNo} teslimati rollback edildi.`
      });
      return { item: delivery };
    })
  );
  server.post<{ Params: { id: string } }>("/deliveries/:id/notify-customer", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["deliveries.write", "documents.write"])], async () => {
      const delivery = notifyDeliveryCustomer(request.params.id);
      if (!delivery) return reply.status(404).send({ message: "Delivery not found" });
      return { item: delivery };
    })
  );

  server.get("/invoices", async () => ({ items: listInvoices(), total: listInvoices().length }));
  server.get<{ Params: { id: string } }>("/invoices/:id", async (request, reply) => {
    const invoice = getInvoice(request.params.id);
    if (!invoice) return reply.status(404).send({ message: "Invoice not found" });
    return { item: invoice };
  });
  server.post<{ Body: Partial<Invoice> }>("/invoices", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["invoices.write", "documents.write"])], async (context) => {
      const item = createInvoice(request.body);
      recordAuditEvent(context, {
        entityType: "invoice",
        entityId: item.id,
        eventType: "invoice.created",
        title: "Fatura olusturuldu",
        description: `${item.invoiceNo} fatura kaydi olusturuldu.`
      });
      return reply.status(201).send({ item });
    })
  );
  server.post<{ Params: { id: string } }>("/invoices/:id/issue", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["invoices.write", "invoices.issue"])], async () => {
      const invoice = issueInvoice(request.params.id);
      if (!invoice) return reply.status(404).send({ message: "Invoice not found" });
      return { item: invoice };
    })
  );
  server.post<{ Params: { id: string } }>("/invoices/:id/cancel", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["invoices.write", "invoices.cancel"])], async () => {
      const invoice = cancelInvoice(request.params.id);
      if (!invoice) return reply.status(404).send({ message: "Invoice not found" });
      return { item: invoice };
    })
  );
  server.post<{ Params: { id: string } }>("/invoices/:id/send", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["invoices.write", "documents.write"])], async () => {
      const invoice = sendInvoice(request.params.id);
      if (!invoice) return reply.status(404).send({ message: "Invoice not found" });
      return { item: invoice };
    })
  );

  server.get("/returns", async () => ({ items: listReturns(), total: listReturns().length }));
  server.get<{ Params: { id: string } }>("/returns/:id", async (request, reply) => {
    const returnRecord = getReturn(request.params.id);
    if (!returnRecord) return reply.status(404).send({ message: "Return not found" });
    return { item: returnRecord };
  });
  server.post<{ Body: Partial<Return> }>("/returns", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["returns.write", "returns.manage"])], async (context) => {
      const item = createReturn(request.body);
      recordAuditEvent(context, {
        entityType: "return",
        entityId: item.id,
        eventType: "return.created",
        title: "Iade olusturuldu",
        description: `${item.returnNo} iade kaydi olusturuldu.`
      });
      return reply.status(201).send({ item });
    })
  );
  server.post<{ Params: { id: string } }>("/returns/:id/approve", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["returns.write", "returns.approve"])], async () => {
      const returnRecord = approveReturn(request.params.id);
      if (!returnRecord) return reply.status(404).send({ message: "Return not found" });
      return { item: returnRecord };
    })
  );
  server.post<{ Params: { id: string } }>("/returns/:id/receive", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["returns.write", "returns.receive"])], async () => {
      const returnRecord = receiveReturn(request.params.id);
      if (!returnRecord) return reply.status(404).send({ message: "Return not found" });
      return { item: returnRecord };
    })
  );
  server.post<{ Params: { id: string } }>("/returns/:id/complete", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["returns.write", "returns.complete"])], async () => {
      const returnRecord = completeReturn(request.params.id);
      if (!returnRecord) return reply.status(404).send({ message: "Return not found" });
      return { item: returnRecord };
    })
  );
  server.post<{ Params: { id: string } }>("/returns/:id/cancel", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["returns.write", "returns.cancel"])], async () => {
      const returnRecord = cancelReturn(request.params.id);
      if (!returnRecord) return reply.status(404).send({ message: "Return not found" });
      return { item: returnRecord };
    })
  );

  server.get("/documents", async () => ({ items: listDocuments(), total: listDocuments().length }));
  server.get<{ Params: { id: string } }>("/documents/:id", async (request, reply) => {
    const document = getDocument(request.params.id);
    if (!document) return reply.status(404).send({ message: "Document not found" });
    return { item: document };
  });
  server.post<{ Body: Parameters<typeof renderDocument>[0] }>("/documents/render", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["documents.write", "documents.render"])], async (context) => {
      const item = new DocumentGenerationService(context).render(request.body);
      recordAuditEvent(context, {
        entityType: "document",
        entityId: item.id,
        eventType: "document.rendered",
        title: "Belge uretildi",
        description: `${item.documentNo} belgesi olusturuldu.`
      });
      return reply.status(201).send({ item });
    })
  );
  server.post<{ Params: { id: string } }>("/documents/:id/regenerate", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["documents.write", "documents.render"])], async (context) => {
      const regenerated = new DocumentGenerationService(context).regenerate(request.params.id);
      if (!regenerated) return reply.status(404).send({ message: "Document not found" });
      recordAuditEvent(context, {
        entityType: "document",
        entityId: regenerated.id,
        eventType: "document.regenerated",
        title: "Belge yeniden olusturuldu",
        description: `${regenerated.documentNo} belgesi yeniden uretildi.`
      });
      return reply.status(201).send({ item: regenerated });
    })
  );
  server.post<{ Params: { id: string } }>("/documents/:id/send-whatsapp", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["documents.write", "integrations.write"])], async () => {
      const document = sendDocumentWhatsApp(request.params.id);
      if (!document) return reply.status(404).send({ message: "Document not found" });
      return { item: document };
    })
  );
  server.post<{ Params: { id: string } }>("/documents/:id/send-email", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["documents.write", "integrations.write"])], async () => {
      const document = sendDocumentEmail(request.params.id);
      if (!document) return reply.status(404).send({ message: "Document not found" });
      return { item: document };
    })
  );
}
