import assert from "node:assert/strict";
import test from "node:test";
import { normalizeWhatsAppHealthSnapshot } from "../utils/normalize-whatsapp-health";

test("normalizeWhatsAppHealthSnapshot maps health item details", () => {
  const snapshot = normalizeWhatsAppHealthSnapshot({
    status: "healthy",
    message: "Provider ready",
    mode: "live",
    details: { ready: true, state: "ready" }
  });
  assert.ok(snapshot);
  assert.equal(snapshot?.ready, true);
  assert.equal(snapshot?.state, "ready");
  assert.equal(snapshot?.status, "healthy");
});

test("normalizeWhatsAppHealthSnapshot returns null for invalid payload", () => {
  assert.equal(normalizeWhatsAppHealthSnapshot(null), null);
  assert.equal(normalizeWhatsAppHealthSnapshot("x"), null);
});
