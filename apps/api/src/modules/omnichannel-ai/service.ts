import type { OmnichannelInboundNormalizedMessage } from "@hallederiz/types";
import { hashToken } from "@hallederiz/domain";
import type { OmnichannelRuntimeResolution } from "../../shared/omnichannel-runtime";
import { resolvePendingApprovalRepository } from "../../shared/approval-repository-runtime";
import { AiRuntimeService } from "../ai-runtime/service";
import type { RequestContext } from "../../shared/request-context";

const HIGH_RISK_INTENT_KEYWORDS = ["fiyat", "ödeme", "odeme", "iade", "fatura", "ekstre", "stok", "teslim", "indirim"];

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function isHighRiskIntent(intent: string | undefined, text: string): boolean {
  const haystack = `${intent ?? ""} ${text}`.toLocaleLowerCase("tr-TR");
  return HIGH_RISK_INTENT_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

export class OmnichannelAiService {
  constructor(
    private readonly runtime: OmnichannelRuntimeResolution,
    private readonly context?: RequestContext
  ) {}

  async enqueueAiJobsForInboundMessage(input: {
    tenantId: string;
    conversationId: string;
    messageId: string;
    channel: string;
    text: string;
  }) {
    if (!this.runtime.aiReplyJobRepository) {
      return { enqueued: false, reason: "ai_jobs_unavailable" };
    }

    const at = nowIso();
    await this.runtime.aiReplyJobRepository.enqueue({
      id: createId("ai_job"),
      tenantId: input.tenantId,
      conversationId: input.conversationId,
      messageId: input.messageId,
      jobType: "classify_intent",
      status: "pending",
      attempts: 0,
      metadata: { channel: input.channel },
      createdAt: at,
      updatedAt: at
    });
    await this.runtime.aiReplyJobRepository.enqueue({
      id: createId("ai_job"),
      tenantId: input.tenantId,
      conversationId: input.conversationId,
      messageId: input.messageId,
      jobType: "generate_reply",
      status: "pending",
      attempts: 0,
      metadata: { channel: input.channel },
      createdAt: at,
      updatedAt: at
    });

    return { enqueued: true };
  }

  async classifyMessageJob(input: { tenantId: string; conversationId: string; text: string }) {
    try {
      const ai = new AiRuntimeService(this.context ?? { tenantId: input.tenantId, userId: "system_ai", persistenceMode: "demo" });
      const result = await ai.classifySalesIntent({ message: input.text });
      if (this.runtime.aiChatSessionRepository) {
        await this.runtime.aiChatSessionRepository.updateIntent(input.tenantId, input.conversationId, result.intent);
      }
      return { ok: true, intent: result.intent };
    } catch {
      return { ok: false, degraded: true };
    }
  }

  async generateReplySuggestionJob(input: {
    tenantId: string;
    conversationId: string;
    sessionId: string;
    sourceMessageId: string;
    text: string;
    channel: string;
  }) {
    if (!this.runtime.aiReplySuggestionRepository) {
      return { ok: false, reason: "suggestions_unavailable" };
    }

    let intent = "general";
    try {
      const ai = new AiRuntimeService(this.context ?? { tenantId: input.tenantId, userId: "system_ai", persistenceMode: "demo" });
      const classified = await ai.classifySalesIntent({ message: input.text });
      intent = classified.intent;
    } catch {
      return { ok: false, degraded: true };
    }

    const draftText = [
      "Merhaba, mesajınız için teşekkür ederiz.",
      "Talebinizi inceledik; fiyat ve stok bilgisi sistemden kontrol edilmelidir.",
      "Onaylı yanıt akışı tamamlandığında size dönüş yapılacaktır."
    ].join(" ");

    const policyDecision = isHighRiskIntent(intent, input.text) ? "require_approval" : "require_approval";
    const at = nowIso();
    const suggestion = await this.runtime.aiReplySuggestionRepository.createSuggestion({
      id: createId("ai_suggestion"),
      tenantId: input.tenantId,
      sessionId: input.sessionId,
      conversationId: input.conversationId,
      sourceMessageId: input.sourceMessageId,
      draftText,
      confidence: 0.62,
      intent,
      policyDecision,
      status: "waiting_approval",
      metadata: { channel: input.channel, locale: "tr-TR", autoSend: false },
      createdAt: at,
      updatedAt: at
    });

    await this.createApprovalForSuggestion(suggestion.id, {
      tenantId: input.tenantId,
      conversationId: input.conversationId,
      provider: input.channel,
      draftText
    });

    return { ok: true, suggestionId: suggestion.id };
  }

  async createApprovalForSuggestion(
    suggestionId: string,
    metadata: { tenantId: string; conversationId: string; provider: string; draftText: string }
  ) {
    if (!this.runtime.aiReplySuggestionRepository) {
      return { ok: false, approvalPersisted: false };
    }

    const context: RequestContext =
      this.context ??
      ({
        tenantId: metadata.tenantId,
        userId: "system_omnichannel",
        persistenceMode: this.runtime.mode === "postgres" ? "postgres" : "demo"
      } as RequestContext);

    const approvalRuntime = resolvePendingApprovalRepository(context);
    if (!approvalRuntime.repository) {
      return { ok: false, approvalPersisted: false, reasons: approvalRuntime.reasons };
    }

    const pending = await approvalRuntime.repository.createPendingApprovalRequest({
      tenantId: context.tenantId,
      actorId: context.userId,
      actionKey: "platform.omnichannel.ai_reply.approve",
      reasons: ["ai_reply_requires_human_approval"],
      payload: {
        entityType: "ai_reply_suggestion",
        entityId: suggestionId,
        channel: "omnichannel",
        conversationId: metadata.conversationId,
        provider: metadata.provider,
        draftText: metadata.draftText
      },
      auditRequired: true,
      timelineRequired: true
    });

    await this.runtime.aiReplySuggestionRepository.updateStatus(suggestionId, "waiting_approval", pending.approvalRequestId);
    return { ok: true, approvalRequestId: pending.approvalRequestId, approvalPersisted: true };
  }

  async enqueueSendReplyJob(input: { tenantId: string; conversationId: string; suggestionId: string }) {
    if (!this.runtime.aiReplyJobRepository) return { enqueued: false };
    const at = nowIso();
    await this.runtime.aiReplyJobRepository.enqueue({
      id: createId("ai_job"),
      tenantId: input.tenantId,
      conversationId: input.conversationId,
      suggestionId: input.suggestionId,
      jobType: "send_reply",
      status: "pending",
      attempts: 0,
      metadata: { approvalRequired: true },
      createdAt: at,
      updatedAt: at
    });
    return { enqueued: true };
  }
}

export function resolveMetaVerifyTokenHash(verifyToken: string | undefined) {
  if (!verifyToken?.trim()) return undefined;
  return hashToken(verifyToken.trim());
}

export function mapInboundToConversationId(normalized: OmnichannelInboundNormalizedMessage) {
  return `omni_${hashToken(normalized.externalConversationId).slice(0, 24)}`;
}

export function mapInboundToMessageId(normalized: OmnichannelInboundNormalizedMessage) {
  return `omni_msg_${hashToken(normalized.externalMessageId).slice(0, 24)}`;
}
