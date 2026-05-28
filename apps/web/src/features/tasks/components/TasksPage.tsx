"use client";

import type { Task } from "@hallederiz/types";
import {
  EntityDetailLayout,
  FilterChip,
  FilterResetButton,
  FilterToolbar,
  FilterToolbarChips,
  FilterToolbarRow,
  FilterToolbarSearch,
  FilterToolbarViews,
  LoadingState,
  PageHeader,
  Pagination,
  SplitContentLayout
} from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getOperationsEngineData } from "../../dashboard/queries";
import { OperatorWorkspaceContextPanel } from "./OperatorWorkspaceContextPanel";

const priorityLabels: Record<Task["priority"], string> = {
  low: "Dusuk",
  normal: "Normal",
  high: "Yuksek",
  critical: "Kritik"
};
const statusLabels: Record<Task["status"], string> = {
  open: "Acik",
  in_progress: "Devam",
  done: "Tamam",
  cancelled: "Iptal",
  overdue: "Gecikti"
};

function priorityBadge(priority: Task["priority"]) {
  return priority === "critical"
    ? "hz-badge hz-badge-danger"
    : priority === "high"
      ? "hz-badge hz-badge-warning"
      : "hz-badge hz-badge-info";
}

type TaskFilters = {
  assignee: string;
  status: "" | Task["status"];
  priority: "" | Task["priority"];
  source: "" | Task["source"];
  entityType: "" | Task["entityType"];
  overdueOnly: boolean;
};

const defaultFilters: TaskFilters = {
  assignee: "",
  status: "",
  priority: "",
  source: "",
  entityType: "",
  overdueOnly: false
};

const STATUS_CHIPS: { id: "" | Task["status"]; label: string }[] = [
  { id: "", label: "Tumu" },
  { id: "open", label: "Acik" },
  { id: "in_progress", label: "Devam" },
  { id: "overdue", label: "Gecikti" },
  { id: "done", label: "Tamam" },
  { id: "cancelled", label: "Iptal" }
];

function TaskFilterWorkbench({
  filters,
  onChange,
  onReset
}: {
  filters: TaskFilters;
  onChange: (next: Partial<TaskFilters>) => void;
  onReset: () => void;
}) {
  return (
    <FilterToolbar>
      <FilterToolbarRow>
        <FilterToolbarChips>
          {STATUS_CHIPS.map((chip) => (
            <FilterChip
              key={chip.id || "all"}
              active={filters.status === chip.id}
              onClick={() => onChange({ status: chip.id, overdueOnly: chip.id === "overdue" ? false : filters.overdueOnly })}
            >
              {chip.label}
            </FilterChip>
          ))}
        </FilterToolbarChips>
        <FilterToolbarViews>
          <label className="hz-tasks-ws-toggle">
            <input
              checked={filters.overdueOnly}
              onChange={(event) => onChange({ overdueOnly: event.target.checked })}
              type="checkbox"
            />
            Sadece gecikenler
          </label>
        </FilterToolbarViews>
      </FilterToolbarRow>
      <FilterToolbarRow>
        <FilterToolbarSearch>
          <label className="hz-tasks-ws-search">
            <span className="hz-tasks-ws-search-label">Atanan</span>
            <input
              value={filters.assignee}
              onChange={(event) => onChange({ assignee: event.target.value })}
              placeholder="Atanan kisi ara"
              type="search"
              className="hz-tasks-ws-input"
            />
          </label>
        </FilterToolbarSearch>
        <div className="hz-tasks-ws-filter-fields">
          <label className="hz-tasks-ws-field">
            <span>Oncelik</span>
            <select
              value={filters.priority}
              onChange={(event) => onChange({ priority: event.target.value as TaskFilters["priority"] })}
              className="hz-tasks-ws-input"
            >
              <option value="">Tum oncelikler</option>
              <option value="critical">Kritik</option>
              <option value="high">Yuksek</option>
              <option value="normal">Normal</option>
              <option value="low">Dusuk</option>
            </select>
          </label>
          <label className="hz-tasks-ws-field">
            <span>Kaynak</span>
            <select
              value={filters.source}
              onChange={(event) => onChange({ source: event.target.value as TaskFilters["source"] })}
              className="hz-tasks-ws-input"
            >
              <option value="">Tum kaynaklar</option>
              <option value="system">Sistem</option>
              <option value="ai">AI</option>
            </select>
          </label>
          <label className="hz-tasks-ws-field">
            <span>Entity</span>
            <select
              value={filters.entityType}
              onChange={(event) => onChange({ entityType: event.target.value as TaskFilters["entityType"] })}
              className="hz-tasks-ws-input"
            >
              <option value="">Tum entityler</option>
              <option value="order">Siparis</option>
              <option value="delivery">Teslimat</option>
              <option value="customer">Cari</option>
              <option value="product">Ürün</option>
              <option value="payment">Tahsilat</option>
              <option value="offer">Teklif</option>
              <option value="ai_proposal">AI proposal</option>
              <option value="factory_order">Fabrika siparisi</option>
              <option value="warehouse_order">Depo siparisi</option>
              <option value="invoice">Fatura</option>
              <option value="return">Iade</option>
              <option value="document">Belge</option>
            </select>
          </label>
        </div>
      </FilterToolbarRow>
      <FilterToolbarRow>
        <FilterResetButton onClick={onReset} label="Filtreleri sifirla" />
        <p className="hz-tasks-ws-filter-hint">Filtreler anlik uygulanir; canli mutation veya sahte basari uretmez.</p>
      </FilterToolbarRow>
    </FilterToolbar>
  );
}

export function TaskTable({
  tasks,
  selectedTaskId,
  onSelect,
  onOpen
}: {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelect: (taskId: string) => void;
  onOpen: (taskId: string) => void;
}) {
  return (
    <section className="hz-content-card hz-tasks-ws-table-card">
      <div className="table-wrap hz-table-wrap hz-tasks-ws-table-wrap">
        <table className="table hz-table hz-table-sticky">
          <thead>
            <tr>
              <th>Görev No</th>
              <th>Baslik</th>
              <th>Müşteri / Kayit</th>
              <th>Atanan</th>
              <th>Durum</th>
              <th>Oncelik</th>
              <th>Son Tarih</th>
              <th>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className={`stock-table-row ${selectedTaskId === task.id ? "is-selected-row" : ""}`}
                onClick={() => onSelect(task.id)}
                onDoubleClick={() => onOpen(task.id)}
              >
                <td>{task.taskNo}</td>
                <td>{task.title}</td>
                <td>{task.customerName ?? task.entityNo}</td>
                <td>{task.assigneeName ?? "-"}</td>
                <td>{statusLabels[task.status]}</td>
                <td>
                  <span className={priorityBadge(task.priority)}>{priorityLabels[task.priority]}</span>
                </td>
                <td>{new Date(task.dueAt).toLocaleString("tr-TR")}</td>
                <td>
                  <button
                    className="hz-btn hz-btn-secondary"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpen(task.id);
                    }}
                  >
                    Detay
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="table-empty">Filtrelere uygun gorev bulunamadi.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TaskFilters>({ ...defaultFilters });
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

  const totals = useMemo(() => {
    const list = tasks ?? [];
    return {
      total: list.length,
      overdue: list.filter((t) => t.status === "overdue").length,
      ai: list.filter((t) => t.source === "ai").length,
      approval: list.filter((t) => t.approvalId).length
    };
  }, [tasks]);

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

  return (
    <main className="hz-tasks-ws-page">
      <header className="hz-tasks-ws-top">
        <div>
          <p className="hz-tasks-ws-eyebrow">Operator workspace</p>
          <h1 className="hz-tasks-ws-title">Görevler</h1>
          <p className="hz-tasks-ws-subtitle">Orta is listesi, sag baglam paneli, AI ozet ve zaman cizelgesi.</p>
        </div>
      </header>

      <div className="hz-tasks-ws-kpis" aria-label="Görev özetleri">
        <div className="hz-tasks-ws-kpi">
          <span className="hz-tasks-ws-kpi-label">Toplam</span>
          <span className="hz-tasks-ws-kpi-value">{tasks?.length ?? "—"}</span>
        </div>
        <div className="hz-tasks-ws-kpi hz-tasks-ws-kpi--danger">
          <span className="hz-tasks-ws-kpi-label">Geciken</span>
          <span className="hz-tasks-ws-kpi-value">{tasks ? totals.overdue : "—"}</span>
        </div>
        <div className="hz-tasks-ws-kpi hz-tasks-ws-kpi--accent">
          <span className="hz-tasks-ws-kpi-label">AI</span>
          <span className="hz-tasks-ws-kpi-value">{tasks ? totals.ai : "—"}</span>
        </div>
        <div className="hz-tasks-ws-kpi hz-tasks-ws-kpi--warn">
          <span className="hz-tasks-ws-kpi-label">Onay bagli</span>
          <span className="hz-tasks-ws-kpi-value">{tasks ? totals.approval : "—"}</span>
        </div>
      </div>

      <TaskFilterWorkbench
        filters={filters}
        onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
        onReset={() => setFilters({ ...defaultFilters })}
      />

      <p className="hz-tasks-ws-summary">
        {filteredTasks.length} gorev · Sayfa {page} / {Math.max(1, Math.ceil(filteredTasks.length / pageSize) || 1)}
      </p>

      {!tasks ? (
        <LoadingState title="Görevler yükleniyor" message="Operasyon motoru kayitlari hazırlanıyor." />
      ) : (
        <SplitContentLayout
          sideWidth="detail"
          main={
            <div className="hz-tasks-ws-main">
              <TaskTable
                tasks={pagedTasks}
                selectedTaskId={selectedTaskId}
                onSelect={setSelectedTaskId}
                onOpen={(taskId) => router.push(`/gorevler/${taskId}`)}
              />
              <Pagination totalItems={filteredTasks.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
            </div>
          }
          side={
            <OperatorWorkspaceContextPanel task={selectedTask} onOpenDetail={(taskId) => router.push(`/gorevler/${taskId}`)} />
          }
        />
      )}
    </main>
  );
}

export function TaskHeaderInfo({ task }: { task: Task }) {
  return (
    <section className="hz-content-card">
      <p className="drawer-eyebrow">{task.taskNo}</p>
      <h2>{task.title}</h2>
      <p className="muted">{task.description}</p>
      <div className="hz-inline-actions">
        <span className={priorityBadge(task.priority)}>{priorityLabels[task.priority]}</span>
        <span className="hz-badge hz-badge-info">{statusLabels[task.status]}</span>
      </div>
    </section>
  );
}

export function TaskCommentsPanel() {
  return (
    <section className="hz-content-card">
      <h3>Yorumlar</h3>
      <p className="muted">Görev yorumları ve iç ekip notları canlı veri bağlandığında burada listelenir.</p>
      <p className="hz-tasks-detail-empty-note">Henüz yorum kaydı yok veya API bekleniyor.</p>
    </section>
  );
}

export function TaskActionsBar({ task }: { task: Task }) {
  const router = useRouter();
  return (
    <section className="hz-content-card">
      <h3>Aksiyonlar</h3>
      <div className="hz-inline-actions">
        <button className="hz-btn hz-btn-primary" type="button">
          Başlat
        </button>
        <button className="hz-btn hz-btn-secondary" type="button">
          Tamamla
        </button>
        <button className="hz-btn hz-btn-secondary" type="button">
          İptal et
        </button>
        <button className="hz-btn hz-btn-secondary" type="button">
          Not ekle
        </button>
        {task.approvalId ? (
          <button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push(`/onaylar`)}>
            Onay inbox
          </button>
        ) : null}
        <button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push("/ayarlar/operasyon-gozlem")}>
          Operasyon ve gozlem
        </button>
      </div>
    </section>
  );
}

export function TaskDetailPage({ task }: { task: Task }) {
  return (
    <EntityDetailLayout
      className="hz-tasks-detail-page"
      header={
        <PageHeader
          title="Görev detayı"
          description="Görev, ilgili kayıt, yorum ve aksiyonları tek ekranda yönetin."
          breadcrumb={task.taskNo}
        />
      }
      summary={<TaskHeaderInfo task={task} />}
      sections={<TaskCommentsPanel />}
      sidebar={<TaskActionsBar task={task} />}
    />
  );
}

