import { createHash } from "node:crypto";
import type { RequestContext } from "./request-context";
import { recordAuditEvent } from "./audit-timeline";

export function maskIdempotencyKey(idempotencyKey: string): string {
  const trimmed = idempotencyKey.trim();
  if (trimmed.length <= 8) {
    return "***";
  }
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

export function hashIdempotencyKey(idempotencyKey: string): string {
  return createHash("sha256").update(idempotencyKey).digest("hex").slice(0, 16);
}

export function recordIdempotencyAuditEvent(
  context: RequestContext,
  input: {
    action: "missing_key" | "replay" | "conflict" | "stored" | "cleanup_dry_run" | "cleanup_execute";
    scope: string;
    idempotencyKey?: string;
    entityType?: string;
    entityId?: string;
    statusCode?: number;
    deletedCount?: number;
    expiredCount?: number;
    dryRun?: boolean;
  }
): void {
  const maskedKey = input.idempotencyKey ? maskIdempotencyKey(input.idempotencyKey) : undefined;
  const keyHash = input.idempotencyKey ? hashIdempotencyKey(input.idempotencyKey) : undefined;

  console.info(
    JSON.stringify({
      type: "idempotency_event",
      tenantId: context.tenantId,
      actorId: context.userId,
      action: input.action,
      scope: input.scope,
      entityType: input.entityType,
      entityId: input.entityId,
      statusCode: input.statusCode,
      idempotencyKeyMasked: maskedKey,
      idempotencyKeyHash: keyHash,
      deletedCount: input.deletedCount,
      expiredCount: input.expiredCount,
      dryRun: input.dryRun
    })
  );

  if (input.action === "replay" || input.action === "conflict" || input.action === "stored") {
    recordAuditEvent(context, {
      entityType: input.entityType ?? "idempotency",
      entityId: input.entityId ?? keyHash ?? input.scope,
      eventType: `idempotency.${input.action}`,
      title:
        input.action === "replay"
          ? "Idempotency replay"
          : input.action === "conflict"
            ? "Idempotency conflict"
            : "Idempotency kaydi olusturuldu",
      description: `${input.scope} kapsaminda idempotency ${input.action} olayi.`,
      payload: {
        scope: input.scope,
        idempotencyKeyHash: keyHash,
        statusCode: input.statusCode
      }
    });
  }
}
