export type ErpHealthSnapshot = {
  status: string;
  mode: string;
  configured: boolean;
  reason: string;
  provider?: string;
};

/** Maps GET /health/erp item to the channel health view model. */
export function normalizeErpHealthSnapshot(item: unknown): ErpHealthSnapshot | null {
  if (!item || typeof item !== "object") {
    return null;
  }
  const record = item as Record<string, unknown>;
  const details =
    record.details && typeof record.details === "object" && !Array.isArray(record.details)
      ? (record.details as Record<string, unknown>)
      : undefined;
  const provider = typeof details?.provider === "string" ? details.provider : undefined;

  return {
    status: typeof record.status === "string" ? record.status : "unknown",
    mode: typeof record.mode === "string" ? record.mode : "unknown",
    configured: record.configured === true,
    reason: typeof record.reason === "string" ? record.reason : "",
    provider
  };
}
