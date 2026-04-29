import type { FastifyInstance } from "fastify";
import type { Approval, Task } from "@hallederiz/types";
import { OperationsEngineService } from "../modules/operations-engine/service";
import { buildRequestContext } from "../shared/request-context";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../shared/auth-guards";
import { listAuditEvents, recordAuditEvent } from "../shared/audit-timeline";
import { createApprovalExecution, runApprovalExecution } from "../ai-local-output-store";
import type { AiOperationType } from "@hallederiz/types";
import { readPermissions, requireReadAccess } from "../shared/read-guards";

function resolveExecutionAction(approval: Approval): AiOperationType | null {
  const payloadAction = typeof approval.payload.action === "string" ? approval.payload.action : undefined;
  const payloadOperation = typeof approval.payload.operationType === "string" ? approval.payload.operationType : undefined;
  const actionKey = payloadOperation ?? payloadAction ?? approval.policySnapshot.serverActionKey ?? "";
  const normalized = actionKey.toLowerCase();

  const map: Record<string, AiOperationType> = {
    create_payment: "create_payment",
    "payment.create": "create_payment",
    mark_warehouse_ready: "mark_warehouse_ready",
    "warehouse.mark_ready": "mark_warehouse_ready",
    "warehouse.prepare": "mark_warehouse_ready",
    complete_delivery: "complete_delivery",
    "delivery.complete": "complete_delivery",
    create_invoice: "create_invoice",
    "invoice.create": "create_invoice",
    create_return: "create_return",
    "return.create": "create_return",
    queue_document_save: "queue_document_save",
    "document.queue_save": "queue_document_save",
    queue_document_print: "queue_document_print",
    "document.queue_print": "queue_document_print",
    send_document_whatsapp: "send_document_whatsapp",
    "document.send_whatsapp": "send_document_whatsapp",
    "whatsapp.send_template": "send_document_whatsapp"
  };

  return map[normalized] ?? null;
}

export async function registerOperationsEngineRoutes(server: FastifyInstance) {
  server.get<{ Params: { entityType: string; entityId: string } }>("/workflows/:entityType/:entityId", async (request, reply) => {
    return withGuards(request, reply, requireReadAccess(readPermissions.workflow), async (context) => {
      const service = new OperationsEngineService(context);
      const workflow = service.getWorkflow(request.params.entityType, request.params.entityId);
      if (!workflow) return reply.status(404).send({ message: "Workflow not found" });
      return { item: workflow };
    });
  });

  server.post<{ Params: { entityType: string; entityId: string } }>("/workflows/:entityType/:entityId/bootstrap", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["workflow.write", "orders.write"])], async (context) => {
      const service = new OperationsEngineService(context);
      return reply.status(201).send({ item: service.bootstrapWorkflow(request.params.entityType, request.params.entityId) });
    });
  });

  server.post<{ Params: { workflowId: string; stepId: string } }>("/workflows/:workflowId/steps/:stepId/advance", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["workflow.write", "orders.write"])], async (context) => {
      const service = new OperationsEngineService(context);
      const workflow = service.advanceWorkflowStep(request.params.workflowId, request.params.stepId);
      if (!workflow) return reply.status(404).send({ message: "Workflow not found" });
      return { item: workflow };
    });
  });

  server.get("/tasks", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.tasks), async (context) => {
    const service = new OperationsEngineService(context);
    const items = service.listTasks();
    return { items, total: items.length };
  }));
  server.get<{ Params: { id: string } }>("/tasks/:id", async (request, reply) => {
    return withGuards(request, reply, requireReadAccess(readPermissions.tasks), async (context) => {
      const service = new OperationsEngineService(context);
      const task = service.getTask(request.params.id);
      if (!task) return reply.status(404).send({ message: "Task not found" });
      return { item: task };
    });
  });
  server.post<{ Body: Partial<Task> }>("/tasks", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["tasks.write", "workflow.write"])], async (context) => {
      const service = new OperationsEngineService(context);
      return reply.status(201).send({ item: service.createTask(request.body) });
    });
  });
  server.post<{ Params: { id: string } }>("/tasks/:id/start", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["tasks.write", "workflow.write"])], async (context) => {
      const service = new OperationsEngineService(context);
      const task = service.updateTaskStatus(request.params.id, "in_progress");
      if (!task) return reply.status(404).send({ message: "Task not found" });
      return { item: task };
    });
  });
  server.post<{ Params: { id: string } }>("/tasks/:id/complete", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["tasks.write", "workflow.write"])], async (context) => {
      const service = new OperationsEngineService(context);
      const task = service.updateTaskStatus(request.params.id, "done");
      if (!task) return reply.status(404).send({ message: "Task not found" });
      return { item: task };
    });
  });
  server.post<{ Params: { id: string } }>("/tasks/:id/cancel", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["tasks.write", "workflow.write"])], async (context) => {
      const service = new OperationsEngineService(context);
      const task = service.updateTaskStatus(request.params.id, "cancelled");
      if (!task) return reply.status(404).send({ message: "Task not found" });
      return { item: task };
    });
  });
  server.post<{ Params: { id: string }; Body: { body?: string } }>("/tasks/:id/comment", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["tasks.write", "workflow.write"])], async (context) => {
      const service = new OperationsEngineService(context);
      const comment = service.addTaskComment(request.params.id, request.body?.body);
      if (!comment) return reply.status(404).send({ message: "Task not found" });
      return reply.status(201).send({ item: comment });
    });
  });

  server.get("/approvals", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.approvals), async (context) => {
    const service = new OperationsEngineService(context);
    const items = service.listApprovals();
    return { items, total: items.length };
  }));
  server.get<{ Params: { id: string } }>("/approvals/:id", async (request, reply) => {
    return withGuards(request, reply, requireReadAccess(readPermissions.approvals), async (context) => {
      const service = new OperationsEngineService(context);
      const approval = service.getApproval(request.params.id);
      if (!approval) return reply.status(404).send({ message: "Approval not found" });
      return { item: approval };
    });
  });
  server.post<{ Body: Partial<Approval> }>("/approvals", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["approvals.write", "approvals.manage"])], async (context) => {
      const service = new OperationsEngineService(context);
      return reply.status(201).send({ item: service.createApproval(request.body) });
    });
  });
  server.post<{ Params: { id: string } }>("/approvals/:id/approve", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["approvals.write", "approvals.approve"])], async (context) => {
      const service = new OperationsEngineService(context);
      const approval = service.updateApprovalStatus(request.params.id, "approved");
      if (!approval) return reply.status(404).send({ message: "Approval not found" });
      recordAuditEvent(context, {
        entityType: "approval",
        entityId: approval.id,
        eventType: "approval.approved",
        title: "Onay kaydi onaylandi",
        description: `${approval.approvalNo} onaylandi.`
      });
      return { item: approval };
    });
  });
  server.post<{ Params: { id: string } }>("/approvals/:id/reject", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["approvals.write", "approvals.approve"])], async (context) => {
      const service = new OperationsEngineService(context);
      const approval = service.updateApprovalStatus(request.params.id, "rejected");
      if (!approval) return reply.status(404).send({ message: "Approval not found" });
      recordAuditEvent(context, {
        entityType: "approval",
        entityId: approval.id,
        eventType: "approval.rejected",
        title: "Onay kaydi reddedildi",
        description: `${approval.approvalNo} reddedildi.`
      });
      return { item: approval };
    });
  });
  server.post<{ Params: { id: string } }>("/approvals/:id/execute", async (request, reply) => {
    return withGuards(request, reply, [assertAuthenticated, (context) => assertAnyPermission(context, ["approvals.write", "approvals.execute", "ai.actions.write"])], async (context) => {
      const service = new OperationsEngineService(context);
      const currentApproval = service.getApproval(request.params.id);
      if (!currentApproval) return reply.status(404).send({ message: "Approval not found" });
      if (currentApproval.status !== "approved") {
        return reply.status(409).send({
          message: "Approval execute etmek icin kaydin onayli olmasi gerekir.",
          code: "approval_not_approved"
        });
      }

      const operationType = resolveExecutionAction(currentApproval);
      if (!operationType) {
        return reply.status(422).send({
          message: "Bu approval icin aktif execution aksiyonu tanimli degil.",
          code: "execution_action_not_active"
        });
      }

      const execution = runApprovalExecution(
        createApprovalExecution({
          tenantId: currentApproval.tenantId,
          approvalId: currentApproval.id,
          proposalId: typeof currentApproval.payload.proposalId === "string" ? currentApproval.payload.proposalId : undefined,
          targetType: currentApproval.entityType,
          targetId: currentApproval.entityId,
          operationType,
          status: "authorized",
          requestedBy: currentApproval.requestedBy,
          authorizedBy: context.userId,
          authorizedAt: new Date().toISOString()
        }).id
      );
      if (!execution) {
        return reply.status(500).send({ message: "Execution kaydi olusturulamadi." });
      }

      const approval = execution.status === "executed" ? service.updateApprovalStatus(request.params.id, "executed") : currentApproval;
      if (!approval) return reply.status(404).send({ message: "Approval not found" });
      approval.execution = {
        executable: execution.status !== "cancelled",
        executedAt: execution.executedAt ?? execution.result?.completedAt,
        result: execution.result?.message ?? execution.status
      };
      recordAuditEvent(context, {
        entityType: "approval",
        entityId: approval.id,
        eventType: execution.status === "executed" ? "approval.executed" : "approval.execution_failed",
        title: execution.status === "executed" ? "Onay kaydi execute edildi" : "Onay kaydi execution basarisiz",
        description:
          execution.status === "executed"
            ? `${approval.approvalNo} onayi domain dispatch ile calistirildi.`
            : execution.result?.message ?? `${approval.approvalNo} execution basarisiz oldu.`
      });
      return { item: approval, execution };
    });
  });

  server.get("/dashboard/cards", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.tasks), async (context) => {
    const service = new OperationsEngineService(context);
    const items = service.listDashboardCards();
    return { items, total: items.length };
  }));
  server.get<{ Params: { cardType: string } }>("/dashboard/cards/:cardType/tasks", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.tasks), async (context) => {
    const service = new OperationsEngineService(context);
    return { items: service.listDashboardCardTasks(request.params.cardType) };
  }));
  server.get("/dashboard/summary", async (request, reply) => withGuards(request, reply, requireReadAccess(readPermissions.tasks), async (context) => {
    const service = new OperationsEngineService(context);
    return { item: service.getDashboardSummary() };
  }));

  server.get<{ Querystring: { entityType?: string; entityId?: string } }>("/audit-events", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.workflow), async (context) => ({
      items: listAuditEvents(context.tenantId, request.query.entityType, request.query.entityId)
    }))
  );

  server.get<{ Params: { entityType: string; entityId: string } }>("/entity-timelines/:entityType/:entityId", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.workflow), async (context) => ({
      items: listAuditEvents(context.tenantId, request.params.entityType, request.params.entityId)
    }))
  );
}
