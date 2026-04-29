import type { Return } from "@hallederiz/types";
import { approveReturnRecord, completeReturnRecord, createReturnRecord } from "../../../services/api/returns.service";

export async function createReturnMutation(payload: Partial<Return>) {
  return createReturnRecord(payload);
}

export async function approveReturnMutation(returnId: string) {
  return approveReturnRecord(returnId);
}

export async function completeReturnMutation(returnId: string) {
  return completeReturnRecord(returnId);
}
