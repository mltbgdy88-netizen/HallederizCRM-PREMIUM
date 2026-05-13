export type ChannelKind = "whatsapp" | "instagram" | "facebook" | "web_chat" | "email" | "sms" | "internal_note";
export type ConversationStatus = "open" | "pending" | "waiting_customer" | "waiting_agent" | "resolved" | "archived";
export type MessageDirection = "inbound" | "outbound" | "internal";
export type MessageAuthorType = "customer" | "agent" | "ai" | "system";

export interface ChannelConversation {
  id: string;
  tenantId: string;
  channel: ChannelKind;
  externalConversationId: string;
  customerId?: string;
  contactHandle?: string;
  contactDisplayName?: string;
  status: ConversationStatus;
  assignedUserId?: string;
  tags: string[];
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export interface ChannelMessage {
  id: string;
  tenantId: string;
  conversationId: string;
  channel: ChannelKind;
  externalMessageId?: string;
  direction: MessageDirection;
  authorType: MessageAuthorType;
  authorId?: string;
  text: string;
  attachments: Array<Record<string, unknown>>;
  status: "pending" | "sent" | "received" | "failed";
  policyDecision?: "allow" | "deny" | "require_approval" | "dry_run_only";
  approvalRequestId?: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface ChannelProviderCapabilities {
  supportsInbound: boolean;
  supportsOutbound: boolean;
  supportsTemplates: boolean;
  supportsAttachments: boolean;
  supportsReadReceipts: boolean;
  requires24hWindow?: boolean;
  requiresUserOptIn?: boolean;
  requiresSignature?: boolean;
}

export interface ChannelSendRequest {
  tenantId: string;
  conversationId: string;
  channel: ChannelKind;
  text: string;
  attachments?: Array<Record<string, unknown>>;
  actorId: string;
  source: "web" | "api" | "worker" | "ai";
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

export interface ChannelSendResult {
  ok: boolean;
  status: "sent" | "queued" | "dry_run" | "failed" | "degraded";
  channel: ChannelKind;
  conversationId: string;
  externalMessageId?: string;
  providerMode: "live" | "mock" | "degraded";
  reasons: string[];
  metadata?: Record<string, unknown>;
}
