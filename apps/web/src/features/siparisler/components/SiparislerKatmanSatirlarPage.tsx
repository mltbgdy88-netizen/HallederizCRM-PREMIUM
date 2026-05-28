"use client";

import Link from "next/link";
import { SiparisBadge, SiparislerKatmanTabs } from "./SiparislerKatmanShared";
import { buildSiparisSatirlarTotalsFromLines } from "@/features/siparisler/adapters/siparisler-katman-reference-adapter";
import { useSiparislerKatmanReferenceData } from "@/features/siparisler/hooks/use-siparisler-katman-reference-data";

export function SiparislerKatmanSatirlarPage() {
  const { data } = useSiparislerKatmanReferenceData();
  const { header, layer } = data;
  const lineCtx = layer.lineContext;
  const totals = buildSiparisSatirlarTotalsFromLines(data.lines, header.currency);

  return (
    <div className="skm-home skm-home--satirlar">
      <header className="skm-page-head">
        <Link href="/siparisler" className="skm-back">
          ← Siparişlere Dön
        </Link>
        <div className="skm-page-head-main">
          <h1>Sipariş Yönetimi</h1>
          <div className="skm-head-actions">
            <button type="button" className="skm-btn skm-btn--primary">
              + Yeni Sipariş
            </button>
            <button type="button" className="skm-btn skm-btn--outline">
              Düzenle
            </button>
            <button type="button" className="skm-btn skm-btn--outline">
              Yazdır
            </button>
            <button type="button" className="skm-btn skm-btn--outline">
              Diğer İşlemler ▾
            </button>
          </div>
        </div>
      </header>

      <article className="skm-quote-card">
        <div>
          <div className="skm-quote-id-row">
            <strong>{header.orderId}</strong>
            <SiparisBadge>{header.status}</SiparisBadge>
          </div>
          <p className="skm-quote-meta">
            Müşteri: {header.customerName} · Sipariş: {header.orderDateLabel} · {header.currency}
          </p>
          <p className="skm-quote-desc">{header.meta}</p>
        </div>
      </article>

      <SiparislerKatmanTabs active="satirlar" tabs={layer.tabs} />

      <div className="skm-workspace skm-workspace--lines">
        <section className="skm-lines-panel">
          <header className="skm-lines-head">
            <h2>Sipariş Satırları</h2>
            <button type="button" className="skm-btn skm-btn--outline skm-btn--sm">
              + Satır Ekle
            </button>
          </header>

          <div className="skm-table-wrap">
            <table className="skm-table skm-table--lines">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Miktar</th>
                  <th>Birim</th>
                  <th>Birim Fiyat</th>
                  <th>İskonto</th>
                  <th>Toplam</th>
                  <th aria-label="İşlemler" />
                </tr>
              </thead>
              <tbody>
                {data.lines.map((row) => (
                  <tr key={`${row.code}-${row.no}`}>
                    <td>
                      {row.code} {row.name}
                    </td>
                    <td>
                      <input className="skm-input" defaultValue={row.qty} readOnly aria-label="Miktar" />
                    </td>
                    <td>{row.unit}</td>
                    <td>
                      <input className="skm-input" defaultValue={row.price} readOnly aria-label="Birim fiyat" />
                    </td>
                    <td>
                      {row.disc}
                    </td>
                    <td>{row.total}</td>
                    <td className="skm-cell-actions">✎ 🗑</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="skm-totals-bar">
            <dl>
              {totals.map((row) => (
                <div key={row.label} className={"strong" in row && row.strong ? "skm-total-row--strong" : undefined}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </footer>
        </section>

        <aside className="skm-line-context" aria-label={lineCtx.title}>
          <h2>{lineCtx.title}</h2>
          <div className="skm-line-product">
            <span className="skm-line-thumb" aria-hidden>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </span>
            <div>
              <strong>{lineCtx.code}</strong>
              <p>{lineCtx.name}</p>
              <SiparisBadge>{lineCtx.status}</SiparisBadge>
            </div>
          </div>

          <dl className="skm-dl skm-dl--compact">
            <div>
              <dt>Stok Kodu</dt>
              <dd>{lineCtx.stockCode}</dd>
            </div>
            <div>
              <dt>Marka</dt>
              <dd>{lineCtx.brand}</dd>
            </div>
            <div>
              <dt>Kategori</dt>
              <dd>{lineCtx.category}</dd>
            </div>
            <div>
              <dt>Birim</dt>
              <dd>{lineCtx.unit}</dd>
            </div>
          </dl>

          <section>
            <h3>Stok Kontrolü</h3>
            <ul className="skm-stock-list">
              {lineCtx.stock.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Raf Bilgisi</h3>
            <dl className="skm-dl">
              <div>
                <dt>Depo</dt>
                <dd>{lineCtx.shelf.warehouse}</dd>
              </div>
              <div>
                <dt>Raf Kodu</dt>
                <dd>{lineCtx.shelf.code}</dd>
              </div>
              <div>
                <dt>Tip</dt>
                <dd>{lineCtx.shelf.type}</dd>
              </div>
            </dl>
            <div className="skm-capacity">
              <div className="skm-capacity-bar">
                <span style={{ width: lineCtx.shelf.capacity }} />
              </div>
              <span>
                {lineCtx.shelf.capacity} · {lineCtx.shelf.capacityLabel}
              </span>
            </div>
          </section>

          <div className="skm-line-actions">
            {lineCtx.actions.map((label, i) => (
              <button
                key={label}
                type="button"
                className={i === 0 ? "skm-btn skm-btn--primary skm-btn--block" : "skm-btn skm-btn--outline skm-btn--block"}
              >
                {label}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
