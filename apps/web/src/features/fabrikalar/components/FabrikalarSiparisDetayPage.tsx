"use client";

import { useFabrikalarSiparisDetayReferenceData } from "@/features/fabrikalar/hooks/use-fabrikalar-siparis-detay-reference-data";

export function FabrikalarSiparisDetayPage() {
  const {
    data: {
      breadcrumb: FSD_BREADCRUMB,
      title: FSD_TITLE,
      statusCards: FSD_STATUS_CARDS,
      fields: FSD_FIELDS,
      lines: FSD_LINES,
      grandTotal: FSD_GRAND_TOTAL,
      summary: FSD_SUMMARY,
      timeline: FSD_TIMELINE,
      context: FSD_CONTEXT
    }
  } = useFabrikalarSiparisDetayReferenceData();

  return (
    <div className="fsd-home">
      <header className="fsd-head">
        <div>
          <p className="fsd-crumb">{FSD_BREADCRUMB}</p>
          <h1>{FSD_TITLE}</h1>
        </div>
        <div className="fsd-head-meta">
          <span className="fsd-meta-label">Onay No</span>
          <strong>FO-2025-00124</strong>
        </div>
        <div className="fsd-head-actions">
          <button type="button" className="fsd-btn fsd-btn--primary">
            Düzenle
          </button>
          <button type="button" className="fsd-btn fsd-btn--outline">
            Yeni Sipariş
          </button>
          <button type="button" className="fsd-btn fsd-btn--outline">
            Dışa Aktar ▾
          </button>
        </div>
      </header>

      <div className="fsd-workspace">
        <div className="fsd-main">
          <div className="fsd-status-row">
            {FSD_STATUS_CARDS.map((c) => (
              <article key={c.label} className={`fsd-status-card fsd-status-card--${c.tone}`}>
                <span className="fsd-status-label">{c.label}</span>
                <strong>{c.value}</strong>
                <span className="fsd-status-sub">{c.sub}</span>
              </article>
            ))}
          </div>

          <section className="fsd-fields-card">
            <dl className="fsd-fields-grid">
              {FSD_FIELDS.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>
                    {"badge" in f && f.badge ? (
                      <span className="fsd-badge fsd-badge--green">{f.value}</span>
                    ) : "badgePriority" in f && f.badgePriority ? (
                      <span className="fsd-badge fsd-badge--blue">{f.value}</span>
                    ) : (
                      f.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="fsd-lines-card">
            <h2>Sipariş Kalemleri</h2>
            <div className="fsd-table-wrap">
              <table className="fsd-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ürün</th>
                    <th>Miktar</th>
                    <th>Birim</th>
                    <th>Birim Fiyat</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {FSD_LINES.map((line, i) => (
                    <tr key={line.id}>
                      <td>{i + 1}</td>
                      <td>
                        <span className="fsd-product-code">{line.productCode}</span>
                        <span className="fsd-product-name">{line.productName}</span>
                      </td>
                      <td>{line.qty}</td>
                      <td>{line.unit}</td>
                      <td>{line.unitPrice}</td>
                      <td>{line.total}</td>
                      <td>
                        <span
                          className={
                            line.status === "Üretimde" ? "fsd-badge fsd-badge--orange" : "fsd-badge fsd-badge--gray"
                          }
                        >
                          {line.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5}>
                      <strong>Toplam Tutar</strong>
                    </td>
                    <td colSpan={2}>
                      <strong>{FSD_GRAND_TOTAL}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <div className="fsd-bottom-row">
            <article className="fsd-panel">
              <h3>Sipariş Özeti</h3>
              <dl className="fsd-summary-dl">
                {FSD_SUMMARY.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
            <article className="fsd-panel">
              <h3>Sipariş Akışı</h3>
              <ol className="fsd-timeline">
                {FSD_TIMELINE.map((t) => (
                  <li key={t.id}>
                    <span className="fsd-timeline-dot" aria-hidden />
                    <div>
                      <strong>{t.title}</strong>
                      <span>
                        {t.detail} · {t.time}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </div>

        <aside className="fsd-context" aria-label="Fabrika bağlamı">
          <h2>Fabrika Bağlamı</h2>
          <dl className="fsd-context-dl">
            <div>
              <dt>Fabrika</dt>
              <dd>{FSD_CONTEXT.factory}</dd>
            </div>
            <div>
              <dt>Entegrasyon</dt>
              <dd>
                <span className="fsd-badge fsd-badge--green">{FSD_CONTEXT.integration}</span>
              </dd>
            </div>
            <div>
              <dt>Tip</dt>
              <dd>{FSD_CONTEXT.type}</dd>
            </div>
            <div>
              <dt>Kaynak</dt>
              <dd>{FSD_CONTEXT.source}</dd>
            </div>
          </dl>
          <p className="fsd-connection">
            <span className="fsd-dot fsd-dot--green" aria-hidden />
            {FSD_CONTEXT.connection}
          </p>
          <section className="fsd-errors">
            <h3>Entegrasyon Hataları</h3>
            <ul>
              {FSD_CONTEXT.errors.map((e) => (
                <li key={e.id}>
                  <p>{e.text}</p>
                  <span>{e.time}</span>
                  <button type="button">Tekrar Dene</button>
                </li>
              ))}
            </ul>
            <button type="button" className="fsd-btn fsd-btn--outline fsd-btn--block">
              Tüm Hataları Görüntüle
            </button>
          </section>
          <section className="fsd-logs">
            <h3>Aktarım Günlüğü</h3>
            <ul>
              {FSD_CONTEXT.logs.map((l) => (
                <li key={l.id}>
                  <p>{l.text}</p>
                  <span>{l.time}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="fsd-btn fsd-btn--outline fsd-btn--block">
              Tüm Günlüğü Görüntüle
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
