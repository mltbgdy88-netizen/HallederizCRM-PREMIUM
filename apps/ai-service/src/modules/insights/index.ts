import type { AiInsight } from "@hallederiz/types";
import type { AiRuntimeContext } from "../contracts";
import { LlmRuntime } from "../llm";

export class InsightEngine {
  constructor(private readonly llmRuntime = new LlmRuntime()) {}

  async generateInsightSet(input: { runtime: AiRuntimeContext; contextSummary?: string }): Promise<AiInsight[]> {
    const insights = await this.llmRuntime.generateInsights({
      runtime: input.runtime,
      contextSummary: input.contextSummary
    });
    return insights;
  }
}

