import type { ActionRegistryEntry } from "@hallederiz/types";
import type { ApprovalExecutionRequest } from "./dispatcher";

export type ActionExecutionMode = "noop" | "dry_run" | "execute";

export interface ActionExecutionHandlerResult {
  ok: boolean;
  status?: "executed" | "failed" | "blocked";
  reasons?: string[];
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
  execute: (request: ApprovalExecutionRequest, action: ActionRegistryEntry) => ActionExecutionHandlerResult;
}

const handlerRegistry = new Map<string, ActionExecutionHandler>();

function createFoundationHandler(actionKey: string): ActionExecutionHandler {
  return {
    handlerKey: `handler.${actionKey}`,
    actionKey,
    supported: true,
    mode: "dry_run",
    safetyChecklist: {
      requiresApproval: true,
      mutatesState: true,
      externalWrite: false,
      idempotencyRequired: false,
      auditRequired: true,
      timelineRequired: true,
      dryRunOnly: true,
      realExecutionEnabled: false
    },
    execute: (request) => ({
      ok: true,
      status: "executed",
      reasons: [
        "supported_action_dry_run",
        "no_real_mutation_executed",
        `handler_mode:dry_run`,
        `action:${request.actionKey}`
      ]
    })
  };
}

registerActionExecutionHandler(createFoundationHandler("platform.users.create"));
registerActionExecutionHandler(createFoundationHandler("platform.settings.update"));

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
