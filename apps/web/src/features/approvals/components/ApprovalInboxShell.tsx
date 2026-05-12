"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../providers/auth-provider";
import { useToast } from "../../../providers/toast-provider";
import { createApprovalClient } from "../api/approval-client";
import type { ApprovalClientError, ApprovalInboxItem, ApprovalInboxStatusFilter, WorkerHealthResponse } from "../types";
import { ApprovalDetailPanel } from "./ApprovalDetailPanel";
import { EmptyState, ErrorState, LoadingState } from "./ApprovalInboxStates";
import { ApprovalList } from "./ApprovalList";
import { ApprovalSafetyBadge } from "./ApprovalSafetyBadge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const FILTER_OPTIONS: { id: ApprovalInboxStatusFilter; label: string }[] = [
  { id: "all", label: "Tumu" },
  { id: "pending", label: "Bekleyen" },
  { id: "approved", label: "Onaylanan" },
  { id: "rejected", label: "Reddedilen" }
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
  const [listError, setListError] = useState<ApprovalClientError | null>(null);
  const [detailError, setDetailError] = useState<ApprovalClientError | null>(null);
  const [workerHealth, setWorkerHealth] = useState<WorkerHealthResponse | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [busyAction, setBusyAction] = useState(false);

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.status === filter);
  }, [filter, items]);

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
        error: result.error.message,
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
    if (!selectedId && items[0]) {
      setSelectedId(items[0].approvalRequestId);
    }
  }, [items, selectedId]);

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
      pushToast(result.error.message);
      return;
    }
    if (result.data.duplicate) {
      pushToast("Kayit zaten islenmis.");
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
      pushToast(result.error.message);
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
          <h1 className="hz-approvals-inbox-title">Approval Inbox</h1>
          <p className="hz-approvals-inbox-subtitle">Pending approvals, risk metadata ve guvenli approve/reject akisi.</p>
        </div>
        <ApprovalSafetyBadge repositoryMode={repositoryMode} workerHealth={workerHealth} />
      </header>

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

      <div className="hz-approvals-inbox-layout">
        <section className="hz-approvals-inbox-main">
          {loadingList ? <LoadingState /> : null}
          {!loadingList && listError ? <ErrorState error={listError} onRetry={() => void refreshList()} /> : null}
          {!loadingList && !listError && filteredItems.length === 0 ? (
            <EmptyState description="API bos dondu. Sahte onay kaydi gosterilmez." />
          ) : null}
          {!loadingList && !listError && filteredItems.length > 0 ? (
            <ApprovalList items={filteredItems} selectedId={selectedId} onSelect={setSelectedId} />
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
