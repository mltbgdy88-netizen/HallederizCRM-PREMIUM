import assert from "node:assert/strict";
import test from "node:test";
import type { ApprovalInboxItem } from "../types";
import {
  applyAdvancedInboxFilters,
  computeCompletedTodayCount,
  describeApprovalFlowSteps,
  formatApprovalDisplayId,
  formatApprovalRelativeTime,
  getApprovalSourceLabel,
  mapApprovalCardTag,
  mapApprovalCardTitle,
  mapApprovalRiskLevel,
  summarizeApprovalAmount,
  summarizeApprovalBusinessContext,
  DEFAULT_APPROVAL_ADVANCED_FILTERS
} from "../utils/approval-card-helpers";

const baseItem = (over: Partial<ApprovalInboxItem>): ApprovalInboxItem => ({
  approvalRequestId: "apr_test_1234567890",
  tenantId: "t1",
  actorId: "u1",
  actionKey: "create_order",
  status: "pending",
  reasons: [],
  idempotencyKey: "idem1",
  requestedAt: "2026-05-12T12:00:00.000Z",
  createdAt: "2026-05-12T12:00:00.000Z",
  updatedAt: "2026-05-12T12:00:00.000Z",
  auditRequired: true,
  timelineRequired: true,
  ...over
});

test("mapApprovalCardTitle maps known action keys", () => {
  assert.equal(mapApprovalCardTitle("platform.settings.update"), "Ayar güncelleme onayı");
  assert.equal(mapApprovalCardTitle("create_order"), "Sipariş onayı");
  assert.equal(mapApprovalCardTitle("unknown.action.xyz"), "Onay gerektiren işlem");
});

test("getApprovalSourceLabel detects WhatsApp from action key", () => {
  const w = getApprovalSourceLabel(baseItem({ actionKey: "send_document_whatsapp" }));
  assert.equal(w.key, "whatsapp");
  assert.equal(w.label, "WhatsApp");
});

test("getApprovalSourceLabel reads channel from payload", () => {
  const w = getApprovalSourceLabel(
    baseItem({
      actionKey: "create_order",
      payload: { channel: "whatsapp" }
    })
  );
  assert.equal(w.key, "whatsapp");
});

test("mapApprovalRiskLevel uses payload riskLevel", () => {
  assert.equal(mapApprovalRiskLevel(baseItem({ payload: { riskLevel: "high" } })), "high");
});

test("mapApprovalRiskLevel does not invent steps", () => {
  const s = describeApprovalFlowSteps(baseItem({}));
  assert.match(s, /Akış bekliyor|olay kaydı/);
});

test("summarizeApprovalAmount returns dash when no numeric fields", () => {
  assert.equal(summarizeApprovalAmount(baseItem({})), "—");
});

test("summarizeApprovalBusinessContext does not fabricate company", () => {
  assert.equal(summarizeApprovalBusinessContext(baseItem({})), "Kayıt bağlamı yok");
});

test("formatApprovalRelativeTime returns Turkish relative phrase", () => {
  const now = Date.parse("2026-05-12T12:30:00.000Z");
  assert.match(formatApprovalRelativeTime("2026-05-12T12:00:00.000Z", now), /30 dk önce/);
});

test("formatApprovalDisplayId prefixes short form", () => {
  assert.match(formatApprovalDisplayId("apr_abcdefgh"), /#ONAY-/);
});

test("applyAdvancedInboxFilters respects risk and source", () => {
  const items = [
    baseItem({ approvalRequestId: "a1", actionKey: "create_order", payload: { riskLevel: "high", channel: "whatsapp" } }),
    baseItem({ approvalRequestId: "a2", actionKey: "platform.settings.update", payload: { riskLevel: "low" } })
  ];
  const f = applyAdvancedInboxFilters(items, { ...DEFAULT_APPROVAL_ADVANCED_FILTERS, risk: "high", source: "whatsapp" });
  assert.equal(f.length, 1);
  assert.equal(f[0]?.approvalRequestId, "a1");
});

test("applyAdvancedInboxFilters unknown origin filter keeps only matching source", () => {
  const items = [baseItem({ approvalRequestId: "x1", payload: { channel: "web" } })];
  const f = applyAdvancedInboxFilters(items, { ...DEFAULT_APPROVAL_ADVANCED_FILTERS, source: "whatsapp" });
  assert.equal(f.length, 0);
});

test("computeCompletedTodayCount counts approvals completed local-today", () => {
  const now = new Date();
  const noonToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 5, 0, 0);
  const items = [
    baseItem({
      approvalRequestId: "c1",
      status: "approved",
      approvedAt: noonToday.toISOString()
    }),
    baseItem({ approvalRequestId: "c2", status: "pending" })
  ];
  assert.equal(computeCompletedTodayCount(items, now), 1);
});

test("mapApprovalCardTag derives discount hint from payload", () => {
  const tag = mapApprovalCardTag(baseItem({ actionKey: "custom", payload: { discountType: "seasonal" } }));
  assert.match(tag, /İndirim/i);
});
