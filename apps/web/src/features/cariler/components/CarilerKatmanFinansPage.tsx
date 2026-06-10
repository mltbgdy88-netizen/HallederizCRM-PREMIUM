"use client";

import { useCarilerDemoAction } from "@/features/cariler/hooks/use-cariler-demo-action";
import { useCarilerKatmanReferenceData } from "@/features/cariler/hooks/use-cariler-katman-reference-data";
import { CarilerKatmanHero, CarilerKatmanTabs, CkmBadge } from "./CarilerKatmanShared";

export function CarilerKatmanFinansPage({ customerId }: { customerId?: string } = {}) {
  const { data, loadFailed } = useCarilerKatmanReferenceData(customerId);
  const demoAction = useCarilerDemoAction();
  const { kpis, aging, agingTotal, context } = data.finans;
  const heroHandlers = {
    onEdit: () => demoAction("Düzenle"),
    onMore: () => demoAction("Diğer işlemler")
  };

  return (
    <div className="ckm-home ckm-home--finans-emerald">
      {data.demoBanner ? (
        <p className="ckm-demo-banner" role="status">
          {data.demoBanner}
        </p>
      ) : null}
      {loadFailed ? (
        <p className="ckm-demo-banner ckm-demo-banner--warn" role="alert">
          Canlı finans verisi yüklenemedi; önizleme gösteriliyor.
        </p>
      ) : null}
      <CarilerKatmanHero header={data.headers.finans} {...heroHandlers} />
      <CarilerKatmanTabs active="finans" tabs={data.navigation.tabStrips.finans ?? data.navigation.tabs} />

      <div className="ckm-workspace">
        <div className="ckm-main">
          <header className="ckm-section-head">
            <h2>Finans Masası</h2>
          </header>

          <section className="ckm-kpi-row ckm-kpi-row--6" aria-label="Finans özet kartları">
            {kpis.map((kpi) => (
              <article key={kpi.id} className={`ckm-kpi-card ckm-kpi-card--${kpi.tone} ckm-kpi-card--compact`}>
                <div>
                  <span className="ckm-kpi-value">{kpi.value}</span>
                  <span className="ckm-kpi-label">{kpi.label}</span>
                  {"progress" in kpi && kpi.progress != null ? (
                    <div className="ckm-kpi-progress" role="progressbar" aria-valuenow={kpi.progress} aria-valuemin={0} aria-valuemax={100}>
                      <span style={{ width: `${kpi.progress}%` }} />
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </section>

          <section className="ckm-panel" aria-labelledby="ckm-aging-title">
            <header className="ckm-panel-head">
              <h2 id="ckm-aging-title">Açık Bakiye Yaşlandırma</h2>
            </header>
            <div className="ckm-table-wrap">
              <table className="ckm-table">
                <thead>
                  <tr>
                    <th>Yaş Aralığı</th>
                    <th>Tutar ₺</th>
                    <th>%</th>
                    <th>Fatura Adedi</th>
                    <th>Ort. Gün</th>
                    <th>Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {aging.map((row) => (
                    <tr key={row.range} className={`ckm-row--${row.tone}`}>
                      <td>{row.range}</td>
                      <td>{row.amount}</td>
                      <td>{row.pct}</td>
                      <td>{row.count}</td>
                      <td>{row.avg}</td>
                      <td>
                        <CkmBadge tone={row.tone}>{row.desc}</CkmBadge>
                      </td>
                    </tr>
                  ))}
                  <tr className="ckm-row--total">
                    <td>
                      <strong>Toplam</strong>
                    </td>
                    <td>
                      <strong>{agingTotal.amount}</strong>
                    </td>
                    <td>
                      <strong>{agingTotal.pct}</strong>
                    </td>
                    <td>
                      <strong>{agingTotal.count}</strong>
                    </td>
                    <td>
                      <strong>{agingTotal.avg}</strong>
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
            <footer className="ckm-table-foot">
              <button type="button" className="ckm-btn ckm-btn--outline" onClick={(e) => demoAction("Detaylı rapor", e)}>
                Detaylı Rapor
              </button>
              <span>Son Güncelleme: {context.updated}</span>
            </footer>
          </section>
        </div>

        <aside className="ckm-side-panel" aria-label="Finans bağlamı">
          <header className="ckm-context-head">
            <h2>{context.title}</h2>
          </header>
          <section className="ckm-suggest-card">
            <h3>Tahsilat Önerisi</h3>
            <p className="ckm-suggest-amount">{context.suggestion.amount}</p>
            <p>{context.suggestion.strategy}</p>
            <p className="ckm-suggest-note">{context.suggestion.plan}</p>
          </section>
          <section className="ckm-context-block">
            <h3>Finansal KPI&apos;lar</h3>
            <div className="ckm-mini-kpis">
              {context.kpis.map((kpi) => (
                <article key={kpi.label}>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                </article>
              ))}
            </div>
          </section>
          <button type="button" className="ckm-btn ckm-btn--primary ckm-btn--block" onClick={(e) => demoAction(context.cta, e)}>
            {context.cta}
          </button>
        </aside>
      </div>
    </div>
  );
}

