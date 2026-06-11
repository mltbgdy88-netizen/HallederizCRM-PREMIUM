import type { WorkflowInstance, WorkflowStep } from "@hallederiz/types";
import Link from "next/link";

const statusLabels: Record<WorkflowStep["status"], string> = {
  pending: "Bekliyor",
  active: "Aktif",
  completed: "Tamamlandı",
  skipped: "Atlandı",
  failed: "Başarısız"
};

function stepToneClass(status: WorkflowStep["status"]): string {
  if (status === "failed") return "is-failed";
  if (status === "active" || status === "pending") return "is-critical";
  return "";
}

function formatStepTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function WorkflowTimelineReferenceLayout({ workflow }: { workflow: WorkflowInstance }) {
  const steps = [...workflow.steps].sort((a, b) => a.sortOrder - b.sortOrder);
  const completedCount = workflow.steps.filter((step) => step.status === "completed").length;

  return (
    <section className="wff-page" data-page="workflow-timeline-reference" aria-label="İş akışı zaman çizelgesi">
      <header className="wff-header">
        <p className="wff-header__eyebrow">İş akışı</p>
        <h1>İşlem zaman çizelgesi</h1>
        <p className="wff-header__meta">
          {workflow.entityType} · {workflow.entityNo} — kayıt bazlı operasyon adımları
        </p>
      </header>

      <p className="wff-demo-band" role="status">
        İş akışı zaman çizelgesi salt okunurdur; adım mutation onay zinciri üzerinden yürütülür.
      </p>

      <section className="wff-kpi-row" aria-label="Akış özeti">
        <article className="wff-kpi">
          <span className="wff-kpi-label">Akış no</span>
          <span className="wff-kpi-value">{workflow.workflowNo}</span>
          <span className="wff-kpi-detail">{workflow.entityNo}</span>
        </article>
        <article className="wff-kpi">
          <span className="wff-kpi-label">Durum</span>
          <span className="wff-kpi-value">{workflow.status === "active" ? "Aktif" : "Tamamlandı"}</span>
          <span className="wff-kpi-detail">Akış durumu</span>
        </article>
        <article className="wff-kpi">
          <span className="wff-kpi-label">Adım</span>
          <span className="wff-kpi-value">
            {completedCount}/{workflow.steps.length}
          </span>
          <span className="wff-kpi-detail">Tamamlanan adımlar</span>
        </article>
        <article className="wff-kpi">
          <span className="wff-kpi-label">Aktif adım</span>
          <span className="wff-kpi-value">{workflow.currentStepKey ?? "—"}</span>
          <span className="wff-kpi-detail">Sıradaki iş</span>
        </article>
      </section>

      <div className="wff-layout">
        <article className="wff-timeline-card" aria-label="Zaman çizelgesi">
          <header className="wff-timeline-head">
            <h2>Zaman çizelgesi</h2>
          </header>
          <div className="wff-timeline-scroll">
            {steps.length === 0 ? (
              <p className="wff-empty">İşlem geçmişi bulunmuyor.</p>
            ) : (
              <ol className="wff-timeline">
                {steps.map((step) => (
                  <li key={step.id} className={`wff-timeline-item ${stepToneClass(step.status)}`}>
                    <time className="wff-timeline-time" dateTime={step.startedAt ?? undefined}>
                      {formatStepTime(step.completedAt ?? step.startedAt)}
                    </time>
                    <p className="wff-timeline-title">{step.title}</p>
                    <p className="wff-timeline-meta">
                      Durum: {statusLabels[step.status]}
                      {step.description ? ` · ${step.description}` : ""}
                    </p>
                    <div className="wff-timeline-diff">
                      <span>Önce / sonra: </span>
                      {step.status === "completed"
                        ? "Adım tamamlandı"
                        : step.status === "failed"
                          ? "Adımda sorun oluştu"
                          : "Adım bekliyor veya devam ediyor"}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </article>

        <aside className="wff-side" aria-label="İlişkili kayıt">
          <p className="wff-side-eyebrow">İlişkili kayıt</p>
          <h3>{workflow.entityNo}</h3>
          <p className="wff-side-muted">Bu ekran ilgili kayıtlardan veya görevlerden açılır.</p>
          <div className="wff-detail-list">
            <span>Kayıt tipi</span>
            <strong>{workflow.entityType}</strong>
            <span>Akış no</span>
            <strong>{workflow.workflowNo}</strong>
            <span>Aktif adım</span>
            <strong>{workflow.currentStepKey ?? "—"}</strong>
            <span>Tamamlanan</span>
            <strong>
              {completedCount}/{workflow.steps.length}
            </strong>
          </div>
          <Link href="/onaylar" className="wff-btn">
            Onay kutusuna git
          </Link>
        </aside>
      </div>
    </section>
  );
}
