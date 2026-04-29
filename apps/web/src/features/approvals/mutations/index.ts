import type { Approval } from "@hallederiz/types";
import { sdk } from "../../../lib/data-source";

export async function approveApprovalMutation(id: string): Promise<Approval> {
  const response = await sdk.approvals.approve(id);
  return response.item;
}

export async function rejectApprovalMutation(id: string): Promise<Approval> {
  const response = await sdk.approvals.reject(id);
  return response.item;
}

export async function executeApprovalMutation(id: string): Promise<{ approval: Approval; execution?: unknown }> {
  const response = await sdk.approvals.execute(id);
  return {
    approval: response.item,
    execution: response.execution
  };
}
