"use client";

import Link from "next/link";
import { SiparisBadge, SiparisKatmanBreadcrumbHead, SiparislerKatmanTabs } from "./SiparislerKatmanShared";
import { useSiparislerKatmanReferenceData } from "@/features/siparisler/hooks/use-siparisler-katman-reference-data";

export function SiparislerKatmanTeslimatPage() {
  const { data } = useSiparislerKatmanReferenceData();
  const { header, layer } = data;
  const ctx = layer.teslimatContext;

  return (
    <div className="skm-home skm-home--layer">
      <SiparisKatmanBreadcrumbHead
        breadcrumb={header.breadcrumb}
        orderId={header.orderId}
        status={header.status}
        meta={header.meta}
        actions={
          <>
            <button type="button" className="skm-btn skm-btn--outline">
              Düzenle
            </button>
            <button type="button" className="skm-btn skm-btn--outline">
              Yazdır ▾
            </button>
            <button type="button" className="skm-btn skm-btn--primary">
              + Yeni Teslimat
            </button>
          </>
        }
      />

      <article className="skm-order-strip">
        <span className="skm-order-strip-icon" aria-hidden>
          📄
        </span>
        <div className="skm-order-strip-grid">
          <div>
            <span className="skm-meta-label">Sipariş No</span>
            <strong>{header.orderId}</strong>
            <SiparisBadge tone="ok">{header.status}</SiparisBadge>
          </div>
          <div>
            <span className="skm-meta-label">Müşteri</span>
            <strong>{header.customerName}</strong>
          </div>
          <div>
            <span className="skm-meta-label">Sipariş Tarihi</span>
            <strong>{header.orderDateLabel}</strong>
          </div>
          <div>
            <span className="skm-meta-label">Toplam Tutar</span>
            <strong>{data.totals.find((t) => t.strong)?.value ?? data.totals.at(-1)?.value ?? "—"}</strong>
          </div>
          <div>
            <span className="skm-meta-label">Kalan Tutar</span>
            <strong className="skm-warn-text">{data.kpis.find((k) => k.id === "remaining")?.value ?? "—"}</strong>
          </div>
        </div>
      </article>

      <SiparislerKatmanTabs active="teslimat" tabs={layer.tabs} />

      <div className="skm-workspace skm-workspace--layer">
        <section className="skm-panel skm-panel--layer skm-main">
          <header className="skm-panel-head">
            <h2>Teslimatlar</h2>
          </header>

          <div className="skm-table-wrap">
            <table className="skm-table">
              <thead>
                <tr>
                  <th>Teslim No</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {layer.teslimatRows.map((row) => (
                  <tr key={row.no}>
                    <td>{row.no}</td>
                    <td>
                      <SiparisBadge tone={row.tone}>{row.status}</SiparisBadge>
                    </td>
                    <td>{row.date}</td>
                    <td className="skm-cell-actions">Görüntüle · İrsaliye ···</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="skm-table-foot">
            <span>Toplam {layer.teslimatRows.length} kayıt</span>
            <div className="skm-pagination">
              <select defaultValue="10" aria-label="Sayfa boyutu">
                <option value="10">10 satır</option>
              </select>
              <span>1 / 1</span>
            </div>
          </footer>
        </section>

        <aside className="skm-context" aria-label={ctx.title}>
          <header className="skm-context-head">
            <h2>{ctx.title}</h2>
          </header>

          <section className="skm-context-block">
            <h3>Rota Bilgileri</h3>
            <div className="skm-map-placeholder" aria-hidden>
              Harita önizlemesi
            </div>
            <dl className="skm-dl">
              <div>
                <dt>Rota Kodu</dt>
                <dd>{ctx.routeCode}</dd>
              </div>
              <div>
                <dt>Rota Adı</dt>
                <dd>{ctx.routeName}</dd>
              </div>
              <div>
                <dt>Başlangıç</dt>
                <dd>{ctx.start}</dd>
              </div>
              <div>
                <dt>Bitiş</dt>
                <dd>{ctx.end}</dd>
              </div>
              <div>
                <dt>Tahmini Mesafe</dt>
                <dd>{ctx.distance}</dd>
              </div>
              <div>
                <dt>Tahmini Süre</dt>
                <dd>{ctx.duration}</dd>
              </div>
            </dl>
          </section>

          <section className="skm-context-block">
            <h3>Sürücü Bilgileri</h3>
            <div className="skm-driver">
              <span className="skm-driver-avatar" aria-hidden>
                MY
              </span>
              <div>
                <strong>{ctx.driver}</strong>
                <span className="skm-entity-line">{ctx.phone}</span>
                <span className="skm-entity-line">
                  {ctx.plate} · {ctx.vehicle} · {ctx.capacity}
                </span>
              </div>
            </div>
          </section>

          <section className="skm-context-block">
            <h3>Teslimat Özeti</h3>
            <ul className="skm-stock-list">
              {ctx.summary.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
            <dl className="skm-dl">
              <div>
                <dt>Teslim Edilen Miktar</dt>
                <dd>{ctx.deliveredQty}</dd>
              </div>
              <div>
                <dt>Teslimat Oranı</dt>
                <dd>{ctx.deliveryRate}</dd>
              </div>
            </dl>
            <Link href="/siparisler/katman/teslimat" className="skm-btn skm-btn--primary skm-btn--block">
              Rota Detayını Görüntüle
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
