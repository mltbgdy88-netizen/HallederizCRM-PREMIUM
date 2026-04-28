import type { LocalAgentStatus } from "@hallederiz/types";
import { loadSettings } from "../config";

function buildHeaders() {
  const settings = loadSettings();
  return {
    "content-type": "application/json",
    "x-tenant-id": settings.tenantId,
    "x-user-id": settings.userId,
    ...(settings.sessionToken ? { "x-session-token": settings.sessionToken, authorization: `Bearer ${settings.sessionToken}` } : {})
  };
}

export function reportLocalStatusPayload(status: LocalAgentStatus, message?: string) {
  return {
    status,
    version: "0.2.0",
    checkedAt: new Date().toISOString(),
    message
  };
}

export async function reportLocalStatus(status: LocalAgentStatus, message?: string) {
  const settings = loadSettings();
  const payload = reportLocalStatusPayload(status, message);
  await fetch(`${settings.apiBaseUrl}/local-agent/status`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  return payload;
}
