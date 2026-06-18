import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerCommercialOperationsRoutes } from "../commercial-operations/routes";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { registerQuickOperationsRoutes } from "../quick-operations/routes";
import { createSession } from "../shared/session-store";
import { withDemoAuth } from "./test-env";

async function buildServer() {
  const server = Fastify();
  await registerPlatformCoreRoutes(server);
  await registerCommercialOperationsRoutes(server);
  await registerQuickOperationsRoutes(server);
  return server;
}

function authHeaders(
  token: string,
  options?: {
    tenantId?: string;
    idempotencyKey?: string;
  }
) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`,
    ...(options?.tenantId ? { "x-tenant-id": options.tenantId } : {}),
    ...(options?.idempotencyKey ? { "idempotency-key": options.idempotencyKey } : {})
  };
}

const paymentCreatePayload = {
  customerId: "customer_1",
  amount: 500,
  method: "transfer" as const
};

const quickOperationPaymentPayload = {
  operationType: "payment",
  customerId: "customer_1",
  customerName: "MUSTERI",
  payment: { amount: 100, method: "cash", receivedAt: new Date().toISOString() },
  lines: []
};

test("cross-tenant payment detail read returns 403", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "GET",
      url: "/payments/payment_1",
      headers: authHeaders(login.accessToken, { tenantId: "tenant_other" })
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("cross-tenant payment list read returns 403", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "GET",
      url: "/payments",
      headers: authHeaders(login.accessToken, { tenantId: "tenant_other" })
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("cross-tenant payment allocations read returns 403", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "GET",
      url: "/payments/payment_1/allocations",
      headers: authHeaders(login.accessToken, { tenantId: "tenant_other" })
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("cross-tenant payment reversals read returns 403", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "GET",
      url: "/payments/payment_1/reversals",
      headers: authHeaders(login.accessToken, { tenantId: "tenant_other" })
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("cross-tenant payment create with header spoof returns 403", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/payments",
      headers: authHeaders(login.accessToken, {
        tenantId: "tenant_other",
        idempotencyKey: "idem_payment_xt_create_header_1"
      }),
      payload: paymentCreatePayload
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("cross-tenant payment create with body tenantId spoof returns 403", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/payments",
      headers: authHeaders(login.accessToken, { idempotencyKey: "idem_payment_xt_create_body_1" }),
      payload: { ...paymentCreatePayload, tenantId: "tenant_other" }
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("cross-tenant payment confirm returns 403", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/payments/payment_1/confirm",
      headers: authHeaders(login.accessToken, {
        tenantId: "tenant_other",
        idempotencyKey: "idem_payment_xt_confirm_1"
      })
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("cross-tenant payment reverse returns 403", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/payments/payment_1/reverse",
      headers: authHeaders(login.accessToken, {
        tenantId: "tenant_other",
        idempotencyKey: "idem_payment_xt_reverse_1"
      }),
      payload: { reason: "Cross-tenant reverse attempt" }
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("cross-tenant quick operation payment submit returns 403", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      headers: authHeaders(login.accessToken, {
        tenantId: "tenant_other",
        idempotencyKey: "idem_payment_xt_qop_submit_1"
      }),
      payload: quickOperationPaymentPayload
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});
