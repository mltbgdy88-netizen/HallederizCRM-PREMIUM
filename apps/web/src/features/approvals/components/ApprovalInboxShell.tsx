"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../providers/auth-provider";
import { useToast } from "../../../providers/toast-provider";
import { createApprovalClient } from "../api/approval-client";
import type { ApprovalClientError, ApprovalInboxItem, ApprovalInboxStatusFilter, WorkerHealthResponse } from "../types";
import {
  buildActiveFilterSummary,
  computeInboxStats,
  filterInboxItems,
  mapApprovalUiErrorMessage,
  searchInboxItems,
  sortInboxItems,
  type ApprovalInboxSortMode
} from "../utils/inbox-helpers";
import { ApprovalDetailPanel } from "./ApprovalDetailPanel";
import { EmptyState, ErrorState, LoadingState } from "./ApprovalInboxStates";
import { ApprovalList } from "./ApprovalList";
import { ApprovalSafetyBadge } from "./ApprovalSafetyBadge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const FILTER_OPTIONS: { id: ApprovalInboxStatusFilter; label: string }[] = [
  { id: "all", label: "Tumu" },
  { id: "pending", label: "Bekleyen" },
  { id: "approved", label: "Onaylandi" },
  { id: "rejected", label: "Reddedildi" }
];

const SORT_OPTIONS: { id: ApprovalInboxSortMode; label: string }[] = [
  { id: "newest", label: "En yeni" },
  { id: "oldest", label: "En eski" },
  { id: "actionKey", label: "Action key" }
];

export function ApprovalInboxShell() {
  const { accessToken, session, state } = useAuth();
  const { pushToast } = useToast();
  const client = useMemo(
    () =>
      createApprovalClient({
        apiBaseUrl: API_BASE_URL,
        accessToken,
        tenantId: session?.tenant.id ?? ""
      }),
    [accessToken, session?.tenant.id]
  );

  const [items, setItems] = useState<ApprovalInboxItem[]>([]);
  const [repositoryMode, setRepositoryMode] = useState<string | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ApprovalInboxItem | null>(null);
  const [filter, setFilter] = useState<ApprovalInboxStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<ApprovalInboxSortMode>("newest");
  const [listError, setListError] = useState<ApprovalClientError | null>(null);
  const [detailError, setDetailError] = useState<ApprovalClientError | null>(null);
  const [workerHealth, setWorkerHealth] = useState<WorkerHealthResponse | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [busyAction, setBusyAction] = useState(false);

  const stats = useMemo(() => computeInboxStats(items), [items]);
  const visibleItems = useMemo(
    () => sortInboxItems(searchInboxItems(filterInboxItems(items, filter), searchQuery), sortMode),
    [filter, items, searchQuery, sortMode]
  );
  const filterSummary = useMemo(
    () =>
      buildActiveFilterSummary({
        filter,
        query: searchQuery,
        sort: sortMode,
        visibleCount: visibleItems.length,
        totalCount: items.length
      }),
    [filter, items.length, searchQuery, sortMode, visibleItems.length]
  );

  const refreshList = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    const result = await client.listApprovals();
    if (!result.ok) {
      setItems([]);
      setRepositoryMode(undefined);
      setListError(result.error);
      setLoadingList(false);
      return;
    }
    setItems(result.data.items ?? []);
    setRepositoryMode(result.data.repositoryMode);
    setLoadingList(false);
  }, [client]);

  const refreshDetail = useCallback(
    async (approvalRequestId: string) => {
      setLoadingDetail(true);
      setDetailError(null);
      const result = await client.getApproval(approvalRequestId);
      if (!result.ok) {
        setDetail(null);
        setDetailError(result.error);
        setLoadingDetail(false);
        return;
      }
      setDetail(result.data.item);
      setLoadingDetail(false);
    },
    [client]
  );

  const refreshWorkerHealth = useCallback(async () => {
    const result = await client.getWorkerHealth();
    if (!result.ok) {
      setWorkerHealth({
        ok: false,
        error: mapApprovalUiErrorMessage(result.error),
        reasons: result.error.reasons
      });
      return;
    }
    setWorkerHealth(result.data);
  }, [client]);

  useEffect(() => {
    if (state !== "authenticated") {
      setLoadingList(false);
      return;
    }
    void refreshList();
    void refreshWorkerHealth();
  }, [refreshList, refreshWorkerHealth, state]);

  useEffect(() => {
    if (!selectedId && visibleItems[0]) {
      setSelectedId(visibleItems[0].approvalRequestId);
    }
  }, [selectedId, visibleItems]);

  useEffect(() => {
    if (!selectedId || state !== "authenticated") {
      setDetail(null);
      return;
    }
    void refreshDetail(selectedId);
  }, [refreshDetail, selectedId, state]);

  const handleApprove = async () => {
    if (!selectedId) return;
    setBusyAction(true);
    const result = await client.approveApproval(selectedId);
    setBusyAction(false);
    if (!result.ok) {
      pushToast(mapApprovalUiErrorMessage(result.error));
      return;
    }
    if (result.data.duplicate) {
      pushToast("Kayit zaten islenmis; tekrar onay gonderilmedi.");
    } else {
      pushToast("Onay istegi onaylandi.");
    }
    await refreshList();
    await refreshDetail(selectedId);
  };

  const handleReject = async (reason: string) => {
    if (!selectedId) return;
    setBusyAction(true);
    const result = await client.rejectApproval(selectedId, reason);
    setBusyAction(false);
    if (!result.ok) {
      pushToast(mapApprovalUiErrorMessage(result.error));
      return;
    }
    pushToast("Onay istegi reddedildi.");
    await refreshList();
    await refreshDetail(selectedId);
  };

  if (state === "loading") {
    return <LoadingState />;
  }

  if (state === "anonymous") {
    return (
      <EmptyState
        title="Oturum gerekli"
        description="Onay inbox verilerini gormek icin giris yapin. UI sahte onay verisi gostermez."
      />
    );
  }

  return (
    <main className="hz-approvals-inbox-page" aria-live="polite">
      <header className="hz-approvals-inbox-top">
        <div>
          <p className="hz-approvals-inbox-eyebrow">Operator workspace</p>
          <h1 className="hz-approvals-inbox-title">Onaylar</h1>
          <p className="hz-approvals-inbox-subtitle">Approval Inbox / operator onaylari, worker ve outbox sinyalleri.</p>
        </div>
        <ApprovalSafetyBadge repositoryMode={repositoryMode} workerHealth={workerHealth} />
      </header>

      <div className="hz-approvals-inbox-stats" aria-label="Onay ozetleri">
        <span>Toplam {stats.total}</span>
        <span>Bekleyen {stats.pending}</span>
        <span>Onaylanan {stats.approved}</span>
        <span>Reddedilen {stats.rejected}</span>
      </div>

      <div className="hz-approvals-inbox-filters" role="toolbar" aria-label="Durum filtresi">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`hz-approvals-inbox-filter${filter === option.id ? " is-active" : ""}`}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="hz-approvals-inbox-toolbar">
        <label className="hz-approvals-inbox-search">
          <span className="hz-approvals-inbox-search-label">Ara</span>
          <input
            type="search"
            className="hz-approvals-inbox-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="approvalRequestId, actionKey, actor veya reason"
          />
        </label>
        <label className="hz-approvals-inbox-sort">
          <span className="hz-approvals-inbox-sort-label">Siralama</span>
          <select className="hz-approvals-inbox-input" value={sortMode} onChange={(event) => setSortMode(event.target.value as ApprovalInboxSortMode)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="hz-approvals-inbox-summary">{filterSummary}</p>

      <div className="hz-approvals-inbox-layout">
        <section className="hz-approvals-inbox-main">
          {loadingList ? <LoadingState /> : null}
          {!loadingList && listError ? <ErrorState error={listError} onRetry={() => void refreshList()} /> : null}
          {!loadingList && !listError && items.length === 0 ? (
            <EmptyState description="API bos dondu. Sahte onay kaydi gosterilmez." />
          ) : null}
          {!loadingList && !listError && items.length > 0 && visibleItems.length === 0 ? (
            <EmptyState title="Filtreye uygun onay yok" description="Durum, arama veya siralama kriterlerini degistirin." />
          ) : null}
          {!loadingList && !listError && visibleItems.length > 0 ? (
            <ApprovalList items={visibleItems} selectedId={selectedId} onSelect={setSelectedId} />
          ) : null}
        </section>

        <section className="hz-approvals-inbox-side">
          {loadingDetail ? <LoadingState label="Detay yukleniyor..." /> : null}
          {!loadingDetail && detailError ? <ErrorState error={detailError} onRetry={() => selectedId && void refreshDetail(selectedId)} /> : null}
          {!loadingDetail && !detailError ? (
            <ApprovalDetailPanel item={detail} busy={busyAction} onApprove={() => void handleApprove()} onReject={(reason) => void handleReject(reason)} />
          ) : null}
        </section>
      </div>
    </main>
  );
}
