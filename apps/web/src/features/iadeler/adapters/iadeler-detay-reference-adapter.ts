// @ts-nocheck
import type { Customer, Return } from "@hallederiz/types";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";
import { formatTrDate, formatTrDateTime, formatTryMoney } from "../../../lib/reference/formatters";
import { getReturnStatusLabel } from "../../returns/queries/return-mock-data";
import { getReturnDetail } from "../../returns/queries/get-returns";
import {
  IDM_ACTIONS,
  IDM_APPROVAL,
  IDM_CONTEXT,
  IDM_HISTORY,
  IDM_HERO,
  IDM_LINES,
  IDM_LINES_FOOT,
  IDM_PAGE,
  IDM_STOCK_ALERT,
  IDM_STOCK_KPIS,
  IDM_WAREHOUSE
} from "../data/iadeler-detay-mock";

export type IadelerDetayReferenceSnapshot = {
  returnId: string;
  demoBanner: string | null;
  page: typeof IDM_PAGE;
  hero: typeof IDM_HERO;
  stockKpis: typeof IDM_STOCK_KPIS;
  stockAlert: string;
  lines: typeof IDM_LINES;
  linesFoot: typeof IDM_LINES_FOOT;
  history: typeof IDM_HISTORY;
  actions: typeof IDM_ACTIONS;
  context: typeof IDM_CONTEXT;
  approval: typeof IDM_APPROVAL;
  warehouse: typeof IDM_WAREHOUSE;
};

function normalizeStatus(status: string): string {
  if (status === "Onaylandi") return "Onaylandı";
  if (status === "Iptal") return "Reddedildi";
  if (status === "Tamamlandi") return "Tamamlandı";
  return status;
}

function estimateLineTotal(line: any): number {
  return (line.quantity ?? 0) * 498;
}

function buildSnapshot(returnRecord: Return, customers: Customer[], demoBanner: string | null): IadelerDetayReferenceSnapshot {
  const customer = customers.find((c) => c.id === returnRecord.customerId);
  const status = normalizeStatus(getReturnStatusLabel(returnRecord.status));
  const lines = (returnRecord.lines ?? []).map((line, index) => {
    const total = estimateLineTotal(line);
    return {
      no: String(index + 1),
      product: line.productName ?? "Ürün",
      brand: "—",
      model: line.productCode ?? "—",
      serial: line.serialNo ?? "—",
      qty: `${line.quantity ?? 0} adet`,
      unitPrice: formatTryMoney(line.unitPrice ?? 498, line.currency ?? "TRY"),
      discount: "%0",
      total: formatTryMoney(total, line.currency ?? "TRY"),
      status: status === "Tamamlandı" ? "Kabul Edildi" : "Kontrol Ediliyor"
    };
  });
  const totalQty = (returnRecord.lines ?? []).reduce((s, l) => s + (l.quantity ?? 0), 0);
  const totalAmount = lines.reduce((s, l) => s + Number(String(l.total).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")), 0);
  const totalAmountLabel = formatTryMoney(Number.isFinite(totalAmount) ? totalAmount : 0);

  return {
    returnId: returnRecord.id,
    demoBanner,
    page: { ...IDM_PAGE },
    hero: {
      ...IDM_HERO,
      returnId: returnRecord.returnNo,
      status,
      created: formatTrDateTime(returnRecord.createdAt),
      creator: customer?.name ?? IDM_HERO.creator,
      orderNo: returnRecord.orderNo ?? "—",
      orderDate: formatTrDate(returnRecord.createdAt),
      customer: customer?.name ?? "—",
      reason: returnRecord.lines?.[0]?.reasonCategory ?? "—",
      note: returnRecord.note ?? IDM_HERO.note
    },
    stockKpis: [
      { label: "Toplam Kalem", value: `${lines.length} adet` },
      { label: "Toplam Miktar", value: `${totalQty} adet` },
      { label: "Stok Artışı", value: `${totalQty} adet` },
      { label: "Toplam Tutar", value: totalAmountLabel },
      { label: "Etkilenen Depo", value: "Merkez Depo" }
    ],
    stockAlert: IDM_STOCK_ALERT,
    lines,
    linesFoot: { qty: `${totalQty} adet`, total: totalAmountLabel },
    history: {
      title: IDM_HISTORY.title,
      items: [
        { title: "Talep Oluşturuldu", time: formatTrDateTime(returnRecord.createdAt) },
        { title: "Son Güncelleme", time: formatTrDateTime(returnRecord.updatedAt) }
      ]
    },
    actions: { ...IDM_ACTIONS, buttons: [...IDM_ACTIONS.buttons] },
    context: {
      ...IDM_CONTEXT,
      rows: [
        { label: "İade Tipi", value: "Satış İadesi" },
        { label: "Durum", value: status },
        { label: "Öncelik", value: "Normal" },
        { label: "Yöntem", value: "Depo İadesi" },
        { label: "Tutar", value: totalAmountLabel }
      ]
    },
    approval: {
      ...IDM_APPROVAL,
      steps: [
        { label: "Talep Oluşturuldu", state: "done" },
        { label: "Kontrol Ediliyor", state: status === "Taslak" ? "current" : "done" },
        { label: "Onay Bekliyor", state: status === "Onaylandı" ? "done" : "pending" },
        { label: "Tamamlandı", state: status === "Tamamlandı" ? "done" : "pending" }
      ]
    },
    warehouse: {
      ...IDM_WAREHOUSE,
      note: returnRecord.note ?? IDM_WAREHOUSE.note
    }
  };
}

export function loadIadelerDetayReferenceDemo(): IadelerDetayReferenceSnapshot {
  return {
    returnId: REFERENCE_ROUTE_IDS.returnId,
    demoBanner: REFERENCE_DEMO_BANNER,
    page: { ...IDM_PAGE },
    hero: { ...IDM_HERO },
    stockKpis: IDM_STOCK_KPIS.map((k) => ({ ...k })),
    stockAlert: IDM_STOCK_ALERT,
    lines: IDM_LINES.map((l) => ({ ...l })),
    linesFoot: { ...IDM_LINES_FOOT },
    history: { ...IDM_HISTORY, items: IDM_HISTORY.items.map((i) => ({ ...i })) },
    actions: { ...IDM_ACTIONS, buttons: [...IDM_ACTIONS.buttons] },
    context: { ...IDM_CONTEXT, rows: IDM_CONTEXT.rows.map((r) => ({ ...r })) },
    approval: { ...IDM_APPROVAL, steps: IDM_APPROVAL.steps.map((s) => ({ ...s })) },
    warehouse: { ...IDM_WAREHOUSE, file: { ...IDM_WAREHOUSE.file } }
  };
}

export async function loadIadelerDetayReferenceLive(returnId?: string): Promise<IadelerDetayReferenceSnapshot> {
  const resolved = (returnId ?? REFERENCE_ROUTE_IDS.returnId).trim() || REFERENCE_ROUTE_IDS.returnId;
  const { returnRecord, returns, customers } = await getReturnDetail(resolved);
  const selected = returnRecord ?? returns[0];
  if (!selected) return loadIadelerDetayReferenceDemo();
  return buildSnapshot(selected, customers, null);
}

export const IADELER_DETAY_REFERENCE_INITIAL = loadIadelerDetayReferenceDemo();


