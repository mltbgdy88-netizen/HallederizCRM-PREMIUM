import type { ActionRegistryEntry } from "@hallederiz/types";
import type { ApprovalExecutionRequest } from "./dispatcher";

export type ActionExecutionMode = "noop" | "dry_run" | "execute";

export interface ActionExecutionHandlerResult {
  ok: boolean;
  status?: "executed" | "failed" | "blocked";
  reasons?: string[];
}

export interface ActionExecutionHandler {
  actionKey: string;
  supported: boolean;
  mode: ActionExecutionMode;
  execute: (request: ApprovalExecutionRequest, action: ActionRegistryEntry) => ActionExecutionHandlerResult;
}

const handlerRegistry = new Map<string, ActionExecutionHandler>();

function createFoundationHandler(actionKey: string): ActionExecutionHandler {
  return {
    actionKey,
    supported: true,
    mode: "dry_run",
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
