import type { Approval, ApprovalStatus, ApprovalType } from "@hallederiz/types";
import { mapApprovalToInboxRecord } from "../components/inbox/map-approvals-to-inbox";
import type { ApprovalInboxRecord } from "../components/inbox/types";
import type { ApprovalInboxItem } from "../types";

function actionKeyToType(actionKey: string): ApprovalType {
  if (actionKey.includes("payment")) return "delivery_payment_missing";
  if (actionKey.includes("order")) return "order_high_value";
  if (actionKey.includes("offer")) return "manual_operation";
  if (actionKey.includes("ai")) return "ai_action_proposal";
  return "manual_operation";
}

function buildPayloadSummary(item: ApprovalInboxItem): string {
  const payload = item.payload ?? {};
  const customerName = typeof payload.customerName === "string" ? payload.customerName.trim() : "";
  const operationType = typeof payload.operationType === "string" ? payload.operationType : "";
  if (customerName && operationType) {
    return `${customerName} — ${operationType}`;
  }
  if (customerName) return customerName;
  return item.reasons.join("; ") || item.actionKey;
}

function enrichPayload(item: ApprovalInboxItem): Record<string, unknown> {
  const payload = { ...(item.payload ?? {}) };
  const totals = payload.totals;
  if (totals && typeof totals === "object" && !Array.isArray(totals)) {
    const grandTotal = (totals as { grandTotal?: unknown }).grandTotal;
    if (typeof grandTotal === "number" && Number.isFinite(grandTotal)) {
      payload.amount = grandTotal;
    }
  }
  return payload;
}

/** Maps platform approval queue rows to the command-desk inbox model. */
export function mapPlatformApprovalToInboxRecord(
  item: ApprovalInboxItem,
  currentUserId?: string
): ApprovalInboxRecord {
  const payload = enrichPayload(item);
  const customerName = typeof payload.customerName === "string" ? payload.customerName : "";
  const operationType = typeof payload.operationType === "string" ? payload.operationType : item.actionKey;

  const approval: Approval = {
    id: item.approvalRequestId as Approval["id"],
    tenantId: item.tenantId as Approval["tenantId"],
    approvalNo: item.approvalRequestId.replace(/_/g, "-").toUpperCase(),
    type: actionKeyToType(item.actionKey),
    status: item.status as ApprovalStatus,
    entityType: "offer",
    entityId: customerName || item.approvalRequestId,
    entityNo: operationType.toUpperCase(),
    requestedBy: item.actorId as Approval["requestedBy"],
    requestedByName: customerName || "Operasyon",
    requestedRole: "Yönetici",
    decidedBy: item.approvedBy as Approval["decidedBy"],
    decidedAt: item.approvedAt,
    createdAt: item.createdAt,
    riskNote: item.reasons.join("; ") || undefined,
    payloadSummary: buildPayloadSummary(item),
    payload,
    policySnapshot: {
      policyId: item.actionKey,
      requiredRole: "Yönetici",
      minApproverCount: 1,
      reason: item.reasons[0] ?? "Onay gerekli",
      serverActionKey: item.actionKey
    },
    execution: {
      executable: item.status === "approved"
    }
  };

  return mapApprovalToInboxRecord(approval, currentUserId);
}
