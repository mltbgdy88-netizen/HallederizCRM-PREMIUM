import type { Approval, ApprovalStatus, ApprovalType } from "@hallederiz/types";
import type {
  ApprovalInboxCategory,
  ApprovalInboxPriority,
  ApprovalInboxRecord,
  ApprovalInboxStatus,
  ApprovalInboxViewId
} from "./types";

const TYPE_LABELS: Record<ApprovalType, string> = {
  order_high_value: "Yüksek Tutar",
  delivery_payment_missing: "Eksik Tahsilat",
  return_approval: "İade",
  price_override: "Fiyat İndirimi",
  ai_action_proposal: "AI",
  manual_operation: "Operasyon"
};

function mapStatus(status: ApprovalStatus): ApprovalInboxStatus {
  if (status === "approved") return "onay_bekliyor";
  if (status === "rejected") return "incelemede";
  if (status === "expired") return "sure_asildi";
  if (status === "executed") return "incelemede";
  return "bekliyor";
}

function mapCategory(type: ApprovalType): ApprovalInboxCategory {
  if (type === "ai_action_proposal") return "ai";
  if (type === "return_approval") return "operasyon";
  if (type === "price_override") return "satis";
  if (type === "manual_operation") return "operasyon";
  return "finans";
}

function mapPriority(type: ApprovalType): ApprovalInboxPriority {
  if (type === "ai_action_proposal") return "ai";
  if (type === "order_high_value" || type === "delivery_payment_missing") return "yuksek";
  if (type === "return_approval") return "orta";
  return "dusuk";
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function amountFromPayload(payload: Record<string, unknown>): string | null {
  const candidates = ["amount", "total", "price", "impactAmount"];
  for (const key of candidates) {
    const value = payload[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);
    }
  }
  return null;
}

function extractBranch(payload: Record<string, unknown>): string {
  const value = payload.branch;
  return typeof value === "string" && value.trim() ? value : "Merkez";
}

function extractTenant(payload: Record<string, unknown>, tenantId: string): string {
  const value = payload.tenantName;
  if (typeof value === "string" && value.trim()) return value;
  return tenantId;
}

function extractCustomer(payloadSummary: string, entityNo: string): string {
  const source = payloadSummary.trim();
  if (source) return source;
  return entityNo || "—";
}

function buildViews(record: { category: ApprovalInboxCategory; priority: ApprovalInboxPriority; status: ApprovalStatus }): ApprovalInboxViewId[] {
  const views: ApprovalInboxViewId[] = ["tum"];
  if (record.priority === "kritik") views.push("kritik");
  if (record.category === "finans") views.push("finans");
  if (record.category === "operasyon") views.push("operasyon");
  if (record.category === "ai") views.push("ai_onerileri");
  if (record.status !== "pending") views.push("yakin_sonuclanan");
  return views;
}

export function mapApprovalToInboxRecord(approval: Approval, currentUserId?: string): ApprovalInboxRecord {
  const payload = approval.payload ?? {};
  const category = mapCategory(approval.type);
  const priority = mapPriority(approval.type);
  const status = mapStatus(approval.status);
  const amount = amountFromPayload(payload);
  const title = `${TYPE_LABELS[approval.type]} Onayı`;
  const requestedAtLabel = formatDate(approval.createdAt);
  const deadlineLabel = formatDate(approval.expiresAt);
  const customerName = extractCustomer(approval.payloadSummary, approval.entityNo);
  const branch = extractBranch(payload);
  const tenant = extractTenant(payload, approval.tenantId);
  const assigneeName = approval.decidedByName ?? approval.requestedByName;
  const assigneeRole = approval.requestedRole || "Onay Sorumlusu";

  return {
    id: approval.id,
    approvalNo: approval.approvalNo,
    title,
    priority,
    status,
    category,
    viewTags: buildViews({ category, priority, status: approval.status }),
    assignedToMe:
      approval.requestedBy === currentUserId ||
      approval.decidedBy === currentUserId ||
      (approval.status === "pending" && !currentUserId),
    recentlyResolved: approval.status !== "pending",
    entityLabel: approval.entityNo || approval.entityType,
    workflowLabel: `${approval.entityType} → ${approval.policySnapshot.serverActionKey ?? "Onay Akışı"}`,
    customerName,
    typeLabel: TYPE_LABELS[approval.type],
    amountLabel: amount ?? (approval.payloadSummary || "—"),
    slaLabel: approval.expiresAt ? `${deadlineLabel}` : "SLA tanımlı değil",
    slaBreached: approval.status === "expired",
    assigneeName,
    assigneeRole,
    updatedAt: formatDate(approval.decidedAt ?? approval.createdAt),
    summary: {
      typeLabel: TYPE_LABELS[approval.type],
      priorityLabel: priority.toUpperCase(),
      amountTry: amount ?? (approval.payloadSummary || "—"),
      relatedRecordLabel: approval.entityNo || `${approval.entityType} kaydı`,
      relatedRecordHref: `/${approval.entityType === "ai_proposal" ? "ai/onaylar" : "onaylar"}/${approval.id}`,
      requesterName: approval.requestedByName,
      requestedAt: requestedAtLabel,
      slaDeadline: deadlineLabel
    },
    riskLevel: approval.status === "expired" ? "kritik" : undefined,
    riskBullets: approval.riskNote ? [approval.riskNote] : [],
    contextLinks: [{ label: `Varlık: ${approval.entityNo || approval.entityType}`, href: "/onaylar" }],
    timeline: [
      { id: `${approval.id}-created`, label: "Talep oluşturuldu", at: formatDate(approval.createdAt) },
      ...(approval.decidedAt ? [{ id: `${approval.id}-decided`, label: "Karar verildi", at: formatDate(approval.decidedAt) }] : [])
    ],
    internalNote: {
      author: approval.decidedByName ?? "Sistem",
      body: approval.riskNote || approval.policySnapshot.reason || "Ek not bulunmuyor.",
      at: formatDate(approval.decidedAt ?? approval.createdAt)
    },
    meta: {
      tenant,
      branch,
      requester: approval.requestedByName,
      requestedAt: requestedAtLabel
    },
    raw: approval
  };
}