import type { ReactNode } from "react";

/** Warm canvas wrapper for approval detail; keeps existing ApprovalDetailPage behavior. */
export function OnaylarApprovalidCommandCenterShell({ children }: { children: ReactNode }) {
  return (
    <div className="hz-onaylar-approvalid-center" data-page="onaylar-approvalid-command-center">
      {children}
    </div>
  );
}
