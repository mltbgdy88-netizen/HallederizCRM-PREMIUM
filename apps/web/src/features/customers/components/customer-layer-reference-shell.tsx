"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type {
  CkmBadgeTone,
  CkmFinansAgingRow,
  CkmFinansSide,
  CkmIletisimSide,
  CkmSiparislerSide,
  CkmTablePanel,
  CkmTahsilatlarSide,
  CkmTekliflerSide,
  CustomerLayerReferenceView
} from "../utils/map-customer-layer-to-reference";
import { IconCkmKpi } from "./customer-detail-reference-icons";
import { CkmBadge, CustomerLayerContextPanel } from "./customer-layer-frame";

function FinanceAgingBadge({
  children,
  tone
}: {
  children: ReactNode;
  tone: CkmFinansAgingRow["tone"];
}) {
  const resolved = tone === "ok" ? "ok" : tone === "warn" ? "warn" : tone === "orange" ? "warn" : tone === "bad" ? "bad" : "neutral";
  return <CkmBadge tone={resolved}>{children}</CkmBadge>;
}

function FinanceAgingTable({ view }: { view: CustomerLayerReferenceView }) {
  const aging = view.finansAging;
  if (!aging) return null;

  return (
    <section className="ckm-panel ckm-panel--aging" aria-labelledby="ckm-aging-title">
      <header className="ckm-panel-head">
        <h2 id="ckm-aging-title">Açık Bakiye Yaşlandırma</h2>
      </header>
      <div className="ckm-table-wrap">
        <table className="ckm-table">
          <thead>
            <tr>
              <th>Yaş Aralığı</th>
              <th>Tutar ₺</th>
              <th>%</th>
              <th>Fatura Adedi</th>
              <th>Ort. Gün</th>
              <th>Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {aging.rows.map((row) => (
              <tr key={row.range} className={`ckm-row--${row.tone}`}>
                <td>{row.range}</td>
                <td>{row.amount}</td>
                <td>{row.pct}</td>
                <td>{row.count}</td>
                <td>{row.avgDays}</td>
                <td>
                  <FinanceAgingBadge tone={row.preparing ? "neutral" : row.tone}>{row.desc}</FinanceAgingBadge>
                </td>
              </tr>
            ))}
            <tr className="ckm-row--total">
              <td>
                <strong>Toplam</strong>
              </td>
              <td>
                <strong>{aging.total.amount}</strong>
              </td>
              <td>
                <strong>{aging.total.pct}</strong>
              </td>
              <td>
                <strong>{aging.total.count}</strong>
              </td>
              <td>
                <strong>{aging.total.avgDays}</strong>
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
      <footer className="ckm-table-foot">
        <button type="button" className="ckm-btn ckm-btn--outline ckm-btn--sm" disabled title="Detaylı rapor bağlandığında etkinleşir">
          Detaylı Rapor
        </button>
        <span>{aging.updatedLabel}</span>
      </footer>
    </section>
  );
}

function TableEmptyState({ panel }: { panel: CkmTablePanel }) {
  return (
    <div className="ckm-table-empty" role="status">
      <strong>{panel.emptyMessage}</strong>
      {panel.emptyDetail ? <p>{panel.emptyDetail}</p> : null}
      {panel.createHref ? (
        <Link href={panel.createHref} className="ckm-btn ckm-btn--primary ckm-btn--sm">
          {panel.createLabel ?? "Yeni kayıt"}
        </Link>
      ) : null}
    </div>
  );
}

function TablePagination({ pagination }: { pagination: NonNullable<CkmTablePanel["pagination"]> }) {
  const pages = Array.from({ length: Math.min(pagination.totalPages, 3) }, (_, index) => index + 1);
  return (
    <div className="ckm-pagination" aria-label="Sayfalama">
      <button type="button" disabled aria-label="Önceki sayfa">
        ‹
      </button>
      {pages.map((page) => (
        <button key={page} type="button" className={page === pagination.currentPage ? "ckm-page--active" : undefined} disabled>
          {page}
        </button>
      ))}
      {pagination.totalPages > 3 ? <span>…</span> : null}
      {pagination.totalPages > 3 ? (
        <button type="button" disabled>
          {pagination.totalPages}
        </button>
      ) : null}
      <button type="button" disabled aria-label="Sonraki sayfa">
        ›
      </button>
      <span className="ckm-pagination-meta">{pagination.pageSize} / sayfa</span>
    </div>
  );
}

function TableRowActions({ variant }: { variant: NonNullable<CkmTablePanel["actionVariant"]> }) {
  if (variant === "contact") {
    return (
      <>
        <button type="button" className="ckm-action-btn" disabled title="Mesaj gönder (hazırlanıyor)" aria-label="Mesaj">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          </svg>
        </button>
        <button type="button" className="ckm-action-btn" disabled title="Düzenle (hazırlanıyor)" aria-label="Düzenle">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path d="M12 20h9M4 20h2l9.5-9.5a2.1 2.1 0 0 0-3-3L3 17v3z" />
          </svg>
        </button>
        <button type="button" className="ckm-action-btn" disabled title="Sil (hazırlanıyor)" aria-label="Sil">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
          </svg>
        </button>
      </>
    );
  }
  if (variant === "payment") {
    return (
      <>
        <button type="button" className="ckm-action-btn" disabled title="Görüntüle (hazırlanıyor)" aria-label="Görüntüle">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <button type="button" className="ckm-action-btn" disabled title="Menü (hazırlanıyor)" aria-label="Menü">
          ⋮
        </button>
      </>
    );
  }
  return (
    <>
      <button type="button" className="ckm-action-btn" disabled title="Görüntüle (hazırlanıyor)" aria-label="Görüntüle">
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button type="button" className="ckm-action-btn" disabled title="Belge (hazırlanıyor)" aria-label="Belge">
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6" />
        </svg>
      </button>
      <button type="button" className="ckm-action-btn" disabled title="Menü (hazırlanıyor)" aria-label="Menü">
        ⋮
      </button>
    </>
  );
}

function PaymentMethodCell({ method }: { method: "cash" | "card" | "transfer" | "check" | "unknown" }) {
  return (
    <span className="ckm-method-cell">
      <span className={`ckm-method-icon ckm-method-icon--${method}`} aria-hidden />
      {method === "unknown" ? "—" : method === "cash" ? "Nakit" : method === "card" ? "Kredi Kartı" : method === "transfer" ? "Havale" : "Çek"}
    </span>
  );
}

function renderTableCell(
  panel: CkmTablePanel,
  column: string,
  rowIndex: number,
  value: string
): ReactNode {
  const meta = panel.rowMeta?.[rowIndex];
  if (column === "Aksiyon" && panel.showActions && panel.actionVariant) {
    return (
      <span className="ckm-actions-cell">
        <TableRowActions variant={panel.actionVariant} />
      </span>
    );
  }
  if (column === "Yöntem" && meta?.paymentMethod) {
    return <PaymentMethodCell method={meta.paymentMethod} />;
  }
  if (meta?.badges?.[column]) {
    return <CkmBadge tone={meta.badges[column]}>{value}</CkmBadge>;
  }
  if (meta?.linkColumns?.includes(column)) {
    return <span className="ckm-cell--link">{value}</span>;
  }
  return value || "—";
}

function ReferenceTablePanel({ panel, embedded = false }: { panel: CkmTablePanel; embedded?: boolean }) {
  const tableBlock = (
    <>
      <div className="ckm-table-wrap">
        <table className="ckm-table">
          <thead>
            <tr>
              {panel.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {panel.rows.length > 0 ? (
              panel.rows.map((row, index) => (
                <tr key={index}>
                  {panel.columns.map((column) => (
                    <td key={column} className={column === "Aksiyon" ? "ckm-actions-cell" : undefined}>
                      {renderTableCell(panel, column, index, row[column] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={panel.columns.length}>
                  <TableEmptyState panel={panel} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="ckm-table-foot">
        <span>{panel.footnote}</span>
        {panel.pagination ? <TablePagination pagination={panel.pagination} /> : null}
        {panel.viewAllHref ? (
          <Link href={panel.viewAllHref} className="ckm-link-btn">
            {panel.viewAllLabel ?? "Tümünü Gör"} →
          </Link>
        ) : null}
      </footer>
    </>
  );

  if (embedded) return tableBlock;

  return (
    <section className="ckm-panel ckm-panel--table" aria-labelledby={`ckm-panel-${panel.title}`}>
      <header className="ckm-panel-head">
        <h2 id={`ckm-panel-${panel.title}`}>
          {panel.title}
          {panel.countLabel ? <span className="ckm-count"> ({panel.countLabel})</span> : null}
        </h2>
        {panel.createHref ? (
          <div className="ckm-panel-actions">
            <Link href={panel.createHref} className="ckm-btn ckm-btn--primary ckm-btn--sm">
              {panel.createLabel ?? "Yeni"}
            </Link>
          </div>
        ) : null}
      </header>
      {tableBlock}
    </section>
  );
}

function KpiStrip({ view }: { view: CustomerLayerReferenceView }) {
  if (view.kpis && view.kpis.length > 0) {
    const rowClass =
      view.kpis.length >= 6 ? "ckm-kpi-row ckm-kpi-row--6" : view.kpis.length >= 5 ? "ckm-kpi-row ckm-kpi-row--5" : "ckm-kpi-row";
    return (
      <section className={rowClass} aria-label="Katman özet kartları">
        {view.kpis.map((kpi) => (
          <article
            key={kpi.id}
            className={`ckm-kpi-card ckm-kpi-card--${kpi.tone}${view.layer === "finans" ? " ckm-kpi-card--compact" : ""}`}
          >
            {view.layer === "ozet" ? <IconCkmKpi tone={kpi.tone} /> : null}
            <div>
              <span className="ckm-kpi-value">{kpi.value}</span>
              <span className="ckm-kpi-label">{kpi.label}</span>
              {kpi.progress !== undefined ? (
                <div className="ckm-kpi-progress" role="progressbar" aria-valuenow={kpi.progress} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${kpi.progress}%` }} />
                </div>
              ) : null}
              {kpi.sub ? <span className={`ckm-kpi-sub${kpi.subWarn ? " ckm-kpi-sub--warn" : ""}`}>{kpi.sub}</span> : null}
            </div>
          </article>
        ))}
      </section>
    );
  }

  if (view.layer === "ozet" || view.layer === "finans") {
    const labels =
      view.layer === "ozet"
        ? ["Toplam Bakiye", "Risk / Limit", "Son Hareket", "Açık Evrak / Fatura", "Tahsilat / Aktivite"]
        : ["Açık Bakiye", "Vadesi Gelen", "Vadesi Geçen", "Kredi Limiti", "Kullanılan Limit", "Risk Skoru"];
    return (
      <section className={`ckm-kpi-row${view.layer === "finans" ? " ckm-kpi-row--6" : " ckm-kpi-row--5"}`} aria-label="Katman özet kartları">
        {labels.map((label) => (
          <article key={label} className="ckm-kpi-card ckm-kpi-card--placeholder">
            <div>
              <span className="ckm-kpi-value">—</span>
              <span className="ckm-kpi-label">{label}</span>
              <span className="ckm-kpi-sub">Hesap özeti bağlandığında doldurulur</span>
            </div>
          </article>
        ))}
      </section>
    );
  }

  return null;
}

function OzetMain({ view }: { view: CustomerLayerReferenceView }) {
  const recordTabs = view.ozetRecordTabs ?? [];
  const tablePanel =
    view.tablePanel ??
    ({
      title: "İlgili Kayıtlar",
      columns: ["Belge No", "Belge Tarihi", "Vade Tarihi", "Açıklama", "Tutar", "Açık Bakiye", "Durum"],
      rows: [],
      emptyMessage: "Açık fatura kaydı bulunmuyor",
      emptyDetail: "Hesap hareketleri bağlandığında fatura satırları burada listelenir.",
      footnote: "Toplam 0 kayıt",
      viewAllHref: `/cariler/${view.customerId}/finans`,
      viewAllLabel: "Tümünü Gör"
    } satisfies CkmTablePanel);

  return (
    <>
      <header className="ckm-section-head ckm-section-head--ozet">
        <h2>
          Cari Özet Masası
          <span className="ckm-star" title="Önemli cari" aria-label="Önemli cari">
            ★
          </span>
        </h2>
      </header>
      {view.preparationMessage ? (
        <div className="ckm-prep-banner ckm-prep-banner--embedded" role="status">
          {view.preparationMessage}
        </div>
      ) : null}
      <KpiStrip view={view} />
      <section className="ckm-panel ckm-panel--table ckm-panel--records">
        <header className="ckm-panel-head">
          <h2>İlgili Kayıtlar</h2>
        </header>
        {recordTabs.length > 0 ? (
          <nav className="ckm-subtabs" aria-label="İlgili kayıt sekmeleri">
            {recordTabs.map((tab) => (
              <button key={tab.id} type="button" className={tab.active ? "ckm-subtab ckm-subtab--active" : "ckm-subtab"} disabled title="Alt sekme geçişi canlı bağlantı sonrası">
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        ) : null}
        <ReferenceTablePanel panel={tablePanel} embedded />
      </section>
    </>
  );
}

function FinansMain({ view }: { view: CustomerLayerReferenceView }) {
  return (
    <>
      <header className="ckm-section-head">
        <h2>Finans Masası</h2>
      </header>
      {view.preparationMessage ? (
        <div className="ckm-prep-banner ckm-prep-banner--embedded" role="status">
          {view.preparationMessage}
        </div>
      ) : null}
      <KpiStrip view={view} />
      <FinanceAgingTable view={view} />
    </>
  );
}

function IletisimMain({ view }: { view: CustomerLayerReferenceView }) {
  const contacts = view.contacts ?? [];
  return (
    <>
      {view.summaryCards ? (
        <section className="ckm-summary-row" aria-label="İletişim özet kartları">
          {view.summaryCards.map((card) => (
            <article key={card.label} className="ckm-summary-card">
              <span className="ckm-summary-label">{card.label}</span>
              <strong>{card.value}</strong>
              {card.sub ? <span className="ckm-summary-sub">{card.sub}</span> : null}
            </article>
          ))}
        </section>
      ) : null}
      <section className="ckm-panel ckm-panel--contacts" aria-labelledby="ckm-contacts-title">
        <header className="ckm-panel-head">
          <h2 id="ckm-contacts-title">İletişim Kişileri</h2>
          <button type="button" className="ckm-btn ckm-btn--primary ckm-btn--sm" disabled title="Canlı kişi ekleme bağlandığında etkinleşir">
            + Yeni Kişi Ekle
          </button>
        </header>
        <div className="ckm-table-wrap">
          <table className="ckm-table">
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
                contacts.map((row) => (
                  <tr key={`${row.email}-${row.phone}`}>
                    <td>
                      <span className="ckm-person-cell">
                        <span className="ckm-person-avatar">{row.initials}</span>
                        {row.name}
                      </span>
                    </td>
                    <td>{row.role}</td>
                    <td>{row.phone}</td>
                    <td>{row.email}</td>
                    <td>{row.preferred}</td>
                    <td className="ckm-actions-cell">
                      <TableRowActions variant="contact" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="ckm-table-empty" role="status">
                      <strong>İletişim kişisi bulunmuyor</strong>
                      <p>Ana cari kaydından telefon ve e-posta gösteriliyor; kişi listesi bağlandığında burada listelenir.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function CommercialLayerMain({ view }: { view: CustomerLayerReferenceView }) {
  if (!view.tablePanel) return null;
  const panel = view.tablePanel;
  return (
    <>
      {view.preparationMessage ? (
        <div className="ckm-prep-banner ckm-prep-banner--embedded" role="status">
          {view.preparationMessage}
        </div>
      ) : null}
      <ReferenceTablePanel panel={panel} />
    </>
  );
}

function TimelineMain({ view }: { view: CustomerLayerReferenceView }) {
  const events = view.timelineEvents ?? [];
  const groups = [...new Set(events.map((event) => event.group))];

  return (
    <>
      {groups.length > 0 ? (
        groups.map((group) => (
          <div key={group}>
            <h3 className="ckm-tl-group">{group}</h3>
            <ol className="ckm-tl-list">
              {events
                .filter((event) => event.group === group)
                .map((event) => (
                  <li key={event.id} className="ckm-tl-item">
                    <span className={`ckm-tl-dot ckm-tl-dot--${event.tone}`} aria-hidden />
                    <div className="ckm-tl-body">
                      <div className="ckm-tl-head">
                        <strong>{event.title}</strong>
                        <CkmBadge tone={event.tone}>{event.type}</CkmBadge>
                      </div>
                      <p>{event.desc}</p>
                      <span className="ckm-tl-meta">
                        {event.user} · {event.time}
                      </span>
                    </div>
                  </li>
                ))}
            </ol>
          </div>
        ))
      ) : (
        <section className="ckm-panel">
          <div className="ckm-table-empty" role="status">
            <strong>Zaman akışı kaydı bulunmuyor</strong>
            <p>Cari zaman çizelgesi API'si bağlandığında not, arama, teklif ve ödeme olayları burada listelenir.</p>
          </div>
        </section>
      )}
    </>
  );
}

function FinansSidePanel({ side }: { side: CkmFinansSide }) {
  return (
    <CustomerLayerContextPanel title={side.title} ariaLabel="Finans bağlamı">
      <section className="ckm-suggest-card">
        <h3>Öncelikli Tahsilat</h3>
        <p className="ckm-suggest-amount">{side.suggestionAmount ?? "—"}</p>
        <p>{side.suggestionStrategy}</p>
        <p className="ckm-suggest-note">{side.suggestionPlan}</p>
      </section>
      <section className="ckm-context-block">
        <h3>Finansal KPI&apos;lar</h3>
        <div className="ckm-mini-kpis">
          {side.miniKpis.map((kpi) => (
            <article key={kpi.label}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
            </article>
          ))}
        </div>
      </section>
      <Link href={side.ctaHref} className="ckm-btn ckm-btn--primary ckm-btn--block">
        Tahsilat Planı Oluştur
      </Link>
      <p className="ckm-empty-note">Son güncelleme: {side.updatedLabel}</p>
    </CustomerLayerContextPanel>
  );
}

function IletisimSidePanel({ side }: { side: CkmIletisimSide }) {
  return (
    <CustomerLayerContextPanel ariaLabel="İletişim bağlamı" variant="whatsapp">
      <section className="ckm-wa-card">
        <div className="ckm-wa-brand">
          <span className="ckm-wa-logo" aria-hidden />
          <h2>{side.title}</h2>
        </div>
        <p className="ckm-wa-phone">{side.whatsappPhone}</p>
        <span className="ckm-wa-status">{side.status}</span>
        <p className="ckm-wa-last">{side.lastMessage}</p>
        {side.whatsappHref ? (
          <Link href={side.whatsappHref} className="ckm-btn ckm-btn--primary ckm-btn--block">
            WhatsApp Sohbetini Aç
          </Link>
        ) : (
          <button type="button" className="ckm-btn ckm-btn--outline ckm-btn--block" disabled>
            WhatsApp bağlantısı yok
          </button>
        )}
      </section>
      <section className="ckm-context-block">
        <h3>Hızlı İşlemler</h3>
        <ul className="ckm-quick-icon-grid">
          {side.quickActions.map((action) => (
            <li key={action.id}>
              <button type="button" className="ckm-quick-icon-btn" disabled title={`${action.label} (hazırlanıyor)`} aria-label={action.label}>
                <span className={`ckm-quick-icon ckm-quick-icon--${action.id}`} aria-hidden />
                <span>{action.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="ckm-context-block">
        <div className="ckm-pref-row">
          <h3>İletişim Tercihleri</h3>
          <button type="button" className="ckm-link-btn" disabled title="Tercih düzenleme hazırlanıyor">
            Düzenle
          </button>
        </div>
        <p className="ckm-pref">
          Tercih Edilen Kanal: <strong>{side.preferred}</strong>
        </p>
      </section>
    </CustomerLayerContextPanel>
  );
}

function TekliflerSidePanel({ side }: { side: CkmTekliflerSide }) {
  return (
    <CustomerLayerContextPanel title={side.title} ariaLabel="Teklif bağlamı" variant="filter">
      <section className="ckm-context-block">
        <h3>Durum</h3>
        <ul className="ckm-filter-list">
          {side.statuses.map((item) => (
            <li key={item.label}>
              <label>
                <input type="checkbox" readOnly checked={item.count > 0} disabled />
                {item.label} ({item.count})
              </label>
            </li>
          ))}
        </ul>
      </section>
      <section className="ckm-context-block">
        <h3>Tarih Aralığı</h3>
        <select defaultValue="90" className="ckm-select" disabled aria-label="Tarih aralığı">
          <option value="90">{side.dateRangeLabel}</option>
        </select>
      </section>
      <section className="ckm-context-block">
        <h3>Tutar Aralığı</h3>
        <div className="ckm-range">
          <input type="text" placeholder="Min Tutar" aria-label="Min tutar" disabled />
          <input type="text" placeholder="Max Tutar" aria-label="Max tutar" disabled />
        </div>
      </section>
      <section className="ckm-context-block">
        <h3>Yetkili</h3>
        <input type="text" className="ckm-input" placeholder={side.assigneePlaceholder} disabled aria-label="Yetkili" />
      </section>
      <section className="ckm-context-block">
        <h3>Oluşturan</h3>
        <input type="text" className="ckm-input" placeholder={side.creatorPlaceholder} disabled aria-label="Oluşturan" />
      </section>
      <button type="button" className="ckm-btn ckm-btn--primary ckm-btn--block" disabled title="Canlı filtre bağlandığında etkinleşir">
        Filtrele
      </button>
      <button type="button" className="ckm-btn ckm-btn--outline ckm-btn--block" disabled title="Canlı filtre bağlandığında etkinleşir">
        Filtreleri Temizle
      </button>
      <p className="ckm-empty-note">Toplam {side.total} teklif kaydı</p>
    </CustomerLayerContextPanel>
  );
}

function SiparislerSidePanel({ side }: { side: CkmSiparislerSide }) {
  return (
    <CustomerLayerContextPanel title={side.title} ariaLabel="Sipariş bağlamı">
      {side.orderNo ? (
        <div className="ckm-order-id">
          <strong>{side.orderNo}</strong>
          {side.status ? <CkmBadge tone={side.statusTone ?? "neutral"}>{side.status}</CkmBadge> : null}
        </div>
      ) : (
        <p className="ckm-empty-note">{side.emptyMessage}</p>
      )}
      <dl className="ckm-dl ckm-dl--stack">
        {side.fields.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <section className="ckm-context-block">
        <h3>Teslimat Bilgileri</h3>
        <dl className="ckm-dl ckm-dl--stack">
          {side.delivery.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <button type="button" className="ckm-btn ckm-btn--primary ckm-btn--block" disabled title="Sipariş detayı API bağlandığında etkinleşir">
        Detayları Görüntüle →
      </button>
    </CustomerLayerContextPanel>
  );
}

function TahsilatlarSidePanel({ side }: { side: CkmTahsilatlarSide }) {
  return (
    <CustomerLayerContextPanel title={side.title} ariaLabel="Tahsilat bağlamı" variant="summary">
      <dl className="ckm-dl ckm-dl--summary">
        {side.summary.map((row) => (
          <div key={row.label} className={row.tone ? `ckm-dl-row--${row.tone}` : undefined}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <dl className="ckm-dl ckm-dl--stack">
        {side.dates.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="ckm-context-actions">
        {side.actions.map((action) =>
          action.href ? (
            <Link
              key={action.label}
              href={action.href}
              className={action.primary ? "ckm-btn ckm-btn--primary ckm-btn--block" : "ckm-btn ckm-btn--outline ckm-btn--block"}
            >
              {action.label}
            </Link>
          ) : (
            <button
              key={action.label}
              type="button"
              className={action.primary ? "ckm-btn ckm-btn--primary ckm-btn--block" : "ckm-btn ckm-btn--outline ckm-btn--block"}
              disabled
              title="Canlı tahsilat aksiyonu bağlandığında etkinleşir"
            >
              {action.label}
            </button>
          )
        )}
      </div>
    </CustomerLayerContextPanel>
  );
}

function ShortcutIcon({ icon }: { icon: "offer" | "order" | "payment" | "card" }) {
  const props = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  if (icon === "offer") {
    return (
      <svg {...props}>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <path d="M14 3v6h6" />
      </svg>
    );
  }
  if (icon === "order") {
    return (
      <svg {...props}>
        <path d="M6 6h15l-1.5 9h-12z" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
      </svg>
    );
  }
  if (icon === "payment") {
    return (
      <svg {...props}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  );
}

function OzetContextPanel({ view }: { view: CustomerLayerReferenceView }) {
  const { context } = view;
  return (
    <CustomerLayerContextPanel title={context.title} ariaLabel="Cari katman bağlamı">
      <section className="ckm-context-block">
        <h3>Cari Bilgileri</h3>
        <dl className="ckm-dl">
          {context.cari.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.badge ? <CkmBadge>{row.value}</CkmBadge> : row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="ckm-context-block">
        <h3>Finansal Durum</h3>
        <dl className="ckm-dl">
          {context.finans.map((row) => (
            <div key={row.label} className={row.negative ? "ckm-dl-row--neg" : row.warn ? "ckm-dl-row--warn" : undefined}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="ckm-context-block">
        <h3>Son Hareketler</h3>
        {context.hareketler.length > 0 ? (
          <ul className="ckm-move-list">
            {context.hareketler.map((item) => (
              <li key={`${item.type}-${item.date}-${item.title}`}>
                <span className={`ckm-move-icon ckm-move-icon--${item.type}`} aria-hidden />
                <div>
                  <strong>{item.title}</strong>
                  <span>
                    {item.date} · {item.amount}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ckm-empty-note">Henüz hareket kaydı yok.</p>
        )}
      </section>
      <footer className="ckm-context-actions ckm-context-actions--icons">
        <h3>Kısayollar</h3>
        <ul className="ckm-shortcut-list">
          {context.shortcuts.map((shortcut) => (
            <li key={shortcut.href}>
              <Link href={shortcut.href} className="ckm-shortcut-link">
                <span className="ckm-shortcut-icon">
                  <ShortcutIcon icon={shortcut.icon} />
                </span>
                <span>{shortcut.label}</span>
                <span className="ckm-shortcut-arrow" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </footer>
    </CustomerLayerContextPanel>
  );
}

function StandardContextPanel({ view }: { view: CustomerLayerReferenceView }) {
  const { context } = view;
  return (
    <CustomerLayerContextPanel title={context.title} ariaLabel="Cari katman bağlamı">
      <section className="ckm-context-block">
        <h3>Cari Bilgileri</h3>
        <dl className="ckm-dl">
          {context.cari.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.badge ? <CkmBadge>{row.value}</CkmBadge> : row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="ckm-context-block">
        <h3>Finansal Durum</h3>
        <dl className="ckm-dl">
          {context.finans.map((row) => (
            <div key={row.label} className={row.negative ? "ckm-dl-row--neg" : row.warn ? "ckm-dl-row--warn" : undefined}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="ckm-context-block">
        <h3>Son Hareketler</h3>
        {context.hareketler.length > 0 ? (
          <ul className="ckm-move-list">
            {context.hareketler.map((item) => (
              <li key={`${item.type}-${item.date}-${item.title}`}>
                <span className={`ckm-move-icon ckm-move-icon--${item.type}`} aria-hidden />
                <div>
                  <strong>{item.title}</strong>
                  <span>
                    {item.date} · {item.amount}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ckm-empty-note">Henüz hareket kaydı yok.</p>
        )}
      </section>
      <footer className="ckm-context-actions">
        <h3>Kısayollar</h3>
        {context.shortcuts.map((shortcut, index) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className={index === 0 ? "ckm-btn ckm-btn--primary ckm-btn--block" : "ckm-btn ckm-btn--outline ckm-btn--block"}
          >
            {shortcut.label}
          </Link>
        ))}
      </footer>
    </CustomerLayerContextPanel>
  );
}

export function CustomerLayerReferenceMain({ view }: { view: CustomerLayerReferenceView }) {
  switch (view.layer) {
    case "ozet":
      return <OzetMain view={view} />;
    case "finans":
      return <FinansMain view={view} />;
    case "iletisim":
      return <IletisimMain view={view} />;
    case "timeline":
      return <TimelineMain view={view} />;
    case "teklifler":
    case "siparisler":
    case "tahsilatlar":
      return <CommercialLayerMain view={view} />;
    default:
      return null;
  }
}

export function CustomerLayerReferenceSide({ view }: { view: CustomerLayerReferenceView }) {
  if (view.layer === "ozet") return <OzetContextPanel view={view} />;
  if (view.layer === "finans" && view.finansSide) return <FinansSidePanel side={view.finansSide} />;
  if (view.layer === "iletisim" && view.iletisimSide) return <IletisimSidePanel side={view.iletisimSide} />;
  if (view.layer === "teklifler" && view.tekliflerSide) return <TekliflerSidePanel side={view.tekliflerSide} />;
  if (view.layer === "siparisler" && view.siparislerSide) return <SiparislerSidePanel side={view.siparislerSide} />;
  if (view.layer === "tahsilatlar" && view.tahsilatlarSide) return <TahsilatlarSidePanel side={view.tahsilatlarSide} />;
  if (view.layer === "timeline") {
    return (
      <CustomerLayerContextPanel title="Zaman Akışı Bağlamı" ariaLabel="Zaman akışı bağlamı">
        <section className="ckm-context-block">
          <h3>İlişkili Kayıtlar</h3>
          <dl className="ckm-dl ckm-dl--stack">
            <div>
              <dt>Müşteri</dt>
              <dd>{view.header.title}</dd>
            </div>
            <div>
              <dt>Cari Kodu</dt>
              <dd>{view.header.meta[0]?.value ?? "—"}</dd>
            </div>
          </dl>
        </section>
        <section className="ckm-context-block">
          <h3>Canlı veri</h3>
          <p className="ckm-empty-note">Zaman çizelgesi olay akışı API bağlantısı hazırlanıyor.</p>
        </section>
      </CustomerLayerContextPanel>
    );
  }
  return <StandardContextPanel view={view} />;
}

export function CustomerLayerTimelineFilters() {
  return (
    <aside className="ckm-filter-col" aria-label="Zaman akışı filtreleri">
      <h2>Filtreler</h2>
      <label className="ckm-filter-label">
        Olay Tipi
        <select defaultValue="all" disabled>
          <option value="all">Tümü</option>
        </select>
      </label>
      <label className="ckm-filter-label">
        Tarih Aralığı
        <select defaultValue="90" disabled>
          <option value="90">Son 90 gün</option>
        </select>
      </label>
      <button type="button" className="ckm-btn ckm-btn--outline ckm-btn--block" disabled>
        Filtre canlı bağlantı sonrası
      </button>
    </aside>
  );
}
