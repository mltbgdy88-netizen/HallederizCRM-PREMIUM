import assert from "node:assert/strict";
import test from "node:test";
import { resolveWhatsAppRulePolicy } from "@hallederiz/domain";

test("stok: kayitli telefon ve cari boolean map true; otomatik cevap conditional maps false", () => {
  const rule = resolveWhatsAppRulePolicy({ intent: "stok" });

  assert.equal(rule.canAutoReply, false);
  assert.equal(rule.requiresRegisteredPhone, true);
  assert.equal(rule.requiresLinkedCustomer, true);
  assert.equal(rule.requiresInternalApproval, true);
});

test("fiyat ve ekstre: kayitli telefon ve cari zorunlu; otomatik cevap kapalı", () => {
  const price = resolveWhatsAppRulePolicy({ intent: "fiyat" });
  const statement = resolveWhatsAppRulePolicy({ intent: "ekstre" });

  assert.equal(price.requiresRegisteredPhone, true);
  assert.equal(price.requiresLinkedCustomer, true);
  assert.equal(price.canAutoReply, false);
  assert.equal(statement.requiresRegisteredPhone, true);
  assert.equal(statement.requiresLinkedCustomer, true);
});

test("siparis: satış ve CRM boolean true; muhasebe hayır — onay rolleri crm_and_sales", () => {
  const rule = resolveWhatsAppRulePolicy({ intent: "siparis" });

  assert.equal(rule.requiresInternalApproval, true);
  assert.equal(rule.requiresSalesApproval, true);
  assert.equal(rule.requiresAccountingApproval, false);
  assert.equal(rule.requiresCrmApproval, true);
  assert.deepEqual(rule.requiredRoles, ["crm", "sales"]);
});

test("iade: çoklu onay — crm_and_sales + muhasebe", () => {
  const rule = resolveWhatsAppRulePolicy({ intent: "iade" });

  assert.equal(rule.requiresInternalApproval, true);
  assert.equal(rule.requiresSalesApproval, true);
  assert.equal(rule.requiresAccountingApproval, true);
  assert.equal(rule.requiresCrmApproval, true);
  assert.deepEqual(rule.requiredRoles, ["crm", "sales", "accounting"]);
});

test("hatali_urun: telefon ve cari matrise göre zorunlu", () => {
  const rule = resolveWhatsAppRulePolicy({ intent: "hatali_urun" });

  assert.equal(rule.requiresInternalApproval, true);
  assert.equal(rule.requiresLinkedCustomer, true);
  assert.equal(rule.requiresRegisteredPhone, true);
});

test("sales ve accounting telefonları normalize edilir", () => {
  const rule = resolveWhatsAppRulePolicy({
    intent: "iade",
    settings: {
      salesApprovalPhone: "+90 (532) 111 22 33",
      accountingApprovalPhone: "0 312 444 55 66"
    }
  });

  assert.deepEqual(rule.approverPhones, ["905321112233", "03124445566"]);
});
