import assert from "node:assert/strict";
import test from "node:test";
import {
  APPROVAL_API_PATHS,
  buildApprovalRejectBody,
  getApprovalStatusBadge,
  mapApprovalClientError,
  shouldShowEmptyState
} from "../api/approval-client";

test("approval client endpoint paths are correct", () => {
  assert.equal(APPROVAL_API_PATHS.list, "/platform/approvals");
  assert.equal(APPROVAL_API_PATHS.detail("apr_1"), "/platform/approvals/apr_1");
  assert.equal(APPROVAL_API_PATHS.approve("apr_1"), "/platform/approvals/apr_1/approve");
  assert.equal(APPROVAL_API_PATHS.reject("apr_1"), "/platform/approvals/apr_1/reject");
  assert.equal(APPROVAL_API_PATHS.workerHealth, "/worker/health");
});

test("approve/reject request body mapping is correct", () => {
  assert.deepEqual(buildApprovalRejectBody("  risk too high  "), { reason: "risk too high" });
  assert.deepEqual(buildApprovalRejectBody("   "), {});
});

test("401/403/503 error mapping is explicit", () => {
  assert.equal(mapApprovalClientError(401).kind, "unauthorized");
  assert.equal(mapApprovalClientError(403).kind, "forbidden");
  assert.equal(mapApprovalClientError(503).kind, "unsupported");
});

test("approval status badge mapper returns readable labels", () => {
  assert.equal(getApprovalStatusBadge("pending").label, "Bekliyor");
  assert.equal(getApprovalStatusBadge("approved").label, "Onaylandi");
});

test("empty state helper only applies when there is no error and no items", () => {
  assert.equal(shouldShowEmptyState([], null), true);
  assert.equal(shouldShowEmptyState([], { kind: "unsupported", message: "x" }), false);
  assert.equal(shouldShowEmptyState([{ approvalRequestId: "a" } as never], null), false);
});
