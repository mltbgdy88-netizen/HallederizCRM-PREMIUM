import type { ApprovalInboxItem } from "../types";
import { getApprovalWaitingReasonSummary } from "../utils/inbox-helpers";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";

export function ApprovalList({
  items,
  selectedId,
  onSelect
}: {
  items: ApprovalInboxItem[];
  selectedId: string | null;
  onSelect: (approvalRequestId: string) => void;
}) {
  return (
    <section className="hz-approvals-inbox-list" aria-label="Onay listesi">
      <div className="hz-approvals-inbox-list-head">
        <span>Aksiyon</span>
        <span>Durum</span>
        <span>Talep</span>
      </div>
      <div className="hz-approvals-inbox-list-body" role="listbox" aria-label="Bekleyen onaylar">
        {items.map((item) => {
          const waitReason = getApprovalWaitingReasonSummary(item);
          const ariaLabel = `${item.actionKey}, ${item.status}, ${waitReason}`;
          return (
            <button
              key={item.approvalRequestId}
              type="button"
              role="option"
              aria-selected={selectedId === item.approvalRequestId}
              aria-label={ariaLabel}
              title={waitReason}
              className={`hz-approvals-inbox-list-item${selectedId === item.approvalRequestId ? " is-selected" : ""}`}
              onClick={() => onSelect(item.approvalRequestId)}
            >
              <span className="hz-approvals-inbox-list-action">{item.actionKey}</span>
              <ApprovalStatusBadge status={item.status} />
              <span className="hz-approvals-inbox-list-meta">
                <span className="hz-approvals-inbox-list-meta-line">
                  <span>{item.actorId}</span>
                  <span>{new Date(item.requestedAt).toLocaleString("tr-TR")}</span>
                </span>
                <span className="hz-approvals-inbox-list-reason">{waitReason}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
