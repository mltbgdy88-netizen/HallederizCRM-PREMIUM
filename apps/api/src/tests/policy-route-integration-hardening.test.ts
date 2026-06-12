import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { evaluatePolicyEngine as evaluatePolicy, tenantUsageLedger } from "@hallederiz/domain";
import { registerAiLocalOutputRoutes } from "../ai-local-output-routes";
import { registerCommercialOperationsRoutes } from "../commercial-operations/routes";
import { registerIntegrationRoutes } from "../integrations/routes";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { registerSalesCrmRoutes } from "../sales-crm/routes";
import { createSession, getSessionByToken } from "../shared/session-store";
import { enforcePolicyForRoute } from "../shared/policy-route-enforcement";
import type { RequestContext } from "../shared/request-context";
import { resetTenantUsageRuntimeForTests } from "../shared/tenant-usage-runtime";
import { withDemoAuth, withEnv } from "./test-env";

function authHeaders(token: string, extra?: Record<string, string>) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`,
    ...(extra ?? {})
  };
}

async function buildServer() {
  const server = Fastify();
  await registerPlatformCoreRoutes(server);
  await registerSalesCrmRoutes(server);
  await registerCommercialOperationsRoutes(server);
  await registerIntegrationRoutes(server);
  await registerAiLocalOutputRoutes(server);
  return server;
}

test("route helper denies unauthenticated context on critical route", async () => {
  await withEnv({ DEMO_AUTH_ENABLED: "false", NODE_ENV: "development", PERSISTENCE_MODE: "demo" }, async () => {
    const server = await buildServer();
    const response = await server.inject({
      method: "POST",
      url: "/users",
      payload: { email: "noauth@hallederiz.com", fullName: "No Auth" }
    });
    assert.equal(response.statusCode, 401);
    await server.close();
  });
});

test("tenant mismatch remains fail-closed before policy allow", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/customers",
      headers: authHeaders(login.accessToken, { "x-tenant-id": "tenant_other" }),
      payload: { tenantId: "tenant_other", code: "C-999", name: "Tenant Spoof" }
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("missing permission still denies before policy execution", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const session = getSessionByToken(login.accessToken);
    assert.ok(session);
    if (session) {
      session.permissions = session.permissions.filter((permission) => !permission.key.startsWith("payments."));
    }

    const response = await server.inject({
      method: "POST",
      url: "/payments",
      headers: { ...authHeaders(login.accessToken), "idempotency-key": "idem_payment_permission_denied" },
      payload: { amount: 100, method: "cash" }
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("unknown action denies in policy engine", () => {
  const decision = evaluatePolicy({
    subject: {
      userId: "user_1",
      tenantId: "tenant_1",
      roles: ["admin"],
      permissions: ["*"],
      authMode: "session",
      channel: "api"
    },
    resource: {
      resourceType: "unknown",
      tenantId: "tenant_1"
    },
    action: {
      actionKey: "unknown.route.action",
      actionType: "execute",
      criticality: "critical"
    },
    context: {
      requestId: "req_unknown",
      tenantId: "tenant_1",
      source: "api",
      environment: "development",
      persistenceMode: "demo",
      channel: "api"
    }
  });
  assert.equal(decision.effect, "deny");
  assert.ok(decision.reasons.includes("unknown_action"));
});

test("user create and settings update require approval and keep mutation blocked", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });

    const beforeUsers = await server.inject({ method: "GET", url: "/users", headers: authHeaders(login.accessToken) });
    const beforeSettings = await server.inject({ method: "GET", url: "/settings", headers: authHeaders(login.accessToken) });

    const createUser = await server.inject({
      method: "POST",
      url: "/users",
      headers: authHeaders(login.accessToken),
      payload: { email: "blocked.user@hallederiz.com", fullName: "Blocked User" }
    });
    const updateSettings = await server.inject({
      method: "PATCH",
      url: "/settings",
      headers: authHeaders(login.accessToken),
      payload: { company: { name: "Should Not Persist" } }
    });

    assert.equal(createUser.statusCode, 202);
    assert.equal(createUser.json().policyDecision, "require_approval");
    assert.equal(updateSettings.statusCode, 202);
    assert.equal(updateSettings.json().policyDecision, "require_approval");
    assert.ok(updateSettings.json().obligations?.requireApproval);

    const afterUsers = await server.inject({ method: "GET", url: "/users", headers: authHeaders(login.accessToken) });
    const afterSettings = await server.inject({ method: "GET", url: "/settings", headers: authHeaders(login.accessToken) });
    assert.equal(afterUsers.json().total, beforeUsers.json().total);
    assert.equal(afterSettings.json().data.company.name, beforeSettings.json().data.company.name);
    await server.close();
  });
});

test("document send and commercial critical actions are approval-first", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });

    const order = await server.inject({
      method: "POST",
      url: "/orders",
      headers: authHeaders(login.accessToken),
      payload: { customerId: "customer_1", lines: [] }
    });
    const payment = await server.inject({
      method: "POST",
      url: "/payments",
      headers: { ...authHeaders(login.accessToken), "idempotency-key": "idem_payment_policy_approval" },
      payload: { customerId: "customer_1", amount: 1200, method: "transfer" }
    });
    const sendDoc = await server.inject({
      method: "POST",
      url: "/documents/document_1/send-whatsapp",
      headers: {
        ...authHeaders(login.accessToken),
        "idempotency-key": "idem_policy_test_send_whatsapp"
      }
    });

    assert.equal(order.statusCode, 202);
    assert.equal(order.json().policyDecision, "require_approval");
    assert.equal(order.json().obligations?.requireUsageRecord, true);
    assert.equal(payment.statusCode, 202);
    assert.equal(payment.json().policyDecision, "require_approval");
    assert.equal(sendDoc.statusCode, 202);
    assert.equal(sendDoc.json().policyDecision, "require_approval");
    await server.close();
  });
});

test("AI execute attempt remains dry_run_only or approval-gated", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });

    const createExecution = await server.inject({
      method: "POST",
      url: "/approval-executions",
      headers: authHeaders(login.accessToken),
      payload: { actionKey: "platform.ai.execute", status: "pending" }
    });
    assert.equal(createExecution.statusCode, 201);
    const id = createExecution.json().item.id as string;

    const runExecution = await server.inject({
      method: "POST",
      url: `/approval-executions/${id}/run`,
      headers: authHeaders(login.accessToken)
    });
    assert.equal(runExecution.statusCode, 202);
    assert.ok(["dry_run_only", "require_approval"].includes(runExecution.json().policyDecision));
    await server.close();
  });
});

test("WhatsApp webhook command cannot bypass signature checks", async () => {
  await withEnv(
    {
      DEMO_AUTH_ENABLED: "true",
      NODE_ENV: "production",
      PERSISTENCE_MODE: "postgres",
      WHATSAPP_WEBHOOK_APP_SECRET: "policy-hardening-secret"
    },
    async () => {
      const server = await buildServer();
      const response = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        payload: { tenantId: "tenant_1", text: "ONAY ref123 token123" }
      });
      assert.equal(response.statusCode, 403);
      await server.close();
    }
  );
});

test("API confirm route uses API action and does not impersonate inbound WhatsApp command", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const session = getSessionByToken(login.accessToken);
    if (session) {
      const existing = new Set(session.permissions.map((permission) => permission.key));
      const template = session.permissions[0];
      if (template) {
        if (!existing.has("integrations.write")) {
          session.permissions.push({
            ...template,
            id: `${template.id}_int_write`,
            key: "integrations.write",
            name: "Integrations Write"
          });
        }
        if (!existing.has("approvals.write")) {
          session.permissions.push({
            ...template,
            id: `${template.id}_apr_write`,
            key: "approvals.write",
            name: "Approvals Write"
          });
        }
      }
    }

    const response = await server.inject({
      method: "POST",
      url: "/whatsapp/action-requests/wa_action_req_1/confirm",
      headers: authHeaders(login.accessToken)
    });

    assert.ok([202, 403].includes(response.statusCode));
    const body = response.json();
    if (typeof body === "object" && body && "actionKey" in body) {
      assert.equal(body.actionKey, "platform.whatsapp.action_request.confirm");
      assert.notEqual(body.actionKey, "platform.whatsapp.approval_command");
    }
    await server.close();
  });
});

test("platform.whatsapp.approval_command remains inbound-only with real channel verification requirements", () => {
  const baseInput = {
    subject: {
      userId: "user_1",
      tenantId: "tenant_1",
      roles: ["admin"],
      permissions: ["approvals.approve"],
      authMode: "session" as const,
      channel: "whatsapp" as const
    },
    resource: {
      resourceType: "approval",
      tenantId: "tenant_1"
    },
    action: {
      actionKey: "platform.whatsapp.approval_command",
      actionType: "approve" as const,
      criticality: "critical" as const
    },
    context: {
      requestId: "req_wa_cmd",
      tenantId: "tenant_1",
      source: "whatsapp" as const,
      environment: "development" as const,
      persistenceMode: "demo" as const,
      channel: "whatsapp" as const
    }
  };

  const denied = evaluatePolicy(baseInput);
  assert.equal(denied.effect, "deny");
  assert.ok(denied.reasons.includes("channel_signature_required"));

  const allowed = evaluatePolicy({
    ...baseInput,
    idempotencyKey: "wa_idem_1",
    channelPolicy: {
      signatureVerified: true,
      approvalTokenVerified: true,
      phoneVerified: true,
      withinChannelWindow: true
    }
  });
  assert.equal(allowed.effect, "allow");
});

test("usageRecorded is true only after successful ledger persistence", async () => {
  await withDemoAuth(async () => {
    resetTenantUsageRuntimeForTests();
    const context: RequestContext = {
      userId: "user_1",
      tenantId: "tenant_1",
      permissions: ["orders.write"],
      roles: ["admin"],
      persistenceMode: "demo",
      sessionToken: "session_token",
      isAuthenticated: true
    };

    const response = await enforcePolicyForRoute(context, {
      actionKey: "platform.orders.create",
      requiredPermissions: ["orders.write"],
      source: "api",
      payload: { customerId: "customer_1", lines: [] }
    });
    assert.equal(response.handled, true);
    const body = response.body as Record<string, unknown>;
    assert.equal(body.usageRecordRequired, true);
    assert.equal(body.usageRecorded, true);
    assert.equal(typeof body.usageEventId, "string");
  });
});

test("usageRecorded is false when ledger persistence throws", async () => {
  await withDemoAuth(async () => {
    resetTenantUsageRuntimeForTests();
    const originalRecord = tenantUsageLedger.record.bind(tenantUsageLedger);
    try {
      tenantUsageLedger.record = async () => {
        throw new Error("usage_write_failed");
      };

      const context: RequestContext = {
        userId: "user_1",
        tenantId: "tenant_1",
        permissions: ["orders.write"],
        roles: ["admin"],
        persistenceMode: "demo",
        sessionToken: "session_token",
        isAuthenticated: true
      };

      const response = await enforcePolicyForRoute(context, {
        actionKey: "platform.orders.create",
        requiredPermissions: ["orders.write"],
        source: "api",
        payload: { customerId: "customer_1", lines: [] }
      });

      assert.equal(response.handled, true);
      const body = response.body as Record<string, unknown>;
      assert.equal(body.usageRecordRequired, true);
      assert.equal(body.usageRecorded, false);
      assert.equal(body.usageRecordError, "usage_write_failed");
    } finally {
      tenantUsageLedger.record = originalRecord;
    }
  });
});

test("usageRecorded is false with explicit reason when ledger resolution is unavailable", async () => {
  await withEnv({ NODE_ENV: "development", PERSISTENCE_MODE: "postgres" }, async () => {
    resetTenantUsageRuntimeForTests();
    const context: RequestContext = {
      userId: "user_1",
      tenantId: "tenant_1",
      permissions: ["orders.write"],
      roles: ["admin"],
      persistenceMode: "postgres",
      sessionToken: "session_token",
      isAuthenticated: true
    };

    const response = await enforcePolicyForRoute(context, {
      actionKey: "platform.orders.create",
      requiredPermissions: ["orders.write"],
      source: "api",
      payload: { customerId: "customer_1", lines: [] }
    });
    assert.equal(response.handled, true);
    const body = response.body as Record<string, unknown>;
    assert.equal(body.usageRecordRequired, true);
    assert.equal(body.usageRecorded, false);
    assert.equal(body.usagePersistenceMode, "unsupported");
    assert.ok(Array.isArray(body.usageReasons));
  });
});
