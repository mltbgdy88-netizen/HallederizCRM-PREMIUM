import type { Customer, Document } from "@hallederiz/types";
import { getDocuments } from "../../documents/queries/get-documents";
import { buildTableMeta, formatTrDateTime } from "../../../lib/reference/formatters";
import {
  BOM_FILTERS,
  BOM_FILTER_SEARCH,
  BOM_KPIS,
  BOM_PAGE_NUMBERS,
  BOM_SUBTITLE,
  BOM_TABLE_ROWS,
  BOM_TABLE_TOTAL,
  BOM_TITLE,
  getBomContext,
  type BomContext,
  type BomDocStatus,
  type BomKpi,
  type BomTableRow
} from "../data/belgeler-operasyon-mock";

export type BelgelerReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: BomKpi[];
  filterSearch: string;
  filters: typeof BOM_FILTERS;
  demoBanner: string | null;
  tableRows: BomTableRow[];
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: (rowId: string) => BomContext;
};

function mapDocStatus(fileStatus: Document["fileStatus"]): BomDocStatus {
  if (fileStatus === "ready") return "Yüklendi";
  if (fileStatus === "missing" || fileStatus === "pending" || fileStatus === "unavailable") return "Bekliyor";
  return "Yüklendi";
}

function mapDocumentTableRow(document: Document, customers: Customer[]): BomTableRow {
  return {
    id: document.id,
    docNo: document.documentNo || document.id,
    type: document.type || "Belge",
    customer: customers.find((c) => c.id === document.customerId)?.name ?? document.entityNo ?? "—",
    date: formatTrDateTime(document.createdAt),
    status: mapDocStatus(document.fileStatus)
  };
}

function buildContext(document: Document, customers: Customer[]): BomContext {
  const customer = customers.find((c) => c.id === document.customerId);
  return {
    rowId: document.id,
    fileName: document.title || document.documentNo || "—",
    fileSize: "—",
    status: mapDocStatus(document.fileStatus),
    type: document.type || "Belge",
    docNo: document.documentNo || document.id,
    customer: customer?.name ?? document.entityNo ?? "—",
    date: formatTrDateTime(document.createdAt),
    uploader: "—",
    description: document.previewText || "—",
    tags: [],
    history: []
  };
}

function buildLiveSnapshot(documents: Document[], customers: Customer[]): BelgelerReferenceSnapshot {
  const tableRows = documents.map((d) => mapDocumentTableRow(d, customers));
  const meta = buildTableMeta(documents.length);
  const contextByRow = Object.fromEntries(
    documents.map((d) => [d.id, buildContext(d, customers)])
  ) as Record<string, BomContext>;

  return {
    title: BOM_TITLE,
    subtitle: BOM_SUBTITLE,
    kpis: [
      { id: "uploaded", label: "Yüklenen", value: String(tableRows.filter((r) => r.status === "Yüklendi").length), tone: "green" },
      { id: "pending", label: "Bekleyen", value: String(tableRows.filter((r) => r.status === "Bekliyor").length), tone: "orange" },
      { id: "archived", label: "Arşivlenen", value: String(tableRows.filter((r) => r.status === "Arşivlendi").length), tone: "slate" },
      { id: "total", label: "Toplam Belge", value: String(documents.length), tone: "teal" }
    ],
    filterSearch: BOM_FILTER_SEARCH,
    filters: BOM_FILTERS,
    demoBanner: null,
    tableRows,
    tableTotal: meta.tableTotal,
    pageNumbers: meta.pageNumbers,
    getContext: (rowId) => contextByRow[rowId] ?? buildContext(documents[0]!, customers)
  };
}

export function loadBelgelerReferenceDemo(): BelgelerReferenceSnapshot {
  return {
    title: BOM_TITLE,
    subtitle: BOM_SUBTITLE,
    kpis: BOM_KPIS,
    filterSearch: BOM_FILTER_SEARCH,
    filters: BOM_FILTERS,
    demoBanner: null,
    tableRows: BOM_TABLE_ROWS,
    tableTotal: BOM_TABLE_TOTAL,
    pageNumbers: BOM_PAGE_NUMBERS,
    getContext: getBomContext
  };
}

export async function loadBelgelerReferenceLive(): Promise<BelgelerReferenceSnapshot> {
  const { documents, customers } = await getDocuments();
  return buildLiveSnapshot(documents, customers);
}

export const BELGELER_REFERENCE_INITIAL = loadBelgelerReferenceDemo();

