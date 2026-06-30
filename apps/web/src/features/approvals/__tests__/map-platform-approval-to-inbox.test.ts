import assert from "node:assert/strict";
import test from "node:test";
import { mapPlatformApprovalToInboxRecord } from "../utils/map-platform-approval-to-inbox";
import type { ApprovalInboxItem } from "../types";

const SAMPLE: ApprovalInboxItem = {
  approvalRequestId: "apr_req_2",
  tenantId: "tenant_demo",
  actorId: "user_admin",
  actionKey: "platform.offers.create",
  idempotencyKey: "idem-1",
  status: "pending",
  reasons: ["quick_operation_requires_approval"],
  payload: {
    customerName: "Demo Cari A.Ş.",
    operationType: "offer",
    totals: { grandTotal: 7080 }
  },
  requestedAt: "2026-06-29T10:00:00.000Z",
  createdAt: "2026-06-29T10:00:00.000Z",
  updatedAt: "2026-06-29T10:00:00.000Z",
  auditRequired: true,
  timelineRequired: true
};

test("mapPlatformApprovalToInboxRecord maps platform queue row to desk record", () => {
  const record = mapPlatformApprovalToInboxRecord(SAMPLE, "user_admin");
  assert.equal(record.id, "apr_req_2");
  assert.equal(record.raw.status, "pending");
  assert.equal(record.raw.policySnapshot.serverActionKey, "platform.offers.create");
  assert.match(record.raw.payloadSummary, /Demo Cari/);
  assert.equal(record.amountLabel?.includes("7"), true);
});
