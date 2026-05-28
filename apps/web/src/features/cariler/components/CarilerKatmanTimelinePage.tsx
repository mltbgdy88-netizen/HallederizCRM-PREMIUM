"use client";

import { useCarilerDemoAction } from "@/features/cariler/hooks/use-cariler-demo-action";
import { useCarilerKatmanReferenceData } from "@/features/cariler/hooks/use-cariler-katman-reference-data";
import { CarilerKatmanHero, CarilerKatmanTabs, CkmBadge } from "./CarilerKatmanShared";

function TimelineDot({ tone }: { tone: string }) {
  return <span className={`ckm-tl-dot ckm-tl-dot--${tone}`} aria-hidden />;
}

export function CarilerKatmanTimelinePage({ customerId }: { customerId?: string } = {}) {
  const { data, loadFailed } = useCarilerKatmanReferenceData(customerId);
  const demoAction = useCarilerDemoAction();
  const { filters, events, context } = data.timeline;
  const groups = [...new Set(events.map((e) => e.group))];
  const heroHandlers = {
    onEdit: () => demoAction("Düzenle"),
    onMore: () => demoAction("Diğer işlemler")
  };

  return (
    <div className="ckm-home ckm-home--timeline">
      {data.demoBanner ? (
        <p className="ckm-demo-banner" role="status">
          {data.demoBanner}
        </p>
      ) : null}
      {loadFailed ? (
        <p className="ckm-demo-banner ckm-demo-banner--warn" role="alert">
          Canlı timeline verisi yüklenemedi; önizleme gösteriliyor.
        </p>
      ) : null}
      <CarilerKatmanHero header={data.headers.timeline} {...heroHandlers} />
      <CarilerKatmanTabs active="timeline" tabs={data.navigation.tabStrips.timeline ?? data.navigation.tabs} />

      <div className="ckm-workspace ckm-workspace--timeline">
        <aside className="ckm-filter-col" aria-label="Timeline filtreleri">
          <h2>Filtreler</h2>
          <label className="ckm-filter-label">
            Olay Tipi
            <select defaultValue="all">
              <option value="all">Tümü</option>
            </select>
          </label>
          <ul className="ckm-type-list">
            {filters.types.map((t) => (
              <li key={t.label}>
                <span className={`ckm-type-dot ckm-type-dot--${t.tone}`} aria-hidden />
                <label>
                  <input type="checkbox" defaultChecked />
                  {t.label}
                </label>
              </li>
            ))}
          </ul>
          <label className="ckm-filter-label">
            Tarih Aralığı
            <select defaultValue="90">
              <option value="90">{filters.range}</option>
            </select>
          </label>
          <div className="ckm-date-range">
            <input type="text" defaultValue={filters.start} aria-label="Başlangıç" />
            <span>–</span>
            <input type="text" defaultValue={filters.end} aria-label="Bitiş" />
          </div>
          <button type="button" className="ckm-btn ckm-btn--outline ckm-btn--block" onClick={(e) => demoAction("Filtreyi temizle", e)}>
            Filtreyi Temizle
          </button>
        </aside>

        <section className="ckm-main ckm-timeline-feed" aria-label="Timeline akışı">
          {groups.map((group) => (
            <div key={group}>
              <h3 className="ckm-tl-group">{group}</h3>
              <ol className="ckm-tl-list">
                {events
                  .filter((e) => e.group === group)
                  .map((ev) => (
                    <li key={ev.id} className="ckm-tl-item">
                      <TimelineDot tone={ev.tone} />
                      <div className="ckm-tl-body">
                        <div className="ckm-tl-head">
                          <strong>{ev.title}</strong>
                          <CkmBadge tone={ev.tone as "ok" | "warn" | "info" | "green" | "blue" | "purple" | "orange" | "neutral"}>
                            {ev.type}
                          </CkmBadge>
                        </div>
                        <p>{ev.desc}</p>
                        <span className="ckm-tl-meta">
                          {ev.user} · {ev.time}
                        </span>
                      </div>
                      <button type="button" className="ckm-tl-menu" aria-label="Menü" onClick={(e) => demoAction(ev.title, e)}>
                        ⋮
                      </button>
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </section>

        <aside className="ckm-side-panel" aria-label="Timeline bağlamı">
          <header className="ckm-context-head">
            <h2>{context.title}</h2>
          </header>
          <section className="ckm-context-block">
            <h3>İlişkili Kayıtlar</h3>
            <dl className="ckm-dl ckm-dl--stack">
              {context.related.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="ckm-context-block">
            <h3>Açık Fırsatlar</h3>
            <ul className="ckm-mini-list">
              {context.opportunities.map((item) => (
                <li key={item.title}>
                  <span>{item.title}</span>
                  <strong>{item.amount}</strong>
                </li>
              ))}
            </ul>
          </section>
          <section className="ckm-context-block">
            <h3>Teklifler</h3>
            <ul className="ckm-mini-list">
              {context.offers.map((item) => (
                <li key={item.no}>
                  <span>
                    {item.no} · {item.status}
                  </span>
                  <strong>{item.amount}</strong>
                </li>
              ))}
            </ul>
          </section>
          <section className="ckm-context-block">
            <h3>Sözleşmeler</h3>
            <ul className="ckm-mini-list">
              {context.contracts.map((item) => (
                <li key={item.no}>
                  <span>
                    {item.no} · {item.status}
                  </span>
                  <strong>{item.amount}</strong>
                </li>
              ))}
            </ul>
          </section>
          <section className="ckm-context-block">
            <h3>Son Ödemeler</h3>
            <ul className="ckm-mini-list">
              {context.payments.map((item) => (
                <li key={item.date}>
                  <span>
                    {item.date} · {item.status}
                  </span>
                  <strong>{item.amount}</strong>
                </li>
              ))}
            </ul>
          </section>
          <button type="button" className="ckm-btn ckm-btn--outline ckm-btn--block" onClick={(e) => demoAction("Tüm kayıtları görüntüle", e)}>
            Tüm Kayıtları Görüntüle
          </button>
        </aside>
      </div>
    </div>
  );
}
