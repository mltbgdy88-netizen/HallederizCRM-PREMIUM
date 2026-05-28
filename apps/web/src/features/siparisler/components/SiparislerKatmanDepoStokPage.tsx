"use client";

import Link from "next/link";
import { SiparisBadge, SiparislerKatmanTabs, SkmKpiIcon } from "./SiparislerKatmanShared";
import { useSiparislerKatmanReferenceData } from "@/features/siparisler/hooks/use-siparisler-katman-reference-data";

export function SiparislerKatmanDepoStokPage() {
  const { data } = useSiparislerKatmanReferenceData();
  const { header, layer } = data;

  return (
    <div className="skm-home skm-home--depo">
      <header className="skm-page-head">
        <div>
          <h1>Siparişler</h1>
          <p className="skm-subtitle">Sipariş depo stok etkisini izleyin ve rezervasyon hareketlerini yönetin.</p>
        </div>
        <div className="skm-head-actions">
          <span className="skm-muted">
            {header.orderId} · {header.customerName}
          </span>
          <Link href="/siparisler/yeni" className="skm-btn skm-btn--primary">
            + Yeni Sipariş
          </Link>
          <button type="button" className="skm-btn skm-btn--outline">
            Dışa Aktar
          </button>
          <button type="button" className="skm-btn skm-btn--outline">
            Filtrele
          </button>
          <button type="button" className="skm-btn skm-btn--outline" aria-label="Diğer">
            ···
          </button>
        </div>
      </header>

      <section className="skm-kpi-row skm-kpi-row--6" aria-label="Sipariş özetleri">
        {layer.depoKpis.map((kpi) => (
          <article key={kpi.id} className={`skm-kpi-card skm-kpi-card--${kpi.tone} skm-kpi-card--compact`}>
            <SkmKpiIcon tone={kpi.tone} />
            <div>
              <span className="skm-kpi-value">{kpi.value}</span>
              <span className="skm-kpi-label">{kpi.label}</span>
            </div>
          </article>
        ))}
      </section>

      <SiparislerKatmanTabs active="depo" tabs={layer.tabs} />

      <div className="skm-workspace skm-workspace--depo">
        <div className="skm-main">
          <p className="skm-info-alert" role="status">
            {layer.depoAlert}
          </p>

          <section className="skm-panel skm-panel--table" aria-label="Depo stok etkisi">
            <header className="skm-panel-head">
              <h2>Depo Stok Etkisi</h2>
            </header>
            <div className="skm-table-wrap">
              <table className="skm-table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Rezerv</th>
                    <th>Çekim</th>
                    <th>Eksik</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {layer.depoRows.map((row) => (
                    <tr key={row.code}>
                      <td className="skm-cell-product">
                        <span className="skm-product-code">{row.code}</span>
                        <span className="skm-product-name">{row.name}</span>
                      </td>
                      <td>{row.reserve} adet</td>
                      <td>{row.withdraw} adet</td>
                      <td className={row.ok ? "" : "skm-cell-missing"}>{row.missing} adet</td>
                      <td>
                        <button
                          type="button"
                          className={row.ok ? "skm-stock-btn skm-stock-btn--ok" : "skm-stock-btn skm-stock-btn--bad"}
                        >
                          {row.ok ? "Yeterli Stok" : "Stok Eksik"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="skm-table-foot">
              <span>Toplam {layer.depoRows.length} ürün</span>
              <div className="skm-pagination">
                <select defaultValue="10" aria-label="Sayfa boyutu">
                  <option value="10">10 satır</option>
                </select>
                <span>1 / 1</span>
              </div>
            </footer>
          </section>
        </div>

        <aside className="skm-context skm-context--depo" aria-label={layer.depoContext.title}>
          <header className="skm-context-head">
            <h2>{layer.depoContext.title}</h2>
          </header>

          <section className="skm-depo-card">
            <div className="skm-depo-card-top">
              <strong>{layer.depoContext.warehouse}</strong>
              <SiparisBadge tone="info">{layer.depoContext.badge}</SiparisBadge>
              <SiparisBadge>{layer.depoContext.status}</SiparisBadge>
            </div>
            <dl className="skm-dl">
              <div>
                <dt>Kod</dt>
                <dd>{layer.depoContext.code}</dd>
              </div>
              <div>
                <dt>Konum</dt>
                <dd>{layer.depoContext.location}</dd>
              </div>
              <div>
                <dt>Sorumlu</dt>
                <dd>{layer.depoContext.responsible}</dd>
              </div>
              <div>
                <dt>Kapasite</dt>
                <dd>
                  {layer.depoContext.capacity} ({layer.depoContext.capacityPct})
                </dd>
              </div>
              <div>
                <dt>Son Güncelleme</dt>
                <dd>{layer.depoContext.updated}</dd>
              </div>
              <div>
                <dt>Sipariş</dt>
                <dd>{header.orderId}</dd>
              </div>
              <div>
                <dt>Müşteri</dt>
                <dd>{header.customerName}</dd>
              </div>
            </dl>
          </section>

          <section className="skm-context-block">
            <h3>Raf Uyarıları</h3>
            <ul className="skm-warning-list">
              {layer.depoContext.warnings.map((w) => (
                <li key={`${w.shelf}-${w.label}`} className={`skm-warning-item skm-warning-item--${w.tone}`}>
                  <span>{w.label}</span>
                  <span>{w.shelf}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="skm-link-btn">
              Tüm Rafları Görüntüle
            </button>
          </section>

          <section className="skm-context-block">
            <h3>Hızlı İşlemler</h3>
            <div className="skm-context-actions">
              {layer.depoContext.actions.map((label, i) => (
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
        </aside>
      </div>
    </div>
  );
}

