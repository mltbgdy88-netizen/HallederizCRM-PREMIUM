import type { Approval } from "@hallederiz/types";
import { sdk } from "../../../lib/data-source";

export async function listApprovalsQuery(): Promise<Approval[]> {
  const response = await sdk.approvals.list();
  return response.items;
}

export async function getApprovalDetailQuery(id: string): Promise<Approval | null> {
  try {
    const response = await sdk.approvals.detail(id);
    return response.item ?? null;
  } catch {
    return null;
  }
}
