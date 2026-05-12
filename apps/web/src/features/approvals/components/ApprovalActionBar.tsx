import type { ApprovalInboxItem } from "../types";

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
  const pending = item.status === "pending";
  return (
    <section className="hz-approvals-inbox-card hz-approvals-inbox-actionbar" aria-label="Onay aksiyonlari">
      <h3 className="hz-approvals-inbox-card-title">Operator aksiyonlari</h3>
      <label className="hz-approvals-inbox-field">
        <span>Red gerekcesi</span>
        <input
          type="text"
          name="rejectReason"
          className="hz-approvals-inbox-input"
          placeholder="Opsiyonel red gerekcesi"
          disabled={!pending || busy}
          onKeyDown={(event) => {
            if (event.key === "Enter" && pending && !busy) {
              onReject((event.currentTarget as HTMLInputElement).value);
            }
          }}
          id="approval-reject-reason"
        />
      </label>
      <div className="hz-approvals-inbox-actions">
        <button
          type="button"
          className="hz-approvals-inbox-btn hz-approvals-inbox-btn--primary"
          disabled={!pending || busy}
          onClick={onApprove}
        >
          Onayla
        </button>
        <button
          type="button"
          className="hz-approvals-inbox-btn hz-approvals-inbox-btn--danger"
          disabled={!pending || busy}
          onClick={() => {
            const input = document.getElementById("approval-reject-reason") as HTMLInputElement | null;
            onReject(input?.value ?? "");
          }}
        >
          Reddet
        </button>
      </div>
      {!pending ? <p className="hz-approvals-inbox-muted">Bu kayit pending degil; aksiyonlar kapali.</p> : null}
    </section>
  );
}
