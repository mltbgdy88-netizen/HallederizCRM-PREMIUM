import type { QuickOperationType } from "../types";

export type QuickOperationResultSnapshot = {
  referenceNo: string;
  operationType: QuickOperationType | null;
  operationLabel: string;
  customerName: string;
  totalDisplay: string;
  dateDisplay: string;
  statusLabel: string;
  paymentEffect: string | null;
  deliveryEffect: string | null;
  returnEffect: string | null;
  documentLinks: Array<{ label: string; href: string }>;
};

const TYPE_LABELS: Record<QuickOperationType, string> = {
  offer: "Teklif",
  sale_order: "Sipariş",
  delivery: "Teslimat",
  payment: "Tahsilat",
  return: "İade"
};

function resolveOperationType(raw: string | null): QuickOperationType | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  if (normalized === "order" || normalized === "siparis") return "sale_order";
  if (normalized === "offer" || normalized === "teklif") return "offer";
  if (normalized === "delivery" || normalized === "teslim") return "delivery";
  if (normalized === "payment" || normalized === "tahsilat") return "payment";
  if (normalized === "return" || normalized === "iade") return "return";
  if (normalized in TYPE_LABELS) return normalized as QuickOperationType;
  return null;
}

function formatMoney(raw: string | null): string {
  if (!raw?.trim()) return "—";
  const numeric = Number(raw.replace(/[^\d.,-]/g, "").replace(",", "."));
  if (!Number.isFinite(numeric)) return raw;
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(numeric);
}

function formatDate(raw: string | null): string {
  if (!raw?.trim()) return new Date().toLocaleString("tr-TR");
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleString("tr-TR");
}

export function parseQuickOperationResultFromSearchParams(
  params: Record<string, string | string[] | undefined>
): QuickOperationResultSnapshot | null {
  const pick = (key: string) => {
    const value = params[key];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  };

  const referenceNo = pick("ref") ?? pick("islemNo") ?? pick("referenceNo");
  if (!referenceNo?.trim()) return null;

  const operationType = resolveOperationType(pick("type") ?? pick("tur") ?? pick("operationType"));
  const operationLabel = operationType ? TYPE_LABELS[operationType] : pick("typeLabel") ?? "Hızlı işlem";

  const customerName = pick("customer") ?? pick("cari") ?? pick("customerName") ?? "—";
  const totalDisplay = formatMoney(pick("total") ?? pick("toplam"));
  const dateDisplay = formatDate(pick("date") ?? pick("tarih"));
  const statusLabel = pick("status") ?? pick("durum") ?? "Taslak / önizleme";

  const documentLinks: QuickOperationResultSnapshot["documentLinks"] = [];
  const docHref = pick("documentHref") ?? pick("belgeHref");
  if (docHref) documentLinks.push({ label: "Belge detayı", href: docHref });
  if (operationType === "sale_order") documentLinks.push({ label: "Siparişler", href: "/siparisler" });
  if (operationType === "payment") documentLinks.push({ label: "Tahsilatlar", href: "/tahsilatlar" });
  if (operationType === "offer") documentLinks.push({ label: "Teklifler", href: "/teklifler" });
  if (!documentLinks.length) documentLinks.push({ label: "Belgeler", href: "/belgeler" });

  return {
    referenceNo: referenceNo.trim(),
    operationType,
    operationLabel,
    customerName,
    totalDisplay,
    dateDisplay,
    statusLabel,
    paymentEffect: pick("paymentEffect") ?? pick("tahsilatEtkisi"),
    deliveryEffect: pick("deliveryEffect") ?? pick("teslimEtkisi"),
    returnEffect: pick("returnEffect") ?? pick("iadeEtkisi"),
    documentLinks
  };
}

export const QUICK_OPERATION_IMPACT_DEMO_SECTIONS = [
  {
    id: "stock",
    title: "Stok etkisi",
    value: "Rezervasyon önizlemesi",
    detail: "Merkez depo ve raf lokasyonlarında hazırlık emri oluşması beklenir; canlı stok düşümü yapılmaz.",
    tone: "info" as const
  },
  {
    id: "balance",
    title: "Cari bakiye etkisi",
    value: "Bakiye simülasyonu",
    detail: "Cari alacak/verecek pozisyonu önizleme modunda hesaplanır; gerçek bakiye güncellenmez.",
    tone: "warning" as const
  },
  {
    id: "payment",
    title: "Tahsilat etkisi",
    value: "Dağılım planı",
    detail: "Tahsilat tutarı açık sipariş ve fatura kalemlerine dağıtım için işaretlenir; onay zinciri gerekir.",
    tone: "info" as const
  },
  {
    id: "delivery",
    title: "Teslimat etkisi",
    value: "Hazırlık kuyruğu",
    detail: "Depo hazırlık fişi ve teslim doğrulama adımları operasyon panelinde izlenir.",
    tone: "success" as const
  },
  {
    id: "document",
    title: "Fatura / belge etkisi",
    value: "Belge taslağı",
    detail: "PDF/Excel çıktısı ve WhatsApp gönderimi onay sonrası kuyruğa alınır.",
    tone: "info" as const
  }
];

export const QUICK_OPERATION_IMPACT_RISK_NOTES = [
  "Yüksek tutarlı işlemlerde ek onay politikası devreye girebilir.",
  "Stok kritik seviyede ise teslimat planı riskli olarak işaretlenir.",
  "Cari risk skoru yüksekse tahsilat dağılımı manuel inceleme gerektirir."
];
