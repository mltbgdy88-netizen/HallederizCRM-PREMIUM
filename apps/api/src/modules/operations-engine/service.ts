import type { Approval, Task } from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";
import { OperationsEngineRepository } from "./repository";

export class OperationsEngineService {
  private readonly repository: OperationsEngineRepository;
  constructor(context: RequestContext) {
    this.repository = new OperationsEngineRepository(context);
  }

  getWorkflow(entityType: string, entityId: string) { return this.repository.getWorkflow(entityType, entityId); }
  bootstrapWorkflow(entityType: string, entityId: string) { return this.repository.bootstrapWorkflow(entityType, entityId); }
  advanceWorkflowStep(workflowId: string, stepId: string) { return this.repository.advanceWorkflowStep(workflowId, stepId); }

  listTasks() { return this.repository.listTasks(); }
  getTask(id: string) { return this.repository.getTask(id); }
  createTask(payload: Partial<Task>) { return this.repository.createTask(payload); }
  updateTaskStatus(id: string, status: Task["status"]) { return this.repository.updateTaskStatus(id, status); }
  addTaskComment(id: string, body?: string) { return this.repository.addTaskComment(id, body); }

  listApprovals() { return this.repository.listApprovals(); }
  getApproval(id: string) { return this.repository.getApproval(id); }
  createApproval(payload: Partial<Approval>) { return this.repository.createApproval(payload); }
  updateApprovalStatus(id: string, status: Approval["status"]) { return this.repository.updateApprovalStatus(id, status); }

  listDashboardCards() { return this.repository.listDashboardCards(); }
  listDashboardCardTasks(cardType: string) { return this.repository.listDashboardCardTasks(cardType); }
  getDashboardSummary() { return this.repository.getDashboardSummary(); }
}
