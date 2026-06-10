"use client";

import { useCarilerDemoAction } from "@/features/cariler/hooks/use-cariler-demo-action";
import { useCarilerKatmanReferenceData } from "@/features/cariler/hooks/use-cariler-katman-reference-data";
import { CarilerKatmanHero, CarilerKatmanTabs, CkmBadge } from "./CarilerKatmanShared";

export function CarilerKatmanTahsilatlarPage({ customerId }: { customerId?: string } = {}) {
  const { data, loadFailed } = useCarilerKatmanReferenceData(customerId);
  const demoAction = useCarilerDemoAction();
  const { rows, context } = data.tahsilatlar;
  const heroHandlers = {
    onEdit: () => demoAction("Düzenle"),
    onMore: () => demoAction("Diğer işlemler")
  };

  return (
    <div className="ckm-home">
      {data.demoBanner ? (
        <p className="ckm-demo-banner" role="status">
          {data.demoBanner}
        </p>
      ) : null}
      {loadFailed ? (
        <p className="ckm-demo-banner ckm-demo-banner--warn" role="alert">
          Canlı tahsilat verisi yüklenemedi; önizleme gösteriliyor.
        </p>
      ) : null}
      <CarilerKatmanHero header={data.headers.tahsilatlar} {...heroHandlers} />
      <CarilerKatmanTabs active="tahsilatlar" tabs={data.navigation.tabStrips.tahsilatlar ?? data.navigation.tabs} />

      <div className="ckm-workspace">
        <div className="ckm-main">
          <section className="ckm-panel" aria-labelledby="ckm-tahsilat-title">
            <header className="ckm-panel-head">
              <h2 id="ckm-tahsilat-title">
                Tahsilatlar <span className="ckm-count">{rows.length}</span>
              </h2>
              <button type="button" className="ckm-btn ckm-btn--primary ckm-btn--sm" onClick={(e) => demoAction("Yeni tahsilat", e)}>
                + Yeni Tahsilat
              </button>
            </header>
            <div className="ckm-table-wrap">
              <table className="ckm-table">
                <thead>
                  <tr>
                    <th>Tahsilat No</th>
                    <th>Tutar</th>
                    <th>Yöntem</th>
                    <th>Durum</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.no}>
                      <td className="ckm-cell--link">{row.no}</td>
                      <td>{row.amount}</td>
                      <td>{row.method}</td>
                      <td>
                        <CkmBadge tone={row.tone}>{row.status}</CkmBadge>
                      </td>
                      <td className="ckm-actions-cell">
                        <button type="button" aria-label="Görüntüle" onClick={(e) => demoAction(`Tahsilat ${row.no}`, e)}>
                          Gör
                        </button>
                        <button type="button" aria-label="Menü" onClick={(e) => demoAction("Menü", e)}>
                          ⋮
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="ckm-table-foot">
              <span>1 – {rows.length} / {rows.length} kayıt</span>
              <div className="ckm-pagination">
                <button type="button" aria-disabled>
                  ‹
                </button>
                <button type="button" className="ckm-page--active">
                  1
                </button>
                <button type="button" aria-disabled>
                  ›
                </button>
              </div>
            </footer>
          </section>
        </div>

        <aside className="ckm-side-panel" aria-label="Tahsilat bağlamı">
          <header className="ckm-context-head">
            <h2>{context.title}</h2>
          </header>
          <dl className="ckm-dl ckm-dl--summary">
            {context.summary.map((row) => (
              <div key={row.label} className={`ckm-dl-row--${row.tone}`}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <dl className="ckm-dl ckm-dl--stack">
            {context.dates.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="ckm-context-actions">
            {context.actions.map((label, i) => (
              <button
                key={label}
                type="button"
                className={i === 0 ? "ckm-btn ckm-btn--primary ckm-btn--block" : "ckm-btn ckm-btn--outline ckm-btn--block"}
                onClick={(e) => demoAction(label, e)}
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

