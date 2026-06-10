import type { Customer, Offer } from "@hallederiz/types";
import { mapOfferToRow } from "../../offers/mappers/map-offer-row";
import { getOffers } from "../../offers/queries/get-offers";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { buildTableMeta, formatTryMoney } from "../../../lib/reference/formatters";
import {
  getTomContext,
  TOM_DEMO_BANNER,
  TOM_FILTERS,
  TOM_FILTER_SEARCH_PLACEHOLDER,
  TOM_KPIS,
  TOM_PAGE_NUMBERS,
  TOM_SUBTITLE,
  TOM_TABLE_ROWS,
  TOM_TABLE_TOTAL,
  TOM_TITLE,
  type TeklifContextDetail,
  type TeklifKpi,
  type TeklifStatus,
  type TeklifTableRow
} from "../data/teklifler-operasyon-mock";

export type TekliflerReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: TeklifKpi[];
  filterSearchPlaceholder: string;
  filters: typeof TOM_FILTERS;
  demoBanner: string | null;
  tableRows: TeklifTableRow[];
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: (rowId: string) => TeklifContextDetail;
};

function mapStatusLabel(label: string): TeklifStatus {
  if (label.includes("Onay")) return "Onay Bekliyor";
  if (label.includes("Cevap") || label.includes("Bekliyor")) return "Cevap Bekliyor";
  if (label.includes("Red")) return "Reddedildi";
  return "Açık";
}

function mapOfferTableRow(offer: Offer, customer?: Customer): TeklifTableRow {
  const row = mapOfferToRow(offer, customer);
  return {
    id: offer.id,
    offerNo: row.offerNo,
    customer: row.customerName,
    amount: row.totalLabel.startsWith("₺") ? row.totalLabel : `₺${row.totalLabel}`,
    status: mapStatusLabel(row.statusLabel),
    validity: row.validUntilLabel,
    followUp: row.latestContactLabel
  };
}

function buildContext(offer: Offer, customer?: Customer): TeklifContextDetail {
  const row = mapOfferToRow(offer, customer);
  const status = mapStatusLabel(row.statusLabel);
  return {
    offerId: offer.id,
    offerNo: offer.offerNo,
    status,
    createdAt: row.createdAtLabel,
    customer: row.customerName,
    contact: "—",
    phone: customer?.phone || "—",
    email: customer?.email || "—",
    amount: row.totalLabel.startsWith("₺") ? row.totalLabel : formatTryMoney(offer.grandTotal, offer.currency),
    validity: row.validUntilLabel,
    validityAlertTitle: status === "Cevap Bekliyor" ? "Geçerlilik Takibi" : "Geçerlilik",
    validityAlertDetail: `Geçerlilik tarihi: ${row.validUntilLabel}`,
    responseAlertTitle: "Takip",
    responseAlertDetail: row.latestContactLabel,
    nextSteps: []
  };
}

function buildLiveSnapshot(offers: Offer[], customers: Customer[]): TekliflerReferenceSnapshot {
  const tableRows = offers.map((offer) =>
    mapOfferTableRow(offer, customers.find((c) => c.id === offer.customerId))
  );
  const meta = buildTableMeta(offers.length);
  const contextByRow = Object.fromEntries(
    offers.map((offer) => [
      offer.id,
      buildContext(offer, customers.find((c) => c.id === offer.customerId))
    ])
  ) as Record<string, TeklifContextDetail>;

  const pending = tableRows.filter((r) => r.status === "Onay Bekliyor").length;
  const waiting = tableRows.filter((r) => r.status === "Cevap Bekliyor").length;
  const volume = offers.reduce((sum, o) => sum + o.grandTotal, 0);

  return {
    title: TOM_TITLE,
    subtitle: TOM_SUBTITLE,
    kpis: [
      { id: "open", label: "Açık Teklif", value: String(tableRows.filter((r) => r.status === "Açık").length), tone: "green" },
      { id: "approval", label: "Onay Bekleyen", value: String(pending), tone: "orange" },
      { id: "response", label: "Cevap Bekleyen", value: String(waiting), tone: "blue" },
      { id: "volume", label: "Toplam Hacim", value: formatTryMoney(volume), tone: "teal" },
      { id: "conversion", label: "Dönüşüm Oranı", value: "—", tone: "gold" }
    ],
    filterSearchPlaceholder: TOM_FILTER_SEARCH_PLACEHOLDER,
    filters: TOM_FILTERS,
    demoBanner: null,
    tableRows,
    tableTotal: meta.tableTotal,
    pageNumbers: meta.pageNumbers,
    getContext: (rowId) => contextByRow[rowId] ?? buildContext(offers[0]!, customers[0])
  };
}

export function loadTekliflerReferenceDemo(): TekliflerReferenceSnapshot {
  return {
    title: TOM_TITLE,
    subtitle: TOM_SUBTITLE,
    kpis: TOM_KPIS,
    filterSearchPlaceholder: TOM_FILTER_SEARCH_PLACEHOLDER,
    filters: TOM_FILTERS,
    demoBanner: TOM_DEMO_BANNER || REFERENCE_DEMO_BANNER,
    tableRows: TOM_TABLE_ROWS,
    tableTotal: TOM_TABLE_TOTAL,
    pageNumbers: TOM_PAGE_NUMBERS,
    getContext: getTomContext
  };
}

export async function loadTekliflerReferenceLive(): Promise<TekliflerReferenceSnapshot> {
  const { offers, customers } = await getOffers();
  return buildLiveSnapshot(offers, customers);
}

export const TEKLIFLER_REFERENCE_INITIAL = loadTekliflerReferenceDemo();

