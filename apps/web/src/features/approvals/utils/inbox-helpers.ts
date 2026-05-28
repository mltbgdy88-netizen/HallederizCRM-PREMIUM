import type {
  ApprovalClientError,
  ApprovalInboxItem,
  ApprovalInboxStatus,
  ApprovalInboxStatusFilter,
  ApprovalSandboxAvailabilityResponse,
  WorkerHealthResponse
} from "../types";

export type ApprovalInboxSortMode = "newest" | "oldest" | "actionKey";

export interface ApprovalInboxStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export function filterInboxItems(items: ApprovalInboxItem[], filter: ApprovalInboxStatusFilter): ApprovalInboxItem[] {
  if (filter === "all") {
    return items;
  }
  return items.filter((item) => item.status === filter);
}

export function summarizeGateDecision(gate?: Record<string, unknown> | null): string {
  if (!gate || typeof gate !== "object") {
    return "Gate karari API yaniti ile gelmedi.";
  }
  const allowed = gate.allowed;
  const mode = gate.mode;
  const blockers = Array.isArray(gate.blockers) ? gate.blockers.filter((b): b is string => typeof b === "string") : [];
  const reasons = Array.isArray(gate.reasons) ? gate.reasons.filter((b): b is string => typeof b === "string") : [];
  const parts: string[] = [];
  if (typeof allowed === "boolean") parts.push(`allowed=${allowed}`);
  if (typeof mode === "string") parts.push(`mode=${mode}`);
  if (blockers.length) parts.push(`blockers: ${blockers.join(", ")}`);
  if (reasons.length) parts.push(`reasons: ${reasons.join(", ")}`);
  return parts.length ? parts.join(" · ") : "Gate detayi bos.";
}

/** Liste ve arama için tek satır özet (pending öncelikli). */
export function getApprovalWaitingReasonSummary(item: ApprovalInboxItem): string {
  if (item.status === "rejected") {
    const r = item.rejectReason?.trim();
    if (r) return r;
    const first = item.reasons.find((x) => x.trim());
    return first?.trim() ?? "Red gerekcesi belirtilmedi.";
  }

  if (item.status === "pending") {
    const fromReasons = item.reasons.map((x) => x.trim()).filter(Boolean).join(" · ");
    if (fromReasons) return fromReasons;
    const bridge = (item.bridgeReasons ?? []).map((x) => x.trim()).filter(Boolean).join(" · ");
    if (bridge) return bridge;
    const gate = summarizeGateDecision(item.gateDecision);
    if (gate !== "Gate karari API yaniti ile gelmedi." && gate !== "Gate detayi bos.") {
      return gate;
    }
    return "Bekleme nedeni API yanitinda belirtilmedi.";
  }

  return "—";
}

export function searchInboxItems(items: ApprovalInboxItem[], query: string): ApprovalInboxItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return items;
  }
  return items.filter((item) => {
    const haystack = [
      item.approvalRequestId,
      item.actionKey,
      item.actorId,
      item.idempotencyKey,
      ...item.reasons,
      ...(item.bridgeReasons ?? []),
      getApprovalWaitingReasonSummary(item),
      summarizeGateDecision(item.gateDecision),
      item.rejectReason ?? ""
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function sortInboxItems(items: ApprovalInboxItem[], sort: ApprovalInboxSortMode): ApprovalInboxItem[] {
  const next = [...items];
  if (sort === "actionKey") {
    return next.sort((left, right) => left.actionKey.localeCompare(right.actionKey, "tr"));
  }
  return next.sort((left, right) => {
    const leftTime = Date.parse(left.requestedAt || left.createdAt);
    const rightTime = Date.parse(right.requestedAt || right.createdAt);
    return sort === "newest" ? rightTime - leftTime : leftTime - rightTime;
  });
}

export function computeInboxStats(items: ApprovalInboxItem[]): ApprovalInboxStats {
  return {
    total: items.length,
    pending: items.filter((item) => item.status === "pending").length,
    approved: items.filter((item) => item.status === "approved").length,
    rejected: items.filter((item) => item.status === "rejected").length
  };
}

export function buildActiveFilterSummary(input: {
  filter: ApprovalInboxStatusFilter;
  query: string;
  sort: ApprovalInboxSortMode;
  visibleCount: number;
  totalCount: number;
}): string {
  const parts: string[] = [];
  if (input.filter !== "all") {
    parts.push(`Durum: ${input.filter}`);
  }
  if (input.query.trim()) {
    parts.push(`Arama: "${input.query.trim()}"`);
  }
  parts.push(`Siralama: ${input.sort}`);
  parts.push(`${input.visibleCount}/${input.totalCount} kayit`);
  return parts.join(" · ");
}

export function isApprovalActionAvailable(item: ApprovalInboxItem | null | undefined): boolean {
  return item?.status === "pending";
}

const INBOX_STATUSES: ApprovalInboxStatus[] = ["pending", "approved", "rejected", "expired", "cancelled"];

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const v = record[key];
  return typeof v === "string" ? v : undefined;
}

function readBoolean(record: Record<string, unknown>, key: string): boolean | undefined {
  const v = record[key];
  return typeof v === "boolean" ? v : undefined;
}

function readRecord(record: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const v = record[key];
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return undefined;
}

/** Maps API list/detail item to UI model; drops invalid rows instead of fabricating data. */
export function normalizeApproval(raw: unknown): ApprovalInboxItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const status = r.status;
  if (typeof status !== "string" || !INBOX_STATUSES.includes(status as ApprovalInboxStatus)) {
    return null;
  }
  const approvalRequestId = readString(r, "approvalRequestId");
  const tenantId = readString(r, "tenantId");
  const actorId = readString(r, "actorId");
  const actionKey = readString(r, "actionKey");
  const idempotencyKey = readString(r, "idempotencyKey");
  const requestedAt = readString(r, "requestedAt");
  const createdAt = readString(r, "createdAt");
  const updatedAt = readString(r, "updatedAt");
  if (!approvalRequestId || !tenantId || !actorId || !actionKey || !idempotencyKey || !requestedAt || !createdAt || !updatedAt) {
    return null;
  }
  const reasons = Array.isArray(r.reasons) ? r.reasons.filter((x): x is string => typeof x === "string") : [];
  const auditRequired = readBoolean(r, "auditRequired") ?? true;
  const timelineRequired = readBoolean(r, "timelineRequired") ?? true;
  const payload = readRecord(r, "payload");
  const gateDecision = readRecord(r, "gateDecision");

  return {
    approvalRequestId,
    tenantId,
    actorId,
    actionKey,
    status: status as ApprovalInboxStatus,
    reasons,
    payload,
    idempotencyKey,
    requestedAt,
    createdAt,
    updatedAt,
    auditRequired,
    timelineRequired,
    approvedBy: readString(r, "approvedBy"),
    approvedAt: readString(r, "approvedAt"),
    rejectedBy: readString(r, "rejectedBy"),
    rejectedAt: readString(r, "rejectedAt"),
    rejectReason: readString(r, "rejectReason"),
    executionId: readString(r, "executionId"),
    outboxJobId: readString(r, "outboxJobId"),
    bridgeReasons: Array.isArray(r.bridgeReasons)
      ? r.bridgeReasons.filter((x): x is string => typeof x === "string")
      : undefined,
    bridgeTransactionMode: readString(r, "bridgeTransactionMode"),
    bridgePersistenceMode: readString(r, "bridgePersistenceMode"),
    approvalPersisted: readBoolean(r, "approvalPersisted"),
    workerProcessingRecommended: readBoolean(r, "workerProcessingRecommended"),
    auditTimelineWritebackQueued: readBoolean(r, "auditTimelineWritebackQueued"),
    gateDecision
  };
}

export function mapApprovalStatusLabel(status: ApprovalInboxStatus): string {
  switch (status) {
    case "pending":
      return "Bekliyor";
    case "approved":
      return "Onaylandi";
    case "rejected":
      return "Reddedildi";
    case "expired":
      return "Suresi doldu";
    case "cancelled":
      return "Iptal";
    default:
      return status;
  }
}

export function mapRuntimeErrorMessage(error: ApprovalClientError): string {
  return mapApprovalUiErrorMessage(error);
}

export function canApproveApproval(item: ApprovalInboxItem | null | undefined): boolean {
  return item?.status === "pending";
}

export function canRejectApproval(
  item: ApprovalInboxItem | null | undefined,
  reasonDraft: string
): { ok: true } | { ok: false; message: string } {
  if (item?.status !== "pending") {
    return { ok: false, message: "Yalnizca bekleyen kayitlar reddedilebilir." };
  }
  const reasonError = validateRejectReason(reasonDraft);
  if (reasonError) {
    return { ok: false, message: reasonError };
  }
  return { ok: true };
}

export function summarizeWorkerHealth(worker: WorkerHealthResponse | null | undefined): string {
  if (!worker) return "Worker health verisi yok.";
  if (!worker.ok) return worker.message || worker.error || "Worker health kullanilamiyor.";
  const h = worker.health;
  if (!h) return "Worker health govdesi bos.";
  const summary = h.summary;
  const countBits: string[] = [];
  const c = worker.counts;
  if (c) {
    countBits.push(`kuyruk bekleyen=${c.pending} claim=${c.claimed} hata=${c.failed} dlq=${c.deadLetter}`);
  }
  if (summary) {
    const dup = typeof summary.duplicates === "number" ? ` dup=${summary.duplicates}` : "";
    countBits.push(
      `tick processed=${summary.processed} ok=${summary.completed} fail=${summary.failed} dlq=${summary.deadLettered} retry=${summary.retried}${dup}`
    );
  }
  if (countBits.length) {
    return `mode=${h.mode} workerId=${h.workerId} · ${countBits.join(" · ")}`;
  }
  return `mode=${h.mode} workerId=${h.workerId}`;
}

export function isSandboxAvailable(
  availability: ApprovalSandboxAvailabilityResponse | null | undefined,
  buildTimeNodeEnv: string | undefined
): boolean {
  if (buildTimeNodeEnv === "production") {
    return false;
  }
  return Boolean(availability?.sandboxSeedAvailable);
}

export function validateRejectReason(reason: string): string | null {
  if (!reason.trim()) {
    return "Reddetme nedeni yazin.";
  }
  return null;
}

export function mapApprovalUiErrorMessage(error: ApprovalClientError): string {
  if (error.kind === "unauthorized") {
    return "Oturum süresi doldu. Tekrar giriş yapın.";
  }
  if (error.kind === "forbidden") {
    return "Bu işlem için yetkiniz yok.";
  }
  if (error.kind === "unsupported") {
    return "Onay servisi şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.";
  }
  if (error.kind === "not_found") {
    return "Onay kaydı bulunamadı.";
  }
  if (error.kind === "conflict") {
    return "Kayıt zaten işlendi veya bu adım tekrarlanamaz.";
  }
  if (error.kind === "invalid_request") {
    return "İstek geçersiz. Zorunlu alanları kontrol edin.";
  }
  if (error.kind === "network") {
    return "Bağlantı kurulamadı. Sunucuya erişilemiyor.";
  }
  const raw = error.message?.trim();
  if (raw && !/api|mock|fallback|dispatcher|worker|outbox|mutation|execution|not_configured/i.test(raw)) {
    return raw;
  }
  return "Onay verisi alınamadı.";
}

/** Aciklayici metin: aksiyonlar neden kapali (pending disi veya secim yok). */
export function describeApprovalActionDisabledReason(item: ApprovalInboxItem | null | undefined): string | null {
  if (!item) {
    return "Once listeden bir onay secin.";
  }
  if (item.status !== "pending") {
    return `Bu kayit durumu "${mapApprovalStatusLabel(item.status)}"; Onayla/Reddet yalnizca bekleyen kayitlarda aciktir.`;
  }
  return null;
}

