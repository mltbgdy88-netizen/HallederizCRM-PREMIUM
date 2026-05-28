import type { AiChannelType, AiInputMode, AiInsight, AiOperation, AiProposal, AiProposalActionType, Approval, UserId, WorkflowEntityType } from "@hallederiz/types";

const mutationActions: AiProposalActionType[] = ["create_offer", "create_order", "create_payment", "mark_warehouse_ready", "complete_delivery", "create_invoice", "create_return", "send_document_whatsapp"];

export function classifyAiRequest(text: string): { actionType: AiProposalActionType; mutation: boolean; reason: string } {
  const normalized = text.toLocaleLowerCase("tr-TR");
  const actionType: AiProposalActionType = normalized.includes("teklif") && normalized.includes("olustur") ? "create_offer" : normalized.includes("siparis") && normalized.includes("olustur") ? "create_order" : normalized.includes("tahsilat") ? "create_payment" : normalized.includes("depo") && normalized.includes("hazir") ? "mark_warehouse_ready" : normalized.includes("teslim") && normalized.includes("tamam") ? "complete_delivery" : normalized.includes("fatura") ? "create_invoice" : normalized.includes("iade") ? "create_return" : normalized.includes("whatsapp") || normalized.includes("gonder") ? "send_document_whatsapp" : "read_summary";
  return { actionType, mutation: mutationActions.includes(actionType), reason: mutationActions.includes(actionType) ? "Mutation istegi approval gerektirir." : "Read-only bilgi istegi." };
}

export function extractAiOperations(input: { actionType: AiProposalActionType; targetType?: WorkflowEntityType; targetId?: string; targetNo?: string; summary?: string }): AiOperation[] {
  return [{ id: `ai_op_${input.actionType}_${input.targetId ?? "general"}`, type: input.actionType, targetType: input.targetType ?? "customer", targetId: input.targetId ?? "general", targetNo: input.targetNo ?? "GENEL", mutation: mutationActions.includes(input.actionType), summary: input.summary ?? "AI operasyon taslagi", payload: { source: "ai-proposal", actionType: input.actionType } }];
}

export function validateAiMutationGuard(operations: AiOperation[], approval?: Pick<Approval, "status"> | null): { allowed: boolean; reason: string } {
  const hasMutation = operations.some((operation) => operation.mutation);
  if (!hasMutation) return { allowed: true, reason: "Read-only operasyon icin approval gerekmez." };
  if (approval?.status === "approved" || approval?.status === "executed") return { allowed: true, reason: "Mutation onaylanmis approval ile korunuyor." };
  return { allowed: false, reason: "AI mutation approval olmadan execute edilemez." };
}

export function buildAiProposal(input: { tenantId: string; sessionId: string; requestText: string; requestedBy: UserId; requestedByName: string; channel?: AiChannelType; inputMode?: AiInputMode; targetType?: WorkflowEntityType; targetId?: string; targetNo?: string }): AiProposal {
  const classification = classifyAiRequest(input.requestText);
  const operations = extractAiOperations({ actionType: classification.actionType, targetType: input.targetType, targetId: input.targetId, targetNo: input.targetNo, summary: input.requestText });
  const now = new Date().toISOString();
  return { id: `ai_proposal_${Date.now()}`, tenantId: input.tenantId, proposalNo: `AI-${Date.now().toString().slice(-5)}`, sessionId: input.sessionId, status: classification.mutation ? "waiting_approval" : "draft", actionType: classification.actionType, channel: input.channel ?? "crm_ui", inputMode: input.inputMode ?? "text", title: classification.mutation ? "AI aksiyon onerisi" : "AI bilgi cevabi", summary: `${classification.reason} ${input.requestText}`, requestedBy: input.requestedBy, requestedByName: input.requestedByName, targetType: input.targetType ?? "customer", targetId: input.targetId ?? "general", targetNo: input.targetNo ?? "GENEL", requiresApproval: classification.mutation, createdAt: now, updatedAt: now, operations };
}

export function summarizeAiProposal(proposal: AiProposal): string {
  return `${proposal.proposalNo} / ${proposal.actionType}: ${proposal.summary} (${proposal.operations.length} operation)`;
}

export function buildApprovalFromAiProposal(proposal: AiProposal): Omit<Approval, "id" | "approvalNo"> {
  return { tenantId: proposal.tenantId, type: "ai_action_proposal", status: "pending", entityType: "ai_proposal", entityId: proposal.id, entityNo: proposal.proposalNo, requestedBy: proposal.requestedBy, requestedByName: proposal.requestedByName, requestedRole: "Yonetici", createdAt: new Date().toISOString(), riskNote: "AI mutation insan onayi gerektirir.", payloadSummary: summarizeAiProposal(proposal), payload: { proposalId: proposal.id, operations: proposal.operations }, policySnapshot: { policyId: "policy_ai_mutation", requiredRole: "Yonetici", minApproverCount: 1, reason: "AI mutation approval", serverActionKey: proposal.actionType }, execution: { executable: true } };
}

export function buildAiInsightCard(insight: AiInsight) {
  return { id: `card_${insight.id}`, title: insight.title, value: Math.round(insight.confidence * 100), detail: insight.summary, severity: insight.severity, source: "ai" as const, targetHref: insight.targetType === "customer" ? `/cariler/${insight.targetId}` : insight.targetType === "product" ? "/stok" : "/ai/icgoruler" };
}
