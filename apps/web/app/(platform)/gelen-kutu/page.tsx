"use client";

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

const channelFilters = ["all", "whatsapp", "instagram", "facebook", "web_chat", "email", "sms"] as const;

export default function OmnichannelInboxPage() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [selected, setSelected] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    () => items.filter((item) => (selected === "all" ? true : item.channel === selected)),
    [items, selected]
  );

  return (
    <main style={{ display: "grid", gap: 16 }}>
      <section style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {channelFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setSelected(filter)}
            style={{
              border: "1px solid #d0d7de",
              background: selected === filter ? "#111827" : "#ffffff",
              color: selected === filter ? "#ffffff" : "#111827",
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: 13
            }}
          >
            {filter === "all" ? "Tumu" : filter}
          </button>
        ))}
      </section>

      {error ? (
        <section style={{ border: "1px solid #fecaca", background: "#fff1f2", padding: 12, borderRadius: 10 }}>
          <strong>Omnichannel API su anda erisilebilir degil.</strong>
          <p style={{ marginTop: 6 }}>{error}</p>
        </section>
      ) : null}

      <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        <header style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "10px 12px", background: "#f8fafc", fontWeight: 600 }}>
          <span>Konusma</span>
          <span>Kanal</span>
          <span>Durum</span>
        </header>
        {loading ? <p style={{ padding: 12 }}>Yukleniyor...</p> : null}
        {!loading && filtered.length === 0 ? <p style={{ padding: 12 }}>Henuz konusma yok.</p> : null}
        {!loading
          ? filtered.map((item) => (
              <article key={item.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "10px 12px", borderTop: "1px solid #f1f5f9" }}>
                <span>{item.contactDisplayName ?? item.contactHandle ?? item.id}</span>
                <span>{item.channel}</span>
                <span>{item.status}</span>
              </article>
            ))
          : null}
      </section>

      <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
        <h2 style={{ marginBottom: 8 }}>Provider Saglik</h2>
        {providers.length === 0 ? <p>Saglik bilgisi henuz alinamadi.</p> : null}
        {providers.map((provider) => (
          <p key={provider.kind}>
            <strong>{provider.kind}</strong>: {provider.ok ? "healthy" : provider.mode}
            {provider.reasons.length ? ` (${provider.reasons.join(", ")})` : ""}
          </p>
        ))}
      </section>
    </main>
  );
}
