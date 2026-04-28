import type { FastifyInstance } from "fastify";
import type { Approval, Task } from "@hallederiz/types";
import { OperationsEngineService } from "../modules/operations-engine/service";
import { buildRequestContext } from "../shared/request-context";

export async function registerOperationsEngineRoutes(server: FastifyInstance) {
  server.get<{ Params: { entityType: string; entityId: string } }>("/workflows/:entityType/:entityId", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const workflow = service.getWorkflow(request.params.entityType, request.params.entityId);
    if (!workflow) return reply.status(404).send({ message: "Workflow not found" });
    return { item: workflow };
  });

  server.post<{ Params: { entityType: string; entityId: string } }>("/workflows/:entityType/:entityId/bootstrap", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    return reply.status(201).send({ item: service.bootstrapWorkflow(request.params.entityType, request.params.entityId) });
  });

  server.post<{ Params: { workflowId: string; stepId: string } }>("/workflows/:workflowId/steps/:stepId/advance", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const workflow = service.advanceWorkflowStep(request.params.workflowId, request.params.stepId);
    if (!workflow) return reply.status(404).send({ message: "Workflow not found" });
    return { item: workflow };
  });

  server.get("/tasks", async (request) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const items = service.listTasks();
    return { items, total: items.length };
  });
  server.get<{ Params: { id: string } }>("/tasks/:id", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const task = service.getTask(request.params.id);
    if (!task) return reply.status(404).send({ message: "Task not found" });
    return { item: task };
  });
  server.post<{ Body: Partial<Task> }>("/tasks", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    return reply.status(201).send({ item: service.createTask(request.body) });
  });
  server.post<{ Params: { id: string } }>("/tasks/:id/start", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const task = service.updateTaskStatus(request.params.id, "in_progress");
    if (!task) return reply.status(404).send({ message: "Task not found" });
    return { item: task };
  });
  server.post<{ Params: { id: string } }>("/tasks/:id/complete", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const task = service.updateTaskStatus(request.params.id, "done");
    if (!task) return reply.status(404).send({ message: "Task not found" });
    return { item: task };
  });
  server.post<{ Params: { id: string } }>("/tasks/:id/cancel", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const task = service.updateTaskStatus(request.params.id, "cancelled");
    if (!task) return reply.status(404).send({ message: "Task not found" });
    return { item: task };
  });
  server.post<{ Params: { id: string }; Body: { body?: string } }>("/tasks/:id/comment", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const comment = service.addTaskComment(request.params.id, request.body?.body);
    if (!comment) return reply.status(404).send({ message: "Task not found" });
    return reply.status(201).send({ item: comment });
  });

  server.get("/approvals", async (request) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const items = service.listApprovals();
    return { items, total: items.length };
  });
  server.get<{ Params: { id: string } }>("/approvals/:id", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const approval = service.getApproval(request.params.id);
    if (!approval) return reply.status(404).send({ message: "Approval not found" });
    return { item: approval };
  });
  server.post<{ Body: Partial<Approval> }>("/approvals", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    return reply.status(201).send({ item: service.createApproval(request.body) });
  });
  server.post<{ Params: { id: string } }>("/approvals/:id/approve", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const approval = service.updateApprovalStatus(request.params.id, "approved");
    if (!approval) return reply.status(404).send({ message: "Approval not found" });
    return { item: approval };
  });
  server.post<{ Params: { id: string } }>("/approvals/:id/reject", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const approval = service.updateApprovalStatus(request.params.id, "rejected");
    if (!approval) return reply.status(404).send({ message: "Approval not found" });
    return { item: approval };
  });
  server.post<{ Params: { id: string } }>("/approvals/:id/execute", async (request, reply) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const approval = service.updateApprovalStatus(request.params.id, "executed");
    if (!approval) return reply.status(404).send({ message: "Approval not found" });
    return { item: approval };
  });

  server.get("/dashboard/cards", async (request) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    const items = service.listDashboardCards();
    return { items, total: items.length };
  });
  server.get<{ Params: { cardType: string } }>("/dashboard/cards/:cardType/tasks", async (request) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    return { items: service.listDashboardCardTasks(request.params.cardType) };
  });
  server.get("/dashboard/summary", async (request) => {
    const service = new OperationsEngineService(buildRequestContext(request));
    return { item: service.getDashboardSummary() };
  });
}
