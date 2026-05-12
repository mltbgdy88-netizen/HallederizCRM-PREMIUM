import assert from "node:assert/strict";
import test from "node:test";
import { enforcePolicyDecision } from "../shared/policy-bridge";
import {
  getPendingApprovalPersistenceMode,
  resetPendingApprovalRuntimeForTests,
  resolvePendingApprovalRepository
} from "../shared/approval-repository-runtime";

async function withEnv<T>(env: Partial<NodeJS.ProcessEnv>, run: () => T | Promise<T>): Promise<T> {
  const prev: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(env)) {
    prev[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return await run();
  } finally {
    for (const [key, value] of Object.entries(prev)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("runtime resolver returns in-memory repository in development demo mode", async () => {
  await withEnv({ NODE_ENV: "development", PERSISTENCE_MODE: "demo", POSTGRES_URL: undefined, DATABASE_URL: undefined }, async () => {
    resetPendingApprovalRuntimeForTests();
    const resolved = resolvePendingApprovalRepository({
      tenantId: "tenant_1",
      userId: "user_1",
      persistenceMode: "demo"
    });
    assert.equal(resolved.mode, "memory");
    assert.ok(resolved.repository);
    assert.equal(getPendingApprovalPersistenceMode({ tenantId: "tenant_1", userId: "user_1", persistenceMode: "demo" }), "memory");
  });
});

test("runtime resolver is explicit unsupported in production demo mode", async () => {
  await withEnv({ NODE_ENV: "production", PERSISTENCE_MODE: "demo", POSTGRES_URL: undefined, DATABASE_URL: undefined }, async () => {
    resetPendingApprovalRuntimeForTests();
    const resolved = resolvePendingApprovalRepository({
      tenantId: "tenant_1",
      userId: "user_1",
      persistenceMode: "demo"
    });
    assert.equal(resolved.mode, "unsupported");
    assert.equal(resolved.repository, null);
  });
});

test("runtime resolver requires postgres URL in postgres mode", async () => {
  await withEnv({ NODE_ENV: "production", PERSISTENCE_MODE: "postgres", POSTGRES_URL: undefined, DATABASE_URL: undefined }, async () => {
    resetPendingApprovalRuntimeForTests();
    const resolved = resolvePendingApprovalRepository({
      tenantId: "tenant_1",
      userId: "user_1",
      persistenceMode: "postgres"
    });
    assert.equal(resolved.mode, "unsupported");
    assert.equal(resolved.repository, null);
  });
});

test("runtime resolver selects postgres adapter when postgres URL exists", async () => {
  await withEnv({ NODE_ENV: "production", PERSISTENCE_MODE: "postgres", POSTGRES_URL: "postgres://localhost:5432/demo" }, async () => {
    resetPendingApprovalRuntimeForTests();
    const resolved = resolvePendingApprovalRepository({
      tenantId: "tenant_1",
      userId: "user_1",
      persistenceMode: "postgres"
    });
    assert.equal(resolved.mode, "postgres");
    assert.ok(resolved.repository);
  });
});

test("policy bridge uses runtime resolver and returns persistence metadata", async () => {
  await withEnv({ NODE_ENV: "development", PERSISTENCE_MODE: "demo" }, async () => {
    resetPendingApprovalRuntimeForTests();
    const result = await enforcePolicyDecision(
      {
        decision: "require_approval",
        actionKey: "platform.users.create",
        reasons: ["critical_mutation_requires_approval"]
      },
      {
        tenantId: "tenant_1",
        userId: "user_1",
        persistenceMode: "demo"
      }
    );

    assert.equal(result.handled, true);
    if (!result.handled) return;
    assert.equal(result.statusCode, 202);
    assert.equal(result.body.approvalPersistenceMode, "memory");
    assert.equal(result.body.approvalPersisted, true);
  });
});

test("policy bridge does not fail-open when runtime repository is unsupported", async () => {
  await withEnv({ NODE_ENV: "production", PERSISTENCE_MODE: "demo", POSTGRES_URL: undefined, DATABASE_URL: undefined }, async () => {
    resetPendingApprovalRuntimeForTests();
    const result = await enforcePolicyDecision(
      {
        decision: "require_approval",
        actionKey: "platform.users.create",
        reasons: ["critical_mutation_requires_approval"]
      },
      {
        tenantId: "tenant_1",
        userId: "user_1",
        persistenceMode: "demo"
      }
    );

    assert.equal(result.handled, true);
    if (!result.handled) return;
    assert.equal(result.statusCode, 503);
    assert.equal(result.body.approvalPersistenceMode, "unsupported");
    assert.equal(result.body.approvalPersisted, false);
  });
});
