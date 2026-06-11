"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../../../providers/toast-provider";
import { ARCHIVE_DEMO_RECORDS, ARCHIVE_USE_DEMO_DATA } from "../data/archive-demo-records";
import { getArchiveLiveRecords } from "../queries/get-archive-live-records";
import type {
  ArchiveCategoryFilter,
  ArchiveRecord,
  ArchiveRecordStatus,
  ArchiveSourceKind
} from "../types";
import {
  buildArchiveReferenceKpis,
  mapArchiveRecordToContext,
  mapArchiveRecordToTableRow
} from "../utils/map-archive-to-reference-desk";

export type AomCategoryTabId =
  | "all"
  | "order"
  | "collection"
  | "delivery"
  | "return"
  | "invoice"
  | "document";

export type AomDatePreset = "all" | "today" | "week" | "month";

export const AOM_CATEGORY_TABS: { id: AomCategoryTabId; label: string }[] = [
  { id: "all", label: "Tüm Kayıtlar" },
  { id: "order", label: "Sipariş" },
  { id: "collection", label: "Tahsilat" },
  { id: "delivery", label: "Teslimat" },
  { id: "return", label: "İade" },
  { id: "invoice", label: "Fatura" },
  { id: "document", label: "Belge" }
];

function tabToCategoryKey(tab: AomCategoryTabId): ArchiveCategoryFilter | null {
  switch (tab) {
    case "order":
      return "siparis";
    case "collection":
      return "tahsilat";
    case "return":
      return "iade";
    case "invoice":
      return "fatura";
    case "document":
      return "belge";
    default:
      return null;
  }
}

function matchesCategoryTab(record: ArchiveRecord, tab: AomCategoryTabId): boolean {
  if (tab === "all") return true;
  if (tab === "delivery") {
    return record.recordType.toLowerCase().includes("teslim") || record.contextRef.toLowerCase().includes("teslim");
  }
  const key = tabToCategoryKey(tab);
  return key ? record.categoryKey === key : true;
}

function resolveDateRange(preset: AomDatePreset): { from: string; to: string } {
  if (preset === "all") return { from: "", to: "" };
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (preset === "week") {
    start.setDate(start.getDate() - 6);
  } else if (preset === "month") {
    start.setDate(1);
  }
  const toInput = (d: Date) => d.toISOString().slice(0, 10);
  return { from: toInput(start), to: toInput(end) };
}

function filterRecords(
  rows: ArchiveRecord[],
  search: string,
  tab: AomCategoryTabId,
  source: ArchiveSourceKind | "all",
  status: ArchiveRecordStatus | "all",
  dateFrom: string,
  dateTo: string,
  user: string
): ArchiveRecord[] {
  const q = search.trim().toLowerCase();
  const uq = user.trim().toLowerCase();
  return rows.filter((r) => {
    if (!matchesCategoryTab(r, tab)) return false;
    if (source !== "all" && r.source !== source) return false;
    if (status !== "all" && r.status !== status) return false;
    if (uq && !r.responsible.toLowerCase().includes(uq) && !r.auditCreatedBy.toLowerCase().includes(uq)) return false;
    if (dateFrom) {
      const start = new Date(dateFrom);
      start.setHours(0, 0, 0, 0);
      if (new Date(r.createdAt) < start) return false;
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(r.createdAt) > end) return false;
    }
    if (!q) return true;
    const blob = `${r.documentNumber} ${r.title} ${r.customerName} ${r.contextRef} ${r.recordType}`.toLowerCase();
    return blob.includes(q);
  });
}

export function useArchiveOperationsDeskState() {
  const { pushToast } = useToast();

  const [liveRows, setLiveRows] = useState<ArchiveRecord[]>([]);
  const [liveMessage, setLiveMessage] = useState<string | null>(null);
  const [liveReady, setLiveReady] = useState(false);
  const [liveLoading, setLiveLoading] = useState(!ARCHIVE_USE_DEMO_DATA);

  const baseRows = useMemo(
    () => (ARCHIVE_USE_DEMO_DATA ? ARCHIVE_DEMO_RECORDS : liveRows),
    [liveRows]
  );

  useEffect(() => {
    if (ARCHIVE_USE_DEMO_DATA) {
      setLiveLoading(false);
      return;
    }
    let active = true;
    setLiveLoading(true);
    void getArchiveLiveRecords()
      .then((result) => {
        if (!active) return;
        setLiveRows(result.records);
        setLiveMessage(result.message ?? null);
        setLiveReady(result.liveReady);
        setLiveLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLiveRows([]);
        setLiveMessage("Arşiv kayıtları şu anda alınamıyor.");
        setLiveReady(false);
        setLiveLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<AomCategoryTabId>("all");
  const [source, setSource] = useState<ArchiveSourceKind | "all">("all");
  const [status, setStatus] = useState<ArchiveRecordStatus | "all">("all");
  const [datePreset, setDatePreset] = useState<AomDatePreset>("all");
  const [userFilter, setUserFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const [actionLocks, setActionLocks] = useState<Record<string, boolean>>({});
  const [rowDownloadLocks, setRowDownloadLocks] = useState<Record<string, boolean>>({});

  const { from: dateFrom, to: dateTo } = useMemo(() => resolveDateRange(datePreset), [datePreset]);

  const filtered = useMemo(
    () => filterRecords(baseRows, search, activeTab, source, status, dateFrom, dateTo, userFilter),
    [baseRows, search, activeTab, source, status, dateFrom, dateTo, userFilter]
  );

  const kpis = useMemo(() => buildArchiveReferenceKpis(baseRows), [baseRows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pagedRows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [search, activeTab, source, status, datePreset, userFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((row) => row.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  const selectedRecord = useMemo(() => {
    if (!selectedId) return null;
    return filtered.find((r) => r.id === selectedId) ?? baseRows.find((r) => r.id === selectedId) ?? null;
  }, [selectedId, filtered, baseRows]);

  const tableRows = useMemo(() => pagedRows.map(mapArchiveRecordToTableRow), [pagedRows]);
  const contextPanel = useMemo(() => mapArchiveRecordToContext(selectedRecord), [selectedRecord]);

  const tableTotalLabel = useMemo(() => {
    if (!filtered.length) return "0 kayıt";
    return `Toplam ${new Intl.NumberFormat("tr-TR").format(filtered.length)} kayıt`;
  }, [filtered.length]);

  const paginationLabel = useMemo(() => {
    if (!filtered.length) return "0 kayıt";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, filtered.length);
    return `${start}–${end} / ${filtered.length} kayıt`;
  }, [filtered.length, page, pageSize]);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    const start = Math.max(1, Math.min(page - 2, totalPages - maxButtons + 1));
    const end = Math.min(totalPages, start + maxButtons - 1);
    const nums: number[] = [];
    for (let i = start; i <= end; i += 1) nums.push(i);
    return nums;
  }, [page, totalPages]);

  const showDemoBanner = ARCHIVE_USE_DEMO_DATA && !demoBannerDismissed;

  const statusBand = useMemo(() => {
    if (ARCHIVE_USE_DEMO_DATA) {
      return {
        kind: "demo" as const,
        message: "Örnek veri modu: arşiv listesi demo kayıtlarıdır; canlı arşiv ve indirme henüz bağlı değildir."
      };
    }
    if (liveLoading) return { kind: "loading" as const, message: "Arşiv kayıtları yükleniyor." };
    if (!liveReady) return { kind: "error" as const, message: "Arşiv kayıtları şu anda alınamıyor." };
    if (liveMessage) return { kind: "info" as const, message: liveMessage };
    if (baseRows.length > 0) return { kind: "live" as const, message: "Canlı arşiv kayıtları yüklendi." };
    return null;
  }, [liveLoading, liveReady, liveMessage, baseRows.length]);

  const lockAction = useCallback(
    (key: string, msg: string) => {
      pushToast(msg);
      setActionLocks((s) => ({ ...s, [key]: true }));
    },
    [pushToast]
  );

  const notLiveAction = useCallback(
    (key: string, detail: string) => {
      lockAction(key, `Bu işlem henüz canlı kullanıma bağlı değil. ${detail}`);
    },
    [lockAction]
  );

  const resetFilters = useCallback(() => {
    setSearch("");
    setActiveTab("all");
    setSource("all");
    setStatus("all");
    setDatePreset("all");
    setUserFilter("");
    pushToast("Filtreler sıfırlandı.");
  }, [pushToast]);

  const lockRowDownload = useCallback(
    (rowId: string) => {
      pushToast("Belge indirme henüz canlı kullanıma bağlı değil.");
      setRowDownloadLocks((s) => ({ ...s, [rowId]: true }));
    },
    [pushToast]
  );

  return {
    usingDemoData: ARCHIVE_USE_DEMO_DATA,
    liveLoading,
    liveReady,
    showDemoBanner,
    dismissDemoBanner: () => setDemoBannerDismissed(true),
    statusBand,
    kpis,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    source,
    setSource,
    status,
    setStatus,
    datePreset,
    setDatePreset,
    userFilter,
    setUserFilter,
    resetFilters,
    filteredCount: filtered.length,
    tableRows,
    selectedId,
    setSelectedId,
    selectedRecord,
    contextPanel,
    tableTotalLabel,
    paginationLabel,
    page,
    setPage,
    pageSize,
    totalPages,
    pageNumbers,
    actionLocks,
    rowDownloadLocks,
    notLiveAction,
    lockRowDownload,
    pushToast
  };
}
