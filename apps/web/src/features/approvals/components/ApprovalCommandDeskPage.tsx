// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import {
  MSG_APPROVAL_DETAIL_FAILED,
  MSG_APPROVAL_EMPTY_FILTERED,
  MSG_APPROVAL_EMPTY_FILTERED_HINT,
  MSG_APPROVAL_EMPTY_LIST,
  MSG_APPROVAL_LIST_FAILED
} from "../data/approval-action-messages";
import { approveApprovalMutation, rejectApprovalMutation } from "../mutations";
import {
  canInboxApprove,
  canInboxReject,
  mapApprovalActionError,
  resolveApproveRejectToast
} from "../utils/approval-action-feedback";
import {
  approvalSourceFromRecord,
  countCompletedToday,
  filterBySourceChip,
  isHighRiskRecord,
  type ApprovalSourceFilter
} from "../utils/approval-command-desk-present";
import { ApprovalCommandDeskDecision } from "./ApprovalCommandDeskDecision";
import { ApprovalCommandDeskDetail } from "./ApprovalCommandDeskDetail";
import { ApprovalCommandDeskQueue } from "./ApprovalCommandDeskQueue";
import { ApprovalInboxEmpty, ApprovalInboxError, ApprovalInboxLoading } from "./ApprovalInboxStates";
import { ApprovalStatsStrip, type ApprovalDeskStat } from "./ApprovalStatsStrip";
import { filterApprovalInboxRows } from "./inbox/filter-inbox-rows";
import { mapApprovalToInboxRecord } from "./inbox/map-approvals-to-inbox";
import { DEFAULT_APPROVAL_INBOX_FILTERS, type ApprovalInboxFilterState } from "./inbox/ApprovalSidebar";
import type { ApprovalInboxRecord, ApprovalInboxViewId } from "./inbox/types";

type UiPhase = "loading" | "ready" | "empty" | "error";

export function ApprovalCommandDeskPage() {
  const router = useRouter();
  const { pushToast } = useToast();

  const [phase, setPhase] = useState<UiPhase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeView] = useState<ApprovalInboxViewId>("tum");
  const [filters] = useState<ApprovalInboxFilterState>(DEFAULT_APPROVAL_INBOX_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<ApprovalSourceFilter>("all");
  const [onlyCritical] = useState(false);
  const [rows, setRows] = useState<ApprovalInboxRecord[]>([]);
  const [actionPending, setActionPending] = useState<"approve" | "reject" | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    setPhase("loading");
    setErrorMessage(null);
    try {
      const result = await sdk.approvals.list();
      const mapped = (result.items ?? []).map((item) => mapApprovalToInboxRecord(item, dataSourceConfig.userId));
      setRows(mapped);
      setPhase("ready");
    } catch (error) {
      setRows([]);
      setErrorMessage(mapApprovalActionError(error) || MSG_APPROVAL_LIST_FAILED);
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const onRefresh = () => void bootstrap();
    window.addEventListener("approvals:refresh", onRefresh);
    return () => window.removeEventListener("approvals:refresh", onRefresh);
  }, [bootstrap]);

  const filteredRows = useMemo(() => {
    const base = filterApprovalInboxRows(rows, {
      activeView,
      onlyCritical,
      searchQuery,
      filters
    });
    return filterBySourceChip(base, sourceFilter);
  }, [activeView, filters, onlyCritical, rows, searchQuery, sourceFilter]);

  const selectedRecord = useMemo(
    () => filteredRows.find((row) => row.id === selectedId) ?? rows.find((row) => row.id === selectedId) ?? null,
    [filteredRows, selectedId, rows]
  );

  const refreshDetail = useCallback(async () => {
    if (!selectedId) return;
    setDetailLoading(true);
    setDetailError(null);
    try {
      const detail = await sdk.approvals.detail(selectedId);
      const mapped = mapApprovalToInboxRecord(detail.item, dataSourceConfig.userId);
      setRows((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)));
    } catch (error) {
      setDetailError(mapApprovalActionError(error) || MSG_APPROVAL_DETAIL_FAILED);
    } finally {
      setDetailLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    void refreshDetail();
  }, [refreshDetail]);

  useEffect(() => {
    if (phase !== "ready") return;
    if (!filteredRows.length) {
      setSelectedId(null);
      return;
    }
    const stillVisible = selectedId !== null && filteredRows.some((row) => row.id === selectedId);
    if (!stillVisible) {
      setSelectedId(filteredRows[0]?.id ?? null);
    }
  }, [filteredRows, phase, selectedId]);

  const runAction = useCallback(
    async (kind: "approve" | "reject") => {
      if (!selectedRecord || actionPending) return;
      const approval = selectedRecord.raw;

      if (kind === "approve" && !canInboxApprove(approval)) {
        pushToast("Bu kayıt onaylanamaz.");
        return;
      }
      if (kind === "reject" && !canInboxReject(approval)) {
        pushToast("Bu kayıt reddedilemez.");
        return;
      }

      setActionPending(kind);
      try {
        if (kind === "approve") {
          await approveApprovalMutation(selectedRecord.id);
        } else {
          await rejectApprovalMutation(selectedRecord.id);
        }
        pushToast(resolveApproveRejectToast(kind, dataSourceConfig.useDemoData));
        await bootstrap();
        await refreshDetail();
      } catch (error) {
        pushToast(mapApprovalActionError(error));
      } finally {
        setActionPending(null);
      }
    },
    [actionPending, bootstrap, pushToast, refreshDetail, selectedRecord]
  );

  const stats = useMemo((): ApprovalDeskStat[] => {
    const pending = rows.filter((row) => row.raw.status === "pending").length;
    const highRisk = rows.filter(isHighRiskRecord).length;
    const aiCount = rows.filter((row) => approvalSourceFromRecord(row) === "ai").length;
    const messageCount = rows.filter((row) => approvalSourceFromRecord(row) === "message").length;
    const completedToday = countCompletedToday(rows);

    return [
      {
        id: "pending",
        label: "Bekleyen Onay",
        value: String(pending),
        subtitle: "",
        icon: "shield-check",
        tone: "emerald"
      },
      {
        id: "risk",
        label: "Yüksek Risk",
        value: String(highRisk),
        subtitle: "",
        icon: "shield-alert",
        tone: "ruby"
      },
      {
        id: "ai",
        label: "AI Önerisi",
        value: String(aiCount),
        subtitle: "",
        icon: "sparkles",
        tone: "gold"
      },
      {
        id: "message",
        label: "Mesaj Kaynaklı",
        value: String(messageCount),
        subtitle: "",
        icon: "message-circle",
        tone: "info"
      },
      {
        id: "done",
        label: "Bugün Tamamlanan",
        value: String(completedToday),
        subtitle: "",
        icon: "check-circle-2",
        tone: "muted"
      }
    ];
  }, [rows]);

  const listIsFilteredEmpty = phase === "ready" && rows.length > 0 && filteredRows.length === 0;
  const listIsTrulyEmpty = phase === "ready" && rows.length === 0;
  const listPhase: UiPhase = phase === "ready" && (listIsFilteredEmpty || listIsTrulyEmpty) ? "empty" : phase;

  return (
    <main className="hz-approvals-page hz-approvals-command" aria-live="polite">
      <div className="hz-approvals-command__top">
        <ApprovalStatsStrip stats={stats} />
      </div>

      {listPhase === "loading" ? <ApprovalInboxLoading label="Onay masası yükleniyor…" /> : null}
      {listPhase === "error" ? (
        <ApprovalInboxError
          error={{ kind: "unknown", message: errorMessage ?? "Onay listesi şu an alınamıyor." }}
          onRetry={() => void bootstrap()}
        />
      ) : null}
      {listPhase === "empty" ? (
        <ApprovalInboxEmpty
          title={listIsTrulyEmpty ? MSG_APPROVAL_EMPTY_LIST : MSG_APPROVAL_EMPTY_FILTERED}
          description={listIsTrulyEmpty ? undefined : MSG_APPROVAL_EMPTY_FILTERED_HINT}
        />
      ) : null}

      {listPhase === "ready" ? (
        <div className="hz-approvals-command__grid">
          <ApprovalCommandDeskQueue
            rows={filteredRows}
            selectedId={selectedId}
            searchQuery={searchQuery}
            sourceFilter={sourceFilter}
            onSearchChange={setSearchQuery}
            onSourceFilterChange={setSourceFilter}
            onSelect={setSelectedId}
          />
          <ApprovalCommandDeskDetail
            record={selectedRecord}
            detailLoading={detailLoading}
            detailError={detailError}
          />
          <ApprovalCommandDeskDecision
            record={selectedRecord}
            actionPending={actionPending}
            onApprove={() => void runAction("approve")}
            onReject={() => void runAction("reject")}
            onOpenDetail={() => {
              if (!selectedRecord) return;
              router.push(`/onaylar/${selectedRecord.id}`);
            }}
          />
        </div>
      ) : null}
    </main>
  );
}


