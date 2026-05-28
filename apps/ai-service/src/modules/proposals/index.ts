import { validateAiMutationGuard } from "@hallederiz/domain";
import type { Approval, AiProposal } from "@hallederiz/types";
import type { AiRuntimeContext } from "../contracts";
import { createApprovalFromProposal, LlmRuntime } from "../llm";

export interface ProposalFlowInput {
  prompt: string;
  contextSummary?: string;
  runtime: AiRuntimeContext;
  targetType?: AiProposal["targetType"];
  targetId?: string;
  targetNo?: string;
}

export interface ProposalFlowResult {
  proposal: AiProposal;
  approvalDraft?: Omit<Approval, "id" | "approvalNo">;
  guard: { allowed: boolean; reason: string };
}

export class ProposalEngine {
  constructor(private readonly llmRuntime = new LlmRuntime()) {}

  async generateProposal(input: ProposalFlowInput): Promise<ProposalFlowResult> {
    const generated = await this.llmRuntime.generateProposal({
      prompt: input.prompt,
      contextSummary: input.contextSummary,
      runtime: input.runtime,
      targetType: input.targetType,
      targetId: input.targetId,
      targetNo: input.targetNo
    });
    const proposal = generated.proposal;
    const approvalDraft = generated.requiresApproval ? createApprovalFromProposal(proposal) : undefined;
    const guard = validateAiMutationGuard(proposal.operations, generated.requiresApproval ? { status: "pending" } : null);
    return {
      proposal,
      approvalDraft,
      guard
    };
  }
}

