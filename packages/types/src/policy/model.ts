export type PolicyActorType = "user" | "ai" | "system" | "channel";

export type PolicyChannel =
  | "crm_ui"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "webchat"
  | "web_chat"
  | "internal_note"
  | "email"
  | "sms"
  | "api"
  | "worker";

export type PolicyDecisionType =
  | "allow"
  | "deny"
  | "require_approval"
  | "require_handoff"
  | "require_more_info"
  | "draft_only";

export type PolicyRiskLevel = "low" | "medium" | "high" | "critical";

export type ProviderHealthState = "healthy" | "degraded" | "unavailable";

export interface PolicyCheckRequest {
  tenant: {
    id: string;
    status?: "active" | "suspended" | "archived";
    modules?: string[];
    features?: string[];
    planCode?: string;
  };
  actor: {
    type: PolicyActorType;
    id: string;
    roles: string[];
    permissions: string[];
  };
  actionKey: string;
  channel?: PolicyChannel;
  environment: "production" | "staging" | "development";
  resource?: {
    type?: string;
    id?: string;
    amount?: number;
    currency?: string;
  };
  providerHealth?: Record<string, ProviderHealthState>;
  approval?: {
    isApproved?: boolean;
    approvalId?: string;
  };
}

export interface PolicyDecision {
  decision: PolicyDecisionType;
  actionKey: string;
  reasons: string[];
  requiredPermissions?: string[];
  requiredFeature?: string;
  requiredModule?: string;
  approvalPolicyKey?: string;
  riskLevel?: PolicyRiskLevel;
  auditRequired: boolean;
  timelineRequired: boolean;
  idempotencyRequired: boolean;
}

export interface ActionRegistryEntry {
  actionKey: string;
  description: string;
  requiredPermissions: string[];
  requiredFeature?: string;
  requiredModule?: string;
  isMutation: boolean;
  isCritical: boolean;
  approvalRequired: boolean;
  approvalPolicyKey?: string;
  allowedActors: PolicyActorType[];
  allowedChannels?: PolicyChannel[];
  aiMode?: "blocked" | "read_only" | "draft" | "propose" | "request_approval";
  externalProviders?: string[];
  auditRequired: boolean;
  timelineRequired: boolean;
  idempotencyRequired: boolean;
}

export interface FeatureRegistryEntry {
  featureKey: string;
  package: "core" | "premium" | "enterprise";
  moduleKey: string;
  enabledByDefault: boolean;
}
