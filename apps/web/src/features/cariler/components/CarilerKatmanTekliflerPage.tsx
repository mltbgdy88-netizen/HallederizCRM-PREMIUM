"use client";

import { useCarilerDemoAction } from "@/features/cariler/hooks/use-cariler-demo-action";
import { useCarilerKatmanReferenceData } from "@/features/cariler/hooks/use-cariler-katman-reference-data";
import { CarilerKatmanHero, CarilerKatmanTabs, CkmBadge } from "./CarilerKatmanShared";

export function CarilerKatmanTekliflerPage({ customerId }: { customerId?: string } = {}) {
  const { data, loadFailed } = useCarilerKatmanReferenceData(customerId);
  const demoAction = useCarilerDemoAction();
  const { rows, filter } = data.teklifler;
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
          Canlı teklif verisi yüklenemedi; önizleme gösteriliyor.
        </p>
      ) : null}
      <CarilerKatmanHero header={data.headers.teklifler} {...heroHandlers} />
      <CarilerKatmanTabs active="teklifler" tabs={data.navigation.tabStrips.teklifler ?? data.navigation.tabs} />

      <div className="ckm-workspace">
        <div className="ckm-main">
          <section className="ckm-panel" aria-labelledby="ckm-offers-title">
            <header className="ckm-panel-head">
              <h2 id="ckm-offers-title">
                Teklifler ({filter.total})
              </h2>
              <div className="ckm-panel-actions">
                <button type="button" className="ckm-btn ckm-btn--primary ckm-btn--sm" onClick={(e) => demoAction("Yeni teklif", e)}>
                  + Yeni Teklif
                </button>
                <button type="button" className="ckm-btn ckm-btn--outline ckm-btn--sm" onClick={(e) => demoAction("Dışa aktar", e)}>
                  Dışa Aktar
                </button>
                <button type="button" className="ckm-btn ckm-btn--outline ckm-btn--sm" aria-label="Menü" onClick={(e) => demoAction("Menü", e)}>
                  ⋮
                </button>
              </div>
            </header>
            <div className="ckm-table-wrap">
              <table className="ckm-table">
                <thead>
                  <tr>
                    <th>Teklif No</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Tarih</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.no}>
                      <td className="ckm-cell--link">{row.no}</td>
                      <td>{row.amount}</td>
                      <td>
                        <CkmBadge tone={row.tone}>{row.status}</CkmBadge>
                      </td>
                      <td>{row.date}</td>
                      <td className="ckm-actions-cell">
                        <button type="button" aria-label="Görüntüle" onClick={(e) => demoAction(`Teklif ${row.no}`, e)}>
                          Gör
                        </button>
                        <button type="button" aria-label="Belge" onClick={(e) => demoAction("Belge", e)}>
                          Belge
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
              <span>Toplam {filter.total} kayıt</span>
              <div className="ckm-pagination">
                <button type="button" className="ckm-page--active">
                  1
                </button>
                <button type="button">2</button>
              </div>
            </footer>
          </section>
        </div>

        <aside className="ckm-side-panel ckm-filter-panel" aria-label="Teklif bağlamı">
          <header className="ckm-context-head">
            <h2>{filter.title}</h2>
          </header>
          <section className="ckm-context-block">
            <h3>Durum</h3>
            <ul className="ckm-filter-list">
              {filter.statuses.map((item) => (
                <li key={item.label}>
                  <label>
                    <input type="checkbox" defaultChecked />
                    {item.label} ({item.count})
                  </label>
                </li>
              ))}
            </ul>
          </section>
          <section className="ckm-context-block">
            <h3>Tarih Aralığı</h3>
            <select defaultValue="90" className="ckm-select">
              <option value="90">Son 90 gün</option>
            </select>
          </section>
          <section className="ckm-context-block">
            <h3>Tutar Aralığı</h3>
            <div className="ckm-range">
              <input type="text" placeholder="Min Tutar" aria-label="Min tutar" />
              <input type="text" placeholder="Max Tutar" aria-label="Max tutar" />
            </div>
          </section>
          <button type="button" className="ckm-btn ckm-btn--primary ckm-btn--block" onClick={(e) => demoAction("Filtrele", e)}>
            Filtrele
          </button>
          <button type="button" className="ckm-btn ckm-btn--outline ckm-btn--block" onClick={(e) => demoAction("Filtreleri temizle", e)}>
            Filtreleri Temizle
          </button>
        </aside>
      </div>
    </div>
  );
}
