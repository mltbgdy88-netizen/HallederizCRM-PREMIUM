import { ApiError } from "@hallederiz/sdk";

export const PAYMENT_CREATE_MSG = {
  IDEMPOTENCY_CONFLICT:
    "Bu gönderim anahtarı farklı veriyle tekrar kullanılamaz. Formu kontrol edip yeniden deneyin.",
  IDEMPOTENCY_REQUIRED: "Güvenli gönderim anahtarı eksik. Sayfayı yenileyip tekrar deneyin.",
  INVALID_AMOUNT: "Geçersiz tahsilat tutarı.",
  APPROVAL_QUEUED: "Tahsilat onay kuyruğuna alındı.",
  CREATED: "Tahsilat kaydı hazırlandı.",
  DRAFT_READY: "Tahsilat taslağı hazırlandı.",
  GENERIC_FAIL: "Tahsilat kaydı şu an tamamlanamadı. Bağlantıyı kontrol edin.",
  DEMO_BLOCKED: "Demo modda canlı tahsilat oluşturulmaz. Taslak bilgileri kaydedildi."
} as const;

function readApiError(error: unknown): { status: number; message: string } | null {
  if (error instanceof ApiError) {
    return { status: error.status, message: error.message.trim() };
  }
  if (typeof error === "object" && error !== null) {
    const candidate = error as { status?: unknown; message?: unknown };
    if (typeof candidate.status === "number" && typeof candidate.message === "string") {
      return { status: candidate.status, message: candidate.message.trim() };
    }
  }
  return null;
}

export function mapPaymentCreateApiError(error: unknown): { message: string; rotateKey: boolean } {
  const httpError = readApiError(error);
  if (!httpError) {
    return { message: PAYMENT_CREATE_MSG.GENERIC_FAIL, rotateKey: true };
  }

  const { status, message } = httpError;

  if (status === 409) {
    return { message: PAYMENT_CREATE_MSG.IDEMPOTENCY_CONFLICT, rotateKey: true };
  }

  if (status === 400) {
    if (/idempotency/i.test(message)) {
      return { message: PAYMENT_CREATE_MSG.IDEMPOTENCY_REQUIRED, rotateKey: true };
    }
    if (message) {
      return { message, rotateKey: true };
    }
    return { message: PAYMENT_CREATE_MSG.INVALID_AMOUNT, rotateKey: true };
  }

  if (status === 401) {
    return { message: "Oturum süresi doldu. Tekrar giriş yapın.", rotateKey: false };
  }

  if (status === 403) {
    return { message: "Bu işlem için yetkiniz yok.", rotateKey: false };
  }

  if (message && !/api|fetch failed|networkerror/i.test(message)) {
    return { message, rotateKey: true };
  }

  return { message: PAYMENT_CREATE_MSG.GENERIC_FAIL, rotateKey: true };
}

export function isPaymentApprovalResponse(body: unknown): boolean {
  if (!body || typeof body !== "object") {
    return false;
  }
  const record = body as Record<string, unknown>;
  return (
    record.approvalRequired === true ||
    record.policyDecision === "require_approval" ||
    record.status === "require_approval"
  );
}

export function extractPaymentIdFromCreateResponse(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const record = body as Record<string, unknown>;
  if (record.item && typeof record.item === "object" && record.item !== null) {
    const item = record.item as Record<string, unknown>;
    if (typeof item.id === "string" && item.id.trim()) {
      return item.id;
    }
  }
  return null;
}

export function extractApprovalRequestId(body: unknown): string | undefined {
  if (!body || typeof body !== "object") {
    return undefined;
  }
  const record = body as Record<string, unknown>;
  if (typeof record.approvalRequestId === "string" && record.approvalRequestId.trim()) {
    return record.approvalRequestId;
  }
  if (typeof record.approvalId === "string" && record.approvalId.trim()) {
    return record.approvalId;
  }
  return undefined;
}

export function createPaymentIdempotencyKey(): string {
  return `pay_create_${crypto.randomUUID()}`;
}
