import { formatUserFacingMode } from "../../../lib/user-facing-labels";
import type { ApprovalInboxItem } from "../types";

export function ApprovalRiskSummary({ item }: { item: ApprovalInboxItem }) {
  return (
    <section className="hz-approvals-inbox-card" aria-label="Risk özeti">
      <h3 className="hz-approvals-inbox-card-title">Risk ve politika</h3>
      <dl className="hz-approvals-inbox-meta">
        <div>
          <dt>Aksiyon anahtarı</dt>
          <dd>{item.actionKey}</dd>
        </div>
        <div>
          <dt>Denetim izi gerekli</dt>
          <dd>{item.auditRequired ? "Evet" : "Hayır"}</dd>
        </div>
        <div>
          <dt>Zaman akışı gerekli</dt>
          <dd>{item.timelineRequired ? "Evet" : "Hayır"}</dd>
        </div>
        <div>
          <dt>Kalıcılık modu</dt>
          <dd>{formatUserFacingMode(item.bridgePersistenceMode ?? "foundation")}</dd>
        </div>
      </dl>
      {item.reasons.length ? (
        <ul className="hz-approvals-inbox-reasons">
          {item.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : (
        <p className="hz-approvals-inbox-muted">Gerekçe kaydı yok.</p>
      )}
    </section>
  );
}
