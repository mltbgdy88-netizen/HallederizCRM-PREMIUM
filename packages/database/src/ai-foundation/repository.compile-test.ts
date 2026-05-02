import type { QueryExecutor } from "../types";
import {
  buildInsertAiProposal,
  buildInsertAiProposalOperation,
  buildInsertApprovalTicket,
  buildInsertAuditEvent,
  buildInsertOutboxEvent,
  createAiFoundationRepository,
} from "./repository";

const auditStatement = buildInsertAuditEvent({
  tenantId: "tenant_demo",
  action: "ai.plan.validated",
  entityType: "ai_proposal",
  entityId: "proposal_1",
  summary: "AI plan validated",
});

auditStatement.sql satisfies string;
auditStatement.params satisfies unknown[];

buildInsertAiProposal({
  tenantId: "tenant_demo",
  proposalNo: "AIP-1",
  schemaVersion: "1.0",
  reply: "Plan hazir.",
  confidence: 0.9,
  riskLevel: "medium",
  requiresApproval: true,
});

buildInsertAiProposalOperation({
  tenantId: "tenant_demo",
  proposalId: "00000000-0000-0000-0000-000000000001",
  operationType: "quick_sale",
  riskClass: "L2_BUSINESS_MUTATION",
  idempotencyKey: "ai-msg-1-quick-sale",
  summary: "Hizli satis taslagi",
  requiresApproval: true,
  confidence: 0.82,
  payload: { qty: 3 },
});

buildInsertApprovalTicket({
  tenantId: "tenant_demo",
  ticketNo: "APV-1",
  sourceType: "ai_proposal",
  sourceId: "00000000-0000-0000-0000-000000000001",
  operationType: "quick_sale",
  requiredRole: "sales_manager",
  payloadSummary: "Hizli satis onayi",
});

buildInsertOutboxEvent({
  tenantId: "tenant_demo",
  eventType: "whatsapp.message.send",
  aggregateType: "approval_execution",
  aggregateId: "exec_1",
  idempotencyKey: "outbox-exec-1-send-message",
});

const executor: QueryExecutor = {
  async query() {
    return [];
  },
  async transaction(operation) {
    return operation(this);
  },
};

createAiFoundationRepository(executor);
