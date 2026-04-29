import type { TenantId } from "./identifiers";

export type WhatsAppWorkflowTicketType = "order_decision" | "payment_receipt" | "return_review" | "defect_review" | "payment_exception";

export type WhatsAppWorkflowTicketStatus = "pending" | "applied" | "rejected" | "expired";

export type WhatsAppWorkflowPendingTicket = {
  id: string;
  tenantId: TenantId;
  type: WhatsAppWorkflowTicketType;
  referenceCode: string;
  tokenHash: string;
  allowedCommands: string[];
  customerPhone: string;
  customerName: string;
  status: WhatsAppWorkflowTicketStatus;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  usedByPhone?: string;
  resolvedCommand?: string;
  payload?: Record<string, unknown>;
};

export type WhatsAppWorkflowProcessedMessage = {
  id: string;
  from: string;
  contentHash: string;
  at: string;
};

export type WhatsAppWorkflowProcessingMessage = WhatsAppWorkflowProcessedMessage & {
  startedAt: string;
};

export type WhatsAppWorkflowDuplicateReason = "same_message_processed" | "same_message_processing" | "same_content_processed" | "same_content_processing";

export type WhatsAppWorkflowCommandAudit = {
  id: string;
  referenceCode: string;
  command: string;
  fromPhone: string;
  at: string;
  result: "accepted" | "rejected" | "duplicate";
  reason?: string;
};

export type WhatsAppWorkflowMediaMessage = {
  id: string;
  from: string;
  mediaHash?: string;
  mimeType?: string;
  fileName?: string;
  at: string;
};

export type TenantWhatsAppWorkflowStore = {
  processedMessages: WhatsAppWorkflowProcessedMessage[];
  processingMessages: WhatsAppWorkflowProcessingMessage[];
  tickets: WhatsAppWorkflowPendingTicket[];
  commandAudit: WhatsAppWorkflowCommandAudit[];
  mediaMessages?: WhatsAppWorkflowMediaMessage[];
};

export type WhatsAppWorkflowApproverContext = {
  phone?: string;
  roles?: string[];
  approverPhones?: string[];
  requiredRoles?: string[];
};

export type WhatsAppWorkflowCommandValidationResult =
  | { ok: true }
  | {
      ok: false;
      reason: "ticket_expired" | "command_not_allowed" | "token_invalid" | "approver_not_allowed" | "ticket_already_resolved";
    };
