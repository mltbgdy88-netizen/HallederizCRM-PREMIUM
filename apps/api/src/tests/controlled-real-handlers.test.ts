import assert from "node:assert/strict";
import test from "node:test";
import {
  InMemoryOutboxJobRepository,
  createOutboxJob,
  createWorkerRuntimeApp,
  dispatchApprovedAction,
  evaluateExecutionGate,
  resetExecutionDispatcherState,
  resetWorkerJobHandlers
} from "@hallederiz/domain";

function requestFixture(overrides: Partial<Parameters<typeof dispatchApprovedAction>[0]> = {}) {
  return {
    tenantId: "tenant_controlled_1",
    approvalRequestId: "apr_controlled_1",
    actionKey: "platform.settings.update",
    actorId: "actor_controlled_1",
    approvedBy: "approver_controlled_1",
    payload: { settingKey: "workspace.name", value: "Controlled CRM" },
    idempotencyKey: "idem_controlled_1",
    requestedAt: "2026-05-13T08:00:00.000Z",
    approvedAt: "2026-05-13T08:01:00.000Z",
    ...overrides
  };
}

function gateChecklist(overrides = {}) {
  return {
    requiresApproval: true,
    mutatesState: true,
    externalWrite: false,
    idempotencyRequired: true,
    auditRequired: true,
    timelineRequired: true,
    dryRunOnly: false,
    realExecutionEnabled: true,
    ...overrides
  };
}

test("execution gate export allows dry_run and keeps mutation closed", () => {
  const decision = evaluateExecutionGate({
    tenantId: "tenant_controlled_1",
    actionKey: "platform.settings.update",
    approvalRequestId: "apr_controlled_1",
    executionId: "exec_controlled_1",
    actorId: "actor_controlled_1",
    approverId: "approver_controlled_1",
    mode: "dry_run",
    handlerSafetyChecklist: gateChecklist(),
    idempotencyKey: "idem_controlled_1",
    auditRequired: true,
    timelineRequired: true
  });

  assert.equal(typeof evaluateExecutionGate, "function");
  assert.equal(decision.allowed, true);
  assert.equal(decision.mutationAllowed, false);
  assert.equal(decision.externalWriteAllowed, false);
});

test("execute gate blocks missing allowlist, approval, idempotency, and audit timeline metadata", () => {
  const noAllowlist = evaluateExecutionGate({
    tenantId: "tenant_controlled_1",
    actionKey: "platform.settings.update",
    approvalRequestId: "apr_controlled_1",
    executionId: "exec_controlled_1",
    actorId: "actor_controlled_1",
    approverId: "approver_controlled_1",
    mode: "execute",
    handlerSafetyChecklist: gateChecklist(),
    idempotencyKey: "idem_controlled_1",
    auditRequired: true,
    timelineRequired: true,
    auditMetadataPresent: true,
    timelineMetadataPresent: true,
    allowlist: []
  });
  assert.equal(noAllowlist.allowed, false);
  assert.ok(noAllowlist.blockers.includes("action_not_in_real_execution_allowlist"));

  const missingApproval = evaluateExecutionGate({
    tenantId: "tenant_controlled_1",
    actionKey: "platform.settings.update",
    mode: "execute",
    handlerSafetyChecklist: gateChecklist(),
    idempotencyKey: "idem_controlled_1",
    auditRequired: true,
    timelineRequired: true,
    auditMetadataPresent: true,
    timelineMetadataPresent: true,
    allowlist: ["platform.settings.update"]
  });
  assert.ok(missingApproval.blockers.includes("missing_approval_request_id"));

  const missingIdempotency = evaluateExecutionGate({
    tenantId: "tenant_controlled_1",
    actionKey: "platform.settings.update",
    approvalRequestId: "apr_controlled_1",
    mode: "execute",
    handlerSafetyChecklist: gateChecklist(),
    auditRequired: true,
    timelineRequired: true,
    auditMetadataPresent: true,
    timelineMetadataPresent: true,
    allowlist: ["platform.settings.update"]
  });
  assert.ok(missingIdempotency.blockers.includes("missing_idempotency_key"));

  const missingMetadata = evaluateExecutionGate({
    tenantId: "tenant_controlled_1",
    actionKey: "platform.settings.update",
    approvalRequestId: "apr_controlled_1",
    mode: "execute",
    handlerSafetyChecklist: gateChecklist(),
    idempotencyKey: "idem_controlled_1",
    auditRequired: true,
    timelineRequired: true,
    allowlist: ["platform.settings.update"]
  });
  assert.ok(missingMetadata.blockers.includes("missing_audit_metadata"));
  assert.ok(missingMetadata.blockers.includes("missing_timeline_metadata"));
});

test("platform.settings.update dry_run and controlled execute never perform real mutation", () => {
  resetExecutionDispatcherState();
  const dryRun = dispatchApprovedAction(requestFixture({ idempotencyKey: "idem_settings_dry_run" }));
  assert.equal(dryRun.ok, true);
  assert.equal(dryRun.effectiveMode, "dry_run");
  assert.equal(dryRun.mutationExecuted, false);
  assert.equal(dryRun.externalProviderCallExecuted, false);

  const blocked = dispatchApprovedAction(
    requestFixture({ idempotencyKey: "idem_settings_blocked" }),
    { executionMode: "execute", auditMetadataPresent: true, timelineMetadataPresent: true }
  );
  assert.equal(blocked.ok, false);
  assert.equal(blocked.status, "blocked");
  assert.equal(blocked.mutationExecuted, false);
  assert.ok(blocked.gateDecision?.blockers.includes("action_not_in_real_execution_allowlist"));

  const controlled = dispatchApprovedAction(
    requestFixture({ idempotencyKey: "idem_settings_execute" }),
    {
      executionMode: "execute",
      executionAllowlist: ["platform.settings.update"],
      auditMetadataPresent: true,
      timelineMetadataPresent: true
    }
  );
  assert.equal(controlled.ok, true);
  assert.equal(controlled.effectiveMode, "execute");
  assert.equal(controlled.foundationControlledExecution, true);
  assert.equal(controlled.mutationExecuted, false);
  assert.equal(controlled.externalProviderCallExecuted, false);
  assert.equal(controlled.gateDecision?.allowed, true);
});

test("platform.users.create execute remains blocked and dry_run-only", () => {
  resetExecutionDispatcherState();
  const result = dispatchApprovedAction(
    requestFixture({
      actionKey: "platform.users.create",
      idempotencyKey: "idem_users_execute",
      payload: { email: "controlled@example.com" }
    }),
    {
      executionMode: "execute",
      executionAllowlist: ["platform.users.create"],
      auditMetadataPresent: true,
      timelineMetadataPresent: true,
      realExecutionEnabled: true
    }
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, "blocked");
  assert.equal(result.mutationExecuted, false);
  assert.equal(result.externalProviderCallExecuted, false);
  assert.ok(result.gateDecision?.blockers.includes("handler_dry_run_only"));
});

test("worker validates execution gate metadata on approval dispatch jobs", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  createOutboxJob(repository, {
    tenantId: "tenant_controlled_1",
    jobType: "approval.execution.dispatch",
    actionKey: "platform.settings.update",
    payload: {
      tenantId: "tenant_controlled_1",
      actionKey: "platform.settings.update",
      approvalRequestId: "apr_controlled_1",
      executionId: "exec_controlled_1",
      requestedMode: "execute",
      effectiveMode: "execute"
    },
    idempotencyKey: "idem_worker_missing_gate",
    maxAttempts: 3
  });
  const app = createWorkerRuntimeApp({ repository });
  const missingGate = app.processTick({ maxJobsPerTick: 1 });
  assert.equal(missingGate.deadLettered, 1);
  assert.equal(missingGate.results[0]?.status, "dead_letter");

  createOutboxJob(repository, {
    tenantId: "tenant_controlled_1",
    jobType: "approval.execution.dispatch",
    actionKey: "platform.settings.update",
    payload: {
      tenantId: "tenant_controlled_1",
      actionKey: "platform.settings.update",
      approvalRequestId: "apr_controlled_2",
      executionId: "exec_controlled_2",
      requestedMode: "execute",
      effectiveMode: "execute",
      gateDecision: {
        allowed: true,
        mode: "execute",
        actionKey: "platform.settings.update",
        blockers: []
      }
    },
    idempotencyKey: "idem_worker_valid_gate",
    maxAttempts: 3
  });
  const validGate = app.processTick({ maxJobsPerTick: 1 });
  const reasons = validGate.results[0]?.reasons ?? [];
  assert.equal(validGate.completed, 1);
  assert.ok(reasons.includes("execution_gate_metadata_verified"));
  assert.ok(reasons.includes("mutation_executed:false"));
  assert.ok(reasons.includes("provider_call_executed:false"));
});
