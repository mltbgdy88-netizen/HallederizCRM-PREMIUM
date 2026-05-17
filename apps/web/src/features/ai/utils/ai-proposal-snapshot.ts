import type { AiProposal } from "@hallederiz/types";

/** Onay / audit icin salt okunur JSON ozet (UI; sunucudaki immutable snapshot yerine client-side gorunum). */
export function buildAiProposalSnapshotJson(proposal: AiProposal): string {
  const body = {
    proposalId: proposal.id,
    proposalNo: proposal.proposalNo,
    status: proposal.status,
    actionType: proposal.actionType,
    requiresApproval: proposal.requiresApproval,
    approvalId: proposal.approvalId ?? null,
    channel: proposal.channel,
    inputMode: proposal.inputMode,
    target: { type: proposal.targetType, id: proposal.targetId, no: proposal.targetNo },
    createdAt: proposal.createdAt,
    updatedAt: proposal.updatedAt,
    operations: proposal.operations.map((op) => ({
      id: op.id,
      type: op.type,
      mutation: op.mutation,
      summary: op.summary,
      payload: op.payload
    }))
  };
  return JSON.stringify(body, null, 2);
}
