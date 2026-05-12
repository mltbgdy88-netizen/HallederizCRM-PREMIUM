import assert from "node:assert/strict";
import test from "node:test";
import type { ApprovalInboxItem } from "../types";
import {
  buildLastApprovalActionSummary,
  buildOperatorSmokeChecklist,
  formatSandboxSeedOutcome,
  summarizeOperatorSmokeResult,
  type OperatorSmokeStepId
} from "../utils/operator-smoke";

const BASE_ITEM: ApprovalInboxItem = {
  approvalRequestId: "apr_1",
  tenantId: "t1",
  actorId: "a1",
  actionKey: "create_order",
  status: "pending",
  reasons: [],
  idempotencyKey: "k1",
  requestedAt: "2026-05-12T10:00:00.000Z",
  createdAt: "2026-05-12T10:00:00.000Z",
  updatedAt: "2026-05-12T10:00:00.000Z",
  auditRequired: true,
  timelineRequired: true
};

function ids(steps: { id: OperatorSmokeStepId }[]): OperatorSmokeStepId[] {
  return steps.map((s) => s.id);
}

test("buildOperatorSmokeChecklist returns all contract step ids in order", () => {
  const steps = buildOperatorSmokeChecklist({
    nodeEnv: "development",
    listLoading: false,
    listError: null,
    items: [BASE_ITEM],
    detailLoading: false,
    detailError: null,
    selectedId: "apr_1",
    detail: BASE_ITEM,
    sandboxAvailability: { sandboxSeedAvailable: true, sandboxSeedRouteEnabled: true, approvalRepositoryReady: true },
    workerHealth: { ok: true, health: { ok: true, mode: "foundation", workerId: "w1", persistenceMode: "memory" } },
    workerSafety: { ok: true, providerWritesEnabled: false, realExecutionEnabled: false },
    lastSeedCounts: { created: 1, skipped: 0 },
    lastApproveOk: true,
    lastApproveHadBridgeSignal: true
  });
  assert.deepEqual(ids(steps), [
    "routeAvailable",
    "sandboxAvailable",
    "seedCreatedPendingApprovals",
    "listShowsPendingApproval",
    "approvalDetailLoads",
    "approveReturnsExecutionMetadata",
    "rejectRequiresReason",
    "workerHealthAvailable",
    "noApiPath404",
    "providerWritesDisabled",
    "realUserCreateDisabled"
  ]);
});

test("summarizeOperatorSmokeResult: success when no fail or warn", () => {
  const steps = [
    { id: "routeAvailable" as const, label: "a", status: "ok" as const },
    { id: "sandboxAvailable" as const, label: "b", status: "skipped" as const }
  ];
  const s = summarizeOperatorSmokeResult(steps);
  assert.equal(s.overall, "success");
  assert.equal(s.failCount, 0);
  assert.equal(s.warningCount, 0);
});

test("summarizeOperatorSmokeResult: blocked on any fail", () => {
  const s = summarizeOperatorSmokeResult([
    { id: "routeAvailable" as const, label: "a", status: "ok" as const },
    { id: "noApiPath404" as const, label: "b", status: "fail" as const }
  ]);
  assert.equal(s.overall, "blocked");
});

test("summarizeOperatorSmokeResult: partial on warning only", () => {
  const s = summarizeOperatorSmokeResult([{ id: "routeAvailable" as const, label: "a", status: "warning" as const }]);
  assert.equal(s.overall, "partial");
});

test("formatSandboxSeedOutcome: idempotent-only is safe info tone, not error wording", () => {
  const r = formatSandboxSeedOutcome(0, 2);
  assert.equal(r.tone, "idempotent");
  assert.match(r.message, /idempotent/i);
  assert.match(r.message, /hata degil/i);
});

test("buildOperatorSmokeChecklist: idempotent seed (0 created, N skipped) is ok not warning", () => {
  const steps = buildOperatorSmokeChecklist({
    nodeEnv: "development",
    listLoading: false,
    listError: null,
    items: [BASE_ITEM],
    detailLoading: false,
    detailError: null,
    selectedId: "apr_1",
    detail: BASE_ITEM,
    sandboxAvailability: { sandboxSeedAvailable: true, sandboxSeedRouteEnabled: true, approvalRepositoryReady: true },
    workerHealth: { ok: true, health: { ok: true, mode: "foundation", workerId: "w1", persistenceMode: "memory" } },
    workerSafety: { ok: true, providerWritesEnabled: false, realExecutionEnabled: false },
    lastSeedCounts: { created: 0, skipped: 2 },
    lastApproveOk: false,
    lastApproveHadBridgeSignal: false
  });
  const seedStep = steps.find((x) => x.id === "seedCreatedPendingApprovals");
  assert.equal(seedStep?.status, "ok");
});

test("buildLastApprovalActionSummary includes executionId outboxJobId and gate line", () => {
  const summary = buildLastApprovalActionSummary(
    {
      executionId: "exec_1",
      outboxJobId: "job_1",
      bridgeMode: "foundation",
      gateDecision: { allowed: true, mode: "dry_run" },
      auditTimelineWritebackQueued: true
    },
    "2026-05-12T12:00:00.000Z"
  );
  assert.equal(summary.executionId, "exec_1");
  assert.equal(summary.outboxJobId, "job_1");
  assert.match(summary.gateLine, /allowed=true/);
  assert.equal(summary.auditTimelineWritebackQueued, true);
});

test("buildLastApprovalActionSummary duplicate flag preserved", () => {
  const summary = buildLastApprovalActionSummary({ duplicate: true, executionId: "e" }, "2026-05-12T12:00:00.000Z");
  assert.equal(summary.duplicate, true);
});

test("production skips sandbox steps without fake success", () => {
  const steps = buildOperatorSmokeChecklist({
    nodeEnv: "production",
    listLoading: false,
    listError: null,
    items: [],
    detailLoading: false,
    detailError: null,
    selectedId: null,
    detail: null,
    sandboxAvailability: null,
    workerHealth: null,
    workerSafety: null,
    lastSeedCounts: null,
    lastApproveOk: false,
    lastApproveHadBridgeSignal: false
  });
  const sandbox = steps.find((s) => s.id === "sandboxAvailable");
  assert.equal(sandbox?.status, "skipped");
});
