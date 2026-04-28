import type { LlmOrchestrator } from "../contracts";
export const mockLlmOrchestrator: LlmOrchestrator = { async generateReply(input) { return `Read-only cevap: ${input.prompt}`; }, async generateProposal(input) { return `Proposal taslagi: ${input.prompt}`; } };
export async function generateReply(prompt: string, context?: string) { return mockLlmOrchestrator.generateReply({ prompt, context }); }
