import type { AiChannelType, AiInsight, AiInputMode, AiOperation, AiProposal, AiProposalActionType, WorkflowEntityType } from "@hallederiz/types";

export interface AiRuntimeContext {
  tenantId: string;
  userId: string;
  userName: string;
  channelType: AiChannelType;
  inputMode: AiInputMode;
  mode: "analyst" | "operator";
  readOnlyDefault: boolean;
  approvalRequiredForMutation: boolean;
}

export interface GenerateReplyInput {
  prompt: string;
  contextSummary?: string;
  runtime: AiRuntimeContext;
}

export interface GenerateReplyResult {
  text: string;
  confidence: number;
  provider: string;
  model: string;
}

export interface GeneratedProposalPayload {
  summary: string;
  intent: AiProposalActionType;
  riskNotes: string[];
  requiredApprovals: string[];
  operations: AiOperation[];
  confidence: number;
  channelType: AiChannelType;
  inputMode: AiInputMode;
}

export interface GenerateProposalInput {
  prompt: string;
  contextSummary?: string;
  runtime: AiRuntimeContext;
  targetType?: WorkflowEntityType;
  targetId?: string;
  targetNo?: string;
}

export interface GenerateInsightsInput {
  contextSummary?: string;
  runtime: AiRuntimeContext;
}

export interface SummarizeContextInput {
  records: Array<{ key: string; value: string | number | boolean | null | undefined }>;
  runtime: AiRuntimeContext;
}

export interface SummarizeContextResult {
  summary: string;
  sourceCount: number;
}

export interface LlmProvider {
  readonly providerName: string;
  readonly modelName: string;
  generateReply(input: GenerateReplyInput): Promise<GenerateReplyResult>;
  generateProposal(input: GenerateProposalInput): Promise<GeneratedProposalPayload>;
  generateInsights(input: GenerateInsightsInput): Promise<AiInsight[]>;
  summarizeContext(input: SummarizeContextInput): Promise<SummarizeContextResult>;
}

export interface SttTranscriptionMetadata {
  mimeType?: string;
  language?: string;
  channelType?: AiChannelType;
}

export interface SttTranscriptionResult {
  transcript: string;
  detectedLanguage: string;
  confidence: number;
  provider: string;
}

export interface SttProvider {
  readonly providerName: string;
  transcribeAudio(audioBuffer: Uint8Array, metadata?: SttTranscriptionMetadata): Promise<SttTranscriptionResult>;
}

export interface TtsSpeakOptions {
  voice?: string;
  language?: string;
  speed?: number;
}

export interface TtsSpeakResult {
  audioRef: string;
  provider: string;
  mimeType: string;
}

export interface TtsProvider {
  readonly providerName: string;
  speakText(text: string, options?: TtsSpeakOptions): Promise<TtsSpeakResult>;
  listVoices(): Promise<Array<{ id: string; name: string; language: string }>>;
}

export interface ProposalGenerationResult {
  proposal: AiProposal;
  payload: GeneratedProposalPayload;
  requiresApproval: boolean;
}

