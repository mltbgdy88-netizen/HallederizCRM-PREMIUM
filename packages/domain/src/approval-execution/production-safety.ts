import { evaluateExecutionGate } from "./execution-gate";
import { getActionExecutionHandler, listActionExecutionHandlers } from "./handler-registry";

export interface ProductionSafetyCheck {
  key: string;
  ok: boolean;
  severity: "blocker" | "warning" | "info";
  message: string;
}

export interface ProductionSafetyReport {
  ok: boolean;
  mode: "foundation" | "production";
  blockers: string[];
  warnings: string[];
  checks: ProductionSafetyCheck[];
  realExecutionEnabled: boolean;
  providerWritesEnabled: boolean;
  workerAutoStartEnabled: boolean;
  approvalRuntimeMode: string;
  workerRuntimeMode: string;
  recommendedNextActions: string[];
}

export interface ProductionSafetyInput {
  mode?: "foundation" | "production";
  approvalRuntimeMode?: string;
  workerRuntimeMode?: string;
  pendingApprovalRepositoryMode?: string;
  workerRepositoryMode?: string;
  realExecutionEnabled?: boolean;
  providerWritesEnabled?: boolean;
  workerAutoStartEnabled?: boolean;
  repositoryUnsupportedFailsClosed?: boolean;
}

function check(key: string, ok: boolean, severity: ProductionSafetyCheck["severity"], message: string): ProductionSafetyCheck {
  return { key, ok, severity, message };
}

export function buildProductionSafetyReport(input: ProductionSafetyInput = {}): ProductionSafetyReport {
  const mode = input.mode ?? "foundation";
  const realExecutionEnabled = input.realExecutionEnabled ?? false;
  const providerWritesEnabled = input.providerWritesEnabled ?? false;
  const workerAutoStartEnabled = input.workerAutoStartEnabled ?? false;
  const approvalRuntimeMode = input.approvalRuntimeMode ?? input.pendingApprovalRepositoryMode ?? "foundation_memory";
  const workerRuntimeMode = input.workerRuntimeMode ?? input.workerRepositoryMode ?? "foundation_memory";
  const repositoryUnsupportedFailsClosed = input.repositoryUnsupportedFailsClosed ?? true;
  const usersCreateHandler = getActionExecutionHandler("platform.users.create");
  const settingsUpdateHandler = getActionExecutionHandler("platform.settings.update");
  const settingsExecuteWithoutAllowlist = settingsUpdateHandler
    ? evaluateExecutionGate({
        tenantId: "tenant_safety",
        actionKey: "platform.settings.update",
        approvalRequestId: "apr_safety",
        executionId: "exec_safety",
        actorId: "actor_safety",
        approverId: "approver_safety",
        mode: "execute",
        handlerSafetyChecklist: settingsUpdateHandler.safetyChecklist,
        idempotencyKey: "idem_safety",
        auditRequired: true,
        timelineRequired: true,
        auditMetadataPresent: true,
        timelineMetadataPresent: true,
        allowlist: []
      })
    : undefined;
  const usersCreateExecute = usersCreateHandler
    ? evaluateExecutionGate({
        tenantId: "tenant_safety",
        actionKey: "platform.users.create",
        approvalRequestId: "apr_safety",
        executionId: "exec_safety",
        actorId: "actor_safety",
        approverId: "approver_safety",
        mode: "execute",
        handlerSafetyChecklist: usersCreateHandler.safetyChecklist,
        idempotencyKey: "idem_safety",
        auditRequired: true,
        timelineRequired: true,
        auditMetadataPresent: true,
        timelineMetadataPresent: true,
        allowlist: ["platform.users.create"],
        realExecutionEnabled: true
      })
    : undefined;

  const checks: ProductionSafetyCheck[] = [
    check(
      "production_memory_pending_approval_fallback_disabled",
      mode !== "production" || approvalRuntimeMode !== "memory",
      "blocker",
      "Production pending approval repository cannot silently use memory fallback."
    ),
    check(
      "demo_mock_success_disabled_in_production",
      mode !== "production" || !["demo", "mock"].includes(approvalRuntimeMode),
      "blocker",
      "Production cannot rely on demo/mock approval success paths."
    ),
    check(
      "real_execution_default_disabled",
      !realExecutionEnabled,
      "blocker",
      "Real execution must stay disabled by default."
    ),
    check(
      "external_provider_writes_disabled",
      !providerWritesEnabled,
      "blocker",
      "External provider writes remain disabled."
    ),
    check(
      "worker_auto_start_disabled",
      !workerAutoStartEnabled,
      "blocker",
      "Worker runtime must not auto-start an infinite loop."
    ),
    check(
      "unsupported_repository_fails_closed",
      repositoryUnsupportedFailsClosed,
      "blocker",
      "Unsupported repositories must not return fail-open success."
    ),
    check(
      "settings_execute_requires_allowlist",
      settingsExecuteWithoutAllowlist?.allowed === false &&
        settingsExecuteWithoutAllowlist.blockers.includes("action_not_in_real_execution_allowlist"),
      "blocker",
      "platform.settings.update execute mode requires explicit allowlist."
    ),
    check(
      "users_create_real_execution_blocked",
      usersCreateHandler?.safetyChecklist.dryRunOnly === true &&
        usersCreateHandler.safetyChecklist.realExecutionEnabled === false &&
        usersCreateExecute?.allowed === false,
      "blocker",
      "platform.users.create remains dry_run-only for real execution."
    ),
    check(
      "settings_update_controlled_foundation_only",
      settingsUpdateHandler?.safetyChecklist.realExecutionEnabled === true &&
        settingsUpdateHandler.safetyChecklist.externalWrite === false,
      "warning",
      "platform.settings.update has controlled foundation metadata but no real DB mutation."
    ),
    check(
      "handler_registry_visible",
      listActionExecutionHandlers().length > 0,
      "info",
      "Execution handler registry is visible to safety reporting."
    )
  ];

  const blockers = checks
    .filter((item) => item.severity === "blocker" && !item.ok)
    .map((item) => item.key);
  const warnings = checks
    .filter((item) => item.severity === "warning" && !item.ok)
    .map((item) => item.key);

  return {
    ok: blockers.length === 0,
    mode,
    blockers,
    warnings,
    checks,
    realExecutionEnabled,
    providerWritesEnabled,
    workerAutoStartEnabled,
    approvalRuntimeMode,
    workerRuntimeMode,
    recommendedNextActions: [
      "Run pnpm typecheck && pnpm test && pnpm build before release.",
      "Apply and verify production database migrations before enabling postgres runtime.",
      "Enable real mutation handlers only in explicit scoped PRs.",
      "Keep provider writes disabled until provider-specific guards and rollback plans are tested."
    ]
  };
}

export function evaluateProductionSafety(input: ProductionSafetyInput = {}): ProductionSafetyReport {
  return buildProductionSafetyReport(input);
}

export function assertNoUnsafeRuntimeMode(input: ProductionSafetyInput = {}): ProductionSafetyReport {
  const report = buildProductionSafetyReport(input);
  if (!report.ok) {
    throw new Error(`unsafe_runtime_mode:${report.blockers.join(",")}`);
  }
  return report;
}
