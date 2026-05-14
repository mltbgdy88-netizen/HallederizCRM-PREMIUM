"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

const QUICK_PROMPTS: Array<{ label: string; prompt: string }> = [
  { label: "Urun", prompt: "Urun bilgisi sor" },
  { label: "Fiyat", prompt: "Fiyat sor" },
  { label: "Stok", prompt: "Stok sor" },
  { label: "Teklif", prompt: "Teklif iste" },
  { label: "Oncelik", prompt: "Bugunku oncelikleri sor" },
  { label: "Tahsilat", prompt: "Tahsilat durumunu sor" }
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
  if (!health) return "Durum yukleniyor";
  if (health.status === "healthy") return "Yerel model hazir";
  if (health.status === "degraded") return "Kismi hazir";
  if (health.status === "not_configured") return "Model/servis eksik";
  return "Production gate blocked";
}

function compactReason(reason: string | undefined): string {
  if (!reason) return "-";
  return reason.length > 44 ? `${reason.slice(0, 44)}...` : reason;
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
      setVoiceMessage("Once bir yanit olusmali.");
      return;
    }
    if (!isVoiceReady) {
      setVoiceMessage("Ses servisi hazir degil.");
      return;
    }
    try {
      const result = await speakSalesVoice({ text: chatResult.reply });
      if (result.item.status !== "live") {
        setVoiceMessage(`Ses ${result.item.status}: ${result.item.reason ?? "provider"}`);
        return;
      }
      setVoiceMessage("Ses cikisi hazirlandi.");
    } catch (nextError) {
      setVoiceMessage(nextError instanceof Error ? nextError.message : "Ses cikisi olusturulamadi.");
    }
  };

  return (
    <aside className={`hz-ai-panel hz-ai-panel--compact hz-live-assistant hz-right-rail-ai ${compact ? "" : "hz-ai-panel--premium"}`} aria-label="Sag kolon AI asistan">
      <header className="hz-live-assistant-head hz-right-rail-ai-head">
        <p className="hz-live-assistant-title">AI Asistan</p>
        <div className="hz-inline-actions" style={{ gap: "6px", flexWrap: "wrap" }}>
          <span className="hz-badge hz-badge-info">Guvenli oneriler</span>
          <span className="hz-badge hz-badge-info">{first}</span>
        </div>
      </header>

      <section className="hz-live-assistant-broadcast" aria-label="Asistan gorsel paneli">
        <div className="hz-live-assistant-screen">
          <div className="hz-live-assistant-screen-base">
            <div className="hz-live-assistant-screen-stack">
              <button type="button" className="hz-live-assistant-screen-play" disabled aria-label="Video kaynagi bagli degil" title="Video kaynagi bagli degil">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M8 6v12l10-6-10-6Z" fill="currentColor" />
                </svg>
              </button>
              <p className="hz-live-assistant-screen-line1">Media paneli</p>
              <p className="hz-live-assistant-screen-line2">{resolveMediaInfo(health)}</p>
            </div>
            <p className="hz-live-assistant-screen-caption">Video kaynagi bagli degil</p>
          </div>
        </div>
      </section>

      <section className="hz-live-assistant-local hz-right-rail-ai-health" aria-label="Health bilgisi">
        <div className="hz-right-rail-chip-grid">
          <span className={statusBadge(health?.status ?? "degraded")}>{`AI ${statusLabel(health?.status ?? "degraded")}`}</span>
          <span className="hz-badge hz-badge-info" title={health?.model ?? ""}>{`Model ${health?.modelReady ? "hazir" : "eksik"}`}</span>
          <span className={statusBadge(health?.localService?.status ?? "degraded")} title={health?.localService?.reason ?? ""}>{`Ollama ${statusLabel(health?.localService?.status ?? "degraded")}`}</span>
          <span className={statusBadge(health?.voice?.status ?? "degraded")}>{`Ses ${statusLabel(health?.voice?.status ?? "degraded")}`}</span>
          <span className="hz-badge hz-badge-info">{`Bilgi ${knowledgeCount}`}</span>
          <span className="hz-badge hz-badge-warning" title={health?.reason ?? ""}>{compactReason(health?.reason)}</span>
        </div>
      </section>

      <section className="hz-live-assistant-local" aria-label="Hizli aksiyonlar">
        <header className="hz-live-assistant-local-head">
          <p className="hz-live-assistant-local-title">Hizli aksiyonlar</p>
        </header>
        <div className="hz-right-rail-quick-grid">
          {QUICK_PROMPTS.map((item) => (
            <button key={item.label} type="button" className="hz-ai-chip" disabled={loading} onClick={() => void runChat(item.prompt)}>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="hz-live-assistant-local hz-right-rail-chat" aria-label="Sohbet">
        <header className="hz-live-assistant-local-head hz-right-rail-chat-head">
          <p className="hz-live-assistant-local-title">Sohbet</p>
          {chatResult ? <span className={`hz-badge ${chatResult.status === "live" ? "hz-badge-success" : "hz-badge-warning"}`}>{chatResult.intent}</span> : null}
        </header>

        <div className="hz-ai-thread hz-right-rail-chat-list">
          {messages.length === 0 ? (
            <div className="hz-ai-bubble hz-ai-bubble--ai">
              <p>Prompt ile baslayin.</p>
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
          <div className="hz-inline-actions hz-right-rail-chat-meta" style={{ flexWrap: "wrap", gap: "6px" }}>
            <span className="hz-badge hz-badge-info">{`conf ${chatResult.confidence.toFixed(2)}`}</span>
            <span className="hz-badge hz-badge-warning">mutation:false</span>
            <span className="hz-badge hz-badge-warning">provider:false</span>
            {chatResult.usedSources.length > 0 ? <span className="hz-badge hz-badge-info" title={chatResult.usedSources.map((source) => source.title).join(", ")}>source:{chatResult.usedSources.length}</span> : null}
            {chatResult.suggestedActions.length > 0 ? <span className="hz-badge hz-badge-info">{`action:${chatResult.suggestedActions.length}`}</span> : null}
          </div>
        ) : null}

        <div className="hz-live-assistant-local-row hz-right-rail-chat-composer">
          <input
            type="text"
            className="hz-live-assistant-local-input"
            placeholder="Musteri niyeti"
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
        <div className="hz-inline-actions" style={{ flexWrap: "wrap", gap: "6px" }}>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={() => void handleVoiceSpeak()}>
            Son yaniti seslendir
          </button>
          <span className={statusBadge(health?.voice?.status ?? "degraded")}>{`Ses ${statusLabel(health?.voice?.status ?? "degraded")}`}</span>
        </div>
        <p className="hz-live-assistant-local-status">{voiceMessage ?? "Voice hazir degilse fake output yok."}</p>
      </section>

      <section className="hz-dash-approvals-quick hz-dash-approvals-quick--compact" aria-label="Detay ekranlari">
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
