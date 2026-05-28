"use client";

import { TeklifBadge } from "./TekliflerKatmanShared";
import { useTekliflerKatmanReferenceData } from "@/features/teklifler/hooks/use-teklifler-katman-reference-data";

export function TekliflerKatmanDonusumPage() {
  const { data } = useTekliflerKatmanReferenceData();
  const { header, layer } = data;

  return (
    <div className="tkm-home tkm-home--donusum">
      <header className="tkm-page-head">
        <div className="tkm-page-head-main">
          <div>
            <div className="tkm-quote-id-row">
              <h1>Teklif #{header.quoteId}</h1>
              <TeklifBadge tone="ok">{header.status}</TeklifBadge>
            </div>
            <p className="tkm-quote-meta">
              Oluşturulma: {header.offerDate} · Geçerlilik: {header.validUntil} · Para Birimi: {header.currency}
            </p>
          </div>
          <div className="tkm-head-actions">
            <button type="button" className="tkm-btn tkm-btn--outline">
              Diğer İşlemler ▾
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline">
              Düzenle
            </button>
            <button type="button" className="tkm-btn tkm-btn--primary">
              Dönüşüme Başla
            </button>
          </div>
        </div>
      </header>

      <nav className="tkm-hub-tabs tkm-hub-tabs--quote" aria-label="Teklif detay sekmeleri">
        {layer.donusumDetailTabs.map((tab) => (
          <span key={tab} className={tab === "Dönüşüm" ? "tkm-hub-tab tkm-hub-tab--active" : "tkm-hub-tab"}>
            {tab}
          </span>
        ))}
      </nav>

      <div className="tkm-workspace">
        <section className="tkm-main tkm-donusum-main">
          <header className="tkm-donusum-wizard-head">
            <h2>Dönüşüm Sihirbazı</h2>
            <ol className="tkm-stepper" aria-label="Dönüşüm adımları">
              {layer.donusumSteps.map((step) => (
                <li
                  key={step.id}
                  className={
                    step.current
                      ? "tkm-step tkm-step--current"
                      : step.done
                        ? "tkm-step tkm-step--done"
                        : "tkm-step"
                  }
                >
                  <span className="tkm-step-num">{step.done ? "✓" : step.id}</span>
                  <span>{step.label}</span>
                </li>
              ))}
            </ol>
          </header>

          <article className="tkm-donusum-step-card">
            <header className="tkm-donusum-alert">
              <div>
                <strong>Stok Onayı</strong>
                <p>Teklif kalemleri için stok uygunluğu kontrol edildi.</p>
              </div>
              <button type="button" className="tkm-btn tkm-btn--outline tkm-btn--sm">
                Yeniden Kontrol Et
              </button>
            </header>

            <div className="tkm-donusum-metrics">
              {layer.donusumStockSummary.map((m) => (
                <article
                  key={m.label}
                  className={`tkm-donusum-metric${m.strong ? " tkm-donusum-metric--strong" : ""}${m.tone ? ` tkm-donusum-metric--${m.tone}` : ""}`}
                >
                  <span>{m.label}</span>
                  <strong>{m.value}</strong>
                </article>
              ))}
            </div>

            <h3 className="tkm-donusum-table-title">Kalem Bazlı Stok Durumu</h3>
            <div className="tkm-table-wrap">
              <table className="tkm-table tkm-table--donusum">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Stok Durumu</th>
                    <th>Mevcut / Gerekli</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {layer.donusumStockRows.map((row) => (
                    <tr key={row.product}>
                      <td>{row.product}</td>
                      <td>
                        <TeklifBadge tone={row.statusTone}>{row.status}</TeklifBadge>
                      </td>
                      <td>
                        {row.avail} / {row.need}
                      </td>
                      <td>
                        {row.action ? (
                          <button type="button" className="tkm-link">
                            {row.action}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="tkm-donusum-foot">
              <button type="button" className="tkm-btn tkm-btn--outline">
                Geri
              </button>
              <button type="button" className="tkm-btn tkm-btn--primary">
                Devam Et →
              </button>
            </footer>
          </article>
        </section>

        <aside className="tkm-context tkm-context--donusum" aria-label="Dönüşüm bağlamı">
          <header className="tkm-context-head">
            <h2>{layer.donusumContext.title}</h2>
          </header>

          <section className="tkm-context-block">
            <h3>Teklif Bilgileri</h3>
            <dl className="tkm-dl">
              <div>
                <dt>Teklif No</dt>
                <dd>{header.quoteId}</dd>
              </div>
              <div>
                <dt>Teklif Tarihi</dt>
                <dd>{header.offerDate}</dd>
              </div>
              <div>
                <dt>Müşteri</dt>
                <dd>{header.customer}</dd>
              </div>
              <div>
                <dt>Para Birimi</dt>
                <dd>{header.currency}</dd>
              </div>
              <div>
                <dt>Toplam Tutar</dt>
                <dd>{header.total}</dd>
              </div>
            </dl>
          </section>

          <section className="tkm-context-block">
            <h3>Müşteri Bilgileri</h3>
            <dl className="tkm-dl">
              {layer.donusumContext.musteri.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="tkm-context-block">
            <h3>Dönüşüm Özeti</h3>
            <dl className="tkm-dl">
              {layer.donusumContext.ozet.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <footer className="tkm-context-actions">
            <button type="button" className="tkm-btn tkm-btn--primary tkm-btn--block">
              Sipariş Oluştur
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline tkm-btn--block">
              Taslağı Kaydet
            </button>
            <p className="tkm-donusum-context-note">{layer.donusumContext.footerNote}</p>
          </footer>
        </aside>
      </div>
    </div>
  );
}
