export const WEBHOOK_MAX_BODY_BYTES = 1024 * 1024;

export class WebhookPayloadTooLargeError extends Error {
  readonly statusCode = 413;
  readonly code = "payload_too_large";

  constructor() {
    super("payload_too_large");
    this.name = "WebhookPayloadTooLargeError";
  }
}

export async function collectWebhookRawBody(
  payload: AsyncIterable<Buffer | string>,
  maxBytes = WEBHOOK_MAX_BODY_BYTES
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of payload) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > maxBytes) {
      throw new WebhookPayloadTooLargeError();
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks, total);
}
