import type {
  ApprovalActionResponse,
  ApprovalClientError,
  ApprovalClientErrorKind,
  ApprovalDetailResponse,
  ApprovalInboxItem,
  ApprovalInboxStatus,
  ApprovalListResponse,
  ApprovalSandboxAvailabilityResponse,
  ApprovalSandboxSeedResponse,
  WorkerHealthResponse
} from "../types";

export const APPROVAL_API_PATHS = {
  list: "/platform/approvals",
  detail: (approvalRequestId: string) => `/platform/approvals/${approvalRequestId}`,
  approve: (approvalRequestId: string) => `/platform/approvals/${approvalRequestId}/approve`,
  reject: (approvalRequestId: string) => `/platform/approvals/${approvalRequestId}/reject`,
  sandboxAvailability: "/platform/approvals/sandbox/availability",
  sandboxSeed: "/platform/approvals/sandbox/seed",
  workerHealth: "/worker/health",
  workerSafety: "/worker/safety"
} as const;

export type ApprovalApiEndpointKind =
  | "approvals_list"
  | "approval_detail"
  | "approval_approve"
  | "approval_reject"
  | "approval_sandbox_availability"
  | "approval_sandbox_seed"
  | "worker_health"
  | "worker_safety";

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

function defaultApprovalClientErrorMessage(status: number, endpoint: ApprovalApiEndpointKind): string {
  if (status === 400) {
    return "Gecersiz istek (400). Validasyon veya zorunlu alanlar API tarafindan reddedildi.";
  }
  if (status === 401) {
    return "Kimlik dogrulama gerekli (401). Oturum token'i gecersiz veya eksik.";
  }
  if (status === 403) {
    return "Yetki yok (403). Bu islem icin gerekli izinler tenant/rol bazinda kapali olabilir.";
  }
  if (status === 404) {
    if (endpoint === "worker_health" || endpoint === "worker_safety") {
      return "Worker health/safety endpoint bu ortamda yayinlanmiyor (404). API route eslemesini kontrol edin.";
    }
    return "Approval endpoint bulunamadi (404). Foundation route eslemesi ve API surumu kontrol edilmelidir.";
  }
  if (status === 409) {
    return "Cakisma (409). Kayit zaten islendi veya mevcut durumda islem tekrarlanamaz.";
  }
  if (status === 503) {
    if (endpoint === "worker_health" || endpoint === "worker_safety") {
      return "Worker foundation hazir degil (503). Persistence veya repository baglantisi yok.";
    }
    return "Approval foundation hazir degil (503). Persistence baglantisi veya runtime modu uygun degil.";
  }
  if (status >= 500) {
    return `Sunucu hatasi (${status}). Approval API beklenmeyen hatayla dondu.`;
  }
  return `Approval API istegi tamamlanamadi (HTTP ${status}).`;
}

export function mapApprovalClientError(
  status: number,
  payload?: unknown,
  endpoint: ApprovalApiEndpointKind = "approvals_list"
): ApprovalClientError {
  const message = readErrorMessage(payload, defaultApprovalClientErrorMessage(status, endpoint));
  const reasons = readReasons(payload);
  let kind: ApprovalClientErrorKind = "unknown";
  if (status === 401) kind = "unauthorized";
  else if (status === 403) kind = "forbidden";
  else if (status === 404) kind = "not_found";
  else if (status === 503) kind = "unsupported";
  else if (status === 409) kind = "conflict";
  else if (status === 400) kind = "invalid_request";
  return { kind, status, message, reasons };
}

export function joinApprovalApiUrl(apiBaseUrl: string, path: string): string {
  const normalizedBase = apiBaseUrl.trim().replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
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
  endpoint: ApprovalApiEndpointKind,
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
    const response = await fetch(joinApprovalApiUrl(config.apiBaseUrl, path), {
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
      return { ok: false, error: mapApprovalClientError(response.status, payload, endpoint) };
    }
    return { ok: true, data: payload as T };
  } catch {
    return {
      ok: false,
      error: {
        kind: "network",
        message: "Ag hatasi: fetch basarisiz (sunucu erisilemiyor, CORS veya TLS)."
      }
    };
  }
}

export function createApprovalClient(config: ApprovalClientConfig) {
  return {
    listApprovals: () => requestJson<ApprovalListResponse>(config, APPROVAL_API_PATHS.list, "approvals_list"),
    getApproval: (approvalRequestId: string) =>
      requestJson<ApprovalDetailResponse>(config, APPROVAL_API_PATHS.detail(approvalRequestId), "approval_detail"),
    getSandboxAvailability: () =>
      requestJson<ApprovalSandboxAvailabilityResponse>(
        config,
        APPROVAL_API_PATHS.sandboxAvailability,
        "approval_sandbox_availability"
      ),
    seedSandboxApprovals: () =>
      requestJson<ApprovalSandboxSeedResponse>(config, APPROVAL_API_PATHS.sandboxSeed, "approval_sandbox_seed", {
        method: "POST",
        body: JSON.stringify({})
      }),
    approveApproval: (approvalRequestId: string) =>
      requestJson<ApprovalActionResponse>(config, APPROVAL_API_PATHS.approve(approvalRequestId), "approval_approve", {
        method: "POST",
        body: JSON.stringify({})
      }),
    rejectApproval: (approvalRequestId: string, reason?: string) =>
      requestJson<ApprovalActionResponse>(config, APPROVAL_API_PATHS.reject(approvalRequestId), "approval_reject", {
        method: "POST",
        body: JSON.stringify(buildApprovalRejectBody(reason))
      }),
    getWorkerHealth: () => requestJson<WorkerHealthResponse>(config, APPROVAL_API_PATHS.workerHealth, "worker_health"),
    getWorkerSafety: () => requestJson<WorkerHealthResponse>(config, APPROVAL_API_PATHS.workerSafety, "worker_safety")
  };
}

export type ApprovalClient = ReturnType<typeof createApprovalClient>;
