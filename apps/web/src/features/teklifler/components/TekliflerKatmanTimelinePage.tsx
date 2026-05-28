"use client";

import { TeklifBadge, TeklifDetailTabs, UserAvatar } from "./TekliflerKatmanShared";
import { useTekliflerKatmanReferenceData } from "@/features/teklifler/hooks/use-teklifler-katman-reference-data";

function TimelineDot({ tone }: { tone: string }) {
  return <span className={`tkm-tl-dot tkm-tl-dot--${tone}`} aria-hidden />;
}

export function TekliflerKatmanTimelinePage() {
  const { data } = useTekliflerKatmanReferenceData();
  const { layer } = data;
  const header = data.header;

  return (
    <div className="tkm-home">
      <header className="tkm-page-head">
        <nav className="tkm-breadcrumb" aria-label="Breadcrumb">
          {header.breadcrumb.map((part, i) => (
            <span key={part}>
              {i > 0 ? <span className="tkm-breadcrumb-sep">›</span> : null}
              {part}
            </span>
          ))}
        </nav>
        <div className="tkm-page-head-main">
          <div>
            <div className="tkm-quote-id-row">
              <h1>{header.quoteId}</h1>
              <TeklifBadge tone="ok">{header.status}</TeklifBadge>
            </div>
            <p className="tkm-quote-meta">
              {header.customer} · Oluşturulma: {header.offerDate} · Oluşturan: {header.creator}
            </p>
          </div>
          <div className="tkm-head-actions">
            <button type="button" className="tkm-btn tkm-btn--outline">
              Düzenle
            </button>
            <button type="button" className="tkm-btn tkm-btn--primary">
              Paylaş
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline">
              Diğer ▾
            </button>
          </div>
        </div>
      </header>

      <TeklifDetailTabs tabs={layer.timelineDetailTabs} />

      <div className="tkm-workspace">
        <section className="tkm-main tkm-timeline-main">
          <header className="tkm-timeline-head">
            <div>
              <h2>Timeline</h2>
              <p>Teklif ile ilgili tüm değişiklik ve hareketlerin zaman çizelgesi.</p>
            </div>
            <div className="tkm-timeline-filters">
              <select defaultValue="all" aria-label="Filtre">
                <option value="all">Tümü</option>
              </select>
              <button type="button" className="tkm-btn tkm-btn--outline tkm-btn--sm">
                Filtrele
              </button>
            </div>
          </header>

          <ol className="tkm-timeline-list">
            {layer.timelineEvents.map((ev) => (
              <li key={ev.id} className="tkm-timeline-item">
                <TimelineDot tone={ev.tone} />
                <div className="tkm-timeline-body">
                  <strong>{ev.title}</strong>
                  <p>{ev.desc}</p>
                  <span className="tkm-tl-actor">{ev.actor}</span>
                </div>
                <time className="tkm-timeline-time">{ev.time}</time>
              </li>
            ))}
          </ol>
        </section>

        <aside className="tkm-context" aria-label="Teklif bağlamı">
          <header className="tkm-context-head">
            <h2>Teklif Bağlamı</h2>
          </header>

          <dl className="tkm-dl">
            <div>
              <dt>Teklif No</dt>
              <dd>{layer.timelineContext.teklifNo}</dd>
            </div>
            <div>
              <dt>Müşteri</dt>
              <dd>{layer.timelineContext.musteri}</dd>
            </div>
            <div>
              <dt>Durum</dt>
              <dd>
                <TeklifBadge tone="ok">{layer.timelineContext.durum}</TeklifBadge>
              </dd>
            </div>
            <div>
              <dt>Toplam Tutar</dt>
              <dd>{layer.timelineContext.toplam}</dd>
            </div>
            <div>
              <dt>Oluşturulma</dt>
              <dd>{layer.timelineContext.olusturma}</dd>
            </div>
            <div>
              <dt>Geçerlilik Tarihi</dt>
              <dd>{layer.timelineContext.gecerlilik}</dd>
            </div>
            <div>
              <dt>Oluşturan</dt>
              <dd>
                <UserAvatar name={layer.timelineContext.olusturan} />
                {layer.timelineContext.olusturan}
              </dd>
            </div>
          </dl>

          <section className="tkm-context-block">
            <h3>Hızlı İşlemler</h3>
            <button type="button" className="tkm-btn tkm-btn--outline tkm-btn--block">
              Teklifi Düzenle
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline tkm-btn--block">
              PDF İndir
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline tkm-btn--block">
              Kopyala
            </button>
            <button type="button" className="tkm-btn tkm-btn--danger tkm-btn--block">
              İptal Et
            </button>
          </section>

          <section className="tkm-context-block tkm-notes-block">
            <h3>Notlar</h3>
            <p className="tkm-note-text">{layer.timelineContext.note}</p>
            <span className="tkm-muted">{layer.timelineContext.noteMeta}</span>
            <button type="button" className="tkm-btn tkm-btn--outline tkm-btn--block tkm-btn--sm">
              + Not Ekle
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

