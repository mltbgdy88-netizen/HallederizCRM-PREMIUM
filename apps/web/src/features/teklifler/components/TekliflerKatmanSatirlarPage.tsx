"use client";

import { TeklifBadge, TeklifDetailTabs, TeklifKatmanContextPanel } from "./TekliflerKatmanShared";
import { useTekliflerKatmanReferenceData } from "@/features/teklifler/hooks/use-teklifler-katman-reference-data";

function LineThumb() {
  return (
    <span className="tkm-line-thumb" aria-hidden>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    </span>
  );
}

export function TekliflerKatmanSatirlarPage() {
  const { data } = useTekliflerKatmanReferenceData();
  const { header, layer } = data;
  const lines = data.lines.length > 0 ? data.lines : [];
  const summary = data.summary.length > 0 ? data.summary : layer.satirlarSummary;

  return (
    <div className="tkm-home">
      <header className="tkm-page-head">
        <nav className="tkm-breadcrumb" aria-label="Breadcrumb">
          {header.breadcrumb.map((part, i) => (
            <span key={part}>
              {i > 0 ? <span className="tkm-breadcrumb-sep">›</span> : null}
              {part}
            </span>
          ))}
        </nav>
        <div className="tkm-page-head-main">
          <h1>{header.title}</h1>
          <div className="tkm-head-actions">
            <button type="button" className="tkm-btn tkm-btn--primary">
              + Yeni Teklif
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline">
              Kopyala
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline">
              Düzenle
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline">
              ···
            </button>
          </div>
        </div>
      </header>

      <article className="tkm-quote-card">
        <div className="tkm-quote-card-main">
          <span className="tkm-quote-doc-icon" aria-hidden>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M7 4h10v16H7z" />
              <path d="M9 8h6M9 12h4" />
            </svg>
          </span>
          <div>
            <div className="tkm-quote-id-row">
              <strong>{header.quoteId}</strong>
              <TeklifBadge tone="ok">{header.status}</TeklifBadge>
            </div>
            <p className="tkm-quote-meta">
              Müşteri: {header.customer} · Teklif Tarihi: {header.offerDate} · Geçerlilik: {header.validUntil} ·{" "}
              {header.currency}
            </p>
          </div>
        </div>
        <div className="tkm-quote-total">{header.total}</div>
      </article>

      <TeklifDetailTabs tabs={layer.satirlarDetailTabs} />

      <div className="tkm-workspace tkm-workspace--satirlar">
        <div className="tkm-main tkm-main--split">
          <section className="tkm-lines-panel">
            <header className="tkm-lines-head">
              <h2>Teklif Kalemleri</h2>
              <div className="tkm-lines-actions">
                <button type="button" className="tkm-btn tkm-btn--outline tkm-btn--sm">
                  + Ürün Ekle
                </button>
                <button type="button" className="tkm-btn tkm-btn--outline tkm-btn--sm">
                  + Satır Ekle
                </button>
                <button type="button" className="tkm-btn tkm-btn--outline tkm-btn--sm">
                  Excel&apos;e Aktar
                </button>
              </div>
            </header>

            <div className="tkm-table-wrap">
              <table className="tkm-table tkm-table--lines">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Açıklama</th>
                    <th>Miktar</th>
                    <th>Birim</th>
                    <th>Birim Fiyat</th>
                    <th>İskonto %</th>
                    <th>İskonto Tutarı</th>
                    <th>KDV %</th>
                    <th>Tutar</th>
                    <th aria-label="İşlemler" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((row) => (
                    <tr key={row.code}>
                      <td className="tkm-cell-product">
                        <LineThumb />
                        <div>
                          <span className="tkm-product-code">{row.code}</span>
                          <span className="tkm-product-name">{row.name}</span>
                        </div>
                      </td>
                      <td>{row.desc}</td>
                      <td>{row.qty}</td>
                      <td>{row.unit}</td>
                      <td>{row.price}</td>
                      <td>{row.discPct}</td>
                      <td>{row.discAmt}</td>
                      <td>{row.vat}</td>
                      <td>{row.total}</td>
                      <td className="tkm-cell-menu">···</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="tkm-table-foot">
              <span>Toplam {lines.length} kalem</span>
              <div className="tkm-pagination">
                <select defaultValue="10" aria-label="Sayfa boyutu">
                  <option value="10">10 satır</option>
                </select>
                <span>1 / 1</span>
              </div>
            </footer>

            <div className="tkm-offer-note">
              <strong>Teklif Notu</strong>
              <p>Fiyatlarımıza KDV dahildir. Teklif geçerlilik süresi 15 gündür.</p>
            </div>
          </section>

          <div className="tkm-lines-side">
            <article className="tkm-side-card">
              <h3>Teklif Özeti</h3>
              <dl className="tkm-dl tkm-dl--summary">
                {summary.map((row) => (
                  <div key={row.label} className={row.strong ? "tkm-dl-row--strong" : undefined}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="tkm-side-card">
              <h3>Stok Uyarıları</h3>
              <ul className="tkm-stock-list">
                {layer.satirlarStock.map((item) => (
                  <li key={item.code} className={`tkm-stock-item tkm-stock-item--${item.tone}`}>
                    <div className="tkm-stock-item-head">
                      <span>{item.code}</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="tkm-stock-item-meta">
                      Mevcut: {item.avail} | Talep: {item.request}
                    </span>
                    <span className="tkm-stock-item-meta">Stok Sınırı: {item.limit}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </article>

            <div className="tkm-quick-row">
              <button type="button" className="tkm-btn tkm-btn--outline tkm-btn--sm">
                PDF Oluştur
              </button>
              <button type="button" className="tkm-btn tkm-btn--outline tkm-btn--sm">
                E-Posta Gönder
              </button>
              <button type="button" className="tkm-btn tkm-btn--primary tkm-btn--sm">
                Onaya Gönder
              </button>
              <button type="button" className="tkm-btn tkm-btn--danger tkm-btn--sm">
                Teklifi İptal Et
              </button>
            </div>
          </div>
        </div>

        <TeklifKatmanContextPanel context={layer.context} />
      </div>
    </div>
  );
}

