import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerAiLocalOutputRoutes } from "../ai-local-output-routes";
import {
  getLocalAgentStatus,
  queueDocumentPrint,
  queueDocumentSave,
  reportLocalAgentStatus
} from "../ai-local-output-store";
import { registerIntegrationRoutes } from "../integrations/routes";
import {
  LOCAL_AGENT_SERVICE_CAPABILITIES,
  LOCAL_AGENT_SERVICE_TOKEN_PREFIX,
  LocalAgentServiceTokenStore,
  type LocalAgentServiceCapability
} from "../shared/local-agent-service-auth";
import { buildRequestContext } from "../shared/request-context";
import { createDatabaseSession, getSessionByToken } from "../shared/session-store";
import { withEnv } from "./test-env";

const CLIENT_ID = "local-agent-service-route-test";
const CLIENT_SECRET = "local-agent-service-route-secret-value-01";
const CONTROL_SECRET = "local-agent-control-route-secret-value-02";
const TENANT_A = "tenant_service_route_a";
const TENANT_B = "tenant_service_route_b";

function serviceEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    NODE_ENV: "development",
    PERSISTENCE_MODE: "demo",
    LOCAL_AGENT_SERVICE_AUTH_ENABLED: "true",
    LOCAL_AGENT_SERVICE_CLIENT_ID: CLIENT_ID,
    LOCAL_AGENT_SERVICE_CLIENT_SECRET: CLIENT_SECRET,
    LOCAL_AGENT_SERVICE_TOKEN_TTL_SECONDS: "180",
    LOCAL_AGENT_TENANT_ID: TENANT_A,
    LOCAL_AGENT_CONTROL_TOKEN: CONTROL_SECRET,
    ...overrides
  };
}

function issueToken(
  store: LocalAgentServiceTokenStore,
  tenantId = TENANT_A,
  capabilities: readonly LocalAgentServiceCapability[] = LOCAL_AGENT_SERVICE_CAPABILITIES
) {
  return store.issue({ tenantId, clientId: CLIENT_ID, capabilities, ttlSeconds: 180 }).accessToken;
}

function serviceHeaders(accessToken: string, extra: Record<string, string> = {}) {
  return { authorization: `Bearer ${accessToken}`, ...extra };
}

async function buildLocalOutputServer(store: LocalAgentServiceTokenStore, includeIntegrations = false) {
  const server = Fastify();
  await registerAiLocalOutputRoutes(server, { localAgentServiceTokenStore: store });
  if (includeIntegrations) await registerIntegrationRoutes(server);
  return server;
}

function createTenantSession(tenantId: string) {
  const tenantSlug = `slug_${tenantId}`;
  const email = `admin_${tenantId}@example.test`;
  return createDatabaseSession(
    { tenantSlug, email, password: "test-only" },
    {
      status: "success",
      tenantId,
      tenantSlug,
      tenantName: `Tenant ${tenantId}`,
      userId: `user_${tenantId}`,
      email,
      fullName: "Test Admin",
      role: "admin"
    }
  );
}

test("valid service token executes exactly the nine allowlisted operations", async () => {
  await withEnv(serviceEnv(), async () => {
    const store = new LocalAgentServiceTokenStore();
    const token = issueToken(store);
    const printStart = queueDocumentPrint(TENANT_A, "svc_matrix_print_start");
    const printComplete = queueDocumentPrint(TENANT_A, "svc_matrix_print_complete");
    const printFail = queueDocumentPrint(TENANT_A, "svc_matrix_print_fail");
    const fileStart = queueDocumentSave(TENANT_A, "svc_matrix_file_start");
    const fileComplete = queueDocumentSave(TENANT_A, "svc_matrix_file_complete");
    const fileFail = queueDocumentSave(TENANT_A, "svc_matrix_file_fail");
    const server = await buildLocalOutputServer(store);
    try {
      const requests = [
        { method: "GET", url: "/print-jobs", statusCode: 200 },
        { method: "GET", url: "/file-save-jobs", statusCode: 200 },
        { method: "POST", url: `/print-jobs/${printStart.id}/start`, statusCode: 200 },
        { method: "POST", url: `/print-jobs/${printComplete.id}/complete`, statusCode: 200 },
        { method: "POST", url: `/print-jobs/${printFail.id}/fail`, statusCode: 200 },
        { method: "POST", url: `/file-save-jobs/${fileStart.id}/start`, statusCode: 200 },
        { method: "POST", url: `/file-save-jobs/${fileComplete.id}/complete`, statusCode: 200 },
        { method: "POST", url: `/file-save-jobs/${fileFail.id}/fail`, statusCode: 200 },
        { method: "POST", url: "/local-agent/status", statusCode: 201, payload: { status: "online" } }
      ] as const;

      for (const request of requests) {
        const response = await server.inject({
          method: request.method,
          url: request.url,
          headers: serviceHeaders(token),
          payload: "payload" in request ? request.payload : undefined
        });
        assert.equal(response.statusCode, request.statusCode, `${request.method} ${request.url}`);
        assert.equal(response.headers["cache-control"], "no-store", `${request.method} ${request.url}`);
      }
      assert.equal(getLocalAgentStatus(TENANT_A).status, "online");
    } finally {
      await server.close();
    }
  });
});

test("malformed, unknown, and expired service tokens fail closed with distinct safe reasons", async () => {
  await withEnv(serviceEnv(), async () => {
    let now = 1_000;
    const store = new LocalAgentServiceTokenStore(() => now);
    const expiredToken = issueToken(store);
    now += 180_000;
    const server = await buildLocalOutputServer(store);
    try {
      const malformed = await server.inject({
        method: "GET",
        url: "/print-jobs",
        headers: serviceHeaders(`${LOCAL_AGENT_SERVICE_TOKEN_PREFIX}short`)
      });
      assert.equal(malformed.statusCode, 401);
      assert.equal(malformed.json().reason, "local_agent_service_token_invalid");
      assert.equal(malformed.headers["cache-control"], "no-store");

      const expired = await server.inject({
        method: "GET",
        url: "/print-jobs",
        headers: serviceHeaders(expiredToken)
      });
      assert.equal(expired.statusCode, 401);
      assert.equal(expired.json().reason, "local_agent_service_token_expired");
      assert.equal(store.snapshot().length, 0);

      const unknownToken = `${LOCAL_AGENT_SERVICE_TOKEN_PREFIX}${Buffer.alloc(32, 7).toString("base64url")}`;
      const unknown = await server.inject({
        method: "GET",
        url: "/print-jobs",
        headers: serviceHeaders(unknownToken)
      });
      assert.equal(unknown.statusCode, 401);
      assert.equal(unknown.json().reason, "local_agent_service_token_unknown");
    } finally {
      await server.close();
    }
  });
});

test("service-token prefix never falls back to a valid user session", async () => {
  await withEnv(serviceEnv(), async () => {
    const store = new LocalAgentServiceTokenStore();
    const userSession = createTenantSession(TENANT_A);
    const unknownToken = `${LOCAL_AGENT_SERVICE_TOKEN_PREFIX}${Buffer.alloc(32, 9).toString("base64url")}`;
    const mixedHeaders = serviceHeaders(unknownToken, {
      "x-session-token": userSession.accessToken,
      cookie: `hz_session=${encodeURIComponent(userSession.accessToken)}`
    });
    const server = await buildLocalOutputServer(store, true);
    try {
      const allowlisted = await server.inject({ method: "GET", url: "/print-jobs", headers: mixedHeaders });
      assert.equal(allowlisted.statusCode, 401);
      assert.equal(allowlisted.json().reason, "local_agent_service_token_unknown");

      const unrelated = await server.inject({ method: "GET", url: "/whatsapp/conversations", headers: mixedHeaders });
      assert.equal(unrelated.statusCode, 401);

      const malformedScheme = await server.inject({
        method: "GET",
        url: "/whatsapp/conversations",
        headers: {
          ...mixedHeaders,
          authorization: `Basic ${LOCAL_AGENT_SERVICE_TOKEN_PREFIX}malformed`
        }
      });
      assert.equal(malformedScheme.statusCode, 401);

      const context = buildRequestContext({ headers: mixedHeaders } as never);
      assert.equal(context.isAuthenticated, false);
      assert.deepEqual(context.permissions, []);
    } finally {
      await server.close();
    }
  });
});

test("capability checks are operation-specific and never become generic permissions", async () => {
  await withEnv(serviceEnv(), async () => {
    const store = new LocalAgentServiceTokenStore();
    const readOnlyToken = issueToken(store, TENANT_A, ["local_agent.jobs.read"]);
    const statusOnlyToken = issueToken(store, TENANT_A, ["local_agent.status.write"]);
    const printJob = queueDocumentPrint(TENANT_A, "svc_capability_print");
    const server = await buildLocalOutputServer(store);
    try {
      const read = await server.inject({ method: "GET", url: "/print-jobs", headers: serviceHeaders(readOnlyToken) });
      assert.equal(read.statusCode, 200);

      const transitionDenied = await server.inject({
        method: "POST",
        url: `/print-jobs/${printJob.id}/start`,
        headers: serviceHeaders(readOnlyToken)
      });
      assert.equal(transitionDenied.statusCode, 403);
      assert.equal(transitionDenied.json().reason, "local_agent_service_capability_denied");

      const status = await server.inject({
        method: "POST",
        url: "/local-agent/status",
        headers: serviceHeaders(statusOnlyToken),
        payload: { status: "safe_mode" }
      });
      assert.equal(status.statusCode, 201);

      const readDenied = await server.inject({ method: "GET", url: "/print-jobs", headers: serviceHeaders(statusOnlyToken) });
      assert.equal(readDenied.statusCode, 403);
      assert.equal(readDenied.json().reason, "local_agent_service_capability_denied");
      assert.equal(getSessionByToken(readOnlyToken), null);
    } finally {
      await server.close();
    }
  });
});

test("wrong configured tenant and all tenant override channels are denied", async () => {
  await withEnv(serviceEnv(), async () => {
    const store = new LocalAgentServiceTokenStore();
    const wrongTenantToken = issueToken(store, TENANT_B);
    const tenantAToken = issueToken(store, TENANT_A);
    const server = await buildLocalOutputServer(store);
    try {
      const wrongTenant = await server.inject({
        method: "GET",
        url: "/print-jobs",
        headers: serviceHeaders(wrongTenantToken)
      });
      assert.equal(wrongTenant.statusCode, 403);
      assert.equal(wrongTenant.json().reason, "local_agent_service_tenant_denied");

      const headerOverride = await server.inject({
        method: "GET",
        url: "/print-jobs",
        headers: serviceHeaders(tenantAToken, { "x-tenant-id": TENANT_B })
      });
      const queryOverride = await server.inject({
        method: "GET",
        url: `/print-jobs?tenantId=${TENANT_B}`,
        headers: serviceHeaders(tenantAToken)
      });
      const bodyOverride = await server.inject({
        method: "POST",
        url: "/local-agent/status",
        headers: serviceHeaders(tenantAToken),
        payload: { tenantId: TENANT_B, status: "online" }
      });
      for (const response of [headerOverride, queryOverride, bodyOverride]) {
        assert.equal(response.statusCode, 403);
        assert.equal(response.json().reason, "local_agent_service_tenant_denied");
      }
    } finally {
      await server.close();
    }
  });
});

test("valid service token is denied on local-output rules, queue, health, unrelated, status-read, and WhatsApp routes", async () => {
  await withEnv(serviceEnv(), async () => {
    const store = new LocalAgentServiceTokenStore();
    const token = issueToken(store);
    const server = await buildLocalOutputServer(store, true);
    try {
      const deniedRequests = [
        { method: "GET", url: "/local-output/rules" },
        { method: "POST", url: "/documents/document_x/queue-print" },
        { method: "POST", url: "/documents/document_x/queue-save" },
        { method: "GET", url: "/local-agent/status" },
        { method: "POST", url: "/health/local-agent/test-print-dry-run" },
        { method: "POST", url: "/ai/chat", payload: { message: "status" } },
        { method: "GET", url: "/whatsapp/conversations" }
      ] as const;
      for (const request of deniedRequests) {
        const response = await server.inject({
          method: request.method,
          url: request.url,
          headers: serviceHeaders(token),
          payload: "payload" in request ? request.payload : undefined
        });
        assert.equal(response.statusCode, 401, `${request.method} ${request.url}`);
      }
    } finally {
      await server.close();
    }
  });
});

test("tenant-bound service token cannot list, read, transition, or update status across tenants", async () => {
  await withEnv(serviceEnv(), async () => {
    const store = new LocalAgentServiceTokenStore();
    const tokenA = issueToken(store, TENANT_A);
    const printA = queueDocumentPrint(TENANT_A, "svc_tenant_print_a");
    const printB = queueDocumentPrint(TENANT_B, "svc_tenant_print_b");
    const fileA = queueDocumentSave(TENANT_A, "svc_tenant_file_a");
    const fileB = queueDocumentSave(TENANT_B, "svc_tenant_file_b");
    fileB.contentBase64 = "CROSS_TENANT_SERVICE_CONTENT_MARKER";
    reportLocalAgentStatus(TENANT_A, { status: "safe_mode", message: "tenant a initial" });
    reportLocalAgentStatus(TENANT_B, { status: "error", message: "tenant b protected" });

    const server = await buildLocalOutputServer(store);
    try {
      const printList = await server.inject({ method: "GET", url: "/print-jobs", headers: serviceHeaders(tokenA) });
      const fileList = await server.inject({ method: "GET", url: "/file-save-jobs", headers: serviceHeaders(tokenA) });
      assert.equal(printList.statusCode, 200);
      assert.equal(fileList.statusCode, 200);
      assert.equal(printList.json().items.some((job: { id: string }) => job.id === printA.id), true);
      assert.equal(printList.json().items.some((job: { id: string }) => job.id === printB.id), false);
      assert.equal(fileList.json().items.some((job: { id: string }) => job.id === fileA.id), true);
      assert.equal(fileList.json().items.some((job: { id: string }) => job.id === fileB.id), false);
      assert.equal(fileList.body.includes("CROSS_TENANT_SERVICE_CONTENT_MARKER"), false);

      for (const action of ["start", "complete", "fail"] as const) {
        const printTransition = await server.inject({
          method: "POST",
          url: `/print-jobs/${printB.id}/${action}`,
          headers: serviceHeaders(tokenA)
        });
        const fileTransition = await server.inject({
          method: "POST",
          url: `/file-save-jobs/${fileB.id}/${action}`,
          headers: serviceHeaders(tokenA)
        });
        assert.equal(printTransition.statusCode, 404, `print ${action}`);
        assert.equal(fileTransition.statusCode, 404, `file ${action}`);
      }

      const statusWrite = await server.inject({
        method: "POST",
        url: "/local-agent/status",
        headers: serviceHeaders(tokenA),
        payload: { status: "online", message: "tenant a service" }
      });
      assert.equal(statusWrite.statusCode, 201);
      assert.equal(getLocalAgentStatus(TENANT_A).status, "online");
      assert.equal(getLocalAgentStatus(TENANT_B).status, "error");
      assert.equal(getLocalAgentStatus(TENANT_B).message, "tenant b protected");
    } finally {
      await server.close();
    }
  });
});

test("existing browser user-session local-output behavior remains unchanged", async () => {
  await withEnv(serviceEnv(), async () => {
    const store = new LocalAgentServiceTokenStore();
    const userSession = createTenantSession(TENANT_A);
    const printJob = queueDocumentPrint(TENANT_A, "svc_user_regression_print");
    const server = await buildLocalOutputServer(store);
    const headers = {
      authorization: `Bearer ${userSession.accessToken}`,
      "x-session-token": userSession.accessToken,
      "x-tenant-id": TENANT_A
    };
    try {
      const list = await server.inject({ method: "GET", url: "/print-jobs", headers });
      assert.equal(list.statusCode, 200);
      const transition = await server.inject({
        method: "POST",
        url: `/print-jobs/${printJob.id}/start`,
        headers
      });
      assert.equal(transition.statusCode, 200);
    } finally {
      await server.close();
    }
  });
});
