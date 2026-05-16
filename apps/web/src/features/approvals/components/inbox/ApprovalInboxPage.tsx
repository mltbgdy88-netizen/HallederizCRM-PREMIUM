"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../../../../providers/toast-provider";
import { APPROVAL_INBOX_DEMO_ROWS, type ApprovalInboxRecord, type ApprovalInboxViewId } from "../../data/approval-inbox-demo";
import { ApprovalInboxEmpty, ApprovalInboxError, ApprovalInboxLoading } from "../ApprovalInboxStates";
import { ApprovalInboxDetailPanel } from "./ApprovalInboxDetailPanel";
import { ApprovalKpiCards } from "./ApprovalKpiCards";
import { ApprovalSidebar, DEFAULT_APPROVAL_INBOX_FILTERS, type ApprovalInboxFilterState } from "./ApprovalSidebar";
import { ApprovalTable } from "./ApprovalTable";
import { filterApprovalInboxRows } from "./filter-inbox-rows";

type UiPhase = "loading" | "ready" | "empty" | "error";

const DEMO_PREVIEW =
  "Demo onay kutusu verisi — gerçek API bağlantısı sonraki aşamada bağlanacak.";

export function ApprovalInboxPage() {
  const router = useRouter();
  const { pushToast } = useToast();

  const [phase, setPhase] = useState<UiPhase>("loading");
  const [activeView, setActiveView] = useState<ApprovalInboxViewId>("bana_atanan");
  const [filters, setFilters] = useState<ApprovalInboxFilterState>(DEFAULT_APPROVAL_INBOX_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>("on-003");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [actionDone, setActionDone] = useState<Record<string, boolean>>({});

  const bootstrap = useCallback(async () => {
    setPhase("loading");
    await new Promise((resolve) => setTimeout(resolve, 420));
    setPhase("ready");
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const filteredRows = useMemo(
    () =>
      filterApprovalInboxRows(APPROVAL_INBOX_DEMO_ROWS, {
        activeView,
        onlyCritical: false,
        searchQuery: "",
        filters
      }),
    [activeView, filters]
  );

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const selectedRecord = useMemo(
    () => filteredRows.find((row) => row.id === selectedId) ?? APPROVAL_INBOX_DEMO_ROWS.find((row) => row.id === selectedId) ?? null,
    [filteredRows, selectedId]
  );

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
  }, [activeView, filters, pageSize]);

  const updateFilter = <K extends keyof ApprovalInboxFilterState>(key: K, value: ApprovalInboxFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const markDemoAction = (record: ApprovalInboxRecord, message: string) => {
    setActionDone((prev) => ({ ...prev, [record.id]: true }));
    pushToast(message);
  };

  const listPhase: UiPhase = phase === "ready" && filteredRows.length === 0 ? "empty" : phase;

  return (
    <main className="hz-approvals-page hz-approvals-inbox-desk-page">
      <div className="hz-approvals-inbox-desk-workspace">
      <div className="hz-approvals-inbox-desk-top">
        <ApprovalKpiCards />
        <p className="hz-approvals-inbox-desk-preview" role="status">
          {DEMO_PREVIEW}
        </p>
      </div>

      <div className="hz-approvals-inbox-desk-body">
        <ApprovalSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilters={() => setFilters(DEFAULT_APPROVAL_INBOX_FILTERS)}
          onSaveView={() => pushToast("Görünüm kaydedildi (demo).")}
        />

        <section className="hz-approvals-inbox-desk-center" aria-label="Onay listesi alanı">
          {listPhase === "loading" ? <ApprovalInboxLoading label="Onay kutusu yükleniyor…" /> : null}
          {listPhase === "error" ? (
            <ApprovalInboxError
              error={{ kind: "unknown", message: "Onay kutusu verisi şu an alınamıyor.", reasons: ["Demo hata durumu"] }}
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
          actionDone={actionDone}
          onApprove={() => {
            if (!selectedRecord) return;
            markDemoAction(selectedRecord, `${selectedRecord.title} onaylandı (demo).`);
          }}
          onReject={() => {
            if (!selectedRecord) return;
            markDemoAction(selectedRecord, `${selectedRecord.title} reddedildi (demo).`);
          }}
          onSendToReview={() => {
            if (!selectedRecord) return;
            pushToast(`${selectedRecord.title} incelemeye gönderildi (demo).`);
          }}
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
