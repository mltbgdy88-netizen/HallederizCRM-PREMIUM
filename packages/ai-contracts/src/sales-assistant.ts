export type SalesAiIntent =
  | "greeting"
  | "product_question"
  | "price_question"
  | "stock_question"
  | "order_intent"
  | "quote_request"
  | "return_request"
  | "delivery_question"
  | "payment_question"
  | "support_request"
  | "unknown";

export interface SalesAiAssistantProfile {
  tenantId: string;
  name: string;
  language: "tr";
  maxResponseSentences: 2 | 3 | 4;
  modelProvider: "ollama";
  model: string;
  fallbackModel: string;
}

export interface SalesAiGroundingSource {
  type: "product" | "faq" | "sales_note" | "document";
  id: string;
  title: string;
  confidence: number;
}

export interface SalesAiConversation {
  id: string;
  tenantId: string;
  channel: "web" | "whatsapp" | "omnichannel" | "api";
  customerId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesAiMessage {
  id: string;
  tenantId: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  text: string;
  createdAt: string;
}

export interface SalesAiTrainingScope {
  id: string;
  tenantId: string;
  productId?: string;
  productName: string;
  category?: string;
  description?: string;
  salesNotes?: string;
  allowedClaims: string[];
  blockedClaims: string[];
  priceVisibility: "visible" | "hidden";
  stockVisibility: "visible" | "hidden";
  faqSnippets: string[];
  selectedDocuments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesAiSuggestedAction {
  actionKey: string;
  label: string;
  requiresApproval: boolean;
  suggestedOnly: true;
}

export interface SalesAiGuardrailDecision {
  tenantIdRequired: true;
  contextRequired: true;
  dataSourcesAllowed: string[];
  criticalMutationBlocked: true;
  hallucinationRisk: "low" | "medium" | "high";
  status: "allow_response" | "degraded" | "blocked_not_configured";
  reasons: string[];
}

export interface SalesAiResponse {
  ok: boolean;
  status: "live" | "degraded" | "not_configured" | "blocked";
  intent: SalesAiIntent;
  confidence: number;
  reply: string;
  usedSources: SalesAiGroundingSource[];
  suggestedActions: SalesAiSuggestedAction[];
  guardrail: SalesAiGuardrailDecision;
  provider: {
    provider: "ollama";
    model: string;
    fallbackModel: string;
    effectiveModel?: string;
    fallbackUsed: boolean;
  };
  mutationExecuted: false;
  externalProviderCallExecuted: false;
}
