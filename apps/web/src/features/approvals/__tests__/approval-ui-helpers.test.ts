import assert from "node:assert/strict";
import test from "node:test";
import {
  buildActiveFilterSummary,
  computeInboxStats,
  filterInboxItems,
  isApprovalActionAvailable,
  mapApprovalUiErrorMessage,
  searchInboxItems,
  sortInboxItems,
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
  assert.match(mapApprovalUiErrorMessage({ kind: "forbidden", message: "x" }), /yetkiniz yok/i);
  assert.match(mapApprovalUiErrorMessage({ kind: "unsupported", message: "foundation unavailable" }), /foundation/i);
  assert.match(mapApprovalUiErrorMessage({ kind: "network", message: "x" }), /baglantisi kurulamadi/i);
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
