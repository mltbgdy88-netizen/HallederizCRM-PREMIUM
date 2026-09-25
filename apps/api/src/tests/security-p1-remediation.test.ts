import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import type { AiProposal } from "@hallederiz/types";
import {
  createApprovalExecution,
  getApprovalExecution,
  listAiProposals,
  runApprovalExecution,
  saveAiProposal
} from "../ai-local-output-store";
import { registerAiLocalOutputRoutes } from "../ai-local-output-routes";
import { createErpConnection, createFactoryOrder } from "../integrations/mock-store";
import { ErpAdapter } from "../modules/integrations/adapters/erp-adapter";
import { FactoryAdapter } from "../modules/integrations/adapters/factory-adapter";
import { registerOperationsEngineRoutes } from "../operations-engine/routes";
import { createSession } from "../shared/session-store";
import type { RequestContext } from "../shared/request-context";
import { withEnv } from "./test-env";

const tenantOneContext: RequestContext = {
  tenantId: "tenant_1",
  userId: "user_1",
  persistenceMode: "demo",
  isAuthenticated: true,
  roles: ["admin"],
  permissions: ["*"]
};

test("integration adapters reject cross-tenant mutation before provider calls", async () => {
  const foreignConnection = createErpConnection("tenant_2", { name: "Tenant 2 ERP" });
  const foreignOrder = createFactoryOrder("tenant_2", { factoryOrderNo: "FO-TENANT-2" });
  const erp = new ErpAdapter(tenantOneContext);
  const factory = new FactoryAdapter(tenantOneContext);
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  globalThis.fetch = async () => {
    providerCalls += 1;
    return new Response("{}", { status: 200 });
  };

  try {
    await withEnv({ ERP_PROVIDER: "live", ERP_API_BASE_URL: "https://erp.invalid", FACTORY_PROVIDER: "live", FACTORY_API_BASE_URL: "https://factory.invalid" }, async () => {
      assert.equal(erp.patchConnection(foreignConnection.id, { name: "spoofed" }), null);
      assert.equal(await erp.testConnection(foreignConnection.id), null);
      assert.equal(await erp.syncConnection(foreignConnection.id), null);
      assert.equal(await factory.sendOrder(foreignOrder.id), null);
      assert.equal(factory.confirmOrder(foreignOrder.id), null);
      assert.equal(factory.markShipped(foreignOrder.id), null);
      assert.equal(factory.completeOrder(foreignOrder.id), null);
    });
    assert.equal(providerCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("AI and approval stores require matching tenant scope", () => {
  const seed = listAiProposals("tenant_1")[0];
  assert.ok(seed);
  const foreignProposal = saveAiProposal("tenant_2", {
    ...(seed as AiProposal),
    id: "ai_proposal_tenant_2",
    proposalNo: "AI-TENANT-2"
  });
  const foreignExecution = createApprovalExecution("tenant_2", {
    proposalId: foreignProposal.id,
    status: "authorized"
  });

  assert.equal(listAiProposals("tenant_1").some((item) => item.id === foreignProposal.id), false);
  assert.equal(getApprovalExecution("tenant_1", foreignExecution.id), undefined);
  assert.equal(runApprovalExecution("tenant_1", foreignExecution.id), null);
});

test("legacy approval execution create and run routes are absent in production", async () => {
  const sessionSecret = "security-p1-test-session-secret-32-chars";
  await withEnv(
    {
      AUTH_SESSION_SECRET: sessionSecret,
      DEMO_AUTH_ENABLED: "true",
      NODE_ENV: "development",
      PERSISTENCE_MODE: "demo"
    },
    async () => {
      const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
      const server = Fastify();
      await registerAiLocalOutputRoutes(server);
      await registerOperationsEngineRoutes(server);

      await withEnv({ DEMO_AUTH_ENABLED: "false", NODE_ENV: "production", PERSISTENCE_MODE: "postgres" }, async () => {
        const headers = { authorization: `Bearer ${login.accessToken}`, "x-session-token": login.accessToken };
        const createResponse = await server.inject({ method: "POST", url: "/approval-executions", headers, payload: { status: "authorized" } });
        const runResponse = await server.inject({ method: "POST", url: "/approval-executions/approval_exec_1/run", headers });
        const operationsRunResponse = await server.inject({ method: "POST", url: "/approvals/approval_1/execute", headers });
        assert.equal(createResponse.statusCode, 404);
        assert.equal(runResponse.statusCode, 404);
        assert.equal(operationsRunResponse.statusCode, 404);
      });

      await server.close();
    }
  );
});
