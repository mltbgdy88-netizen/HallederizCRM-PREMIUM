"use client";

import type { ApprovalInboxItem } from "../types";
import { ApprovalTaskCard } from "./ApprovalTaskCard";

export function ApprovalCardGrid({
  items,
  selectedId,
  onSelect,
  actionBusy,
  actingOnId,
  onApprove,
  onReject
}: {
  items: ApprovalInboxItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  actionBusy: boolean;
  actingOnId: string | null;
  onApprove: (approvalRequestId: string) => void;
  onReject: (approvalRequestId: string, reason: string) => void;
}) {
  return (
    <div className="hz-approvals-inbox-card-grid" role="list" aria-label="Onay kartları">
      {items.map((item) => (
        <div key={item.approvalRequestId} className="hz-approvals-inbox-card-grid-cell">
          <ApprovalTaskCard
            item={item}
            selected={selectedId === item.approvalRequestId}
            onSelect={onSelect}
            actionBusy={actionBusy}
            actingOnId={actingOnId}
            onApprove={onApprove}
            onReject={onReject}
          />
        </div>
      ))}
    </div>
  );
}
