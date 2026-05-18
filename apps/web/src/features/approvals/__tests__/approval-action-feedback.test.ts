import assert from "node:assert/strict";
import test from "node:test";
import { ApiError } from "@hallederiz/sdk";
import {
  MSG_APPROVAL_PREVIEW_NO_EXECUTE,
  MSG_APPROVAL_PROCESS_DONE,
  MSG_APPROVAL_QUEUE_PENDING
} from "../data/approval-action-messages";
import { mapApprovalActionError, resolveExecuteFeedback } from "../utils/approval-action-feedback";

test("mapApprovalActionError hides technical terms", () => {
  const message = mapApprovalActionError(new ApiError("dispatcher failed in outbox worker", 503));
  assert.equal(message, MSG_APPROVAL_QUEUE_PENDING);
});

test("resolveExecuteFeedback does not claim done in demo mode", () => {
  const message = resolveExecuteFeedback(
    {
      approval: {
        id: "apr_1",
        status: "executed"
      } as never,
      execution: { status: "executed" }
    },
    { useDemoData: true }
  );
  assert.equal(message, MSG_APPROVAL_PREVIEW_NO_EXECUTE);
});

test("resolveExecuteFeedback reports queue when not executed", () => {
  const message = resolveExecuteFeedback(
    {
      approval: {
        id: "apr_1",
        status: "approved",
        execution: { executable: true }
      } as never,
      execution: { status: "authorized" }
    },
    { useDemoData: false }
  );
  assert.equal(message, MSG_APPROVAL_QUEUE_PENDING);
});

test("resolveExecuteFeedback reports done only when executed", () => {
  const message = resolveExecuteFeedback(
    {
      approval: {
        id: "apr_1",
        status: "executed",
        execution: { executable: true, result: "ok" }
      } as never,
      execution: { status: "executed" }
    },
    { useDemoData: false }
  );
  assert.equal(message, MSG_APPROVAL_PROCESS_DONE);
});
