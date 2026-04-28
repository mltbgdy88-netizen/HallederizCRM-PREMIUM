export interface AiCommandParseResult { actionType: string; mutation: boolean; targetHint?: string; }
export interface LlmOrchestrator { generateReply(input: { prompt: string; context?: string }): Promise<string>; generateProposal(input: { prompt: string; context?: string }): Promise<string>; }
export interface SttAdapter { transcribeAudio(input: { bytes?: Uint8Array; mimeType?: string }): Promise<string>; }
export interface TtsAdapter { speakText(input: { text: string; voice?: string }): Promise<{ audioRef: string }>; }
export interface InsightEngine { generateInsightSet(): Promise<Array<{ title: string; severity: "info" | "warning" | "critical"; summary: string }>>; }
