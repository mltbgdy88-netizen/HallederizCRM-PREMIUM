import type { ApprovalInboxStatus } from "./types";

const LABELS: Record<ApprovalInboxStatus, string> = {
  bekliyor: "BEKLİYOR",
  incelemede: "İNCELEMEDE",
  onay_bekliyor: "ONAY BEKLİYOR",
  sure_asildi: "SÜRE AŞILDI"
};

export function StatusBadge({ status }: { status: ApprovalInboxStatus }) {
  return (
    <span className={`hz-approvals-inbox-status hz-approvals-inbox-status--${status}`}>
      {LABELS[status]}
    </span>
  );
}
