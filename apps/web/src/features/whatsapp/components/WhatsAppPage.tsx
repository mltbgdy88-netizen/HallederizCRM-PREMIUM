import { PageHeader, PrimaryActionToolbar } from "@hallederiz/ui";

const conversations = [
  "Mira Yapi - Siparis takibi",
  "Aydin Dekor - Tahsilat sorusu",
  "Atlas Home - Teslimat bildirimi"
];

const messages = [
  "Musteri: Siparis no SO-2481 ne durumda?",
  "Personel: Depo hazirligi tamamlandi, teslimat yarin cikacak.",
  "AI Oneri: Musteriye belge linki ve odeme ozetini paylas."
];

const contextItems = [
  "Cari Ozeti: Aydin Dekor / Risk Orta",
  "Siparis Baglantisi: SO-2481",
  "Tahsilat Baglantisi: PAY-930",
  "Belge Baglantisi: DOC-112",
  "AI Onerili Cevap: Belgeli teslimat bilgilendirmesi"
];

export function WhatsAppPage() {
  return (
    <div className="hz-page-stack">
      <PageHeader
        title="WhatsApp"
        description="Bayi self-service, personel gorev mesaji ve yonetici onay kanalini tek ekranda yonetin."
      />

      <PrimaryActionToolbar>
        <button type="button" className="hz-btn hz-toolbar-btn hz-btn-primary">
          Yeni Mesaj
        </button>
        <button type="button" className="hz-btn hz-toolbar-btn hz-btn-secondary">
          Sablon Gonder
        </button>
        <button type="button" className="hz-btn hz-toolbar-btn hz-btn-secondary">
          Action Request
        </button>
      </PrimaryActionToolbar>

      <section className="hz-three-column">
        <article className="hz-column-card">
          <h3 className="hz-column-title">Konusmalar</h3>
          <div className="hz-list-stack">
            {conversations.map((conversation) => (
              <div key={conversation} className="hz-list-item">
                {conversation}
              </div>
            ))}
          </div>
        </article>

        <article className="hz-column-card">
          <h3 className="hz-column-title">Mesaj Akisi</h3>
          <div className="hz-chat-feed">
            {messages.map((message, index) => (
              <div key={message} className={`hz-chat-bubble ${index % 2 === 0 ? "" : "is-outgoing"}`}>
                {message}
              </div>
            ))}
          </div>
          <div className="hz-chat-composer">
            <input className="hz-control" placeholder="Mesaj girisi placeholder" />
            <button type="button" className="hz-btn hz-btn-secondary">
              Gonder
            </button>
          </div>
        </article>

        <article className="hz-column-card">
          <h3 className="hz-column-title">Baglam Paneli</h3>
          <div className="hz-list-stack">
            {contextItems.map((item) => (
              <div key={item} className="hz-list-item">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
