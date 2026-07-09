import assert from "node:assert/strict";
import test from "node:test";
import {
  isAlternateProviderSelected,
  resolveAlternateProviderLabel,
  resolveMetaCloudBadge
} from "../utils/whatsapp-connection-methods";

test("resolveMetaCloudBadge returns preview mode in demo data", () => {
  const badge = resolveMetaCloudBadge(null, true);
  assert.equal(badge.label, "Önizleme modu");
  assert.equal(badge.tone, "warn");
});

test("resolveMetaCloudBadge returns ready when health is ready", () => {
  const badge = resolveMetaCloudBadge(
    { status: "healthy", message: "ok", state: "ready", ready: true },
    false
  );
  assert.equal(badge.label, "Canlı hazır");
  assert.equal(badge.tone, "ok");
});

test("resolveMetaCloudBadge returns not configured for disabled provider", () => {
  const badge = resolveMetaCloudBadge(
    { status: "disabled", message: "missing", state: "not_configured", ready: false },
    false
  );
  assert.equal(badge.label, "Yapılandırılmadı");
});

test("isAlternateProviderSelected detects twilio and custom", () => {
  assert.equal(isAlternateProviderSelected("twilio"), true);
  assert.equal(isAlternateProviderSelected("custom"), true);
  assert.equal(isAlternateProviderSelected("meta"), false);
});

test("resolveAlternateProviderLabel maps provider names", () => {
  assert.equal(resolveAlternateProviderLabel("twilio"), "Twilio");
  assert.equal(resolveAlternateProviderLabel("custom"), "Özel sağlayıcı");
  assert.equal(resolveAlternateProviderLabel("meta"), "Seçilmedi");
});
