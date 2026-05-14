export interface LocalAiEndpointValidationResult {
  configured: boolean;
  allowed: boolean;
  value: string;
  reason?: string;
  host?: string;
}

interface LocalAiEndpointValidationInput {
  rawUrl: string | undefined;
  fallbackUrl: string;
  allowPublicUrls?: boolean;
}

function parseIpv4(host: string): number[] | null {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return null;
  const octets = host.split(".").map((item) => Number(item));
  if (octets.some((item) => !Number.isInteger(item) || item < 0 || item > 255)) return null;
  return octets;
}

function isPrivateIpv4(host: string): boolean {
  const octets = parseIpv4(host);
  if (!octets) return false;
  const first = octets[0];
  const second = octets[1];
  if (first === undefined || second === undefined) return false;
  if (first === 10) return true;
  if (first === 192 && second === 168) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  return false;
}

function isLoopbackHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function normalizeHost(host: string) {
  return host.trim().toLowerCase().replace(/\.+$/, "");
}

export function validateLocalAiEndpointUrl(input: LocalAiEndpointValidationInput): LocalAiEndpointValidationResult {
  const candidate = (input.rawUrl ?? input.fallbackUrl).trim();
  if (!candidate) {
    return {
      configured: false,
      allowed: false,
      value: candidate,
      reason: "local_ai_url_missing"
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      configured: false,
      allowed: false,
      value: candidate,
      reason: "local_ai_url_invalid"
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      configured: false,
      allowed: false,
      value: candidate,
      reason: "local_ai_url_protocol_not_allowed"
    };
  }

  if (parsed.username || parsed.password) {
    return {
      configured: false,
      allowed: false,
      value: candidate,
      reason: "local_ai_url_credentials_not_allowed"
    };
  }

  const host = normalizeHost(parsed.hostname);
  if (!host) {
    return {
      configured: false,
      allowed: false,
      value: candidate,
      reason: "local_ai_url_host_missing"
    };
  }

  const isAllowedHost = isLoopbackHost(host) || isPrivateIpv4(host);
  if (!isAllowedHost && input.allowPublicUrls !== true) {
    return {
      configured: true,
      allowed: false,
      value: candidate,
      host,
      reason: "local_ai_url_not_allowed"
    };
  }

  return {
    configured: true,
    allowed: true,
    value: candidate.replace(/\/+$/, ""),
    host
  };
}
