import type { Approval, DashboardCard, Task, TaskComment, WorkflowInstance } from "@hallederiz/types";

const now = "2026-04-28T12:00:00.000Z";

const tasks: Task[] = [
  { id: "task_api_1", tenantId: "tenant_1", taskNo: "TSK-API-001", title: "Siparis kaynak plani bekliyor", description: "Mock API operasyon gorevi.", type: "new_order", status: "open", priority: "high", source: "system", entityType: "order", entityId: "order_1", entityNo: "SO-2481", customerId: "customer_1", customerName: "Aydin Dekor", assigneeName: "Satis Operasyon", dueAt: "2026-04-28T17:00:00.000Z", createdAt: now, updatedAt: now },
  { id: "task_api_2", tenantId: "tenant_1", taskNo: "TSK-API-002", title: "AI tahsilat follow-up onerisi", description: "AI proposal approval bekliyor.", type: "ai_risk", status: "open", priority: "high", source: "ai", entityType: "ai_proposal", entityId: "ai_proposal_1", entityNo: "AI-401", customerId: "customer_2", customerName: "Mira Yapi", dueAt: "2026-04-28T17:30:00.000Z", createdAt: now, updatedAt: now, approvalId: "approval_api_1" }
];

const approvals: Approval[] = [
  { id: "approval_api_1", tenantId: "tenant_1", approvalNo: "APR-API-001", type: "ai_action_proposal", status: "pending", entityType: "ai_proposal", entityId: "ai_proposal_1", entityNo: "AI-401", requestedBy: "user_ai", requestedByName: "Lokal AI", requestedRole: "Yonetici", createdAt: now, riskNote: "AI mutation icin insan onayi gerekir.", payloadSummary: "WhatsApp tahsilat hatirlatmasi gonder", payload: { action: "whatsapp.send_template" }, policySnapshot: { policyId: "policy_ai", requiredRole: "Yonetici", minApproverCount: 1, reason: "AI mutation", serverActionKey: "whatsapp.send_template" }, execution: { executable: true } }
];

const workflows: WorkflowInstance[] = [
  { id: "workflow_api_order_1", tenantId: "tenant_1", workflowNo: "WF-SO-2481", entityType: "order", entityId: "order_1", entityNo: "SO-2481", status: "active", currentStepKey: "source_plan", createdAt: now, updatedAt: now, steps: [
    { id: "wf_step_1", workflowId: "workflow_api_order_1", key: "confirm", title: "Siparis onayi", status: "completed", sortOrder: 1, completedAt: now },
    { id: "wf_step_2", workflowId: "workflow_api_order_1", key: "source_plan", title: "Kaynak plani", status: "active", sortOrder: 2, startedAt: now },
    { id: "wf_step_3", workflowId: "workflow_api_order_1", key: "warehouse", title: "Depo hazirlik", status: "pending", sortOrder: 3 }
  ] }
];

const dashboardCards: DashboardCard[] = [
  { id: "card_new_orders", type: "new_orders", source: "system", title: "Yeni Siparisler", value: 1, detail: "Kaynak plani bekleyenler", severity: "warning", icon: "orders", taskIds: ["task_api_1"], links: [{ taskId: "task_api_1", entityType: "order", entityId: "order_1", href: "/siparisler/order_1" }] },
  { id: "card_ai_risk", type: "ai_risk_alerts", source: "ai", title: "AI Risk Uyarilari", value: 1, detail: "Onay bekleyen AI onerileri", severity: "warning", icon: "ai", taskIds: ["task_api_2"], links: [{ taskId: "task_api_2", entityType: "ai_proposal", entityId: "ai_proposal_1", href: "/onaylar/approval_api_1" }] }
];

export function listTasks() { return tasks; }
export function getTask(id: string) { return tasks.find((task) => task.id === id || task.taskNo === id); }
export function createTask(input: Partial<Task>) { const task: Task = { ...tasks[0], ...input, id: input.id ?? `task_${tasks.length + 1}`, taskNo: input.taskNo ?? `TSK-${tasks.length + 1}`, createdAt: now, updatedAt: now } as Task; tasks.push(task); return task; }
export function updateTaskStatus(id: string, status: Task["status"]) { const task = getTask(id); if (!task) return null; task.status = status; task.updatedAt = now; return task; }
export function addTaskComment(id: string, body?: string): TaskComment | null { const task = getTask(id); if (!task) return null; return { id: `comment_${id}_${Date.now()}`, taskId: task.id, authorId: "user_1", authorName: "Operasyon", body: body ?? "Mock not eklendi.", createdAt: now }; }

export function listApprovals() { return approvals; }
export function getApproval(id: string) { return approvals.find((approval) => approval.id === id || approval.approvalNo === id); }
export function createApproval(input: Partial<Approval>) { const approval: Approval = { ...approvals[0], ...input, id: input.id ?? `approval_${approvals.length + 1}`, approvalNo: input.approvalNo ?? `APR-${approvals.length + 1}`, createdAt: now } as Approval; approvals.push(approval); return approval; }
export function updateApprovalStatus(id: string, status: Approval["status"]) { const approval = getApproval(id); if (!approval) return null; approval.status = status; approval.decidedAt = now; return approval; }

export function getWorkflow(entityType: string, entityId: string) { return workflows.find((workflow) => workflow.entityType === entityType && (workflow.entityId === entityId || workflow.entityNo === entityId)); }
export function bootstrapWorkflow(entityType: string, entityId: string) {
  const existingWorkflow = getWorkflow(entityType, entityId);
  if (existingWorkflow) {
    return existingWorkflow;
  }

  const template = workflows[0];
  const workflow: WorkflowInstance = {
    id: `workflow_${entityType}_${entityId}`,
    tenantId: template?.tenantId ?? "tenant_1",
    workflowNo: `WF-${entityId}`,
    entityType: entityType as WorkflowInstance["entityType"],
    entityId,
    entityNo: entityId,
    status: "active",
    currentStepKey: template?.currentStepKey,
    createdAt: now,
    updatedAt: now,
    steps: template?.steps.map((step) => ({ ...step, id: `${entityId}_${step.key}`, workflowId: `workflow_${entityType}_${entityId}` })) ?? []
  };
  workflows.push(workflow);
  return workflow;
}
export function advanceWorkflowStep(workflowId: string, stepId: string) { const workflow = workflows.find((item) => item.id === workflowId); if (!workflow) return null; workflow.steps = workflow.steps.map((step) => step.id === stepId || step.key === stepId ? { ...step, status: "completed", completedAt: now } : step); workflow.updatedAt = now; return workflow; }

export function listDashboardCards() { return dashboardCards; }
export function listDashboardCardTasks(cardType: string) { const card = dashboardCards.find((item) => item.type === cardType || item.id === cardType); return card ? tasks.filter((task) => card.taskIds.includes(task.id)) : []; }
export function getDashboardSummary() { return { taskCount: tasks.length, approvalCount: approvals.length, pendingApprovalCount: approvals.filter((approval) => approval.status === "pending").length, workflowCount: workflows.length }; }
