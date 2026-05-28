"use client";

import { useDepoFisDetayReferenceData } from "@/features/depo/hooks/use-depo-fis-detay-reference-data";

function DocIcon() {
  return (
    <svg className="dfd-title-icon" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function ProductThumb() {
  return (
    <span className="dfd-thumb" aria-hidden>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    </span>
  );
}

export function DepoFisDetayPage() {
  const {
    data: {
      page: DFD_PAGE,
      meta: DFD_META,
      lines: DFD_LINES,
      lineTotals: DFD_LINE_TOTALS,
      summary: DFD_SUMMARY,
      history: DFD_HISTORY,
      notes: DFD_NOTES,
      context: DFD_CONTEXT
    }
  } = useDepoFisDetayReferenceData();

  return (
    <div className="dfd-home">
      <header className="dfd-head">
        <div className="dfd-head-copy">
          <h1>
            <DocIcon />
            {DFD_PAGE.title} {DFD_PAGE.slipId}
          </h1>
          <div className="dfd-badges">
            {DFD_PAGE.badges.map((badge) => (
              <span key={badge} className={`dfd-badge dfd-badge--${badge === "Onaylandı" ? "ok" : "out"}`}>
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="dfd-head-actions">
          <button type="button" className="dfd-btn dfd-btn--outline">
            Düzenle
          </button>
          <button type="button" className="dfd-btn dfd-btn--outline">
            Yazdır ▾
          </button>
          <button type="button" className="dfd-btn dfd-btn--outline">
            Diğer ▾
          </button>
        </div>
      </header>

      <section className="dfd-meta-row" aria-label="Fiş özeti">
        {DFD_META.map((item) => (
          <article key={item.label} className="dfd-meta-card">
            <span className="dfd-meta-label">{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <div className="dfd-workspace">
        <div className="dfd-main">
          <section className="dfd-lines-panel">
            <header className="dfd-lines-head">
              <h2>
                Toplama Satırları <span className="dfd-count">{DFD_LINE_TOTALS.records}</span>
              </h2>
              <div className="dfd-lines-tools">
                <input type="search" placeholder="Ara..." readOnly aria-label="Satır ara" />
                <button type="button" className="dfd-btn dfd-btn--outline">
                  Raf Göre Göster
                </button>
                <button type="button" className="dfd-btn dfd-btn--outline">
                  Toplama Rehberi
                </button>
              </div>
            </header>
            <div className="dfd-table-wrap">
              <table className="dfd-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ürün</th>
                    <th>Raf</th>
                    <th>Raf Kapasitesi</th>
                    <th>Toplanacak</th>
                    <th>Toplanan</th>
                    <th>Birim</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {DFD_LINES.map((line) => (
                    <tr key={line.id}>
                      <td>{line.index}</td>
                      <td>
                        <div className="dfd-product">
                          <ProductThumb />
                          <div>
                            <span className="dfd-product-code">{line.productCode}</span>
                            <span className="dfd-product-name">{line.productName}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="dfd-shelf">{line.shelf}</span>
                        <span className="dfd-floor">{line.floor}</span>
                      </td>
                      <td>
                        <span>
                          {line.capacityUsed} / {line.capacityMax}
                        </span>
                        <span className="dfd-cap-pct">{line.capacityPct}</span>
                      </td>
                      <td>{line.toCollect}</td>
                      <td>
                        <span className="dfd-collected">{line.collected}</span>
                      </td>
                      <td>{line.unit}</td>
                      <td>
                        <span className="dfd-status-ok">✓ {line.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="dfd-lines-foot">
              <span>Toplam {DFD_LINE_TOTALS.records} kayıt</span>
              <span>
                Toplanacak: {DFD_LINE_TOTALS.toCollect} · Toplanan: {DFD_LINE_TOTALS.collected}
              </span>
            </footer>
          </section>

          <section className="dfd-bottom-row">
            <article className="dfd-card">
              <h3>Fiş Özeti</h3>
              <dl>
                {DFD_SUMMARY.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
            <article className="dfd-card">
              <h3>İşlem Geçmişi</h3>
              <ol className="dfd-timeline">
                {DFD_HISTORY.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <span>
                      {item.user} · {item.time}
                    </span>
                  </li>
                ))}
              </ol>
            </article>
            <article className="dfd-card dfd-card--notes">
              <header>
                <h3>Notlar</h3>
                <button type="button" aria-label="Notu düzenle">
                  �?
                </button>
              </header>
              <p>{DFD_NOTES}</p>
              <footer>Yusuf Kaya · 02.05.2025 15:35</footer>
            </article>
          </section>
        </div>

        <aside className="dfd-context" aria-label="Depo bağlamı">
          <h2>{DFD_CONTEXT.title}</h2>
          {DFD_CONTEXT.capacity.map((cap) => (
            <div key={cap.label} className="dfd-cap-block">
              <div className="dfd-cap-head">
                <span>{cap.label}</span>
                <strong>{cap.used}</strong>
              </div>
              <div className="dfd-cap-bar" aria-hidden>
                <span style={{ width: cap.used }} />
              </div>
              <p>{cap.detail}</p>
            </div>
          ))}
          {DFD_CONTEXT.warnings.map((w) => (
            <div key={w.text} className={`dfd-alert dfd-alert--${w.tone}`}>
              {w.text}
            </div>
          ))}
          <article className="dfd-side-card">
            <h3>İlgili Belgeler</h3>
            <ul>
              {DFD_CONTEXT.relatedDocs.map((doc) => (
                <li key={doc.label}>
                  <span>{doc.label}</span>
                  <a href="#">{doc.value}</a>
                </li>
              ))}
            </ul>
          </article>
          <article className="dfd-side-card">
            <h3>Hızlı İşlemler</h3>
            <div className="dfd-quick-btns">
              {DFD_CONTEXT.quickActions.map((action) => (
                <button key={action} type="button" className="dfd-btn dfd-btn--outline dfd-btn--block">
                  {action}
                </button>
              ))}
            </div>
          </article>
          <article className="dfd-side-card">
            <h3>Barkod İşlemleri</h3>
            <div className="dfd-quick-btns">
              {DFD_CONTEXT.barcodeActions.map((action) => (
                <button key={action} type="button" className="dfd-btn dfd-btn--outline dfd-btn--block">
                  ⌁ {action}
                </button>
              ))}
            </div>
          </article>
        </aside>
      </div>

      <footer className="dfd-page-foot">
        <nav aria-label="Breadcrumb">
          {DFD_PAGE.breadcrumb.map((part, i) => (
            <span key={part}>
              {i > 0 ? " › " : null}
              {part}
            </span>
          ))}
        </nav>
        <span>
          Oluşturan: {DFD_PAGE.createdBy} · Oluşturulma: {DFD_PAGE.createdAt}
        </span>
      </footer>
    </div>
  );
}

