import type { ApprovalInboxItem } from "../types";
import { ApprovalActionBar } from "./ApprovalActionBar";
import { ApprovalOutboxStatusCard } from "./ApprovalOutboxStatusCard";
import { ApprovalRiskSummary } from "./ApprovalRiskSummary";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";
import { ApprovalTimelinePreview } from "./ApprovalTimelinePreview";
import { EmptyState } from "./ApprovalInboxStates";

export function ApprovalDetailPanel({
  item,
  busy,
  onApprove,
  onReject
}: {
  item: ApprovalInboxItem | null;
  busy: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  if (!item) {
    return (
      <aside className="hz-approvals-inbox-detail">
        <EmptyState title="Onay secin" description="Listeden bir kayit secerek detay, risk ve aksiyonlari goruntuleyin." />
      </aside>
    );
  }

  return (
    <aside className="hz-approvals-inbox-detail" aria-labelledby="approval-detail-title">
      <header className="hz-approvals-inbox-detail-head">
        <p className="hz-approvals-inbox-eyebrow">Approval request</p>
        <h2 id="approval-detail-title">{item.approvalRequestId}</h2>
        <ApprovalStatusBadge status={item.status} />
      </header>

      <section className="hz-approvals-inbox-card">
        <h3 className="hz-approvals-inbox-card-title">Ozet</h3>
        <dl className="hz-approvals-inbox-meta">
          <div>
            <dt>Tenant</dt>
            <dd>{item.tenantId}</dd>
          </div>
          <div>
            <dt>Actor</dt>
            <dd>{item.actorId}</dd>
          </div>
          <div>
            <dt>Idempotency</dt>
            <dd>{item.idempotencyKey}</dd>
          </div>
        </dl>
        <pre className="hz-approvals-inbox-payload">{JSON.stringify(item.payload ?? {}, null, 2)}</pre>
      </section>

      <ApprovalRiskSummary item={item} />
      <ApprovalTimelinePreview item={item} />
      <ApprovalOutboxStatusCard item={item} />
      <ApprovalActionBar item={item} busy={busy} onApprove={onApprove} onReject={onReject} />
    </aside>
  );
}
