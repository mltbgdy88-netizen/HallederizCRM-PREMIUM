import type { ApprovalInboxItem } from "../types";

export function ApprovalTimelinePreview({ item }: { item: ApprovalInboxItem }) {
  const events = [
    item.requestedAt ? `Talep: ${new Date(item.requestedAt).toLocaleString("tr-TR")}` : null,
    item.approvedAt ? `Onay: ${new Date(item.approvedAt).toLocaleString("tr-TR")}` : null,
    item.rejectedAt ? `Red: ${new Date(item.rejectedAt).toLocaleString("tr-TR")}` : null,
    item.executionId ? `Çalıştırma: ${item.executionId}` : null
  ].filter(Boolean) as string[];

  return (
    <section className="hz-approvals-inbox-card" aria-label="Denetim izi ve zaman akışı önizleme">
      <h3 className="hz-approvals-inbox-card-title">Denetim izi / zaman akışı</h3>
      {events.length ? (
        <ul className="hz-approvals-inbox-timeline">
          {events.map((event) => (
            <li key={event}>{event}</li>
          ))}
        </ul>
      ) : (
        <p className="hz-approvals-inbox-muted">Zaman akışı kaydı henüz yok.</p>
      )}
    </section>
  );
}
