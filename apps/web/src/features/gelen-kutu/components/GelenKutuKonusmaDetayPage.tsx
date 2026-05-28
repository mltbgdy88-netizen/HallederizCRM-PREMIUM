"use client";

import { useSearchParams } from "next/navigation";
import { REFERENCE_ROUTE_IDS } from "@/lib/reference/reference-route-ids";
import { useGelenKutuReferenceData } from "@/features/gelen-kutu/hooks/use-gelen-kutu-reference-data";

export function GelenKutuKonusmaDetayPage() {
  const searchParams = useSearchParams();
  const conversationId = (searchParams.get("conversationId") ?? searchParams.get("id") ?? REFERENCE_ROUTE_IDS.conversationId).trim() || REFERENCE_ROUTE_IDS.conversationId;
  const { page, conversations, messages, customer, quickActions, orders } = useGelenKutuReferenceData();
  const activeThread = conversations.find((t) => t.id === conversationId) ?? conversations[0];

  return (
    <div className="gkk-home">
      <header className="gkk-head">
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </header>

      <div className="gkk-grid">
        <aside className="gkk-threads" aria-label="Konuşma listesi">
          <div className="gkk-threads-head">
            <strong>Gelen Kutusu</strong>
          </div>
          <ul>
            {conversations.map((t) => (
              <li key={t.id} className={t.id === activeThread?.id ? "gkk-thread gkk-thread--active" : "gkk-thread"}>
                <span className="gkk-thumb" aria-hidden />
                <span>
                  <strong>
                    {t.id} {t.name}
                  </strong>
                  <span>{t.preview}</span>
                </span>
                <span className="gkk-thread-meta">
                  {t.time}
                  {t.unread ? <em>{t.unread}</em> : null}
                </span>
              </li>
            ))}
          </ul>
          <footer>Toplam {conversations.length} konuşma</footer>
        </aside>

        <section className="gkk-chat" aria-label="Sohbet">
          <header>
            <div>
              <strong>{activeThread?.id ?? REFERENCE_ROUTE_IDS.conversationId}</strong>
              <span className="gkk-tag">Müşteri</span>
              <p>{activeThread?.name ?? customer.name}</p>
            </div>
          </header>
          <div className="gkk-messages">
            <p className="gkk-day">Bugün</p>
            {messages.map((m) => (
              <div key={m.id} className={m.direction === "out" ? "gkk-msg gkk-msg--out" : "gkk-msg"}>
                <p>{m.text}</p>
                <time>{m.time}</time>
              </div>
            ))}
          </div>
          <footer className="gkk-composer">
            <input type="text" placeholder="Mesajınızı yazın..." readOnly />
            <button type="button" className="gkk-send" aria-label="Gönder">
              ➤
            </button>
          </footer>
        </section>

        <aside className="gkk-context" aria-label="Müşteri bağlamı">
          <header>Müşteri Bağlamı</header>
          <div className="gkk-product">
            <strong>{activeThread?.id ?? REFERENCE_ROUTE_IDS.conversationId}</strong>
            <p>{activeThread?.name ?? customer.name}</p>
            <dl>
              <div>
                <dt>Barkod</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt>Marka</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt>Kategori</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt>Fiyat</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt>Fiyat Grubu</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt>Birim</dt>
                <dd>—</dd>
              </div>
            </dl>
          </div>
          <div className="gkk-quick">
            <strong>Hızlı İşlemler</strong>
            <div className="gkk-quick-grid">
              {quickActions.map((action) => (
                <button key={action.id} type="button">
                  {action.label}
                </button>
              ))}
            </div>
          </div>
          <div className="gkk-interactions">
            <strong>Son Etkileşimler</strong>
            {orders.map((item) => (
              <p key={item.id}>
                <span>{item.id}</span>
                <span>{item.status}</span>
                <time>{item.date}</time>
              </p>
            ))}
          </div>
          <p className="gkk-note">Sohbet referans verisinden yüklenmiştir.</p>
          <button type="button" className="gkk-detail-btn">
            Müşteri Detayına Git →
          </button>
        </aside>
      </div>
    </div>
  );
}
