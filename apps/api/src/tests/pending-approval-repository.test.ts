import assert from "node:assert/strict";
import test from "node:test";
import {
  InMemoryPendingApprovalRepository,
  type PendingApprovalRepository
} from "@hallederiz/domain";
import { enforcePolicyDecision } from "../shared/policy-bridge";

function createInput(overrides?: Partial<Parameters<PendingApprovalRepository["createPendingApprovalRequest"]>[0]>) {
  return {
    tenantId: "tenant_1",
    actorId: "user_1",
    actionKey: "platform.users.create",
    reasons: ["critical_mutation_requires_approval"],
    ...overrides
  };
}

test("pending approval repository export and create/get/list are tenant scoped", () => {
  const repository = new InMemoryPendingApprovalRepository();
  const created = repository.createPendingApprovalRequest(createInput());

  assert.ok(created.approvalRequestId.length > 0);
  assert.equal(created.tenantId, "tenant_1");
  assert.equal(created.actorId, "user_1");
  assert.equal(created.actionKey, "platform.users.create");
  assert.equal(repository.listPendingApprovalRequests("tenant_1").length, 1);
  assert.equal(repository.listPendingApprovalRequests("tenant_other").length, 0);
  assert.equal(repository.getPendingApprovalRequest(created.approvalRequestId, "tenant_1")?.approvalRequestId, created.approvalRequestId);
  assert.equal(repository.getPendingApprovalRequest(created.approvalRequestId, "tenant_other"), undefined);
});

test("pending approval duplicate idempotency returns existing request", () => {
  const repository = new InMemoryPendingApprovalRepository();
  const first = repository.createPendingApprovalRequest(createInput({ idempotencyKey: "idem_1" }));
  const second = repository.createPendingApprovalRequest(createInput({ idempotencyKey: "idem_1" }));

  assert.equal(first.approvalRequestId, second.approvalRequestId);
  assert.equal(repository.listApprovalRequests("tenant_1").length, 1);
});

test("pending approval state transitions enforce approve/reject guards", () => {
  const repository = new InMemoryPendingApprovalRepository();
  const first = repository.createPendingApprovalRequest(createInput({ idempotencyKey: "idem_approve" }));
  const approved = repository.markPendingApprovalApproved({
    approvalRequestId: first.approvalRequestId,
    tenantId: "tenant_1",
    approvedBy: "user_admin"
  });
  assert.equal(approved.ok, true);
  assert.equal(approved.ok ? approved.item.status : "", "approved");
  assert.equal(approved.ok ? approved.item.approvedBy : "", "user_admin");

  const rejectApproved = repository.markPendingApprovalRejected({
    approvalRequestId: first.approvalRequestId,
    tenantId: "tenant_1",
    rejectedBy: "user_admin",
    reason: "too_late"
  });
  assert.equal(rejectApproved.ok, false);
  assert.equal(rejectApproved.ok ? "" : rejectApproved.reason, "approval_already_approved");

  const second = repository.createPendingApprovalRequest(createInput({ idempotencyKey: "idem_reject" }));
  const rejected = repository.markPendingApprovalRejected({
    approvalRequestId: second.approvalRequestId,
    tenantId: "tenant_1",
    rejectedBy: "user_admin",
    reason: "manual_review_failed"
  });
  assert.equal(rejected.ok, true);
  assert.equal(rejected.ok ? rejected.item.status : "", "rejected");
  assert.equal(rejected.ok ? rejected.item.rejectReason : "", "manual_review_failed");

  const approveRejected = repository.markPendingApprovalApproved({
    approvalRequestId: second.approvalRequestId,
    tenantId: "tenant_1",
    approvedBy: "user_admin"
  });
  assert.equal(approveRejected.ok, false);
  assert.equal(approveRejected.ok ? "" : approveRejected.reason, "approval_already_rejected");
});

test("policy bridge require_approval persists when repository exists", async () => {
  const repository = new InMemoryPendingApprovalRepository();
  const result = await enforcePolicyDecision(
    {
      decision: "require_approval",
      actionKey: "platform.users.create",
      reasons: ["critical_mutation_requires_approval"]
    },
    {
      tenantId: "tenant_1",
      userId: "user_1",
      persistenceMode: "demo"
    },
    {
      pendingApprovalRepository: repository
    }
  );

  assert.equal(result.handled, true);
  if (!result.handled) return;
  assert.equal(result.statusCode, 202);
  assert.equal(result.body.policyDecision, "require_approval");
  assert.equal(result.body.approvalPersistenceSkipped, false);
  const approvalRequestId = String(result.body.approvalRequestId);
  const saved = repository.getPendingApprovalRequest(approvalRequestId, "tenant_1");
  assert.ok(saved);
});

test("policy bridge require_approval with no repository marks persistence skipped", async () => {
  const result = await enforcePolicyDecision(
    {
      decision: "require_approval",
      actionKey: "platform.users.create",
      reasons: ["critical_mutation_requires_approval"]
    },
    {
      tenantId: "tenant_1",
      userId: "user_1",
      persistenceMode: "demo"
    },
    {
      pendingApprovalRepository: null
    }
  );

  assert.equal(result.handled, true);
  if (!result.handled) return;
  assert.equal(result.statusCode, 503);
  assert.equal(result.body.approvalPersistenceSkipped, true);
  assert.equal(result.body.persistenceMode, "none");
});

test("policy bridge repository failure does not fail-open", async () => {
  const failingRepository: PendingApprovalRepository = {
    createPendingApprovalRequest: () => {
      throw new Error("repository_unavailable");
    },
    getPendingApprovalRequest: () => undefined,
    listPendingApprovalRequests: () => [],
    listApprovalRequests: () => [],
    markPendingApprovalApproved: () => ({ ok: false, reason: "unsupported" }),
    markPendingApprovalRejected: () => ({ ok: false, reason: "unsupported" }),
    findByIdempotencyKey: () => undefined,
    reset: () => {}
  };

  const result = await enforcePolicyDecision(
    {
      decision: "require_approval",
      actionKey: "platform.users.create",
      reasons: ["critical_mutation_requires_approval"]
    },
    {
      tenantId: "tenant_1",
      userId: "user_1",
      persistenceMode: "demo"
    },
    {
      pendingApprovalRepository: failingRepository
    }
  );

  assert.equal(result.handled, true);
  if (!result.handled) return;
  assert.equal(result.statusCode, 503);
  assert.equal(result.body.ok, false);
  assert.equal(result.body.policyDecision, "require_approval");
});
