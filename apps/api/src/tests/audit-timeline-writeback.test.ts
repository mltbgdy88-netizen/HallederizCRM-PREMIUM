import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAuditTimelineWritebackPayload,
  validateAuditTimelineWritebackPayload,
  writeBackAuditTimelineDrafts,
  type ApprovalExecutionLogRepository
} from "@hallederiz/domain";

class FakeApprovalExecutionRepository implements ApprovalExecutionLogRepository {
  public failAudit = false;
  public failTimeline = false;

  saveExecutionLog(entry: any) {
    return entry;
  }

  saveAuditEventDraft(event: any) {
    if (this.failAudit) {
      throw new Error("audit_write_failed");
    }
    return {
      ...event,
      eventId: event.eventId ?? `audit_${event.payload.executionId}`
    };
  }

  saveTimelineEventDraft(event: any) {
    if (this.failTimeline) {
      throw new Error("timeline_write_failed");
    }
    return {
      ...event,
      eventId: event.eventId ?? `timeline_${event.payload.executionId}`
    };
  }

  findByIdempotencyKey() {
    return undefined;
  }

  getExecutionLog() {
    return undefined;
  }
}

function payloadFixture() {
  return buildAuditTimelineWritebackPayload({
    tenantId: "tenant_1",
    actionKey: "platform.users.create",
    approvalRequestId: "apr_1",
    executionId: "exec_1",
    idempotencyKey: "idem_1",
    auditEvent: {
      eventKey: "approval.execution.audit",
      eventId: "audit_exec_1",
      createdAt: "2026-05-13T08:00:00.000Z",
      payload: {
        tenantId: "tenant_1",
        actionKey: "platform.users.create",
        approvalRequestId: "apr_1",
        executionId: "exec_1",
        status: "executed",
        idempotencyKey: "idem_1",
        handlerKey: "handler.platform.users.create",
        handlerMode: "dry_run",
        reasons: ["bridge_dispatched"]
      }
    },
    timelineEvent: {
      eventKey: "approval.execution.timeline",
      eventId: "timeline_exec_1",
      createdAt: "2026-05-13T08:00:00.000Z",
      payload: {
        tenantId: "tenant_1",
        actionKey: "platform.users.create",
        approvalRequestId: "apr_1",
        executionId: "exec_1",
        status: "executed",
        idempotencyKey: "idem_1",
        handlerKey: "handler.platform.users.create",
        handlerMode: "dry_run",
        reasons: ["bridge_dispatched"]
      }
    }
  });
}

test("audit/timeline writeback exports are callable", () => {
  assert.equal(typeof buildAuditTimelineWritebackPayload, "function");
  assert.equal(typeof validateAuditTimelineWritebackPayload, "function");
  assert.equal(typeof writeBackAuditTimelineDrafts, "function");
});

test("valid payload writes back audit/timeline drafts", () => {
  const repository = new FakeApprovalExecutionRepository();
  const payload = payloadFixture();
  const result = writeBackAuditTimelineDrafts(payload, {
    repository,
    mode: "direct"
  });

  assert.equal(result.ok, true);
  assert.equal(result.auditPersisted, true);
  assert.equal(result.timelinePersisted, true);
  assert.equal(result.auditEventId, "audit_exec_1");
  assert.equal(result.timelineEventId, "timeline_exec_1");
  assert.equal(result.persistenceMode, "repository");
});

test("missing tenant/execution/action fails validation", () => {
  const payload = buildAuditTimelineWritebackPayload({
    tenantId: "",
    actionKey: "",
    approvalRequestId: "apr_1",
    executionId: "",
    auditEvent: undefined,
    timelineEvent: undefined
  });
  const validation = validateAuditTimelineWritebackPayload(payload);
  assert.equal(validation.ok, false);
  assert.equal(validation.reasons.includes("missing_tenant_id"), true);
  assert.equal(validation.reasons.includes("missing_execution_id"), true);
  assert.equal(validation.reasons.includes("missing_action_key"), true);
});

test("missing repository never fail-opens", () => {
  const payload = payloadFixture();
  const result = writeBackAuditTimelineDrafts(payload, {
    repository: null,
    mode: "foundation"
  });
  assert.equal(result.ok, false);
  assert.equal(result.persistenceMode, "unsupported");
  assert.equal(result.auditPersisted, false);
  assert.equal(result.timelinePersisted, false);
});

test("partial writeback failure is not reported as success", () => {
  const repository = new FakeApprovalExecutionRepository();
  repository.failTimeline = true;
  const payload = payloadFixture();
  const result = writeBackAuditTimelineDrafts(payload, {
    repository,
    mode: "direct"
  });
  assert.equal(result.ok, false);
  assert.equal(result.auditPersisted, true);
  assert.equal(result.timelinePersisted, false);
  assert.equal(result.reasons.includes("audit_timeline_writeback_failed"), true);
});
