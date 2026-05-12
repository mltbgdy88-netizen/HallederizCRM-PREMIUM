import type { ActionExecutionHandlerSafetyChecklist, ActionExecutionMode } from "./handler-registry";

export interface ExecutionGateContext {
  tenantId: string;
  actionKey: string;
  approvalRequestId?: string;
  executionId?: string;
  actorId?: string;
  approverId?: string;
  mode: ActionExecutionMode;
  handlerSafetyChecklist: ActionExecutionHandlerSafetyChecklist;
  idempotencyKey?: string;
  auditRequired: boolean;
  timelineRequired: boolean;
  auditMetadataPresent?: boolean;
  timelineMetadataPresent?: boolean;
  realExecutionEnabled?: boolean;
  allowlist?: readonly string[];
  environment?: "production" | "staging" | "development" | "test" | "foundation";
}

export interface ExecutionGateDecision {
  allowed: boolean;
  mode: ActionExecutionMode;
  actionKey: string;
  reasons: string[];
  blockers: string[];
  requiredAudit: boolean;
  requiredTimeline: boolean;
  idempotencyRequired: boolean;
  mutationAllowed: boolean;
  externalWriteAllowed: boolean;
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function buildExecutionGateContext(input: ExecutionGateContext): ExecutionGateContext {
  return {
    ...input,
    allowlist: input.allowlist ?? [],
    environment: input.environment ?? "foundation",
    realExecutionEnabled: input.realExecutionEnabled ?? input.handlerSafetyChecklist.realExecutionEnabled,
    auditMetadataPresent: input.auditMetadataPresent ?? false,
    timelineMetadataPresent: input.timelineMetadataPresent ?? false
  };
}

export function evaluateExecutionGate(input: ExecutionGateContext): ExecutionGateDecision {
  const context = buildExecutionGateContext(input);
  const reasons: string[] = [];
  const blockers: string[] = [];
  const idempotencyRequired = context.mode === "execute" || context.handlerSafetyChecklist.idempotencyRequired;
  const allowlist = context.allowlist ?? [];

  if (!hasText(context.tenantId)) blockers.push("missing_tenant_id");
  if (!hasText(context.actionKey)) blockers.push("missing_action_key");

  if (context.mode !== "execute") {
    reasons.push("dry_run_or_noop_execution_gate_allowed");
    return {
      allowed: blockers.length === 0,
      mode: context.mode,
      actionKey: context.actionKey,
      reasons,
      blockers,
      requiredAudit: context.auditRequired || context.handlerSafetyChecklist.auditRequired,
      requiredTimeline: context.timelineRequired || context.handlerSafetyChecklist.timelineRequired,
      idempotencyRequired,
      mutationAllowed: false,
      externalWriteAllowed: false
    };
  }

  if (!context.realExecutionEnabled) blockers.push("real_execution_disabled");
  if (context.handlerSafetyChecklist.dryRunOnly) blockers.push("handler_dry_run_only");
  if (!allowlist.includes(context.actionKey)) blockers.push("action_not_in_real_execution_allowlist");
  if (context.handlerSafetyChecklist.requiresApproval && !hasText(context.approvalRequestId)) {
    blockers.push("missing_approval_request_id");
  }
  if (idempotencyRequired && !hasText(context.idempotencyKey)) {
    blockers.push("missing_idempotency_key");
  }

  const requiredAudit = context.auditRequired || context.handlerSafetyChecklist.auditRequired;
  const requiredTimeline = context.timelineRequired || context.handlerSafetyChecklist.timelineRequired;
  if (requiredAudit && !context.auditMetadataPresent) blockers.push("missing_audit_metadata");
  if (requiredTimeline && !context.timelineMetadataPresent) blockers.push("missing_timeline_metadata");
  if (context.handlerSafetyChecklist.externalWrite) blockers.push("external_write_forbidden");

  if (blockers.length === 0) {
    reasons.push("controlled_real_execution_gate_allowed");
  }

  return {
    allowed: blockers.length === 0,
    mode: "execute",
    actionKey: context.actionKey,
    reasons,
    blockers,
    requiredAudit,
    requiredTimeline,
    idempotencyRequired,
    mutationAllowed: blockers.length === 0 && context.handlerSafetyChecklist.mutatesState,
    externalWriteAllowed: false
  };
}

export function assertExecutionGate(input: ExecutionGateContext): ExecutionGateDecision {
  const decision = evaluateExecutionGate(input);
  if (!decision.allowed) {
    throw new Error(`execution_gate_blocked:${decision.blockers.join(",")}`);
  }
  return decision;
}
