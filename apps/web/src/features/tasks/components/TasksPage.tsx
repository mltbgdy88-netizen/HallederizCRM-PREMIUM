"use client";

import type { Task } from "@hallederiz/types";
import { FilterBar, LoadingState, MetricCard, PageHeader, Pagination, SplitContentLayout } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getOperationsEngineData } from "../../dashboard/queries";

const priorityLabels: Record<Task["priority"], string> = { low: "Dusuk", normal: "Normal", high: "Yuksek", critical: "Kritik" };
const statusLabels: Record<Task["status"], string> = { open: "Acik", in_progress: "Devam", done: "Tamam", cancelled: "Iptal", overdue: "Gecikti" };

function priorityBadge(priority: Task["priority"]) { return priority === "critical" ? "hz-badge hz-badge-danger" : priority === "high" ? "hz-badge hz-badge-warning" : "hz-badge hz-badge-info"; }

export function TaskFilterBar() {
  return <FilterBar><div className="task-center-filter-grid"><label>Atanan Kisi<select defaultValue=""><option value="">Tum ekip</option><option>Operasyon</option><option>Muhasebe</option><option>Depo</option></select></label><label>Durum<select defaultValue=""><option value="">Tum durumlar</option><option>Acik</option><option>Devam</option><option>Gecikti</option></select></label><label>Oncelik<select defaultValue=""><option value="">Tum oncelikler</option><option>Kritik</option><option>Yuksek</option></select></label><label>Gorev Tipi<select defaultValue=""><option value="">Tum tipler</option><option>Siparis</option><option>Tahsilat</option><option>Depo</option><option>AI</option></select></label><label>Entity Tipi<select defaultValue=""><option value="">Tum kayitlar</option><option>Siparis</option><option>Teslimat</option><option>Cari</option></select></label><label className="hz-toggle"><input type="checkbox" />Gecikenler</label></div></FilterBar>;
}

export function TaskTable({ tasks, onOpen }: { tasks: Task[]; onOpen: (taskId: string) => void }) {
  return <section className="hz-content-card"><div className="table-wrap hz-table-wrap"><table className="table hz-table hz-table-sticky"><thead><tr><th>Gorev No</th><th>Baslik</th><th>Musteri / Kayit</th><th>Atanan</th><th>Durum</th><th>Oncelik</th><th>Son Tarih</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id} className="stock-table-row" onDoubleClick={() => onOpen(task.id)}><td>{task.taskNo}</td><td>{task.title}</td><td>{task.customerName ?? task.entityNo}</td><td>{task.assigneeName ?? "-"}</td><td>{statusLabels[task.status]}</td><td><span className={priorityBadge(task.priority)}>{priorityLabels[task.priority]}</span></td><td>{new Date(task.dueAt).toLocaleString("tr-TR")}</td></tr>)}{tasks.length === 0 ? <tr><td colSpan={7}><div className="table-empty">Filtrelere uygun gorev bulunamadi.</div></td></tr> : null}</tbody></table></div></section>;
}

function TaskPreviewPanel({ task }: { task: Task | null }) {
  if (!task) return <aside className="hz-side-panel"><p className="muted">Gorev secimi bekleniyor.</p></aside>;
  return <aside className="hz-side-panel"><p className="drawer-eyebrow">Gorev Onizleme</p><h3>{task.title}</h3><p className="muted">{task.description}</p><div className="detail-list"><span>Kaynak</span><strong>{task.source === "ai" ? "Yapay Zeka" : "Sistem"}</strong><span>Ilgili kayit</span><strong>{task.entityNo}</strong><span>Oncelik</span><strong>{priorityLabels[task.priority]}</strong><span>Durum</span><strong>{statusLabels[task.status]}</strong></div></aside>;
}

export function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  useEffect(() => { getOperationsEngineData().then((data) => setTasks(data.tasks)); }, []);
  const selectedTask = useMemo(() => tasks?.find((task) => task.id === selectedTaskId) ?? tasks?.[0] ?? null, [tasks, selectedTaskId]);
  const pagedTasks = useMemo(() => (tasks ?? []).slice((page - 1) * pageSize, page * pageSize), [tasks, page]);
  return <div className="hz-page-stack"><PageHeader title="Gorevler" description="Workflow, dashboard ve AI kaynakli tum operasyon gorevlerini tek listede takip edin." /><section className="hz-metric-grid"><MetricCard title="Toplam" value={String(tasks?.length ?? 0)} detail="Aktif kapsam" tone="info" /><MetricCard title="Geciken" value={String(tasks?.filter((task) => task.status === "overdue").length ?? 0)} detail="SLA riski" tone="danger" /><MetricCard title="AI Kaynakli" value={String(tasks?.filter((task) => task.source === "ai").length ?? 0)} detail="Insight/proposal" tone="success" /><MetricCard title="Onay Bagli" value={String(tasks?.filter((task) => task.approvalId).length ?? 0)} detail="Approval link" tone="warning" /></section><TaskFilterBar />{!tasks ? <LoadingState title="Gorevler yukleniyor" message="Operasyon motoru kayitlari hazirlaniyor." /> : <SplitContentLayout main={<><TaskTable tasks={pagedTasks} onOpen={(taskId) => router.push(`/gorevler/${taskId}`)} /><Pagination totalItems={tasks.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} /></>} side={<TaskPreviewPanel task={selectedTask} />} />}</div>;
}

export function TaskHeaderInfo({ task }: { task: Task }) {
  return <section className="hz-content-card"><p className="drawer-eyebrow">{task.taskNo}</p><h2>{task.title}</h2><p className="muted">{task.description}</p><div className="hz-inline-actions"><span className={priorityBadge(task.priority)}>{priorityLabels[task.priority]}</span><span className="hz-badge hz-badge-info">{statusLabels[task.status]}</span></div></section>;
}

export function TaskCommentsPanel() {
  return <section className="hz-content-card"><h3>Yorumlar</h3><p className="muted">Gorev yorumlari ve ic ekip notlari burada tutulacak.</p><div className="timeline-item"><strong>Satis Operasyon</strong><span>Kaynak plani kontrol edildi, aksiyon bekliyor.</span></div></section>;
}

export function TaskActionsBar({ task }: { task: Task }) {
  const router = useRouter();
  return <section className="hz-content-card"><h3>Aksiyonlar</h3><div className="hz-inline-actions"><button className="hz-btn hz-btn-primary" type="button">Baslat</button><button className="hz-btn hz-btn-secondary" type="button">Tamamla</button><button className="hz-btn hz-btn-secondary" type="button">Iptal Et</button><button className="hz-btn hz-btn-secondary" type="button">Not Ekle</button>{task.approvalId ? <button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push(`/onaylar/${task.approvalId}`)}>Approval'a Git</button> : null}</div></section>;
}

export function TaskDetailPage({ task }: { task: Task }) {
  return <div className="hz-page-stack"><PageHeader title="Gorev Detayi" description="Gorev, ilgili kayit, yorum ve aksiyonlari tek ekranda yonetin." /><TaskHeaderInfo task={task} /><SplitContentLayout main={<TaskCommentsPanel />} side={<TaskActionsBar task={task} />} /></div>;
}
