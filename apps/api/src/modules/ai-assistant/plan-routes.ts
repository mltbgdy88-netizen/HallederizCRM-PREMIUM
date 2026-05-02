import type { FastifyInstance } from "fastify";
import { safeParseAiOperationPlan, isForbiddenOperationType } from "@hallederiz/ai-contracts";
import { assertAuthenticated, withGuards } from "../../shared/auth-guards";
import { recordAuditEvent } from "../../shared/audit-timeline";

interface AiAssistantPlanBody {
  plan?: unknown;
  prompt?: string;
  source?: "crm_ui" | "whatsapp" | "voice" | "system";
}

function extractOperationTypes(plan: unknown): string[] {
  if (!plan || typeof plan !== "object" || !("operations" in plan)) {
    return [];
  }

  const operations = (plan as { operations?: unknown }).operations;
  if (!Array.isArray(operations)) {
    return [];
  }

  return operations
    .map((operation) => {
      if (!operation || typeof operation !== "object" || !("type" in operation)) {
        return null;
      }
      return String((operation as { type?: unknown }).type ?? "");
    })
    .filter((operationType): operationType is string => operationType.length > 0);
}

export async function registerAiAssistantPlanRoutes(server: FastifyInstance) {
  server.post<{ Body: AiAssistantPlanBody }>("/api/ai/assistant/plan", async (request, reply) =>
    withGuards(request, reply, [assertAuthenticated], async (context) => {
      const plan = request.body?.plan;

      if (!plan) {
        return reply.status(400).send({
          ok: false,
          message: "plan alani zorunludur. Local AI output'u backend validation'a plan olarak gonderilmelidir."
        });
      }

      const operationTypes = extractOperationTypes(plan);
      const forbiddenOperationTypes = operationTypes.filter(isForbiddenOperationType);

      if (forbiddenOperationTypes.length > 0) {
        recordAuditEvent(context, {
          entityType: "ai_proposal",
          entityId: "rejected_plan",
          eventType: "ai.plan.rejected",
          title: "AI plan reddedildi",
          description: `Yasak operasyon tipleri tespit edildi: ${forbiddenOperationTypes.join(", ")}`,
          payload: {
            source: request.body?.source ?? "crm_ui",
            forbiddenOperationTypes
          }
        });

        return reply.status(422).send({
          ok: false,
          message: "AI plan yasak operasyon iceriyor.",
          forbiddenOperationTypes
        });
      }

      const validation = safeParseAiOperationPlan(plan);

      if (!validation.success) {
        recordAuditEvent(context, {
          entityType: "ai_proposal",
          entityId: "invalid_plan",
          eventType: "ai.plan.invalid",
          title: "AI plan dogrulamasi basarisiz",
          description: "AI operation plan schema validation basarisiz oldu.",
          payload: {
            source: request.body?.source ?? "crm_ui",
            issues: validation.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message
            }))
          }
        });

        return reply.status(422).send({
          ok: false,
          message: "AI operation plan schema validation basarisiz oldu.",
          issues: validation.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        });
      }

      const validatedPlan = validation.data;
      const approvalRequiredOperations = validatedPlan.operations.filter((operation) => operation.requiresApproval);

      recordAuditEvent(context, {
        entityType: "ai_proposal",
        entityId: "validated_plan",
        eventType: "ai.plan.validated",
        title: "AI plan dogrulandi",
        description: `${validatedPlan.operations.length} operasyon iceren AI plan dogrulandi.`,
        payload: {
          source: request.body?.source ?? "crm_ui",
          operationCount: validatedPlan.operations.length,
          requiresApproval: validatedPlan.requiresApproval,
          approvalRequiredOperationCount: approvalRequiredOperations.length
        }
      });

      return reply.status(validatedPlan.requiresApproval ? 202 : 200).send({
        ok: true,
        item: {
          plan: validatedPlan,
          proposalMode: true,
          directMutation: false,
          requiresApproval: validatedPlan.requiresApproval,
          approvalRequiredOperationCount: approvalRequiredOperations.length,
          nextStep: validatedPlan.requiresApproval ? "approval_ticket_required" : "read_only_or_draft_response"
        }
      });
    })
  );
}
