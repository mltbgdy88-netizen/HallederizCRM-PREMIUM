"use client";

import { useCarilerDemoAction } from "@/features/cariler/hooks/use-cariler-demo-action";
import { useCarilerKatmanReferenceData } from "@/features/cariler/hooks/use-cariler-katman-reference-data";
import { CarilerKatmanHero, CarilerKatmanTabs, CkmPersonAvatar } from "./CarilerKatmanShared";

export function CarilerKatmanIletisimPage({ customerId }: { customerId?: string } = {}) {
  const { data, loadFailed } = useCarilerKatmanReferenceData(customerId);
  const demoAction = useCarilerDemoAction();
  const { summary, contacts, context } = data.iletisim;
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
          Canlı iletişim verisi yüklenemedi; önizleme gösteriliyor.
        </p>
      ) : null}
      <CarilerKatmanHero header={data.headers.iletisim} {...heroHandlers} />
      <CarilerKatmanTabs active="iletisim" tabs={data.navigation.tabStrips.iletisim ?? data.navigation.tabs} />

      <div className="ckm-workspace ckm-workspace--iletisim">
        <div className="ckm-main">
          <section className="ckm-summary-row" aria-label="İletişim özet kartları">
            {summary.map((card) => (
              <article key={card.label} className="ckm-summary-card">
                <span className="ckm-summary-label">{card.label}</span>
                <strong>{card.value}</strong>
                <span className="ckm-summary-sub">{card.sub}</span>
              </article>
            ))}
          </section>

          <section className="ckm-panel" aria-labelledby="ckm-contacts-title">
            <header className="ckm-panel-head">
              <h2 id="ckm-contacts-title">İletişim Kişileri</h2>
              <button type="button" className="ckm-btn ckm-btn--primary ckm-btn--sm" onClick={(e) => demoAction("Yeni kişi", e)}>
                + Yeni Kişi Ekle
              </button>
            </header>
            <div className="ckm-table-wrap">
              <table className="ckm-table">
                <thead>
                  <tr>
                    <th>Kişi</th>
                    <th>Rol</th>
                    <th>Telefon</th>
                    <th>E-posta</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((row) => (
                    <tr key={row.email}>
                      <td>
                        <span className="ckm-person-cell">
                          <CkmPersonAvatar initials={row.initials} />
                          {row.name}
                        </span>
                      </td>
                      <td>{row.role}</td>
                      <td>{row.phone}</td>
                      <td>{row.email}</td>
                      <td className="ckm-actions-cell">
                        <button type="button" aria-label="Mesaj" onClick={(e) => demoAction(`Mesaj: ${row.name}`, e)}>
                          Mesaj
                        </button>
                        <button type="button" aria-label="Düzenle" onClick={(e) => demoAction(`Düzenle: ${row.name}`, e)}>
                          Düzenle
                        </button>
                        <button type="button" aria-label="Sil" onClick={(e) => demoAction(`Sil: ${row.name}`, e)}>
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="ckm-side-panel" aria-label="İletişim bağlamı">
          <section className="ckm-wa-card">
            <h2>İletişim Bağlamı</h2>
            <p className="ckm-wa-phone">{context.whatsapp}</p>
            <span className="ckm-wa-status">{context.status}</span>
            <p className="ckm-wa-last">{context.lastMessage}</p>
            <button type="button" className="ckm-btn ckm-btn--primary ckm-btn--block" onClick={(e) => demoAction("WhatsApp sohbeti", e)}>
              WhatsApp Sohbetini Aç
            </button>
          </section>
          <section className="ckm-context-block">
            <h3>Hızlı İşlemler</h3>
            <ul className="ckm-quick-list">
              {context.quickActions.map((action) => (
                <li key={action}>
                  <button type="button" onClick={(e) => demoAction(action, e)}>
                    {action}
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="ckm-context-block">
            <h3>İletişim Tercihleri</h3>
            <p className="ckm-pref">
              Tercih Edilen Kanal: <strong>{context.preferred}</strong>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

