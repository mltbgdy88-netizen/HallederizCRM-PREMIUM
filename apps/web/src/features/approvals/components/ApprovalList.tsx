import type { ApprovalInboxItem } from "../types";
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
        <span>Action</span>
        <span>Durum</span>
        <span>Talep</span>
      </div>
      <div className="hz-approvals-inbox-list-body" role="listbox" aria-label="Bekleyen onaylar">
        {items.map((item) => (
          <button
            key={item.approvalRequestId}
            type="button"
            role="option"
            aria-selected={selectedId === item.approvalRequestId}
            className={`hz-approvals-inbox-list-item${selectedId === item.approvalRequestId ? " is-selected" : ""}`}
            onClick={() => onSelect(item.approvalRequestId)}
          >
            <span className="hz-approvals-inbox-list-action">{item.actionKey}</span>
            <ApprovalStatusBadge status={item.status} />
            <span className="hz-approvals-inbox-list-meta">
              <span>{item.actorId}</span>
              <span>{new Date(item.requestedAt).toLocaleString("tr-TR")}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
