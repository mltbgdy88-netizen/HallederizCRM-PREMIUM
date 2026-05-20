const SENSITIVE_KEY_PATTERN =
  /phone|email|token|accessToken|refreshToken|password|secret|apiKey|webhookSecret|authorization/i;

export function redactAuditPayload(payload: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      output[key] = "[redacted]";
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = redactAuditPayload(value as Record<string, unknown>);
      continue;
    }
    output[key] = value;
  }
  return output;
}
