"use client";

import { PageHeader } from "@hallederiz/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sdk } from "../../../lib/data-source";
import type { AiReplySuggestion } from "@hallederiz/types";
import { channelLabel, mapProviderHealthLabel, sanitizeUserErrorMessage } from "../lib/omnichannel-ui";
import type { OmnichannelConversation, OmnichannelMessage } from "@hallederiz/sdk";

type Props = {
  conversationId: string;
};

export function OmnichannelConversationDetailPage({ conversationId }: Props) {
  const [conversation, setConversation] = useState<OmnichannelConversation | null>(null);
  const [messages, setMessages] = useState<OmnichannelMessage[]>([]);
  const [suggestions, setSuggestions] = useState<AiReplySuggestion[]>([]);
  const [healthLabel, setHealthLabel] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const [conversationRes, messagesRes, suggestionsRes, healthRes] = await Promise.all([
          sdk.omnichannel.getConversation(conversationId),
          sdk.omnichannel.listMessages(conversationId),
          sdk.omnichannel.listAiSuggestions(conversationId).catch(() => ({ items: [], total: 0 })),
          sdk.omnichannel.health()
        ]);

        if (!active) return;

        setConversation(conversationRes.item ?? null);
        setMessages(Array.isArray(messagesRes.items) ? messagesRes.items : []);
        setSuggestions(Array.isArray(suggestionsRes.items) ? suggestionsRes.items : []);

        const channelHealth = healthRes.providers?.find((item) => item.kind === conversationRes.item?.channel);
        setHealthLabel(channelHealth ? (mapProviderHealthLabel(channelHealth) ?? "") : "");
        setError(null);
      } catch (loadError) {
        if (active) {
          setError(sanitizeUserErrorMessage(loadError instanceof Error ? loadError.message : null));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [conversationId]);

  return (
    <div className="hz-inbox-page hz-inbox-detail-page">
      <div className="hz-inbox-shell">
        <PageHeader
          title={conversation?.contactDisplayName ?? conversation?.contactHandle ?? "Konuşma detayı"}
          description="Mesaj geçmişi ve onaylı cevap akışı."
          breadcrumb="Gelen Kutu / Konuşma"
        />

        <div className="hz-inbox-toolbar">
          <Link className="hz-inbox-toolbar-link" href="/gelen-kutu">
            ← Gelen kutuya dön
          </Link>
        </div>

        {error ? (
          <div className="hz-inbox-api-banner" role="alert">
            <strong>{error}</strong>
          </div>
        ) : null}

        {loading ? <p role="status">Konuşma yükleniyor…</p> : null}

        {!loading && conversation ? (
          <div className="hz-inbox-detail-grid">
            <section className="hz-inbox-detail-card" aria-label="Konuşma başlığı">
              <h2 className="hz-inbox-col-title">Konuşma</h2>
              <ul className="hz-inbox-context-list">
                <li>
                  <span>Kanal</span>
                  <strong>{channelLabel(conversation.channel)}</strong>
                </li>
                <li>
                  <span>Durum</span>
                  <strong>{conversation.status}</strong>
                </li>
                <li>
                  <span>Sağlayıcı</span>
                  <strong>{healthLabel || "—"}</strong>
                </li>
              </ul>
              <div className="hz-inbox-thread-actions">
                <button type="button" className="hz-btn hz-toolbar-btn" disabled title="Atama API üzerinden yapılır">
                  Ata
                </button>
                <button type="button" className="hz-btn hz-toolbar-btn" disabled title="Çözüm API üzerinden yapılır">
                  Çöz
                </button>
              </div>
            </section>

            <section className="hz-inbox-detail-card" aria-label="Mesaj listesi">
              <h2 className="hz-inbox-col-title">Mesajlar</h2>
              {messages.length === 0 ? <p className="hz-inbox-context-muted">Henüz mesaj kaydı yok.</p> : null}
              <ul className="hz-inbox-detail-messages">
                {messages.map((message) => (
                  <li key={message.id} className={`hz-inbox-detail-message hz-inbox-detail-message--${message.direction}`}>
                    <span className="hz-inbox-detail-message-meta">
                      {message.authorType} · {message.status}
                    </span>
                    <p className="hz-inbox-detail-message-text">{message.text}</p>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="hz-inbox-detail-card" aria-label="AI önerileri">
              <h2 className="hz-inbox-col-title">AI önerileri</h2>
              <p className="hz-inbox-context-muted">AI önerisi — insan onayı olmadan gönderilmez.</p>
              {suggestions.length === 0 ? (
                <p className="hz-inbox-context-muted">AI önerileri onay akışına bağlandığında burada görünecek.</p>
              ) : (
                <ul className="hz-inbox-detail-suggestions">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.id} className="hz-inbox-detail-suggestion">
                      <p className="hz-inbox-detail-message-text">{suggestion.draftText}</p>
                      <div className="hz-inbox-thread-actions">
                        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" disabled title="Onaylar ekranından işlenir">
                          Onaya gönder
                        </button>
                        <button type="button" className="hz-btn hz-toolbar-btn" disabled>
                          Düzenle
                        </button>
                        <button type="button" className="hz-btn hz-toolbar-btn" disabled>
                          Reddet
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
