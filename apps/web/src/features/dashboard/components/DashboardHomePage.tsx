"use client";

import { SplitContentLayout } from "@hallederiz/ui";
import { DashboardAiAssistantPanel } from "./DashboardAiAssistantPanel";
import {
  ActivityFeedIcon,
  KpiBubbleIcon,
  QuickActionIcon,
  type ActivityIconKind,
  type QuickBubbleKind,
  type RowListIcon,
  RowListIconSvg
} from "./dashboard-inline-icons";

const MOCK_FEATURED_TASKS: Array<{
  id: string;
  title: string;
  customer: string;
  amount: string;
  meta: string;
  icon: RowListIcon;
}> = [
  { id: "1", title: "Teslimat onayı", customer: "Nova Gıda A.Ş.", amount: "₺ 84.200", meta: "14:00", icon: "clipboard" },
  { id: "2", title: "Fiyat listesi güncelleme", customer: "ABC Ltd.", amount: "—", meta: "Yarın", icon: "tag" },
  { id: "3", title: "Depo sayım farkı", customer: "Merkez depo", amount: "₺ 2.100", meta: "2 saat", icon: "package" },
  { id: "4", title: "Kritik stok uyarısı", customer: "SKU-8841", amount: "4 adet", meta: "SLA", icon: "alert" },
  { id: "5", title: "Teklif takip", customer: "Kuzey Lojistik", amount: "₺ 120.000", meta: "16:30", icon: "tag" }
];

const MOCK_APPROVALS: Array<{
  id: string;
  code: string;
  title: string;
  amount: string;
  risk: "Orta" | "Yüksek" | "Düşük";
  icon: RowListIcon;
}> = [
  { id: "1", code: "ON-9021", title: "Fiyat revizyonu — ABC Ltd.", amount: "₺ 18.400", risk: "Orta", icon: "tag" },
  { id: "2", code: "ON-9022", title: "Stok negatif düzeltme", amount: "—", risk: "Yüksek", icon: "package" },
  { id: "3", code: "ON-9023", title: "İade onayı #4521", amount: "₺ 6.200", risk: "Düşük", icon: "rotate" },
  { id: "4", code: "ON-9024", title: "Ödeme planı değişikliği", amount: "₺ 42.000", risk: "Orta", icon: "banknote" },
  { id: "5", code: "ON-9025", title: "İskonto talebi — Delta", amount: "₺ 3.150", risk: "Düşük", icon: "fileCheck" }
];

const MOCK_COLLECTIONS: Array<{
  id: string;
  customer: string;
  invoice: string;
  amount: string;
  due: string;
  icon: RowListIcon;
}> = [
  { id: "1", customer: "Delta A.Ş.", invoice: "FT-2025-1182", amount: "₺ 42.300", due: "2 gün", icon: "wallet" },
  { id: "2", customer: "Nova Gıda", invoice: "FT-2025-1189", amount: "₺ 8.950", due: "Bugün", icon: "card" },
  { id: "3", customer: "Kuzey Lojistik", invoice: "FT-2025-1194", amount: "₺ 120.000", due: "5 gün", icon: "banknote" },
  { id: "4", customer: "Ege Un A.Ş.", invoice: "FT-2025-1198", amount: "₺ 19.750", due: "1 gün", icon: "wallet" },
  { id: "5", customer: "Liman Gıda", invoice: "FT-2025-1201", amount: "₺ 55.000", due: "3 gün", icon: "card" }
];

const MOCK_ACTIVITY: Array<{ id: string; kind: ActivityIconKind; line: string; time: string }> = [
  { id: "1", kind: "order", line: "Sipariş #SO-2024-1256 oluşturuldu", time: "14:32" },
  { id: "2", kind: "pay", line: "Tahsilat #TR-2024-890 onaylandı", time: "14:28" },
  { id: "3", kind: "invoice", line: "Fatura #F-2024-567 kesildi", time: "14:15" }
];

const DAILY_MINI = [
  { key: "ord", label: "Siparişler", count: "24", amount: "₺ 312.400", delta: "%12,3 ↑" },
  { key: "pay", label: "Tahsilatlar", count: "11", amount: "₺ 186.900", delta: "%4,1 ↑" },
  { key: "off", label: "Teklifler", count: "8", amount: "₺ 94.200", delta: "%2,0 ↓" },
  { key: "ret", label: "İadeler", count: "3", amount: "₺ 12.800", delta: "%0,5 ↑" },
  { key: "del", label: "Teslimatlar", count: "6", amount: "₺ 208.000", delta: "%6,8 ↑" }
];

const KPI_ITEMS = [
  {
    key: "revenue",
    label: "Bugünkü Ciro",
    value: "₺ 485.750",
    line1: "%38,4 ↑",
    line2: "Dün: ₺ 410.200",
    tone: "violet" as const,
    bubble: "revenue" as const
  },
  {
    key: "collect",
    label: "Bekleyen Tahsilat",
    value: "₺ 256.450",
    line1: "5 fiş",
    line2: "Vadesi geçmiş: 2",
    tone: "amber" as const,
    bubble: "wallet" as const
  },
  {
    key: "wa",
    label: "WhatsApp Talepleri",
    value: "12",
    line1: "3 yeni",
    line2: "9 devam ediyor",
    tone: "teal" as const,
    bubble: "whatsapp" as const
  },
  {
    key: "appr",
    label: "Onay Bekleyen",
    value: "7",
    line1: "2 kritik",
    line2: "5 normal",
    tone: "rose" as const,
    bubble: "shield" as const
  },
  {
    key: "stock",
    label: "Stok Riski Olan",
    value: "23",
    line1: "8 kritik",
    line2: "15 uyarı",
    tone: "indigo" as const,
    bubble: "box" as const
  }
];

const QUICK_ACTIONS: Array<{ key: string; label: string; bubble: QuickBubbleKind }> = [
  { key: "order", label: "Sipariş Oluştur", bubble: "order" },
  { key: "price", label: "Fiyat Ver", bubble: "price" },
  { key: "stock", label: "Stok Sorgula", bubble: "stock" },
  { key: "pay", label: "Tahsilat İşle", bubble: "pay" },
  { key: "ret", label: "İade Başlat", bubble: "return" },
  { key: "doc", label: "Belge Gönder", bubble: "doc" }
];

function feedWrapTone(kind: ActivityIconKind): string {
  if (kind === "order") return "hz-dash-feed-ico-wrap hz-dash-feed-ico-wrap--order";
  if (kind === "pay") return "hz-dash-feed-ico-wrap hz-dash-feed-ico-wrap--pay";
  if (kind === "invoice") return "hz-dash-feed-ico-wrap hz-dash-feed-ico-wrap--invoice";
  if (kind === "wa") return "hz-dash-feed-ico-wrap hz-dash-feed-ico-wrap--wa";
  if (kind === "stock") return "hz-dash-feed-ico-wrap hz-dash-feed-ico-wrap--stock";
  return "hz-dash-feed-ico-wrap hz-dash-feed-ico-wrap--doc";
}

function rowIconTone(icon: RowListIcon): string {
  const map: Partial<Record<RowListIcon, string>> = {
    clipboard: "hz-dash-row-ico-wrap hz-dash-row-ico-wrap--indigo",
    tag: "hz-dash-row-ico-wrap hz-dash-row-ico-wrap--violet",
    package: "hz-dash-row-ico-wrap hz-dash-row-ico-wrap--amber",
    alert: "hz-dash-row-ico-wrap hz-dash-row-ico-wrap--rose",
    fileCheck: "hz-dash-row-ico-wrap hz-dash-row-ico-wrap--sky",
    wallet: "hz-dash-row-ico-wrap hz-dash-row-ico-wrap--emerald",
    card: "hz-dash-row-ico-wrap hz-dash-row-ico-wrap--teal",
    banknote: "hz-dash-row-ico-wrap hz-dash-row-ico-wrap--lime",
    rotate: "hz-dash-row-ico-wrap hz-dash-row-ico-wrap--orange"
  };
  return map[icon] ?? "hz-dash-row-ico-wrap hz-dash-row-ico-wrap--indigo";
}

function riskBadgeClass(risk: string): string {
  if (risk === "Yüksek") return "hz-risk hz-risk--high";
  if (risk === "Orta") return "hz-risk hz-risk--mid";
  return "hz-risk hz-risk--low";
}

function DashCardHeader({ title }: { title: string }) {
  return (
    <header className="hz-dash-card-head">
      <h2>{title}</h2>
      <button type="button" className="hz-dash-card-link">
        Tümünü gör
      </button>
    </header>
  );
}

export function DashboardHomePage() {
  return (
    <div className="hz-dashboard-page hz-dashboard-page--fit">
      <SplitContentLayout
        main={
          <div className="hz-dash-main-column">
            <div className="hz-dash-scroll-region">
              <section className="hz-dash-kpi-row" aria-label="Özet göstergeler">
                {KPI_ITEMS.map((k) => (
                  <article key={k.key} className={`hz-dash-kpi hz-dash-kpi--${k.tone}`}>
                    <div className="hz-dash-kpi-text">
                      <p className="hz-dash-kpi-label">{k.label}</p>
                      <p className="hz-dash-kpi-value">{k.value}</p>
                      <div className="hz-dash-kpi-meta">
                        <span className="hz-dash-kpi-line1">{k.line1}</span>
                        <span className="hz-dash-kpi-line2">{k.line2}</span>
                      </div>
                    </div>
                    <div className="hz-dash-kpi-visual">
                      {k.bubble === "revenue" ? <span className="hz-dash-kpi-spark" aria-hidden /> : null}
                      <span className={`hz-dash-kpi-bubble hz-dash-kpi-bubble--${k.bubble}`}>
                        <KpiBubbleIcon kind={k.bubble} size={21} />
                      </span>
                    </div>
                  </article>
                ))}
              </section>

              <section className="hz-dashboard-triple" aria-label="Operasyon kartları">
                <article className="hz-content-card hz-dash-surface-card hz-dash-card-fill">
                  <DashCardHeader title="Öne Çıkan Görevler" />
                  <ul className="hz-dash-table hz-dash-table--rows">
                    {MOCK_FEATURED_TASKS.map((row) => (
                      <li key={row.id}>
                        <span className={rowIconTone(row.icon)} aria-hidden>
                          <RowListIconSvg kind={row.icon} size={16} />
                        </span>
                        <div className="hz-dash-row-main">
                          <span className="hz-dash-row-title">{row.title}</span>
                          <span className="hz-dash-row-sub">{row.customer}</span>
                        </div>
                        <div className="hz-dash-row-end">
                          <span className="hz-dash-row-amt">{row.amount}</span>
                          <span className="hz-dash-row-time">{row.meta}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="hz-content-card hz-dash-surface-card hz-dash-card-fill">
                  <DashCardHeader title="Onay Bekleyen İşlemler" />
                  <ul className="hz-dash-table hz-dash-table--rows hz-dash-table--appr">
                    {MOCK_APPROVALS.map((row) => (
                      <li key={row.id}>
                        <div className="hz-dash-appr-lead">
                          <span className={rowIconTone(row.icon)} aria-hidden>
                            <RowListIconSvg kind={row.icon} size={16} />
                          </span>
                          <span className="hz-dash-row-code">{row.code}</span>
                        </div>
                        <div className="hz-dash-row-main">
                          <span className="hz-dash-row-title">{row.title}</span>
                          <span className="hz-dash-row-sub">{row.amount}</span>
                        </div>
                        <span className={riskBadgeClass(row.risk)}>{row.risk}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="hz-content-card hz-dash-surface-card hz-dash-card-fill">
                  <DashCardHeader title="Tahsilat Bekleyen" />
                  <ul className="hz-dash-table hz-dash-table--rows">
                    {MOCK_COLLECTIONS.map((row) => (
                      <li key={row.id}>
                        <span className={rowIconTone(row.icon)} aria-hidden>
                          <RowListIconSvg kind={row.icon} size={16} />
                        </span>
                        <div className="hz-dash-row-main">
                          <span className="hz-dash-row-title">{row.customer}</span>
                          <span className="hz-dash-row-sub">{row.invoice}</span>
                        </div>
                        <div className="hz-dash-row-end">
                          <span className="hz-dash-row-amt">{row.amount}</span>
                          <span className="hz-dash-row-time">{row.due}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              </section>

              <div className="hz-dashboard-grid-2 hz-dash-lower">
                <article className="hz-content-card hz-dash-surface-card hz-dash-daily-card">
                  <DashCardHeader title="Günlük Özet" />
                  <div className="hz-dash-daily-strip">
                    {DAILY_MINI.map((m) => (
                      <div key={m.key} className="hz-dash-daily-mini">
                        <p className="hz-dash-daily-label">{m.label}</p>
                        <p className="hz-dash-daily-count">{m.count}</p>
                        <p className="hz-dash-daily-amt">{m.amount}</p>
                        <p className="hz-dash-daily-delta">{m.delta}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="hz-content-card hz-dash-surface-card">
                  <DashCardHeader title="Son İşlemler" />
                  <ul className="hz-dash-feed hz-dash-feed--tight">
                    {MOCK_ACTIVITY.map((row) => (
                      <li key={row.id}>
                        <span className={feedWrapTone(row.kind)} aria-hidden>
                          <ActivityFeedIcon kind={row.kind} size={16} />
                        </span>
                        <div className="hz-dash-feed-body">
                          <span className="hz-dash-feed-line">{row.line}</span>
                          <span className="hz-dash-feed-time">{row.time}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>

            <section className="hz-dash-quick-section" aria-label="Hızlı işlemler">
              <div className="hz-dash-quick-head">
                <h2 className="hz-dash-quick-title">Hızlı İşlemler</h2>
              </div>
              <div className="hz-dash-quick-grid hz-dash-quick-grid--six">
                {QUICK_ACTIONS.map((q) => (
                  <button key={q.key} type="button" className="hz-dash-quick-card">
                    <span className={`hz-dash-quick-bubble hz-dash-quick-bubble--${q.bubble}`}>
                      <QuickActionIcon kind={q.bubble} size={26} />
                    </span>
                    <span className="hz-dash-quick-label">{q.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        }
        side={<DashboardAiAssistantPanel />}
      />
    </div>
  );
}
