import { PageHeader, PrimaryActionToolbar } from "@hallederiz/ui";

const assistantMessages = [
  "Kullanici: Geciken tahsilatlari ozetle.",
  "AI: Son 7 gunde 4 cari vade asimi riski olusturdu.",
  "AI: 2 kayit icin insan onayi gerektiren aksiyon onerisi hazirlandi."
];

const sideItems = [
  "Onay Bekleyenler: 2",
  "Son Islemler: 6",
  "Yetki Uyarisi: Fabrika siparisi onayi gerekiyor",
  "Ilgili Kayit Onizleme: SO-2481"
];

export function AIAssistantPage() {
  return (
    <div className="hz-page-stack">
      <PageHeader
        title="AI"
        description="Sohbet, komut, onay kuyrugu ve ilgili domain kayitlarini kurumsal denetimle yonetin."
      />

      <PrimaryActionToolbar>
        <button type="button" className="hz-btn hz-toolbar-btn hz-btn-primary">
          Yeni AI Oturumu
        </button>
        <button type="button" className="hz-btn hz-toolbar-btn hz-btn-secondary">
          Prompt Kitapligi
        </button>
        <button type="button" className="hz-btn hz-toolbar-btn hz-btn-secondary">
          Sesli Giris
        </button>
      </PrimaryActionToolbar>

      <section className="hz-ai-layout">
        <article className="hz-column-card">
          <h3 className="hz-column-title">AI Asistan Akisi</h3>
          <div className="hz-chat-feed">
            {assistantMessages.map((message, index) => (
              <div key={message} className={`hz-chat-bubble ${index % 2 === 0 ? "is-outgoing" : ""}`}>
                {message}
              </div>
            ))}
          </div>
          <div className="hz-chat-composer">
            <input className="hz-control" placeholder="Komut girisi placeholder" />
            <button type="button" className="hz-btn hz-btn-secondary">
              Gonder
            </button>
          </div>
        </article>

        <article className="hz-column-card">
          <h3 className="hz-column-title">Onay ve Baglam Paneli</h3>
          <div className="hz-list-stack">
            {sideItems.map((item) => (
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
