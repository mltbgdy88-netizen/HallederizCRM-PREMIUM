"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { EmptyState } from "@hallederiz/ui";
import type { CustomerLayerKey } from "../../ui-inventory/utils/cariler-subroute-command-center-data";
import { useCustomerLayerReferenceState } from "../hooks/use-customer-layer-reference-state";
import type {
  CkmBadgeTone,
  CkmTablePanel,
  CustomerLayerReferenceView
} from "../utils/map-customer-layer-to-reference";
import {
  CustomerReferenceCommandCenterFrame,
  CustomerReferenceDemoBand,
  CustomerReferenceKpiStrip,
  CustomerReferenceLayerHeader,
  CustomerReferenceLayerShell,
  CustomerReferenceLoadingState,
  CustomerReferenceNotFoundState,
  CustomerReferenceSummaryScroll,
  CustomerReferenceWorkspace
} from "./customer-reference-shared";

type Props = {
  customerId: string;
  layer: CustomerLayerKey;
};

function layerTitle(layer: CustomerLayerKey): string {
  switch (layer) {
    case "ozet":
      return "Cari Özet Masası";
    case "finans":
      return "Finans Masası";
    case "iletisim":
      return "İletişim Masası";
    case "timeline":
      return "Zaman Akışı Masası";
    case "teklifler":
      return "Teklifler Masası";
    case "siparisler":
      return "Siparişler Masası";
    case "tahsilatlar":
      return "Tahsilatlar Masası";
    default:
      return "Cari Katman Masası";
  }
}

function layerDescription(layer: CustomerLayerKey): string {
  switch (layer) {
    case "ozet":
      return "Cari genel durumunu, finans özetini, son hareketleri ve ilgili kayıtları tek masada izleyin.";
    case "finans":
      return "Bakiye, risk, vade, yaşlandırma ve tahsilat önceliklerini ortak finans yüzeyinde takip edin.";
    case "iletisim":
      return "Yetkililer, tercih edilen iletişim kanalları ve WhatsApp aksiyonlarını yönetin.";
    case "timeline":
      return "Cariyle ilgili teklif, tahsilat, not ve işlem olaylarını zaman çizelgesinde izleyin.";
    case "teklifler":
      return "Bu cariye bağlı teklifleri, durumlarını ve teklif filtrelerini takip edin.";
    case "siparisler":
      return "Bu cariye bağlı sipariş kayıtlarını ve teslimat bağlamını izleyin.";
    case "tahsilatlar":
      return "Tahsilat kayıtlarını, yöntemlerini ve ödeme planı aksiyonlarını yönetin.";
    default:
      return "Cari katman verilerini tek masada izleyin.";
  }
}

function homeClass(layer: CustomerLayerKey): string {
  return `cul-page cul-page--embedded cul-page--${layer}`;
}

function toneClass(tone?: CkmBadgeTone | string): string {
  if (!tone) return "cul-badge--neutral";
  if (tone === "green") return "cul-badge--ok";
  if (tone === "orange") return "cul-badge--warn";
  return `cul-badge--${tone}`;
}

function CulBadge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: CkmBadgeTone | string;
}) {
  return <span className={`cul-badge ${toneClass(tone)}`}>{children}</span>;
}

function TextOrDash({ children }: { children?: ReactNode }) {
  if (children === null || children === undefined || children === "") return <>—</>;
  return <>{children}</>;
}

function Header({ view }: { view: CustomerLayerReferenceView }) {
  const meta = view.header.meta.slice(0, 4);
  const contact = view.header.contact.slice(0, 3);

  return (
    <CustomerReferenceLayerHeader>
      <nav className="cul-breadcrumb" aria-label="Breadcrumb">
        <Link href="/cariler">Cariler</Link>
        <span>›</span>
        <Link href={`/cariler/${view.customerId}`}>Cari Detay</Link>
        <span>›</span>
        <strong>{layerTitle(view.layer)}</strong>
      </nav>

      <div className="cul-hero__body">
        <div className="cul-avatar" aria-hidden>
          {view.header.initials}
        </div>

        <div className="cul-hero__main">
          <div className="cul-hero__title-row">
            <h1>{view.header.title}</h1>
            <CulBadge tone="ok">{view.header.status}</CulBadge>
          </div>

          <p className="cul-hero__desc">{layerDescription(view.layer)}</p>

          <dl className="cul-hero__meta">
            {meta.map((item) => (
              <div key={`meta-${item.label}`}>
                <dt>{item.label}</dt>
                <dd>
                  <TextOrDash>{item.value}</TextOrDash>
                </dd>
              </div>
            ))}
            {contact.map((item) => (
              <div key={`contact-${item.label}`}>
                <dt>{item.label}</dt>
                <dd>
                  <TextOrDash>{item.value}</TextOrDash>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="cul-hero__actions">
          <Link href="/cariler" className="cul-btn cul-btn--ghost">
            Listeye Dön
          </Link>
          <Link href={`/cariler/${view.customerId}`} className="cul-btn cul-btn--ghost">
            Cari Kartı
          </Link>
        </div>
      </div>
    </CustomerReferenceLayerHeader>
  );
}

function KpiStrip({ view }: { view: CustomerLayerReferenceView }) {
  const kpis = view.kpis ?? [];

  if (kpis.length === 0) {
    const labels =
      view.layer === "finans"
        ? ["Toplam Bakiye", "Vadesi Geçen", "Risk Skoru", "Tahsilat Oranı", "Ortalama Vade", "Açık Fatura"]
        : view.layer === "ozet"
          ? ["Toplam Bakiye", "Risk / Limit", "Son Hareket", "Açık Evrak", "Tahsilat"]
          : [];

    if (labels.length === 0) return null;

    return (
      <CustomerReferenceKpiStrip className={`cul-kpis cul-kpis--${labels.length}`}>
        {labels.map((label) => (
          <article key={label} className="cul-kpi cul-kpi--placeholder">
            <span className="cul-kpi__value">—</span>
            <span className="cul-kpi__label">{label}</span>
            <span className="cul-kpi__sub">Canlı veri bekleniyor</span>
          </article>
        ))}
      </CustomerReferenceKpiStrip>
    );
  }

  return (
    <CustomerReferenceKpiStrip className={`cul-kpis cul-kpis--${kpis.length}`}>
      {kpis.map((kpi) => (
        <article key={kpi.id} className={`cul-kpi cul-kpi--${kpi.tone}`}>
          <span className="cul-kpi__value">{kpi.value}</span>
          <span className="cul-kpi__label">{kpi.label}</span>
          {kpi.progress !== undefined ? (
            <span className="cul-progress" role="progressbar" aria-valuenow={kpi.progress} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${Math.max(0, Math.min(100, kpi.progress))}%` }} />
            </span>
          ) : null}
          {kpi.sub ? <span className={kpi.subWarn ? "cul-kpi__sub cul-kpi__sub--warn" : "cul-kpi__sub"}>{kpi.sub}</span> : null}
        </article>
      ))}
    </CustomerReferenceKpiStrip>
  );
}

function TableActions({ variant }: { variant?: CkmTablePanel["actionVariant"] }) {
  if (variant === "contact") {
    return (
      <span className="cul-actions">
        <button type="button" disabled aria-label="Mesaj">
          ✉
        </button>
        <button type="button" disabled aria-label="Düzenle">
          ✎
        </button>
        <button type="button" disabled aria-label="Sil">
          ×
        </button>
      </span>
    );
  }

  if (variant === "payment") {
    return (
      <span className="cul-actions">
        <button type="button" disabled aria-label="Görüntüle">
          ◉
        </button>
        <button type="button" disabled aria-label="Diğer">
          ⋮
        </button>
      </span>
    );
  }

  return (
    <span className="cul-actions">
      <button type="button" disabled aria-label="Görüntüle">
        ◉
      </button>
      <button type="button" disabled aria-label="Belge">
        □
      </button>
      <button type="button" disabled aria-label="Diğer">
        ⋮
      </button>
    </span>
  );
}

function renderCell(panel: CkmTablePanel, rowIndex: number, column: string, value: string) {
  const meta = panel.rowMeta?.[rowIndex];

  if (column === "Aksiyon" && panel.showActions) {
    return <TableActions variant={panel.actionVariant} />;
  }

  if (column === "Yöntem" && meta?.paymentMethod) {
    const method =
      meta.paymentMethod === "cash"
        ? "Nakit"
        : meta.paymentMethod === "card"
          ? "Kart"
          : meta.paymentMethod === "transfer"
            ? "Havale"
            : meta.paymentMethod === "check"
              ? "Çek"
              : "—";

    return (
      <span className="cul-method">
        <span className={`cul-method__dot cul-method__dot--${meta.paymentMethod}`} />
        {method}
      </span>
    );
  }

  const badgeTone = meta?.badges?.[column];
  if (badgeTone) return <CulBadge tone={badgeTone}>{value || "—"}</CulBadge>;

  if (meta?.linkColumns?.includes(column)) return <span className="cul-linkish">{value || "—"}</span>;

  return value || "—";
}

function DataTable({ panel }: { panel: CkmTablePanel }) {
  return (
    <section className="cul-card cul-card--table">
      <header className="cul-card__head">
        <div>
          <h2>{panel.title}</h2>
          {panel.countLabel ? <p>{panel.countLabel} kayıt</p> : null}
        </div>
        {panel.createHref ? (
          <Link href={panel.createHref} className="cul-btn cul-btn--primary">
            {panel.createLabel ?? "Yeni Kayıt"}
          </Link>
        ) : null}
      </header>

      <div className="cul-table-wrap">
        <table className="cul-table">
          <thead>
            <tr>
              {panel.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {panel.rows.length > 0 ? (
              panel.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {panel.columns.map((column) => (
                    <td key={column}>{renderCell(panel, rowIndex, column, row[column] ?? "")}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={panel.columns.length}>
                  <EmptyPanel title={panel.emptyMessage} message={panel.emptyDetail ?? "Canlı veri bağlantısı hazır olduğunda kayıtlar burada görünecek."} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="cul-table-foot">
        <span>{panel.footnote}</span>
        {panel.pagination ? (
          <span className="cul-pagination">
            <button type="button" disabled>
              ‹
            </button>
            <strong>{panel.pagination.currentPage}</strong>
            <button type="button" disabled>
              ›
            </button>
            <em>{panel.pagination.pageSize} / sayfa</em>
          </span>
        ) : null}
        {panel.viewAllHref ? (
          <Link href={panel.viewAllHref} className="cul-mini-link">
            {panel.viewAllLabel ?? "Tümünü Gör"} →
          </Link>
        ) : null}
      </footer>
    </section>
  );
}

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="cul-empty">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}

function OzetRecords({ view }: { view: CustomerLayerReferenceView }) {
  const panel = view.tablePanel;
  const tabs = view.ozetRecordTabs ?? [];

  return (
    <section className="cul-card cul-card--records">
      <header className="cul-card__head">
        <div>
          <h2>İlgili Kayıtlar</h2>
          <p>Fatura, teklif, sipariş, tahsilat ve iletişim kayıtları</p>
        </div>
        <Link href={`/cariler/${view.customerId}/finans`} className="cul-mini-link">
          Tümünü Gör →
        </Link>
      </header>

      {tabs.length > 0 ? (
        <nav className="cul-subtabs" aria-label="İlgili kayıt türleri">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" disabled className={tab.active ? "cul-subtab cul-subtab--active" : "cul-subtab"}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      ) : null}

      {panel ? (
        <DataTable panel={{ ...panel, createHref: undefined, createLabel: undefined }} />
      ) : (
        <EmptyPanel title="Kayıt bağlantısı bekleniyor" message="İlgili kayıtlar canlı bağlantı hazır olduğunda burada listelenecek." />
      )}
    </section>
  );
}

function FinanceAging({ view }: { view: CustomerLayerReferenceView }) {
  if (!view.finansAging) {
    return <EmptyPanel title="Yaşlandırma verisi bekleniyor" message="Finans yaşlandırma API bağlantısı hazır olduğunda vade kırılımları burada gösterilecek." />;
  }

  const rows = view.finansAging.rows;

  return (
    <section className="cul-card cul-card--table">
      <header className="cul-card__head">
        <div>
          <h2>Açık Bakiye Yaşlandırma</h2>
          <p>{view.finansAging.updatedLabel}</p>
        </div>
      </header>

      <div className="cul-table-wrap">
        <table className="cul-table">
          <thead>
            <tr>
              <th>Yaş Aralığı</th>
              <th>Tutar</th>
              <th>%</th>
              <th>Fatura</th>
              <th>Ort. Gün</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.range}>
                <td>
                  <span className={`cul-aging-dot cul-aging-dot--${row.tone}`} />
                  {row.range}
                </td>
                <td>{row.amount}</td>
                <td>{row.pct}</td>
                <td>{row.count}</td>
                <td>{row.avgDays}</td>
                <td>
                  <CulBadge tone={row.preparing ? "neutral" : row.tone}>{row.desc}</CulBadge>
                </td>
              </tr>
            ))}
            <tr className="cul-total-row">
              <td>Toplam</td>
              <td>{view.finansAging.total.amount}</td>
              <td>{view.finansAging.total.pct}</td>
              <td>{view.finansAging.total.count}</td>
              <td>{view.finansAging.total.avgDays}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ContactTable({ view }: { view: CustomerLayerReferenceView }) {
  const contacts = view.contacts ?? [];

  return (
    <section className="cul-card cul-card--table">
      <header className="cul-card__head">
        <div>
          <h2>İletişim Kişileri</h2>
          <p>Yetkililer, tercih edilen kanal ve aksiyonlar</p>
        </div>
        <button type="button" disabled className="cul-btn cul-btn--primary">
          + Yeni Kişi
        </button>
      </header>

      <div className="cul-table-wrap">
        <table className="cul-table">
          <thead>
            <tr>
              <th>Kişi</th>
              <th>Rol / Ünvan</th>
              <th>Telefon</th>
              <th>E-posta</th>
              <th>Tercih</th>
              <th>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <tr key={`${contact.name}-${contact.email}-${contact.phone}`}>
                  <td>
                    <span className="cul-person">
                      <span>{contact.initials}</span>
                      {contact.name}
                    </span>
                  </td>
                  <td>{contact.role}</td>
                  <td>{contact.phone}</td>
                  <td>{contact.email}</td>
                  <td>{contact.preferred}</td>
                  <td>
                    <TableActions variant="contact" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyPanel title="İletişim kişisi bulunmuyor" message="Ana cari bilgileri gösterilir; kişi listesi bağlandığında burası dolacak." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TimelineFeed({ view }: { view: CustomerLayerReferenceView }) {
  const events = view.timelineEvents ?? [];
  const groups = Array.from(new Set(events.map((event) => event.group)));

  if (events.length === 0) {
    return (
      <section className="cul-card">
        <EmptyPanel title="Zaman akışı kaydı bulunmuyor" message="Cari zaman çizelgesi API bağlantısı hazır olduğunda olaylar burada listelenecek." />
      </section>
    );
  }

  return (
    <section className="cul-card cul-card--timeline">
      {groups.map((group) => (
        <div key={group} className="cul-timeline-group">
          <h2>{group}</h2>
          <ol>
            {events
              .filter((event) => event.group === group)
              .map((event) => (
                <li key={event.id}>
                  <span className={`cul-timeline-dot cul-timeline-dot--${event.tone}`} />
                  <div>
                    <header>
                      <strong>{event.title}</strong>
                      <CulBadge tone={event.tone}>{event.type}</CulBadge>
                    </header>
                    <p>{event.desc}</p>
                    <small>
                      {event.user} · {event.time}
                    </small>
                  </div>
                </li>
              ))}
          </ol>
        </div>
      ))}
    </section>
  );
}

function MainContent({ view }: { view: CustomerLayerReferenceView }) {
  return (
    <div className="cul-main-stack">
      <header className="cul-section-title">
        <div>
          <h2>{layerTitle(view.layer)}</h2>
          <p>{layerDescription(view.layer)}</p>
        </div>
        {view.preparationMessage ? <span>{view.preparationMessage}</span> : null}
      </header>

      {view.layer === "ozet" ? <OzetRecords view={view} /> : null}
      {view.layer === "finans" ? <FinanceAging view={view} /> : null}
      {view.layer === "iletisim" ? <ContactTable view={view} /> : null}
      {view.layer === "timeline" ? <TimelineFeed view={view} /> : null}
      {["teklifler", "siparisler", "tahsilatlar"].includes(view.layer) && view.tablePanel ? <DataTable panel={view.tablePanel} /> : null}
    </div>
  );
}

function ContextBlock({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="cul-context-block">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function DefinitionList({
  rows
}: {
  rows: { label: string; value: string; negative?: boolean; warn?: boolean; badge?: boolean }[];
}) {
  return (
    <dl className="cul-dl">
      {rows.map((row) => (
        <div key={row.label} className={row.negative ? "cul-dl--negative" : row.warn ? "cul-dl--warn" : undefined}>
          <dt>{row.label}</dt>
          <dd>{row.badge ? <CulBadge tone="ok">{row.value}</CulBadge> : row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function StandardContext({ view }: { view: CustomerLayerReferenceView }) {
  return (
    <>
      <ContextBlock title="Cari Bilgileri">
        <DefinitionList rows={view.context.cari} />
      </ContextBlock>

      <ContextBlock title="Finansal Durum">
        <DefinitionList rows={view.context.finans} />
      </ContextBlock>

      <ContextBlock title="Son Hareketler">
        {view.context.hareketler.length > 0 ? (
          <ul className="cul-move-list">
            {view.context.hareketler.map((item) => (
              <li key={`${item.type}-${item.date}-${item.title}`}>
                <span />
                <div>
                  <strong>{item.title}</strong>
                  <small>
                    {item.date} · {item.amount}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="cul-note">Henüz hareket kaydı yok.</p>
        )}
      </ContextBlock>

      <ContextBlock title="Kısayollar">
        <div className="cul-shortcuts">
          {view.context.shortcuts.map((shortcut, index) => (
            <Link key={shortcut.href} href={shortcut.href} className={index === 0 ? "cul-btn cul-btn--primary" : "cul-btn cul-btn--ghost"}>
              {shortcut.label}
            </Link>
          ))}
        </div>
      </ContextBlock>
    </>
  );
}

function FinanceContext({ view }: { view: CustomerLayerReferenceView }) {
  const side = view.finansSide;
  if (!side) return <StandardContext view={view} />;

  return (
    <>
      <ContextBlock title="Öncelikli Tahsilat">
        <div className="cul-priority">
          <strong>{side.suggestionAmount ?? "—"}</strong>
          <p>{side.suggestionStrategy}</p>
          <small>{side.suggestionPlan}</small>
        </div>
      </ContextBlock>

      <ContextBlock title="Finansal KPI">
        <div className="cul-mini-kpis">
          {side.miniKpis.map((kpi) => (
            <article key={kpi.label}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
            </article>
          ))}
        </div>
      </ContextBlock>

      <Link href={side.ctaHref} className="cul-btn cul-btn--primary cul-btn--block">
        Tahsilat Planı Oluştur
      </Link>

      <p className="cul-note">Son güncelleme: {side.updatedLabel}</p>
    </>
  );
}

function ContactContext({ view }: { view: CustomerLayerReferenceView }) {
  const side = view.iletisimSide;
  if (!side) return <StandardContext view={view} />;

  return (
    <>
      <ContextBlock title="WhatsApp Bağlamı">
        <div className="cul-whatsapp">
          <strong>{side.title}</strong>
          <span>{side.whatsappPhone}</span>
          <CulBadge tone={side.whatsappHref ? "ok" : "neutral"}>{side.status}</CulBadge>
          <p>{side.lastMessage}</p>
          {side.whatsappHref ? (
            <Link href={side.whatsappHref} className="cul-btn cul-btn--primary cul-btn--block">
              WhatsApp Sohbetini Aç
            </Link>
          ) : (
            <button type="button" disabled className="cul-btn cul-btn--ghost cul-btn--block">
              WhatsApp bağlantısı yok
            </button>
          )}
        </div>
      </ContextBlock>

      <ContextBlock title="Hızlı İşlemler">
        <div className="cul-icon-grid">
          {side.quickActions.map((action) => (
            <button key={action.id} type="button" disabled>
              <span />
              {action.label}
            </button>
          ))}
        </div>
      </ContextBlock>

      <ContextBlock title="İletişim Tercihi">
        <p className="cul-note">
          Tercih edilen kanal: <strong>{side.preferred}</strong>
        </p>
      </ContextBlock>
    </>
  );
}

function OfferContext({ view }: { view: CustomerLayerReferenceView }) {
  const side = view.tekliflerSide;
  if (!side) return <StandardContext view={view} />;

  return (
    <>
      <ContextBlock title={side.title}>
        <ul className="cul-check-list">
          {side.statuses.map((item) => (
            <li key={item.label}>
              <span />
              {item.label} ({item.count})
            </li>
          ))}
        </ul>
      </ContextBlock>

      <ContextBlock title="Filtreler">
        <label className="cul-field">
          Tarih Aralığı
          <input disabled placeholder={side.dateRangeLabel} />
        </label>
        <label className="cul-field">
          Tutar Aralığı
          <input disabled placeholder="Min / Max" />
        </label>
        <label className="cul-field">
          Yetkili
          <input disabled placeholder={side.assigneePlaceholder} />
        </label>
        <label className="cul-field">
          Oluşturan
          <input disabled placeholder={side.creatorPlaceholder} />
        </label>
      </ContextBlock>

      <button type="button" disabled className="cul-btn cul-btn--primary cul-btn--block">
        Filtrele
      </button>
      <button type="button" disabled className="cul-btn cul-btn--ghost cul-btn--block">
        Temizle
      </button>
      <p className="cul-note">Toplam {side.total} teklif kaydı</p>
    </>
  );
}

function OrderContext({ view }: { view: CustomerLayerReferenceView }) {
  const side = view.siparislerSide;
  if (!side) return <StandardContext view={view} />;

  return (
    <>
      <ContextBlock title={side.title}>
        {side.orderNo ? (
          <div className="cul-order-id">
            <strong>{side.orderNo}</strong>
            {side.status ? <CulBadge tone={side.statusTone ?? "neutral"}>{side.status}</CulBadge> : null}
          </div>
        ) : (
          <p className="cul-note">{side.emptyMessage}</p>
        )}
        <DefinitionList rows={side.fields} />
      </ContextBlock>

      <ContextBlock title="Teslimat Bilgileri">
        <DefinitionList rows={side.delivery} />
      </ContextBlock>

      <button type="button" disabled className="cul-btn cul-btn--primary cul-btn--block">
        Detayları Görüntüle →
      </button>
    </>
  );
}

function CollectionContext({ view }: { view: CustomerLayerReferenceView }) {
  const side = view.tahsilatlarSide;
  if (!side) return <StandardContext view={view} />;

  return (
    <>
      <ContextBlock title={side.title}>
        <div className="cul-mini-kpis">
          {side.summary.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </ContextBlock>

      <ContextBlock title="Tarih Bilgileri">
        <DefinitionList rows={side.dates} />
      </ContextBlock>

      <div className="cul-shortcuts">
        {side.actions.map((action) =>
          action.href ? (
            <Link key={action.label} href={action.href} className={action.primary ? "cul-btn cul-btn--primary" : "cul-btn cul-btn--ghost"}>
              {action.label}
            </Link>
          ) : (
            <button key={action.label} type="button" disabled className={action.primary ? "cul-btn cul-btn--primary" : "cul-btn cul-btn--ghost"}>
              {action.label}
            </button>
          )
        )}
      </div>
    </>
  );
}

function TimelineContext({ view }: { view: CustomerLayerReferenceView }) {
  return (
    <>
      <ContextBlock title="Zaman Akışı Bağlamı">
        <DefinitionList
          rows={[
            { label: "Müşteri", value: view.header.title },
            { label: "Cari Kodu", value: view.header.meta[0]?.value ?? "—" }
          ]}
        />
      </ContextBlock>
      <ContextBlock title="Canlı Veri">
        <p className="cul-note">Zaman çizelgesi olay akışı API bağlantısı hazırlanıyor.</p>
      </ContextBlock>
    </>
  );
}

function SideContent({ view }: { view: CustomerLayerReferenceView }) {
  if (view.layer === "finans") return <FinanceContext view={view} />;
  if (view.layer === "iletisim") return <ContactContext view={view} />;
  if (view.layer === "teklifler") return <OfferContext view={view} />;
  if (view.layer === "siparisler") return <OrderContext view={view} />;
  if (view.layer === "tahsilatlar") return <CollectionContext view={view} />;
  if (view.layer === "timeline") return <TimelineContext view={view} />;
  return <StandardContext view={view} />;
}

function TimelineFilters() {
  return (
    <aside className="cul-filter-panel">
      <h2>Filtreler</h2>
      <label>
        Olay Tipi
        <select disabled defaultValue="all">
          <option value="all">Tümü</option>
        </select>
      </label>
      <label>
        Tarih Aralığı
        <select disabled defaultValue="90">
          <option value="90">Son 90 gün</option>
        </select>
      </label>
      <button type="button" disabled className="cul-btn cul-btn--ghost cul-btn--block">
        Filtre canlı bağlantı sonrası
      </button>
    </aside>
  );
}

function LayoutBody({ view }: { view: CustomerLayerReferenceView }) {
  if (view.layer === "timeline") {
    return (
      <CustomerReferenceWorkspace timeline>
        <TimelineFilters />
        <main className="cul-main">
          <MainContent view={view} />
        </main>
        <aside className="cul-side">
          <SideContent view={view} />
        </aside>
      </CustomerReferenceWorkspace>
    );
  }

  return (
    <CustomerReferenceWorkspace>
      <main className="cul-main">
        <MainContent view={view} />
      </main>
      <aside className="cul-side">
        <SideContent view={view} />
      </aside>
    </CustomerReferenceWorkspace>
  );
}

export function CustomerLayerReferenceLayout({ customerId, layer }: Props) {
  const desk = useCustomerLayerReferenceState(customerId, layer);
  const className = homeClass(layer);

  if (desk.isDemoPreview) {
    return (
      <CustomerReferenceCommandCenterFrame customerId={customerId}>
        <div className={className} data-page="customer-layer-unified">
          <EmptyState
            title="Önizleme kaydı"
            message="Bu kayıt portföy önizlemesidir; gerçek cari katmanı açılmaz."
            actions={
              <Link href="/cariler" className="cul-btn cul-btn--ghost">
                Cari listesine dön
              </Link>
            }
          />
        </div>
      </CustomerReferenceCommandCenterFrame>
    );
  }

  if (desk.loading) {
    return (
      <CustomerReferenceCommandCenterFrame customerId={customerId}>
        <CustomerReferenceLoadingState variant="cul" layer={layer} />
      </CustomerReferenceCommandCenterFrame>
    );
  }

  if (!desk.view) {
    return (
      <CustomerReferenceCommandCenterFrame customerId={customerId}>
        <CustomerReferenceNotFoundState variant="cul" layer={layer} />
      </CustomerReferenceCommandCenterFrame>
    );
  }

  return (
    <CustomerReferenceCommandCenterFrame customerId={customerId}>
      <CustomerReferenceLayerShell layer={layer}>
        <Header view={desk.view} />
        <CustomerReferenceSummaryScroll>
        <CustomerReferenceDemoBand />
        <KpiStrip view={desk.view} />
        <LayoutBody view={desk.view} />
      </CustomerReferenceSummaryScroll>
    </CustomerReferenceLayerShell>
    </CustomerReferenceCommandCenterFrame>
  );
}
