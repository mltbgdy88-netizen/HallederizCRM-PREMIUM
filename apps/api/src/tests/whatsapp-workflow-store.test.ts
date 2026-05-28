import assert from "node:assert/strict";
import test from "node:test";
import {
  addCommandAudit,
  createEmptyWhatsAppWorkflowStore,
  createWhatsAppApprovalTicket,
  findMessageDuplicate,
  hashInboundMessageContent,
  hashToken,
  isTicketExpired,
  markProcessedMessage,
  reserveProcessingMessage,
  validateTicketCommand
} from "@hallederiz/domain";

test("hashToken is deterministic and does not expose raw token", () => {
  const token = "APPROVE-123";
  const first = hashToken(token);
  const second = hashToken(token);

  assert.equal(first, second);
  assert.notEqual(first, token);
  assert.equal(first.length, 64);
  assert.equal(hashToken("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("hashInboundMessageContent normalizes whitespace and case", () => {
  const first = hashInboundMessageContent({ from: "+90 (532) 111 22 33", text: "  Stok   Bilgisi  ", messageType: "TEXT" });
  const second = hashInboundMessageContent({ from: "905321112233", text: "stok bilgisi", messageType: "text" });

  assert.equal(first, second);
});

test("findMessageDuplicate catches processed message id and content window", () => {
  const at = "2026-04-30T10:00:00.000Z";
  const contentHash = hashInboundMessageContent({ from: "905321112233", text: "fiyat alabilir miyim" });
  const store = markProcessedMessage(createEmptyWhatsAppWorkflowStore(), {
    at,
    contentHash,
    from: "905321112233",
    id: "wamid.1"
  });

  assert.equal(findMessageDuplicate(store, { at, contentHash, from: "905321112233", id: "wamid.1" }), "same_message_processed");
  assert.equal(
    findMessageDuplicate(store, {
      at: "2026-04-30T10:00:10.000Z",
      contentHash,
      from: "+90 532 111 22 33",
      id: "wamid.2"
    }),
    "same_content_processed"
  );
});

test("reserveProcessingMessage prevents duplicate processing state", () => {
  const at = "2026-04-30T10:00:00.000Z";
  const contentHash = hashInboundMessageContent({ from: "905321112233", text: "siparis durumu" });
  const message = { at, contentHash, from: "905321112233", id: "wamid.processing" };

  const reserved = reserveProcessingMessage(createEmptyWhatsAppWorkflowStore(), message);
  const reservedAgain = reserveProcessingMessage(reserved, message);

  assert.equal(reserved.processingMessages.length, 1);
  assert.equal(reservedAgain.processingMessages.length, 1);
  assert.equal(findMessageDuplicate(reserved, message), "same_message_processing");
});

test("markProcessedMessage clears processing message", () => {
  const at = "2026-04-30T10:00:00.000Z";
  const message = {
    at,
    contentHash: hashInboundMessageContent({ from: "905321112233", text: "ekstre" }),
    from: "905321112233",
    id: "wamid.processed"
  };

  const reserved = reserveProcessingMessage(createEmptyWhatsAppWorkflowStore(), message);
  const processed = markProcessedMessage(reserved, message);

  assert.equal(processed.processingMessages.length, 0);
  assert.equal(processed.processedMessages.length, 1);
});

test("createWhatsAppApprovalTicket stores pending ticket with token hash only", () => {
  const ticket = createWhatsAppApprovalTicket({
    allowedCommands: ["ONAYLA", " reddet "],
    createdAt: "2026-04-30T10:00:00.000Z",
    customerName: "Musteri Firma",
    customerPhone: "+90 (532) 111 22 33",
    expiresAt: "2026-04-30T11:00:00.000Z",
    rawToken: "secret-token",
    referenceCode: "SO-2026-0038",
    tenantId: "tenant_1",
    type: "order_decision"
  });

  assert.equal(ticket.status, "pending");
  assert.equal(ticket.customerPhone, "905321112233");
  assert.deepEqual(ticket.allowedCommands, ["onayla", "reddet"]);
  assert.equal(ticket.tokenHash, hashToken("secret-token"));
  assert.equal(Object.hasOwn(ticket, "rawToken"), false);
});

test("ticket expiry, command validation and command audit work", () => {
  const ticket = createWhatsAppApprovalTicket({
    allowedCommands: ["onayla"],
    createdAt: "2026-04-30T10:00:00.000Z",
    customerName: "Musteri Firma",
    customerPhone: "905321112233",
    expiresAt: "2026-04-30T11:00:00.000Z",
    rawToken: "secret-token",
    referenceCode: "RET-2026-0001",
    tenantId: "tenant_1",
    type: "return_review"
  });

  assert.equal(isTicketExpired(ticket, "2026-04-30T11:00:01.000Z"), true);
  assert.deepEqual(validateTicketCommand(ticket, "onayla", "secret-token", "905321112233", undefined, "2026-04-30T10:30:00.000Z"), { ok: true });
  const invalidCommand = validateTicketCommand(ticket, "iptal", "secret-token", "905321112233", undefined, "2026-04-30T10:30:00.000Z");
  assert.equal(invalidCommand.ok, false);
  if (!invalidCommand.ok) assert.equal(invalidCommand.reason, "command_not_allowed");

  const invalidToken = validateTicketCommand(ticket, "onayla", "bad-token", "905321112233", undefined, "2026-04-30T10:30:00.000Z");
  assert.equal(invalidToken.ok, false);
  if (!invalidToken.ok) assert.equal(invalidToken.reason, "token_invalid");

  const audited = addCommandAudit(createEmptyWhatsAppWorkflowStore(), {
    at: "2026-04-30T10:31:00.000Z",
    command: " ONAYLA ",
    fromPhone: "+90 532 111 22 33",
    id: "audit_1",
    referenceCode: ticket.referenceCode,
    result: "accepted"
  });

  assert.equal(audited.commandAudit.length, 1);
  assert.equal(audited.commandAudit[0]?.command, "onayla");
  assert.equal(audited.commandAudit[0]?.fromPhone, "905321112233");
});
