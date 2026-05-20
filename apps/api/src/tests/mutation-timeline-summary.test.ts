import assert from "node:assert/strict";
import test from "node:test";
import { resolveMutationTimelineSummary } from "../shared/mutation-timeline-summary";

test("mutation timeline summaries are user-facing Turkish", () => {
  const orderConfirm = resolveMutationTimelineSummary("platform.orders.confirm");
  assert.match(orderConfirm.title, /Sipariş/);
  assert.equal(orderConfirm.description.includes("mutation"), false);
  assert.equal(orderConfirm.description.includes("outbox"), false);

  const documentSend = resolveMutationTimelineSummary("platform.documents.send_whatsapp");
  assert.match(documentSend.description, /iletim/i);
});
