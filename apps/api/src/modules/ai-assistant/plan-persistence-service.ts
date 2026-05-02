import { createHash } from "node:crypto";
import { createAiFoundationRepository } from "@hallederiz/database";
import type { AiOperationPlan } from "@hallederiz/ai-contracts";
import { buildPersistenceUnavailableError } from "../../shared/persistence-policy";
import { buildRepositoryRuntime } from "../../shared/db-runtime";
import type { RequestContext } from "../../shared/request-context";

export interface PersistValidatedAiPlanInput {
  context: RequestContext;
  plan: AiOperationPlan;
  source: "crm_ui" | "whatsapp" | "voice" | "system";
  prompt?: string;
}

export interface PersistValidatedAiPlanResult {
  proposalId: string;
  proposalNo: string;
  approvalTicketIds: string[];
  approvalRequiredOperationCount: number;
}

function hashText(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function makeStableSuffix(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

function makeProposalNo(): string {
  return `AIP-${makeStableSuffix()}`;
}

function makeTicketNo(index: number): string {
  return `APV-${makeStableSuffix()}-${index + 1}`;
}

function requiredRoleForOperation(operationType: string): string {
  switch (operationType) {
    case "create_tahsilat":
    case "create_invoice":
      return "accounting_manager";
    case "complete_delivery":
      return "warehouse_manager";
    case "update_factory_status":
    case "update_supply_status":
      return "operations_manager";
    case "send_whatsapp_message":
    case "send_document":
      return "operator_manager";
    default:
      return "sales_manager";
  }
}

export async function persistValidatedAiPlan(input: PersistValidatedAiPlanInput): Promise<PersistValidatedAiPlanResult> {
  const runtime = buildRepositoryRuntime(input.context);

  if (!runtime.dbEnabled) {
    throw buildPersistenceUnavailableError(new Error("AI plan persistence requires postgres mode."), {
      persistenceMode: input.context.persistenceMode,
      hasPostgresUrl: Boolean(process.env.POSTGRES_URL ?? process.env.DATABASE_URL)
    });
  }

  return runtime.executor.transaction(async (executor) => {
    const repository = createAiFoundationRepository(executor);
    const proposalNo = makeProposalNo();
    const approvalRequiredOperations = input.plan.operations.filter((operation) => operation.requiresApproval);

    const proposalId = await repository.createAiProposal({
      tenantId: input.context.tenantId,
      proposalNo,
      source: input.source,
      status: input.plan.requiresApproval ? "waiting_approval" : "draft",
      schemaVersion: input.plan.schemaVersion,
      language: input.plan.language,
      reply: input.plan.reply,
      confidence: input.plan.confidence,
      riskLevel: input.plan.riskLevel,
      requiresApproval: input.plan.requiresApproval,
      needsClarification: input.plan.needsClarification,
      clarificationQuestion: input.plan.clarificationQuestion ?? undefined,
      requestedBy: input.context.userId
    });

    if (!proposalId) {
      throw new Error("AI proposal could not be persisted.");
    }

    await repository.createAiProposalValidation({
      tenantId: input.context.tenantId,
      proposalId,
      status: "valid",
      validator: "AiOperationPlanSchema",
      issues: []
    });

    await repository.createAiPromptAudit({
      tenantId: input.context.tenantId,
      proposalId,
      promptHash: hashText(input.prompt ?? ""),
      snapshotHash: hashText(JSON.stringify({
        operationTypes: input.plan.operations.map((operation) => operation.type),
        source: input.source,
        requiresApproval: input.plan.requiresApproval
      })),
      modelProvider: "local-ai-service",
      piiMinimized: true
    });

    for (const [index, operation] of input.plan.operations.entries()) {
      await repository.createAiProposalOperation({
        tenantId: input.context.tenantId,
        proposalId,
        operationType: operation.type,
        riskClass: operation.riskClass,
        idempotencyKey: operation.idempotencyKey,
        summary: operation.summary,
        requiresApproval: operation.requiresApproval,
        confidence: operation.confidence,
        target: operation.target,
        payload: operation.payload,
        reasons: operation.reasons,
        sortOrder: index
      });
    }

    const approvalTicketIds: string[] = [];
    for (const [index, operation] of approvalRequiredOperations.entries()) {
      const ticketId = await repository.createApprovalTicket({
        tenantId: input.context.tenantId,
        ticketNo: makeTicketNo(index),
        sourceType: "ai_proposal",
        sourceId: proposalId,
        operationType: operation.type,
        requiredRole: requiredRoleForOperation(operation.type),
        requestedBy: input.context.userId,
        riskLevel: input.plan.riskLevel,
        payloadSummary: operation.summary,
        payload: {
          proposalId,
          proposalNo,
          operation
        }
      });

      if (ticketId) {
        approvalTicketIds.push(ticketId);
      }
    }

    if (approvalTicketIds[0]) {
      await executor.query(
        "UPDATE ai_proposals SET approval_ticket_id = $1::uuid, updated_at = now() WHERE id = $2::uuid AND tenant_id = $3",
        [approvalTicketIds[0], proposalId, input.context.tenantId]
      );
    }

    await repository.recordAuditEvent({
      tenantId: input.context.tenantId,
      actorUserId: input.context.userId,
      action: "ai.plan.persisted",
      entityType: "ai_proposal",
      entityId: proposalId,
      source: input.source,
      summary: `${input.plan.operations.length} operasyon iceren AI plan kalici hale getirildi.`,
      payloadRedacted: {
        proposalNo,
        operationCount: input.plan.operations.length,
        requiresApproval: input.plan.requiresApproval,
        approvalTicketCount: approvalTicketIds.length
      }
    });

    return {
      proposalId,
      proposalNo,
      approvalTicketIds,
      approvalRequiredOperationCount: approvalRequiredOperations.length
    };
  });
}
