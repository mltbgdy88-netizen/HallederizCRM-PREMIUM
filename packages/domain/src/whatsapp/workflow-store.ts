import type {
  TenantId,
  TenantWhatsAppWorkflowStore,
  WhatsAppWorkflowApproverContext,
  WhatsAppWorkflowCommandAudit,
  WhatsAppWorkflowCommandValidationResult,
  WhatsAppWorkflowDuplicateReason,
  WhatsAppWorkflowPendingTicket,
  WhatsAppWorkflowProcessedMessage,
  WhatsAppWorkflowProcessingMessage,
  WhatsAppWorkflowTicketStatus,
  WhatsAppWorkflowTicketType
} from "@hallederiz/types";

export const WHATSAPP_WORKFLOW_DUPLICATE_WINDOW_MS = 20_000;
export const WHATSAPP_WORKFLOW_PROCESSED_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
export const WHATSAPP_WORKFLOW_PROCESSING_RETENTION_MS = 45 * 60 * 1000;
export const WHATSAPP_WORKFLOW_AUDIT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
export const WHATSAPP_WORKFLOW_TICKET_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export type WhatsAppInboundContentInput = {
  from: string;
  text?: string;
  messageType?: string;
  mediaHash?: string;
  mimeType?: string;
  fileName?: string;
};

export type WhatsAppInboundMessageIdentity = {
  id: string;
  from: string;
  contentHash: string;
  at: string;
};

export function createEmptyWhatsAppWorkflowStore(): TenantWhatsAppWorkflowStore {
  return {
    processedMessages: [],
    processingMessages: [],
    tickets: [],
    commandAudit: []
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeArray<T>(value: unknown, map: (item: Record<string, unknown>) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const mapped = map(item);
    return mapped ? [mapped] : [];
  });
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function optionalStringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

export function normalizeTenantWhatsAppWorkflowStore(value: unknown): TenantWhatsAppWorkflowStore {
  const store = isRecord(value) ? value : {};
  return withStoreCleanup({
    commandAudit: normalizeArray(store.commandAudit, (item) => ({
      at: stringValue(item.at, new Date(0).toISOString()),
      command: stringValue(item.command),
      fromPhone: normalizePhone(stringValue(item.fromPhone)),
      id: stringValue(item.id),
      reason: optionalStringValue(item.reason),
      referenceCode: stringValue(item.referenceCode),
      result: ["accepted", "rejected", "duplicate"].includes(stringValue(item.result)) ? (stringValue(item.result) as WhatsAppWorkflowCommandAudit["result"]) : "rejected"
    })),
    mediaMessages: normalizeArray(store.mediaMessages, (item) => ({
      at: stringValue(item.at, new Date(0).toISOString()),
      fileName: optionalStringValue(item.fileName),
      from: normalizePhone(stringValue(item.from)),
      id: stringValue(item.id),
      mediaHash: optionalStringValue(item.mediaHash),
      mimeType: optionalStringValue(item.mimeType)
    })),
    processedMessages: normalizeArray(store.processedMessages, (item) => ({
      at: stringValue(item.at, new Date(0).toISOString()),
      contentHash: stringValue(item.contentHash),
      from: normalizePhone(stringValue(item.from)),
      id: stringValue(item.id)
    })),
    processingMessages: normalizeArray(store.processingMessages, (item) => ({
      at: stringValue(item.at, new Date(0).toISOString()),
      contentHash: stringValue(item.contentHash),
      from: normalizePhone(stringValue(item.from)),
      id: stringValue(item.id),
      startedAt: stringValue(item.startedAt, stringValue(item.at, new Date(0).toISOString()))
    })),
    tickets: normalizeArray(store.tickets, (item) => ({
      allowedCommands: Array.isArray(item.allowedCommands) ? item.allowedCommands.map((command) => stringValue(command)).filter(Boolean) : [],
      createdAt: stringValue(item.createdAt, new Date(0).toISOString()),
      customerName: stringValue(item.customerName),
      customerPhone: normalizePhone(stringValue(item.customerPhone)),
      expiresAt: stringValue(item.expiresAt, new Date(0).toISOString()),
      id: stringValue(item.id),
      payload: objectValue(item.payload),
      referenceCode: stringValue(item.referenceCode),
      resolvedCommand: optionalStringValue(item.resolvedCommand),
      status: ["pending", "applied", "rejected", "expired"].includes(stringValue(item.status)) ? (stringValue(item.status) as WhatsAppWorkflowTicketStatus) : "pending",
      tenantId: stringValue(item.tenantId),
      tokenHash: stringValue(item.tokenHash),
      type: ["order_decision", "payment_receipt", "return_review", "defect_review", "payment_exception"].includes(stringValue(item.type))
        ? (stringValue(item.type) as WhatsAppWorkflowTicketType)
        : "order_decision",
      usedAt: optionalStringValue(item.usedAt),
      usedByPhone: optionalStringValue(item.usedByPhone)
    }))
  });
}

export function normalizePhone(phone: string | undefined | null): string {
  return String(phone ?? "").replace(/\D/g, "");
}

function normalizeCommand(command: string): string {
  return command.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, "_");
}

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function rotateRight(value: number, bits: number): number {
  return (value >>> bits) | (value << (32 - bits));
}

function utf8Bytes(value: string): number[] {
  return Array.from(new TextEncoder().encode(value));
}

function sha256(value: string): string {
  const bytes = utf8Bytes(value);
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let shift = 56; shift >= 0; shift -= 8) bytes.push(Math.floor(bitLength / 2 ** shift) & 0xff);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = new Array<number>(64).fill(0);
    for (let index = 0; index < 16; index += 1) {
      const base = offset + index * 4;
      words[index] = ((bytes[base] ?? 0) << 24) | ((bytes[base + 1] ?? 0) << 16) | ((bytes[base + 2] ?? 0) << 8) | (bytes[base + 3] ?? 0);
    }
    for (let index = 16; index < 64; index += 1) {
      const previous15 = words[index - 15] ?? 0;
      const previous2 = words[index - 2] ?? 0;
      const s0 = rotateRight(previous15, 7) ^ rotateRight(previous15, 18) ^ (previous15 >>> 3);
      const s1 = rotateRight(previous2, 17) ^ rotateRight(previous2, 19) ^ (previous2 >>> 10);
      words[index] = (((words[index - 16] ?? 0) + s0 + (words[index - 7] ?? 0) + s1) >>> 0);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let index = 0; index < 64; index += 1) {
      const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + (SHA256_K[index] ?? 0) + (words[index] ?? 0)) >>> 0;
      const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7].map((item) => item.toString(16).padStart(8, "0")).join("");
}

export function hashToken(rawToken: string): string {
  return sha256(rawToken.trim());
}

export function hashInboundMessageContent(input: WhatsAppInboundContentInput): string {
  const canonical = {
    fileName: input.fileName?.trim().toLocaleLowerCase("tr-TR") ?? "",
    from: normalizePhone(input.from),
    mediaHash: input.mediaHash?.trim().toLocaleLowerCase("tr-TR") ?? "",
    messageType: input.messageType?.trim().toLocaleLowerCase("tr-TR") ?? "text",
    mimeType: input.mimeType?.trim().toLocaleLowerCase("tr-TR") ?? "",
    text: input.text?.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr-TR") ?? ""
  };
  return sha256(JSON.stringify(canonical));
}

function toTime(value: string): number {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

export function findMessageDuplicate(
  store: TenantWhatsAppWorkflowStore,
  message: WhatsAppInboundMessageIdentity,
  options: { duplicateWindowMs?: number; now?: string } = {}
): WhatsAppWorkflowDuplicateReason | null {
  const duplicateWindowMs = options.duplicateWindowMs ?? WHATSAPP_WORKFLOW_DUPLICATE_WINDOW_MS;
  const nowMs = toTime(options.now ?? message.at);
  const from = normalizePhone(message.from);

  if (store.processedMessages.some((item) => item.id === message.id)) return "same_message_processed";
  if (store.processingMessages.some((item) => item.id === message.id)) return "same_message_processing";

  const contentProcessed = store.processedMessages.some(
    (item) => normalizePhone(item.from) === from && item.contentHash === message.contentHash && Math.abs(nowMs - toTime(item.at)) <= duplicateWindowMs
  );
  if (contentProcessed) return "same_content_processed";

  const contentProcessing = store.processingMessages.some(
    (item) => normalizePhone(item.from) === from && item.contentHash === message.contentHash && Math.abs(nowMs - toTime(item.startedAt)) <= duplicateWindowMs
  );
  if (contentProcessing) return "same_content_processing";

  return null;
}

export function reserveProcessingMessage(store: TenantWhatsAppWorkflowStore, message: WhatsAppInboundMessageIdentity): TenantWhatsAppWorkflowStore {
  if (findMessageDuplicate(store, message)) return store;
  const processingMessage: WhatsAppWorkflowProcessingMessage = {
    ...message,
    from: normalizePhone(message.from),
    startedAt: message.at
  };
  return {
    ...store,
    processingMessages: [...store.processingMessages, processingMessage]
  };
}

export function markProcessedMessage(store: TenantWhatsAppWorkflowStore, message: WhatsAppInboundMessageIdentity): TenantWhatsAppWorkflowStore {
  const processedMessage: WhatsAppWorkflowProcessedMessage = {
    id: message.id,
    from: normalizePhone(message.from),
    contentHash: message.contentHash,
    at: message.at
  };
  return {
    ...store,
    processedMessages: [...store.processedMessages.filter((item) => item.id !== message.id), processedMessage],
    processingMessages: store.processingMessages.filter((item) => item.id !== message.id)
  };
}

export function releaseProcessingMessage(store: TenantWhatsAppWorkflowStore, messageId: string): TenantWhatsAppWorkflowStore {
  return {
    ...store,
    processingMessages: store.processingMessages.filter((item) => item.id !== messageId)
  };
}

export function createPendingTicket(input: {
  id: string;
  tenantId: TenantId;
  type: WhatsAppWorkflowTicketType;
  referenceCode: string;
  tokenHash: string;
  allowedCommands: string[];
  customerPhone: string;
  customerName: string;
  createdAt: string;
  expiresAt: string;
  payload?: Record<string, unknown>;
}): WhatsAppWorkflowPendingTicket {
  return {
    ...input,
    allowedCommands: [...new Set(input.allowedCommands.map(normalizeCommand).filter(Boolean))],
    customerPhone: normalizePhone(input.customerPhone),
    status: "pending"
  };
}

export function createWhatsAppApprovalTicket(input: {
  tenantId: TenantId;
  type: WhatsAppWorkflowTicketType;
  referenceCode: string;
  rawToken: string;
  allowedCommands: string[];
  customerPhone: string;
  customerName: string;
  createdAt?: string;
  expiresAt: string;
  payload?: Record<string, unknown>;
  id?: string;
}): WhatsAppWorkflowPendingTicket {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const id = input.id ?? `wa_ticket_${input.referenceCode}_${hashToken(`${input.referenceCode}:${createdAt}`).slice(0, 12)}`;
  return createPendingTicket({
    allowedCommands: input.allowedCommands,
    createdAt,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    expiresAt: input.expiresAt,
    id,
    payload: input.payload,
    referenceCode: input.referenceCode,
    tenantId: input.tenantId,
    tokenHash: hashToken(input.rawToken),
    type: input.type
  });
}

export function appendTicket(store: TenantWhatsAppWorkflowStore, ticket: WhatsAppWorkflowPendingTicket): TenantWhatsAppWorkflowStore {
  return {
    ...store,
    tickets: [...store.tickets.filter((item) => item.id !== ticket.id), ticket]
  };
}

export function updateTicket(
  store: TenantWhatsAppWorkflowStore,
  ticketId: string,
  patch: Partial<Omit<WhatsAppWorkflowPendingTicket, "id" | "tenantId" | "tokenHash">> & { status?: WhatsAppWorkflowTicketStatus }
): TenantWhatsAppWorkflowStore {
  return {
    ...store,
    tickets: store.tickets.map((ticket) =>
      ticket.id === ticketId
        ? {
            ...ticket,
            ...patch,
            allowedCommands: patch.allowedCommands ? [...new Set(patch.allowedCommands.map(normalizeCommand).filter(Boolean))] : ticket.allowedCommands,
            customerPhone: patch.customerPhone ? normalizePhone(patch.customerPhone) : ticket.customerPhone
          }
        : ticket
    )
  };
}

export function addCommandAudit(store: TenantWhatsAppWorkflowStore, audit: WhatsAppWorkflowCommandAudit): TenantWhatsAppWorkflowStore {
  return {
    ...store,
    commandAudit: [...store.commandAudit, { ...audit, fromPhone: normalizePhone(audit.fromPhone), command: normalizeCommand(audit.command) }]
  };
}

export function isTicketExpired(ticket: Pick<WhatsAppWorkflowPendingTicket, "expiresAt">, now: string = new Date().toISOString()): boolean {
  return toTime(ticket.expiresAt) <= toTime(now);
}

export function expirePendingTickets(store: TenantWhatsAppWorkflowStore, now: string = new Date().toISOString()): TenantWhatsAppWorkflowStore {
  return {
    ...store,
    tickets: store.tickets.map((ticket) => (ticket.status === "pending" && isTicketExpired(ticket, now) ? { ...ticket, status: "expired" } : ticket))
  };
}

export function withStoreCleanup(store: TenantWhatsAppWorkflowStore, now: string = new Date().toISOString()): TenantWhatsAppWorkflowStore {
  const nowMs = toTime(now);
  const freshEnough = (at: string, retentionMs: number) => nowMs - toTime(at) <= retentionMs;
  return expirePendingTickets(
    {
      ...store,
      commandAudit: store.commandAudit.filter((item) => freshEnough(item.at, WHATSAPP_WORKFLOW_AUDIT_RETENTION_MS)),
      mediaMessages: store.mediaMessages?.filter((item) => freshEnough(item.at, WHATSAPP_WORKFLOW_AUDIT_RETENTION_MS)),
      processedMessages: store.processedMessages.filter((item) => freshEnough(item.at, WHATSAPP_WORKFLOW_PROCESSED_RETENTION_MS)),
      processingMessages: store.processingMessages.filter((item) => freshEnough(item.startedAt, WHATSAPP_WORKFLOW_PROCESSING_RETENTION_MS)),
      tickets: store.tickets.filter((ticket) => ticket.status === "pending" || freshEnough(ticket.createdAt, WHATSAPP_WORKFLOW_TICKET_RETENTION_MS))
    },
    now
  );
}

export function canApproverHandleTicket(ticket: WhatsAppWorkflowPendingTicket, approverContext?: WhatsAppWorkflowApproverContext): boolean {
  if (!approverContext) return true;
  const approverPhones = approverContext.approverPhones?.map(normalizePhone).filter(Boolean) ?? [];
  const phone = normalizePhone(approverContext.phone);
  if (approverPhones.length > 0 && (!phone || !approverPhones.includes(phone))) return false;

  const requiredRoles = approverContext.requiredRoles ?? [];
  if (requiredRoles.length === 0) return true;
  const roles = new Set((approverContext.roles ?? []).map((role) => role.trim().toLocaleLowerCase("tr-TR")));
  return requiredRoles.some((role) => roles.has(role.trim().toLocaleLowerCase("tr-TR")));
}

export function validateTicketCommand(
  ticket: WhatsAppWorkflowPendingTicket,
  commandName: string,
  rawToken: string,
  fromPhone: string,
  approverContext?: WhatsAppWorkflowApproverContext,
  now: string = new Date().toISOString()
): WhatsAppWorkflowCommandValidationResult {
  if (ticket.status !== "pending") return { ok: false, reason: "ticket_already_resolved" };
  if (isTicketExpired(ticket, now)) return { ok: false, reason: "ticket_expired" };
  if (!ticket.allowedCommands.includes(normalizeCommand(commandName))) return { ok: false, reason: "command_not_allowed" };
  if (ticket.tokenHash !== hashToken(rawToken)) return { ok: false, reason: "token_invalid" };
  if (approverContext && !canApproverHandleTicket(ticket, { ...approverContext, phone: fromPhone || approverContext.phone })) {
    return { ok: false, reason: "approver_not_allowed" };
  }
  return { ok: true };
}
