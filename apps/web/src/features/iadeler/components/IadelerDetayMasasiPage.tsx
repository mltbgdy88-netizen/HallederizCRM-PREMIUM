"use client";

import Link from "next/link";
import { useIadelerDetayReferenceData } from "@/features/iadeler/hooks/use-iadeler-detay-reference-data";

export function IadelerDetayMasasiPage() {
  const { data } = useIadelerDetayReferenceData();
  const page = data.page;
  const hero = data.hero;
  const stockKpis = data.stockKpis;
  const stockAlert = data.stockAlert;
  const lines = data.lines;
  const linesFoot = data.linesFoot;
  const history = data.history;
  const actions = data.actions;
  const context = data.context;
  const approval = data.approval;
  const warehouse = data.warehouse;

  return (
    <div className="idm-home">
      <header className="idm-head">
        <div className="idm-head-copy">
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>
        <div className="idm-head-actions">
          <Link href="/iadeler" className="idm-btn idm-btn--outline">
            {page.listBtn}
          </Link>
          <button type="button" className="idm-btn idm-btn--primary">
            Onayla
          </button>
          <button type="button" className="idm-btn idm-btn--warn">
            Reddet
          </button>
          <button type="button" className="idm-btn idm-btn--outline">
            Yazdır
          </button>
        </div>
      </header>

      <section className="idm-hero" aria-label="İade üst bilgi">
        <div>
          <div className="idm-hero-title-row">
            <h2>{hero.returnId}</h2>
            <span className="idm-status-badge">{hero.status}</span>
          </div>
          <p className="idm-hero-meta">
            Oluşturulma: {hero.created} · {hero.creator}
          </p>
        </div>
        <dl className="idm-hero-grid">
          <div>
            <dt>Sipariş</dt>
            <dd>{hero.orderNo}</dd>
          </div>
          <div>
            <dt>Sipariş Tarihi</dt>
            <dd>{hero.orderDate}</dd>
          </div>
          <div>
            <dt>Müşteri</dt>
            <dd>{hero.customer}</dd>
          </div>
          <div>
            <dt>İade Nedeni</dt>
            <dd>{hero.reason}</dd>
          </div>
        </dl>
        <p className="idm-hero-note">{hero.note}</p>
      </section>

      <div className="idm-body">
        <div className="idm-main">
          <section className="idm-stock-kpis" aria-label="Stok etki özeti">
            {stockKpis.map((kpi) => (
              <article key={kpi.label} className="idm-stock-kpi">
                <span className="idm-stock-kpi-label">{kpi.label}</span>
                <strong>{kpi.value}</strong>
              </article>
            ))}
          </section>
          <p className="idm-alert">{stockAlert}</p>

          <section className="idm-panel" aria-label="İade kalemleri">
            <h3>İade Kalemleri</h3>
            <div className="idm-table-wrap">
              <table className="idm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ürün</th>
                    <th>Marka</th>
                    <th>Model/Kodu</th>
                    <th>Seri No/Lot</th>
                    <th>Miktar</th>
                    <th>Birim Fiyat</th>
                    <th>İskonto</th>
                    <th>Toplam Tutar</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.no}>
                      <td>{line.no}</td>
                      <td>{line.product}</td>
                      <td>{line.brand}</td>
                      <td>{line.model}</td>
                      <td>{line.serial}</td>
                      <td>{line.qty}</td>
                      <td>{line.unitPrice}</td>
                      <td>{line.discount}</td>
                      <td>{line.total}</td>
                      <td>
                        <span className="idm-line-badge">{line.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5}>Toplam</td>
                    <td>{linesFoot.qty}</td>
                    <td colSpan={2} />
                    <td>{linesFoot.total}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <div className="idm-bottom-grid">
            <section className="idm-panel">
              <h3>{history.title}</h3>
              <ul className="idm-timeline">
                {history.items.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <span>{item.time}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="idm-panel">
              <h3>{actions.title}</h3>
              <div className="idm-action-row">
                {actions.buttons.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    className={`idm-mini-btn${i === actions.buttons.length - 1 ? " idm-mini-btn--danger" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="idm-alert idm-alert--muted">{stockAlert}</p>
            </section>
          </div>
        </div>

        <aside className="idm-aside">
          <section className="idm-panel">
            <h3>{context.title}</h3>
            <dl className="idm-context-rows">
              {context.rows.map((row) => (
                <div key={row.label} className="idm-context-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="idm-panel">
            <h3>{approval.title}</h3>
            <ol className="idm-steps">
              {approval.steps.map((step) => (
                <li key={step.label} className={`idm-step idm-step--${step.state}`}>
                  {step.label}
                </li>
              ))}
            </ol>
          </section>

          <section className="idm-panel">
            <h3>{warehouse.title}</h3>
            <dl className="idm-context-rows">
              <div className="idm-context-row">
                <dt>Depo</dt>
                <dd>{warehouse.warehouse}</dd>
              </div>
              <div className="idm-context-row">
                <dt>Lokasyon</dt>
                <dd>{warehouse.location}</dd>
              </div>
              <div className="idm-context-row idm-context-row--full">
                <dt>Not</dt>
                <dd>{warehouse.note}</dd>
              </div>
            </dl>
            <div className="idm-file">
              <span>{warehouse.file.name}</span>
              <span>{warehouse.file.size}</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
