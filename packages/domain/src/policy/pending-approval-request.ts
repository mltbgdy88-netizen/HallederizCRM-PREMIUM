import {
  InMemoryPendingApprovalRepository,
  type PendingApprovalMarkApprovedInput,
  type PendingApprovalMarkRejectedInput,
  type PendingApprovalRepository,
  type PendingApprovalRequest,
  type PendingApprovalRequestInput
} from "./pending-approval-repository";

export type {
  PendingApprovalMarkApprovedInput,
  PendingApprovalMarkRejectedInput,
  PendingApprovalRepository,
  PendingApprovalRequest,
  PendingApprovalRequestInput
} from "./pending-approval-repository";

const defaultPendingApprovalRepository = new InMemoryPendingApprovalRepository();

export function getDefaultPendingApprovalRepository(): PendingApprovalRepository {
  return defaultPendingApprovalRepository;
}

export function createPendingApprovalRequest(input: PendingApprovalRequestInput): PendingApprovalRequest {
  return defaultPendingApprovalRepository.createPendingApprovalRequest(input);
}

export function listPendingApprovalRequests(tenantId: string): PendingApprovalRequest[] {
  return defaultPendingApprovalRepository.listPendingApprovalRequests(tenantId);
}

export function getApprovalRequestById(approvalRequestId: string, tenantId: string): PendingApprovalRequest | undefined {
  return defaultPendingApprovalRepository.getPendingApprovalRequest(approvalRequestId, tenantId);
}

export function listApprovalRequests(tenantId: string): PendingApprovalRequest[] {
  return defaultPendingApprovalRepository.listApprovalRequests(tenantId);
}

export function approveApprovalRequest(
  input: PendingApprovalMarkApprovedInput
): { ok: true; item: PendingApprovalRequest } | { ok: false; reason: string } {
  return defaultPendingApprovalRepository.markPendingApprovalApproved(input);
}

export function rejectApprovalRequest(
  input: PendingApprovalMarkRejectedInput
): { ok: true; item: PendingApprovalRequest } | { ok: false; reason: string } {
  return defaultPendingApprovalRepository.markPendingApprovalRejected(input);
}

export function resetPendingApprovalRequests() {
  defaultPendingApprovalRepository.reset();
}
