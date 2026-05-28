import assert from "node:assert/strict";
import test from "node:test";
import {
  MSG_APPROVAL_PREVIEW_NO_EXECUTE,
  MSG_APPROVAL_PROCESS_DONE,
  MSG_APPROVAL_QUEUED
} from "../data/approval-action-messages";
import {
  mapApprovalActionError,
  resolveApprovalEntityLink,
  resolveExecuteFeedback
} from "../utils/approval-action-feedback";

test("mapApprovalActionError hides technical terms", () => {
  const message = mapApprovalActionError(
    Object.assign(new Error("dispatcher failed in outbox worker"), { status: 503 })
  );
  assert.equal(message, MSG_APPROVAL_QUEUED);
});

test("mapApprovalActionError maps offline fetch to safe copy", () => {
  assert.equal(mapApprovalActionError(new TypeError("Failed to fetch")), MSG_APPROVAL_QUEUED);
});

test("resolveExecuteFeedback does not claim done in demo mode", () => {
  const feedback = resolveExecuteFeedback(
    {
      approval: {
        id: "apr_1",
        status: "executed"
      } as never,
      execution: { status: "executed" }
    },
    { useDemoData: true }
  );
  assert.equal(feedback.message, MSG_APPROVAL_PREVIEW_NO_EXECUTE);
});

test("resolveExecuteFeedback reports queue when not executed", () => {
  const feedback = resolveExecuteFeedback(
    {
      approval: {
        id: "apr_1",
        status: "approved",
        entityType: "order",
        entityId: "ord_1",
        execution: { executable: true }
      } as never,
      execution: { status: "authorized" }
    },
    { useDemoData: false }
  );
  assert.equal(feedback.message, MSG_APPROVAL_QUEUED);
  assert.equal(feedback.detailHref, "/siparisler/ord_1");
});

test("resolveExecuteFeedback reports done only when executed", () => {
  const feedback = resolveExecuteFeedback(
    {
      approval: {
        id: "apr_1",
        status: "executed",
        entityType: "offer",
        entityId: "off_1",
        execution: { executable: true, result: "ok" }
      } as never,
      execution: { status: "executed" }
    },
    { useDemoData: false }
  );
  assert.equal(feedback.message, MSG_APPROVAL_PROCESS_DONE);
  assert.equal(feedback.detailHref, "/teklifler/off_1");
});

test("resolveApprovalEntityLink maps entity routes", () => {
  const link = resolveApprovalEntityLink({
    id: "apr_x",
    entityType: "payment",
    entityId: "pay_1",
    entityNo: "TAH-1"
  } as never);
  assert.equal(link.href, "/tahsilatlar/pay_1");
});
