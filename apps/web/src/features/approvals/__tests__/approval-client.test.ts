import assert from "node:assert/strict";
import test from "node:test";
import {
  APPROVAL_API_PATHS,
  buildApprovalRejectBody,
  getApprovalStatusBadge,
  joinApprovalApiUrl,
  mapApprovalClientError,
  shouldShowEmptyState
} from "../api/approval-client";

test("approval client endpoint paths are correct", () => {
  assert.equal(APPROVAL_API_PATHS.list, "/platform/approvals");
  assert.equal(APPROVAL_API_PATHS.detail("apr_1"), "/platform/approvals/apr_1");
  assert.equal(APPROVAL_API_PATHS.approve("apr_1"), "/platform/approvals/apr_1/approve");
  assert.equal(APPROVAL_API_PATHS.reject("apr_1"), "/platform/approvals/apr_1/reject");
  assert.equal(APPROVAL_API_PATHS.workerHealth, "/worker/health");
  assert.equal(APPROVAL_API_PATHS.workerSafety, "/worker/safety");
});

test("approval client joins api base url without duplicate slashes", () => {
  assert.equal(joinApprovalApiUrl("http://localhost:4000", "/platform/approvals"), "http://localhost:4000/platform/approvals");
  assert.equal(joinApprovalApiUrl("http://localhost:4000/", "/platform/approvals"), "http://localhost:4000/platform/approvals");
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

test("404/503 error mapping does not fake success", () => {
  const list404 = mapApprovalClientError(404, undefined, "approvals_list");
  assert.equal(list404.kind, "not_found");
  assert.match(list404.message, /endpoint bu ortamda yayinlanmiyor/i);

  const worker404 = mapApprovalClientError(404, undefined, "worker_health");
  assert.equal(worker404.kind, "not_found");
  assert.match(worker404.message, /Worker health\/safety endpoint/i);

  const list503 = mapApprovalClientError(503, undefined, "approvals_list");
  assert.equal(list503.kind, "unsupported");
  assert.match(list503.message, /foundation modu hazir degil/i);
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
