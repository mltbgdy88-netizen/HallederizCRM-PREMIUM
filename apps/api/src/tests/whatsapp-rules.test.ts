import assert from "node:assert/strict";
import test from "node:test";
import { resolveWhatsAppRulePolicy } from "@hallederiz/domain";

test("stok intent can auto reply without linked customer", () => {
  const rule = resolveWhatsAppRulePolicy({ intent: "stok" });

  assert.equal(rule.canAutoReply, true);
  assert.equal(rule.requiresRegisteredPhone, false);
  assert.equal(rule.requiresLinkedCustomer, false);
  assert.equal(rule.requiresInternalApproval, false);
});

test("fiyat and ekstre require linked customer", () => {
  const price = resolveWhatsAppRulePolicy({ intent: "fiyat" });
  const statement = resolveWhatsAppRulePolicy({ intent: "ekstre" });

  assert.equal(price.requiresRegisteredPhone, true);
  assert.equal(price.requiresLinkedCustomer, true);
  assert.equal(price.canAutoReply, false);
  assert.equal(statement.requiresRegisteredPhone, true);
  assert.equal(statement.requiresLinkedCustomer, true);
});

test("siparis requires internal sales accounting and crm approval", () => {
  const rule = resolveWhatsAppRulePolicy({ intent: "siparis" });

  assert.equal(rule.requiresInternalApproval, true);
  assert.equal(rule.requiresSalesApproval, true);
  assert.equal(rule.requiresAccountingApproval, true);
  assert.equal(rule.requiresCrmApproval, true);
  assert.deepEqual(rule.requiredRoles, ["crm", "sales", "accounting"]);
});

test("iade requires sales and accounting approval", () => {
  const rule = resolveWhatsAppRulePolicy({ intent: "iade" });

  assert.equal(rule.requiresInternalApproval, true);
  assert.equal(rule.requiresSalesApproval, true);
  assert.equal(rule.requiresAccountingApproval, true);
  assert.equal(rule.requiresCrmApproval, false);
  assert.deepEqual(rule.requiredRoles, ["sales", "accounting"]);
});

test("hatali_urun requires approval but not linked customer", () => {
  const rule = resolveWhatsAppRulePolicy({ intent: "hatali_urun" });

  assert.equal(rule.requiresInternalApproval, true);
  assert.equal(rule.requiresLinkedCustomer, false);
  assert.equal(rule.requiresRegisteredPhone, false);
});

test("sales and accounting phones are normalized into approverPhones", () => {
  const rule = resolveWhatsAppRulePolicy({
    intent: "iade",
    settings: {
      salesApprovalPhone: "+90 (532) 111 22 33",
      accountingApprovalPhone: "0 312 444 55 66"
    }
  });

  assert.deepEqual(rule.approverPhones, ["905321112233", "03124445566"]);
});
