"use client";

import { useCarilerDemoAction } from "@/features/cariler/hooks/use-cariler-demo-action";
import { useCarilerKatmanReferenceData } from "@/features/cariler/hooks/use-cariler-katman-reference-data";
import { CarilerKatmanHero, CarilerKatmanTabs, CkmBadge } from "./CarilerKatmanShared";

export function CarilerKatmanSiparislerPage({ customerId }: { customerId?: string } = {}) {
  const { data, loadFailed } = useCarilerKatmanReferenceData(customerId);
  const demoAction = useCarilerDemoAction();
  const { rows, context } = data.siparisler;
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
          Canlı sipariş verisi yüklenemedi; önizleme gösteriliyor.
        </p>
      ) : null}
      <CarilerKatmanHero header={data.headers.siparisler} {...heroHandlers} />
      <CarilerKatmanTabs active="siparisler" tabs={data.navigation.tabStrips.siparisler ?? data.navigation.tabs} />

      <div className="ckm-workspace">
        <div className="ckm-main">
          <section className="ckm-panel" aria-labelledby="ckm-orders-title">
            <header className="ckm-panel-head">
              <h2 id="ckm-orders-title">Siparişler</h2>
              <div className="ckm-panel-actions">
                <button type="button" className="ckm-btn ckm-btn--primary ckm-btn--sm" onClick={(e) => demoAction("Yeni sipariş", e)}>
                  + Yeni Sipariş
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
                    <th>Sipariş No</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Teslim</th>
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
                      <td>{row.delivery}</td>
                      <td className="ckm-actions-cell">
                        <button type="button" aria-label="Görüntüle" onClick={(e) => demoAction(`Sipariş ${row.no}`, e)}>
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
              <span>Toplam {context.totalRecords} kayıt</span>
              <div className="ckm-pagination">
                <button type="button">1</button>
                <button type="button">2</button>
                <button type="button">3</button>
                <span>…</span>
                <button type="button">20</button>
              </div>
              <span>10 / sayfa</span>
            </footer>
          </section>
        </div>

        <aside className="ckm-side-panel" aria-label="Sipariş bağlamı">
          <header className="ckm-context-head">
            <h2>{context.title}</h2>
            <div className="ckm-order-id">
              <strong>{context.no}</strong>
              <CkmBadge>{context.status}</CkmBadge>
            </div>
          </header>
          <dl className="ckm-dl ckm-dl--stack">
            {context.fields.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <section className="ckm-context-block">
            <h3>Teslimat Bilgileri</h3>
            <dl className="ckm-dl ckm-dl--stack">
              {context.delivery.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
