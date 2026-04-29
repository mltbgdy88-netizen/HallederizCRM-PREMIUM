import { buildAiProposal, buildApprovalFromAiProposal } from "@hallederiz/domain";
import type { AiInsight, AiProposal, Approval } from "@hallederiz/types";
import type {
  GenerateInsightsInput,
  GenerateProposalInput,
  GenerateReplyInput,
  GenerateReplyResult,
  LlmProvider,
  ProposalGenerationResult,
  SummarizeContextInput,
  SummarizeContextResult
} from "../contracts";
import { mockLlmProvider } from "./providers/mock-provider";
import { OpenAiLlmProvider } from "./providers/openai-provider";

function createProvider(): LlmProvider {
  const provider = process.env.AI_LLM_PROVIDER ?? "mock";
  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAiLlmProvider(process.env.OPENAI_API_KEY, process.env.OPENAI_LLM_MODEL ?? "gpt-4.1-mini");
  }
  return mockLlmProvider;
}

export class LlmRuntime {
  constructor(private readonly provider: LlmProvider = createProvider()) {}

  async generateReply(input: GenerateReplyInput): Promise<GenerateReplyResult> {
    return this.provider.generateReply(input);
  }

  async generateProposal(input: GenerateProposalInput): Promise<ProposalGenerationResult> {
    const payload = await this.provider.generateProposal(input);
    const proposal = buildAiProposal({
      tenantId: input.runtime.tenantId,
      sessionId: `ai_session_${input.runtime.userId}`,
      requestText: input.prompt,
      requestedBy: input.runtime.userId,
      requestedByName: input.runtime.userName,
      channel: input.runtime.channelType,
      inputMode: input.runtime.inputMode,
      targetType: input.targetType,
      targetId: input.targetId,
      targetNo: input.targetNo
    });
    proposal.summary = payload.summary;
    proposal.actionType = payload.intent;
    proposal.operations = payload.operations;
    proposal.requiresApproval = payload.requiredApprovals.length > 0 || payload.operations.some((item) => item.mutation);
    proposal.status = proposal.requiresApproval ? "waiting_approval" : "draft";

    return {
      proposal,
      payload,
      requiresApproval: proposal.requiresApproval
    };
  }

  async generateInsights(input: GenerateInsightsInput): Promise<AiInsight[]> {
    return this.provider.generateInsights(input);
  }

  async summarizeContext(input: SummarizeContextInput): Promise<SummarizeContextResult> {
    return this.provider.summarizeContext(input);
  }
}

export function createApprovalFromProposal(proposal: AiProposal): Omit<Approval, "id" | "approvalNo"> {
  return buildApprovalFromAiProposal(proposal);
}

