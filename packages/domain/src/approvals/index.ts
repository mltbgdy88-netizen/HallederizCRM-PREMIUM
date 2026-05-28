import type { Approval, ApprovalStatus, ApprovalType, WorkflowEntityType } from "@hallederiz/types";

export interface ApprovalSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  executable: number;
  byType: Record<ApprovalType, number>;
}

export function buildApprovalSummary(approvals: Approval[]): ApprovalSummary {
  const initialByType = {} as Record<ApprovalType, number>;

  return approvals.reduce<ApprovalSummary>(
    (summary, approval) => ({
      total: summary.total + 1,
      pending: summary.pending + (approval.status === "pending" ? 1 : 0),
      approved: summary.approved + (approval.status === "approved" ? 1 : 0),
      rejected: summary.rejected + (approval.status === "rejected" ? 1 : 0),
      executable: summary.executable + (canExecuteApprovedAction(approval) ? 1 : 0),
      byType: {
        ...summary.byType,
        [approval.type]: (summary.byType[approval.type] ?? 0) + 1
      }
    }),
    { total: 0, pending: 0, approved: 0, rejected: 0, executable: 0, byType: initialByType }
  );
}

export function canExecuteApprovedAction(approval: Approval): boolean {
  return approval.status === "approved" && approval.execution.executable && Boolean(approval.policySnapshot.serverActionKey);
}

export function summarizeApprovalTarget(approval: Pick<Approval, "type" | "entityType" | "entityNo" | "payloadSummary">): string {
  const entityLabels: Record<WorkflowEntityType, string> = {
    offer: "Teklif",
    order: "Siparis",
    payment: "Tahsilat",
    warehouse_order: "Depo emri",
    delivery: "Teslimat",
    factory_order: "Fabrika siparisi",
    invoice: "Fatura",
    return: "Iade",
    customer: "Cari",
    product: "Urun",
    document: "Belge",
    ai_proposal: "AI proposal"
  };

  return `${entityLabels[approval.entityType]} ${approval.entityNo}: ${approval.payloadSummary}`;
}

export function nextApprovalStatus(status: ApprovalStatus, decision: "approve" | "reject" | "execute"): ApprovalStatus {
  if (status !== "pending" && decision !== "execute") {
    return status;
  }

  if (decision === "approve") {
    return "approved";
  }

  if (decision === "reject") {
    return "rejected";
  }

  return status === "approved" ? "executed" : status;
}
