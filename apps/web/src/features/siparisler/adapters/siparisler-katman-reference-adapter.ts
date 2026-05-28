// @ts-nocheck
import { formatTryMoney } from "../../../lib/reference/formatters";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";
import type { SiparisFulfillment } from "../../../lib/siparis-fulfillment-links";
import type { SiparislerDetayReferenceSnapshot } from "./siparisler-detay-reference-adapter";
import { loadSiparislerDetayReferenceDemo, loadSiparislerDetayReferenceLive } from "./siparisler-detay-reference-adapter";
import {
  buildSiparislerKatmanLayer,
  type SiparislerKatmanLayerSnapshot
} from "./siparisler-katman-layer";

export type { SiparislerKatmanLayerSnapshot };

export type SiparislerKatmanReferenceSnapshot = {
  orderId: string;
  fulfillment: SiparisFulfillment;
  demoBanner: string | null;
  layer: SiparislerKatmanLayerSnapshot;
  header: {
    breadcrumb: string[];
    orderId: string;
    status: string;
    meta: string;
    customerName: string;
    currency: string;
    orderDateLabel: string;
  };
  kpis: { id: string; label: string; value: string; sub?: string; tone?: string }[];
  lines: {
    no: string;
    code: string;
    name: string;
    qty: string;
    unit: string;
    price: string;
    disc: string;
    tax: string;
    total: string;
  }[];
  totals: { label: string; value: string; strong?: boolean; warn?: boolean }[];
};

function fromDetay(detay: SiparislerDetayReferenceSnapshot): SiparislerKatmanReferenceSnapshot {
  const customerName =
    detay.infoLeft.find((f) => f.label === "Müşteri")?.value ??
    detay.asideCustomer ??
    "—";
  const currency =
    detay.infoRight.find((f) => f.label === "Para Birimi")?.value ??
    "TRY";
  const orderDate =
    detay.infoLeft.find((f) => f.label === "Sipariş Tarihi")?.value ??
    detay.page.orderDate;

  const kpis = detay.finKpis.map((k) => ({
    id: k.id,
    label: k.label,
    value: k.value,
    tone: k.tone
  }));

  const lines = detay.lines.map((l, idx) => ({
    no: l.no || String(idx + 1),
    code: l.code,
    name: l.name,
    qty: l.qty,
    unit: l.unit,
    price: l.price,
    disc: l.disc,
    tax: l.tax,
    total: l.total
  }));

  const totals = detay.lineTotals.map((t) => ({
    label: t.label,
    value: t.value,
    strong: t.strong,
    warn: t.warn
  }));

  // Build a compact meta line suitable for katman header.
  const meta = `Oluşturulma: ${orderDate} • Müşteri: ${customerName}`;

  return {
    orderId: detay.orderId,
    fulfillment: detay.fulfillment,
    demoBanner: detay.demoBanner,
    layer: buildSiparislerKatmanLayer(),
    header: {
      breadcrumb: detay.page.breadcrumb ?? ["Siparişler", "Sipariş Detayı"],
      orderId: detay.page.orderId,
      status: detay.page.status,
      meta,
      customerName,
      currency,
      orderDateLabel: orderDate
    },
    kpis,
    lines,
    totals
  };
}

export function loadSiparislerKatmanReferenceDemo(): SiparislerKatmanReferenceSnapshot {
  const detay = loadSiparislerDetayReferenceDemo();
  return fromDetay(detay);
}

export async function loadSiparislerKatmanReferenceLive(
  orderId?: string
): Promise<SiparislerKatmanReferenceSnapshot> {
  const resolved = (orderId ?? REFERENCE_ROUTE_IDS.orderId).trim() || REFERENCE_ROUTE_IDS.orderId;
  try {
    const detay = await loadSiparislerDetayReferenceLive(resolved);
    return fromDetay(detay);
  } catch {
    const demo = loadSiparislerKatmanReferenceDemo();
    // Provide a visible banner in misconfigured/live-failed scenarios.
    return { ...demo, orderId: resolved, demoBanner: REFERENCE_DEMO_BANNER };
  }
}

export function buildSiparisSatirlarTotalsFromLines(
  lines: SiparislerKatmanReferenceSnapshot["lines"],
  currency: string
): { label: string; value: string; strong?: boolean }[] {
  // Lines are already formatted strings. Keep totals conservative: only grand total if parse fails.
  const numeric = (s: string) => {
    const normalized = String(s)
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  };
  const sum = lines.reduce((acc, l) => acc + numeric(l.total), 0);
  return [
    { label: "Ara Toplam", value: formatTryMoney(sum, currency) },
    { label: "Genel Toplam", value: formatTryMoney(sum, currency), strong: true }
  ];
}


