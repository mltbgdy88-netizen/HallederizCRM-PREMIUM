import type { FastifyInstance } from "fastify";
import type { Approval, Task } from "@hallederiz/types";
import { addTaskComment, advanceWorkflowStep, bootstrapWorkflow, createApproval, createTask, getApproval, getDashboardSummary, getTask, getWorkflow, listApprovals, listDashboardCards, listDashboardCardTasks, listTasks, updateApprovalStatus, updateTaskStatus } from "./mock-store";

export async function registerOperationsEngineRoutes(server: FastifyInstance) {
  server.get<{ Params: { entityType: string; entityId: string } }>("/workflows/:entityType/:entityId", async (request, reply) => {
    const workflow = getWorkflow(request.params.entityType, request.params.entityId);
    if (!workflow) return reply.status(404).send({ message: "Workflow not found" });
    return { item: workflow };
  });

  server.post<{ Params: { entityType: string; entityId: string } }>("/workflows/:entityType/:entityId/bootstrap", async (request, reply) => reply.status(201).send({ item: bootstrapWorkflow(request.params.entityType, request.params.entityId) }));

  server.post<{ Params: { workflowId: string; stepId: string } }>("/workflows/:workflowId/steps/:stepId/advance", async (request, reply) => {
    const workflow = advanceWorkflowStep(request.params.workflowId, request.params.stepId);
    if (!workflow) return reply.status(404).send({ message: "Workflow not found" });
    return { item: workflow };
  });

  server.get("/tasks", async () => ({ items: listTasks(), total: listTasks().length }));
  server.get<{ Params: { id: string } }>("/tasks/:id", async (request, reply) => {
    const task = getTask(request.params.id);
    if (!task) return reply.status(404).send({ message: "Task not found" });
    return { item: task };
  });
  server.post<{ Body: Partial<Task> }>("/tasks", async (request, reply) => reply.status(201).send({ item: createTask(request.body) }));
  server.post<{ Params: { id: string } }>("/tasks/:id/start", async (request, reply) => {
    const task = updateTaskStatus(request.params.id, "in_progress");
    if (!task) return reply.status(404).send({ message: "Task not found" });
    return { item: task };
  });
  server.post<{ Params: { id: string } }>("/tasks/:id/complete", async (request, reply) => {
    const task = updateTaskStatus(request.params.id, "done");
    if (!task) return reply.status(404).send({ message: "Task not found" });
    return { item: task };
  });
  server.post<{ Params: { id: string } }>("/tasks/:id/cancel", async (request, reply) => {
    const task = updateTaskStatus(request.params.id, "cancelled");
    if (!task) return reply.status(404).send({ message: "Task not found" });
    return { item: task };
  });
  server.post<{ Params: { id: string }; Body: { body?: string } }>("/tasks/:id/comment", async (request, reply) => {
    const comment = addTaskComment(request.params.id, request.body?.body);
    if (!comment) return reply.status(404).send({ message: "Task not found" });
    return reply.status(201).send({ item: comment });
  });

  server.get("/approvals", async () => ({ items: listApprovals(), total: listApprovals().length }));
  server.get<{ Params: { id: string } }>("/approvals/:id", async (request, reply) => {
    const approval = getApproval(request.params.id);
    if (!approval) return reply.status(404).send({ message: "Approval not found" });
    return { item: approval };
  });
  server.post<{ Body: Partial<Approval> }>("/approvals", async (request, reply) => reply.status(201).send({ item: createApproval(request.body) }));
  server.post<{ Params: { id: string } }>("/approvals/:id/approve", async (request, reply) => {
    const approval = updateApprovalStatus(request.params.id, "approved");
    if (!approval) return reply.status(404).send({ message: "Approval not found" });
    return { item: approval };
  });
  server.post<{ Params: { id: string } }>("/approvals/:id/reject", async (request, reply) => {
    const approval = updateApprovalStatus(request.params.id, "rejected");
    if (!approval) return reply.status(404).send({ message: "Approval not found" });
    return { item: approval };
  });
  server.post<{ Params: { id: string } }>("/approvals/:id/execute", async (request, reply) => {
    const approval = updateApprovalStatus(request.params.id, "executed");
    if (!approval) return reply.status(404).send({ message: "Approval not found" });
    return { item: approval };
  });

  server.get("/dashboard/cards", async () => ({ items: listDashboardCards(), total: listDashboardCards().length }));
  server.get<{ Params: { cardType: string } }>("/dashboard/cards/:cardType/tasks", async (request) => ({ items: listDashboardCardTasks(request.params.cardType) }));
  server.get("/dashboard/summary", async () => ({ item: getDashboardSummary() }));
}
