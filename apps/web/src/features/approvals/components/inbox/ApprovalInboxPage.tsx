"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dataSourceConfig, sdk } from "../../../../lib/data-source";
import { useToast } from "../../../../providers/toast-provider";
import {
  MSG_APPROVAL_DEMO_BAND,
  MSG_APPROVAL_DETAIL_FAILED,
  MSG_APPROVAL_EMPTY_FILTERED,
  MSG_APPROVAL_EMPTY_FILTERED_HINT,
  MSG_APPROVAL_EMPTY_LIST,
  MSG_APPROVAL_LIVE_QUEUE_BAND,
  MSG_APPROVAL_LIST_FAILED
} from "../../data/approval-action-messages";
import { approveApprovalMutation, executeApprovalMutation, rejectApprovalMutation } from "../../mutations";
import {
  canInboxApprove,
  canInboxProcess,
  canInboxReject,
  inboxProcessDisabledReason,
  mapApprovalActionError,
  resolveApproveRejectToast,
  resolveExecuteFeedback
} from "../../utils/approval-action-feedback";
import { ApprovalInboxEmpty, ApprovalInboxError, ApprovalInboxLoading } from "../ApprovalInboxStates";
import { ApprovalInboxDetailPanel } from "./ApprovalInboxDetailPanel";
import { ApprovalInboxHeader } from "./ApprovalInboxHeader";
import { ApprovalKpiCards } from "./ApprovalKpiCards";
import { ApprovalSidebar, DEFAULT_APPROVAL_INBOX_FILTERS, type ApprovalInboxFilterState } from "./ApprovalSidebar";
import { ApprovalTable } from "./ApprovalTable";
import { filterApprovalInboxRows } from "./filter-inbox-rows";
import { mapApprovalToInboxRecord } from "./map-approvals-to-inbox";
import type { ApprovalInboxRecord, ApprovalInboxViewId } from "./types";

type UiPhase = "loading" | "ready" | "empty" | "error";

export type ApprovalInboxRoutePreset = "all" | "pending" | "review" | "completed";

function resolvePresetState(preset: ApprovalInboxRoutePreset): {
  activeView: ApprovalInboxViewId;
  filters: ApprovalInboxFilterState;
} {
  if (preset === "pending") {
    return { activeView: "tum", filters: { ...DEFAULT_APPROVAL_INBOX_FILTERS, status: "bekliyor" } };
  }
  if (preset === "review") {
    return { activeView: "tum", filters: { ...DEFAULT_APPROVAL_INBOX_FILTERS, status: "incelemede" } };
  }
  if (preset === "completed") {
    return { activeView: "yakin_sonuclanan", filters: { ...DEFAULT_APPROVAL_INBOX_FILTERS } };
  }
  return { activeView: "tum", filters: { ...DEFAULT_APPROVAL_INBOX_FILTERS } };
}

export function ApprovalInboxPage({ routePreset = "all" }: { routePreset?: ApprovalInboxRoutePreset }) {
  const presetState = resolvePresetState(routePreset);
  const router = useRouter();
  const { pushToast } = useToast();

  const [phase, setPhase] = useState<UiPhase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ApprovalInboxViewId>(presetState.activeView);
  const [filters, setFilters] = useState<ApprovalInboxFilterState>(presetState.filters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyCritical, setOnlyCritical] = useState(false);
  const [rows, setRows] = useState<ApprovalInboxRecord[]>([]);
  const [actionPending, setActionPending] = useState<"approve" | "reject" | "process" | null>(null);
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

  const filteredRows = useMemo(
    () =>
      filterApprovalInboxRows(rows, {
        activeView,
        onlyCritical,
        searchQuery,
        filters
      }),
    [activeView, filters, onlyCritical, rows, searchQuery]
  );

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

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

  useEffect(() => {
    setPage(1);
  }, [activeView, filters, pageSize, onlyCritical, searchQuery]);

  const updateFilter = <K extends keyof ApprovalInboxFilterState>(key: K, value: ApprovalInboxFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const runAction = useCallback(
    async (kind: "approve" | "reject" | "process") => {
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
      if (kind === "process" && !canInboxProcess(approval)) {
        pushToast(inboxProcessDisabledReason(approval) ?? "Bu kayıt işleme alınamaz.");
        return;
      }

      setActionPending(kind);
      try {
        if (kind === "approve") {
          await approveApprovalMutation(selectedRecord.id);
          pushToast(resolveApproveRejectToast("approve", dataSourceConfig.useDemoData));
        } else if (kind === "reject") {
          await rejectApprovalMutation(selectedRecord.id);
          pushToast(resolveApproveRejectToast("reject", dataSourceConfig.useDemoData));
        } else if (dataSourceConfig.useDemoData) {
          pushToast(resolveExecuteFeedback({ approval, execution: undefined }, { useDemoData: true }).message);
        } else {
          const result = await executeApprovalMutation(selectedRecord.id);
          pushToast(resolveExecuteFeedback(result, { useDemoData: false }).message);
        }
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

  const listIsFilteredEmpty = phase === "ready" && rows.length > 0 && filteredRows.length === 0;
  const listIsTrulyEmpty = phase === "ready" && rows.length === 0;
  const listPhase: UiPhase =
    phase === "ready" && (listIsFilteredEmpty || listIsTrulyEmpty) ? "empty" : phase;

  const pendingCount = useMemo(() => rows.filter((row) => row.status === "bekliyor").length, [rows]);

  return (
    <main className="hz-approvals-page hz-approvals-inbox-desk-page">
      <div className="hz-approvals-inbox-desk-workspace">
        <div className="hz-approvals-inbox-desk-top">
          <ApprovalInboxHeader
            pendingCount={pendingCount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onlyCritical={onlyCritical}
            onOnlyCriticalChange={setOnlyCritical}
            onRefresh={() => void bootstrap()}
            refreshing={phase === "loading"}
            lastSyncLabel={new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date())}
          />
          <ApprovalKpiCards rows={rows} />
          {dataSourceConfig.useDemoData ? (
            <p className="hz-approvals-inbox-preview-band" role="status">
              {MSG_APPROVAL_DEMO_BAND}
            </p>
          ) : (
            <p className="hz-approvals-inbox-preview-band" role="status">
              {MSG_APPROVAL_LIVE_QUEUE_BAND}
            </p>
          )}
        </div>
        <div className="hz-approvals-inbox-desk-body">
          <ApprovalSidebar
            activeView={activeView}
            onViewChange={setActiveView}
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={() => setFilters(DEFAULT_APPROVAL_INBOX_FILTERS)}
            onSaveView={() => pushToast("Görünüm kaydedildi.")}
            rows={rows}
          />
          <section className="hz-approvals-inbox-desk-center" aria-label="Onay listesi alanı">
            {listPhase === "loading" ? <ApprovalInboxLoading label="Onay kutusu yükleniyor..." /> : null}
            {listPhase === "error" ? (
              <ApprovalInboxError
                error={{ kind: "unknown", message: errorMessage ?? "Onay kutusu verisi şu an alınamıyor." }}
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
              <ApprovalTable
                rows={pagedRows}
                selectedId={selectedId}
                onSelect={setSelectedId}
                page={page}
                pageSize={pageSize}
                totalCount={filteredRows.length}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            ) : null}
          </section>
          <ApprovalInboxDetailPanel
            record={selectedRecord}
            actionPending={actionPending}
            detailLoading={detailLoading}
            detailError={detailError}
            onApprove={() => void runAction("approve")}
            onReject={() => void runAction("reject")}
            onProcess={() => void runAction("process")}
            onOpenFull={() => {
              if (!selectedRecord) return;
              router.push(`/onaylar/${selectedRecord.id}`);
            }}
          />
        </div>
      </div>
    </main>
  );
}