"use client";

import type { WhatsAppConversation } from "@hallederiz/types";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { getCustomerById } from "../../customers/queries/customer-mock-data";
import { WA_QUEUE_META } from "../queries/whatsapp-mock-data";

export function WhatsAppDeskPreview({
  conversation,
  onOpenApprovals,
  onSelectTemplate,
  onSelectFile
}: {
  conversation: WhatsAppConversation | null;
  onOpenApprovals: () => void;
  onSelectTemplate: () => void;
  onSelectFile: () => void;
}) {
  if (!conversation) {
    return (
      <section className="hz-wa-desk-context hz-wa-desk-context--empty" aria-label="Konuşma bağlamı">
        <article className="hz-wa-desk-context-card">
          <h4>Konuşma Bağlamı</h4>
          <p>Tablodan bir konuşma seçildiğinde özet, uyarı ve önerilen yanıtlar görünür.</p>
        </article>
      </section>
    );
  }

  const meta = WA_QUEUE_META[conversation.id];
  const customer = conversation.relatedCustomerId ? getCustomerById(conversation.relatedCustomerId) : null;
  const statusLabel =
    conversation.pendingActionCount > 0 ? "Onay Bekliyor" : conversation.unreadCount > 0 ? "Beklemede" : "Aktif";
  const statusTone =
    conversation.pendingActionCount > 0 ? "approval" : conversation.unreadCount > 0 ? "pending" : "ok";

  return (
    <section className="hz-wa-desk-context" aria-label="Konuşma bağlamı">
      <header className="hz-wa-desk-context__head">
        <p className="hz-wa-desk-context__eyebrow">Konuşma Bağlamı</p>
        <h3>{conversation.title}</h3>
        <p>{customer?.name ?? "Cari eşleşmedi"}</p>
        <span className={`hz-wa-desk-badge hz-wa-desk-badge--${statusTone}`}>{statusLabel}</span>
        <p className="hz-wa-desk-context__meta">{meta?.subtitle ?? conversation.lastMessagePreview}</p>
      </header>

      <div className="hz-wa-desk-context__body">
        {conversation.pendingActionCount > 0 ? (
          <article className="hz-wa-desk-alert hz-wa-desk-alert--warn">
            <LucideIcon name="alert-triangle" size={16} />
            <div>
              <strong>{conversation.pendingActionCount} mesaj onay bekliyor</strong>
              <p>Gönderim öncesi insan onayı zorunludur.</p>
            </div>
            <button type="button" className="hz-wa-desk-alert-btn" onClick={onOpenApprovals}>
              Onayları Görüntüle
            </button>
          </article>
        ) : null}

        <article className="hz-wa-desk-context-card">
          <h4>
            <LucideIcon name="message-circle" size={14} /> Son Mesaj Özeti
          </h4>
          <p>{conversation.lastMessagePreview || meta?.subtitle || "Önizleme metni yok."}</p>
          <p>Temsilci: Emre Aydın · {meta?.timeLabel ?? "—"}</p>
        </article>

        <article className="hz-wa-desk-context-card">
          <h4>Önerilen Yanıtlar</h4>
          <ul className="hz-wa-desk-replies">
            <li>Stok durumunu kontrol edip 15 dk içinde dönüş yapacağım.</li>
            <li>Teklif PDF taslağını onay sonrası paylaşacağım.</li>
            <li>Tahsilat planı için finans ekibine iletiyorum.</li>
          </ul>
        </article>

        <article className="hz-wa-desk-context-card">
          <h4>İlgili Kayıtlar</h4>
          <div className="hz-wa-desk-links">
            <a href="/cariler/">Cari</a>
            <a href="/siparisler/">Sipariş</a>
            <a href="/tahsilatlar/">Tahsilat</a>
            <a href="/belgeler?document=demo">Belge</a>
          </div>
        </article>
      </div>

      <footer className="hz-wa-desk-context__actions">
        <p className="hz-wa-desk-context__actions-title">Belge Gönder</p>
        <button type="button" className="hz-wa-desk-context-btn hz-wa-desk-context-btn--primary" onClick={onSelectFile}>
          Dosya Seç
        </button>
        <button type="button" className="hz-wa-desk-context-btn" onClick={onSelectTemplate}>
          Şablondan Seç
        </button>
      </footer>
    </section>
  );
}
