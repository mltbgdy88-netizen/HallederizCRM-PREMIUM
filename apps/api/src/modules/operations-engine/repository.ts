import type { Approval, Task } from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";
import {
  addTaskComment,
  advanceWorkflowStep,
  bootstrapWorkflow,
  createApproval,
  createTask,
  getApproval,
  getDashboardSummary,
  getTask,
  getWorkflow,
  listApprovals,
  listDashboardCards,
  listDashboardCardTasks,
  listTasks,
  updateApprovalStatus,
  updateTaskStatus
} from "../../operations-engine/mock-store";

export class OperationsEngineRepository {
  constructor(private readonly context: RequestContext) {
    void this.context;
  }

  getWorkflow(entityType: string, entityId: string) { return getWorkflow(entityType, entityId); }
  bootstrapWorkflow(entityType: string, entityId: string) { return bootstrapWorkflow(entityType, entityId); }
  advanceWorkflowStep(workflowId: string, stepId: string) { return advanceWorkflowStep(workflowId, stepId); }

  listTasks() { return listTasks(); }
  getTask(id: string) { return getTask(id); }
  createTask(payload: Partial<Task>) { return createTask(payload); }
  updateTaskStatus(id: string, status: Task["status"]) { return updateTaskStatus(id, status); }
  addTaskComment(id: string, body?: string) { return addTaskComment(id, body); }

  listApprovals() { return listApprovals(); }
  getApproval(id: string) { return getApproval(id); }
  createApproval(payload: Partial<Approval>) { return createApproval(payload); }
  updateApprovalStatus(id: string, status: Approval["status"]) { return updateApprovalStatus(id, status); }

  listDashboardCards() { return listDashboardCards(); }
  listDashboardCardTasks(cardType: string) { return listDashboardCardTasks(cardType); }
  getDashboardSummary() { return getDashboardSummary(); }
}
