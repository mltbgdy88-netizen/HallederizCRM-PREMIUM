"use client";

import type { Task } from "@hallederiz/types";
import { FilterActions, FilterBar, LoadingState, MetricCard, PageHeader, Pagination, SplitContentLayout } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getOperationsEngineData } from "../../dashboard/queries";

const priorityLabels: Record<Task["priority"], string> = { low: "Dusuk", normal: "Normal", high: "Yuksek", critical: "Kritik" };
const statusLabels: Record<Task["status"], string> = { open: "Acik", in_progress: "Devam", done: "Tamam", cancelled: "Iptal", overdue: "Gecikti" };

function priorityBadge(priority: Task["priority"]) {
  return priority === "critical" ? "hz-badge hz-badge-danger" : priority === "high" ? "hz-badge hz-badge-warning" : "hz-badge hz-badge-info";
}

type TaskFilters = {
  assignee: string;
  status: "" | Task["status"];
  priority: "" | Task["priority"];
  source: "" | Task["source"];
  entityType: "" | Task["entityType"];
  overdueOnly: boolean;
};

function TaskFilterBar({ filters, onChange, onReset }: { filters: TaskFilters; onChange: (next: Partial<TaskFilters>) => void; onReset: () => void }) {
  return (
    <FilterBar>
      <div className="task-center-filter-grid">
        <label>
          Atanan Kisi
          <input value={filters.assignee} onChange={(event) => onChange({ assignee: event.target.value })} placeholder="Atanan kisi ara" />
        </label>
        <label>
          Durum
          <select value={filters.status} onChange={(event) => onChange({ status: event.target.value as TaskFilters["status"] })}>
            <option value="">Tum durumlar</option>
            <option value="open">Acik</option>
            <option value="in_progress">Devam</option>
            <option value="done">Tamam</option>
            <option value="overdue">Gecikti</option>
            <option value="cancelled">Iptal</option>
          </select>
        </label>
        <label>
          Oncelik
          <select value={filters.priority} onChange={(event) => onChange({ priority: event.target.value as TaskFilters["priority"] })}>
            <option value="">Tum oncelikler</option>
            <option value="critical">Kritik</option>
            <option value="high">Yuksek</option>
            <option value="normal">Normal</option>
            <option value="low">Dusuk</option>
          </select>
        </label>
        <label>
          Gorev Tipi
          <select value={filters.source} onChange={(event) => onChange({ source: event.target.value as TaskFilters["source"] })}>
            <option value="">Tum tipler</option>
            <option value="workflow">Workflow</option>
            <option value="dashboard">Dashboard</option>
            <option value="ai">AI</option>
          </select>
        </label>
        <label>
          Entity Tipi
          <select value={filters.entityType} onChange={(event) => onChange({ entityType: event.target.value as TaskFilters["entityType"] })}>
            <option value="">Tum kayitlar</option>
            <option value="order">Siparis</option>
            <option value="delivery">Teslimat</option>
            <option value="customer">Cari</option>
            <option value="approval">Onay</option>
          </select>
        </label>
        <label className="hz-toggle">
          <input checked={filters.overdueOnly} onChange={(event) => onChange({ overdueOnly: event.target.checked })} type="checkbox" />
          Sadece gecikenler
        </label>
      </div>
      <FilterActions>
        <button type="button" className="hz-btn hz-btn-secondary" onClick={onReset}>
          Filtreleri sifirla
        </button>
      </FilterActions>
      <p className="muted">Filtreler bu ekranda anlik olarak listeye uygulanir. Canli mutation veya fake basari uretmez.</p>
    </FilterBar>
  );
}

export function TaskTable({ tasks, selectedTaskId, onSelect, onOpen }: { tasks: Task[]; selectedTaskId: string | null; onSelect: (taskId: string) => void; onOpen: (taskId: string) => void }) {
  return <section className="hz-content-card"><div className="table-wrap hz-table-wrap"><table className="table hz-table hz-table-sticky"><thead><tr><th>Gorev No</th><th>Baslik</th><th>Musteri / Kayit</th><th>Atanan</th><th>Durum</th><th>Oncelik</th><th>Son Tarih</th><th>Aksiyon</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id} className={`stock-table-row ${selectedTaskId === task.id ? "is-selected-row" : ""}`} onClick={() => onSelect(task.id)} onDoubleClick={() => onOpen(task.id)}><td>{task.taskNo}</td><td>{task.title}</td><td>{task.customerName ?? task.entityNo}</td><td>{task.assigneeName ?? "-"}</td><td>{statusLabels[task.status]}</td><td><span className={priorityBadge(task.priority)}>{priorityLabels[task.priority]}</span></td><td>{new Date(task.dueAt).toLocaleString("tr-TR")}</td><td><button className="hz-btn hz-btn-secondary" type="button" onClick={() => onOpen(task.id)}>Detay</button></td></tr>)}{tasks.length === 0 ? <tr><td colSpan={8}><div className="table-empty">Filtrelere uygun gorev bulunamadi.</div></td></tr> : null}</tbody></table></div></section>;
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
  const [filters, setFilters] = useState<TaskFilters>({ assignee: "", status: "", priority: "", source: "", entityType: "", overdueOnly: false });
  const pageSize = 10;

  useEffect(() => {
    getOperationsEngineData().then((data) => setTasks(data.tasks));
  }, []);

  const filteredTasks = useMemo(() => {
    const list = tasks ?? [];
    return list.filter((task) => {
      if (filters.assignee && !`${task.assigneeName ?? ""}`.toLowerCase().includes(filters.assignee.toLowerCase())) return false;
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.source && task.source !== filters.source) return false;
      if (filters.entityType && task.entityType !== filters.entityType) return false;
      if (filters.overdueOnly && task.status !== "overdue") return false;
      return true;
    });
  }, [tasks, filters]);

  const selectedTask = useMemo(() => {
    if (!filteredTasks.length || !selectedTaskId) return null;
    return filteredTasks.find((task) => task.id === selectedTaskId) ?? null;
  }, [filteredTasks, selectedTaskId]);

  const pagedTasks = useMemo(() => filteredTasks.slice((page - 1) * pageSize, page * pageSize), [filteredTasks, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (!filteredTasks.length) {
      setSelectedTaskId(null);
      return;
    }
    if (!selectedTaskId || !filteredTasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(filteredTasks[0]?.id ?? null);
    }
  }, [filteredTasks, selectedTaskId]);

  return <div className="hz-page-stack"><PageHeader title="Gorevler" description="Workflow, dashboard ve AI kaynakli tum operasyon gorevlerini tek listede takip edin." /><section className="hz-metric-grid"><MetricCard title="Toplam" value={String(tasks?.length ?? 0)} detail="Aktif kapsam" tone="info" /><MetricCard title="Geciken" value={String(tasks?.filter((task) => task.status === "overdue").length ?? 0)} detail="SLA riski" tone="danger" /><MetricCard title="AI Kaynakli" value={String(tasks?.filter((task) => task.source === "ai").length ?? 0)} detail="Insight/proposal" tone="success" /><MetricCard title="Onay Bagli" value={String(tasks?.filter((task) => task.approvalId).length ?? 0)} detail="Approval link" tone="warning" /></section><TaskFilterBar filters={filters} onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))} onReset={() => setFilters({ assignee: "", status: "", priority: "", source: "", entityType: "", overdueOnly: false })} />{!tasks ? <LoadingState title="Gorevler yukleniyor" message="Operasyon motoru kayitlari hazirlaniyor." /> : <SplitContentLayout main={<><TaskTable tasks={pagedTasks} selectedTaskId={selectedTaskId} onSelect={setSelectedTaskId} onOpen={(taskId) => router.push(`/gorevler/${taskId}`)} /><Pagination totalItems={filteredTasks.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} /></>} side={<TaskPreviewPanel task={selectedTask} />} />}</div>;
}

export function TaskHeaderInfo({ task }: { task: Task }) {
  return <section className="hz-content-card"><p className="drawer-eyebrow">{task.taskNo}</p><h2>{task.title}</h2><p className="muted">{task.description}</p><div className="hz-inline-actions"><span className={priorityBadge(task.priority)}>{priorityLabels[task.priority]}</span><span className="hz-badge hz-badge-info">{statusLabels[task.status]}</span></div></section>;
}

export function TaskCommentsPanel() {
  return <section className="hz-content-card"><h3>Yorumlar</h3><p className="muted">Gorev yorumlari ve ic ekip notlari burada tutulur. Placeholder basari mesaji uretmez.</p><div className="timeline-item"><strong>Satis Operasyon</strong><span>Kaynak plani kontrol edildi, aksiyon bekliyor.</span></div></section>;
}

export function TaskActionsBar({ task }: { task: Task }) {
  const router = useRouter();
  return <section className="hz-content-card"><h3>Aksiyonlar</h3><div className="hz-inline-actions"><button className="hz-btn hz-btn-primary" type="button">Baslat</button><button className="hz-btn hz-btn-secondary" type="button">Tamamla</button><button className="hz-btn hz-btn-secondary" type="button">Iptal Et</button><button className="hz-btn hz-btn-secondary" type="button">Not Ekle</button>{task.approvalId ? <button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push(`/onaylar/${task.approvalId}`)}>Approval'a Git</button> : null}</div></section>;
}

export function TaskDetailPage({ task }: { task: Task }) {
  return <div className="hz-page-stack"><PageHeader title="Gorev Detayi" description="Gorev, ilgili kayit, yorum ve aksiyonlari tek ekranda yonetin." /><TaskHeaderInfo task={task} /><SplitContentLayout main={<TaskCommentsPanel />} side={<TaskActionsBar task={task} />} /></div>;
}
