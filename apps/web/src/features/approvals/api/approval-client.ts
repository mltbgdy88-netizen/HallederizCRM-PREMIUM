import type {
  ApprovalActionResponse,
  ApprovalClientError,
  ApprovalClientErrorKind,
  ApprovalDetailResponse,
  ApprovalInboxItem,
  ApprovalInboxStatus,
  ApprovalListResponse,
  WorkerHealthResponse
} from "../types";

export const APPROVAL_API_PATHS = {
  list: "/platform/approvals",
  detail: (approvalRequestId: string) => `/platform/approvals/${approvalRequestId}`,
  approve: (approvalRequestId: string) => `/platform/approvals/${approvalRequestId}/approve`,
  reject: (approvalRequestId: string) => `/platform/approvals/${approvalRequestId}/reject`,
  workerHealth: "/worker/health"
} as const;

export interface ApprovalClientConfig {
  apiBaseUrl: string;
  accessToken: string | null;
  tenantId: string;
}

type RequestResult<T> = { ok: true; data: T } | { ok: false; error: ApprovalClientError };

function readErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }
  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }
  if (typeof record.error === "string" && record.error.trim()) {
    return record.error;
  }
  return fallback;
}

function readReasons(payload: unknown): string[] | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }
  const reasons = (payload as Record<string, unknown>).reasons;
  if (!Array.isArray(reasons)) {
    return undefined;
  }
  return reasons.filter((reason): reason is string => typeof reason === "string");
}

export function mapApprovalClientError(status: number, payload?: unknown): ApprovalClientError {
  const message = readErrorMessage(payload, "Approval API istegi tamamlanamadi.");
  const reasons = readReasons(payload);
  let kind: ApprovalClientErrorKind = "unknown";
  if (status === 401) kind = "unauthorized";
  else if (status === 403) kind = "forbidden";
  else if (status === 404) kind = "not_found";
  else if (status === 503) kind = "unsupported";
  return { kind, status, message, reasons };
}

export function getApprovalStatusBadge(status: ApprovalInboxStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "pending":
      return { label: "Bekliyor", className: "hz-approvals-inbox-badge hz-approvals-inbox-badge--pending" };
    case "approved":
      return { label: "Onaylandi", className: "hz-approvals-inbox-badge hz-approvals-inbox-badge--approved" };
    case "rejected":
      return { label: "Reddedildi", className: "hz-approvals-inbox-badge hz-approvals-inbox-badge--rejected" };
    case "expired":
      return { label: "Suresi Doldu", className: "hz-approvals-inbox-badge hz-approvals-inbox-badge--expired" };
    case "cancelled":
      return { label: "Iptal", className: "hz-approvals-inbox-badge hz-approvals-inbox-badge--cancelled" };
    default:
      return { label: status, className: "hz-approvals-inbox-badge" };
  }
}

export function shouldShowEmptyState(items: ApprovalInboxItem[] | undefined, error?: ApprovalClientError | null): boolean {
  return !error && Array.isArray(items) && items.length === 0;
}

export function buildApprovalRejectBody(reason?: string): { reason?: string } {
  const trimmed = reason?.trim();
  return trimmed ? { reason: trimmed } : {};
}

async function requestJson<T>(
  config: ApprovalClientConfig,
  path: string,
  init?: RequestInit
): Promise<RequestResult<T>> {
  if (!config.accessToken) {
    return {
      ok: false,
      error: {
        kind: "unauthorized",
        message: "Oturum bulunamadi. Lutfen tekrar giris yapin."
      }
    };
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-session-token": config.accessToken,
        authorization: `Bearer ${config.accessToken}`,
        "x-tenant-id": config.tenantId,
        ...(init?.headers ?? {})
      },
      cache: "no-store"
    });

    const payload = (await response.json().catch(() => undefined)) as unknown;
    if (!response.ok) {
      return { ok: false, error: mapApprovalClientError(response.status, payload) };
    }
    return { ok: true, data: payload as T };
  } catch {
    return {
      ok: false,
      error: {
        kind: "network",
        message: "Approval API baglantisi kurulamadi."
      }
    };
  }
}

export function createApprovalClient(config: ApprovalClientConfig) {
  return {
    listApprovals: () => requestJson<ApprovalListResponse>(config, APPROVAL_API_PATHS.list),
    getApproval: (approvalRequestId: string) =>
      requestJson<ApprovalDetailResponse>(config, APPROVAL_API_PATHS.detail(approvalRequestId)),
    approveApproval: (approvalRequestId: string) =>
      requestJson<ApprovalActionResponse>(config, APPROVAL_API_PATHS.approve(approvalRequestId), {
        method: "POST",
        body: JSON.stringify({})
      }),
    rejectApproval: (approvalRequestId: string, reason?: string) =>
      requestJson<ApprovalActionResponse>(config, APPROVAL_API_PATHS.reject(approvalRequestId), {
        method: "POST",
        body: JSON.stringify(buildApprovalRejectBody(reason))
      }),
    getWorkerHealth: () => requestJson<WorkerHealthResponse>(config, APPROVAL_API_PATHS.workerHealth)
  };
}

export type ApprovalClient = ReturnType<typeof createApprovalClient>;
