import assert from "node:assert/strict";
import test from "node:test";
import { evaluatePolicy } from "@hallederiz/domain";
import { evaluatePolicyForContext } from "../shared/policy-bridge";
import type { RequestContext } from "../shared/request-context";

function baseRequest() {
  return {
    tenant: {
      id: "tenant_1",
      status: "active" as const,
      modules: ["core", "ai", "whatsapp", "erp"],
      features: ["premium.ai.operator", "premium.whatsapp", "premium.erp"]
    },
    actor: {
      type: "user" as const,
      id: "user_admin",
      roles: ["admin"],
      permissions: ["*"]
    },
    actionKey: "customer.read",
    channel: "crm_ui" as const,
    environment: "development" as const
  };
}

test("evaluatePolicy returns deny for unknown actionKey", () => {
  const decision = evaluatePolicy({
    ...baseRequest(),
    actionKey: "unknown.action"
  });

  assert.equal(decision.decision, "deny");
  assert.ok(decision.reasons.includes("unknown_action"));
});

test("critical mutation returns require_approval even with permission", () => {
  const decision = evaluatePolicy({
    ...baseRequest(),
    actionKey: "order.create",
    actor: {
      ...baseRequest().actor,
      permissions: ["orders.write", "order.create"]
    }
  });

  assert.equal(decision.decision, "require_approval");
  assert.ok(decision.reasons.includes("approval_required_for_critical_action"));
});

test("AI critical execution attempt is blocked behind approval", () => {
  const decision = evaluatePolicy({
    ...baseRequest(),
    actionKey: "finance.payment.create",
    actor: {
      ...baseRequest().actor,
      type: "ai",
      permissions: ["ai.proposal.create", "payments.write"]
    }
  });

  assert.equal(decision.decision, "require_approval");
  assert.ok(decision.reasons.includes("ai_critical_execution_requires_human_approval"));
});

test("feature disabled returns deny", () => {
  const decision = evaluatePolicy({
    ...baseRequest(),
    actionKey: "erp.sync.write",
    tenant: {
      ...baseRequest().tenant,
      features: []
    },
    actor: {
      ...baseRequest().actor,
      permissions: ["erp.write", "integrations.write"]
    }
  });

  assert.equal(decision.decision, "deny");
  assert.ok(decision.reasons.includes("required_feature_disabled"));
});

test("policy bridge maps RequestContext to policy request", () => {
  const context: RequestContext = {
    tenantId: "tenant_1",
    userId: "user_admin",
    persistenceMode: "demo",
    isAuthenticated: true,
    roles: ["admin"],
    permissions: ["customers.read"]
  };

  const decision = evaluatePolicyForContext(context, "customer.read", {
    tenantFeatures: ["core.customer"],
    tenantModules: ["core"]
  });

  assert.equal(decision.decision, "allow");
});

