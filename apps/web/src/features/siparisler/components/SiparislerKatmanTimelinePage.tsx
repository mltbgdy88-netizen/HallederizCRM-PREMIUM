"use client";

import Link from "next/link";
import {
  SiparisBadge,
  SiparisKatmanBreadcrumbHead,
  SiparislerKatmanTabs
} from "./SiparislerKatmanShared";
import { useSiparislerKatmanReferenceData } from "@/features/siparisler/hooks/use-siparisler-katman-reference-data";

function TimelineDot({ tone }: { tone: string }) {
  return <span className={`skm-tl-dot skm-tl-dot--${tone}`} aria-hidden />;
}

export function SiparislerKatmanTimelinePage() {
  const { data } = useSiparislerKatmanReferenceData();
  const { header, layer } = data;
  const ctx = layer.timelineContext;

  return (
    <div className="skm-home skm-home--layer">
      <SiparisKatmanBreadcrumbHead
        breadcrumb={header.breadcrumb}
        orderId={header.orderId}
        status={header.status}
        meta={header.meta}
        actions={
          <>
            <button type="button" className="skm-btn skm-btn--outline">
              İşlemler ▾
            </button>
            <button type="button" className="skm-btn skm-btn--outline">
              Düzenle
            </button>
            <Link href="/siparisler/yeni" className="skm-btn skm-btn--primary">
              + Yeni Sipariş
            </Link>
          </>
        }
      />

      <SiparislerKatmanTabs active="timeline" tabs={layer.tabs} />

      <div className="skm-workspace skm-workspace--layer">
        <section className="skm-main skm-timeline-main">
          <header className="skm-timeline-head">
            <div>
              <h2>Zaman Çizelgesi</h2>
              <p className="skm-panel-desc">Sipariş ile ilgili tüm değişiklik ve hareketlerin zaman çizelgesi.</p>
            </div>
            <div className="skm-filter-row skm-filter-row--timeline">
              <input className="skm-search" placeholder="Zaman çizelgesinde ara..." aria-label="Ara" readOnly />
              <select defaultValue="all" aria-label="Kategori">
                <option value="all">Tüm Etkinlikler</option>
              </select>
              <select defaultValue="" aria-label="Tarih aralığı">
                <option value="">Tarih Aralığı</option>
              </select>
              <button type="button" className="skm-btn skm-btn--outline">
                Yenile
              </button>
            </div>
          </header>

          <ol className="skm-timeline-list">
            {layer.timelineEvents.map((ev) => (
              <li key={ev.id} className="skm-timeline-item">
                <div className="skm-timeline-side">
                  <time>{ev.time}</time>
                  <span className="skm-tl-actor">{ev.actor}</span>
                </div>
                <TimelineDot tone={ev.tone} />
                <div className="skm-timeline-body">
                  <strong>{ev.title}</strong>
                  <p>{ev.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <button type="button" className="skm-btn skm-btn--outline skm-show-more">
            Daha Fazla Göster
          </button>
        </section>

        <aside className="skm-context" aria-label={ctx.title}>
          <header className="skm-context-head">
            <h2>{ctx.title}</h2>
          </header>

          <section className="skm-context-block">
            <dl className="skm-dl">
              <div>
                <dt>Sipariş No</dt>
                <dd>{ctx.orderNo}</dd>
              </div>
              <div>
                <dt>Durum</dt>
                <dd>
                  <SiparisBadge tone="ok">{ctx.status}</SiparisBadge>
                </dd>
              </div>
              <div>
                <dt>Müşteri</dt>
                <dd>{ctx.customer}</dd>
              </div>
              <div>
                <dt>Toplam Tutar</dt>
                <dd>{ctx.total}</dd>
              </div>
              <div>
                <dt>Oluşturma</dt>
                <dd>{ctx.created}</dd>
              </div>
              <div>
                <dt>Teslimat</dt>
                <dd>{ctx.delivery}</dd>
              </div>
              <div>
                <dt>Satış Temsilcisi</dt>
                <dd>{ctx.rep}</dd>
              </div>
            </dl>
          </section>

          <section className="skm-context-block">
            <h3>Hızlı Bilgiler</h3>
            <dl className="skm-dl skm-dl--summary">
              {ctx.quick.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="skm-status-pair">
              <span>Ödeme</span>
              <SiparisBadge tone="warn">{ctx.payStatus}</SiparisBadge>
              <span>Sevkiyat</span>
              <SiparisBadge tone="info">{ctx.shipStatus}</SiparisBadge>
            </div>
          </section>

          <section className="skm-context-block">
            <h3>İlgili Kayıtlar</h3>
            <ul className="skm-related-list">
              {ctx.related.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </section>

          <section className="skm-context-block">
            <h3>Hızlı İşlemler</h3>
            <div className="skm-quick-grid">
              {ctx.actions.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={label === "İptal Et" ? "skm-btn skm-btn--outline skm-btn--danger" : "skm-btn skm-btn--outline"}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

