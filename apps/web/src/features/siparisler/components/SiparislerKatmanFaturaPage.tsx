"use client";

import Link from "next/link";
import { SiparisBadge, SiparisKatmanBreadcrumbHead, SiparislerKatmanTabs } from "./SiparislerKatmanShared";
import { useSiparislerKatmanReferenceData } from "@/features/siparisler/hooks/use-siparisler-katman-reference-data";

export function SiparislerKatmanFaturaPage() {
  const { data } = useSiparislerKatmanReferenceData();
  const { header, layer } = data;
  return (
    <div className="skm-home skm-home--layer">
      <SiparisKatmanBreadcrumbHead
        breadcrumb={header.breadcrumb}
        orderId={header.orderId}
        status={header.status}
        meta={header.meta}
        actions={
          <>
            <Link href="/siparisler/yeni" className="skm-btn skm-btn--primary">
              + Yeni Sipariş
            </Link>
            <button type="button" className="skm-btn skm-btn--outline">
              Düzenle
            </button>
            <button type="button" className="skm-btn skm-btn--outline">
              Diğer İşlemler ▾
            </button>
          </>
        }
      />

      <SiparislerKatmanTabs active="fatura" tabs={layer.tabs} />

      <div className="skm-workspace skm-workspace--layer">
        <div className="skm-main">
          <section className="skm-panel skm-panel--layer" aria-labelledby="skm-fatura-title">
            <header className="skm-panel-head skm-panel-head--split">
              <div>
                <h2 id="skm-fatura-title">Oluşturulan Faturalar</h2>
                <p className="skm-panel-desc">Siparişe bağlı faturaları görüntüleyin ve yönetin.</p>
              </div>
              <button type="button" className="skm-btn skm-btn--primary">
                + Yeni Fatura Oluştur
              </button>
            </header>

            <div className="skm-mini-kpi-row" aria-label="Fatura özetleri">
              {layer.faturaKpis.map((kpi) => (
                <article
                  key={kpi.label}
                  className={"warn" in kpi && kpi.warn ? "skm-mini-kpi skm-mini-kpi--warn" : "skm-mini-kpi"}
                >
                  <span className="skm-mini-kpi-label">{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  {"sub" in kpi ? <span className="skm-mini-kpi-sub">{kpi.sub}</span> : null}
                </article>
              ))}
            </div>

            <div className="skm-filter-row">
              <input className="skm-search" placeholder="Faturalarda ara..." aria-label="Fatura ara" readOnly />
              <select defaultValue="" aria-label="Fatura durumu">
                <option value="">Fatura Durumu</option>
              </select>
              <select defaultValue="" aria-label="e-Fatura durumu">
                <option value="">e-Fatura Durumu</option>
              </select>
              <select defaultValue="" aria-label="Tarih aralığı">
                <option value="">Tarih Aralığı</option>
              </select>
              <button type="button" className="skm-btn skm-btn--outline">
                Filtrele
              </button>
            </div>

            <div className="skm-table-wrap">
              <table className="skm-table">
                <thead>
                  <tr>
                    <th>Fatura No</th>
                    <th>Fatura Tarihi</th>
                    <th>Vade Tarihi</th>
                    <th>Tutar (KDV Dahil)</th>
                    <th>Ödeme Durumu</th>
                    <th>e-Fatura Durumu</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {layer.faturaRows.map((row) => (
                    <tr key={row.no}>
                      <td>{row.no}</td>
                      <td>{row.date}</td>
                      <td>{row.due}</td>
                      <td>{row.amount}</td>
                      <td>
                        <SiparisBadge tone={row.payTone}>{row.payStatus}</SiparisBadge>
                      </td>
                      <td>
                        <SiparisBadge tone={row.eTone}>{row.eStatus}</SiparisBadge>
                      </td>
                      <td className="skm-cell-actions">Görüntüle ···</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="skm-table-foot">
              <span>Toplam {layer.faturaRows.length} kayıt</span>
              <div className="skm-pagination">
                <select defaultValue="10" aria-label="Sayfa boyutu">
                  <option value="10">10 satır</option>
                </select>
                <span>1 / 1</span>
              </div>
            </footer>
          </section>
        </div>

        <aside className="skm-context" aria-label={layer.faturaContext.title}>
          <header className="skm-context-head">
            <h2>{layer.faturaContext.title}</h2>
          </header>

          <section className="skm-context-block">
            <h3>Sipariş Bilgileri</h3>
            <dl className="skm-dl">
              <div>
                <dt>Sipariş No</dt>
                <dd>{header.orderId}</dd>
              </div>
              <div>
                <dt>Müşteri</dt>
                <dd>{header.customerName}</dd>
              </div>
              <div>
                <dt>Tarih</dt>
                <dd>{header.orderDateLabel}</dd>
              </div>
              <div>
                <dt>Toplam Tutar</dt>
                <dd>{data.totals.find((t) => t.strong)?.value ?? data.totals.at(-1)?.value ?? layer.faturaContext.total}</dd>
              </div>
              <div className="skm-dl-row--neg">
                <dt>Kalan Tutar</dt>
                <dd>{data.kpis.find((k) => k.id === "remaining")?.value ?? layer.faturaContext.remaining}</dd>
              </div>
            </dl>
          </section>

          <section className="skm-context-block">
            <h3>e-Fatura Özeti</h3>
            <dl className="skm-dl skm-dl--summary">
              {layer.faturaContext.eSummary.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="skm-context-block">
            <h3>İşlemler</h3>
            <div className="skm-context-actions">
              {layer.faturaContext.actions.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className={i === 0 ? "skm-btn skm-btn--primary skm-btn--block" : "skm-btn skm-btn--outline skm-btn--block"}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="skm-context-block skm-notes">
            <h3>Notlar</h3>
            <p>{layer.faturaContext.note}</p>
            <span className="skm-notes-meta">Son Güncelleme: {layer.faturaContext.updated}</span>
          </section>
        </aside>
      </div>
    </div>
  );
}
