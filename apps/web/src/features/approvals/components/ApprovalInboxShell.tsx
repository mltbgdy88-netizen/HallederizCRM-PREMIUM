"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../providers/auth-provider";
import { useToast } from "../../../providers/toast-provider";
import { createApprovalClient } from "../api/approval-client";
import type { ApprovalClientError, ApprovalInboxItem, ApprovalInboxStatusFilter, ApprovalSandboxAvailabilityResponse, WorkerHealthResponse } from "../types";
import {
  applyAdvancedInboxFilters,
  computeCompletedTodayCount,
  DEFAULT_APPROVAL_ADVANCED_FILTERS,
  type ApprovalAdvancedFilterState
} from "../utils/approval-card-helpers";
import {
  buildActiveFilterSummary,
  computeInboxStats,
  filterInboxItems,
  isSandboxAvailable,
  mapApprovalUiErrorMessage,
  normalizeApproval,
  searchInboxItems,
  sortInboxItems,
  type ApprovalInboxSortMode
} from "../utils/inbox-helpers";
import {
  buildLastApprovalActionSummary,
  buildOperatorSmokeChecklist,
  formatSandboxSeedOutcome,
  summarizeOperatorSmokeResult,
  type LastApprovalActionSummary
} from "../utils/operator-smoke";
import { ApprovalCardGrid } from "./ApprovalCardGrid";
import { ApprovalDetailPanel } from "./ApprovalDetailPanel";
import { EmptyState, ErrorState, LoadingState } from "./ApprovalInboxStates";
import { ApprovalInboxStatusCards } from "./ApprovalInboxStatusCards";
import { ApprovalOperatorSidePanel } from "./ApprovalOperatorSidePanel";
import { ApprovalProcessStrip } from "./ApprovalProcessStrip";
import { ApprovalSafetyBadge } from "./ApprovalSafetyBadge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const TAB_OPTIONS: { id: ApprovalInboxStatusFilter; label: string }[] = [
  { id: "pending", label: "Bekleyen" },
  { id: "approved", label: "Onaylanan" },
  { id: "rejected", label: "Reddedilen" },
  { id: "all", label: "Tümü" }
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
  const [filter, setFilter] = useState<ApprovalInboxStatusFilter>("pending");
  const [advancedFilters, setAdvancedFilters] = useState<ApprovalAdvancedFilterState>(DEFAULT_APPROVAL_ADVANCED_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<ApprovalInboxSortMode>("newest");
  const [listError, setListError] = useState<ApprovalClientError | null>(null);
  const [detailError, setDetailError] = useState<ApprovalClientError | null>(null);
  const [workerHealth, setWorkerHealth] = useState<WorkerHealthResponse | null>(null);
  const [workerSafety, setWorkerSafety] = useState<WorkerHealthResponse | null>(null);
  const [sandboxAvailability, setSandboxAvailability] = useState<ApprovalSandboxAvailabilityResponse | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);
  const [seedBusy, setSeedBusy] = useState(false);
  const [lastSeedCounts, setLastSeedCounts] = useState<{ created: number; skipped: number } | null>(null);
  const [lastSeedLine, setLastSeedLine] = useState<string | null>(null);
  const [lastApproveOk, setLastApproveOk] = useState(false);
  const [lastApproveHadBridgeSignal, setLastApproveHadBridgeSignal] = useState(false);
  const [lastApprovalSummary, setLastApprovalSummary] = useState<LastApprovalActionSummary | null>(null);

  const stats = useMemo(() => computeInboxStats(items), [items]);
  const completedToday = useMemo(() => computeCompletedTodayCount(items), [items]);

  const visibleItems = useMemo(() => {
    const base = filterInboxItems(items, filter);
    const searched = searchInboxItems(base, searchQuery);
    const sorted = sortInboxItems(searched, sortMode);
    return applyAdvancedInboxFilters(sorted, advancedFilters);
  }, [advancedFilters, filter, items, searchQuery, sortMode]);

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

  const sandboxToolbarVisible = useMemo(
    () => isSandboxAvailable(sandboxAvailability, process.env.NODE_ENV),
    [sandboxAvailability]
  );

  const sandboxAvailabilityHelp = useMemo(() => {
    if (process.env.NODE_ENV === "production") {
      return null;
    }
    if (!sandboxAvailability) {
      return "Sandbox durumu alınamadı (API veya oturum).";
    }
    if (!sandboxAvailability.sandboxSeedRouteEnabled) {
      const r = sandboxAvailability.reasons?.length ? sandboxAvailability.reasons.join(", ") : "demo dışı persistence";
      return `Sandbox seed kapalı: ${r}`;
    }
    if (!sandboxAvailability.approvalRepositoryReady) {
      const r = sandboxAvailability.reasons?.length ? sandboxAvailability.reasons.join(", ") : "repository yok";
      return `Approval repository hazır değil: ${r}`;
    }
    return null;
  }, [sandboxAvailability]);

  const operatorSmokeSummary = useMemo(() => {
    const steps = buildOperatorSmokeChecklist({
      nodeEnv: process.env.NODE_ENV,
      listLoading: loadingList,
      listError,
      items,
      detailLoading: loadingDetail,
      detailError,
      selectedId,
      detail,
      sandboxAvailability,
      workerHealth,
      workerSafety,
      lastSeedCounts,
      lastApproveOk,
      lastApproveHadBridgeSignal
    });
    return summarizeOperatorSmokeResult(steps);
  }, [
    detail,
    detailError,
    items,
    lastApproveHadBridgeSignal,
    lastApproveOk,
    lastSeedCounts,
    listError,
    loadingDetail,
    loadingList,
    sandboxAvailability,
    selectedId,
    workerHealth,
    workerSafety
  ]);

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
    setItems(
      (result.data.items ?? [])
        .map(normalizeApproval)
        .filter((row: ApprovalInboxItem | null): row is ApprovalInboxItem => row !== null)
    );
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
      const normalized = normalizeApproval(result.data.item);
      setDetail(normalized);
      setLoadingDetail(false);
    },
    [client]
  );

  const refreshSandboxAvailability = useCallback(async () => {
    const result = await client.getSandboxAvailability();
    if (!result.ok) {
      setSandboxAvailability(null);
      return;
    }
    setSandboxAvailability(result.data);
  }, [client]);

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

  const refreshWorkerSafety = useCallback(async () => {
    const result = await client.getWorkerSafety();
    if (!result.ok) {
      setWorkerSafety({
        ok: false,
        error: mapApprovalUiErrorMessage(result.error),
        reasons: result.error.reasons
      });
      return;
    }
    setWorkerSafety(result.data);
  }, [client]);

  const systemRefresh = useCallback(async () => {
    await refreshList();
    await refreshWorkerHealth();
    await refreshWorkerSafety();
    await refreshSandboxAvailability();
  }, [refreshList, refreshSandboxAvailability, refreshWorkerHealth, refreshWorkerSafety]);

  useEffect(() => {
    if (state !== "authenticated") {
      setLoadingList(false);
      return;
    }
    void refreshList();
    void refreshWorkerHealth();
    void refreshWorkerSafety();
    void refreshSandboxAvailability();
  }, [refreshList, refreshWorkerHealth, refreshWorkerSafety, refreshSandboxAvailability, state]);

  useEffect(() => {
    if (state !== "authenticated") return;
    const id = window.setInterval(() => {
      void refreshList();
      void refreshWorkerHealth();
      void refreshWorkerSafety();
    }, 30000);
    return () => window.clearInterval(id);
  }, [refreshList, refreshWorkerHealth, refreshWorkerSafety, state]);

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

  const runSandboxSeed = useCallback(async () => {
    setSeedBusy(true);
    const result = await client.seedSandboxApprovals();
    setSeedBusy(false);
    if (!result.ok) {
      pushToast(mapApprovalUiErrorMessage(result.error));
      return;
    }
    const created = result.data.created?.length ?? 0;
    const skipped = result.data.skipped?.length ?? 0;
    setLastSeedCounts({ created, skipped });
    setLastSeedLine(formatSandboxSeedOutcome(created, skipped).message);
    pushToast(formatSandboxSeedOutcome(created, skipped).message);
    await refreshList();
    await refreshSandboxAvailability();
  }, [client, pushToast, refreshList, refreshSandboxAvailability]);

  const handleApprove = async (approvalRequestId?: string) => {
    const id = approvalRequestId ?? selectedId;
    if (!id) return;
    setSelectedId(id);
    setBusyAction(true);
    setActionTargetId(id);
    const result = await client.approveApproval(id);
    setBusyAction(false);
    setActionTargetId(null);
    if (!result.ok) {
      pushToast(mapApprovalUiErrorMessage(result.error));
      return;
    }
    setLastApproveOk(true);
    const bridgeSignal =
      Boolean(result.data.duplicate) ||
      Boolean(result.data.executionId) ||
      Boolean(result.data.outboxJobId) ||
      Boolean(result.data.bridgeResult?.outboxJobEnqueued) ||
      Boolean(result.data.bridgeMode);
    setLastApproveHadBridgeSignal(bridgeSignal);
    setLastApprovalSummary(buildLastApprovalActionSummary(result.data, new Date().toISOString()));
    if (result.data.duplicate) {
      pushToast("Bu onay zaten işlenmiş; tekrar execution gönderilmedi (idempotent).");
    } else {
      pushToast("Onay isteği onaylandı.");
    }
    await refreshList();
    await refreshDetail(id);
  };

  const handleReject = async (approvalRequestId: string, reason: string) => {
    setSelectedId(approvalRequestId);
    setBusyAction(true);
    setActionTargetId(approvalRequestId);
    const result = await client.rejectApproval(approvalRequestId, reason);
    setBusyAction(false);
    setActionTargetId(null);
    if (!result.ok) {
      pushToast(mapApprovalUiErrorMessage(result.error));
      return;
    }
    pushToast("Onay isteği reddedildi.");
    await refreshList();
    await refreshDetail(approvalRequestId);
  };

  if (state === "loading") {
    return <LoadingState />;
  }

  if (state === "anonymous") {
    return (
      <EmptyState
        title="Oturum gerekli"
        description="Onay inbox verilerini görmek için giriş yapın. UI sahte onay verisi göstermez."
      />
    );
  }

  const production = process.env.NODE_ENV === "production";

  return (
    <main className="hz-approvals-inbox-page" aria-live="polite">
      <header className="hz-approvals-inbox-hero">
        <div className="hz-approvals-inbox-hero-text">
          <p className="hz-approvals-inbox-eyebrow">Operatör çalışma alanı</p>
          <h1 className="hz-approvals-inbox-title">Onaylar</h1>
          <p className="hz-approvals-inbox-subtitle">
            WhatsApp üzerinden gelen insan onayı gerektiren görevler ve diğer onay akışları; liste yalnızca API yanıtından beslenir.
          </p>
        </div>
        <ApprovalSafetyBadge repositoryMode={repositoryMode} workerHealth={workerHealth} />
      </header>

      <ApprovalInboxStatusCards
        workerHealth={workerHealth}
        workerSafety={workerSafety}
        autoRefreshLabel="Her 30 sn (liste + worker)"
        sandboxSeedSlot={
          sandboxToolbarVisible ? (
            <div className="hz-approvals-inbox-seed-slot">
              <p className="hz-approvals-inbox-status-card-k">Demo kayıt</p>
              <button type="button" className="hz-approvals-inbox-btn hz-approvals-inbox-btn--primary" disabled={seedBusy} onClick={() => void runSandboxSeed()}>
                {seedBusy ? "Oluşturuluyor..." : "Demo onay kaydı oluştur"}
              </button>
              {lastSeedLine ? (
                <p className="hz-approvals-inbox-status-card-sub hz-approvals-inbox-muted" role="status">
                  {lastSeedLine}
                </p>
              ) : null}
            </div>
          ) : null
        }
      />

      <div className="hz-approvals-inbox-workbench">
        <div className="hz-approvals-inbox-workbench-main">
          <div className="hz-approvals-inbox-tabs" role="tablist" aria-label="Onay durumu sekmeleri">
            {TAB_OPTIONS.map((tab) => {
              const count =
                tab.id === "all"
                  ? stats.total
                  : tab.id === "pending"
                    ? stats.pending
                    : tab.id === "approved"
                      ? stats.approved
                      : stats.rejected;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === tab.id}
                  className={`hz-approvals-inbox-tab${filter === tab.id ? " is-active" : ""}`}
                  onClick={() => setFilter(tab.id)}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="hz-approvals-inbox-toolbar">
            <label className="hz-approvals-inbox-search">
              <span className="hz-approvals-inbox-search-label">Ara</span>
              <input
                type="search"
                className="hz-approvals-inbox-input"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="approvalRequestId, actionKey, payload, reason"
              />
            </label>
            <label className="hz-approvals-inbox-sort">
              <span className="hz-approvals-inbox-sort-label">Sıralama</span>
              <select className="hz-approvals-inbox-input" value={sortMode} onChange={(event) => setSortMode(event.target.value as ApprovalInboxSortMode)}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="hz-approvals-inbox-btn" title="Listeyi yenile" aria-label="Listeyi yenile" onClick={() => void refreshList()}>
              Yenile
            </button>
          </div>

          <p className="hz-approvals-inbox-summary">{filterSummary}</p>

          <div className="hz-approvals-inbox-main-scroll">
            {loadingList ? <LoadingState /> : null}
            {!loadingList && listError ? <ErrorState error={listError} onRetry={() => void refreshList()} /> : null}
            {!loadingList && !listError && items.length === 0 ? (
              <EmptyState
                title="Liste boş"
                description={
                  sandboxToolbarVisible
                    ? "API gerçek zamanlı boş döndü. Sahte kayıt gösterilmez; demo onay oluştur butonunu veya sandbox seed kullanın."
                    : "API gerçek zamanlı boş döndü. Sahte kayıt gösterilmez."
                }
              />
            ) : null}
            {!loadingList && !listError && items.length > 0 && visibleItems.length === 0 ? (
              <EmptyState title="Filtreye uygun onay yok" description="Sekme, arama, sıralama veya yan panel filtrelerini değiştirin." />
            ) : null}
            {!loadingList && !listError && visibleItems.length > 0 ? (
              <ApprovalCardGrid
                items={visibleItems}
                selectedId={selectedId}
                onSelect={setSelectedId}
                actionBusy={busyAction}
                actingOnId={actionTargetId}
                onApprove={(id) => void handleApprove(id)}
                onReject={(id, reason) => void handleReject(id, reason)}
              />
            ) : null}
          </div>
        </div>

        <ApprovalOperatorSidePanel
          production={production}
          workerHealth={workerHealth}
          workerSafety={workerSafety}
          sandboxAvailability={sandboxAvailability}
          operatorSmokeSummary={operatorSmokeSummary}
          stats={stats}
          completedToday={completedToday}
          advancedFilters={advancedFilters}
          onAdvancedFiltersChange={setAdvancedFilters}
          client={client}
          sandboxToolbarVisible={sandboxToolbarVisible}
          availabilityHelp={sandboxAvailabilityHelp}
          onSystemRefresh={async () => {
            await systemRefresh();
          }}
          onWorkerHealthRefresh={async () => {
            await refreshWorkerHealth();
            await refreshWorkerSafety();
          }}
          onSandboxAvailabilityRefresh={async () => {
            await refreshSandboxAvailability();
          }}
          onAfterSeed={async () => {
            await refreshList();
            await refreshSandboxAvailability();
          }}
          onSeedComplete={(created, skipped) => {
            setLastSeedCounts({ created, skipped });
            setLastSeedLine(formatSandboxSeedOutcome(created, skipped).message);
          }}
        />
      </div>

      <section className="hz-approvals-inbox-detail-wrap" aria-labelledby="approval-selected-detail">
        <h2 id="approval-selected-detail" className="hz-approvals-inbox-detail-section-title">
          Seçili onay detayı
        </h2>
        {loadingDetail ? <LoadingState label="Detay yükleniyor..." /> : null}
        {!loadingDetail && detailError ? <ErrorState error={detailError} onRetry={() => selectedId && void refreshDetail(selectedId)} /> : null}
        {!loadingDetail && !detailError ? (
          <ApprovalDetailPanel
            item={detail}
            busy={busyAction}
            lastApprovalSummary={lastApprovalSummary}
            onApprove={() => void handleApprove()}
            onReject={(reason) => selectedId && void handleReject(selectedId, reason)}
          />
        ) : null}
      </section>

      <ApprovalProcessStrip />
    </main>
  );
}
