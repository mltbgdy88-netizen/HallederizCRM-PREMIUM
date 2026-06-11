import assert from "node:assert/strict";
import test from "node:test";
import {
  MSG_SUBMIT_DRAFT_READY,
  MSG_SUBMIT_NOT_LIVE,
  MSG_SUBMIT_QUEUED,
  MSG_SUBMIT_SENT_FOR_APPROVAL
} from "../data/quick-operation-messages";
import {
  mapSubmitActionError,
  resolveSubmitFeedback,
  sanitizeSubmitUserText
} from "../utils/quick-operation-submit-feedback";

test("sanitizeSubmitUserText replaces false success wording", () => {
  assert.equal(sanitizeSubmitUserText("Teklif olusturuldu"), "Teklif hazırlandı");
});

test("mapSubmitActionError hides technical and offline terms", () => {
  assert.equal(
    mapSubmitActionError(Object.assign(new Error("dispatcher failed in outbox worker"), { status: 503 })),
    MSG_SUBMIT_NOT_LIVE
  );
  assert.equal(mapSubmitActionError(new TypeError("Failed to fetch")), MSG_SUBMIT_NOT_LIVE);
});

test("resolveSubmitFeedback does not claim live record in demo mode", () => {
  const feedback = resolveSubmitFeedback(
    {
      ok: true,
      operationType: "offer",
      draftId: "draft_1",
      createdEntityType: "offer",
      createdEntityId: "offer_1",
      createdEntityNo: "TKL-1",
      workflowImpacts: [],
      documentIds: [],
      auditEventIds: [],
      mode: "executed"
    },
    { useDemoData: true, operationType: "offer" }
  );
  assert.match(feedback.notice, new RegExp(MSG_SUBMIT_DRAFT_READY));
  assert.equal(feedback.showApprovalsLink, false);
});

test("resolveSubmitFeedback points to approvals when production foundation", () => {
  const feedback = resolveSubmitFeedback(
    {
      ok: true,
      operationType: "sale_order",
      draftId: "draft_1",
      workflowImpacts: [],
      documentIds: [],
      auditEventIds: [],
      mode: "foundation"
    },
    { useDemoData: false, operationType: "sale_order" }
  );
  assert.equal(feedback.showApprovalsLink, true);
  assert.equal(feedback.approvalsHref, "/onaylar");
  assert.match(feedback.toast, new RegExp(MSG_SUBMIT_SENT_FOR_APPROVAL));
  assert.match(feedback.notice, new RegExp(MSG_SUBMIT_QUEUED));
});

test("resolveSubmitFeedback treats demoPreviewOnly as preview-only", () => {
  const feedback = resolveSubmitFeedback(
    {
      ok: false,
      demoPreviewOnly: true,
      operationType: "offer",
      draftId: "draft_demo",
      workflowImpacts: [],
      documentIds: [],
      auditEventIds: [],
      mode: "foundation_blocked"
    },
    { useDemoData: false, operationType: "offer" }
  );
  assert.match(feedback.notice, new RegExp(MSG_SUBMIT_DRAFT_READY));
  assert.equal(feedback.showApprovalsLink, false);
});

test("resolveSubmitFeedback links approval detail when approvalId present", () => {
  const feedback = resolveSubmitFeedback(
    {
      ok: true,
      operationType: "offer",
      approvalId: "apr_live_1",
      workflowImpacts: [],
      documentIds: [],
      auditEventIds: [],
      mode: "queued_for_approval"
    },
    { useDemoData: false, operationType: "offer" }
  );
  assert.equal(feedback.approvalsHref, "/onaylar/apr_live_1");
});

test("resolveSubmitFeedback links entity detail when executed", () => {
  const feedback = resolveSubmitFeedback(
    {
      ok: true,
      operationType: "payment",
      createdEntityType: "payment",
      createdEntityId: "pay_99",
      createdEntityNo: "TAH-99",
      workflowImpacts: [],
      documentIds: [],
      auditEventIds: [],
      mode: "executed"
    },
    { useDemoData: false, operationType: "payment" }
  );
  assert.equal(feedback.detailHref, "/tahsilatlar/pay_99");
  assert.equal(feedback.detailLabel, "Tahsilat detayına git");
});
