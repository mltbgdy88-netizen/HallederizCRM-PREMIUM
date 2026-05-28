import type { DashboardCard, DashboardCardType, DashboardTaskLink, Task, TaskType, WorkflowEntityType } from "@hallederiz/types";

const systemCardMap: Array<{ type: DashboardCardType; taskTypes: TaskType[]; title: string; detail: string; icon: string }> = [
  { type: "new_orders", taskTypes: ["new_order"], title: "Yeni Siparisler", detail: "Kaynak plani bekleyen siparisler", icon: "orders" },
  { type: "pending_payments", taskTypes: ["payment_followup"], title: "Odeme Bekleyenler", detail: "Tahsilat veya allocation aksiyonu gerekli", icon: "payments" },
  { type: "warehouse_preparation", taskTypes: ["warehouse_picking"], title: "Depoda Hazirlanacaklar", detail: "Toplama ve raf kontrolu bekliyor", icon: "warehouse" },
  { type: "factory_order_needed", taskTypes: ["factory_order_needed"], title: "Fabrikaya Gecilmemis Siparisler", detail: "Fabrika siparisi/teyidi bekleyenler", icon: "factories" },
  { type: "factory_inbound", taskTypes: ["factory_inbound"], title: "Fabrikadan Gelecekler", detail: "Inbound fabrika takipleri", icon: "factories" },
  { type: "delivery_waiting", taskTypes: ["delivery_waiting"], title: "Hazir Ama Teslim Edilmemisler", detail: "Teslim dogrulama veya bildirim bekliyor", icon: "delivery" },
  { type: "critical_stock", taskTypes: ["critical_stock"], title: "Kritik Stoklar", detail: "Stok seviyesi esigin altinda", icon: "stock" },
  { type: "inactive_payers", taskTypes: ["payment_followup"], title: "Uzun Suredir Odeme Yapmayanlar", detail: "Finans follow-up onerilir", icon: "payments" },
  { type: "high_risk_customers", taskTypes: ["customer_risk"], title: "Yuksek Risk Cariler", detail: "Limit ve tahsilat riski olan cariler", icon: "customers" },
  { type: "high_debt_customers", taskTypes: ["high_debt"], title: "Yuksek Tutarli Borclular", detail: "Bakiye onceliklendirme listesi", icon: "reports" },
  { type: "payment_request_needed", taskTypes: ["payment_followup"], title: "Odeme Istenmesi Gerekenler", detail: "Bugun iletisime gecilecek kayitlar", icon: "payments" },
  { type: "inactive_customers", taskTypes: ["customer_reactivation"], title: "Uzun Suredir Siparis Vermeyenler", detail: "Satis yeniden aktivasyon listesi", icon: "customers" }
];

const aiCardMap: Array<{ type: DashboardCardType; taskTypes: TaskType[]; title: string; detail: string; icon: string }> = [
  { type: "ai_risk_alerts", taskTypes: ["ai_risk"], title: "AI Risk Uyarilari", detail: "Modelin isaretledigi risk sinyalleri", icon: "ai" },
  { type: "ai_payment_priorities", taskTypes: ["ai_payment_priority"], title: "AI Tahsilat Oncelikleri", detail: "Tahsilat icin onerilen siralama", icon: "payments" },
  { type: "ai_sales_opportunities", taskTypes: ["ai_sales_opportunity"], title: "AI Satis Firsatlari", detail: "Capraz satis ve tekrar siparis onerileri", icon: "reports" },
  { type: "ai_operation_reminders", taskTypes: ["ai_operation_reminder"], title: "AI Operasyon Hatirlatmalari", detail: "Gecikme riski olan is akislari", icon: "dashboard" },
  { type: "ai_stockout_predictions", taskTypes: ["ai_stockout_prediction"], title: "AI Stok Tukenme Tahminleri", detail: "Yaklasan stok kritiklesme sinyalleri", icon: "stock" }
];

function severityFor(tasks: Task[]): "info" | "warning" | "critical" {
  if (tasks.some((task) => task.priority === "critical" || task.status === "overdue")) {
    return "critical";
  }

  if (tasks.some((task) => task.priority === "high")) {
    return "warning";
  }

  return "info";
}

function taskHref(task: Pick<Task, "entityType" | "entityId" | "approvalId">): string {
  return buildTaskNavigationTarget(task).href;
}

function buildCards(tasks: Task[], map: typeof systemCardMap): DashboardCard[] {
  return map.map((definition) => {
    const cardTasks = tasks.filter((task) => definition.taskTypes.includes(task.type));
    const severity = severityFor(cardTasks);
    return {
      id: `card_${definition.type}`,
      type: definition.type,
      source: definition.type.startsWith("ai_") ? "ai" : "system",
      title: definition.title,
      value: cardTasks.length,
      detail: definition.detail,
      severity,
      icon: definition.icon,
      pulse: severity === "critical" && cardTasks.length > 0,
      taskIds: cardTasks.map((task) => task.id),
      links: cardTasks.map((task): DashboardTaskLink => ({ taskId: task.id, entityType: task.entityType, entityId: task.entityId, href: taskHref(task) }))
    };
  });
}

export function buildDashboardSystemCards(tasks: Task[]): DashboardCard[] {
  return buildCards(tasks.filter((task) => task.source === "system"), systemCardMap);
}

export function buildDashboardAiCards(tasks: Task[]): DashboardCard[] {
  return buildCards(tasks.filter((task) => task.source === "ai"), aiCardMap);
}

export function expandDashboardCardToTaskList(card: DashboardCard, tasks: Task[]): Task[] {
  const taskIdSet = new Set(card.taskIds);
  return tasks.filter((task) => taskIdSet.has(task.id));
}

export function buildTaskNavigationTarget(task: Pick<Task, "entityType" | "entityId" | "approvalId">): { entityType: WorkflowEntityType; href: string } {
  if (task.approvalId) {
    return { entityType: "ai_proposal", href: `/onaylar/${task.approvalId}` };
  }

  const hrefByEntity: Record<WorkflowEntityType, string> = {
    offer: `/teklifler/${task.entityId}`,
    order: `/siparisler/${task.entityId}`,
    payment: `/tahsilatlar/${task.entityId}`,
    warehouse_order: `/depo/emirler/${task.entityId}`,
    delivery: `/teslimatlar/${task.entityId}`,
    factory_order: `/fabrikalar/siparisler/${task.entityId}`,
    invoice: `/faturalar/${task.entityId}`,
    return: `/iadeler/${task.entityId}`,
    customer: `/cariler/${task.entityId}`,
    product: "/stok",
    document: "/belgeler",
    ai_proposal: "/ai/onaylar"
  };

  return { entityType: task.entityType, href: hrefByEntity[task.entityType] };
}
