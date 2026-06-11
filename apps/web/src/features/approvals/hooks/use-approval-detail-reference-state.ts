"use client";

import type { Approval } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { approveApprovalMutation, executeApprovalMutation, rejectApprovalMutation } from "../mutations";
import {
  canInboxApprove,
  canInboxProcess,
  canInboxReject,
  inboxProcessDisabledReason,
  mapApprovalActionError,
  resolveApproveRejectToast,
  resolveExecuteFeedback
} from "../utils/approval-action-feedback";
import { mapApprovalToDetailReference } from "../utils/map-approval-detail-to-reference";

export function useApprovalDetailReferenceState(initialApproval: Approval) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [approval, setApproval] = useState(initialApproval);
  const [actionPending, setActionPending] = useState<"approve" | "reject" | "execute" | null>(null);

  const view = useMemo(() => mapApprovalToDetailReference(approval), [approval]);

  const refreshApproval = useCallback(async () => {
    try {
      const detail = await sdk.approvals.detail(approval.id);
      setApproval(detail.item);
    } catch {
      router.refresh();
    }
  }, [approval.id, router]);

  const runAction = useCallback(
    async (kind: "approve" | "reject" | "execute") => {
      if (actionPending) return;

      if (kind === "approve" && !canInboxApprove(approval)) {
        pushToast("Bu kayıt onaylanamaz.");
        return;
      }
      if (kind === "reject" && !canInboxReject(approval)) {
        pushToast("Bu kayıt reddedilemez.");
        return;
      }
      if (kind === "execute" && !canInboxProcess(approval)) {
        pushToast(inboxProcessDisabledReason(approval) ?? "Bu kayıt işleme alınamaz.");
        return;
      }

      setActionPending(kind);
      try {
        if (kind === "approve") {
          const next = await approveApprovalMutation(approval.id);
          setApproval(next);
          pushToast(resolveApproveRejectToast("approve", dataSourceConfig.useDemoData));
        } else if (kind === "reject") {
          const next = await rejectApprovalMutation(approval.id);
          setApproval(next);
          pushToast(resolveApproveRejectToast("reject", dataSourceConfig.useDemoData));
        } else {
          const result = await executeApprovalMutation(approval.id);
          setApproval(result.approval);
          const feedback = resolveExecuteFeedback(result, { useDemoData: dataSourceConfig.useDemoData });
          pushToast(feedback.message);
          if (feedback.detailHref) {
            router.push(feedback.detailHref);
            return;
          }
        }
        router.refresh();
        await refreshApproval();
      } catch (error) {
        pushToast(mapApprovalActionError(error));
      } finally {
        setActionPending(null);
      }
    },
    [actionPending, approval, pushToast, refreshApproval, router]
  );

  const approveDisabled = actionPending !== null || !canInboxApprove(approval);
  const rejectDisabled = actionPending !== null || !canInboxReject(approval);
  const executeDisabled = actionPending !== null || !canInboxProcess(approval);
  const executeDisabledReason = inboxProcessDisabledReason(approval);

  return {
    approval,
    view,
    actionPending,
    approveDisabled,
    rejectDisabled,
    executeDisabled,
    executeDisabledReason,
    runAction,
    goBack: () => router.push("/onaylar"),
    goReviewQueue: () => router.push("/onaylar/inceleme"),
    goEntity: () => router.push(view.entityLink.href)
  };
}
