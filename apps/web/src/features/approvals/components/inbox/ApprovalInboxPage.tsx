"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dataSourceConfig, sdk } from "../../../../lib/data-source";
import { useToast } from "../../../../providers/toast-provider";
import { executeApprovalMutation } from "../../mutations";
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

export function ApprovalInboxPage() {
  const router = useRouter();
  const { pushToast } = useToast();

  const [phase, setPhase] = useState<UiPhase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ApprovalInboxViewId>("tum");
  const [filters, setFilters] = useState<ApprovalInboxFilterState>(DEFAULT_APPROVAL_INBOX_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyCritical, setOnlyCritical] = useState(false);
  const [rows, setRows] = useState<ApprovalInboxRecord[]>([]);
  const [actionPending, setActionPending] = useState<"approve" | "reject" | "review" | null>(null);
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
      setErrorMessage(error instanceof Error ? error.message : "Onay listesi alınamadı.");
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
      setDetailError(error instanceof Error ? error.message : "Detay yüklenemedi.");
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
    async (kind: "approve" | "reject" | "review") => {
      if (!selectedRecord || actionPending) return;
      setActionPending(kind);
      try {
        if (kind === "approve") {
          await sdk.approvals.approve(selectedRecord.id);
          pushToast("Onay kaydı onaylandı.");
        } else if (kind === "reject") {
          await sdk.approvals.reject(selectedRecord.id);
          pushToast("Onay kaydı reddedildi.");
        } else {
          await executeApprovalMutation(selectedRecord.id);
          pushToast("Kayıt inceleme iş akışına gönderildi.");
        }
        await bootstrap();
        await refreshDetail();
      } catch (error) {
        pushToast(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
      } finally {
        setActionPending(null);
      }
    },
    [actionPending, bootstrap, pushToast, refreshDetail, selectedRecord]
  );

  const listPhase: UiPhase = phase === "ready" && filteredRows.length === 0 ? "empty" : phase;

  return (
    <main className="hz-approvals-page hz-approvals-inbox-desk-page">
      <div className="hz-approvals-inbox-desk-workspace">
        <div className="hz-approvals-inbox-desk-top">
          <ApprovalInboxHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onlyCritical={onlyCritical}
            onOnlyCriticalChange={setOnlyCritical}
            onRefresh={() => void bootstrap()}
            refreshing={phase === "loading"}
            lastSyncLabel={new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date())}
          />
          <ApprovalKpiCards rows={rows} />
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
                title="Filtreye uygun onay yok"
                description="Görünüm veya filtre kriterlerini değiştirin."
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
            onSendToReview={() => void runAction("review")}
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