import assert from "node:assert/strict";
import test from "node:test";
import { normalizeErpHealthSnapshot } from "../utils/normalize-erp-health";
import { canOperateErpConnection, canOperateErpIntegration, mapErpChannelHealthView } from "../utils/map-erp-channel-view";

test("normalizeErpHealthSnapshot maps health item", () => {
  const snapshot = normalizeErpHealthSnapshot({
    status: "healthy",
    mode: "live",
    configured: true,
    reason: "ERP canli baglanti hazir.",
    details: { provider: "live" }
  });
  assert.ok(snapshot);
  assert.equal(snapshot?.configured, true);
  assert.equal(snapshot?.mode, "live");
});

test("mapErpChannelHealthView live configured", () => {
  const view = mapErpChannelHealthView(
    { status: "healthy", mode: "live", configured: true, reason: "Hazır" },
    { useDemoData: false }
  );
  assert.equal(view.dotTone, "ok");
});

test("mapErpChannelHealthView demo mode", () => {
  const view = mapErpChannelHealthView(null, { useDemoData: true });
  assert.equal(view.dotTone, "warn");
  assert.match(view.statusLine, /demo/i);
});

test("canOperateErpIntegration blocks error health in live mode", () => {
  assert.equal(
    canOperateErpIntegration({ status: "error", mode: "live", configured: false, reason: "fail" }, false),
    false
  );
  assert.equal(
    canOperateErpIntegration({ status: "healthy", mode: "mock", configured: true, reason: "ok" }, false),
    true
  );
});

test("canOperateErpConnection requires active connection in live mode", () => {
  assert.equal(canOperateErpConnection({ active: true, status: "healthy" }, false), true);
  assert.equal(canOperateErpConnection({ active: false, status: "healthy" }, false), false);
  assert.equal(canOperateErpConnection(null, true), false);
});
