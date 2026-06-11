import type { FastifyReply } from "fastify";
import type { RequestContext } from "./request-context";
import { checkIdempotency, storeIdempotencyResult } from "./idempotency-store";
import { recordIdempotencyAuditEvent } from "./idempotency-observability";

export type StoredIdempotencyResponse = {
  statusCode: number;
  body: unknown;
};

export function isStoredIdempotencyResponse(value: unknown): value is StoredIdempotencyResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "statusCode" in value &&
    typeof (value as StoredIdempotencyResponse).statusCode === "number" &&
    "body" in value
  );
}

export async function withStoredIdempotency(
  context: RequestContext,
  reply: FastifyReply,
  options: {
    scope: string;
    idempotencyKey: string | undefined;
    requestBody: unknown;
    required: boolean;
    entityType: string;
    entityId?: string;
  },
  execute: () => Promise<StoredIdempotencyResponse>
): Promise<unknown> {
  const { idempotencyKey } = options;

  if (!idempotencyKey) {
    if (options.required) {
      recordIdempotencyAuditEvent(context, {
        action: "missing_key",
        scope: options.scope,
        entityType: options.entityType,
        entityId: options.entityId
      });
      return reply.status(400).send({
        message: "Idempotency-Key basligi zorunludur.",
        reason: "idempotency_key_required"
      });
    }
    const result = await execute();
    return reply.status(result.statusCode).send(result.body);
  }

  const check = await checkIdempotency(context, options.scope, idempotencyKey, options.requestBody);
  if (check.type === "conflict") {
    recordIdempotencyAuditEvent(context, {
      action: "conflict",
      scope: options.scope,
      idempotencyKey,
      entityType: options.entityType,
      entityId: options.entityId
    });
    return reply.status(409).send({
      message: "Ayni Idempotency-Key farkli istek govdesi ile kullanilamaz.",
      reason: "idempotency_key_conflict"
    });
  }

  if (check.type === "replay") {
    recordIdempotencyAuditEvent(context, {
      action: "replay",
      scope: options.scope,
      idempotencyKey,
      entityType: options.entityType,
      entityId: options.entityId
    });
    if (isStoredIdempotencyResponse(check.body)) {
      return reply.status(check.body.statusCode).send(check.body.body);
    }
    return reply.status(200).send(check.body);
  }

  const result = await execute();
  await storeIdempotencyResult(
    context,
    options.scope,
    idempotencyKey,
    options.requestBody,
    result,
    result.statusCode
  );
  recordIdempotencyAuditEvent(context, {
    action: "stored",
    scope: options.scope,
    idempotencyKey,
    entityType: options.entityType,
    entityId: options.entityId,
    statusCode: result.statusCode
  });
  return reply.status(result.statusCode).send(result.body);
}
