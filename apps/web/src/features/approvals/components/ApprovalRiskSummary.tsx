import type { ApprovalInboxItem } from "../types";

export function ApprovalRiskSummary({ item }: { item: ApprovalInboxItem }) {
  return (
    <section className="hz-approvals-inbox-card" aria-label="Risk ozeti">
      <h3 className="hz-approvals-inbox-card-title">Risk ve politika</h3>
      <dl className="hz-approvals-inbox-meta">
        <div>
          <dt>Action key</dt>
          <dd>{item.actionKey}</dd>
        </div>
        <div>
          <dt>Audit gerekli</dt>
          <dd>{item.auditRequired ? "Evet" : "Hayir"}</dd>
        </div>
        <div>
          <dt>Timeline gerekli</dt>
          <dd>{item.timelineRequired ? "Evet" : "Hayir"}</dd>
        </div>
        <div>
          <dt>Persistence mode</dt>
          <dd>{item.bridgePersistenceMode ?? "foundation"}</dd>
        </div>
      </dl>
      {item.reasons.length ? (
        <ul className="hz-approvals-inbox-reasons">
          {item.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : (
        <p className="hz-approvals-inbox-muted">Gerekce kaydi yok.</p>
      )}
    </section>
  );
}
