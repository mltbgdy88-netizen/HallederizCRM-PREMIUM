import type { Approval } from "@hallederiz/types";
import { listApprovalsQuery } from "../../approvals/queries/index";
import { formatTrDateTime } from "../../../lib/reference/formatters";
import {
  getOkmDetailForId,
  OKM_ACTIONS,
  OKM_KPIS,
  OKM_PAGE,
  OKM_PAGINATION,
  OKM_PENDING,
  type OkmKpi,
  type OkmPendingItem
} from "../data/onaylar-komut-masasi-mock";

export type OnaylarReferenceSnapshot = {
  page: typeof OKM_PAGE;
  kpis: OkmKpi[];
  pending: OkmPendingItem[];
  pagination: typeof OKM_PAGINATION;
  actions: typeof OKM_ACTIONS;
  demoBanner: string | null;
  getDetailForId: (id: string) => ReturnType<typeof getOkmDetailForId>;
};

function approvalIcon(type: Approval["type"]): OkmPendingItem["icon"] {
  if (type.includes("stock")) return "stock";
  if (type.includes("customer")) return "customer";
  if (type.includes("document")) return "document";
  if (type.includes("payment") || type.includes("finance")) return "finance";
  return "stock";
}

function mapApprovalItem(approval: Approval): OkmPendingItem {
  return {
    id: approval.id,
    title: approval.payloadSummary || approval.approvalNo,
    ref: `${approval.entityNo} • ${approval.type}`,
    requester: approval.requestedByName,
    dateTime: formatTrDateTime(approval.createdAt),
    status: "Bekliyor",
    icon: approvalIcon(approval.type)
  };
}

function buildLiveDetail(approval: Approval) {
  return {
    title: approval.payloadSummary || approval.approvalNo,
    ref: `${approval.entityNo} • ${approval.type}`,
    dateTime: formatTrDateTime(approval.createdAt),
    priority: approval.riskNote ? "Yüksek" : "Orta",
    requesterLabel: "Talep Eden",
    requester: approval.requestedByName,
    requesterRole: approval.requestedRole,
    departmentLabel: "Departman",
    department: approval.requestedRole,
    description: approval.payloadSummary,
    productTitle: "Onay Özeti",
    productFields: [
      { label: "Onay No", value: approval.approvalNo },
      { label: "Varlık", value: approval.entityNo },
      { label: "Tip", value: approval.type },
      { label: "Durum", value: approval.status }
    ],
    extraTitle: "Ek Bilgiler",
    extraFields: [
      { label: "Oluşturma", value: formatTrDateTime(approval.createdAt) },
      { label: "Son Tarih", value: approval.expiresAt ? formatTrDateTime(approval.expiresAt) : "—" }
    ],
    historyTitle: "İşlem Geçmişi",
    history: []
  };
}

function buildLiveSnapshot(approvals: Approval[]): OnaylarReferenceSnapshot {
  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const pending = pendingApprovals.map(mapApprovalItem);
  const detailById = Object.fromEntries(pendingApprovals.map((a) => [a.id, buildLiveDetail(a)]));

  const countByIcon = (icon: OkmPendingItem["icon"]) => pending.filter((p) => p.icon === icon).length;

  return {
    page: OKM_PAGE,
    kpis: [
      { id: "total", label: "Toplam Bekleyen", value: String(pending.length), tone: "green", icon: "hourglass" },
      { id: "stock", label: "Stok Onayı", value: String(countByIcon("stock")), tone: "gold", icon: "cart" },
      { id: "customer", label: "Müşteri Onayı", value: String(countByIcon("customer")), tone: "green", icon: "user" },
      { id: "document", label: "Belge Onayı", value: String(countByIcon("document")), tone: "green", icon: "document" },
      { id: "finance", label: "Finans Onayı", value: String(countByIcon("finance")), tone: "gold", icon: "finance" }
    ],
    pending,
    pagination: {
      totalLabel: `Toplam ${pending.length} kayıt`,
      pageSize: "10",
      page: 1
    },
    actions: OKM_ACTIONS,
    demoBanner: null,
    getDetailForId: (id) => {
      if (!pendingApprovals.length) {
        return loadOnaylarReferenceDemo().getDetailForId(id);
      }
      return detailById[id] ?? buildLiveDetail(pendingApprovals[0]!);
    }
  };
}

export function loadOnaylarReferenceDemo(): OnaylarReferenceSnapshot {
  return {
    page: OKM_PAGE,
    kpis: OKM_KPIS,
    pending: OKM_PENDING,
    pagination: OKM_PAGINATION,
    actions: OKM_ACTIONS,
    demoBanner: null,
    getDetailForId: getOkmDetailForId
  };
}

export async function loadOnaylarReferenceLive(): Promise<OnaylarReferenceSnapshot> {
  const approvals = await listApprovalsQuery();
  return buildLiveSnapshot(approvals);
}

export const ONAYLAR_REFERENCE_INITIAL = loadOnaylarReferenceDemo();
