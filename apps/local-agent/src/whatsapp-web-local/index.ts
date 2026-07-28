import {
  WHATSAPP_WEB_LOCAL_FEATURE,
  type WhatsAppWebLocalConnectionState,
  type WhatsAppWebLocalFeatureDecision,
  type WhatsAppWebLocalOutboundRequest,
  type WhatsAppWebLocalOutboundResult,
  type WhatsAppWebLocalPairingSnapshot
} from "@hallederiz/types";

type RuntimeEnvironment = Record<string, string | undefined>;

export type LocalWhatsAppWebSafeEvent = {
  event:
    | "pairing_start"
    | "pairing_refresh"
    | "pairing_disconnect"
    | "pairing_logout"
    | "pairing_state_change"
    | "outbound_denied";
  feature: typeof WHATSAPP_WEB_LOCAL_FEATURE;
  state: WhatsAppWebLocalConnectionState;
  reasonCode: string;
  generation: number;
  providerCallExecuted: false;
  checkedAt: string;
};

export interface LocalWhatsAppWebSafeEventSink {
  record(event: LocalWhatsAppWebSafeEvent): void;
}

export interface LocalWhatsAppWebPairingEngine {
  start(): Promise<WhatsAppWebLocalPairingSnapshot>;
  getStatus(): Promise<WhatsAppWebLocalPairingSnapshot>;
  refresh(): Promise<WhatsAppWebLocalPairingSnapshot>;
  disconnect(): Promise<WhatsAppWebLocalPairingSnapshot>;
  logout(): Promise<WhatsAppWebLocalPairingSnapshot>;
}

const NOOP_EVENT_SINK: LocalWhatsAppWebSafeEventSink = {
  record: () => undefined
};

const ALLOWED_TRANSITIONS: Readonly<
  Record<WhatsAppWebLocalConnectionState, readonly WhatsAppWebLocalConnectionState[]>
> = {
  disabled: ["disabled"],
  starting: ["qr_ready", "connecting", "logged_out", "expired", "error"],
  qr_ready: ["starting", "connecting", "logged_out", "expired", "error"],
  connecting: ["connected", "reconnecting", "logged_out", "expired", "error"],
  connected: ["reconnecting", "logged_out", "error"],
  reconnecting: ["starting", "connected", "logged_out", "expired", "error"],
  logged_out: ["starting"],
  expired: ["starting", "logged_out"],
  error: ["starting", "reconnecting", "logged_out"]
};

function parseEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

export function resolveWhatsAppWebLocalFeatureFlag(
  env: RuntimeEnvironment = process.env
): WhatsAppWebLocalFeatureDecision {
  if (env.NODE_ENV?.trim().toLowerCase() === "production") {
    return {
      feature: WHATSAPP_WEB_LOCAL_FEATURE,
      enabled: false,
      reasonCode: "whatsapp_web_local_production_hard_deny"
    };
  }

  if (!parseEnabled(env.WHATSAPP_WEB_LOCAL_ENABLED)) {
    return {
      feature: WHATSAPP_WEB_LOCAL_FEATURE,
      enabled: false,
      reasonCode: "whatsapp_web_local_disabled_by_default"
    };
  }

  return {
    feature: WHATSAPP_WEB_LOCAL_FEATURE,
    enabled: true,
    reasonCode: "whatsapp_web_local_enabled_non_production"
  };
}

type StubPairingEngineOptions = {
  feature: WhatsAppWebLocalFeatureDecision;
  eventSink?: LocalWhatsAppWebSafeEventSink;
  now?: () => string;
  runtimeEnvironment?: RuntimeEnvironment;
};

/**
 * Foundation-only state machine. It never loads a WhatsApp Web library, creates
 * QR content, stores auth state, or calls an external provider.
 */
export class StubLocalWhatsAppWebPairingEngine implements LocalWhatsAppWebPairingEngine {
  private readonly feature: WhatsAppWebLocalFeatureDecision;
  private state: WhatsAppWebLocalConnectionState;
  private reasonCode: string;
  private generation = 0;
  private readonly eventSink: LocalWhatsAppWebSafeEventSink;
  private readonly now: () => string;

  constructor(options: StubPairingEngineOptions) {
    const runtimeIsProduction =
      (options.runtimeEnvironment?.NODE_ENV ?? process.env.NODE_ENV)?.trim().toLowerCase() === "production";
    this.feature = runtimeIsProduction
      ? {
          feature: WHATSAPP_WEB_LOCAL_FEATURE,
          enabled: false,
          reasonCode: "whatsapp_web_local_production_hard_deny"
        }
      : options.feature;
    this.state = this.feature.enabled ? "logged_out" : "disabled";
    this.reasonCode = this.feature.reasonCode;
    this.eventSink = options.eventSink ?? NOOP_EVENT_SINK;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async start(): Promise<WhatsAppWebLocalPairingSnapshot> {
    if (!this.feature.enabled) {
      return this.snapshot();
    }

    if (this.state === "logged_out" || this.state === "expired" || this.state === "error") {
      this.generation += 1;
      this.applyState("starting", "whatsapp_web_local_pairing_stub_started", "pairing_start");
    }
    return this.snapshot();
  }

  async getStatus(): Promise<WhatsAppWebLocalPairingSnapshot> {
    return this.snapshot();
  }

  async refresh(): Promise<WhatsAppWebLocalPairingSnapshot> {
    if (!this.feature.enabled) {
      return this.snapshot();
    }

    if (
      this.state === "qr_ready" ||
      this.state === "expired" ||
      this.state === "error" ||
      this.state === "logged_out"
    ) {
      this.generation += 1;
      this.applyState("starting", "whatsapp_web_local_pairing_stub_refreshed", "pairing_refresh");
    } else {
      this.reasonCode = "whatsapp_web_local_refresh_not_allowed";
    }
    return this.snapshot();
  }

  async disconnect(): Promise<WhatsAppWebLocalPairingSnapshot> {
    if (!this.feature.enabled) {
      return this.snapshot();
    }

    this.applyState("logged_out", "whatsapp_web_local_disconnected", "pairing_disconnect", true);
    return this.snapshot();
  }

  async logout(): Promise<WhatsAppWebLocalPairingSnapshot> {
    if (!this.feature.enabled) {
      return this.snapshot();
    }

    this.applyState("logged_out", "whatsapp_web_local_logged_out", "pairing_logout", true);
    return this.snapshot();
  }

  /**
   * Reserved for a future isolated engine callback. The stub accepts state only;
   * it intentionally has no QR, credential, auth-state, token, or session input.
   */
  transitionTo(nextState: WhatsAppWebLocalConnectionState): WhatsAppWebLocalPairingSnapshot {
    if (!this.feature.enabled) {
      return this.snapshot();
    }

    if (!ALLOWED_TRANSITIONS[this.state].includes(nextState)) {
      this.reasonCode = "whatsapp_web_local_invalid_state_transition";
      return this.snapshot();
    }

    this.applyState(nextState, "whatsapp_web_local_state_updated", "pairing_state_change");
    return this.snapshot();
  }

  private applyState(
    state: WhatsAppWebLocalConnectionState,
    reasonCode: string,
    event: LocalWhatsAppWebSafeEvent["event"],
    force = false
  ) {
    if (!force && !ALLOWED_TRANSITIONS[this.state].includes(state)) {
      this.reasonCode = "whatsapp_web_local_invalid_state_transition";
      return;
    }

    this.state = state;
    this.reasonCode = reasonCode;
    const snapshot = this.snapshot();
    this.eventSink.record({
      event,
      feature: snapshot.feature,
      state: snapshot.state,
      reasonCode: snapshot.reasonCode,
      generation: snapshot.generation,
      providerCallExecuted: false,
      checkedAt: snapshot.checkedAt
    });
  }

  private snapshot(): WhatsAppWebLocalPairingSnapshot {
    return {
      feature: WHATSAPP_WEB_LOCAL_FEATURE,
      state: this.state,
      reasonCode: this.reasonCode,
      generation: this.generation,
      providerCallExecuted: false,
      checkedAt: this.now()
    };
  }
}

export class FailClosedLocalWhatsAppWebMessageAdapter {
  constructor(
    private readonly pairingEngine: Pick<LocalWhatsAppWebPairingEngine, "getStatus">,
    private readonly eventSink: LocalWhatsAppWebSafeEventSink = NOOP_EVENT_SINK,
    private readonly now: () => string = () => new Date().toISOString()
  ) {}

  async sendMessage(_request: WhatsAppWebLocalOutboundRequest): Promise<WhatsAppWebLocalOutboundResult> {
    const pairing = await this.pairingEngine.getStatus();
    this.eventSink.record({
      event: "outbound_denied",
      feature: WHATSAPP_WEB_LOCAL_FEATURE,
      state: pairing.state,
      reasonCode: "whatsapp_web_local_outbound_disabled",
      generation: pairing.generation,
      providerCallExecuted: false,
      checkedAt: this.now()
    });

    return {
      ok: false,
      code: "whatsapp_web_local_outbound_disabled",
      message: "Yerel WhatsApp Web mesaj gonderimi bu gelistirme asamasinda kapalidir.",
      state: pairing.state,
      providerCallExecuted: false
    };
  }
}
