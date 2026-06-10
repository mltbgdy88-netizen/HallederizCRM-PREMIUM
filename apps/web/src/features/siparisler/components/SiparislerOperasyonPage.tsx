"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconInfo, IconRefresh, IconSearch, IconZap, KpiIcon } from "@/components/reference/icons";
import { useSiparislerReferenceData } from "@/features/siparisler/hooks/use-siparisler-reference-data";
import { SiparisFulfillmentLinks } from "@/features/siparisler/components/SiparisFulfillmentLinks";
import { sipStatusBadgeClass } from "@/features/siparisler/data/siparisler-operasyon-mock";
import {
  fulfillmentShowsFabrikaLink,
  resolveFabrikaSiparisDetayHref
} from "@/lib/siparis-fulfillment-links";

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconExport({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3v12M8 11l4 4 4-4M5 21h14" />
    </svg>
  );
}

function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 17v5M8 3h8l-1 7h2l-3 7-3-7h2L8 3z" />
    </svg>
  );
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3 2 20h20L12 3z" />
      <path d="M12 10v4" />
    </svg>
  );
}

function IconChat({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
    </svg>
  );
}

function siparisDetayHref(orderId: string): string {
  return `/siparisler/detay?orderId=${encodeURIComponent(orderId)}`;
}

function siparisKatmanHref(orderId: string): string {
  return `/siparisler/katman/ozet?orderId=${encodeURIComponent(orderId)}`;
}

export function SiparislerOperasyonPage() {
  const router = useRouter();
  const {
    title,
    subtitle,
    kpis,
    filterSearchPlaceholder,
    filters,
    tableRows,
    tableTotal,
    pageNumbers,
    getContext
  } = useSiparislerReferenceData();
  const [selectedId, setSelectedId] = useState(tableRows[0]?.id ?? "1");
  const context = getContext(selectedId);

  return (
    <div className="sip-home">
      <header className="sip-head">
        <div className="sip-head-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="sip-head-actions">
          <Link href="/siparisler/yeni" className="sip-btn sip-btn--primary">
            <IconPlus className="sip-btn-icon" />
            Yeni Sipariş
          </Link>
          <button type="button" className="sip-btn sip-btn--gold">
            <IconZap className="sip-btn-icon" />
            Hızlı Satış
          </button>
          <button type="button" className="sip-btn sip-btn--outline">
            <IconExport className="sip-btn-icon" />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="sip-kpi-row" aria-label="Sipariş özetleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`sip-kpi-card sip-kpi-card--${kpi.tone}`}>
            <div className={`sip-kpi-icon sip-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone} />
            </div>
            <div className="sip-kpi-body">
              <span className="sip-kpi-value">{kpi.value}</span>
              <span className="sip-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="sip-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="sip-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="sip-workspace">
        <section className="sip-main" aria-label="Sipariş listesi">
          <div className="sip-filters">
            <label className="sip-filter-search">
              <IconSearch className="sip-filter-search-icon" />
              <input type="search" placeholder={filterSearchPlaceholder} readOnly aria-label="Müşteri ara" />
            </label>
            {filters.map((filter) => (
              <label key={filter.id} className="sip-filter-field">
                <span>{filter.label}</span>
                <select defaultValue="all" aria-label={filter.label}>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button type="button" className="sip-filter-reset">
              <IconRefresh className="sip-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          <div className="sip-table-panel">
            <div className="sip-table-wrap">
              <table className="sip-table">
                <thead>
                  <tr>
                    <th>Sipariş No</th>
                    <th>Müşteri</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Teslim</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "sip-row sip-row--selected" : "sip-row"}
                      onClick={() => {
                        setSelectedId(row.id);
                        router.push(siparisDetayHref(row.id));
                      }}
                    >
                      <td className="sip-cell-order">{row.orderNo}</td>
                      <td className="sip-cell-customer">{row.customer}</td>
                      <td>{row.amount}</td>
                      <td>
                        <span className={`sip-badge${sipStatusBadgeClass(row.status)}`}>{row.status}</span>
                      </td>
                      <td>{row.delivery}</td>
                      <td className="sip-cell-actions" onClick={(event) => event.stopPropagation()}>
                        <Link href={siparisDetayHref(row.id)}>Detay</Link>
                        <Link href={siparisKatmanHref(row.id)}>Katman</Link>
                        {fulfillmentShowsFabrikaLink(getContext(row.id).fulfillment) ? (
                          <Link
                            href={resolveFabrikaSiparisDetayHref(getContext(row.id).fulfillment.factoryOrderId!)}
                          >
                            Fabrika
                          </Link>
                        ) : null}
                        <button type="button">Yazdır</button>
                        <button type="button">Düzenle</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="sip-table-foot">
              <span>{tableTotal}</span>
              <div className="sip-pagination">
                <label className="sip-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="sip-page-nums" aria-label="Sayfalama">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === "1" ? "sip-page-btn sip-page-btn--active" : "sip-page-btn"}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="sip-context" aria-label="Sipariş bağlamı">
          <header className="sip-context-head">
            <h2>
              <IconPin className="sip-context-pin" />
              Sipariş Bağlamı
            </h2>
          </header>

          <div className="sip-context-hero">
            <div>
              <span className="sip-context-order">{context.orderNo}</span>
              <span className={`sip-badge${sipStatusBadgeClass(context.status)}`}>{context.status}</span>
            </div>
          </div>

          <dl className="sip-context-dl">
            <div>
              <dt>Müşteri</dt>
              <dd>{context.customer}</dd>
            </div>
            <div>
              <dt>Yetkili</dt>
              <dd>{context.contact}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{context.phone}</dd>
            </div>
            <div>
              <dt>E-posta</dt>
              <dd>{context.email}</dd>
            </div>
            <div>
              <dt>Teslim</dt>
              <dd>{context.deliveryDate}</dd>
            </div>
            <div>
              <dt>Tutar</dt>
              <dd>{context.totalAmount}</dd>
            </div>
            <div>
              <dt>Ödeme</dt>
              <dd>{context.paymentMethod}</dd>
            </div>
          </dl>

          <SiparisFulfillmentLinks
            fulfillment={context.fulfillment}
            salesOrderId={context.orderId}
            className="sip-context-fulfillment"
          />

          <article className="sip-context-card">
            <h4>Sipariş Kalemleri</h4>
            <dl className="sip-context-dl sip-context-dl--compact">
              <div>
                <dt>Kalem</dt>
                <dd>{context.lineCount}</dd>
              </div>
              <div>
                <dt>Adet</dt>
                <dd>{context.quantity}</dd>
              </div>
              <div>
                <dt>İndirim</dt>
                <dd>{context.discount}</dd>
              </div>
              <div>
                <dt>Ara Toplam</dt>
                <dd>{context.subtotal}</dd>
              </div>
              <div>
                <dt>KDV (%20)</dt>
                <dd>{context.vat}</dd>
              </div>
              <div className="sip-context-total">
                <dt>Genel Toplam</dt>
                <dd>{context.grandTotal}</dd>
              </div>
            </dl>
          </article>

          <article className="sip-notice sip-notice--warn">
            <IconAlert className="sip-notice-icon" />
            <div>
              <p>{context.paymentAlert}</p>
              <button type="button" className="sip-due-btn">
                Vadesi Gelenleri Gör ({context.dueCount})
              </button>
            </div>
          </article>

          <footer className="sip-context-actions">
            <h4 className="sip-next-title">Sonraki Adımlar</h4>
            <button type="button" className="sip-btn sip-btn--primary sip-btn--block">
              Sevkiyat Oluştur
            </button>
            <button type="button" className="sip-btn sip-btn--gold sip-btn--block">
              Fatura Oluştur
            </button>
            <button type="button" className="sip-btn sip-btn--outline sip-btn--block">
              <IconChat className="sip-btn-icon" />
              Müşteriye Mesaj Gönder
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}

