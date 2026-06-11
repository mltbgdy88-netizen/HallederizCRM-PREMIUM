"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { sdk } from "../../../lib/data-source";
import { channelLabel, mapProviderHealthLabel, sanitizeUserErrorMessage } from "../lib/omnichannel-ui";
import type { OmnichannelConversation, OmnichannelMessage } from "@hallederiz/sdk";

type ConversationRow = {
  id: string;
  channel: string;
  status: string;
  contactDisplayName?: string;
  contactHandle?: string;
  customerId?: string;
  lastMessagePreview?: string;
};

const CHANNEL_FILTERS = ["all", "whatsapp", "instagram", "facebook", "web_chat"] as const;
const STATUS_FILTERS = ["all", "open", "pending", "answered", "closed"] as const;

const CHANNEL_LABEL: Record<(typeof CHANNEL_FILTERS)[number], string> = {
  all: "Tümü",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  web_chat: "Web"
};

const STATUS_LABEL: Record<(typeof STATUS_FILTERS)[number], string> = {
  all: "Tümü",
  open: "Açık",
  pending: "Bekleyen",
  answered: "Cevaplandı",
  closed: "Kapalı"
};

export function OmnichannelThreePanelPage({ initialConversationId }: { initialConversationId?: string }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [items, setItems] = useState<ConversationRow[]>([]);
  const [messages, setMessages] = useState<OmnichannelMessage[]>([]);
  const [conversation, setConversation] = useState<OmnichannelConversation | null>(null);
  const [channel, setChannel] = useState<(typeof CHANNEL_FILTERS)[number]>("all");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [search, setSearch] = useState("");
  const [composer, setComposer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId ?? null);
  const [sentOnce, setSentOnce] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadList() {
      try {
        setLoading(true);
        const body = await sdk.omnichannel.listConversations();
        if (!active) return;
        setItems(Array.isArray(body?.items) ? body.items : []);
        setError(null);
      } catch (loadError) {
        if (active) {
          setError(sanitizeUserErrorMessage(loadError instanceof Error ? loadError.message : null));
          setItems([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadList();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    return items.filter((item) => {
      if (channel !== "all" && item.channel !== channel) return false;
      if (status !== "all" && item.status !== status) return false;
      if (!q) return true;
      const hay = `${item.contactDisplayName ?? ""} ${item.contactHandle ?? ""} ${item.id}`.toLocaleLowerCase("tr-TR");
      return hay.includes(q);
    });
  }, [items, channel, status, search]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (initialConversationId && filtered.some((x) => x.id === initialConversationId)) {
      setSelectedId(initialConversationId);
      return;
    }
    if (!selectedId || !filtered.some((x) => x.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId, initialConversationId]);

  useEffect(() => {
    if (!selectedId) {
      setConversation(null);
      setMessages([]);
      return;
    }
    const conversationId: string = selectedId;
    let active = true;
    async function loadDetail() {
      try {
        const [convRes, msgRes] = await Promise.all([
          sdk.omnichannel.getConversation(conversationId),
          sdk.omnichannel.listMessages(conversationId)
        ]);
        if (!active) return;
        setConversation(convRes.item ?? null);
        setMessages(Array.isArray(msgRes.items) ? msgRes.items : []);
      } catch {
        if (active) {
          setConversation(null);
          setMessages([]);
        }
      }
    }
    void loadDetail();
    return () => {
      active = false;
    };
  }, [selectedId]);

  const selected = useMemo(() => filtered.find((c) => c.id === selectedId) ?? null, [filtered, selectedId]);

  const quickOpHref = useMemo(() => {
    const customerId = selected?.customerId;
    if (customerId) return `/hizli-islem/satis-masasi?tab=order&customer=${customerId}`;
    return "/hizli-islem/satis-masasi";
  }, [selected?.customerId]);

  function handleSelect(id: string) {
    setSelectedId(id);
    if (initialConversationId) {
      router.replace(`/gelen-kutu/konusma/${encodeURIComponent(id)}`);
    }
  }

  function handleSend() {
    if (!composer.trim()) {
      pushToast("Mesaj metni girin.");
      return;
    }
    setSentOnce(true);
    pushToast("Canlı mesaj gönderimi kanal entegrasyonu fazında bağlanacak.");
  }

  return (
    <section className="omf-page hz-inbox-three-panel-page">
      <div className="omf-shell">
        <header className="omf-header">
          <div className="omf-header__main">
            <p className="omf-header__eyebrow">Gelen Kutu</p>
            <h1>Çok Kanallı Gelen Kutu</h1>
            <p className="omf-header__meta">WhatsApp, sosyal kanal ve müşteri konuşmaları tek panelde.</p>
          </div>
          <div className="omf-header__actions">
            <Link href="/whatsapp" className="omf-header__link">
              WhatsApp operasyon
            </Link>
            <Link href="/gelen-kutu" className="omf-header__link">
              Gelen kutu
            </Link>
          </div>
        </header>

        <p className="omf-demo-band" role="status">
          {dataSourceConfig.useDemoData
            ? "Örnek veri modu: mesaj gönderimi toast-only; canlı kanal entegrasyonu bağlı değildir."
            : "Canlı mesaj gönderimi kanal entegrasyonu fazında bağlanacak."}
        </p>

        {error ? (
          <p className="omf-demo-band" role="alert">
            {error}
          </p>
        ) : null}

        <main className="omf-layout">
          <aside className="omf-list-panel" aria-label="Konuşma listesi">
            <header className="omf-panel-head">
              <h2>Konuşmalar</h2>
              <p>Kanal ve durum filtreleri</p>
            </header>
            <div className="omf-panel-body">
              <div className="omf-chips" role="tablist" aria-label="Kanal">
                {CHANNEL_FILTERS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`omf-chip${channel === key ? " omf-chip--active" : ""}`}
                    onClick={() => setChannel(key)}
                  >
                    {CHANNEL_LABEL[key]}
                  </button>
                ))}
              </div>
              <div className="omf-chips" role="tablist" aria-label="Durum">
                {STATUS_FILTERS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`omf-chip${status === key ? " omf-chip--active" : ""}`}
                    onClick={() => setStatus(key)}
                  >
                    {STATUS_LABEL[key]}
                  </button>
                ))}
              </div>
              <input
                className="omf-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Kişi, telefon veya konuşma ara"
                type="search"
              />
              {loading ? <p className="omf-empty">Konuşmalar yükleniyor…</p> : null}
              {!loading && filtered.length === 0 ? <p className="omf-empty">Bu filtrede konuşma yok.</p> : null}
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`omf-conv-card${item.id === selectedId ? " omf-conv-card--active" : ""}`}
                  onClick={() => handleSelect(item.id)}
                >
                  <span className="omf-conv-card__name">{item.contactDisplayName ?? item.contactHandle ?? item.id}</span>
                  <span className="omf-conv-card__meta">
                    {channelLabel(item.channel)} · {item.status}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="omf-conversation-panel" aria-label="Konuşma">
            <header className="omf-panel-head">
              <h2>{selected?.contactDisplayName ?? selected?.contactHandle ?? "Konuşma seçin"}</h2>
              <p>{selected ? `${channelLabel(selected.channel)} · ${selected.status}` : "Soldan bir konuşma seçin"}</p>
            </header>
            <div className="omf-panel-body">
              {!selected ? (
                <p className="omf-empty">Konuşma seçilmedi.</p>
              ) : (
                <>
                  <div className="omf-messages">
                    {messages.length === 0 ? (
                      <p className="omf-empty">Henüz mesaj kaydı yok.</p>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`omf-message omf-message--${message.direction === "outbound" ? "outbound" : "inbound"}`}
                        >
                          <span className="omf-message__meta">
                            {message.authorType} · {message.status}
                          </span>
                          <p>{message.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="omf-composer">
                    <p className="omf-composer__note">Canlı mesaj gönderimi kanal entegrasyonu fazında bağlanacak.</p>
                    <textarea
                      value={composer}
                      onChange={(event) => setComposer(event.target.value)}
                      placeholder="Yanıt yazın…"
                      aria-label="Mesaj composer"
                    />
                    <div className="omf-composer__actions">
                      <button type="button" className="omf-btn omf-btn--primary" onClick={handleSend} disabled={sentOnce}>
                        {sentOnce ? "Gönderim bekliyor" : "Gönder"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <aside className="omf-context-panel" aria-label="Bağlam">
            <header className="omf-panel-head">
              <h2>Bağlam paneli</h2>
              <p>Cari ve ilişkili işlemler</p>
            </header>
            <div className="omf-panel-body">
              {selected ? (
                <>
                  <article className="omf-context-card">
                    <h3>Kişi / cari</h3>
                    <ul className="omf-context-list">
                      <li>
                        <span>Ad</span>
                        <strong>{selected.contactDisplayName ?? "—"}</strong>
                      </li>
                      <li>
                        <span>Kanal</span>
                        <strong>{channelLabel(selected.channel)}</strong>
                      </li>
                      <li>
                        <span>Handle</span>
                        <strong>{selected.contactHandle ?? "—"}</strong>
                      </li>
                    </ul>
                    {selected.customerId ? (
                      <Link href={`/cariler/${selected.customerId}`} className="omf-side-link">
                        Cari kartına git →
                      </Link>
                    ) : null}
                  </article>
                  <article className="omf-context-card">
                    <h3>İlişkili işlemler</h3>
                    <p className="omf-empty">Son sipariş/teklif/tahsilat özeti canlı bağlantıda listelenecek.</p>
                  </article>
                  <article className="omf-context-card">
                    <h3>Not / etiket</h3>
                    <button
                      type="button"
                      className="omf-btn"
                      onClick={() => pushToast("Not ekleme demo modda toast-only çalışır.")}
                    >
                      Not ekle
                    </button>
                  </article>
                  <Link href={quickOpHref} className="omf-side-link">
                    Hızlı İşlem →
                  </Link>
                </>
              ) : (
                <p className="omf-empty">Veri varken ilk konuşma otomatik seçilir.</p>
              )}
            </div>
          </aside>
        </main>
      </div>
    </section>
  );
}
