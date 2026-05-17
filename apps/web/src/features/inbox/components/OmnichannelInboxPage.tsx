"use client";

import { EmptyState, PageHeader } from "@hallederiz/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Conversation = {
  id: string;
  channel: string;
  status: string;
  contactDisplayName?: string;
  contactHandle?: string;
};

type ProviderHealth = {
  kind: string;
  ok: boolean;
  mode: string;
  reasons: string[];
};

const CHANNEL_FILTERS = ["all", "whatsapp", "instagram", "facebook", "web_chat", "email", "sms"] as const;

const CHANNEL_LABEL: Record<(typeof CHANNEL_FILTERS)[number], string> = {
  all: "Tümü",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  web_chat: "Web sohbet",
  email: "E-posta",
  sms: "SMS"
};

export function OmnichannelInboxPage() {
  const router = useRouter();
  const [items, setItems] = useState<Conversation[]>([]);
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [channel, setChannel] = useState<(typeof CHANNEL_FILTERS)[number]>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const [conversationsResponse, healthResponse] = await Promise.all([
          fetch("/platform/omnichannel/conversations", { credentials: "include" }),
          fetch("/platform/omnichannel/health", { credentials: "include" })
        ]);

        if (!active) return;

        if (!conversationsResponse.ok) {
          const body = await conversationsResponse.json().catch(() => ({}));
          const reason = typeof body?.error === "string" ? body.error : "omnichannel_api_unavailable";
          setError(reason);
          setItems([]);
        } else {
          const body = await conversationsResponse.json();
          setItems(Array.isArray(body?.items) ? body.items : []);
          setError(null);
        }

        if (healthResponse.ok) {
          const healthBody = await healthResponse.json();
          setProviders(Array.isArray(healthBody?.providers) ? healthBody.providers : []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "omnichannel_load_failed");
          setItems([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () => items.filter((item) => (channel === "all" ? true : item.channel === channel)),
    [items, channel]
  );

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((x) => x.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  const selected = useMemo(() => filtered.find((c) => c.id === selectedId) ?? null, [filtered, selectedId]);

  return (
    <div className="hz-inbox-page">
      <div className="hz-inbox-shell">
        <PageHeader
          title="İletişim merkezi"
          description="Çok kanallı gelen kutusu; sohbet değil, CRM bağlamında konuşma ve kayıt yönetimi."
          breadcrumb="Gelen Kutu"
        />

        <div className="hz-inbox-toolbar">
          <div className="hz-inbox-toolbar-links">
            <Link className="hz-inbox-toolbar-link" href="/gelen-kutu/whatsapp">
              WhatsApp gelen kutusu
            </Link>
            <Link className="hz-inbox-toolbar-link" href="/whatsapp">
              WhatsApp operasyon
            </Link>
          </div>
        </div>

        {error ? (
          <div className="hz-inbox-api-banner" role="alert">
            <strong>Omnichannel API şu anda kullanılamıyor.</strong>
            <span className="hz-inbox-api-banner-code">{error}</span>
            <p className="hz-inbox-api-banner-hint">Yerel geliştirmede uçlar kapalı olabilir; üretimde tenant kapsamlı servis ve yetki gerekir.</p>
          </div>
        ) : null}

        <div className="hz-inbox-layout">
          <section className="hz-inbox-col hz-inbox-col--queue" aria-label="Konuşma listesi">
            <header className="hz-inbox-col-head">
              <h2 className="hz-inbox-col-title">Konuşma kuyruğu</h2>
              <p className="hz-inbox-col-sub">Kanal süzmesi ve son durum özeti.</p>
            </header>
            <div className="hz-inbox-chips" role="tablist" aria-label="Kanal süzmesi">
              {CHANNEL_FILTERS.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={channel === key}
                  className={`hz-inbox-chip${channel === key ? " hz-inbox-chip--active" : ""}`}
                  onClick={() => setChannel(key)}
                >
                  {CHANNEL_LABEL[key]}
                </button>
              ))}
            </div>
            <div className="hz-inbox-queue-body">
              {loading ? (
                <div className="hz-inbox-queue-loading" role="status">
                  Konuşmalar yükleniyor…
                </div>
              ) : null}
              {!loading && filtered.length === 0 ? (
                <div className="hz-inbox-queue-empty">
                  <EmptyState title="Konuşma yok" message="Bu kanal süzmesinde kayıt bulunamadı veya API boş döndü." />
                </div>
              ) : null}
              {!loading && filtered.length > 0 ? (
                <ul className="hz-inbox-queue-list">
                  {filtered.map((item) => {
                    const active = item.id === selectedId;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`hz-inbox-queue-row${active ? " hz-inbox-queue-row--active" : ""}`}
                          onClick={() => setSelectedId(item.id)}
                          onDoubleClick={() => router.push(`/gelen-kutu/konusma/${encodeURIComponent(item.id)}`)}
                        >
                          <span className="hz-inbox-queue-name">{item.contactDisplayName ?? item.contactHandle ?? item.id}</span>
                          <span className="hz-inbox-queue-meta">
                            <span className="hz-inbox-queue-channel">{item.channel}</span>
                            <span className="hz-inbox-queue-dot" aria-hidden>
                              ·
                            </span>
                            <span className="hz-inbox-queue-status">{item.status}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </section>

          <section className="hz-inbox-col hz-inbox-col--thread" aria-label="Konuşma özeti">
            <header className="hz-inbox-col-head">
              <h2 className="hz-inbox-col-title">İş parçacığı</h2>
              <p className="hz-inbox-col-sub">Tam mesaj akışı ilgili konuşma ekranında açılır.</p>
            </header>
            <div className="hz-inbox-thread-body">
              {!selected ? (
                <div className="hz-inbox-thread-placeholder">
                  <p>Listeden bir konuşma seçin veya çift tıklayarak detay rotasına gidin.</p>
                </div>
              ) : (
                <div className="hz-inbox-thread-preview">
                  <p className="hz-inbox-thread-lead">{selected.contactDisplayName ?? selected.contactHandle ?? selected.id}</p>
                  <p className="hz-inbox-thread-line">
                    <span className="hz-inbox-thread-k">Kanal</span>
                    <span className="hz-inbox-thread-v">{selected.channel}</span>
                  </p>
                  <p className="hz-inbox-thread-line">
                    <span className="hz-inbox-thread-k">Durum</span>
                    <span className="hz-inbox-thread-v">{selected.status}</span>
                  </p>
                  <div className="hz-inbox-thread-actions">
                    <button
                      type="button"
                      className="hz-btn hz-btn-primary hz-toolbar-btn"
                      onClick={() => router.push(`/gelen-kutu/konusma/${encodeURIComponent(selected.id)}`)}
                    >
                      Konuşmayı aç
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="hz-inbox-col hz-inbox-col--context" aria-label="Bağlam ve sağlık">
            <header className="hz-inbox-col-head">
              <h2 className="hz-inbox-col-title">Bağlam paneli</h2>
              <p className="hz-inbox-col-sub">Sağlayıcı durumu ve cari kaydı ayrı ekranlarda derinleşir.</p>
            </header>
            <div className="hz-inbox-context-scroll">
              <article className="hz-inbox-context-card">
                <h3 className="hz-inbox-context-card-title">Seçili konuşma</h3>
                {selected ? (
                  <ul className="hz-inbox-context-list">
                    <li>
                      <span>Kayıt</span>
                      <strong>{selected.id}</strong>
                    </li>
                    <li>
                      <span>Kanal</span>
                      <strong>{selected.channel}</strong>
                    </li>
                    <li>
                      <span>Durum</span>
                      <strong>{selected.status}</strong>
                    </li>
                  </ul>
                ) : (
                  <p className="hz-inbox-context-muted">Veri varken ilk satır otomatik seçilir.</p>
                )}
              </article>

              <article className="hz-inbox-context-card">
                <h3 className="hz-inbox-context-card-title">Sağlayıcı sağlığı</h3>
                {providers.length === 0 ? <p className="hz-inbox-context-muted">Sağlık bilgisi henüz alınamadı.</p> : null}
                <ul className="hz-inbox-provider-list">
                  {providers.map((provider) => (
                    <li key={provider.kind} className={`hz-inbox-provider-row${provider.ok ? " hz-inbox-provider-row--ok" : ""}`}>
                      <span className="hz-inbox-provider-kind">{provider.kind}</span>
                      <span className="hz-inbox-provider-mode">{provider.ok ? "healthy" : provider.mode}</span>
                      {provider.reasons.length ? <span className="hz-inbox-provider-reasons">{provider.reasons.join(", ")}</span> : null}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
