export const WHATSAPP_WEB_LOCAL_FEATURE = "whatsapp_web_local" as const;

export type WhatsAppWebLocalConnectionState =
  | "disabled"
  | "starting"
  | "qr_ready"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "logged_out"
  | "expired"
  | "error";

export type WhatsAppWebLocalFeatureReasonCode =
  | "whatsapp_web_local_disabled_by_default"
  | "whatsapp_web_local_production_hard_deny"
  | "whatsapp_web_local_enabled_non_production";

export interface WhatsAppWebLocalFeatureDecision {
  feature: typeof WHATSAPP_WEB_LOCAL_FEATURE;
  enabled: boolean;
  reasonCode: WhatsAppWebLocalFeatureReasonCode;
}

export interface WhatsAppWebLocalPairingSnapshot {
  feature: typeof WHATSAPP_WEB_LOCAL_FEATURE;
  state: WhatsAppWebLocalConnectionState;
  reasonCode: string;
  generation: number;
  providerCallExecuted: false;
  checkedAt: string;
}

export interface WhatsAppWebLocalOutboundRequest {
  tenantId: string;
  conversationId: string;
  body: string;
}

export interface WhatsAppWebLocalOutboundResult {
  ok: false;
  code: "whatsapp_web_local_outbound_disabled";
  message: string;
  state: WhatsAppWebLocalConnectionState;
  providerCallExecuted: false;
}
