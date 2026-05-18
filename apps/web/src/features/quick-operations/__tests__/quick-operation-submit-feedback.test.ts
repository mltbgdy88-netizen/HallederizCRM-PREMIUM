import assert from "node:assert/strict";
import test from "node:test";
import { ApiError } from "@hallederiz/sdk";
import {
  MSG_SUBMIT_DRAFT_READY,
  MSG_SUBMIT_NOT_LIVE,
  MSG_SUBMIT_QUEUE_PENDING
} from "../data/quick-operation-messages";
import {
  mapSubmitActionError,
  resolveSubmitFeedback,
  sanitizeSubmitUserText
} from "../utils/quick-operation-submit-feedback";

test("sanitizeSubmitUserText replaces false success wording", () => {
  assert.equal(sanitizeSubmitUserText("Teklif olusturuldu"), "Teklif hazırlandı");
});

test("mapSubmitActionError hides technical terms", () => {
  const message = mapSubmitActionError(new ApiError("dispatcher failed in outbox worker", 503));
  assert.equal(message, MSG_SUBMIT_NOT_LIVE);
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
  assert.match(feedback.toast, new RegExp(MSG_SUBMIT_QUEUE_PENDING));
});
