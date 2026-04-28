import {
  buildDashboardAiCards,
  buildDashboardSystemCards,
  buildDeliveryWorkflow,
  buildOfferWorkflow,
  buildOrderWorkflow,
  buildTaskFromDelivery,
  buildTaskFromOrder,
  buildTaskFromWarehouseOrder,
  deriveTaskOverdueState
} from "@hallederiz/domain";
import type { Alert, Approval, Task, TaskComment, WorkflowInstance } from "@hallederiz/types";
import { getCustomerAccount, getCustomerById } from "../../customers/queries/customer-mock-data";
import { getDeliveryMockData } from "../../deliveries/queries/delivery-mock-data";
import { getOfferMockData } from "../../offers/queries/offer-mock-data";
import { getOrderMockData } from "../../orders/queries/order-mock-data";
import { getStockCatalog } from "../../stock/queries/get-stock-catalog";
import { getWarehouseOrderMockData } from "../../warehouse/queries/warehouse-mock-data";

export interface OperationsEngineData {
  tasks: Task[];
  taskComments: TaskComment[];
  approvals: Approval[];
  workflows: WorkflowInstance[];
  alerts: Alert[];
  dashboardCards: ReturnType<typeof buildDashboardSystemCards>;
}

const tenantId = "tenant_1";
const now = "2026-04-28T12:00:00.000Z";

function withOverdueState(task: Task): Task {
  return { ...task, status: deriveTaskOverdueState(task, new Date(now)) };
}

export async function getOperationsEngineData(): Promise<OperationsEngineData> {
  const [orders, warehouseOrders, deliveries, offers, stockCatalog] = await Promise.all([
    getOrderMockData(),
    getWarehouseOrderMockData(),
    getDeliveryMockData(),
    getOfferMockData(),
    getStockCatalog()
  ]);

  const orderTasks = orders.flatMap((order) => buildTaskFromOrder(order, getCustomerById(order.customerId)));
  const warehouseTasks = warehouseOrders
    .map((warehouseOrder) => buildTaskFromWarehouseOrder(warehouseOrder, getCustomerById(warehouseOrder.customerId)))
    .filter((task): task is Task => Boolean(task));
  const deliveryTasks = deliveries
    .map((delivery) => buildTaskFromDelivery(delivery, getCustomerById(delivery.customerId)))
    .filter((task): task is Task => Boolean(task));

  const criticalStockTasks: Task[] = stockCatalog.products
    .filter((product) => (product.warehouseStocks.find((stock) => stock.warehouseId === "wh_1")?.onHand ?? 0) <= product.criticalStockLevel)
    .map((product, index) => ({
      id: `task_stock_${product.id}`,
      tenantId,
      taskNo: `TSK-STK-${index + 1}`,
      title: `${product.code} kritik stok seviyesinde`,
      description: "Merkez depo stogu kritik seviyeye yaklasti; fabrika veya satin alma aksiyonu planlanmali.",
      type: "critical_stock",
      status: "open",
      priority: "critical",
      source: "system",
      entityType: "product",
      entityId: product.id,
      entityNo: product.code,
      assigneeName: "Stok Sorumlusu",
      dueAt: "2026-04-28T16:00:00.000Z",
      createdAt: now,
      updatedAt: now
    }));

  const customerRiskTasks: Task[] = orders
    .map((order) => ({ order, customer: getCustomerById(order.customerId), account: getCustomerAccount(order.customerId) }))
    .filter(({ customer, account }) => customer?.riskLevel === "high" || account.overdueAmount > 100000)
    .map(({ order, customer, account }, index) => ({
      id: `task_customer_risk_${order.customerId}_${index}`,
      tenantId: order.tenantId,
      taskNo: `TSK-RISK-${index + 1}`,
      title: `${customer?.name ?? "Cari"} risk kontrolu`,
      description: `Acik bakiye ${account.balance.toLocaleString("tr-TR")} TRY; tahsilat/onay kontrolu onerilir.`,
      type: account.balance > 300000 ? "high_debt" : "customer_risk",
      status: "open",
      priority: "critical",
      source: "system",
      entityType: "customer",
      entityId: order.customerId,
      entityNo: customer?.code ?? order.customerId,
      customerId: order.customerId,
      customerName: customer?.name,
      assigneeName: "Yonetici",
      dueAt: "2026-04-28T15:30:00.000Z",
      createdAt: now,
      updatedAt: now
    }));

  const approvals: Approval[] = [
    {
      id: "approval_1",
      tenantId,
      approvalNo: "APR-1001",
      type: "delivery_payment_missing",
      status: "pending",
      entityType: "delivery",
      entityId: "delivery_1",
      entityNo: "DLV-401",
      requestedBy: "user_1",
      requestedByName: "Satis Operasyon",
      requestedRole: "Yonetici",
      createdAt: "2026-04-28T10:20:00.000Z",
      expiresAt: "2026-04-29T10:20:00.000Z",
      riskNote: "Kismi tahsilat varken teslim tamamlanmak isteniyor.",
      payloadSummary: "Eksik tahsilata ragmen teslim onayi",
      payload: { deliveryId: "delivery_1", missingPayment: true, policy: "require_manager_approval" },
      policySnapshot: { policyId: "policy_delivery_payment", requiredRole: "Yonetici", minApproverCount: 1, reason: "Eksik tahsilatli teslim", serverActionKey: "delivery.complete" },
      execution: { executable: true }
    },
    {
      id: "approval_2",
      tenantId,
      approvalNo: "APR-1002",
      type: "ai_action_proposal",
      status: "approved",
      entityType: "ai_proposal",
      entityId: "ai_proposal_1",
      entityNo: "AI-401",
      requestedBy: "user_ai",
      requestedByName: "Lokal AI",
      requestedRole: "Satis Muduru",
      decidedBy: "user_2",
      decidedByName: "Yonetici",
      decidedAt: "2026-04-28T11:05:00.000Z",
      createdAt: "2026-04-28T10:50:00.000Z",
      riskNote: "Cari tahsilat riski icin WhatsApp follow-up onerisi.",
      payloadSummary: "Riskli cariye tahsilat mesaji taslagi",
      payload: { customerId: "customer_2", action: "whatsapp_payment_followup" },
      policySnapshot: { policyId: "policy_ai_mutation", requiredRole: "Satis Muduru", minApproverCount: 1, reason: "AI mutation insan onayli", serverActionKey: "whatsapp.send_template" },
      execution: { executable: true }
    }
  ];

  const aiTasks: Task[] = [
    {
      id: "task_ai_risk_1",
      tenantId,
      taskNo: "TSK-AI-401",
      title: "AI odeme riski sinyali",
      description: "Mira Yapi icin gecikme ve yuksek bakiye birlikte goruluyor; onayli follow-up onerisi hazir.",
      type: "ai_risk",
      status: "open",
      priority: "high",
      source: "ai",
      entityType: "ai_proposal",
      entityId: "ai_proposal_1",
      entityNo: "AI-401",
      customerId: "customer_2",
      customerName: "Mira Yapi",
      dueAt: "2026-04-28T17:00:00.000Z",
      createdAt: now,
      updatedAt: now,
      approvalId: "approval_2"
    },
    {
      id: "task_ai_sales_1",
      tenantId,
      taskNo: "TSK-AI-524",
      title: "AI satis firsati: Pera Mimarlik tekrar siparis",
      description: "Benzer proje urunleri icin mimar fiyat slotundan teklif onerisi uretilebilir.",
      type: "ai_sales_opportunity",
      status: "open",
      priority: "normal",
      source: "ai",
      entityType: "customer",
      entityId: "customer_3",
      entityNo: "CUS-003",
      customerId: "customer_3",
      customerName: "Pera Mimarlik",
      dueAt: "2026-04-29T11:15:00.000Z",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "task_ai_payment_priority_1",
      tenantId,
      taskNo: "TSK-AI-530",
      title: "AI tahsilat onceligi: Kuzey Insaat",
      description: "Yuksek borc ve blokaj seviyesi nedeniyle bugun finans follow-up oneriliyor.",
      type: "ai_payment_priority",
      status: "open",
      priority: "critical",
      source: "ai",
      entityType: "customer",
      entityId: "customer_8",
      entityNo: "CUS-008",
      customerId: "customer_8",
      customerName: "Kuzey Insaat",
      dueAt: "2026-04-28T13:30:00.000Z",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "task_ai_operation_reminder_1",
      tenantId,
      taskNo: "TSK-AI-590",
      title: "AI operasyon hatirlatmasi: teslim bekleyen hazir siparis",
      description: "SO-2455 hazir durumunda; musteri bildirimi ve teslim planlama bekliyor.",
      type: "ai_operation_reminder",
      status: "open",
      priority: "high",
      source: "ai",
      entityType: "order",
      entityId: "order_5",
      entityNo: "SO-2455",
      customerId: "customer_5",
      customerName: "Bursa Duvar Bayi",
      dueAt: "2026-04-28T16:15:00.000Z",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "task_ai_stock_1",
      tenantId,
      taskNo: "TSK-AI-610",
      title: "AI stok tukenme tahmini: DK-2022",
      description: "Son siparis hizi ve merkez depo stogu birlikte degerlendirildiginde 7 gun icinde kritiklesebilir.",
      type: "ai_stockout_prediction",
      status: "open",
      priority: "high",
      source: "ai",
      entityType: "product",
      entityId: "prod_2",
      entityNo: "DK-2022",
      dueAt: "2026-04-29T09:00:00.000Z",
      createdAt: now,
      updatedAt: now
    }
  ];

  const approvalTasks: Task[] = approvals
    .filter((approval) => approval.status === "pending")
    .map((approval) => ({
      id: `task_approval_${approval.id}`,
      tenantId: approval.tenantId,
      taskNo: `TSK-${approval.approvalNo}`,
      title: "Onay bekleyen operasyon karari",
      description: approval.payloadSummary,
      type: "approval_required",
      status: "open",
      priority: "critical",
      source: "system",
      entityType: approval.entityType,
      entityId: approval.entityId,
      entityNo: approval.entityNo,
      dueAt: approval.expiresAt ?? "2026-04-29T12:00:00.000Z",
      createdAt: approval.createdAt,
      updatedAt: approval.createdAt,
      approvalId: approval.id
    }));
  const pilotScenarioTasks: Task[] = [
    {
      id: "task_factory_inbound_1",
      tenantId,
      taskNo: "TSK-FAB-310",
      title: "FO-214 fabrika sevkiyat takibi",
      description: "Izmir Fabrika uretimde; teslim tarihi yaklasiyor, durum teyidi alinmali.",
      type: "factory_inbound",
      status: "open",
      priority: "high",
      source: "system",
      entityType: "factory_order",
      entityId: "factory_order_2",
      entityNo: "FO-214",
      assigneeName: "Operasyon",
      dueAt: "2026-04-28T17:30:00.000Z",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "task_customer_risk_blocked_1",
      tenantId,
      taskNo: "TSK-RISK-900",
      title: "Kuzey Insaat blokaj/risk kontrolu",
      description: "Blokeli risk seviyesinde yuksek borclu cari; yeni fabrika siparisi onay gerektirir.",
      type: "customer_risk",
      status: "open",
      priority: "critical",
      source: "system",
      entityType: "customer",
      entityId: "customer_8",
      entityNo: "CUS-008",
      customerId: "customer_8",
      customerName: "Kuzey Insaat",
      assigneeName: "Yonetici",
      dueAt: "2026-04-28T14:30:00.000Z",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "task_customer_reactivation_1",
      tenantId,
      taskNo: "TSK-CRM-204",
      title: "Bursa Duvar Bayi yeniden aktivasyon",
      description: "Son siparis uzerinden uzun sure gecti; bayi fiyat grubu ile kampanya teklifi onerilir.",
      type: "customer_reactivation",
      status: "open",
      priority: "normal",
      source: "system",
      entityType: "customer",
      entityId: "customer_5",
      entityNo: "CUS-005",
      customerId: "customer_5",
      customerName: "Bursa Duvar Bayi",
      assigneeName: "Satis",
      dueAt: "2026-04-29T10:00:00.000Z",
      createdAt: now,
      updatedAt: now
    }
  ];

  const tasks = [...orderTasks, ...warehouseTasks, ...deliveryTasks, ...criticalStockTasks, ...customerRiskTasks, ...approvalTasks, ...pilotScenarioTasks, ...aiTasks].map(withOverdueState);
  const workflows = [
    ...orders.map(buildOrderWorkflow),
    ...offers.map(buildOfferWorkflow),
    ...deliveries.map(buildDeliveryWorkflow)
  ];
  const alerts: Alert[] = tasks
    .filter((task) => task.priority === "critical" || task.status === "overdue")
    .map((task) => ({
      id: `alert_${task.id}`,
      tenantId: task.tenantId,
      title: task.title,
      severity: task.priority === "critical" ? "critical" : "warning",
      entityType: task.entityType,
      entityId: task.entityId,
      entityNo: task.entityNo,
      message: task.description ?? task.title,
      createdAt: task.createdAt
    }));
  const dashboardCards = [...buildDashboardSystemCards(tasks), ...buildDashboardAiCards(tasks)];
  const taskComments: TaskComment[] = [
    { id: "comment_1", taskId: tasks[0]?.id ?? "task_missing", authorId: "user_1", authorName: "Satis Operasyon", body: "Kaynak plani kontrol edildi, fabrika teyidi bekleniyor.", createdAt: "2026-04-28T11:30:00.000Z" }
  ];

  return { tasks, taskComments, approvals, workflows, alerts, dashboardCards };
}

export async function getTaskById(taskId?: string): Promise<Task | null> {
  const data = await getOperationsEngineData();
  return data.tasks.find((task) => task.id === taskId || task.taskNo === taskId) ?? data.tasks[0] ?? null;
}

export async function getApprovalById(approvalId?: string): Promise<Approval | null> {
  const data = await getOperationsEngineData();
  return data.approvals.find((approval) => approval.id === approvalId || approval.approvalNo === approvalId) ?? data.approvals[0] ?? null;
}

export async function getWorkflowByEntity(entityType?: string, entityId?: string): Promise<WorkflowInstance | null> {
  const data = await getOperationsEngineData();
  return data.workflows.find((workflow) => workflow.entityType === entityType && (workflow.entityId === entityId || workflow.entityNo === entityId)) ?? data.workflows[0] ?? null;
}
