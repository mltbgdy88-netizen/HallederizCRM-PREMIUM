import assert from "node:assert/strict";
import test from "node:test";
import { listEntityTimeline } from "../shared/entity-timeline-service";
import type { RequestContext } from "../shared/request-context";

test("entity timeline returns memory items for demo context", async () => {
  const context: RequestContext = {
    tenantId: "tenant_1",
    userId: "user_1",
    persistenceMode: "demo",
    permissions: ["customers.read"]
  };
  const result = await listEntityTimeline(context, "customer", "customer_missing");
  assert.equal(Array.isArray(result.items), true);
  assert.ok(result.mode === "memory" || result.mode === "postgres");
});
