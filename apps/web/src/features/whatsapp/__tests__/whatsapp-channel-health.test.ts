import assert from "node:assert/strict";
import test from "node:test";
import {
  MSG_WA_CHANNEL_WAITING,
  MSG_WA_CONNECTION_NOT_LIVE,
  MSG_WA_LIVE_WAITING,
  MSG_WA_QR_PLACEHOLDER
} from "../data/whatsapp-action-messages";
import { mapWhatsAppChannelHealthView } from "../utils/whatsapp-channel-health";

test("mapWhatsAppChannelHealthView uses demo-safe copy", () => {
  const view = mapWhatsAppChannelHealthView(null, null, { useDemoData: true });
  assert.equal(view.statusLine, MSG_WA_CONNECTION_NOT_LIVE);
  assert.equal(view.note, MSG_WA_QR_PLACEHOLDER);
  assert.equal(view.dotTone, "warn");
});

test("mapWhatsAppChannelHealthView never claims connected on healthy status alone", () => {
  const view = mapWhatsAppChannelHealthView(
    { status: "healthy", message: "Kanal baglandi ve gonderildi" },
    { connectionStatus: "pending" },
    { useDemoData: false }
  );
  assert.equal(view.statusLine, MSG_WA_LIVE_WAITING);
  assert.ok(!view.note.toLowerCase().includes("baglandi"));
  assert.ok(!view.note.toLowerCase().includes("gonderildi"));
});

test("mapWhatsAppChannelHealthView shows ready when session connected", () => {
  const view = mapWhatsAppChannelHealthView(
    { status: "healthy", message: "ok" },
    { connectionStatus: "connected" },
    { useDemoData: false }
  );
  assert.equal(view.statusLine, "Canlı bağlantı hazır");
  assert.equal(view.dotTone, "ok");
});

test("mapWhatsAppChannelHealthView falls back when health missing", () => {
  const view = mapWhatsAppChannelHealthView(null, null, { useDemoData: false });
  assert.equal(view.statusLine, MSG_WA_LIVE_WAITING);
  assert.equal(view.note, MSG_WA_CHANNEL_WAITING);
});

