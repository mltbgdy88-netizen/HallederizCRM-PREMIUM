import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { buildQuickOperationWorkflowImpacts, calculateQuickOperationTotals } from "@hallederiz/domain";
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

const validPayload: QuickOperationSubmitRequest = {
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

function authHeaders(token: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`
  };
}

test("quick-operations preview requires auth", async () => {
  await withEnv(
    {
      DEMO_AUTH_ENABLED: "false",
      NODE_ENV: "development",
      PERSISTENCE_MODE: "demo"
    },
    async () => {
      const server = await buildServer();
      const response = await server.inject({
        method: "POST",
        url: "/quick-operations/preview",
        payload: validPayload
      });

      assert.equal(response.statusCode, 401);
      await server.close();
    }
  );
});

test("quick-operations submit requires auth", async () => {
  await withEnv(
    {
      DEMO_AUTH_ENABLED: "false",
      NODE_ENV: "development",
      PERSISTENCE_MODE: "demo"
    },
    async () => {
      const server = await buildServer();
      const response = await server.inject({
        method: "POST",
        url: "/quick-operations/submit",
        payload: validPayload
      });

      assert.equal(response.statusCode, 401);
      await server.close();
    }
  );
});

test("quick-operations preview returns impacts for center warehouse with demo auth", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/preview",
      payload: validPayload,
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as { item: { workflowImpacts: Array<{ key: string }>; validationIssues: unknown[] } };
    assert.ok(body.item.workflowImpacts.some((impact) => impact.key === "warehouse_prepare"));
    assert.ok(body.item.workflowImpacts.some((impact) => impact.key === "sale_order_source_plan"));
    assert.equal(body.item.validationIssues.length, 0);
    await server.close();
  });
});

test("quick-operations preview returns factory impact", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/preview",
      payload: {
        ...validPayload,
        lines: [{ ...validPayload.lines[0], id: "line_factory", sourceType: "factory", lineTotal: 3540 }]
      },
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as { item: { workflowImpacts: Array<{ key: string }> } };
    assert.ok(body.item.workflowImpacts.some((impact) => impact.key === "factory_plan"));
    await server.close();
  });
});

test("quick-operations preview returns validation issue for invalid quantity", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/preview",
      payload: {
        ...validPayload,
        lines: [{ ...validPayload.lines[0], id: "line_bad", quantity: 0, lineTotal: 0 }]
      },
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as { item: { ok: boolean; validationIssues: Array<{ code: string }> } };
    assert.equal(body.item.ok, false);
    assert.ok(body.item.validationIssues.some((issue) => issue.code === "quantity_invalid"));
    await server.close();
  });
});

test("quick-operations submit returns foundation mode", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload: validPayload,
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as { item: { mode: string; operationType: string } };
    assert.equal(body.item.mode, "foundation");
    assert.equal(body.item.operationType, "sale_order");
    await server.close();
  });
});

test("domain totals calculation is deterministic", () => {
  const totals = calculateQuickOperationTotals([
    {
      id: "line_a",
      productCode: "DKG-1001",
      productName: "Marvel Ivory",
      quantity: 2,
      unitPrice: 100,
      taxRate: 20,
      discountRate: 10,
      sourceType: "center_warehouse",
      lineTotal: 216
    }
  ]);

  assert.equal(totals.subtotal, 200);
  assert.equal(totals.discountTotal, 20);
  assert.equal(totals.taxTotal, 36);
  assert.equal(totals.grandTotal, 216);
});

test("domain source planner maps supplier and auto impacts", () => {
  const impacts = buildQuickOperationWorkflowImpacts("offer", [
    {
      id: "line_supplier",
      productCode: "DKG-2040",
      productName: "Luxe Gri",
      quantity: 1,
      unitPrice: 200,
      taxRate: 20,
      sourceType: "supplier",
      lineTotal: 240
    },
    {
      id: "line_auto",
      productCode: "HZM-01",
      productName: "Hizmet",
      quantity: 1,
      unitPrice: 50,
      taxRate: 20,
      sourceType: "auto",
      lineTotal: 60
    }
  ]);

  assert.ok(impacts.some((impact) => impact.key === "supplier_procurement"));
  assert.ok(impacts.some((impact) => impact.key === "recommendation_required"));
  assert.ok(impacts.some((impact) => impact.key === "offer_no_reservation"));
});
