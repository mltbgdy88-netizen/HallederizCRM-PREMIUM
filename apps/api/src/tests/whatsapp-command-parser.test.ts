import assert from "node:assert/strict";
import test from "node:test";
import { parseWhatsAppApprovalCommand } from "@hallederiz/domain";

test("WhatsApp command parser parses approve commands", () => {
  const result = parseWhatsAppApprovalCommand("ONAY REF123 TOKEN123");

  assert.equal(result.command, "approve");
  assert.equal(result.referenceCode, "ref123");
  assert.equal(result.rawToken, "token123");
  assert.equal(result.parseError, undefined);
});

test("WhatsApp command parser parses lowercase onayla", () => {
  const result = parseWhatsAppApprovalCommand("  onayla   SO-2026-0038   ABC123  ");

  assert.equal(result.command, "approve");
  assert.equal(result.referenceCode, "so-2026-0038");
  assert.equal(result.rawToken, "abc123");
});

test("WhatsApp command parser parses Turkish INCELE variant", () => {
  const result = parseWhatsAppApprovalCommand("İNCELE RET-1 TOK-1");

  assert.equal(result.command, "review");
  assert.equal(result.referenceCode, "ret-1");
  assert.equal(result.rawToken, "tok-1");
});

test("WhatsApp command parser reports missing token", () => {
  const result = parseWhatsAppApprovalCommand("RED REF123");

  assert.equal(result.command, "reject");
  assert.equal(result.referenceCode, "ref123");
  assert.equal(result.parseError, "missing_token");
});

test("WhatsApp command parser does not treat normal customer messages as commands", () => {
  const result = parseWhatsAppApprovalCommand("Merhaba stok ve fiyat bilgisi alabilir miyim?");

  assert.equal(result.command, undefined);
  assert.equal(result.parseError, "not_command");
});
