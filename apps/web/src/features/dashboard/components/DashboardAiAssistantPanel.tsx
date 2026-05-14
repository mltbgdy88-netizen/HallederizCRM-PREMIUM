"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../providers/auth-provider";
import { chatSalesAssistant, getSalesAssistantHealth, listSalesKnowledge, speakSalesVoice } from "../../ai/queries";

type SalesHealthStatus = "healthy" | "degraded" | "not_configured" | "blocked";

type SalesHealth = {
  status: SalesHealthStatus;
  reason: string;
  model: string;
  fallbackModel: string;
  modelReady: boolean;
  fallbackReady: boolean;
  localService?: {
    status: SalesHealthStatus;
    reason: string;
  };
  voice?: {
    status: SalesHealthStatus;
    sttReady: boolean;
    ttsReady: boolean;
  };
};

type SalesChatResult = {
  status: "live" | "degraded" | "not_configured" | "blocked";
  reply: string;
  intent: string;
  confidence: number;
  usedSources: Array<{ id: string; title: string; type: string; confidence: number }>;
  suggestedActions: Array<{ actionKey: string; label: string; requiresApproval: boolean; suggestedOnly: true }>;
  mutationExecuted: false;
  externalProviderCallExecuted: false;
};

type LocalMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const QUICK_PROMPTS = [
  "Urun bilgisi sor",
  "Fiyat sor",
  "Stok sor",
  "Teklif iste",
  "Bugunku oncelikleri sor",
  "Tahsilat durumunu sor"
];

function greetingFirstName(fullName: string | undefined): string {
  if (!fullName?.trim()) return "Operator";
  return fullName.trim().split(/\s+/)[0] ?? "Operator";
}

function statusBadge(status: SalesHealthStatus | "live"): string {
  if (status === "healthy" || status === "live") return "hz-badge hz-badge-success";
  if (status === "degraded") return "hz-badge hz-badge-warning";
  return "hz-badge hz-badge-danger";
}

function statusLabel(status: SalesHealthStatus | "live"): string {
  if (status === "healthy" || status === "live") return "ready";
  if (status === "degraded") return "degraded";
  if (status === "not_configured") return "not_configured";
  return "blocked";
}

function resolveMediaInfo(health: SalesHealth | null): string {
  if (!health) return "Saglik bilgisi yukleniyor";
  if (health.status === "healthy") return "Yerel model hazir, chat canli";
  if (health.status === "degraded") return "Kismi hazirlik: model veya servis bekleniyor";
  if (health.status === "not_configured") return "Model veya servis henuz yapilandirilmadi";
  return "Production gate bu modda canli kullanim izni vermiyor";
}

export function DashboardAiAssistantPanel({ compact = true }: { compact?: boolean }) {
  const { session } = useAuth();
  const first = greetingFirstName(session?.user.fullName);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [chatResult, setChatResult] = useState<SalesChatResult | null>(null);
  const [knowledgeCount, setKnowledgeCount] = useState<number>(0);
  const [health, setHealth] = useState<SalesHealth | null>(null);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);

  const canSend = !loading && prompt.trim().length > 0;
  const isVoiceReady = health?.voice?.ttsReady === true && (health?.voice?.status === "healthy" || health?.voice?.status === "degraded");

  const healthSummary = useMemo(() => {
    if (!health) return "Durum yukleniyor";
    return `${statusLabel(health.status)} | model: ${health.model} | fallback: ${health.fallbackModel}`;
  }, [health]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [healthResponse, knowledgeResponse] = await Promise.all([getSalesAssistantHealth(), listSalesKnowledge()]);
        if (!mounted) return;
        setHealth(healthResponse.item as SalesHealth);
        setKnowledgeCount(knowledgeResponse.total ?? 0);
        setError(null);
      } catch (nextError) {
        if (!mounted) return;
        setError(nextError instanceof Error ? nextError.message : "Asistan bilgisi alinamadi.");
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const runChat = async (message: string) => {
    const nextPrompt = message.trim();
    if (!nextPrompt) return;
    setLoading(true);
    setError(null);
    setVoiceMessage(null);
    try {
      setMessages((previous) => [...previous, { id: `u_${Date.now()}`, role: "user", text: nextPrompt }]);
      const response = await chatSalesAssistant({ message: nextPrompt, channel: "web" });
      const item = response.item as SalesChatResult;
      setChatResult(item);
      setMessages((previous) => [...previous, { id: `a_${Date.now()}`, role: "assistant", text: item.reply }]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Sales AI yanit uretemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSpeak = async () => {
    if (!chatResult?.reply) {
      setVoiceMessage("Sesli oynatim icin once bir asistan yaniti olusmali.");
      return;
    }
    if (!isVoiceReady) {
      setVoiceMessage("Ses servisi su an hazir degil.");
      return;
    }
    try {
      const result = await speakSalesVoice({ text: chatResult.reply });
      if (result.item.status !== "live") {
        setVoiceMessage(`Ses cikisi ${result.item.status}: ${result.item.reason ?? "provider degil"}`);
        return;
      }
      setVoiceMessage("Ses cikisi canli durumda hazirlandi.");
    } catch (nextError) {
      setVoiceMessage(nextError instanceof Error ? nextError.message : "Ses cikisi olusturulamadi.");
    }
  };

  return (
    <aside className={`hz-ai-panel hz-ai-panel--compact hz-live-assistant ${compact ? "" : "hz-ai-panel--premium"}`} aria-label="Sag kolon AI asistan">
      <header className="hz-live-assistant-head">
        <p className="hz-live-assistant-title">AI Asistan</p>
        <p className="hz-live-assistant-note">{`${first} icin local sales AI paneli`}</p>
      </header>

      <section className="hz-live-assistant-broadcast" aria-label="Asistan gorsel paneli">
        <div className="hz-live-assistant-screen">
          <div className="hz-live-assistant-screen-base">
            <div className="hz-live-assistant-screen-stack">
              <span className="hz-live-assistant-screen-play" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M8 6v12l10-6-10-6Z" fill="currentColor" />
                </svg>
              </span>
              <p className="hz-live-assistant-screen-line1">Media paneli</p>
              <p className="hz-live-assistant-screen-line2">{resolveMediaInfo(health)}</p>
            </div>
            <p className="hz-live-assistant-screen-caption">Gercek video kaynagi yoksa playback acilmaz</p>
          </div>
        </div>
        <div className="hz-inline-actions" style={{ marginTop: "6px", flexWrap: "wrap", gap: "6px" }}>
          <span className={statusBadge(health?.status ?? "degraded")}>{`AI: ${statusLabel(health?.status ?? "degraded")}`}</span>
          <span className={statusBadge(health?.localService?.status ?? "degraded")}>{`local-ai-service: ${statusLabel(health?.localService?.status ?? "degraded")}`}</span>
          <span className={statusBadge(health?.voice?.status ?? "degraded")}>{`voice: ${statusLabel(health?.voice?.status ?? "degraded")}`}</span>
        </div>
      </section>

      <section className="hz-live-assistant-local" aria-label="Health bilgisi">
        <header className="hz-live-assistant-local-head">
          <p className="hz-live-assistant-local-title">Saglik ve model</p>
          <p className="hz-live-assistant-local-note">{healthSummary}</p>
        </header>
        <div className="hz-inline-actions" style={{ flexWrap: "wrap", gap: "6px" }}>
          <span className="hz-badge hz-badge-info">{`Primary: ${health?.modelReady ? "hazir" : "hazir degil"}`}</span>
          <span className="hz-badge hz-badge-info">{`Fallback: ${health?.fallbackReady ? "hazir" : "hazir degil"}`}</span>
          <span className="hz-badge hz-badge-info">{`Knowledge: ${knowledgeCount}`}</span>
        </div>
      </section>

      <section className="hz-live-assistant-local" aria-label="Hizli aksiyonlar">
        <header className="hz-live-assistant-local-head">
          <p className="hz-live-assistant-local-title">Hizli aksiyonlar</p>
          <p className="hz-live-assistant-local-note">Kritik islemler yalnizca onerilir; otomatik execute edilmez.</p>
        </header>
        <div className="hz-ai-chips">
          {QUICK_PROMPTS.map((item) => (
            <button key={item} type="button" className="hz-ai-chip" disabled={loading} onClick={() => void runChat(item)}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="hz-live-assistant-local" aria-label="Sohbet">
        <header className="hz-live-assistant-local-head">
          <p className="hz-live-assistant-local-title">Asistan sohbeti</p>
          <p className="hz-live-assistant-local-note">Sadece endpoint yaniti gosterilir; fake basari yok.</p>
        </header>
        <div className="hz-ai-thread" style={{ maxHeight: "180px", overflowY: "auto" }}>
          {messages.length === 0 ? (
            <div className="hz-ai-bubble hz-ai-bubble--ai">
              <p>Prompt gondererek satis odakli yanit alabilirsiniz.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`hz-ai-bubble ${message.role === "user" ? "hz-ai-bubble--user" : "hz-ai-bubble--ai"}`}>
                <p>{message.text}</p>
              </div>
            ))
          )}
        </div>

        {chatResult ? (
          <div className="hz-inline-actions" style={{ flexWrap: "wrap", gap: "6px" }}>
            <span className={`hz-badge ${chatResult.status === "live" ? "hz-badge-success" : "hz-badge-warning"}`}>{`intent: ${chatResult.intent}`}</span>
            <span className="hz-badge hz-badge-info">{`confidence: ${chatResult.confidence.toFixed(2)}`}</span>
            <span className="hz-badge hz-badge-warning">{`mutationExecuted: ${String(chatResult.mutationExecuted)}`}</span>
            <span className="hz-badge hz-badge-warning">{`externalProviderCallExecuted: ${String(chatResult.externalProviderCallExecuted)}`}</span>
          </div>
        ) : null}

        {chatResult?.usedSources?.length ? (
          <p className="hz-live-assistant-local-status">
            {`Sources: ${chatResult.usedSources
              .slice(0, 2)
              .map((source) => source.title)
              .join(", ")}`}
          </p>
        ) : null}

        {chatResult?.suggestedActions?.length ? (
          <p className="hz-live-assistant-local-status">
            {`Suggested: ${chatResult.suggestedActions
              .slice(0, 2)
              .map((action) => action.label)
              .join(", ")}`}
          </p>
        ) : null}

        <div className="hz-live-assistant-local-row">
          <input
            type="text"
            className="hz-live-assistant-local-input"
            placeholder="Musteri niyetini yazin"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            autoComplete="off"
          />
          <button
            type="button"
            className="hz-live-assistant-local-icon"
            aria-label="Gonder"
            title="Asistana gonder"
            disabled={!canSend}
            onClick={() => {
              const nextPrompt = prompt.trim();
              if (!nextPrompt) return;
              setPrompt("");
              void runChat(nextPrompt);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {error ? <p className="hz-live-assistant-local-status">{`Hata: ${error}`}</p> : null}
      </section>

      <section className="hz-live-assistant-local" aria-label="Sesli kullanim">
        <header className="hz-live-assistant-local-head">
          <p className="hz-live-assistant-local-title">Sesli kullanim</p>
          <p className="hz-live-assistant-local-note">Provider hazir degilse transcript veya audio fake uretimi yapilmaz.</p>
        </header>
        <div className="hz-inline-actions" style={{ flexWrap: "wrap", gap: "6px" }}>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={() => void handleVoiceSpeak()}>
            Son yaniti seslendir
          </button>
          <span className={statusBadge(health?.voice?.status ?? "degraded")}>{`voice: ${statusLabel(health?.voice?.status ?? "degraded")}`}</span>
        </div>
        <p className="hz-live-assistant-local-status">
          {voiceMessage ?? "Ses servisi yoksa durum degraded/not_configured olarak kalir."}
        </p>
      </section>

      <section className="hz-dash-approvals-quick hz-dash-approvals-quick--compact" aria-label="Detay ekranlari">
        <header className="hz-dash-approvals-quick-head">
          <h3>Detay ekranlari</h3>
        </header>
        <p className="hz-dash-approvals-quick-copy">Tam AI yonetimi, knowledge ve onay metadatasi icin ilgili ekranlara gecin.</p>
        <div className="hz-inline-actions" style={{ gap: "8px", flexWrap: "wrap" }}>
          <Link href="/ai" className="hz-dash-approvals-quick-cta">
            AI Ekrani
          </Link>
          <Link href="/onaylar" className="hz-btn hz-btn-secondary">
            Onaylar
          </Link>
        </div>
      </section>
    </aside>
  );
}
