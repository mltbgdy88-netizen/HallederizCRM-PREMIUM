"use client";

import { useGelenKutuReferenceData } from "@/features/gelen-kutu/hooks/use-gelen-kutu-reference-data";

export function GelenKutuUcPanelPage() {
  const { page, conversations, activeChat, messages, customer, tabs, summary } = useGelenKutuReferenceData();
  const folders = [
    { label: "Gelen Kutusu", count: conversations.length, active: true },
    { label: "Bekleyen", count: conversations.filter((c) => c.unread).length },
    { label: "Tamamlanan", count: conversations.filter((c) => c.read).length }
  ];
  const channels = tabs
    .filter((tab) => tab.id !== "all")
    .map((tab) => ({
      label: tab.id === "whatsapp" ? "WhatsApp" : tab.id === "mail" ? "E-posta" : "SMS",
      count: tab.count
    }));

  return (
    <div className="gku-home">
      <header className="gku-head">
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </header>

      <div className="gku-grid">
        <aside className="gku-folders" aria-label="Klasörler ve kanallar">
          <section>
            <h2>Klasörler</h2>
            <ul>
              {folders.map((f) => (
                <li key={f.label} className={f.active ? "gku-folder gku-folder--active" : "gku-folder"}>
                  <span>{f.label}</span>
                  <em>{f.count}</em>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Kanallar</h2>
            <ul>
              {channels.map((c) => (
                <li key={c.label} className="gku-channel">
                  <span>{c.label}</span>
                  <em>{c.count}</em>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <section className="gku-list" aria-label="Konuşma listesi">
          <div className="gku-list-filters">
            <input type="search" placeholder="Mesaj ara..." readOnly />
            <span>Tümü</span>
            <span>Tüm Kanallar</span>
            <span>Yeniden Eskiye</span>
          </div>
          <ul>
            {conversations.map((c, index) => (
              <li key={c.id} className={index === 0 ? "gku-conv gku-conv--selected" : "gku-conv"}>
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.channel === "whatsapp" ? "WhatsApp" : c.channel === "mail" ? "E-posta" : "SMS"}</span>
                  <p>{c.preview}</p>
                </div>
                <div>
                  <time>{c.time}</time>
                  {c.unread ? <em>{c.unread}</em> : null}
                  <span className="gku-status">{c.unread ? "Yeni" : c.read ? "Tamamlandı" : "Aktif"}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="gku-chat" aria-label="Sohbet">
          <header>
            <strong>{activeChat.name}</strong>
            <span>{activeChat.phone}</span>
            <div className="gku-tags">
              {[activeChat.tag, "Sohbet"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </header>
          <div className="gku-tabs">
            <button type="button" className="gku-tab gku-tab--active">
              Sohbet
            </button>
            <button type="button" className="gku-tab">
              Müşteri
            </button>
            <button type="button" className="gku-tab">
              Notlar
            </button>
          </div>
          <div className="gku-messages">
            {messages.map((m) => (
              <div key={m.id} className={m.direction === "out" ? "gku-msg gku-msg--out" : "gku-msg"}>
                <p>{m.text}</p>
                <time>{m.time}</time>
              </div>
            ))}
          </div>
          <footer>
            <input type="text" placeholder="Mesajınızı yazın..." readOnly />
            <button type="button" className="gku-send">
              Gönder
            </button>
          </footer>
        </section>

        <aside className="gku-customer" aria-label="Müşteri bilgileri">
          <h2>Müşteri Bilgileri</h2>
          <dl>
            <div>
              <dt>Ad</dt>
              <dd>{customer.name}</dd>
            </div>
            <div>
              <dt>E-posta</dt>
              <dd>{customer.email}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{customer.phone}</dd>
            </div>
            <div>
              <dt>Konum</dt>
              <dd>{customer.location}</dd>
            </div>
            <div>
              <dt>Cari ID</dt>
              <dd>—</dd>
            </div>
          </dl>
          <div className="gku-tag-list">
            {[customer.tag].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="gku-stats">
            {[
              { label: "Toplam Konuşma", value: String(conversations.length) },
              { label: "Tamamlanan", value: String(conversations.filter((c) => c.read).length) },
              { label: "Bekleyen", value: String(conversations.filter((c) => c.unread).length) },
              { label: "Ort. Yanıt", value: "—" },
              { label: "Memnuniyet", value: `${summary.rating}/5` }
            ].map((s) => (
              <p key={s.label}>
                <span>{s.label}</span>
                <strong>{s.value}</strong>
              </p>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
