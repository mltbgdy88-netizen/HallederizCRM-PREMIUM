import type { ApprovalInboxItem } from "../types";

export function ApprovalOutboxStatusCard({ item }: { item: ApprovalInboxItem }) {
  return (
    <section className="hz-approvals-inbox-card" aria-label="Arka plan iş durumu">
      <h3 className="hz-approvals-inbox-card-title">Arka plan işleme</h3>
      <dl className="hz-approvals-inbox-meta">
        <div>
          <dt>İş kuyruğu no</dt>
          <dd>{item.outboxJobId ?? "Henüz kuyruğa alınmadı"}</dd>
        </div>
        <div>
          <dt>İşleme önerisi</dt>
          <dd>{item.outboxJobId ? "Önerilen" : "Bekleniyor"}</dd>
        </div>
        <div>
          <dt>Denetim kaydı</dt>
          <dd>{item.auditRequired ? "Kuyrukta veya planlı" : "Gerekli değil"}</dd>
        </div>
        <div>
          <dt>Zaman çizelgesi</dt>
          <dd>{item.timelineRequired ? "Kuyrukta veya planlı" : "Gerekli değil"}</dd>
        </div>
      </dl>
    </section>
  );
}
