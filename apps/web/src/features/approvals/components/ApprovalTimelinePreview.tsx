import type { ApprovalInboxItem } from "../types";

export function ApprovalTimelinePreview({ item }: { item: ApprovalInboxItem }) {
  const events = [
    item.requestedAt ? `Talep: ${new Date(item.requestedAt).toLocaleString("tr-TR")}` : null,
    item.approvedAt ? `Onay: ${new Date(item.approvedAt).toLocaleString("tr-TR")}` : null,
    item.rejectedAt ? `Red: ${new Date(item.rejectedAt).toLocaleString("tr-TR")}` : null,
    item.executionId ? `Execution: ${item.executionId}` : null
  ].filter(Boolean) as string[];

  return (
    <section className="hz-approvals-inbox-card" aria-label="Audit ve timeline onizleme">
      <h3 className="hz-approvals-inbox-card-title">Audit / timeline</h3>
      {events.length ? (
        <ul className="hz-approvals-inbox-timeline">
          {events.map((event) => (
            <li key={event}>{event}</li>
          ))}
        </ul>
      ) : (
        <p className="hz-approvals-inbox-muted">Timeline kaydi henuz yok.</p>
      )}
    </section>
  );
}
