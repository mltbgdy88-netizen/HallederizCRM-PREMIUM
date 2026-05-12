import type { ActionRegistryEntry } from "@hallederiz/types";
import type { ApprovalExecutionRequest } from "./dispatcher";
import type { ExecutionGateDecision } from "./execution-gate";

export type ActionExecutionMode = "noop" | "dry_run" | "execute";

export interface ActionExecutionHandlerResult {
  ok: boolean;
  status?: "executed" | "failed" | "blocked";
  reasons?: string[];
  requestedMode?: ActionExecutionMode;
  effectiveMode?: ActionExecutionMode;
  gateDecision?: ExecutionGateDecision;
  mutationExecuted?: boolean;
  externalProviderCallExecuted?: boolean;
  rollbackPlan?: string;
  foundationControlledExecution?: boolean;
}

export interface ActionExecutionHandlerSafetyChecklist {
  requiresApproval: boolean;
  mutatesState: boolean;
  externalWrite: boolean;
  idempotencyRequired: boolean;
  auditRequired: boolean;
  timelineRequired: boolean;
  dryRunOnly: boolean;
  realExecutionEnabled: boolean;
}

export interface ActionExecutionHandler {
  handlerKey: string;
  actionKey: string;
  supported: boolean;
  mode: ActionExecutionMode;
  safetyChecklist: ActionExecutionHandlerSafetyChecklist;
  execute: (
    request: ApprovalExecutionRequest,
    action: ActionRegistryEntry,
    gateDecision: ExecutionGateDecision
  ) => ActionExecutionHandlerResult;
}

const handlerRegistry = new Map<string, ActionExecutionHandler>();

function createSettingsUpdateHandler(): ActionExecutionHandler {
  return {
    handlerKey: "handler.platform.settings.update",
    actionKey: "platform.settings.update",
    supported: true,
    mode: "dry_run",
    safetyChecklist: {
      requiresApproval: true,
      mutatesState: true,
      externalWrite: false,
      idempotencyRequired: true,
      auditRequired: true,
      timelineRequired: true,
      dryRunOnly: false,
      realExecutionEnabled: true
    },
    execute: (request, _action, gateDecision) => {
      if (gateDecision.mode === "execute" && !gateDecision.allowed) {
        return {
          ok: false,
          status: "blocked",
          reasons: ["execution_gate_blocked", ...gateDecision.blockers],
          requestedMode: "execute",
          effectiveMode: "dry_run",
          gateDecision,
          mutationExecuted: false,
          externalProviderCallExecuted: false,
          rollbackPlan: "no_mutation_to_rollback"
        };
      }

      if (gateDecision.mode === "execute" && gateDecision.allowed) {
        return {
          ok: true,
          status: "executed",
          reasons: [
            "controlled_settings_update_execution_foundation",
            "foundation_controlled_execution:true",
            "no_real_db_mutation_executed",
            "mutation_executed:false",
            "external_provider_call_executed:false",
            `action:${request.actionKey}`
          ],
          requestedMode: "execute",
          effectiveMode: "execute",
          gateDecision,
          mutationExecuted: false,
          externalProviderCallExecuted: false,
          rollbackPlan: "no_mutation_to_rollback",
          foundationControlledExecution: true
        };
      }

      return {
        ok: true,
        status: "executed",
        reasons: [
          "supported_action_dry_run",
          "no_real_mutation_executed",
          "mutation_executed:false",
          "external_provider_call_executed:false",
          "handler_mode:dry_run",
          `action:${request.actionKey}`
        ],
        requestedMode: gateDecision.mode,
        effectiveMode: "dry_run",
        gateDecision,
        mutationExecuted: false,
        externalProviderCallExecuted: false,
        rollbackPlan: "no_mutation_to_rollback"
      };
    }
  };
}

function createUsersCreateHandler(): ActionExecutionHandler {
  return {
    handlerKey: "handler.platform.users.create",
    actionKey: "platform.users.create",
    supported: true,
    mode: "dry_run",
    safetyChecklist: {
      requiresApproval: true,
      mutatesState: true,
      externalWrite: false,
      idempotencyRequired: true,
      auditRequired: true,
      timelineRequired: true,
      dryRunOnly: true,
      realExecutionEnabled: false
    },
    execute: (request, _action, gateDecision) => {
      if (gateDecision.mode === "execute") {
        return {
          ok: false,
          status: "blocked",
          reasons: [
            "platform_users_create_real_execution_blocked",
            "dry_run_only_handler",
            ...gateDecision.blockers,
            "mutation_executed:false",
            "external_provider_call_executed:false"
          ],
          requestedMode: "execute",
          effectiveMode: "dry_run",
          gateDecision,
          mutationExecuted: false,
          externalProviderCallExecuted: false,
          rollbackPlan: "no_mutation_to_rollback"
        };
      }

      return {
        ok: true,
        status: "executed",
        reasons: [
          "supported_action_dry_run",
          "no_real_mutation_executed",
          "mutation_executed:false",
          "external_provider_call_executed:false",
          "handler_mode:dry_run",
          `action:${request.actionKey}`
        ],
        requestedMode: gateDecision.mode,
        effectiveMode: "dry_run",
        gateDecision,
        mutationExecuted: false,
        externalProviderCallExecuted: false,
        rollbackPlan: "no_mutation_to_rollback"
      };
    }
  };
}

registerActionExecutionHandler(createUsersCreateHandler());
registerActionExecutionHandler(createSettingsUpdateHandler());

export function registerActionExecutionHandler(handler: ActionExecutionHandler) {
  handlerRegistry.set(handler.actionKey, handler);
}

export function getActionExecutionHandler(actionKey: string): ActionExecutionHandler | undefined {
  return handlerRegistry.get(actionKey);
}

export function hasActionExecutionHandler(actionKey: string): boolean {
  return handlerRegistry.has(actionKey);
}

export function listActionExecutionHandlers(): ActionExecutionHandler[] {
  return [...handlerRegistry.values()];
}
