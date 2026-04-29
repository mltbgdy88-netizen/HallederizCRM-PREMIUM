import assert from "node:assert/strict";
import test from "node:test";
import { createSession } from "../shared/session-store";
import { buildRequestContext } from "../shared/request-context";
import { assertAuthenticated } from "../shared/auth-guards";
import { cancelApprovalExecution, getApprovalExecution, runApprovalExecution } from "../ai-local-output-store";

test("request context flags tenant mismatch when session tenant differs from header", () => {
  const login = createSession({
    tenantSlug: "hallederiz",
    email: "admin@hallederiz.com",
    password: "x"
  });

  const request = {
    headers: {
      authorization: `Bearer ${login.accessToken}`,
      "x-session-token": login.accessToken,
      "x-tenant-id": "tenant_other"
    }
  } as never;

  const context = buildRequestContext(request);
  assert.equal(context.tenantMismatch, true);
  assert.equal(context.authIssue, "tenant_mismatch");
  assert.throws(() => assertAuthenticated(context));
});

test("approval execution marks failed results with retryability suffix", () => {
  const exec = getApprovalExecution("approval_exec_1");
  assert.ok(exec);
  if (!exec) return;
  exec.operationType = "unsupported_test_action" as never;
  exec.targetId = "invalid_target_id";
  const failed = runApprovalExecution(exec.id);
  assert.ok(failed);
  assert.equal(failed?.status, "failed");
  assert.match(failed?.result?.message ?? "", /\[(RETRYABLE|NON_RETRYABLE)\]/);
});

test("approval execution cancel path sets cancelled status", () => {
  const created = getApprovalExecution("approval_exec_1");
  assert.ok(created);
  if (!created) return;
  created.status = "authorized";
  const cancelled = cancelApprovalExecution(created.id);
  assert.ok(cancelled);
  assert.equal(cancelled?.status, "cancelled");
});
