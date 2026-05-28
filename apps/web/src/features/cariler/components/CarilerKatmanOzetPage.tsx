"use client";

import { useCarilerDemoAction } from "@/features/cariler/hooks/use-cariler-demo-action";
import { useCarilerKatmanReferenceData } from "@/features/cariler/hooks/use-cariler-katman-reference-data";
import {
  CarilerKatmanContextPanel,
  CarilerKatmanHero,
  CarilerKatmanTabs,
  CkmBadge,
  CkmKpiIcon
} from "./CarilerKatmanShared";

export function CarilerKatmanOzetPage({ customerId }: { customerId?: string } = {}) {
  const { data, loadFailed } = useCarilerKatmanReferenceData(customerId);
  const demoAction = useCarilerDemoAction();
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
          Canlı cari katman verisi yüklenemedi; önizleme gösteriliyor.
        </p>
      ) : null}
      <CarilerKatmanHero header={data.headers.ozet} {...heroHandlers} />
      <CarilerKatmanTabs active="ozet" tabs={data.navigation.tabStrips.ozet ?? data.navigation.tabs} />

      <div className="ckm-workspace">
        <div className="ckm-main">
          <section className="ckm-kpi-row ckm-kpi-row--5" aria-label="Cari özet kartları">
            {data.ozet.kpis.map((kpi) => (
              <article key={kpi.id} className={`ckm-kpi-card ckm-kpi-card--${kpi.tone}`}>
                <CkmKpiIcon tone={kpi.tone} />
                <div>
                  <span className="ckm-kpi-value">{kpi.value}</span>
                  <span className="ckm-kpi-label">{kpi.label}</span>
                  {"progress" in kpi && kpi.progress != null ? (
                    <div className="ckm-kpi-progress" role="progressbar" aria-valuenow={kpi.progress} aria-valuemin={0} aria-valuemax={100}>
                      <span style={{ width: `${kpi.progress}%` }} />
                    </div>
                  ) : null}
                  <span className={`ckm-kpi-sub${kpi.subWarn ? " ckm-kpi-sub--warn" : ""}`}>{kpi.sub}</span>
                </div>
              </article>
            ))}
          </section>

          <section className="ckm-panel ckm-panel--table" aria-labelledby="ckm-records-title">
            <header className="ckm-panel-head">
              <h2 id="ckm-records-title">İlgili Kayıtlar</h2>
            </header>
            <nav className="ckm-subtabs" aria-label="İlgili kayıt sekmeleri">
              {data.ozet.recordTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={tab.active ? "ckm-subtab ckm-subtab--active" : "ckm-subtab"}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
            <div className="ckm-table-wrap">
              <table className="ckm-table">
                <thead>
                  <tr>
                    <th>Belge No</th>
                    <th>Belge Tarihi</th>
                    <th>Vade Tarihi</th>
                    <th>Açıklama</th>
                    <th>Tutar</th>
                    <th>Açık Bakiye</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ozet.records.map((row) => (
                    <tr key={row.no}>
                      <td className="ckm-cell--link">{row.no}</td>
                      <td>{row.docDate}</td>
                      <td>{row.dueDate}</td>
                      <td>{row.desc}</td>
                      <td>{row.amount}</td>
                      <td>{row.open}</td>
                      <td>
                        <CkmBadge tone={row.tone}>{row.status}</CkmBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="ckm-table-foot">
              <span>Toplam {data.ozet.records.length} kayıt</span>
              <button type="button" className="ckm-link-btn" onClick={(e) => demoAction("Tümünü gör", e)}>
                Tümünü Gör
              </button>
            </footer>
          </section>
        </div>

        <CarilerKatmanContextPanel context={data.context} onShortcut={demoAction} />
      </div>
    </div>
  );
}

