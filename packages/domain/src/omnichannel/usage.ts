import type { ChannelKind } from "./model";

export interface OmnichannelUsageEventInput {
  tenantId: string;
  channel: ChannelKind;
  conversationId: string;
  direction: "inbound" | "outbound_attempt" | "outbound_sent" | "outbound_failed";
  actorId?: string;
  metadata?: Record<string, unknown>;
}

export interface UsageLedgerWriter {
  record(event: {
    tenantId: string;
    eventType: "channel_message" | "workflow_execution";
    source: string;
    quantity: number;
    unit: string;
    metadata?: Record<string, unknown>;
  }): Promise<unknown>;
}

export function buildOmnichannelUsageRecord(input: OmnichannelUsageEventInput) {
  const source = `omnichannel:${input.channel}`;
  return {
    tenantId: input.tenantId,
    eventType: "channel_message" as const,
    source,
    quantity: 1,
    unit: "message",
    metadata: {
      channel: input.channel,
      conversationId: input.conversationId,
      direction: input.direction,
      actorId: input.actorId,
      ...(input.metadata ?? {})
    }
  };
}

export async function recordOmnichannelUsageEvent(
  ledger: UsageLedgerWriter,
  input: OmnichannelUsageEventInput
): Promise<{ ok: boolean; reasons: string[] }> {
  if (!input.tenantId || !input.conversationId) {
    return { ok: false, reasons: ["missing_tenant_or_conversation"] };
  }

  await ledger.record(buildOmnichannelUsageRecord(input));
  return { ok: true, reasons: [] };
}
