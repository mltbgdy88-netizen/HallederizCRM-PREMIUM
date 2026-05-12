import { getApprovalStatusBadge } from "../api/approval-client";
import type { ApprovalInboxStatus } from "../types";

export function ApprovalStatusBadge({ status }: { status: ApprovalInboxStatus }) {
  const badge = getApprovalStatusBadge(status);
  return <span className={badge.className}>{badge.label}</span>;
}
