import assert from "node:assert/strict";
import test from "node:test";
import {
  buildActiveFilterSummary,
  canApproveApproval,
  canRejectApproval,
  computeInboxStats,
  describeApprovalActionDisabledReason,
  filterInboxItems,
  isApprovalActionAvailable,
  isSandboxAvailable,
  mapApprovalUiErrorMessage,
  normalizeApproval,
  searchInboxItems,
  sortInboxItems,
  summarizeGateDecision,
  validateRejectReason
} from "../utils/inbox-helpers";
import type { ApprovalInboxItem } from "../types";

const SAMPLE: ApprovalInboxItem[] = [
  {
    approvalRequestId: "apr_older",
    tenantId: "tenant_1",
    actorId: "user_a",
    actionKey: "create_payment",
    status: "pending",
    reasons: ["risk high"],
    idempotencyKey: "idem_1",
    requestedAt: "2026-05-10T10:00:00.000Z",
    createdAt: "2026-05-10T10:00:00.000Z",
    updatedAt: "2026-05-10T10:00:00.000Z",
    auditRequired: true,
    timelineRequired: false
  },
  {
    approvalRequestId: "apr_newer",
    tenantId: "tenant_1",
    actorId: "user_b",
    actionKey: "create_order",
    status: "approved",
    reasons: ["policy ok"],
    idempotencyKey: "idem_2",
    requestedAt: "2026-05-12T10:00:00.000Z",
    createdAt: "2026-05-12T10:00:00.000Z",
    updatedAt: "2026-05-12T10:00:00.000Z",
    auditRequired: false,
    timelineRequired: true
  }
];

test("status filter helper keeps only matching approvals", () => {
  assert.equal(filterInboxItems(SAMPLE, "pending").length, 1);
  assert.equal(filterInboxItems(SAMPLE, "all").length, 2);
});

test("search helper matches approvalRequestId actionKey and reasons", () => {
  assert.equal(searchInboxItems(SAMPLE, "apr_newer").length, 1);
  assert.equal(searchInboxItems(SAMPLE, "create_payment").length, 1);
  assert.equal(searchInboxItems(SAMPLE, "risk high").length, 1);
});

test("sort helper orders newest oldest and actionKey", () => {
  assert.equal(sortInboxItems(SAMPLE, "newest")[0]?.approvalRequestId, "apr_newer");
  assert.equal(sortInboxItems(SAMPLE, "oldest")[0]?.approvalRequestId, "apr_older");
  assert.equal(sortInboxItems(SAMPLE, "actionKey")[0]?.actionKey, "create_order");
});

test("action availability helper disables non-pending approvals", () => {
  assert.equal(isApprovalActionAvailable(SAMPLE[0]), true);
  assert.equal(isApprovalActionAvailable(SAMPLE[1]), false);
});

test("error message mapper returns readable auth and runtime messages", () => {
  assert.match(mapApprovalUiErrorMessage({ kind: "forbidden", message: "x" }), /403|yetki/i);
  assert.match(mapApprovalUiErrorMessage({ kind: "unsupported", message: "foundation unavailable" }), /503|foundation|kullanılamıyor|kullanilamiyor/i);
  assert.match(mapApprovalUiErrorMessage({ kind: "network", message: "x" }), /Bağlantı|baglanti|Ag/i);
  assert.match(mapApprovalUiErrorMessage({ kind: "conflict", message: "cakisma" }), /409|çakışma|cakisma|işlendi/i);
  assert.match(mapApprovalUiErrorMessage({ kind: "invalid_request", message: "neden" }), /400|geçersiz|neden|Zorunlu/i);
});

test("reject reason validation requires non-empty text", () => {
  assert.equal(validateRejectReason("  "), "Reddetme nedeni yazin.");
  assert.equal(validateRejectReason("policy breach"), null);
});

test("stats and filter summary helpers use live list data", () => {
  const stats = computeInboxStats(SAMPLE);
  assert.equal(stats.total, 2);
  assert.equal(stats.pending, 1);
  assert.match(
    buildActiveFilterSummary({ filter: "pending", query: "apr", sort: "newest", visibleCount: 1, totalCount: 2 }),
    /pending/
  );
});

test("normalizeApproval keeps valid API rows and drops malformed", () => {
  const row = normalizeApproval({
    approvalRequestId: "apr_x",
    tenantId: "t1",
    actorId: "u1",
    actionKey: "platform.settings.update",
    status: "pending",
    reasons: ["r1"],
    idempotencyKey: "idem_x",
    requestedAt: "2026-05-12T10:00:00.000Z",
    createdAt: "2026-05-12T10:00:00.000Z",
    updatedAt: "2026-05-12T10:00:00.000Z",
    auditRequired: true,
    timelineRequired: true
  });
  assert.ok(row);
  assert.equal(row?.approvalRequestId, "apr_x");
  assert.equal(normalizeApproval({ status: "pending" }), null);
});

test("canApprove and canReject helpers align with pending policy", () => {
  assert.equal(canApproveApproval(SAMPLE[0]), true);
  assert.equal(canApproveApproval(SAMPLE[1]), false);
  assert.equal(canRejectApproval(SAMPLE[0], "").ok, false);
  assert.equal(canRejectApproval(SAMPLE[0], "x").ok, true);
});

test("summarizeGateDecision renders key gate fields", () => {
  assert.match(summarizeGateDecision({ allowed: false, mode: "dry_run", blockers: ["external_write_forbidden"], reasons: ["r"] }), /external_write_forbidden/);
});

test("isSandboxAvailable respects production build flag", () => {
  assert.equal(isSandboxAvailable({ sandboxSeedAvailable: true } as never, "production"), false);
  assert.equal(isSandboxAvailable({ sandboxSeedAvailable: true } as never, "development"), true);
});

test("describeApprovalActionDisabledReason explains non-pending and empty selection", () => {
  assert.match(describeApprovalActionDisabledReason(null) ?? "", /secin/i);
  assert.match(describeApprovalActionDisabledReason(SAMPLE[1]) ?? "", /Onaylandi|bekleyen/i);
  assert.equal(describeApprovalActionDisabledReason(SAMPLE[0]), null);
});
