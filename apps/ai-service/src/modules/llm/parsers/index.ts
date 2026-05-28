import { classifyAiRequest, extractAiOperations } from "@hallederiz/domain";
import type { GeneratedProposalPayload, GenerateProposalInput } from "../../contracts";

function safeJsonParse(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function parseProposalPayload(raw: string, input: GenerateProposalInput): GeneratedProposalPayload {
  const parsed = safeJsonParse(raw);
  if (!parsed) {
    const fallback = classifyAiRequest(input.prompt);
    return {
      summary: `${fallback.reason} ${input.prompt}`,
      intent: fallback.actionType,
      riskNotes: fallback.mutation ? ["Mutation islemi insan onayi gerektirir."] : [],
      requiredApprovals: fallback.mutation ? ["Yonetici"] : [],
      operations: extractAiOperations({
        actionType: fallback.actionType,
        targetType: input.targetType,
        targetId: input.targetId,
        targetNo: input.targetNo,
        summary: input.prompt
      }),
      confidence: 0.55,
      channelType: input.runtime.channelType,
      inputMode: input.runtime.inputMode
    };
  }

  const fallback = classifyAiRequest(input.prompt);
  const intent = (parsed.intent as GeneratedProposalPayload["intent"]) ?? fallback.actionType;
  const operationsRaw = Array.isArray(parsed.operations) ? parsed.operations : [];
  const normalizedOps =
    operationsRaw.length > 0
      ? operationsRaw.map((operation, index) => {
          const op = operation as Record<string, unknown>;
          return {
            id: `ai_op_${Date.now()}_${index}`,
            type: (op.type as GeneratedProposalPayload["intent"]) ?? intent,
            targetType: (op.targetType as "customer") ?? input.targetType ?? "customer",
            targetId: String(op.targetId ?? input.targetId ?? "general"),
            targetNo: String(op.targetNo ?? input.targetNo ?? "GENEL"),
            summary: String(op.summary ?? input.prompt),
            mutation: Boolean(op.mutation ?? fallback.mutation),
            payload: (op.payload as Record<string, unknown>) ?? { source: "llm" }
          };
        })
      : extractAiOperations({
          actionType: intent,
          targetType: input.targetType,
          targetId: input.targetId,
          targetNo: input.targetNo,
          summary: input.prompt
        });

  return {
    summary: String(parsed.summary ?? `${fallback.reason} ${input.prompt}`),
    intent,
    riskNotes: Array.isArray(parsed.riskNotes) ? parsed.riskNotes.map((item) => String(item)) : [],
    requiredApprovals: Array.isArray(parsed.requiredApprovals)
      ? parsed.requiredApprovals.map((item) => String(item))
      : fallback.mutation
        ? ["Yonetici"]
        : [],
    operations: normalizedOps,
    confidence: Number(parsed.confidence ?? 0.7),
    channelType: input.runtime.channelType,
    inputMode: input.runtime.inputMode
  };
}

