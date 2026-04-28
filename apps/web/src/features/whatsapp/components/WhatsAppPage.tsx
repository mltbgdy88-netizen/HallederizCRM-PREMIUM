"use client";

import type {
  WhatsAppActionRequest,
  WhatsAppContact,
  WhatsAppConversation,
  WhatsAppIntent,
  WhatsAppMessage
} from "@hallederiz/types";
import { MetricCard, PageHeader, Pagination, PrimaryActionToolbar } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getWhatsAppConversationById, getWhatsAppConversations } from "../queries";

const intentLabels: Record<WhatsAppIntent, string> = {
  stok: "Stok",
  fiyat: "Fiyat",
  ekstre: "Ekstre",
  siparis: "Siparis",
  odeme: "Odeme",
  iade: "Iade",
  fatura: "Fatura",
  hatali_urun: "Hatali Urun",
  diger: "Diger"
};

export function WhatsAppIntentBadge({ intent }: { intent: WhatsAppIntent }) {
  const danger = ["odeme", "iade", "hatali_urun"].includes(intent);
  return <span className={`hz-badge ${danger ? "hz-badge-warning" : "hz-badge-info"}`}>{intentLabels[intent]}</span>;
}

export function WhatsappToolbar() {
  return (
    <PrimaryActionToolbar>
      <button className="hz-btn hz-toolbar-btn hz-btn-primary" type="button">
        Yeni Mesaj
      </button>
      <button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button">
        Sablon Gonder
      </button>
      <button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button">
        Action Request
      </button>
      <button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button">
        Onaya Gonder
      </button>
    </PrimaryActionToolbar>
  );
}

export function ConversationListPanel({
  conversations,
  selectedId,
  onSelect
}: {
  conversations: WhatsAppConversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pagedConversations = useMemo(
    () => conversations.slice((page - 1) * pageSize, page * pageSize),
    [conversations, page]
  );

  return (
    <article className="hz-column-card">
      <h3 className="hz-column-title">Konusmalar</h3>

      <section className="hz-filter-card">
        <div className="task-center-filter-grid">
          <label>
            Ara
            <input className="hz-control" placeholder="Kisi, telefon veya intent ara" />
          </label>
          <label>
            Tip
            <select defaultValue="">
              <option value="">Tum tipler</option>
              <option value="dealer">Bayi</option>
              <option value="staff">Personel</option>
              <option value="manager">Yonetici</option>
            </select>
          </label>
          <label className="hz-toggle">
            <input type="checkbox" />
            Onay bekleyen
          </label>
        </div>
        <div className="hz-filter-actions">
          <button type="button" className="hz-btn hz-btn-secondary">
            Filtrele
          </button>
          <button type="button" className="reset-btn">
            Temizle
          </button>
        </div>
      </section>

      <div className="hz-list-stack hz-list-stack-scroll">
        {pagedConversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            className={`hz-list-item ${selectedId === conversation.id ? "is-selected-row" : ""}`}
            onClick={() => onSelect(conversation.id)}
          >
            <strong>{conversation.title}</strong>
            <span className="muted">{conversation.lastMessagePreview}</span>
            <div className="hz-inline-actions">
              <WhatsAppIntentBadge intent={conversation.intent} />
              {conversation.pendingActionCount > 0 ? (
                <span className="hz-badge hz-badge-warning">{conversation.pendingActionCount} aksiyon</span>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      <Pagination totalItems={conversations.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
    </article>
  );
}

export function ConversationThreadPanel({ messages }: { messages: WhatsAppMessage[] }) {
  return (
    <article className="hz-column-card">
      <h3 className="hz-column-title">Mesaj Akisi</h3>
      <div className="hz-chat-feed">
        {messages.map((message) => (
          <div key={message.id} className={`hz-chat-bubble ${message.direction === "outbound" ? "is-outgoing" : ""}`}>
            <p>{message.body}</p>
            {message.attachmentTitle ? <span className="hz-badge hz-badge-info">Ek: {message.attachmentTitle}</span> : null}
            <small>{new Date(message.sentAt).toLocaleString("tr-TR")}</small>
          </div>
        ))}
      </div>
      <ReplyComposer />
    </article>
  );
}

export function ReplyComposer() {
  return (
    <div className="hz-chat-composer">
      <input className="hz-control" placeholder="Cevap yaz veya sablon sec" />
      <button type="button" className="hz-btn hz-btn-primary">
        Gonder
      </button>
      <button type="button" className="hz-btn hz-btn-secondary">
        Belge
      </button>
    </div>
  );
}

export function SuggestedReplyCard({ reply }: { reply: string }) {
  return (
    <section className="hz-content-card">
      <p className="drawer-eyebrow">AI Onerilen Cevap</p>
      <p>{reply}</p>
      <div className="hz-inline-actions">
        <button className="hz-btn hz-btn-secondary" type="button">
          Cevaba Al
        </button>
        <button className="hz-btn hz-btn-secondary" type="button">
          Onaya Gonder
        </button>
      </div>
    </section>
  );
}

export function WhatsAppApprovalPanel({ actionRequests }: { actionRequests: WhatsAppActionRequest[] }) {
  return (
    <section className="hz-content-card">
      <p className="drawer-eyebrow">Approval / Action Request</p>
      {actionRequests.length === 0 ? (
        <p className="muted">Bekleyen action request yok.</p>
      ) : (
        actionRequests.map((request) => (
          <div key={request.id} className="hz-list-item">
            <strong>{request.title}</strong>
            <span>{request.payloadSummary}</span>
            <span className="hz-badge hz-badge-warning">{request.status}</span>
          </div>
        ))
      )}
    </section>
  );
}

export function WhatsappActionModal({ actionRequests }: { actionRequests: WhatsAppActionRequest[] }) {
  return (
    <section className="hz-content-card">
      <p className="drawer-eyebrow">Action Request Foundation</p>
      <h3>Islem baslatma onizlemesi</h3>
      <p className="muted">
        WhatsApp uzerinden gelen siparis, odeme, fatura, iade veya belge talepleri burada gercek mutation oncesi
        confirmation/approval zincirine baglanir.
      </p>
      <div className="hz-inline-actions">
        <button className="hz-btn hz-btn-secondary" type="button">
          Action Request Ac
        </button>
        <button className="hz-btn hz-btn-secondary" type="button">
          Onaya Gonder
        </button>
        <button className="hz-btn hz-btn-secondary" type="button">
          Fallback Kuralini Uygula
        </button>
      </div>
      {actionRequests.length > 0 ? (
        <p className="muted">{actionRequests.length} bekleyen/aktif request bu konusmaya bagli.</p>
      ) : null}
    </section>
  );
}

export function ConversationContextPanel({
  contact,
  conversation,
  customer,
  suggestedReply,
  actionRequests
}: {
  contact: WhatsAppContact | null;
  conversation: WhatsAppConversation | undefined;
  customer: { name: string; code: string } | null | undefined;
  suggestedReply: string;
  actionRequests: WhatsAppActionRequest[];
}) {
  const router = useRouter();

  if (!conversation) {
    return (
      <article className="hz-column-card">
        <p className="muted">Konusma secimi bekleniyor.</p>
      </article>
    );
  }

  return (
    <article className="hz-column-card">
      <h3 className="hz-column-title">Baglam Paneli</h3>
      <div className="detail-list">
        <span>Kisi</span>
        <strong>{contact?.displayName ?? "-"}</strong>
        <span>Telefon</span>
        <strong>{contact?.phone ?? "-"}</strong>
        <span>Tip</span>
        <strong>{contact?.type ?? "-"}</strong>
        <span>Bagli cari</span>
        <strong>{customer ? `${customer.code} / ${customer.name}` : "-"}</strong>
        <span>Acik siparis</span>
        <strong>{conversation.relatedOrderId ?? "-"}</strong>
        <span>Tahsilat</span>
        <strong>{conversation.relatedPaymentId ?? "-"}</strong>
        <span>Belge</span>
        <strong>{conversation.relatedDocumentId ?? "-"}</strong>
      </div>

      <div className="hz-inline-actions">
        {conversation.relatedCustomerId ? (
          <button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push(`/cariler/${conversation.relatedCustomerId}`)}>
            Cariyi Ac
          </button>
        ) : null}
        {conversation.relatedOrderId ? (
          <button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push(`/siparisler/${conversation.relatedOrderId}`)}>
            Siparise Git
          </button>
        ) : null}
        {conversation.relatedPaymentId ? (
          <button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push(`/tahsilatlar/${conversation.relatedPaymentId}`)}>
            Tahsilat
          </button>
        ) : null}
        {conversation.relatedDocumentId ? (
          <button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push(`/belgeler?document=${conversation.relatedDocumentId}`)}>
            Belge
          </button>
        ) : null}
      </div>

      <section className="hz-content-card">
        <p className="drawer-eyebrow">Rule Resolution</p>
        <p>{conversation.ruleResolution.reason}</p>
        <span className={`hz-badge ${conversation.ruleResolution.allowed ? "hz-badge-success" : "hz-badge-danger"}`}>
          {conversation.ruleResolution.policyMode}
        </span>
      </section>

      <SuggestedReplyCard reply={suggestedReply} />
      <WhatsAppApprovalPanel actionRequests={actionRequests} />
      <WhatsappActionModal actionRequests={actionRequests} />
    </article>
  );
}

export function WhatsAppPage() {
  const conversations = useMemo(() => getWhatsAppConversations(), []);
  const [selectedId, setSelectedId] = useState(conversations[0]?.id);
  const selected = getWhatsAppConversationById(selectedId) ?? getWhatsAppConversationById(conversations[0]?.id);

  if (!selected) {
    return (
      <div className="hz-page-stack">
        <PageHeader title="WhatsApp" description="WhatsApp konusma kayitlari bulunamadi." />
      </div>
    );
  }

  return (
    <div className="hz-page-stack">
      <PageHeader title="WhatsApp" description="Bayi self-service, personel gorev mesaji ve yonetici onay kanalini tek ekranda yonetin." />
      <section className="hz-metric-grid">
        <MetricCard title="Konusma" value={String(conversations.length)} detail="Aktif kanal" tone="info" />
        <MetricCard
          title="Onay Bekleyen"
          value={String(conversations.reduce((total, conversation) => total + conversation.pendingActionCount, 0))}
          detail="Action request"
          tone="warning"
        />
        <MetricCard
          title="Guvenli Intent"
          value={String(conversations.filter((conversation) => conversation.ruleResolution.allowed).length)}
          detail="Kuraldan gecti"
          tone="success"
        />
        <MetricCard title="AI Cevap" value="3" detail="Hazir oneriler" tone="info" />
      </section>
      <WhatsappToolbar />
      <section className="hz-three-column">
        <ConversationListPanel conversations={conversations} selectedId={selectedId} onSelect={setSelectedId} />
        <ConversationThreadPanel messages={selected.messages} />
        <ConversationContextPanel
          contact={selected.contact}
          conversation={selected.conversation}
          customer={selected.customer}
          suggestedReply={selected.suggestedReply}
          actionRequests={selected.actionRequests}
        />
      </section>
    </div>
  );
}
