"use client";

import type { WhatsAppConversation, WhatsAppMessage } from "@hallederiz/types";
import { LoadingState } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { useWhatsAppInbox } from "../hooks/use-whatsapp-inbox";
import { type WaRichBlock, WA_QUEUE_META } from "../queries/whatsapp-mock-data";
import { waConversationQueueLine, type WaQueueLineMeta } from "../utils/wa-conversation-helpers";
import {
  MSG_WA_AI_DRAFT_ONLY,
  MSG_WA_APPROVAL_PREVIEW,
  MSG_WA_AUTO_REPLY_OFF,
  MSG_WA_CHANNEL_WAITING,
  MSG_WA_CONNECTION_NEEDED,
  MSG_WA_CONNECTION_REQUIRED,
  MSG_WA_DOCUMENT_PREVIEW,
  MSG_WA_DOC_ATTACH_NOT_LIVE,
  MSG_WA_EDIT_NOT_LIVE,
  MSG_WA_INBOX_RECONNECT,
  MSG_WA_LIVE_WAITING,
  MSG_WA_PREVIEW_SEND,
  MSG_WA_QR_PLACEHOLDER,
  MSG_WA_TEMPLATE_REQUIRES_LINK,
  MSG_WA_VOICE_NOT_LIVE
} from "../data/whatsapp-action-messages";
import { resolveCustomerEmptyMessage, sanitizeWhatsAppUserText } from "../utils/whatsapp-action-feedback";
import type { WhatsAppSessionSnapshot } from "@hallederiz/types";
import { mapWhatsAppChannelHealthView, type WhatsAppChannelHealthSnapshot } from "../utils/whatsapp-channel-health";
import { canSendWhatsAppOutbound, runWhatsAppOutboundSend } from "../utils/whatsapp-outbound-feedback";
import { WhatsAppProductionSecurityChecklist } from "./WhatsAppProductionSecurityChecklist";

type QueueChip = "all" | "unread" | "approval" | "risk";

const DELTA_AI_DRAFT =
  "Merhaba,\nURN-001 ve URN-056 için stok durumunu kontrol ettim.\nTeklif taslağını onayınıza sunuyorum.";

const DELTA_HEADER = {
  openBalance: "₺84.500",
  lastOrder: "SO-2026-0148"
};

function filterConversations(list: WhatsAppConversation[], chip: QueueChip, useDemo: boolean): WhatsAppConversation[] {
  if (chip === "all") {
    return list;
  }
  if (chip === "unread") {
    return list.filter((c) => c.unreadCount > 0);
  }
  if (chip === "approval") {
    return list.filter((c) => c.pendingActionCount > 0);
  }
  return list.filter((c) => (useDemo ? WA_QUEUE_META[c.id]?.risk : waConversationQueueLine(c).risk) !== "none");
}

function ThreadHeader({
  contactName,
  phone,
  hasCustomer,
  lineMeta,
  financeExtras
}: {
  contactName: string;
  phone: string;
  hasCustomer: boolean;
  lineMeta?: WaQueueLineMeta | null;
  financeExtras?: { openBalance: string; lastOrder: string } | null;
}) {
  return (
    <header className="hz-wa-thread-header">
      <h2 className="hz-wa-thread-title">{contactName}</h2>
      <p className="hz-wa-thread-phone">{phone}</p>
      <div className="hz-wa-thread-tags">
        <span className={`hz-wa-mini-tag${hasCustomer ? " hz-wa-mini-tag--ok" : ""}`}>{hasCustomer ? "Cari eşleşti" : "Cari eşlenmedi"}</span>
        {lineMeta?.risk === "orta" ? <span className="hz-wa-mini-tag hz-wa-mini-tag--warn">Risk: Orta</span> : null}
        {lineMeta?.risk === "kritik" ? <span className="hz-wa-mini-tag hz-wa-mini-tag--bad">Kritik</span> : null}
        {financeExtras ? (
          <>
            <span className="hz-wa-mini-tag hz-wa-mini-tag--neutral">Açık bakiye {financeExtras.openBalance}</span>
            <span className="hz-wa-mini-tag hz-wa-mini-tag--neutral">Son sipariş {financeExtras.lastOrder}</span>
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

function WhatsAppConnectionPanel({ healthView }: { healthView: ReturnType<typeof mapWhatsAppChannelHealthView> }) {
  const dotClass =
    healthView.dotTone === "error" ? "danger" : healthView.dotTone === "ok" ? "ok" : "warn";

  return (
    <article className="hz-wa-connection-card" aria-label="WhatsApp bağlantısı">
      <p className="hz-wa-connection-status">
        <span className={`hz-wa-dot hz-wa-dot--${dotClass}`} aria-hidden />
        {healthView.statusLine}
      </p>
      <div className="hz-wa-qr-placeholder" role="status">
        {healthView.qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- QR provider returns data URL or HTTPS image.
          <img src={healthView.qrDataUrl} alt="WhatsApp QR bağlantı kodu" className="hz-wa-qr-image" />
        ) : (
          <>
            <p className="hz-wa-qr-placeholder-title">QR bağlantısı</p>
            <p>{MSG_WA_QR_PLACEHOLDER}</p>
          </>
        )}
      </div>
      <p className="hz-wa-connection-note">{healthView.note || MSG_WA_CHANNEL_WAITING}</p>
      <p className="hz-wa-connection-note">{MSG_WA_AUTO_REPLY_OFF}</p>
    </article>
  );
}

export function WhatsAppPage({ initialCustomerId = null }: { initialCustomerId?: string | null }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const {
    useDemo,
    conversations,
    allConversations,
    contextCustomer,
    selectedId,
    setSelectedId,
    detail,
    listLoading,
    listError,
    detailLoading,
    detailError,
    reloadList
  } = useWhatsAppInbox(initialCustomerId);

  const [chip, setChip] = useState<QueueChip>("all");
  const [demoDone, setDemoDone] = useState<Record<string, boolean>>({});
  const [channelHealth, setChannelHealth] = useState<WhatsAppChannelHealthSnapshot | null>(null);
  const [channelSession, setChannelSession] = useState<WhatsAppSessionSnapshot | null>(null);

  useEffect(() => {
    if (useDemo || dataSourceConfig.useDemoData) {
      setChannelHealth(null);
      setChannelSession(null);
      return;
    }

    let cancelled = false;

    void Promise.all([sdk.whatsapp.getChannelHealth(), sdk.whatsapp.getSession()])
      .then(([healthResponse, sessionResponse]) => {
        if (cancelled) {
          return;
        }
        const healthItem = healthResponse.item;
        setChannelHealth(
          healthItem
            ? {
                status: healthItem.status,
                message: healthItem.message ?? healthItem.reason ?? "",
                mode: healthItem.mode
              }
            : null
        );
        setChannelSession(sessionResponse.item ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setChannelHealth(null);
          setChannelSession(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [useDemo]);

  const healthView = useMemo(
    () => mapWhatsAppChannelHealthView(channelHealth, channelSession, { useDemoData: useDemo }),
    [channelHealth, channelSession, useDemo]
  );

  const outboundReady = canSendWhatsAppOutbound(channelSession, useDemo);

  const filtered = useMemo(() => filterConversations(conversations, chip, useDemo), [conversations, chip, useDemo]);
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

  if (!useDemo && listLoading && conversations.length === 0) {
    return (
      <div className="hz-wa-page">
        <div className="hz-wa-shell hz-wa-shell--load">
          <LoadingState title="WhatsApp kutusu yükleniyor" message="Konuşma listesi hazırlanıyor." />
        </div>
      </div>
    );
  }

  if (!useDemo && listError && conversations.length === 0) {
    return (
      <div className="hz-wa-page">
        <div className="hz-wa-shell hz-wa-shell--load">
          <p className="hz-wa-empty" role="alert">
            {listError}
          </p>
          <p className="hz-wa-empty-sub" role="status">
            {MSG_WA_INBOX_RECONNECT}
          </p>
          <button type="button" className="hz-wa-action-button hz-wa-action-button--primary hz-wa-retry-btn" onClick={() => reloadList()}>
            Tekrar dene
          </button>
        </div>
      </div>
    );
  }

  if (!detail.conversation || !detail.contact) {
    return (
      <div className="hz-wa-page">
        <div className="hz-wa-shell hz-wa-shell--load">
          {useDemo ? (
            <p className="hz-wa-preview-band" role="status">
              Örnek veri modu: sohbet ve mesajlar demo amaçlıdır; canlı WhatsApp iletimi yapılmaz.
            </p>
          ) : null}
          {initialCustomerId ? (
            <p className="hz-wa-context-band" role="status">
              Cari bağlamı: {contextCustomer?.name ?? initialCustomerId}
              {allConversations.every((item) => item.relatedCustomerId !== initialCustomerId)
                ? " — bu cari için kayıtlı sohbet bulunamadı"
                : ""}
            </p>
          ) : null}
          <WhatsAppConnectionPanel healthView={healthView} />
          <p className="hz-wa-empty">
            {resolveCustomerEmptyMessage(
              Boolean(
                initialCustomerId &&
                  allConversations.every((item) => item.relatedCustomerId !== initialCustomerId)
              )
            )}
          </p>
          {!useDemo ? (
            <button type="button" className="hz-wa-action-button hz-wa-action-button--primary hz-wa-retry-btn" onClick={() => reloadList()}>
              Listeyi yenile
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  const { conversation, contact, messages, richBlocks, customer, suggestedReply, actionRequests } = detail;
  const displayContactName = customer?.name ?? contact.displayName;
  const lineMeta: WaQueueLineMeta = useDemo
    ? (WA_QUEUE_META[conversation.id] ?? waConversationQueueLine(conversation))
    : waConversationQueueLine(conversation);
  const aiDraft = useDemo && conversation.id === "wa_op_delta" ? DELTA_AI_DRAFT : suggestedReply;

  const unreadTotal = conversations.reduce((a, c) => a + c.unreadCount, 0);
  const approvalTotal = conversations.reduce((a, c) => a + c.pendingActionCount, 0);

  const customerBannerName = contextCustomer?.name ?? customer?.name ?? null;

  return (
    <div className="hz-wa-page">
      {useDemo ? (
        <p className="hz-wa-preview-band hz-wa-preview-band--page" role="status">
          Örnek veri modu: sohbet ve mesajlar demo amaçlıdır; canlı WhatsApp iletimi yapılmaz.
        </p>
      ) : null}
      {initialCustomerId ? (
        <p className="hz-wa-context-band hz-wa-context-band--page" role="status">
          Cari bağlamı: {customerBannerName ?? initialCustomerId}
          {conversations.length < allConversations.length ? " · cariye göre süzüldü" : ""}
        </p>
      ) : null}
      <div className="hz-wa-shell">
        <div className="hz-wa-layout">
          {/* Sol: Konuşma Kuyruğu */}
          <section className="hz-wa-conversation-panel" aria-label="Konuşma kuyruğu">
            <div className="hz-wa-panel-head">
              <h1 className="hz-wa-panel-title">Konuşma Kuyruğu</h1>
              <p className="hz-wa-panel-sub">Mesajdan CRM işlemine dönüşen talepler.</p>
              <WhatsAppConnectionPanel healthView={healthView} />
              <div className="hz-wa-queue-status" aria-live="polite">
                <span className="hz-wa-dot hz-wa-dot--warn" aria-hidden />
                <span>{MSG_WA_LIVE_WAITING}</span>
                <span className="hz-wa-queue-pill">{conversations.length} önizleme</span>
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
                const meta = useDemo ? (WA_QUEUE_META[c.id] ?? waConversationQueueLine(c)) : waConversationQueueLine(c);
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
                        <span className="hz-wa-conversation-time">{meta.timeLabel}</span>
                      </span>
                      <p className="hz-wa-conversation-snippet">{meta.subtitle}</p>
                      <p className="hz-wa-conversation-meta">
                        <span className="hz-wa-conversation-meta-strong">{meta.intentLabel}</span>
                        {" · "}
                        {meta.statusLine}
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
                    <span className="hz-wa-today-v">{unreadTotal || (useDemo ? 4 : 0)}</span>
                  </div>
                  <div>
                    <span className="hz-wa-today-k">Onay bekleyen</span>
                    <span className="hz-wa-today-v">{approvalTotal || (useDemo ? 7 : 0)}</span>
                  </div>
                  <div>
                    <span className="hz-wa-today-k">Hata</span>
                    <span className="hz-wa-today-v hz-wa-today-v--bad">{useDemo ? 1 : 0}</span>
                  </div>
                </div>
              </div>
            </details>
          </section>

          {/* Orta: Mesaj + composer */}
          <section className="hz-wa-thread-panel" aria-label="Mesaj akışı">
            <ThreadHeader
              contactName={displayContactName}
              phone={contact.phone}
              hasCustomer={Boolean(customer)}
              lineMeta={lineMeta}
              financeExtras={useDemo && conversation.id === "wa_op_delta" ? DELTA_HEADER : null}
            />
            <div ref={chatFeedRef} className="hz-wa-chat-feed">
              {!useDemo && detailError ? (
                <p className="hz-wa-inline-error" role="alert">
                  {detailError}
                </p>
              ) : null}
              {!useDemo && detailLoading ? (
                <div className="hz-wa-chat-feed-loading" role="status">
                  <LoadingState title="Mesajlar yükleniyor" message="Konuşma içeriği hazırlanıyor." />
                </div>
              ) : null}
              {richBlocks?.length
                ? richBlocks.map((b) => (
                    <ChatBlock
                      key={b.id}
                      block={b}
                      onQuoteAction={
                        b.kind === "quote"
                          ? () => {
                              pushToast(MSG_WA_DOCUMENT_PREVIEW);
                              fireDemo("quoteApprove", MSG_WA_APPROVAL_PREVIEW);
                            }
                          : undefined
                      }
                    />
                  ))
                : messages.map((m) => <MessageBubble key={m.id} message={m} />)}
            </div>
            <footer className="hz-wa-composer" aria-label="Mesaj yazma">
              <textarea className="hz-wa-composer-input" placeholder="Cevap yaz veya şablon seç..." rows={2} readOnly />
              <div className="hz-wa-composer-bar">
                <div className="hz-wa-composer-actions">
                  <button
                    type="button"
                    className="hz-wa-action-button hz-wa-action-button--ghost"
                    onClick={() => fireDemo("tpl", MSG_WA_TEMPLATE_REQUIRES_LINK)}
                  >
                    Şablon
                  </button>
                  <button
                    type="button"
                    className="hz-wa-action-button hz-wa-action-button--ghost"
                    onClick={() => fireDemo("ai", MSG_WA_AI_DRAFT_ONLY)}
                  >
                    <IconSparkles size={14} aria-hidden />
                    AI Taslak
                  </button>
                  <button
                    type="button"
                    className="hz-wa-action-button hz-wa-action-button--ghost"
                    onClick={() => fireDemo("doc", MSG_WA_DOC_ATTACH_NOT_LIVE)}
                  >
                    <IconPaperclip size={14} aria-hidden />
                    Belge Ekle
                  </button>
                  <button
                    type="button"
                    className="hz-wa-action-button hz-wa-action-button--ghost"
                    onClick={() => fireDemo("mic", MSG_WA_VOICE_NOT_LIVE)}
                  >
                    <IconMic size={14} aria-hidden />
                    Ses Notu
                  </button>
                </div>
                <button
                  type="button"
                  className="hz-wa-action-button hz-wa-action-button--send"
                  disabled={useDemo ? Boolean(demoDone.send) : !outboundReady}
                  onClick={() => {
                    if (useDemo) {
                      pushToast(MSG_WA_PREVIEW_SEND);
                      fireDemo("send", MSG_WA_CONNECTION_REQUIRED);
                      return;
                    }
                    if (!outboundReady || !selectedId) {
                      pushToast(MSG_WA_CONNECTION_NEEDED);
                      return;
                    }
                    void runWhatsAppOutboundSend({
                      useDemoData: false,
                      session: channelSession,
                      conversationId: selectedId,
                      body: aiDraft
                    }).then((outcome) => {
                      pushToast(outcome.toast);
                    });
                  }}
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
                  {displayContactName}
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
                    disabled={!conversation.relatedOrderId}
                    onClick={() => {
                      if (!conversation.relatedOrderId) {
                        return;
                      }
                      router.push(`/siparisler/${conversation.relatedOrderId}`);
                    }}
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
                    onClick={() => {
                      pushToast(MSG_WA_DOCUMENT_PREVIEW);
                      router.push(
                        conversation.relatedDocumentId
                          ? `/belgeler?document=${conversation.relatedDocumentId}`
                          : "/belgeler?document=document_1"
                      );
                    }}
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
                    <span>Talep türü</span>
                    <strong>
                      {lineMeta.intentLabel === "Sipariş" ? "Sipariş + Fiyat" : lineMeta.intentLabel}
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

              <WhatsAppProductionSecurityChecklist />

              <article className="hz-wa-side-card hz-wa-side-card--ai">
                <div className="hz-wa-side-card-head">
                  <span className="hz-wa-side-ico-ai" aria-hidden>
                    <IconBot size={16} />
                  </span>
                  <h3 className="hz-wa-side-card-title">AI cevap taslağı</h3>
                </div>
                <p className="hz-wa-ai-note">Öneri — otomatik gönderilmez</p>
                <p className="hz-wa-ai-draft">{aiDraft}</p>
                <div className="hz-wa-side-btn-grid hz-wa-side-btn-grid--3">
                  <button
                    type="button"
                    className="hz-wa-action-button hz-wa-action-button--secondary"
                    onClick={() => fireDemo("take", MSG_WA_PREVIEW_SEND)}
                  >
                    Cevaba Al
                  </button>
                  <button
                    type="button"
                    className="hz-wa-action-button hz-wa-action-button--secondary"
                    onClick={() => fireDemo("edit", MSG_WA_EDIT_NOT_LIVE)}
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className="hz-wa-action-button hz-wa-action-button--primary"
                    onClick={() => {
                      pushToast(MSG_WA_PREVIEW_SEND);
                      fireDemo("approveSend", MSG_WA_APPROVAL_PREVIEW);
                    }}
                  >
                    Onaya Gönder
                  </button>
                </div>
              </article>

              <article className="hz-wa-side-card">
                <h3 className="hz-wa-side-card-title">İşleme dönüştür</h3>
                <div className="hz-wa-convert-grid">
                  <button
                    type="button"
                    className="hz-wa-convert-btn"
                    onClick={() => fireDemo("ord", "Sipariş oluşturma henüz canlı kullanıma bağlı değil.")}
                  >
                    <IconShoppingCart size={18} className="hz-wa-convert-svg" aria-hidden />
                    Sipariş Oluştur
                  </button>
                  <button
                    type="button"
                    className="hz-wa-convert-btn"
                    onClick={() => fireDemo("offer", "Teklif hazırlama henüz canlı kullanıma bağlı değil.")}
                  >
                    <IconFileText size={18} className="hz-wa-convert-svg" aria-hidden />
                    Teklif Hazırla
                  </button>
                  <button
                    type="button"
                    className="hz-wa-convert-btn"
                    onClick={() => fireDemo("pay", "Tahsilat hatırlatma henüz canlı kullanıma bağlı değil.")}
                  >
                    <IconWallet size={18} className="hz-wa-convert-svg" aria-hidden />
                    Tahsilat Hatırlat
                  </button>
                  <button
                    type="button"
                    className="hz-wa-convert-btn"
                    onClick={() => fireDemo("stmt", "Ekstre ve belge çıktısı henüz canlı kullanıma bağlı değil.")}
                  >
                    <IconRotateCcw size={18} className="hz-wa-convert-svg" aria-hidden />
                    Ekstre / Belge
                  </button>
                </div>
              </article>

              <article className="hz-wa-side-card">
                <h3 className="hz-wa-side-card-title">Bekleyen aksiyonlar</h3>
                <ul className="hz-wa-pending-list">
                  {(actionRequests.length
                    ? actionRequests.map((a) => sanitizeWhatsAppUserText(a.title))
                    : useDemo
                      ? [
                          "Sipariş taslağı hazırlandı",
                          "Teklif önizlemesi onay bekliyor",
                          "Tahsilat riski işaretlendi"
                        ]
                      : ["Canlı modda bekleyen aksiyon kaydı yok."]
                  ).map((t, i) => (
                    <li key={`${t}-${i}`}>{sanitizeWhatsAppUserText(t)}</li>
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
