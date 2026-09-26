import assert from "node:assert/strict";
import test from "node:test";
import { collectWebhookRawBody, WebhookPayloadTooLargeError, WEBHOOK_MAX_BODY_BYTES } from "../shared/webhook-raw-body";

async function* chunks(values: Array<Buffer | string>) {
  for (const value of values) yield value;
}

test("webhook raw body collector accepts payloads up to 1 MiB", async () => {
  const payload = Buffer.alloc(WEBHOOK_MAX_BODY_BYTES, "a");
  const result = await collectWebhookRawBody(chunks([payload]));
  assert.equal(result.length, WEBHOOK_MAX_BODY_BYTES);
});

test("webhook raw body collector rejects payloads over 1 MiB with 413 contract", async () => {
  const payload = Buffer.alloc(WEBHOOK_MAX_BODY_BYTES + 1, "a");
  await assert.rejects(
    collectWebhookRawBody(chunks([payload])),
    (error: unknown) => {
      assert.ok(error instanceof WebhookPayloadTooLargeError);
      assert.equal((error as WebhookPayloadTooLargeError).statusCode, 413);
      assert.equal((error as WebhookPayloadTooLargeError).code, "payload_too_large");
      return true;
    }
  );
});

test("webhook raw body collector enforces the limit across chunks", async () => {
  await assert.rejects(
    collectWebhookRawBody(chunks([Buffer.alloc(WEBHOOK_MAX_BODY_BYTES), "x"])),
    WebhookPayloadTooLargeError
  );
});
