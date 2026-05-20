import assert from "node:assert/strict";
import test from "node:test";
import { evaluateProductionReadiness } from "../shared/production-readiness-runtime";

test("production readiness exposes mutation and worker safety flags", async () => {
  const report = await evaluateProductionReadiness({
    tenantId: "tenant_1",
    userId: "user_1",
    persistenceMode: "demo"
  });

  assert.equal(typeof report.mutationSafe, "boolean");
  assert.equal(typeof report.readOnlySafe, "boolean");
  assert.equal(typeof report.workerSafe, "boolean");
  assert.equal(typeof report.providerSafe, "boolean");
  assert.ok(Array.isArray(report.checks));
});

test("demo persistence flags are blockers in readiness report", async () => {
  const previous = process.env.PERSISTENCE_MODE;
  process.env.PERSISTENCE_MODE = "demo";
  const report = await evaluateProductionReadiness({
    tenantId: "tenant_1",
    userId: "user_1",
    persistenceMode: "demo"
  });
  if (previous === undefined) {
    delete process.env.PERSISTENCE_MODE;
  } else {
    process.env.PERSISTENCE_MODE = previous;
  }
  assert.ok(report.blockers.includes("persistence_mode_demo_blocked"));
});
