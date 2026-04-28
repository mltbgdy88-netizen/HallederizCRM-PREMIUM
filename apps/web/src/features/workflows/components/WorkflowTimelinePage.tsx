import type { WorkflowInstance, WorkflowStep } from "@hallederiz/types";
import { MetricCard, PageHeader, SplitContentLayout } from "@hallederiz/ui";

const statusLabels: Record<WorkflowStep["status"], string> = { pending: "Bekliyor", active: "Aktif", completed: "Tamamlandi", skipped: "Atlandi", failed: "Basarisiz" };

function statusBadge(status: WorkflowStep["status"]) {
  if (status === "completed") return "hz-badge hz-badge-success";
  if (status === "active") return "hz-badge hz-badge-warning";
  if (status === "failed") return "hz-badge hz-badge-danger";
  return "hz-badge hz-badge-info";
}

export function WorkflowProgressPanel({ workflow }: { workflow: WorkflowInstance }) {
  const completedCount = workflow.steps.filter((step) => step.status === "completed").length;
  return <section className="hz-metric-grid"><MetricCard title="Workflow" value={workflow.workflowNo} detail={workflow.entityNo} tone="info" /><MetricCard title="Durum" value={workflow.status === "active" ? "Aktif" : "Tamam"} detail="Akis durumu" tone="success" /><MetricCard title="Adim" value={`${completedCount}/${workflow.steps.length}`} detail="Tamamlanan" tone="warning" /><MetricCard title="Aktif Adim" value={workflow.currentStepKey ?? "-"} detail="Siradaki is" tone="info" /></section>;
}

export function WorkflowStepList({ steps }: { steps: WorkflowStep[] }) {
  return <section className="hz-content-card"><h3>Workflow Adimlari</h3><div className="table-wrap hz-table-wrap"><table className="table hz-table"><thead><tr><th>Sira</th><th>Adim</th><th>Aciklama</th><th>Durum</th><th>Baslama</th><th>Tamamlanma</th></tr></thead><tbody>{steps.map((step) => <tr key={step.id}><td>{step.sortOrder}</td><td>{step.title}</td><td>{step.description ?? "-"}</td><td><span className={statusBadge(step.status)}>{statusLabels[step.status]}</span></td><td>{step.startedAt ? new Date(step.startedAt).toLocaleString("tr-TR") : "-"}</td><td>{step.completedAt ? new Date(step.completedAt).toLocaleString("tr-TR") : "-"}</td></tr>)}</tbody></table></div></section>;
}

export function WorkflowTimelinePage({ workflow }: { workflow: WorkflowInstance }) {
  return <div className="hz-page-stack"><PageHeader title="Workflow Timeline" description="Entity bazli operasyon adimlarini teklif, siparis, depo, tahsilat, teslim ve belge zinciri olarak izleyin." /><WorkflowProgressPanel workflow={workflow} /><SplitContentLayout main={<WorkflowStepList steps={workflow.steps} />} side={<aside className="hz-side-panel"><p className="drawer-eyebrow">Entity</p><h3>{workflow.entityNo}</h3><p className="muted">Bu timeline dogrudan menude yer almaz; ilgili kayitlardan veya gorevlerden erisilecek foundation ekranidir.</p><div className="detail-list"><span>Entity tipi</span><strong>{workflow.entityType}</strong><span>Workflow no</span><strong>{workflow.workflowNo}</strong><span>Current step</span><strong>{workflow.currentStepKey ?? "-"}</strong></div></aside>} /></div>;
}
