import assert from "node:assert/strict";
import test from "node:test";
import { channelLabel, mapProviderHealthLabel, sanitizeUserErrorMessage } from "../lib/omnichannel-ui";

test("channel labels are Turkish", () => {
  assert.equal(channelLabel("web_chat"), "Web sohbet");
  assert.equal(channelLabel("whatsapp"), "WhatsApp");
});

test("provider health labels avoid raw technical reasons", () => {
  const label = mapProviderHealthLabel({
    ok: false,
    mode: "degraded",
    reasons: ["instagram_provider_not_configured"]
  });
  assert.equal(label, "Geçici olarak alınamıyor");
});

test("sanitizeUserErrorMessage hides technical errors", () => {
  assert.equal(sanitizeUserErrorMessage("provider_not_configured"), "İletişim merkezi şu anda kullanılamıyor.");
  assert.equal(sanitizeUserErrorMessage("Failed to fetch"), "İletişim merkezi şu anda kullanılamıyor.");
});

test("AI suggestion panel copy does not claim auto-send", () => {
  const disclaimer = "AI önerisi — insan onayı olmadan gönderilmez.";
  assert.ok(disclaimer.includes("insan onayı"));
  assert.ok(!disclaimer.toLowerCase().includes("otomatik gönder"));
});
