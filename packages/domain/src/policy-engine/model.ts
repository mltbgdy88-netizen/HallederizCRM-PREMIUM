export type PolicyAuthMode = "demo" | "local_pilot" | "session" | "service";
export type PolicyChannel = "web" | "api" | "worker" | "whatsapp" | "instagram" | "facebook" | "web_chat" | "email" | "sms" | "internal_note" | "local_agent" | "system";
export type PolicySource = "web" | "api" | "worker" | "whatsapp" | "ai" | "local_agent" | "system";
export type PolicyEnvironment = "production" | "staging" | "development" | "test";
export type PolicyPersistenceMode = "demo" | "postgres";
export type PolicyActionType = "read" | "write" | "execute" | "approve" | "reject" | "send_message" | "generate_document" | "ai_propose" | "ai_execute";
export type PolicyCriticality = "low" | "medium" | "high" | "critical";
export type PolicyDecisionEffect = "allow" | "deny" | "require_approval" | "dry_run_only";
export type PolicyUsageEventType = "ai_request" | "channel_message" | "document_generation" | "workflow_execution";
export interface PolicySubject { userId: string; tenantId: string; roles: string[]; permissions: string[]; authMode: PolicyAuthMode; channel: PolicyChannel; sessionRisk?: "low" | "medium" | "high"; }
export interface PolicyResource { resourceType: string; resourceId?: string; tenantId: string; ownerId?: string; metadata?: Record<string, unknown>; }
export interface PolicyAction { actionKey: string; actionType: PolicyActionType; criticality: PolicyCriticality; requiresApproval?: boolean; idempotencyRequired?: boolean; auditRequired?: boolean; }
export interface PolicyContext { requestId: string; tenantId: string; source: PolicySource; environment: PolicyEnvironment; persistenceMode: PolicyPersistenceMode; channel?: PolicyChannel; metadata?: Record<string, unknown>; }
export interface PolicyObligation { requireTenantMatch: boolean; requirePermission: boolean; requireApproval: boolean; requireIdempotencyKey: boolean; requireAuditTimeline: boolean; requireHumanReview: boolean; requireChannelWindow: boolean; requireUsageRecord: boolean; }
export interface PolicyDecision { effect: PolicyDecisionEffect; actionKey: string; reasons: string[]; obligations: PolicyObligation; approvalPolicy?: { required: boolean; policyKey?: string; humanReviewRequired: boolean }; auditPolicy?: { auditRequired: boolean; timelineRequired: boolean }; usagePolicy?: { usageRecordRequired: boolean; usageEventType?: PolicyUsageEventType }; riskScore?: number; }
export interface PolicyEvaluationInput { subject: PolicySubject; resource: PolicyResource; action: PolicyAction; context: PolicyContext; approval?: { approved?: boolean; approvalRequestId?: string }; idempotencyKey?: string; channelPolicy?: { signatureVerified?: boolean; approvalTokenVerified?: boolean; phoneVerified?: boolean; withinChannelWindow?: boolean; humanHandoffRequired?: boolean; autoReplyAllowed?: boolean }; auditMetadataPresent?: boolean; timelineMetadataPresent?: boolean; fallbackCertainty?: "known" | "uncertain"; }
export interface PolicyActionRegistryEntry extends PolicyAction { description: string; requiredPermissions: string[]; defaultEffect: PolicyDecisionEffect; approvalRequired: boolean; auditRequired: boolean; timelineRequired: boolean; idempotencyRequired: boolean; allowedSources: PolicySource[]; allowedChannels?: PolicyChannel[]; usageEventType?: PolicyUsageEventType; approvalPolicyKey?: string; channelPolicy?: { requireSignature?: boolean; requireApprovalToken?: boolean; requireVerifiedPhone?: boolean; requireChannelWindow?: boolean; humanHandoffAllowed?: boolean; autoReplyAllowed?: boolean }; }

