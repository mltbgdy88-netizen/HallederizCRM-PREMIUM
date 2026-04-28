"use client";

import { expandDashboardCardToTaskList } from "@hallederiz/domain";
import type { DashboardCard } from "@hallederiz/types";
import { LoadingState, MetricCard, PageHeader } from "@hallederiz/ui";
import { useEffect, useMemo, useState } from "react";
import { getOperationsEngineData, type OperationsEngineData } from "../../dashboard/queries";
import { DashboardCardGrid } from "./DashboardCardGrid";
import { DashboardFilterBar } from "./DashboardFilterBar";
import { DashboardViewTabs, type DashboardView } from "./DashboardViewTabs";
import { TaskListModal } from "./TaskListModal";

export function TaskCenterPage() {
  const [view, setView] = useState<DashboardView>("system");
  const [data, setData] = useState<OperationsEngineData | null>(null);
  const [selectedCard, setSelectedCard] = useState<DashboardCard | null>(null);

  useEffect(() => {
    getOperationsEngineData().then(setData).catch(() => setData({ tasks: [], taskComments: [], approvals: [], workflows: [], alerts: [], dashboardCards: [] }));
  }, []);

  const visibleCards = useMemo(() => {
    if (!data) return [];
    if (view === "all") return data.dashboardCards;
    return data.dashboardCards.filter((card) => card.source === view);
  }, [data, view]);

  const modalTasks = useMemo(() => {
    if (!data || !selectedCard) return [];
    return expandDashboardCardToTaskList(selectedCard, data.tasks);
  }, [data, selectedCard]);

  return (
    <div className="hz-page-stack">
      <PageHeader title="Gorev Merkezi" description="Sistem ve AI kaynakli operasyon kartlarini tek panelden izleyin; karttan goreve, gorevden ilgili kayda ilerleyin." />

      <section className="hz-metric-grid">
        <MetricCard title="Acik Gorev" value={String(data?.tasks.filter((task) => task.status !== "done" && task.status !== "cancelled").length ?? 0)} detail="Sistem + AI" tone="info" />
        <MetricCard title="Kritik" value={String(data?.tasks.filter((task) => task.priority === "critical" || task.status === "overdue").length ?? 0)} detail="Oncelikli takip" tone="danger" />
        <MetricCard title="Onay Bekleyen" value={String(data?.approvals.filter((approval) => approval.status === "pending").length ?? 0)} detail="Approval engine" tone="warning" />
        <MetricCard title="Aktif Workflow" value={String(data?.workflows.filter((workflow) => workflow.status === "active").length ?? 0)} detail="Entity bazli akis" tone="success" />
      </section>

      <DashboardViewTabs view={view} onChange={setView} />
      <DashboardFilterBar />

      {!data ? <LoadingState title="Gorev merkezi yukleniyor" message="Workflow, task ve approval kayitlari hazirlaniyor." /> : <DashboardCardGrid cards={visibleCards} onOpenCard={setSelectedCard} />}

      {selectedCard ? <TaskListModal card={selectedCard} tasks={modalTasks} onClose={() => setSelectedCard(null)} /> : null}
    </div>
  );
}
