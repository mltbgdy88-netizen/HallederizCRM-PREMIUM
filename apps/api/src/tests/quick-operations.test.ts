import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import type { QuickOperationSubmitRequest } from "@hallederiz/types";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { registerQuickOperationsRoutes } from "../quick-operations/routes";
import { createSession } from "../shared/session-store";
import { withDemoAuth, withEnv } from "./test-env";

async function buildServer() {
  const server = Fastify();
  await registerPlatformCoreRoutes(server);
  await registerQuickOperationsRoutes(server);
  return server;
}

function authHeaders(token: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`
  };
}

const baseSaleOrderPayload: QuickOperationSubmitRequest = {
  operationType: "sale_order",
  customerId: "customer_1",
  customerName: "MUSTERI FIRMA A.S.",
  lines: [
    {
      id: "line_1",
      productCode: "DKG-1001",
      productName: "Marvel Ivory",
      quantity: 5,
      unitPrice: 590,
      taxRate: 20,
      sourceType: "center_warehouse",
      lineTotal: 3540
    }
  ]
};

test("quick-operations preview requires auth", async () => {
  await withEnv({ DEMO_AUTH_ENABLED: "false", NODE_ENV: "development", PERSISTENCE_MODE: "demo" }, async () => {
    const server = await buildServer();
    const response = await server.inject({ method: "POST", url: "/quick-operations/preview", payload: baseSaleOrderPayload });
    assert.equal(response.statusCode, 401);
    await server.close();
  });
});

test("quick-operations submit requires auth", async () => {
  await withEnv({ DEMO_AUTH_ENABLED: "false", NODE_ENV: "development", PERSISTENCE_MODE: "demo" }, async () => {
    const server = await buildServer();
    const response = await server.inject({ method: "POST", url: "/quick-operations/submit", payload: baseSaleOrderPayload });
    assert.equal(response.statusCode, 401);
    await server.close();
  });
});

test("sale_order valid submit returns executed mode", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload: baseSaleOrderPayload,
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as {
      item: {
        mode: string;
        createdEntityType?: string;
        workflowImpacts: Array<{ key: string }>;
        sideActions?: { documentPreview?: { referenceNo: string }; whatsappDraft?: { sendEnabled: boolean } };
      };
    };
    assert.equal(body.item.mode, "executed");
    assert.equal(body.item.createdEntityType, "order");
    assert.ok(body.item.workflowImpacts.some((impact) => impact.key === "warehouse_prepare"));
    assert.ok(body.item.sideActions?.documentPreview?.referenceNo);
    assert.equal(body.item.sideActions?.whatsappDraft?.sendEnabled, false);
    await server.close();
  });
});

test("sale_order factory source produces factory impact", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const payload: QuickOperationSubmitRequest = {
      ...baseSaleOrderPayload,
        lines: [{ ...baseSaleOrderPayload.lines[0]!, id: "line_factory", sourceType: "factory" }]
    };
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload,
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as { item: { workflowImpacts: Array<{ key: string }> } };
    assert.ok(body.item.workflowImpacts.some((impact) => impact.key === "factory_plan"));
    await server.close();
  });
});

test("offer valid submit runs controlled execution", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const payload: QuickOperationSubmitRequest = {
      ...baseSaleOrderPayload,
      operationType: "offer"
    };
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload,
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as {
      item: {
        mode: string;
        createdEntityType?: string;
        workflowImpacts: Array<{ key: string }>;
        sideActions?: { documentPreview?: { title: string } };
      };
    };
    assert.ok(["executed", "foundation"].includes(body.item.mode));
    assert.equal(body.item.sideActions?.documentPreview?.title, "Teklif Onizleme");
    if (body.item.mode === "executed") {
      assert.equal(body.item.createdEntityType, "offer");
      assert.ok(body.item.workflowImpacts.some((impact) => impact.key === "offer_created"));
    }
    await server.close();
  });
});

test("payment missing amount returns validation issue", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const payload: QuickOperationSubmitRequest = {
      operationType: "payment",
      customerId: "customer_1",
      lines: []
    };
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload,
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as { item: { mode: string; validationIssues?: Array<{ code: string }> } };
    assert.equal(body.item.mode, "foundation");
    assert.ok((body.item.validationIssues ?? []).some((issue) => issue.code === "line_required"));
    await server.close();
  });
});

test("payment valid submit executed or controlled foundation", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const payload: QuickOperationSubmitRequest = {
      operationType: "payment",
      customerId: "customer_1",
      paidAmount: 1000,
      lines: [
        {
          id: "pay_line_1",
          productCode: "PAYMENT",
          productName: "Tahsilat",
          quantity: 1,
          unitPrice: 1000,
          taxRate: 0,
          sourceType: "auto",
          lineTotal: 1000
        }
      ]
    };
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload,
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as {
      item: {
        mode: string;
        createdEntityType?: string;
        workflowImpacts: Array<{ key: string }>;
        sideActions?: { whatsappDraft?: { message: string }; aiInsight?: { recommendations: string[]; warnings: string[] } };
      };
    };
    assert.ok(["executed", "foundation"].includes(body.item.mode));
    assert.match(body.item.sideActions?.whatsappDraft?.message ?? "", /tahsilat/i);
    assert.ok((body.item.sideActions?.aiInsight?.recommendations ?? []).length > 0);
    assert.ok(Array.isArray(body.item.sideActions?.aiInsight?.warnings ?? []));
    if (body.item.mode === "executed") {
      assert.equal(body.item.createdEntityType, "payment");
      assert.ok(body.item.workflowImpacts.some((impact) => impact.key === "payment_recorded"));
    }
    await server.close();
  });
});

test("delivery and return stay in foundation mode", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });

    const deliveryResponse = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload: { ...baseSaleOrderPayload, operationType: "delivery" as const },
      headers: authHeaders(login.accessToken)
    });
    const returnResponse = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload: { ...baseSaleOrderPayload, operationType: "return" as const },
      headers: authHeaders(login.accessToken)
    });

    assert.equal(deliveryResponse.statusCode, 200);
    assert.equal(returnResponse.statusCode, 200);
    const deliveryItem = (deliveryResponse.json() as { item: { mode: string; workflowImpacts: Array<{ key: string }> } }).item;
    const returnItem = (returnResponse.json() as { item: { mode: string; workflowImpacts: Array<{ key: string }> } }).item;
    assert.equal(deliveryItem.mode, "foundation");
    assert.equal(returnItem.mode, "foundation");
    assert.ok(deliveryItem.workflowImpacts.some((impact) => impact.key === "delivery_execution_pending"));
    assert.ok(returnItem.workflowImpacts.some((impact) => impact.key === "return_review_required"));
    await server.close();
  });
});

test("invalid quantity prevents execution", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload: {
        ...baseSaleOrderPayload,
        lines: [{ ...baseSaleOrderPayload.lines[0]!, id: "bad_qty", quantity: 0, lineTotal: 0 }]
      },
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as { item: { mode: string; validationIssues?: Array<{ code: string }> } };
    assert.equal(body.item.mode, "foundation");
    assert.ok((body.item.validationIssues ?? []).some((issue) => issue.code === "quantity_invalid"));
    await server.close();
  });
});
