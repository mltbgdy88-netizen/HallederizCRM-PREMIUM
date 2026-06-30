import assert from "node:assert/strict";
import test from "node:test";
import { FACTORY_MUTATION_DEMO_MESSAGES } from "../utils/factory-mutation-messages";
import {
  canOperateFactoryIntegration,
  canOperateFactoryRecord,
  mapFactoryChannelHealthView
} from "../utils/map-factory-channel-view";
import { normalizeFactoryHealthSnapshot } from "../utils/normalize-factory-health";

test("normalizeFactoryHealthSnapshot maps health item", () => {
  const snapshot = normalizeFactoryHealthSnapshot({
    status: "healthy",
    mode: "live",
    configured: true,
    reason: "Fabrika canli baglanti hazir.",
    details: { provider: "live" }
  });
  assert.ok(snapshot);
  assert.equal(snapshot?.configured, true);
  assert.equal(snapshot?.mode, "live");
});

test("mapFactoryChannelHealthView live configured", () => {
  const view = mapFactoryChannelHealthView(
    { status: "healthy", mode: "live", configured: true, reason: "Hazır" },
    { useDemoData: false }
  );
  assert.equal(view.dotTone, "ok");
});

test("mapFactoryChannelHealthView demo mode", () => {
  const view = mapFactoryChannelHealthView(null, { useDemoData: true });
  assert.equal(view.dotTone, "warn");
  assert.match(view.statusLine, /demo/i);
});

test("canOperateFactoryIntegration blocks error health in live mode", () => {
  assert.equal(
    canOperateFactoryIntegration({ status: "error", mode: "live", configured: false, reason: "fail" }, false),
    false
  );
  assert.equal(
    canOperateFactoryIntegration({ status: "healthy", mode: "mock", configured: true, reason: "ok" }, false),
    true
  );
});

test("canOperateFactoryRecord requires active factory in live mode", () => {
  assert.equal(canOperateFactoryRecord({ active: true }, false), true);
  assert.equal(canOperateFactoryRecord({ active: false }, false), false);
  assert.equal(canOperateFactoryRecord(null, true), false);
});

import {
  latestFactoryOrderLog,
  logsForFactoryOrderRecord,
  sortFactoryIntegrationLogsDesc
} from "../utils/sort-factory-integration-logs";

test("sortFactoryIntegrationLogsDesc orders newest first", () => {
  const sorted = sortFactoryIntegrationLogsDesc([
    {
      id: "a",
      tenantId: "tenant_1",
      integrationType: "factory",
      integrationId: "factory_int_1",
      level: "info",
      message: "older",
      createdAt: "2026-04-28T08:00:00.000Z"
    },
    {
      id: "b",
      tenantId: "tenant_1",
      integrationType: "factory",
      integrationId: "factory_int_1",
      level: "info",
      message: "newer",
      createdAt: "2026-04-28T10:00:00.000Z"
    }
  ]);
  assert.equal(sorted[0]?.id, "b");
});

test("latestFactoryOrderLog returns newest matching record", () => {
  const logs = sortFactoryIntegrationLogsDesc([
    {
      id: "log_1",
      tenantId: "tenant_1",
      integrationType: "factory",
      integrationId: "factory_int_1",
      level: "info",
      message: "sent",
      createdAt: "2026-04-28T10:00:00.000Z",
      entityType: "factory_order",
      entityId: "factory_order_1"
    },
    {
      id: "log_2",
      tenantId: "tenant_1",
      integrationType: "factory",
      integrationId: "factory_int_1",
      level: "warning",
      message: "older",
      createdAt: "2026-04-28T08:00:00.000Z",
      entityType: "factory_order",
      entityId: "factory_order_1"
    }
  ]);
  const latest = latestFactoryOrderLog(logs, { id: "factory_order_1", factoryOrderNo: "FO-221" });
  assert.equal(latest?.id, "log_1");
  assert.equal(logsForFactoryOrderRecord(logs, { id: "factory_order_1", factoryOrderNo: "FO-221" }).length, 2);
});

test("factory mutation demo messages are user-facing", () => {
  assert.match(FACTORY_MUTATION_DEMO_MESSAGES.testChannel, /demo/i);
  assert.match(FACTORY_MUTATION_DEMO_MESSAGES.syncStock, /demo/i);
  assert.match(FACTORY_MUTATION_DEMO_MESSAGES.sendOrder, /demo/i);
});
