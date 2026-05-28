import test from "node:test";
import assert from "node:assert/strict";
import { CommercialCoreService } from "../modules/commercial-core/service";
import type { RequestContext } from "../shared/request-context";

const context: RequestContext = {
  tenantId: "tenant_1",
  userId: "user_admin",
  persistenceMode: "demo"
};

test("delivery flow hardening: create + validate + complete + rollback", async () => {
  const service = new CommercialCoreService(context);
  const created = await service.createDelivery({
    orderId: "order_1",
    customerId: "customer_1",
    lines: []
  });
  assert.ok(created.id);

  const validation = await service.validateDelivery(created.id);
  assert.ok(validation);

  const completed = await service.completeDelivery(created.id);
  assert.ok(completed);

  const rolledBack = await service.rollbackDelivery(created.id);
  assert.ok(rolledBack);
});

test("invoice flow hardening: create + issue + cancel", async () => {
  const service = new CommercialCoreService(context);
  const created = await service.createInvoice({
    customerId: "customer_1",
    orderId: "order_1",
    lines: []
  });
  assert.ok(created.id);

  const issued = await service.issueInvoice(created.id);
  assert.equal(issued?.status, "issued");

  const cancelled = await service.cancelInvoice(created.id);
  assert.equal(cancelled?.status, "cancelled");
});

test("return flow hardening: create + approve + complete", async () => {
  const service = new CommercialCoreService(context);
  const created = await service.createReturn({
    customerId: "customer_1",
    orderId: "order_1",
    lines: []
  });
  assert.ok(created.id);

  const approved = await service.approveReturn(created.id);
  assert.equal(approved?.status, "approved");

  const completed = await service.completeReturn(created.id);
  assert.equal(completed?.status, "completed");
});

test("document flow hardening: render + regenerate + send", async () => {
  const service = new CommercialCoreService(context);
  const rendered = await service.renderDocument({
    type: "order_pdf",
    entityType: "order",
    entityId: "order_1",
    entityNo: "SO-2481",
    customerId: "customer_1"
  });
  assert.ok(rendered.id);

  const regenerated = await service.regenerateDocument(rendered.id);
  assert.ok(regenerated);

  const sent = await service.sendDocumentEmail(rendered.id);
  assert.ok(sent);
});
