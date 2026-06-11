"use client";

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
import { filterApprovalInboxRows } from "../components/inbox/filter-inbox-rows";
import { mapApprovalToInboxRecord } from "../components/inbox/map-approvals-to-inbox";
import { DEFAULT_APPROVAL_INBOX_FILTERS, type ApprovalInboxFilterState } from "../components/inbox/ApprovalSidebar";
import type { ApprovalInboxRecord, ApprovalInboxViewId } from "../components/inbox/types";
import type { ApprovalDeskStat } from "../components/ApprovalStatsStrip";

export type ApprovalCommandDeskUiPhase = "loading" | "ready" | "empty" | "error";

export function useApprovalCommandDeskState() {
  const { pushToast } = useToast();

  const [phase, setPhase] = useState<ApprovalCommandDeskUiPhase>("loading");
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
  const listPhase: ApprovalCommandDeskUiPhase =
    phase === "ready" && (listIsFilteredEmpty || listIsTrulyEmpty) ? "empty" : phase;

  return {
    phase,
    listPhase,
    errorMessage,
    rows,
    filteredRows,
    selectedId,
    setSelectedId,
    selectedRecord,
    searchQuery,
    setSearchQuery,
    sourceFilter,
    setSourceFilter,
    actionPending,
    detailLoading,
    detailError,
    stats,
    bootstrap,
    runAction,
    listIsFilteredEmpty,
    listIsTrulyEmpty,
    emptyTitle: listIsTrulyEmpty ? MSG_APPROVAL_EMPTY_LIST : MSG_APPROVAL_EMPTY_FILTERED,
    emptyDescription: listIsTrulyEmpty ? undefined : MSG_APPROVAL_EMPTY_FILTERED_HINT
  };
}
