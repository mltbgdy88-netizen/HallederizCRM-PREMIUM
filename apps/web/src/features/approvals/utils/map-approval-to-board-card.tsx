import type { Approval, ApprovalType } from "@hallederiz/types";
import {
  IconFileText,
  IconShieldCheck,
  IconSparkles,
  IconTag,
  IconTruck,
  QuickActionIcon
} from "../../dashboard/components/dashboard-inline-icons";
import type { ApprovalsBoardCard, ApprovalsBoardRiskKey } from "../types/approvals-board-card";

const nfTry = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 });

function approvalTypeToCategory(type: ApprovalType): string {
  switch (type) {
    case "order_high_value":
      return "SATIŞ";
    case "delivery_payment_missing":
      return "TESLİMAT";
    case "return_approval":
      return "İADE";
    case "price_override":
      return "SATIŞ";
    case "ai_action_proposal":
      return "AI PROPOSAL";
    case "manual_operation":
    default:
      return "SATIŞ";
  }
}

function approvalTypeToRisk(type: ApprovalType): ApprovalsBoardRiskKey {
  switch (type) {
    case "order_high_value":
    case "price_override":
      return "high";
    case "delivery_payment_missing":
      return "critical";
    case "return_approval":
      return "medium";
    case "ai_action_proposal":
      return "medium";
    case "manual_operation":
    default:
      return "normal";
  }
}

function approvalTypeToAccent(type: ApprovalType): string {
  switch (type) {
    case "order_high_value":
      return "#583bff";
    case "delivery_payment_missing":
      return "#f59e0b";
    case "return_approval":
      return "#dc2626";
    case "price_override":
      return "#7c3aed";
    case "ai_action_proposal":
      return "#0ea5e9";
    case "manual_operation":
    default:
      return "#64748b";
  }
}

function approvalTypeToIcon(type: ApprovalType) {
  switch (type) {
    case "order_high_value":
      return <QuickActionIcon kind="order" size={16} className="hz-approvals-card-ico-svg" />;
    case "delivery_payment_missing":
      return <IconTruck size={16} className="hz-approvals-card-ico-svg" />;
    case "return_approval":
      return <IconTag size={16} className="hz-approvals-card-ico-svg" />;
    case "price_override":
      return <IconShieldCheck size={16} className="hz-approvals-card-ico-svg" />;
    case "ai_action_proposal":
      return <IconSparkles size={16} className="hz-approvals-card-ico-svg" />;
    case "manual_operation":
      return <IconFileText size={16} className="hz-approvals-card-ico-svg" />;
    default:
      return <IconFileText size={16} className="hz-approvals-card-ico-svg" />;
  }
}

function amountFromPayload(payload: Record<string, unknown>): number | null {
  const raw = payload.amountTry ?? payload.amount ?? payload.totalTry;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = Number(raw.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function mapApprovalToBoardCard(approval: Approval): ApprovalsBoardCard {
  const amount = amountFromPayload(approval.payload);
  const summaryLine =
    amount !== null ? nfTry.format(amount) : approval.payloadSummary || approval.policySnapshot.reason || "—";

  const created = new Date(approval.createdAt);
  const dateLabel = Number.isNaN(created.getTime())
    ? approval.createdAt
    : created.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });

  return {
    id: approval.id,
    categoryLabel: approvalTypeToCategory(approval.type),
    risk: approvalTypeToRisk(approval.type),
    customer: approval.payloadSummary || approval.entityNo || "—",
    docLine: `${approval.entityType} · ${approval.approvalNo}`,
    summaryLine,
    description: approval.riskNote || approval.policySnapshot.reason || "Onay kaydı",
    date: dateLabel,
    rep: approval.requestedByName || approval.requestedBy,
    accent: approvalTypeToAccent(approval.type),
    icon: approvalTypeToIcon(approval.type)
  };
}
