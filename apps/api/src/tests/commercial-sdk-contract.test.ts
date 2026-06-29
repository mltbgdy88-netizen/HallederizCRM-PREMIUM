import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { createSession } from "../shared/session-store";
import { registerSalesCrmRoutes } from "../sales-crm/routes";
import { registerCommercialOperationsRoutes } from "../commercial-operations/routes";
import { withDemoAuth } from "./test-env";

function authHeaders(token: string, tenantId: string) {
  return {
    authorization: `Bearer ${token}`,
    "x-tenant-id": tenantId
  };
}

test("commercial create endpoints accept SDK-shaped payloads", async () => {
  await withDemoAuth(async () => {
    const server = Fastify();
    await registerSalesCrmRoutes(server);
    await registerCommercialOperationsRoutes(server);

    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const headers = authHeaders(login.accessToken, login.session.tenant.id);

    const offer = await server.inject({
      method: "POST",
      url: "/offers",
      headers,
      payload: { customerId: "customer_1", status: "draft", currency: "TRY", note: "sdk contract" }
    });
    assert.ok(offer.statusCode === 201 || offer.statusCode === 202);
    const offerBody = offer.json();
    const offerId = offerBody.item?.id ?? offerBody.approvalRequestId;
    assert.ok(offerId);

    const order = await server.inject({
      method: "POST",
      url: "/orders",
      headers,
      payload: { customerId: "customer_1", status: "draft", currency: "TRY", note: "sdk contract" }
    });
    assert.ok(order.statusCode === 201 || order.statusCode === 202);
    assert.ok(order.json().item?.id ?? order.json().approvalRequestId);

    const payment = await server.inject({
      method: "POST",
      url: "/payments",
      headers: { ...headers, "idempotency-key": "sdk_contract_payment_1" },
      payload: {
        customerId: "customer_1",
        amount: 100,
        currency: "TRY",
        method: "transfer",
        status: "draft",
        description: "sdk contract"
      }
    });
    assert.ok(payment.statusCode === 201 || payment.statusCode === 200 || payment.statusCode === 202);
    const paymentBody = payment.json();
    const paymentItemId = paymentBody.item?.id;
    assert.ok(paymentItemId || paymentBody.approvalRequestId);
    if (paymentItemId) {
      const reversals = await server.inject({
        method: "GET",
        url: `/payments/${paymentItemId}/reversals`,
        headers
      });
      assert.equal(reversals.statusCode, 200);
      assert.ok(Array.isArray(reversals.json().items));
    }

    await server.close();
  });
});
