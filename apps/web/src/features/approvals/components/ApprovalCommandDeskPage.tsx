"use client";

import { useRouter } from "next/navigation";
import { ApprovalCommandDeskDecision } from "./ApprovalCommandDeskDecision";
import { ApprovalCommandDeskDetail } from "./ApprovalCommandDeskDetail";
import { ApprovalCommandDeskQueue } from "./ApprovalCommandDeskQueue";
import { ApprovalInboxEmpty, ApprovalInboxError, ApprovalInboxLoading } from "./ApprovalInboxStates";
import { ApprovalStatsStrip } from "./ApprovalStatsStrip";
import { useApprovalCommandDeskState } from "../hooks/use-approval-command-desk-state";

export function ApprovalCommandDeskPage() {
  const router = useRouter();
  const desk = useApprovalCommandDeskState();

  return (
    <main className="hz-approvals-page hz-approvals-command" aria-live="polite">
      <div className="hz-approvals-command__top">
        <ApprovalStatsStrip stats={desk.stats} />
      </div>

      {desk.listPhase === "loading" ? <ApprovalInboxLoading label="Onay masası yükleniyor…" /> : null}
      {desk.listPhase === "error" ? (
        <ApprovalInboxError
          error={{ kind: "unknown", message: desk.errorMessage ?? "Onay listesi şu an alınamıyor." }}
          onRetry={() => void desk.bootstrap()}
        />
      ) : null}
      {desk.listPhase === "empty" ? (
        <ApprovalInboxEmpty title={desk.emptyTitle} description={desk.emptyDescription} />
      ) : null}

      {desk.listPhase === "ready" ? (
        <div className="hz-approvals-command__grid">
          <ApprovalCommandDeskQueue
            rows={desk.filteredRows}
            selectedId={desk.selectedId}
            searchQuery={desk.searchQuery}
            sourceFilter={desk.sourceFilter}
            onSearchChange={desk.setSearchQuery}
            onSourceFilterChange={desk.setSourceFilter}
            onSelect={desk.setSelectedId}
          />
          <ApprovalCommandDeskDetail
            record={desk.selectedRecord}
            detailLoading={desk.detailLoading}
            detailError={desk.detailError}
          />
          <ApprovalCommandDeskDecision
            record={desk.selectedRecord}
            actionPending={desk.actionPending}
            onApprove={() => void desk.runAction("approve")}
            onReject={() => void desk.runAction("reject")}
            onOpenDetail={() => {
              if (!desk.selectedRecord) return;
              router.push(`/onaylar/${desk.selectedRecord.id}`);
            }}
          />
        </div>
      ) : null}
    </main>
  );
}
