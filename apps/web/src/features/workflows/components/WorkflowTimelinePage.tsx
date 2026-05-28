import type { WorkflowInstance, WorkflowStep } from "@hallederiz/types";
import { MetricCard, PageHeader } from "@hallederiz/ui";
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

export function WorkflowProgressPanel({ workflow }: { workflow: WorkflowInstance }) {
  const completedCount = workflow.steps.filter((step) => step.status === "completed").length;
  return (
    <section className="hz-metric-grid" aria-label="Akış özeti">
      <MetricCard title="Akış no" value={workflow.workflowNo} detail={workflow.entityNo} tone="info" />
      <MetricCard
        title="Durum"
        value={workflow.status === "active" ? "Aktif" : "Tamamlandı"}
        detail="Akış durumu"
        tone="success"
      />
      <MetricCard
        title="Adım"
        value={`${completedCount}/${workflow.steps.length}`}
        detail="Tamamlanan adımlar"
        tone="warning"
      />
      <MetricCard title="Aktif adım" value={workflow.currentStepKey ?? "—"} detail="Sıradaki iş" tone="info" />
    </section>
  );
}

export function WorkflowTimelinePage({ workflow }: { workflow: WorkflowInstance }) {
  const steps = [...workflow.steps].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="hz-workflow-page hz-page-stack">
      <PageHeader
        title="İşlem zaman çizelgesi"
        description="Kayıt bazlı operasyon adımlarını teklif, sipariş, depo, tahsilat ve belge zinciri olarak izleyin."
        breadcrumb={`${workflow.entityType} · ${workflow.entityNo}`}
      />
      <WorkflowProgressPanel workflow={workflow} />
      <div className="hz-content-card">
        <header className="hz-dash-work-head">
          <h2>Zaman çizelgesi</h2>
        </header>
        {steps.length === 0 ? (
          <p className="muted">İşlem geçmişi bulunmuyor.</p>
        ) : (
          <ol className="hz-workflow-timeline" aria-label="Akış adımları">
            {steps.map((step) => (
              <li key={step.id} className={`hz-workflow-timeline-item ${stepToneClass(step.status)}`}>
                <time className="hz-workflow-timeline-time" dateTime={step.startedAt ?? undefined}>
                  {formatStepTime(step.completedAt ?? step.startedAt)}
                </time>
                <p className="hz-workflow-timeline-title">{step.title}</p>
                <p className="hz-workflow-timeline-meta">
                  Durum: {statusLabels[step.status]}
                  {step.description ? ` · ${step.description}` : ""}
                </p>
                <div className="hz-workflow-timeline-diff">
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
      <aside className="hz-side-panel">
        <p className="drawer-eyebrow">İlişkili kayıt</p>
        <h3>{workflow.entityNo}</h3>
        <p className="muted">Bu ekran ilgili kayıtlardan veya görevlerden açılır.</p>
        <div className="detail-list">
          <span>Kayıt tipi</span>
          <strong>{workflow.entityType}</strong>
          <span>Akış no</span>
          <strong>{workflow.workflowNo}</strong>
          <span>Aktif adım</span>
          <strong>{workflow.currentStepKey ?? "—"}</strong>
        </div>
        <Link href="/onaylar" className="hz-btn hz-btn-secondary">
          Onay kutusuna git
        </Link>
      </aside>
    </div>
  );
}
