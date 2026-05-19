import assert from "node:assert/strict";
import test from "node:test";
import { MSG_WA_CONNECTION_REQUIRED, MSG_WA_OUTBOUND_QUEUE } from "../data/whatsapp-action-messages";
import {
  canSendWhatsAppOutbound,
  mapWhatsAppOutboundOutcome
} from "../utils/whatsapp-outbound-feedback";

test("canSendWhatsAppOutbound requires connected session in live mode", () => {
  assert.equal(canSendWhatsAppOutbound(null, true), false);
  assert.equal(canSendWhatsAppOutbound({ connectionStatus: "pending" }, false), false);
  assert.equal(canSendWhatsAppOutbound({ connectionStatus: "connected" }, false), true);
});

test("mapWhatsAppOutboundOutcome uses queue language unless delivered", () => {
  assert.equal(
    mapWhatsAppOutboundOutcome({
      id: "m1",
      tenantId: "t1",
      conversationId: "c1",
      direction: "outbound",
      type: "text",
      body: "test",
      sentAt: "2026-01-01T00:00:00.000Z",
      status: "queued"
    }),
    MSG_WA_OUTBOUND_QUEUE
  );
  assert.equal(
    mapWhatsAppOutboundOutcome({
      id: "m2",
      tenantId: "t1",
      conversationId: "c1",
      direction: "outbound",
      type: "text",
      body: "test",
      sentAt: "2026-01-01T00:00:00.000Z",
      status: "delivered"
    }),
    "Mesaj iletildi."
  );
});

test("mapWhatsAppOutboundOutcome handles missing message", () => {
  assert.equal(mapWhatsAppOutboundOutcome(undefined), MSG_WA_CONNECTION_REQUIRED);
});
