// @ts-nocheck
"use client";

import { LucideIcon } from "../../../components/icons/lucide-icons";

export function ApprovalsShellLeading() {
  return (
    <div className="hz-approval-shell-leading">
      <h2 className="hz-approval-shell-leading__title">Onaylar</h2>
      <button
        type="button"
        className="hz-approval-shell-refresh-btn"
        onClick={() => window.dispatchEvent(new CustomEvent("approvals:refresh"))}
      >
        <LucideIcon name="rotate-ccw" size={14} />
        Yenile
      </button>
    </div>
  );
}

