import assert from "node:assert/strict";
import test from "node:test";
import { verifyWebhookTimestamp } from "../shared/webhook-security";

test("webhook timestamp within tolerance passes", () => {
  const now = 1_700_000_000_000;
  assert.equal(verifyWebhookTimestamp(String(Math.floor(now / 1000)), 300, now), true);
});

test("webhook timestamp outside tolerance fails", () => {
  const now = 1_700_000_000_000;
  const stale = now - 400_000;
  assert.equal(verifyWebhookTimestamp(String(Math.floor(stale / 1000)), 300, now), false);
});

test("webhook timestamp missing fails closed", () => {
  assert.equal(verifyWebhookTimestamp(undefined, 300), false);
});
