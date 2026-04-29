export type ApiErrorCode = "validation_error" | "conflict" | "not_found" | "unauthorized" | "forbidden" | "persistence_unavailable";

export class ApiDomainError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiDomainError";
  }
}

export class ConcurrencyConflictError extends ApiDomainError {
  constructor(message = "Kayit baska bir islem tarafindan degistirildi.", details?: Record<string, unknown>) {
    super("conflict", message, {
      reason: "stale_update",
      ...details
    });
    this.name = "ConcurrencyConflictError";
  }
}

export class UnauthorizedError extends ApiDomainError {
  constructor(message = "Kimlik dogrulama gerekli.", details?: Record<string, unknown>) {
    super("unauthorized", message, details);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiDomainError {
  constructor(message = "Bu islem icin yetkiniz yok.", details?: Record<string, unknown>) {
    super("forbidden", message, details);
    this.name = "ForbiddenError";
  }
}

export function assertOptimisticConcurrency(params: {
  expectedUpdatedAt?: string;
  currentUpdatedAt?: string;
  resource: string;
  resourceId: string;
}) {
  const { expectedUpdatedAt, currentUpdatedAt, resource, resourceId } = params;
  if (!expectedUpdatedAt || !currentUpdatedAt) return;
  if (expectedUpdatedAt !== currentUpdatedAt) {
    throw new ConcurrencyConflictError("Kayit guncel degil. Lutfen veriyi yenileyip tekrar deneyin.", {
      reason: "resource_changed",
      resource,
      resourceId,
      expectedUpdatedAt,
      currentUpdatedAt
    });
  }
}

export function asApiErrorPayload(error: unknown): { statusCode: number; body: Record<string, unknown> } {
  if (error instanceof ApiDomainError) {
    const statusCode =
      error.code === "conflict"
        ? 409
        : error.code === "not_found"
          ? 404
          : error.code === "unauthorized"
            ? 401
            : error.code === "forbidden"
              ? 403
              : error.code === "persistence_unavailable"
                ? 503
              : 400;
    return {
      statusCode,
      body: {
        error: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {})
      }
    };
  }

  const message = error instanceof Error ? error.message : "Beklenmeyen hata";
  return {
    statusCode: 400,
    body: {
      error: "validation_error",
      message
    }
  };
}
