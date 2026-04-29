import { createHmac, timingSafeEqual } from "node:crypto";

function normalizeSignature(value: string | undefined | null): Buffer | null {
  if (!value?.trim()) return null;
  const normalized = value.trim().toLowerCase().replace(/^sha256=/, "");
  if (!/^[a-f0-9]{64}$/.test(normalized)) return null;
  return Buffer.from(normalized, "hex");
}

export function signHmacSha256Payload(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

export function verifyHmacSha256Signature(rawBody: string, providedSignature: string | undefined | null, secret: string): boolean {
  if (!secret.trim()) return false;
  const provided = normalizeSignature(providedSignature);
  if (!provided) return false;

  const expected = Buffer.from(signHmacSha256Payload(rawBody, secret), "hex");
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}
