"use client";

import { useState } from "react";
import type { ApprovalInboxItem } from "../types";
import { isApprovalActionAvailable, validateRejectReason, describeApprovalActionDisabledReason } from "../utils/inbox-helpers";

export function ApprovalActionBar({
  item,
  busy,
  onApprove,
  onReject
}: {
  item: ApprovalInboxItem;
  busy: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [rejectWarning, setRejectWarning] = useState<string | null>(null);
  const pending = isApprovalActionAvailable(item);
  const disabledHint = describeApprovalActionDisabledReason(item);

  const handleReject = () => {
    const validation = validateRejectReason(rejectReason);
    if (validation) {
      setRejectWarning(validation);
      return;
    }
    setRejectWarning(null);
    onReject(rejectReason);
  };

  return (
    <section className="hz-approvals-inbox-card hz-approvals-inbox-actionbar" aria-label="Onay aksiyonlari">
      <h3 className="hz-approvals-inbox-card-title">Operator aksiyonlari</h3>
      <label className="hz-approvals-inbox-field" htmlFor="approval-reject-reason">
        <span>Reddetme nedeni</span>
        <input
          type="text"
          name="rejectReason"
          className="hz-approvals-inbox-input"
          placeholder="Reddetme nedeni yazin"
          disabled={!pending || busy}
          value={rejectReason}
          onChange={(event) => {
            setRejectReason(event.target.value);
            if (rejectWarning) {
              setRejectWarning(null);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && pending && !busy) {
              handleReject();
            }
          }}
          id="approval-reject-reason"
        />
      </label>
      {rejectWarning ? <p className="hz-approvals-inbox-action-warning">{rejectWarning}</p> : null}
      <div className="hz-approvals-inbox-actions">
        <button
          type="button"
          className="hz-approvals-inbox-btn hz-approvals-inbox-btn--primary"
          disabled={!pending || busy}
          onClick={onApprove}
        >
          {busy ? "Onaylaniyor..." : "Onayla"}
        </button>
        <button
          type="button"
          className="hz-approvals-inbox-btn hz-approvals-inbox-btn--danger"
          disabled={!pending || busy}
          onClick={handleReject}
        >
          {busy ? "Reddediliyor..." : "Reddet"}
        </button>
      </div>
      {!pending && disabledHint ? <p className="hz-approvals-inbox-muted hz-approvals-inbox-action-disabled-reason">{disabledHint}</p> : null}
    </section>
  );
}
