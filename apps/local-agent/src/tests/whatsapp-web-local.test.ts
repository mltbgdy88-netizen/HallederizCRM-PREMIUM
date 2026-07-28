import assert from "node:assert/strict";
import test from "node:test";
import {
  FailClosedLocalWhatsAppWebMessageAdapter,
  StubLocalWhatsAppWebPairingEngine,
  resolveWhatsAppWebLocalFeatureFlag,
  type LocalWhatsAppWebSafeEvent,
  type LocalWhatsAppWebSafeEventSink
} from "../whatsapp-web-local";

const TEST_NOW = "2026-07-28T12:00:00.000Z";

function enabledFeature() {
  return resolveWhatsAppWebLocalFeatureFlag({
    NODE_ENV: "development",
    WHATSAPP_WEB_LOCAL_ENABLED: "true"
  });
}

test("whatsapp_web_local feature flag is disabled by default", () => {
  const decision = resolveWhatsAppWebLocalFeatureFlag({ NODE_ENV: "development" });
  assert.equal(decision.feature, "whatsapp_web_local");
  assert.equal(decision.enabled, false);
  assert.equal(decision.reasonCode, "whatsapp_web_local_disabled_by_default");
});

test("whatsapp_web_local feature flag is hard-denied in production", () => {
  const decision = resolveWhatsAppWebLocalFeatureFlag({
    NODE_ENV: "production",
    WHATSAPP_WEB_LOCAL_ENABLED: "true"
  });
  assert.equal(decision.enabled, false);
  assert.equal(decision.reasonCode, "whatsapp_web_local_production_hard_deny");

  const engine = new StubLocalWhatsAppWebPairingEngine({
    feature: enabledFeature(),
    runtimeEnvironment: { NODE_ENV: "production" },
    now: () => TEST_NOW
  });
  return engine.getStatus().then((status) => {
    assert.equal(status.state, "disabled");
    assert.equal(status.reasonCode, "whatsapp_web_local_production_hard_deny");
  });
});

test("stub pairing engine supports safe connection-state transitions without provider calls", async () => {
  const engine = new StubLocalWhatsAppWebPairingEngine({
    feature: enabledFeature(),
    now: () => TEST_NOW
  });

  assert.equal((await engine.getStatus()).state, "logged_out");
  assert.equal((await engine.start()).state, "starting");
  assert.equal(engine.transitionTo("qr_ready").state, "qr_ready");
  assert.equal(engine.transitionTo("connecting").state, "connecting");
  assert.equal(engine.transitionTo("connected").state, "connected");
  assert.equal(engine.transitionTo("reconnecting").state, "reconnecting");
  assert.equal(engine.transitionTo("connected").state, "connected");
  assert.equal((await engine.disconnect()).state, "logged_out");

  assert.equal((await engine.start()).state, "starting");
  assert.equal(engine.transitionTo("expired").state, "expired");
  assert.equal((await engine.refresh()).state, "starting");
  assert.equal(engine.transitionTo("error").state, "error");
  assert.equal((await engine.logout()).state, "logged_out");
  assert.equal((await engine.getStatus()).providerCallExecuted, false);
});

test("disabled pairing engine remains disabled", async () => {
  const engine = new StubLocalWhatsAppWebPairingEngine({
    feature: resolveWhatsAppWebLocalFeatureFlag({ NODE_ENV: "development" }),
    now: () => TEST_NOW
  });

  assert.equal((await engine.start()).state, "disabled");
  assert.equal((await engine.refresh()).state, "disabled");
  assert.equal((await engine.disconnect()).state, "disabled");
  assert.equal((await engine.logout()).state, "disabled");
  assert.equal(engine.transitionTo("connected").state, "disabled");
});

test("local WhatsApp Web outbound remains fail-closed", async () => {
  const engine = new StubLocalWhatsAppWebPairingEngine({
    feature: enabledFeature(),
    now: () => TEST_NOW
  });
  const adapter = new FailClosedLocalWhatsAppWebMessageAdapter(engine);

  const result = await adapter.sendMessage({
    tenantId: "tenant_test",
    conversationId: "conversation_test",
    body: "Bu mesaj dis saglayiciya gonderilmemelidir."
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "whatsapp_web_local_outbound_disabled");
  assert.equal(result.providerCallExecuted, false);
});

test("safe events never contain message, secret, QR, token, auth-state, or session data", async () => {
  const events: LocalWhatsAppWebSafeEvent[] = [];
  const eventSink: LocalWhatsAppWebSafeEventSink = {
    record: (event) => events.push(event)
  };
  const engine = new StubLocalWhatsAppWebPairingEngine({
    feature: enabledFeature(),
    eventSink,
    now: () => TEST_NOW
  });
  const adapter = new FailClosedLocalWhatsAppWebMessageAdapter(engine, eventSink, () => TEST_NOW);
  const sensitiveMarkers = [
    "SECRET_MARKER",
    "QR_CONTENT_MARKER",
    "TOKEN_MARKER",
    "AUTH_STATE_MARKER",
    "SESSION_MARKER"
  ];

  await engine.start();
  engine.transitionTo("qr_ready");
  await adapter.sendMessage({
    tenantId: "tenant_test",
    conversationId: "conversation_test",
    body: sensitiveMarkers.join(" ")
  });

  const allowedKeys = [
    "checkedAt",
    "event",
    "feature",
    "generation",
    "providerCallExecuted",
    "reasonCode",
    "state"
  ];
  for (const event of events) {
    assert.deepEqual(Object.keys(event).sort(), allowedKeys);
  }

  const serializedEvents = JSON.stringify(events);
  for (const marker of sensitiveMarkers) {
    assert.equal(serializedEvents.includes(marker), false);
  }
});
