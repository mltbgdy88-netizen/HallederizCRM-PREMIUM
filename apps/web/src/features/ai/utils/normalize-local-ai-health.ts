export type LocalAiHealthSnapshot = {
  state: string;
  provider: string;
  configured: boolean;
  ready: boolean;
  status: string;
  message: string;
  reasonCode?: string;
};

/** Maps GET /health/local-ai item to the channel health view model. */
export function normalizeLocalAiHealthSnapshot(item: unknown): LocalAiHealthSnapshot | null {
  if (!item || typeof item !== "object") {
    return null;
  }
  const record = item as Record<string, unknown>;
  return {
    state: typeof record.state === "string" ? record.state : "unknown",
    provider: typeof record.provider === "string" ? record.provider : "unknown",
    configured: record.configured === true,
    ready: record.ready === true,
    status: typeof record.status === "string" ? record.status : "unknown",
    message: typeof record.message === "string" ? record.message : "",
    reasonCode: typeof record.reasonCode === "string" ? record.reasonCode : undefined
  };
}
