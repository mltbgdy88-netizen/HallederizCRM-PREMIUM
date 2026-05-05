"use client";

import type { WhatsAppConversation, WhatsAppMessage } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  IconBot,
  IconFileText,
  IconMessageCircle,
  IconMic,
  IconPaperclip,
  IconRotateCcw,
  IconSend,
  IconShoppingCart,
  IconSparkles,
  IconUser,
  IconWallet
} from "../../dashboard/components/dashboard-inline-icons";
import { useToast } from "../../../providers/toast-provider";
import {
  getWhatsAppConversationById,
  getWhatsAppConversations,
  type WaRichBlock,
  WA_QUEUE_META
} from "../queries/whatsapp-mock-data";

type QueueChip = "all" | "unread" | "approval" | "risk";

const DELTA_AI_DRAFT =
  "Merhaba Delta A.Ş.,\nURN-001 ve URN-056 için stok durumunu kontrol ettim.\nTeklif taslağını onayınıza sunuyorum.";

const DELTA_HEADER = {
  openBalance: "₺84.500",
  lastOrder: "SO-2026-0148"
};

function filterConversations(list: WhatsAppConversation[], chip: QueueChip): WhatsAppConversation[] {
  if (chip === "all") {
    return list;
  }
  if (chip === "unread") {
    return list.filter((c) => c.unreadCount > 0);
  }
  if (chip === "approval") {
    return list.filter((c) => c.pendingActionCount > 0);
  }
  return list.filter((c) => WA_QUEUE_META[c.id]?.risk !== "none");
}

function ThreadHeader({
  conversationId,
  contactName,
  phone,
  hasCustomer
}: {
  conversationId: string;
  contactName: string;
  phone: string;
  hasCustomer: boolean;
}) {
  const meta = WA_QUEUE_META[conversationId];
  const isDelta = conversationId === "wa_op_delta";
  return (
    <header className="hz-wa-thread-header">
      <h2 className="hz-wa-thread-title">{contactName}</h2>
      <p className="hz-wa-thread-phone">{phone}</p>
      <div className="hz-wa-thread-tags">
        <span className={`hz-wa-mini-tag${hasCustomer ? " hz-wa-mini-tag--ok" : ""}`}>{hasCustomer ? "Cari eşleşti" : "Cari eşlenmedi"}</span>
        {meta?.risk === "orta" ? <span className="hz-wa-mini-tag hz-wa-mini-tag--warn">Risk: Orta</span> : null}
        {meta?.risk === "kritik" ? <span className="hz-wa-mini-tag hz-wa-mini-tag--bad">Kritik</span> : null}
        {isDelta ? (
          <>
            <span className="hz-wa-mini-tag hz-wa-mini-tag--neutral">Açık bakiye {DELTA_HEADER.openBalance}</span>
            <span className="hz-wa-mini-tag hz-wa-mini-tag--neutral">Son sipariş {DELTA_HEADER.lastOrder}</span>
          </>
        ) : null}
      </div>
    </header>
  );
}

function ChatBlock({ block, onQuoteAction }: { block: WaRichBlock; onQuoteAction?: () => void }) {
  if (block.kind === "msg") {
    return (
      <div className={`hz-wa-message hz-wa-message--${block.dir === "in" ? "in" : "out"}`}>
        <div className="hz-wa-message-bubble">
          <p className="hz-wa-message-text">{block.body}</p>
          {block.badges?.length ? (
            <div className="hz-wa-message-badges">
              {block.badges.map((b) => (
                <span key={b} className="hz-wa-badge hz-wa-badge--intent">
                  {b}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
  if (block.kind === "ai") {
    return (
      <div className="hz-wa-ai-card" role="region" aria-label={block.title}>
        <div className="hz-wa-ai-card-head">
          <IconSparkles size={16} aria-hidden />
          {block.title}
        </div>
        <p className="hz-wa-ai-card-body">{block.body}</p>
        <span className="hz-wa-badge hz-wa-badge--warn">{block.badge}</span>
      </div>
    );
  }
  return (
    <div className="hz-wa-doc-card" role="region" aria-label={block.title}>
      <p className="hz-wa-doc-title">{block.title}</p>
      <p className="hz-wa-doc-sub">{block.sub}</p>
      <p className="hz-wa-doc-status">{block.status}</p>
      <button type="button" className="hz-wa-action-button hz-wa-action-button--primary hz-wa-action-button--info" onClick={onQuoteAction}>
        {block.actionLabel}
      </button>
    </div>
  );
}

function MessageBubble({ message }: { message: WhatsAppMessage }) {
  const out = message.direction === "outbound";
  return (
    <div className={`hz-wa-message hz-wa-message--${out ? "out" : "in"}`}>
      <div className="hz-wa-message-bubble">
        <p className="hz-wa-message-text">{message.body}</p>
        {message.attachmentTitle ? <span className="hz-wa-badge hz-wa-badge--neutral">Ek: {message.attachmentTitle}</span> : null}
        <span className="hz-wa-message-time">{new Date(message.sentAt).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}

export function WhatsAppPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const conversations = useMemo(() => getWhatsAppConversations(), []);
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? "");
  const [chip, setChip] = useState<QueueChip>("all");
  const [demoDone, setDemoDone] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => filterConversations(conversations, chip), [conversations, chip]);
  const filteredKey = useMemo(() => filtered.map((c) => c.id).join("|"), [filtered]);

  const queueListRef = useRef<HTMLDivElement>(null);
  const chatFeedRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = queueListRef.current;
    if (el) {
      el.scrollTop = 0;
    }
  }, [chip, filteredKey]);

  useLayoutEffect(() => {
    const el = chatFeedRef.current;
    if (el) {
      el.scrollTop = 0;
    }
  }, [selectedId]);

  const data = useMemo(() => getWhatsAppConversationById(selectedId), [selectedId]);

  const fireDemo = useCallback(
    (key: string, message: string) => {
      if (demoDone[key]) {
        return;
      }
      pushToast(message);
      setDemoDone((d) => ({ ...d, [key]: true }));
    },
    [demoDone, pushToast]
  );

  if (!data.conversation || !data.contact) {
    return (
      <div className="hz-wa-page">
        <div className="hz-wa-shell">
          <p className="hz-wa-empty">Konuşma bulunamadı.</p>
        </div>
      </div>
    );
  }

  const { conversation, contact, messages, richBlocks, customer, suggestedReply, actionRequests } = data;
  const qMeta = WA_QUEUE_META[conversation.id];
  const aiDraft = conversation.id === "wa_op_delta" ? DELTA_AI_DRAFT : suggestedReply;

  const unreadTotal = conversations.reduce((a, c) => a + c.unreadCount, 0);
  const approvalTotal = conversations.reduce((a, c) => a + c.pendingActionCount, 0);

  return (
    <div className="hz-wa-page">
      <div className="hz-wa-shell">
        <div className="hz-wa-layout">
          {/* Sol: Konuşma Kuyruğu */}
          <section className="hz-wa-conversation-panel" aria-label="Konuşma kuyruğu">
            <div className="hz-wa-panel-head">
              <h1 className="hz-wa-panel-title">Konuşma Kuyruğu</h1>
              <p className="hz-wa-panel-sub">Mesajdan CRM işlemine dönüşen talepler.</p>
              <div className="hz-wa-queue-status" aria-live="polite">
                <span className="hz-wa-dot hz-wa-dot--ok" aria-hidden />
                <span>Gateway çevrimiçi</span>
                <span className="hz-wa-queue-pill">12 aktif</span>
              </div>
            </div>
            <div className="hz-wa-chips" role="tablist" aria-label="Hızlı süzme">
              {(
                [
                  ["all", "Tümü"],
                  ["unread", "Okunmamış"],
                  ["approval", "Onay"],
                  ["risk", "Riskli"]
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={chip === key}
                  className={`hz-wa-chip${chip === key ? " hz-wa-chip--active" : ""}`}
                  onClick={() => setChip(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div ref={queueListRef} className="hz-wa-conversation-list">
              {filtered.map((c) => {
                const meta = WA_QUEUE_META[c.id];
                const active = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`hz-wa-conversation-card${active ? " hz-wa-conversation-card--active" : ""}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    {c.unreadCount > 0 ? <span className="hz-wa-unread-count">{c.unreadCount}</span> : null}
                    <span className="hz-wa-conversation-card-ico" aria-hidden>
                      <IconMessageCircle size={18} />
                    </span>
                    <span className="hz-wa-conversation-card-body">
                      <span className="hz-wa-conversation-card-top">
                        <span className="hz-wa-conversation-name">{c.title}</span>
                        <span className="hz-wa-conversation-time">{meta?.timeLabel ?? ""}</span>
                      </span>
                      <p className="hz-wa-conversation-snippet">{meta?.subtitle ?? c.lastMessagePreview}</p>
                      <p className="hz-wa-conversation-meta">
                        <span className="hz-wa-conversation-meta-strong">{meta?.intentLabel ?? "Genel"}</span>
                        {" · "}
                        {meta?.statusLine ?? "—"}
                        {c.pendingActionCount > 0 ? (
                          <>
                            {" · "}
                            <span className="hz-wa-conversation-meta-strong">{c.pendingActionCount} onay</span>
                          </>
                        ) : null}
                      </p>
                    </span>
                  </button>
                );
              })}
            </div>
            <details className="hz-wa-today-details">
              <summary>Bugünkü durum</summary>
              <div className="hz-wa-today-card">
                <div className="hz-wa-today-grid">
                  <div>
                    <span className="hz-wa-today-k">Okunmamış</span>
                    <span className="hz-wa-today-v">{unreadTotal || 4}</span>
                  </div>
                  <div>
                    <span className="hz-wa-today-k">Onay bekleyen</span>
                    <span className="hz-wa-today-v">{approvalTotal || 7}</span>
                  </div>
                  <div>
                    <span className="hz-wa-today-k">Hata</span>
                    <span className="hz-wa-today-v hz-wa-today-v--bad">1</span>
                  </div>
                </div>
              </div>
            </details>
          </section>

          {/* Orta: Mesaj + composer */}
          <section className="hz-wa-thread-panel" aria-label="Mesaj akışı">
            <ThreadHeader
              conversationId={conversation.id}
              contactName={contact.displayName}
              phone={contact.phone}
              hasCustomer={Boolean(customer)}
            />
            <div ref={chatFeedRef} className="hz-wa-chat-feed">
              {richBlocks?.length
                ? richBlocks.map((b) => (
                    <ChatBlock
                      key={b.id}
                      block={b}
                      onQuoteAction={b.kind === "quote" ? () => fireDemo("quoteApprove", "Onaya gönderim onay zincirinden geçer (demo).") : undefined}
                    />
                  ))
                : messages.map((m) => <MessageBubble key={m.id} message={m} />)}
            </div>
            <footer className="hz-wa-composer" aria-label="Mesaj yazma">
              <textarea className="hz-wa-composer-input" placeholder="Cevap yaz veya şablon seç..." rows={2} readOnly />
              <div className="hz-wa-composer-bar">
                <div className="hz-wa-composer-actions">
                  <button type="button" className="hz-wa-action-button hz-wa-action-button--ghost" onClick={() => fireDemo("tpl", "Şablon seçimi yakında (demo).")}>
                    Şablon
                  </button>
                  <button type="button" className="hz-wa-action-button hz-wa-action-button--ghost" onClick={() => fireDemo("ai", "AI taslak üretir; otomatik gönderilmez (demo).")}>
                    <IconSparkles size={14} aria-hidden />
                    AI Taslak
                  </button>
                  <button type="button" className="hz-wa-action-button hz-wa-action-button--ghost" onClick={() => fireDemo("doc", "Belge ekleme yakında (demo).")}>
                    <IconPaperclip size={14} aria-hidden />
                    Belge Ekle
                  </button>
                  <button type="button" className="hz-wa-action-button hz-wa-action-button--ghost" onClick={() => fireDemo("mic", "Ses notu yakında (demo).")}>
                    <IconMic size={14} aria-hidden />
                    Ses Notu
                  </button>
                </div>
                <button
                  type="button"
                  className="hz-wa-action-button hz-wa-action-button--send"
                  disabled={Boolean(demoDone.send)}
                  onClick={() => fireDemo("send", "Gönderim onay ve kayıt zincirine bağlandığında iletilecek (demo).")}
                >
                  <IconSend size={15} aria-hidden />
                  Gönder
                </button>
              </div>
            </footer>
          </section>

          {/* Sağ: CRM ve AI İşlem Paneli */}
          <aside className="hz-wa-side-panel" aria-label="CRM ve AI işlem paneli">
            <div className="hz-wa-panel-head hz-wa-panel-head--side">
              <h2 className="hz-wa-panel-title">CRM ve AI İşlem Paneli</h2>
              <p className="hz-wa-panel-sub">AI taslak üretir; işlem onay zincirinden geçer.</p>
            </div>
            <div className="hz-wa-side-scroll">
              <article className="hz-wa-side-card">
                <h3 className="hz-wa-side-card-title">Cari özeti</h3>
                <p className="hz-wa-side-lead">
                  {contact.displayName}
                  {customer ? ` • ${customer.type === "bayi" ? "Bayi" : "Müşteri"}` : " • —"}
                </p>
                <div className="hz-wa-fin-rows">
                  <div className="hz-wa-fin-row hz-wa-fin-row--pos">
                    <span>Alacak</span>
                    <strong>{conversation.id === "wa_op_delta" ? "₺84.500" : "—"}</strong>
                  </div>
                  <div className="hz-wa-fin-row hz-wa-fin-row--neg">
                    <span>Verecek</span>
                    <strong>{conversation.id === "wa_op_delta" ? "₺12.300" : "—"}</strong>
                  </div>
                </div>
                {conversation.id === "wa_op_delta" ? <p className="hz-wa-side-warn">Uyarı: 2 gecikmiş</p> : null}
              </article>

              <article className="hz-wa-side-card">
                <h3 className="hz-wa-side-card-title">İlgili kayıtlar</h3>
                <p className="hz-wa-ai-note">Yalnızca kayıt ekranına gider; işlem başlatmaz.</p>
                <div className="hz-wa-linked-actions">
                  <button
                    type="button"
                    className="hz-wa-linked-action"
                    disabled={!conversation.relatedCustomerId}
                    onClick={() => {
                      if (!conversation.relatedCustomerId) {
                        return;
                      }
                      router.push(`/cariler/${conversation.relatedCustomerId}`);
                    }}
                  >
                    <IconUser size={14} aria-hidden />
                    Cariyi Aç
                  </button>
                  <button
                    type="button"
                    className="hz-wa-linked-action"
                    onClick={() =>
                      router.push(
                        conversation.relatedOrderId ? `/siparisler/${conversation.relatedOrderId}` : "/siparisler/SO-2026-0148"
                      )
                    }
                  >
                    <IconShoppingCart size={14} aria-hidden />
                    Siparişe Git
                  </button>
                  <button
                    type="button"
                    className="hz-wa-linked-action"
                    disabled={!conversation.relatedCustomerId}
                    onClick={() => {
                      if (!conversation.relatedCustomerId) {
                        return;
                      }
                      router.push(`/tahsilatlar/yeni?customer=${conversation.relatedCustomerId}`);
                    }}
                  >
                    <IconWallet size={14} aria-hidden />
                    Tahsilat
                  </button>
                  <button
                    type="button"
                    className="hz-wa-linked-action"
                    onClick={() =>
                      router.push(
                        conversation.relatedDocumentId
                          ? `/belgeler?document=${conversation.relatedDocumentId}`
                          : "/belgeler?document=TF-2026-0189"
                      )
                    }
                  >
                    <IconFileText size={14} aria-hidden />
                    Belge
                  </button>
                </div>
              </article>

              <article className="hz-wa-side-card">
                <h3 className="hz-wa-side-card-title">Kural / güvenlik</h3>
                <ul className="hz-wa-rule-list">
                  <li>
                    <span>Intent</span>
                    <strong>
                      {qMeta?.intentLabel === "Sipariş" ? "Sipariş + Fiyat" : qMeta?.intentLabel ?? "—"}
                    </strong>
                  </li>
                  <li>
                    <span>Telefon</span>
                    <strong>{contact.registered ? "Kayıtlı" : "Kayıtsız"}</strong>
                  </li>
                  <li>
                    <span>Cari</span>
                    <strong>{customer ? "Eşleşti" : "Eşleşmedi"}</strong>
                  </li>
                  <li>
                    <span>Kural</span>
                    <strong>Onay gerekli</strong>
                  </li>
                </ul>
              </article>

              <article className="hz-wa-side-card hz-wa-side-card--ai">
                <div className="hz-wa-side-card-head">
                  <span className="hz-wa-side-ico-ai" aria-hidden>
                    <IconBot size={16} />
                  </span>
                  <h3 className="hz-wa-side-card-title">AI cevap taslağı</h3>
                </div>
                <p className="hz-wa-ai-note">Otomatik göndermez</p>
                <p className="hz-wa-ai-draft">{aiDraft}</p>
                <div className="hz-wa-side-btn-grid hz-wa-side-btn-grid--3">
                  <button type="button" className="hz-wa-action-button hz-wa-action-button--secondary" onClick={() => fireDemo("take", "Taslak cevaba alındı (demo).")}>
                    Cevaba Al
                  </button>
                  <button type="button" className="hz-wa-action-button hz-wa-action-button--secondary" onClick={() => fireDemo("edit", "Düzenleme yakında (demo).")}>
                    Düzenle
                  </button>
                  <button type="button" className="hz-wa-action-button hz-wa-action-button--primary" onClick={() => fireDemo("approveSend", "Onay zinciri bağlandığında iletilecek (demo).")}>
                    Onaya Gönder
                  </button>
                </div>
              </article>

              <article className="hz-wa-side-card">
                <h3 className="hz-wa-side-card-title">İşleme dönüştür</h3>
                <div className="hz-wa-convert-grid">
                  <button type="button" className="hz-wa-convert-btn" onClick={() => fireDemo("ord", "Sipariş oluşturma onay + işlem zincirinden geçer (demo).")}>
                    <IconShoppingCart size={18} className="hz-wa-convert-svg" aria-hidden />
                    Sipariş Oluştur
                  </button>
                  <button type="button" className="hz-wa-convert-btn" onClick={() => fireDemo("offer", "Teklif hazırlama onay gerektirir (demo).")}>
                    <IconFileText size={18} className="hz-wa-convert-svg" aria-hidden />
                    Teklif Hazırla
                  </button>
                  <button type="button" className="hz-wa-convert-btn" onClick={() => fireDemo("pay", "Tahsilat hatırlatması politika ile gönderilir (demo).")}>
                    <IconWallet size={18} className="hz-wa-convert-svg" aria-hidden />
                    Tahsilat Hatırlat
                  </button>
                  <button type="button" className="hz-wa-convert-btn" onClick={() => fireDemo("stmt", "Ekstre / belge çıktısı onay sonrası (demo).")}>
                    <IconRotateCcw size={18} className="hz-wa-convert-svg" aria-hidden />
                    Ekstre / Belge
                  </button>
                </div>
              </article>

              <article className="hz-wa-side-card">
                <h3 className="hz-wa-side-card-title">Bekleyen aksiyonlar</h3>
                <ul className="hz-wa-pending-list">
                  {(actionRequests.length
                    ? actionRequests.map((a) => a.title)
                    : ["Sipariş taslağı oluşturuldu", "Teklif gönderimi onay bekliyor", "Tahsilat riski işaretlendi"]
                  ).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                {conversation.relatedCustomerId ? (
                  <button
                    type="button"
                    className="hz-wa-action-button hz-wa-action-button--info hz-wa-pending-list--extra"
                    onClick={() => router.push(`/cariler/${conversation.relatedCustomerId}`)}
                  >
                    <IconUser size={14} aria-hidden />
                    Cari kaydına git
                  </button>
                ) : null}
              </article>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
