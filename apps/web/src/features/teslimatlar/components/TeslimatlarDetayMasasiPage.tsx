"use client";

import Link from "next/link";
import { IconChevronDown } from "@/components/reference/icons";
import { useCarilerDemoAction } from "@/features/cariler/hooks/use-cariler-demo-action";
import { useTeslimatlarDetayReferenceData } from "@/features/teslimatlar/hooks/use-teslimatlar-detay-reference-data";

export function TeslimatlarDetayMasasiPage() {
  const demoAction = useCarilerDemoAction();
  const { demoBanner, page, statusCards, metrics, lines, lineFoot, note, context, proof, actions } =
    useTeslimatlarDetayReferenceData();

  return (
    <div className="tsdm-home">
      {demoBanner ? (
        <p className="tsdm-demo-banner" role="status">
          {demoBanner}
        </p>
      ) : null}

      <header className="tsdm-head">
        <div className="tsdm-head-copy">
          <nav className="tsdm-crumb" aria-label="Konum">
            {page.breadcrumb.map((part, i) => (
              <span key={part}>
                {i > 0 ? <span className="tsdm-crumb-sep">›</span> : null}
                <span className={i === page.breadcrumb.length - 1 ? "tsdm-crumb-current" : ""}>{part}</span>
              </span>
            ))}
          </nav>
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>
        <div className="tsdm-head-actions">
          <button type="button" className="tsdm-btn tsdm-btn--outline" onClick={(e) => demoAction("Düzenle", e)}>
            Düzenle
          </button>
          <button type="button" className="tsdm-btn tsdm-btn--outline" onClick={(e) => demoAction("Yazdır", e)}>
            Yazdır
          </button>
          <button type="button" className="tsdm-btn tsdm-btn--outline" onClick={(e) => demoAction("Diğer İşlemler", e)}>
            Diğer İşlemler
            <IconChevronDown className="tsdm-btn-chevron" />
          </button>
        </div>
      </header>

      <section className="tsdm-status-row" aria-label="Teslimat durum özeti">
        {statusCards.map((card) => (
          <article key={card.id} className={`tsdm-status-card${card.tone === "success" ? " tsdm-status-card--success" : ""}`}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="tsdm-metrics" aria-label="Teslimat metrikleri">
        {metrics.map((m) => (
          <div key={m.label}>
            <span>{m.label}</span>
            <strong>{m.value}</strong>
          </div>
        ))}
      </section>

      <div className="tsdm-body">
        <section className="tsdm-main" aria-label="Teslimat kalemleri">
          <h2>Teslimat Kalemleri</h2>
          <div className="tsdm-table-wrap">
            <table className="tsdm-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Açıklama</th>
                  <th>Miktar</th>
                  <th>Birim</th>
                  <th>Birim Fiyat</th>
                  <th>Toplam</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td>{line.code}</td>
                    <td>{line.name}</td>
                    <td>{line.qty}</td>
                    <td>{line.unit}</td>
                    <td>{line.price}</td>
                    <td>{line.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Toplam</td>
                  <td>{lineFoot.qty}</td>
                  <td colSpan={2} />
                  <td>{lineFoot.total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <section className="tsdm-notes" aria-label="Notlar">
            <h3>Notlar</h3>
            <p>{note}</p>
          </section>
        </section>

        <aside className="tsdm-aside">
          <section className="tsdm-panel">
            <h3>{context.title}</h3>
            <dl className="tsdm-context-dl">
              {context.rows.map((row) => (
                <div key={row.label} className={row.full ? "tsdm-context-row--full" : ""}>
                  <dt>{row.label}</dt>
                  <dd>
                    {row.link ? (
                      <a href="#" className="tsdm-link" onClick={(e) => e.preventDefault()}>
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="tsdm-panel">
            <h3>Teslimat Kanıtı</h3>
            <p className="tsdm-proof-receiver">
              <strong>{proof.receiver}</strong>
              <span>{proof.receiverRole}</span>
            </p>
            <div className="tsdm-signature">
              <span>{proof.signatureLabel}</span>
              <div className="tsdm-signature-box" aria-hidden />
            </div>
            <div className="tsdm-photos">
              <span>{proof.photosLabel}</span>
              <div className="tsdm-photo-grid">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="tsdm-photo">
                    {n === 4 ? proof.photoCount : null}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="tsdm-panel tsdm-actions-panel">
            <h3>İşlemler</h3>
            <button type="button" className="tsdm-btn tsdm-btn--primary tsdm-btn--block" onClick={(e) => demoAction(actions[0] ?? "İşlem", e)}>
              {actions[0]}
            </button>
            <button type="button" className="tsdm-btn tsdm-btn--outline tsdm-btn--block" onClick={(e) => demoAction(actions[1] ?? "İşlem", e)}>
              {actions[1]}
            </button>
            <Link href="/teslimatlar/yeni" className="tsdm-btn tsdm-btn--outline tsdm-btn--block">
              {actions[2]}
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
