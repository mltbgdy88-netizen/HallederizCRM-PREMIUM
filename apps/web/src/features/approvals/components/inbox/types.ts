import type { Approval } from "@hallederiz/types";

export type ApprovalInboxPriority = "kritik" | "yuksek" | "orta" | "dusuk" | "ai";
export type ApprovalInboxStatus = "bekliyor" | "incelemede" | "onay_bekliyor" | "sure_asildi";
export type ApprovalInboxViewId =
  | "kritik"
  | "bana_atanan"
  | "finans"
  | "operasyon"
  | "ai_onerileri"
  | "tum"
  | "yakin_sonuclanan";

export type ApprovalInboxCategory = "finans" | "operasyon" | "satis" | "belge" | "ai";

export interface ApprovalInboxTimelineStep {
  id: string;
  label: string;
  at: string;
}

export interface ApprovalInboxContextLink {
  label: string;
  href: string;
}

export interface ApprovalInboxRecord {
  id: string;
  approvalNo: string;
  title: string;
  priority: ApprovalInboxPriority;
  status: ApprovalInboxStatus;
  category: ApprovalInboxCategory;
  viewTags: ApprovalInboxViewId[];
  assignedToMe: boolean;
  recentlyResolved: boolean;
  entityLabel: string;
  workflowLabel: string;
  customerName: string;
  typeLabel: string;
  amountLabel: string;
  slaLabel: string;
  slaBreached: boolean;
  assigneeName: string;
  assigneeRole: string;
  updatedAt: string;
  summary: {
    typeLabel: string;
    priorityLabel: string;
    amountTry: string;
    relatedRecordLabel: string;
    relatedRecordHref: string;
    requesterName: string;
    requestedAt: string;
    slaDeadline: string;
  };
  riskLevel?: "dusuk" | "orta" | "yuksek" | "kritik";
  riskBullets: string[];
  contextLinks: ApprovalInboxContextLink[];
  timeline: ApprovalInboxTimelineStep[];
  internalNote: { author: string; body: string; at: string };
  meta: {
    tenant: string;
    branch: string;
    requester: string;
    requestedAt: string;
  };
  raw: Approval;
}

