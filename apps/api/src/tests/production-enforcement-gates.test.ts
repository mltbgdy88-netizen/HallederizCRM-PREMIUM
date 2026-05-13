import assert from "node:assert/strict";
import test from "node:test";
import {
  InMemoryPendingApprovalRepository,
  listWorkerJobHandlers,
  resetWorkerJobHandlers,
} from "@hallederiz/domain";
import { withEnv } from "./test-env";
import { evaluateProductionGate, mapActionKeyToProductionActionType } from "../shared/production-enforcement";
import { executeApprovedPendingApproval } from "../shared/approval-execution-runtime";
import { enforcePolicyForRoute } from "../shared/policy-route-enforcement";

test("production gate allows safe read action", async () => {
  await withEnv({ NODE_ENV: "production", PERSISTENCE_MODE: "postgres" }, async () => {
    const gate = await evaluateProductionGate({
      context: {
        tenantId: "tenant_1",
        userId: "user_admin",
        persistenceMode: "postgres",
        isAuthenticated: true,
        permissions: ["orders.read"]
      },
      actionType: "safe_read",
      actionKey: "platform.orders.read"
    });
    assert.equal(gate.productionGate, "allowed");
  });
});

test("production gate blocks critical mutation when readiness is blocked", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      PERSISTENCE_MODE: "postgres",
      DATABASE_URL: undefined,
      POSTGRES_URL: undefined,
      AUTH_SESSION_SECRET: undefined
    },
    async () => {
      const gate = await evaluateProductionGate({
        context: {
          tenantId: "tenant_1",
          userId: "user_admin",
          persistenceMode: "postgres",
          isAuthenticated: true,
          permissions: ["orders.write"]
        },
        actionType: "commercial_write",
        actionKey: "platform.orders.create"
      });
      assert.equal(gate.productionGate, "blocked");
      assert.ok(gate.blockers.length > 0);
    }
  );
});

test("commercial write policy enforcement does not return fake success when production gate is blocked", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      PERSISTENCE_MODE: "postgres",
      DATABASE_URL: undefined,
      POSTGRES_URL: undefined,
      AUTH_SESSION_SECRET: undefined
    },
    async () => {
      const response = await enforcePolicyForRoute(
        {
          tenantId: "tenant_1",
          userId: "user_admin",
          persistenceMode: "postgres",
          isAuthenticated: true,
          permissions: ["orders.write"]
        },
        {
          actionKey: "platform.orders.create",
          requiredPermissions: ["orders.write"],
          productionActionType: "commercial_write"
        }
      );
      assert.equal(response.handled, true);
      assert.equal(response.statusCode, 503);
      const body = response.body as Record<string, unknown>;
      assert.equal(body.error, "production_gate_blocked");
      assert.equal(body.mutationExecuted, false);
    }
  );
});

test("omnichannel reply production gate returns blocked before provider call", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      PERSISTENCE_MODE: "postgres",
      DATABASE_URL: undefined,
      POSTGRES_URL: undefined,
      AUTH_SESSION_SECRET: "secret",
      APP_BASE_URL: "https://app.example.com",
      API_BASE_URL: "https://api.example.com"
    },
    async () => {
      const response = await enforcePolicyForRoute(
        {
          tenantId: "tenant_1",
          userId: "user_admin",
          persistenceMode: "postgres",
          isAuthenticated: true,
          permissions: ["omnichannel.write", "integrations.write"]
        },
        {
          actionKey: "platform.omnichannel.reply",
          requiredPermissions: ["omnichannel.write", "integrations.write"],
          productionActionType: "omnichannel_reply",
          source: "api",
          channel: "whatsapp",
          idempotencyKey: "idem-1"
        }
      );
      assert.equal(response.handled, true);
      assert.equal(response.statusCode, 503);
      const body = response.body as Record<string, unknown>;
      assert.equal(body.error, "production_gate_blocked");
      assert.equal(body.externalProviderCallExecuted, false);
    }
  );
});

test("ai source cannot bypass production gate", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      PERSISTENCE_MODE: "postgres",
      DATABASE_URL: undefined,
      POSTGRES_URL: undefined,
      AUTH_SESSION_SECRET: "secret",
      APP_BASE_URL: "https://app.example.com",
      API_BASE_URL: "https://api.example.com"
    },
    async () => {
      const response = await enforcePolicyForRoute(
        {
          tenantId: "tenant_1",
          userId: "user_ai",
          persistenceMode: "postgres",
          isAuthenticated: true,
          permissions: ["omnichannel.write", "integrations.write"]
        },
        {
          actionKey: "platform.ai.execute",
          requiredPermissions: ["omnichannel.write", "integrations.write"],
          source: "ai",
          channel: "api",
          idempotencyKey: "idem-ai-1"
        }
      );
      assert.equal(response.handled, true);
      assert.equal(response.statusCode, 503);
      const body = response.body as Record<string, unknown>;
      assert.equal(body.error, "production_gate_blocked");
    }
  );
});

test("worker foundation handlers are marked non-live for production", () => {
  resetWorkerJobHandlers();
  const handlers = listWorkerJobHandlers();
  const approvalDispatch = handlers.find((handler) => handler.jobType === "approval.execution.dispatch");
  assert.ok(approvalDispatch);
  assert.notEqual(approvalDispatch?.productionAllowed, true);
  assert.notEqual(approvalDispatch?.liveReady, true);
});

test("approval execution is blocked by production gate and does not mark approved", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      PERSISTENCE_MODE: "postgres",
      DATABASE_URL: undefined,
      POSTGRES_URL: undefined,
      AUTH_SESSION_SECRET: undefined
    },
    async () => {
      const repository = new InMemoryPendingApprovalRepository();
      repository.createPendingApprovalRequest({
        approvalRequestId: "apr_blocked",
        tenantId: "tenant_1",
        actorId: "user_1",
        actionKey: "platform.settings.update",
        reasons: ["policy_require_approval"],
        idempotencyKey: "idem_blocked"
      });

      const result = await executeApprovedPendingApproval({
        context: {
          tenantId: "tenant_1",
          userId: "approver_1",
          persistenceMode: "postgres",
          isAuthenticated: true
        },
        approvalRequestId: "apr_blocked",
        approverId: "approver_1",
        repositoryResolution: {
          repository,
          mode: "postgres",
          reasons: []
        },
        bridgeTrigger: async () => {
          throw new Error("should_not_run_bridge_when_gate_blocked");
        }
      });

      assert.equal(result.ok, false);
      assert.equal(result.status, "bridge_failed");
      assert.ok(result.reasons.includes("production_gate_blocked"));
      const latest = await repository.getPendingApprovalRequest("apr_blocked", "tenant_1");
      assert.equal(latest?.status, "pending");
    }
  );
});

test("action mapping classifies critical production actions", () => {
  assert.equal(mapActionKeyToProductionActionType("platform.users.create"), "user_management");
  assert.equal(mapActionKeyToProductionActionType("platform.settings.update"), "settings_update");
  assert.equal(mapActionKeyToProductionActionType("platform.documents.send"), "document_send");
  assert.equal(mapActionKeyToProductionActionType("platform.documents.generate"), "document_send");
  assert.equal(mapActionKeyToProductionActionType("platform.whatsapp.action_request.confirm"), "approval_execution");
});

test("safe read action does not get blocked when productionActionType is omitted", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      PERSISTENCE_MODE: "postgres",
      DATABASE_URL: undefined,
      POSTGRES_URL: undefined,
      AUTH_SESSION_SECRET: undefined
    },
    async () => {
      const response = await enforcePolicyForRoute(
        {
          tenantId: "tenant_1",
          userId: "user_admin",
          persistenceMode: "postgres",
          isAuthenticated: true,
          permissions: ["orders.read"]
        },
        {
          actionKey: "platform.orders.read",
          requiredPermissions: ["orders.read"]
        }
      );
      if (response.handled) {
        assert.notEqual(response.statusCode, 503);
      } else {
        assert.equal(response.handled, false);
      }
    }
  );
});
