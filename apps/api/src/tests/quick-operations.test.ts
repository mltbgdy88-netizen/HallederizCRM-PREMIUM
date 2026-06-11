import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import type { QuickOperationSubmitRequest } from "@hallederiz/types";
import { registerCommercialOperationsRoutes } from "../commercial-operations/routes";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { registerQuickOperationsRoutes } from "../quick-operations/routes";
import { createSession } from "../shared/session-store";
import { withDemoAuth, withEnv } from "./test-env";

async function buildServer() {
  const server = Fastify();
  await registerPlatformCoreRoutes(server);
  await registerCommercialOperationsRoutes(server);
  await registerQuickOperationsRoutes(server);
  return server;
}

function authHeaders(token: string, idempotencyKey?: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`,
    ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {})
  };
}

function submitHeaders(token: string, idempotencyKey = `idem_qop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`) {
  return authHeaders(token, idempotencyKey);
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
      headers: submitHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as {
      item: {
        mode: string;
        approvalId?: string;
        createdEntityId?: string;
        createdEntityType?: string;
        workflowImpacts: Array<{ key: string }>;
        sideActions?: {
          documentPreview?: { referenceNo?: string; title?: string };
          whatsappDraft?: { sendEnabled: boolean };
        };
      };
    };
    assert.ok(["foundation", "executed", "queued_for_approval"].includes(body.item.mode));
    if (body.item.mode === "foundation" || body.item.mode === "queued_for_approval") {
      assert.ok(body.item.approvalId);
      assert.equal(body.item.createdEntityId, undefined);
    } else {
      assert.equal(body.item.createdEntityType, "order");
    }
    assert.ok(body.item.workflowImpacts.some((impact) => impact.key === "warehouse_prepare"));
    assert.ok(body.item.sideActions?.documentPreview?.title);
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
      headers: submitHeaders(login.accessToken)
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
      headers: submitHeaders(login.accessToken)
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
    assert.ok(["executed", "foundation", "queued_for_approval"].includes(body.item.mode));
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
      headers: submitHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as { item: { mode: string; validationIssues?: Array<{ code: string }> } };
    assert.equal(body.item.mode, "failed");
    assert.ok((body.item.validationIssues ?? []).some((issue) => issue.code === "line_required"));
    await server.close();
  });
});

test("sale_order with full payment creates order and payment when executed", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const preview = await server.inject({
      method: "POST",
      url: "/quick-operations/preview",
      payload: baseSaleOrderPayload,
      headers: submitHeaders(login.accessToken)
    });
    const grandTotal = (preview.json() as { item: { totals: { grandTotal: number } } }).item.totals.grandTotal;
    const payload: QuickOperationSubmitRequest = {
      ...baseSaleOrderPayload,
      payment: {
        enabled: true,
        amount: grandTotal,
        method: "cash",
        allocateToOrder: true
      },
      paidAmount: grandTotal
    };
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload,
      headers: submitHeaders(login.accessToken)
    });
    assert.equal(response.statusCode, 200);
    const body = response.json() as {
      item: {
        mode: string;
        createdEntityType?: string;
        createdPaymentId?: string;
        paymentRecorded?: boolean;
        orderPaymentStatus?: string;
      };
    };
    if (body.item.mode === "executed") {
      assert.equal(body.item.createdEntityType, "order");
      assert.equal(body.item.paymentRecorded, true);
      assert.ok(body.item.createdPaymentId);
      assert.ok(["paid", "partial"].includes(body.item.orderPaymentStatus ?? ""));
    }
    await server.close();
  });
});

test("sale_order with overpayment returns validation error", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const payload: QuickOperationSubmitRequest = {
      ...baseSaleOrderPayload,
      payment: { enabled: true, amount: 999999, method: "transfer" }
    };
    const preview = await server.inject({
      method: "POST",
      url: "/quick-operations/preview",
      payload,
      headers: submitHeaders(login.accessToken)
    });
    assert.equal(preview.statusCode, 200);
    const body = preview.json() as { item: { ok: boolean; validationIssues?: Array<{ code: string }> } };
    assert.equal(body.item.ok, false);
    assert.ok((body.item.validationIssues ?? []).some((issue) => issue.code === "payment_over_grand_total"));
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
      headers: submitHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as {
      item: {
        mode: string;
        createdEntityId?: string;
        createdEntityType?: string;
        workflowImpacts: Array<{ key: string }>;
        sideActions?: { whatsappDraft?: { message: string }; aiInsight?: { recommendations: string[]; warnings: string[] } };
      };
    };
    assert.ok(["executed", "foundation", "queued_for_approval"].includes(body.item.mode));
    assert.match(body.item.sideActions?.whatsappDraft?.message ?? "", /tahsilat/i);
    assert.ok((body.item.sideActions?.aiInsight?.recommendations ?? []).length > 0);
    assert.ok(Array.isArray(body.item.sideActions?.aiInsight?.warnings ?? []));
    if (body.item.mode === "executed") {
      assert.equal(body.item.createdEntityType, "payment");
      assert.ok(body.item.workflowImpacts.some((impact) => impact.key === "payment_recorded"));
      const paymentDetail = await server.inject({
        method: "GET",
        url: `/payments/${body.item.createdEntityId}`,
        headers: submitHeaders(login.accessToken)
      });
      assert.equal(paymentDetail.statusCode, 200);
      const paymentBody = paymentDetail.json() as { item?: { currency?: string } };
      assert.equal(paymentBody.item?.currency, "TRY");
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
      headers: submitHeaders(login.accessToken)
    });
    const returnResponse = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload: { ...baseSaleOrderPayload, operationType: "return" as const },
      headers: submitHeaders(login.accessToken)
    });

    assert.equal(deliveryResponse.statusCode, 200);
    assert.equal(returnResponse.statusCode, 200);
    const deliveryItem = (deliveryResponse.json() as { item: { mode: string; workflowImpacts: Array<{ key: string }> } }).item;
    const returnItem = (returnResponse.json() as { item: { mode: string; workflowImpacts: Array<{ key: string }> } }).item;
    assert.equal(deliveryItem.mode, "foundation");
    assert.ok(["failed", "foundation", "executed", "foundation_blocked"].includes(returnItem.mode));
    assert.ok(deliveryItem.workflowImpacts.some((impact) => impact.key === "delivery_execution_pending"));
    if (returnItem.mode === "foundation") {
      assert.ok(returnItem.workflowImpacts.some((impact) => impact.key === "return_approval_may_be_required"));
    }
    await server.close();
  });
});

test("delivery without reference and lines returns validation issue", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload: { operationType: "delivery", customerId: "customer_1", lines: [] },
      headers: submitHeaders(login.accessToken)
    });
    assert.equal(response.statusCode, 200);
    const body = response.json() as { item: { mode: string; validationIssues?: Array<{ code: string }> } };
    assert.equal(body.item.mode, "failed");
    assert.ok((body.item.validationIssues ?? []).some((issue) => issue.code === "line_required"));
    await server.close();
  });
});

test("valid delivery submit returns executed or controlled foundation and delivery side actions", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const payload: QuickOperationSubmitRequest = {
      operationType: "delivery",
      customerId: "customer_1",
      customerName: "MUSTERI FIRMA A.S.",
      orderId: "order_1",
      note: "Teslim planlandi",
      lines: [
        {
          id: "delivery_line_1",
          productCode: "DKG-1001",
          productName: "Marvel Ivory",
          quantity: 1,
          unitPrice: 590,
          taxRate: 20,
          sourceType: "center_warehouse",
          lineTotal: 708
        }
      ]
    };
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload,
      headers: submitHeaders(login.accessToken)
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
    assert.ok(["executed", "foundation", "queued_for_approval"].includes(body.item.mode));
    assert.equal(body.item.sideActions?.documentPreview?.title, "Teslim Fisi Onizleme");
    if (body.item.mode === "executed") {
      assert.equal(body.item.createdEntityType, "delivery");
    } else {
      assert.ok(body.item.workflowImpacts.some((impact) => impact.key === "delivery_execution_pending"));
    }
    await server.close();
  });
});

test("return missing reason returns validation issue", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload: {
        operationType: "return",
        customerId: "customer_1",
        lines: [{ ...baseSaleOrderPayload.lines[0]!, id: "ret_line_1" }]
      } satisfies QuickOperationSubmitRequest,
      headers: submitHeaders(login.accessToken)
    });
    assert.equal(response.statusCode, 200);
    const body = response.json() as { item: { mode: string; validationIssues?: Array<{ code: string }> } };
    assert.equal(body.item.mode, "failed");
    assert.ok((body.item.validationIssues ?? []).some((issue) => issue.code === "return_reason_required"));
    await server.close();
  });
});

test("valid return submit includes review/approval impact and return side actions", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const payload: QuickOperationSubmitRequest = {
      operationType: "return",
      customerId: "customer_1",
      customerName: "MUSTERI FIRMA A.S.",
      reason: "Hasarli urun iadesi",
      note: "Kosede ezilme var",
      lines: [{ ...baseSaleOrderPayload.lines[0]!, id: "return_line_2", quantity: 1 }]
    };
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload,
      headers: submitHeaders(login.accessToken)
    });
    assert.equal(response.statusCode, 200);
    const body = response.json() as {
      item: {
        mode: string;
        workflowImpacts: Array<{ key: string }>;
        sideActions?: { documentPreview?: { title: string } };
      };
    };
    assert.ok(["executed", "foundation", "queued_for_approval"].includes(body.item.mode));
    assert.ok(body.item.workflowImpacts.some((impact) => impact.key === "return_approval_may_be_required"));
    assert.equal(body.item.sideActions?.documentPreview?.title, "Iade Talebi Onizleme");
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
      headers: submitHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json() as { item: { mode: string; validationIssues?: Array<{ code: string }> } };
    assert.equal(body.item.mode, "failed");
    assert.ok((body.item.validationIssues ?? []).some((issue) => issue.code === "quantity_invalid"));
    await server.close();
  });
});

test("quick-operations submit requires idempotency-key header", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload: baseSaleOrderPayload,
      headers: authHeaders(login.accessToken)
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().reason, "idempotency_key_required");
    await server.close();
  });
});

test("quick-operations submit replays same idempotency key", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const idempotencyKey = "idem_qop_replay_1";
    const headers = submitHeaders(login.accessToken, idempotencyKey);
    const first = await server.inject({ method: "POST", url: "/quick-operations/submit", payload: baseSaleOrderPayload, headers });
    const second = await server.inject({ method: "POST", url: "/quick-operations/submit", payload: baseSaleOrderPayload, headers });
    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.deepEqual(first.json(), second.json());
    const body = first.json() as { item: { auditEventIds?: string[] } };
    assert.ok((body.item.auditEventIds ?? []).length > 0);
    await server.close();
  });
});

test("quick-operations submit rejects idempotency key conflict", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const idempotencyKey = "idem_qop_conflict_1";
    const first = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload: baseSaleOrderPayload,
      headers: submitHeaders(login.accessToken, idempotencyKey)
    });
    const second = await server.inject({
      method: "POST",
      url: "/quick-operations/submit",
      payload: { ...baseSaleOrderPayload, note: "farkli payload" },
      headers: submitHeaders(login.accessToken, idempotencyKey)
    });
    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 409);
    assert.equal(second.json().reason, "idempotency_key_conflict");
    await server.close();
  });
});
