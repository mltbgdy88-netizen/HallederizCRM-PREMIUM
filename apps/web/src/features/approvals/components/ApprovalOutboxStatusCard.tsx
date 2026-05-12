import type { ApprovalInboxItem } from "../types";

export function ApprovalOutboxStatusCard({ item }: { item: ApprovalInboxItem }) {
  return (
    <section className="hz-approvals-inbox-card" aria-label="Outbox ve worker durumu">
      <h3 className="hz-approvals-inbox-card-title">Outbox / worker</h3>
      <dl className="hz-approvals-inbox-meta">
        <div>
          <dt>Outbox job</dt>
          <dd>{item.outboxJobId ?? "Henuz kuyruga alinmadi"}</dd>
        </div>
        <div>
          <dt>Worker processing</dt>
          <dd>{item.outboxJobId ? "Onerilen" : "Bekleniyor"}</dd>
        </div>
        <div>
          <dt>Audit writeback</dt>
          <dd>{item.auditRequired ? "Kuyrukta veya planli" : "Gerekli degil"}</dd>
        </div>
        <div>
          <dt>Timeline writeback</dt>
          <dd>{item.timelineRequired ? "Kuyrukta veya planli" : "Gerekli degil"}</dd>
        </div>
      </dl>
    </section>
  );
}
