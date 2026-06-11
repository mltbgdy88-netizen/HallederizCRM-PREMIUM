"use client";



import type { Task } from "@hallederiz/types";

import { LoadingState, Pagination } from "@hallederiz/ui";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { useEffect, useMemo, useState } from "react";

import { LucideIcon } from "../../../components/icons/lucide-icons";

import { getOperationsEngineData } from "../../dashboard/queries";

import { OperatorWorkspaceContextPanel } from "./OperatorWorkspaceContextPanel";



const priorityLabels: Record<Task["priority"], string> = {

  low: "Düşük",

  normal: "Normal",

  high: "Yüksek",

  critical: "Kritik"

};

const statusLabels: Record<Task["status"], string> = {

  open: "Açık",

  in_progress: "Devam",

  done: "Tamam",

  cancelled: "İptal",

  overdue: "Gecikti"

};



function priorityBadgeClass(priority: Task["priority"]) {

  return priority === "critical"

    ? "tskf-badge tskf-badge--danger"

    : priority === "high"

      ? "tskf-badge tskf-badge--warn"

      : "tskf-badge tskf-badge--info";

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

  { id: "", label: "Tümü" },

  { id: "open", label: "Açık" },

  { id: "in_progress", label: "Devam" },

  { id: "overdue", label: "Gecikti" },

  { id: "done", label: "Tamam" },

  { id: "cancelled", label: "İptal" }

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

    <div className="tskf-desk-filters" aria-label="Görev filtreleri">

      <div className="tskf-desk-filter-row">

        {STATUS_CHIPS.map((chip) => (

          <button

            key={chip.id || "all"}

            type="button"

            className={filters.status === chip.id ? "tskf-desk-chip tskf-desk-chip--active" : "tskf-desk-chip"}

            onClick={() =>

              onChange({ status: chip.id, overdueOnly: chip.id === "overdue" ? false : filters.overdueOnly })

            }

          >

            {chip.label}

          </button>

        ))}

        <label className="tskf-desk-toggle">

          <input

            checked={filters.overdueOnly}

            onChange={(event) => onChange({ overdueOnly: event.target.checked })}

            type="checkbox"

          />

          Sadece gecikenler

        </label>

      </div>

      <div className="tskf-desk-filter-row">

        <label className="tskf-desk-search">

          <span>Atanan</span>

          <input

            value={filters.assignee}

            onChange={(event) => onChange({ assignee: event.target.value })}

            placeholder="Atanan kişi ara"

            type="search"

          />

        </label>

        <div className="tskf-desk-fields">

          <label className="tskf-desk-field">

            <span>Öncelik</span>

            <select

              value={filters.priority}

              onChange={(event) => onChange({ priority: event.target.value as TaskFilters["priority"] })}

            >

              <option value="">Tüm öncelikler</option>

              <option value="critical">Kritik</option>

              <option value="high">Yüksek</option>

              <option value="normal">Normal</option>

              <option value="low">Düşük</option>

            </select>

          </label>

          <label className="tskf-desk-field">

            <span>Kaynak</span>

            <select

              value={filters.source}

              onChange={(event) => onChange({ source: event.target.value as TaskFilters["source"] })}

            >

              <option value="">Tüm kaynaklar</option>

              <option value="system">Sistem</option>

              <option value="ai">AI</option>

            </select>

          </label>

          <label className="tskf-desk-field">

            <span>Entity</span>

            <select

              value={filters.entityType}

              onChange={(event) => onChange({ entityType: event.target.value as TaskFilters["entityType"] })}

            >

              <option value="">Tüm entityler</option>

              <option value="order">Sipariş</option>

              <option value="delivery">Teslimat</option>

              <option value="customer">Cari</option>

              <option value="product">Ürün</option>

              <option value="payment">Tahsilat</option>

              <option value="offer">Teklif</option>

              <option value="ai_proposal">AI proposal</option>

              <option value="factory_order">Fabrika siparişi</option>

              <option value="warehouse_order">Depo siparişi</option>

              <option value="invoice">Fatura</option>

              <option value="return">İade</option>

              <option value="document">Belge</option>

            </select>

          </label>

        </div>

        <button

          type="button"

          className="tskf-desk-reset"

          onClick={onReset}

          title="Filtreleri sıfırla"

          aria-label="Filtreleri sıfırla"

        >

          <LucideIcon name="rotate-ccw" size={14} />

        </button>

      </div>

      <p className="tskf-desk-filter-hint">Filtreler anlık uygulanır; canlı mutation veya sahte başarı üretmez.</p>

    </div>

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

    <div className="tskf-desk-list-wrap">

      <table className="tskf-table">

        <thead>

          <tr>

            <th>Görev No</th>

            <th>Başlık</th>

            <th>Müşteri / Kayıt</th>

            <th>Atanan</th>

            <th>Durum</th>

            <th>Öncelik</th>

            <th>Son Tarih</th>

            <th>AKSİYON</th>

          </tr>

        </thead>

        <tbody>

          {tasks.map((task) => (

            <tr

              key={task.id}

              className={selectedTaskId === task.id ? "tskf-row--selected" : undefined}

              onClick={() => onSelect(task.id)}

              onDoubleClick={() => onOpen(task.id)}

            >

              <td>{task.taskNo}</td>

              <td>{task.title}</td>

              <td>{task.customerName ?? task.entityNo}</td>

              <td>{task.assigneeName ?? "-"}</td>

              <td>{statusLabels[task.status]}</td>

              <td>

                <span className={priorityBadgeClass(task.priority)}>{priorityLabels[task.priority]}</span>

              </td>

              <td>{new Date(task.dueAt).toLocaleString("tr-TR")}</td>

              <td>

                <button

                  className="tskf-desk-act-btn"

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

              <td colSpan={8} className="tskf-table__empty">

                Filtrelere uygun görev bulunamadı.

              </td>

            </tr>

          ) : null}

        </tbody>

      </table>

    </div>

  );

}



export const TASK_DETAIL_OPERASYON_LINK = "/ayarlar/operasyon-gozlem";



export type TasksPageIntent = "all" | "mine" | "team" | "overdue" | "automation";



const INTENT_DEFAULT_FILTERS: Record<TasksPageIntent, Partial<TaskFilters>> = {

  all: {},

  mine: { assignee: "Ayşe" },

  team: {},

  overdue: { status: "overdue", overdueOnly: true },

  automation: { source: "system" }

};



const INTENT_LABELS: Record<TasksPageIntent, string> = {

  all: "Tüm görevler",

  mine: "Benim görevlerim",

  team: "Ekip görevleri",

  overdue: "Geciken görevler",

  automation: "Otomatik görevler"

};



export function TasksPage({ intent = "all" }: { intent?: TasksPageIntent }) {

  const router = useRouter();

  const [tasks, setTasks] = useState<Task[] | null>(null);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<TaskFilters>({ ...defaultFilters, ...INTENT_DEFAULT_FILTERS[intent] });

  const pageSize = 10;



  useEffect(() => {

    getOperationsEngineData().then((data) => setTasks(data.tasks));

  }, []);



  useEffect(() => {

    setFilters({ ...defaultFilters, ...INTENT_DEFAULT_FILTERS[intent] });

  }, [intent]);



  const filteredTasks = useMemo(() => {

    const list = tasks ?? [];

    return list.filter((task) => {

      if (filters.assignee && !`${task.assigneeName ?? ""}`.toLowerCase().includes(filters.assignee.toLowerCase()))

        return false;

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

    <section className="tskf-page tskf-page--desk hz-tasks-ws-page" data-page="gorevler-reference-desk">

      <div className="tskf-shell tskf-shell--desk">

        <header className="tskf-desk-head">

          <div className="tskf-header__main">

            <span className="tskf-header__icon" aria-hidden>

              <LucideIcon name="clipboard-list" size={20} />

            </span>

            <div>

              <p className="tskf-header__eyebrow">Görevler</p>

              <h1>{INTENT_LABELS[intent]}</h1>

              <p className="tskf-header__meta">Orta iş listesi, sağ bağlam paneli ve detay masası.</p>

            </div>

          </div>

          <div className="tskf-desk-head__actions">

            <Link href={TASK_DETAIL_OPERASYON_LINK} className="tskf-desk-btn">

              Operasyon gözlem

            </Link>

          </div>

        </header>



        <section className="tskf-kpi-strip" aria-label="Görev özetleri">

          <div className="tskf-kpi">

            <span className="tskf-kpi__label">Toplam</span>

            <span className="tskf-kpi__value">{tasks?.length ?? "—"}</span>

          </div>

          <div className="tskf-kpi tskf-kpi--warning">

            <span className="tskf-kpi__label">Geciken</span>

            <span className="tskf-kpi__value">{tasks ? totals.overdue : "—"}</span>

          </div>

          <div className="tskf-kpi">

            <span className="tskf-kpi__label">AI</span>

            <span className="tskf-kpi__value">{tasks ? totals.ai : "—"}</span>

          </div>

          <div className="tskf-kpi tskf-kpi--success">

            <span className="tskf-kpi__label">Onay bağlı</span>

            <span className="tskf-kpi__value">{tasks ? totals.approval : "—"}</span>

          </div>

        </section>



        <div className="tskf-desk-body">

          <section className="tskf-desk-main" aria-label="Görev listesi">

            <TaskFilterWorkbench

              filters={filters}

              onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}

              onReset={() => setFilters({ ...defaultFilters, ...INTENT_DEFAULT_FILTERS[intent] })}

            />



            <p className="tskf-desk-summary">

              {filteredTasks.length} görev · Sayfa {page} / {Math.max(1, Math.ceil(filteredTasks.length / pageSize) || 1)}

            </p>



            {!tasks ? (

              <LoadingState title="Görevler yükleniyor" message="Operasyon motoru kayıtları hazırlanıyor." />

            ) : (

              <>

                <TaskTable

                  tasks={pagedTasks}

                  selectedTaskId={selectedTaskId}

                  onSelect={setSelectedTaskId}

                  onOpen={(taskId) => router.push(`/gorevler/${taskId}`)}

                />

                <div className="tskf-desk-pagination">

                  <Pagination totalItems={filteredTasks.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />

                </div>

              </>

            )}

          </section>



          <aside className="tskf-desk-side" aria-label="Görev bağlam paneli">

            <OperatorWorkspaceContextPanel

              task={selectedTask}

              onOpenDetail={(taskId) => router.push(`/gorevler/${taskId}`)}

            />

          </aside>

        </div>

      </div>

    </section>

  );

}


