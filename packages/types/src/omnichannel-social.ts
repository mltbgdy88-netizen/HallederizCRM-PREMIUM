export type SocialMediaProvider = "facebook" | "instagram" | "whatsapp" | "web_chat" | "email" | "sms";

export type SocialMediaAccountStatus = "pending" | "connected" | "degraded" | "disconnected";

export interface SocialMediaAccount {
  id: string;
  tenantId: string;
  provider: SocialMediaProvider;
  externalAccountId: string;
  displayName?: string;
  handle?: string;
  status: SocialMediaAccountStatus;
  tokenRef?: string;
  scopes: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelCredentialRef {
  id: string;
  tenantId: string;
  accountId: string;
  provider: SocialMediaProvider;
  encryptedAccessToken?: string;
  encryptedRefreshToken?: string;
  expiresAt?: string;
  appId?: string;
  appSecretRef?: string;
  verifyTokenHash?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type WebhookProcessingStatus = "received" | "processing" | "processed" | "failed" | "duplicate";

export interface WebhookEventRecord {
  id: string;
  tenantId: string;
  provider: SocialMediaProvider | string;
  accountId?: string;
  externalEventId?: string;
  eventType: string;
  rawPayload: Record<string, unknown>;
  signatureValid: boolean;
  processingStatus: WebhookProcessingStatus;
  idempotencyKey: string;
  receivedAt: string;
  processedAt?: string;
  errorMessage?: string;
}

export interface ProviderMessageReceipt {
  id: string;
  tenantId: string;
  provider: SocialMediaProvider | string;
  accountId?: string;
  externalMessageId: string;
  conversationId: string;
  messageId?: string;
  status: string;
  rawPayload: Record<string, unknown>;
  receivedAt: string;
}

export interface SocialContact {
  id: string;
  tenantId: string;
  provider: SocialMediaProvider | string;
  externalUserId: string;
  displayName?: string;
  username?: string;
  profileUrl?: string;
  linkedCustomerId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type AiChatSessionStatus = "open" | "paused" | "closed";

export interface AiChatSession {
  id: string;
  tenantId: string;
  conversationId: string;
  customerId?: string;
  channel: SocialMediaProvider | string;
  status: AiChatSessionStatus;
  lastIntent?: string;
  aiModel?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type AiReplySuggestionStatus = "draft" | "waiting_approval" | "approved" | "rejected" | "sent" | "failed";

export interface AiReplySuggestion {
  id: string;
  tenantId: string;
  sessionId: string;
  conversationId: string;
  sourceMessageId?: string;
  draftText: string;
  confidence?: number;
  intent?: string;
  policyDecision: "allow" | "deny" | "require_approval" | "dry_run_only";
  approvalRequestId?: string;
  status: AiReplySuggestionStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type AiReplyJobType = "classify_intent" | "generate_reply" | "create_approval" | "send_reply";
export type AiReplyJobStatus = "pending" | "processing" | "completed" | "failed";

export interface AiReplyJob {
  id: string;
  tenantId: string;
  conversationId: string;
  messageId?: string;
  suggestionId?: string;
  jobType: AiReplyJobType;
  status: AiReplyJobStatus;
  attempts: number;
  lastError?: string;
  nextRunAt?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelTemplate {
  id: string;
  tenantId: string;
  provider: SocialMediaProvider;
  templateCode: string;
  language: string;
  body: string;
  status: "draft" | "active" | "archived";
  externalTemplateId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MetaWebhookMessage {
  mid?: string;
  text?: string;
  attachments?: Array<Record<string, unknown>>;
}

export interface MetaWebhookEntry {
  id?: string;
  time?: number;
  messaging?: Array<{
    sender?: { id?: string };
    recipient?: { id?: string };
    timestamp?: number;
    message?: MetaWebhookMessage;
  }>;
  changes?: Array<{
    field?: string;
    value?: Record<string, unknown>;
  }>;
}

export interface MetaWebhookPayload {
  object?: string;
  entry?: MetaWebhookEntry[];
}

export interface MetaOutboundPayload {
  recipientId: string;
  text: string;
  messagingType?: "RESPONSE" | "UPDATE" | "MESSAGE_TAG";
}

export interface OmnichannelProviderHealth {
  kind: string;
  ok: boolean;
  mode: "live" | "mock" | "degraded";
  label: string;
  reasons: string[];
}

export interface OmnichannelInboundNormalizedMessage {
  tenantId: string;
  provider: SocialMediaProvider | string;
  accountId?: string;
  externalAccountId: string;
  externalConversationId: string;
  externalMessageId: string;
  externalUserId: string;
  contactDisplayName?: string;
  contactUsername?: string;
  channel: SocialMediaProvider | string;
  text: string;
  attachments: Array<Record<string, unknown>>;
  timestamp: string;
  metadata: Record<string, unknown>;
}
