import assert from "node:assert/strict";
import test from "node:test";
import {
  MSG_WA_CONNECTION_NOT_LIVE,
  MSG_WA_CONVERSATION_NOT_FOUND,
  MSG_WA_CUSTOMER_HISTORY_MISSING,
  MSG_WA_LIST_FAILED
} from "../data/whatsapp-action-messages";
import {
  mapWhatsAppActionError,
  resolveCustomerEmptyMessage,
  sanitizeWhatsAppUserText
} from "../utils/whatsapp-action-feedback";

test("sanitizeWhatsAppUserText replaces false success wording", () => {
  assert.equal(sanitizeWhatsAppUserText("Mesaj gonderildi"), "Mesaj iletilecek");
  assert.equal(sanitizeWhatsAppUserText("Kanal baglandi"), "Kanal bağlantı bekleniyor");
});

test("sanitizeWhatsAppUserText fixes olusturuldu in demo labels", () => {
  assert.equal(sanitizeWhatsAppUserText("Siparis tasligi olusturuldu"), "Siparis tasligi hazırlandı");
});

test("mapWhatsAppActionError hides technical terms in generic errors", () => {
  const message = mapWhatsAppActionError(new Error("webhook dispatcher failed in outbox"));
  assert.equal(message, MSG_WA_LIST_FAILED);
});

test("mapWhatsAppActionError maps service unavailable to connection copy", () => {
  const message = mapWhatsAppActionError({ status: 503, message: "webhook dispatcher failed in outbox" });
  assert.equal(message, MSG_WA_CONNECTION_NOT_LIVE);
});

test("resolveCustomerEmptyMessage picks customer vs list copy", () => {
  assert.equal(resolveCustomerEmptyMessage(true), MSG_WA_CUSTOMER_HISTORY_MISSING);
  assert.equal(resolveCustomerEmptyMessage(false), MSG_WA_CONVERSATION_NOT_FOUND);
});
