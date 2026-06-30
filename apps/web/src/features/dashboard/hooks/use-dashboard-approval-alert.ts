"use client";

import type { Approval } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  dismissApprovalAlertIds,
  resolveActiveApprovalAlert
} from "../utils/dashboard-approval-alert-store";

const POLL_MS = 20_000;

export function useDashboardApprovalAlert() {
  const router = useRouter();
  const [alert, setAlert] = useState<Approval | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const next = await resolveActiveApprovalAlert();
      setAlert(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const acknowledge = useCallback(
    (approvalId: string) => {
      dismissApprovalAlertIds([approvalId]);
      setAlert((current) => (current?.id === approvalId ? null : current));
      void refresh();
    },
    [refresh]
  );

  const openApproval = useCallback(
    (approval: Approval) => {
      acknowledge(approval.id);
      router.push(`/onaylar/${approval.id}`);
    },
    [acknowledge, router]
  );

  return {
    alert,
    loading,
    openApproval,
    refresh
  };
}
