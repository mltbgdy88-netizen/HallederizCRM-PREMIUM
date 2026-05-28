"use client";

import {
  FilterChip,
  FilterToolbar,
  FilterToolbarChips,
  FilterToolbarRow,
  FilterToolbarSearch,
  FilterToolbarViews,
  SplitContentLayout
} from "@hallederiz/ui";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { useAuth } from "../../../providers/auth-provider";
import { useToast } from "../../../providers/toast-provider";
import { createApprovalClient } from "../api/approval-client";
import type {
  ApprovalClientError,
  ApprovalInboxItem,
  ApprovalInboxStatusFilter,
  ApprovalSandboxAvailabilityResponse,
  WorkerHealthResponse,
  WorkerJobListResponse
} from "../types";
import {
  buildActiveFilterSummary,
  computeInboxStats,
  filterInboxItems,
  isSandboxAvailable,
  mapApprovalUiErrorMessage,
  normalizeApproval,
  searchInboxItems,
  sortInboxItems,
  summarizeWorkerHealth,
  type ApprovalInboxSortMode
} from "../utils/inbox-helpers";
import {
  buildLastApprovalActionSummary,
  buildOperatorSmokeChecklist,
  formatSandboxSeedOutcome,
  summarizeOperatorSmokeResult,
  type LastApprovalActionSummary
} from "../utils/operator-smoke";
import { ApprovalDetailPanel } from "./ApprovalDetailPanel";
import { ApprovalInboxEmpty, ApprovalInboxError, ApprovalInboxLoading } from "./ApprovalInboxStates";
import { ApprovalList } from "./ApprovalList";
import { ApprovalOperatorSmokePanel } from "./ApprovalOperatorSmokePanel";
import { ApprovalSafetyBadge } from "./ApprovalSafetyBadge";
import { ApprovalSandboxToolbar } from "./ApprovalSandboxToolbar";
import { WorkerQueueObservabilityPanel } from "./WorkerQueueObservabilityPanel";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const FILTER_OPTIONS: { id: ApprovalInboxStatusFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "pending", label: "Bekleyen" },
  { id: "approved", label: "Onaylandı" },
  { id: "rejected", label: "Reddedildi" }
];

const SORT_OPTIONS: { id: ApprovalInboxSortMode; label: string }[] = [
  { id: "newest", label: "En yeni" },
  { id: "oldest", label: "En eski" },
  { id: "actionKey", label: "İşlem anahtarı" }
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
  const [workerSafety, setWorkerSafety] = useState<WorkerHealthResponse | null>(null);
  const [workerOutbox, setWorkerOutbox] = useState<WorkerJobListResponse | null>(null);
  const [workerDeadLetter, setWorkerDeadLetter] = useState<WorkerJobListResponse | null>(null);
  const [workerQueuesLoading, setWorkerQueuesLoading] = useState(false);
  const [workerOutboxError, setWorkerOutboxError] = useState<ApprovalClientError | null>(null);
  const [workerDeadLetterError, setWorkerDeadLetterError] = useState<ApprovalClientError | null>(null);
  const [sandboxAvailability, setSandboxAvailability] = useState<ApprovalSandboxAvailabilityResponse | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [lastSeedCounts, setLastSeedCounts] = useState<{ created: number; skipped: number } | null>(null);
  const [lastSeedLine, setLastSeedLine] = useState<string | null>(null);
  const [lastApproveOk, setLastApproveOk] = useState(false);
  const [lastApproveHadBridgeSignal, setLastApproveHadBridgeSignal] = useState(false);
  const [lastApprovalSummary, setLastApprovalSummary] = useState<LastApprovalActionSummary | null>(null);

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

  const sandboxToolbarVisible = useMemo(
    () => isSandboxAvailable(sandboxAvailability, process.env.NODE_ENV),
    [sandboxAvailability]
  );

  const sandboxAvailabilityHelp = useMemo(() => {
    if (process.env.NODE_ENV === "production") {
      return null;
    }
    if (!sandboxAvailability) {
      return "Sandbox durumu alinamadi (API veya oturum).";
    }
    if (!sandboxAvailability.sandboxSeedRouteEnabled) {
      const r = sandboxAvailability.reasons?.length ? sandboxAvailability.reasons.join(", ") : "demo disi persistence";
      return `Sandbox seed kapali: ${r}`;
    }
    if (!sandboxAvailability.approvalRepositoryReady) {
      const r = sandboxAvailability.reasons?.length ? sandboxAvailability.reasons.join(", ") : "repository yok";
      return `Approval repository hazir degil: ${r}`;
    }
    return null;
  }, [sandboxAvailability]);

  const dlqSummary = useMemo(() => {
    const summary = workerHealth?.health?.summary;
    const counts = workerHealth?.counts;
    const parts: string[] = [];
    if (counts) {
      parts.push(`Repo: bekleyen ${counts.pending}, claim ${counts.claimed}, hata ${counts.failed}, DLQ ${counts.deadLetter}`);
    }
    if (summary) {
      const dup = typeof summary.duplicates === "number" ? `, dup ${summary.duplicates}` : "";
      parts.push(
        `Tick: islenen ${summary.processed}, tamamlanan ${summary.completed}, hata ${summary.failed}, DLQ ${summary.deadLettered}, retry ${summary.retried}${dup}`
      );
    }
    return parts.length ? parts.join(" · ") : "Özete veri yok (worker health özeti veya sayım gelmedi).";
  }, [workerHealth]);

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
    setItems((result.data.items ?? []).map(normalizeApproval).filter((row): row is ApprovalInboxItem => Boolean(row)));
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

  const refreshWorkerQueues = useCallback(async () => {
    setWorkerQueuesLoading(true);
    setWorkerOutboxError(null);
    setWorkerDeadLetterError(null);
    const [o, d] = await Promise.all([client.getWorkerOutbox(), client.getWorkerDeadLetter()]);
    if (o.ok) {
      setWorkerOutbox(o.data);
    } else {
      setWorkerOutbox(null);
      setWorkerOutboxError(o.error);
    }
    if (d.ok) {
      setWorkerDeadLetter(d.data);
    } else {
      setWorkerDeadLetter(null);
      setWorkerDeadLetterError(d.error);
    }
    setWorkerQueuesLoading(false);
  }, [client]);

  useEffect(() => {
    if (state !== "authenticated") {
      setLoadingList(false);
      return;
    }
    void refreshList();
    void refreshWorkerHealth();
    void refreshWorkerSafety();
    void refreshWorkerQueues();
    void refreshSandboxAvailability();
  }, [refreshList, refreshWorkerHealth, refreshWorkerQueues, refreshWorkerSafety, refreshSandboxAvailability, state]);

  useEffect(() => {
    if (!visibleItems.length) {
      setSelectedId(null);
      return;
    }
    const stillHere =
      selectedId !== null && visibleItems.some((row) => row.approvalRequestId === selectedId);
    if (!stillHere) {
      const next = visibleItems[0];
      if (next) {
        setSelectedId(next.approvalRequestId);
      }
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
      pushToast("Bu onay zaten islenmis; tekrar execution gonderilmedi (idempotent).");
    } else {
      pushToast("Onay istegi onaylandi.");
    }
    await refreshList();
    await refreshDetail(selectedId);
    void refreshWorkerHealth();
    void refreshWorkerQueues();
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
    void refreshWorkerHealth();
    void refreshWorkerQueues();
  };

  if (state === "loading") {
    return <ApprovalInboxLoading />;
  }

  if (state === "anonymous") {
    return (
      <ApprovalInboxEmpty
        title="Oturum gerekli"
        description="Onay inbox verilerini gormek icin giris yapin. UI sahte onay verisi gostermez."
      />
    );
  }

  return (
    <main className="hz-approvals-page hz-approvals-inbox-page" aria-live="polite">
      <header className="hz-approvals-inbox-top">
        <div>
          <p className="hz-approvals-inbox-eyebrow">Operatör çalışma alanı</p>
          <h1 className="hz-approvals-inbox-title">Onaylar</h1>
          <p className="hz-approvals-inbox-subtitle">Onay gelen kutusu; bekleyen kararlar ve işlem durumu özeti.</p>
          <p className="hz-approvals-inbox-top-links">
            <Link href="/onaylar/kurallar" className="hz-approvals-inbox-policy-link">
              Politika matrisi
            </Link>
            <span className="hz-approvals-inbox-top-links-sep" aria-hidden="true">
              ·
            </span>
            <Link href="/ayarlar/operasyon-gozlem" className="hz-approvals-inbox-policy-link">
              Operasyon ve gözlem
            </Link>
            <span className="hz-approvals-inbox-top-links-sep" aria-hidden="true">
              ·
            </span>
            <span className="hz-approvals-inbox-muted">Alan kayıtlarından onay gerektiren aksiyonlar</span>
          </p>
        </div>
        <ApprovalSafetyBadge repositoryMode={repositoryMode} workerHealth={workerHealth} />
      </header>

      {dataSourceConfig.useDemoData ? (
        <div className="hz-approvals-inbox-preview-band" role="status">
          Demo veri modunda API boş dönerse liste boş kalır; sandbox araçlarıyla örnek onay oluşturabilirsiniz.
        </div>
      ) : null}

      <div className="hz-approvals-inbox-stats" aria-label="Onay özetleri">
        <span>Toplam {stats.total}</span>
        <span>Bekleyen {stats.pending}</span>
        <span>Onaylanan {stats.approved}</span>
        <span>Reddedilen {stats.rejected}</span>
      </div>

      <div className="hz-approvals-worker-strip" aria-label="İşlem servisi ve güvenlik özeti">
        <div className="hz-approvals-worker-card">
          <h4>İşlem servisi</h4>
          <p>{summarizeWorkerHealth(workerHealth)}</p>
        </div>
        <div className="hz-approvals-worker-card">
          <h4>Güvenlik özeti</h4>
          <p>{workerSafety?.productionSafety?.labels?.join(" · ") || summarizeWorkerHealth(workerSafety)}</p>
          <p className="hz-approvals-inbox-muted">{dlqSummary}</p>
        </div>
      </div>

      <WorkerQueueObservabilityPanel
        workerHealth={workerHealth}
        outbox={workerOutbox}
        deadLetter={workerDeadLetter}
        outboxError={workerOutboxError}
        deadLetterError={workerDeadLetterError}
        loading={workerQueuesLoading}
      />

      <ApprovalOperatorSmokePanel
        production={process.env.NODE_ENV === "production"}
        summary={operatorSmokeSummary}
        lastSeedLine={lastSeedLine}
        lastApprovalSummary={lastApprovalSummary}
      />

      <ApprovalSandboxToolbar
        client={client}
        visible={sandboxToolbarVisible}
        availabilityHelp={sandboxAvailabilityHelp}
        onSeedCounts={(counts: { created: number; skipped: number }) => {
          setLastSeedCounts(counts);
          setLastSeedLine(formatSandboxSeedOutcome(counts.created, counts.skipped).message);
        }}
        onAfterSeed={async () => {
          await refreshList();
          await refreshSandboxAvailability();
          void refreshWorkerHealth();
          void refreshWorkerQueues();
        }}
      />

      {!sandboxToolbarVisible && process.env.NODE_ENV !== "production" && sandboxAvailabilityHelp ? (
        <p className="hz-approvals-inbox-muted" role="status">
          {sandboxAvailabilityHelp}
        </p>
      ) : null}

      <div role="toolbar" aria-label="Onay inbox filtreleri">
        <FilterToolbar>
          <FilterToolbarRow>
            <FilterToolbarChips>
              {FILTER_OPTIONS.map((option) => (
                <FilterChip key={option.id} active={filter === option.id} onClick={() => setFilter(option.id)}>
                  {option.label}
                </FilterChip>
              ))}
            </FilterToolbarChips>
          </FilterToolbarRow>
          <FilterToolbarRow>
            <FilterToolbarSearch>
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
            </FilterToolbarSearch>
            <FilterToolbarViews>
              <label className="hz-approvals-inbox-sort">
                <span className="hz-approvals-inbox-sort-label">Siralama</span>
                <select
                  className="hz-approvals-inbox-input"
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as ApprovalInboxSortMode)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </FilterToolbarViews>
          </FilterToolbarRow>
        </FilterToolbar>
      </div>

      <p className="hz-approvals-inbox-summary">{filterSummary}</p>

      <SplitContentLayout
        sideWidth="detail"
        main={
          <>
            {loadingList ? <ApprovalInboxLoading /> : null}
            {!loadingList && listError ? <ApprovalInboxError error={listError} onRetry={() => void refreshList()} /> : null}
            {!loadingList && !listError && items.length === 0 ? (
              <ApprovalInboxEmpty
                title="Liste bos"
                description={
                  sandboxToolbarVisible
                    ? "API gercek zamanli bos dondu. Sahte kayit gosterilmez; asagidaki sandbox araci ile demo onaylari olusturabilirsiniz."
                    : "API gercek zamanli bos dondu. Sahte kayit gosterilmez."
                }
              />
            ) : null}
            {!loadingList && !listError && items.length > 0 && visibleItems.length === 0 ? (
              <ApprovalInboxEmpty title="Filtreye uygun onay yok" description="Durum, arama veya siralama kriterlerini degistirin." />
            ) : null}
            {!loadingList && !listError && visibleItems.length > 0 ? (
              <ApprovalList items={visibleItems} selectedId={selectedId} onSelect={setSelectedId} />
            ) : null}
          </>
        }
        side={
          <>
            {loadingDetail ? <ApprovalInboxLoading label="Detay yükleniyor…" /> : null}
            {!loadingDetail && detailError ? <ApprovalInboxError error={detailError} onRetry={() => selectedId && void refreshDetail(selectedId)} /> : null}
            {!loadingDetail && !detailError ? (
              <ApprovalDetailPanel
                item={detail}
                busy={busyAction}
                lastApprovalSummary={lastApprovalSummary}
                onApprove={() => void handleApprove()}
                onReject={(reason) => void handleReject(reason)}
              />
            ) : null}
          </>
        }
      />
    </main>
  );
}

