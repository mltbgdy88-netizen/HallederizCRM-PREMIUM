"use client";

import { useEffect, useMemo, useState } from "react";
import { chatSalesAssistant, getSalesAssistantHealth, speakSalesVoice } from "../../ai/queries";

type SalesHealthStatus = "healthy" | "degraded" | "not_configured" | "blocked";

type SalesHealth = {
  status: SalesHealthStatus;
  voice?: {
    status: SalesHealthStatus;
    ttsReady: boolean;
  };
};

type SalesChatResult = {
  status: "live" | "degraded" | "not_configured" | "blocked";
  reply: string;
  suggestedActions: Array<{ actionKey: string; label: string; requiresApproval: boolean; suggestedOnly: true }>;
};

type LocalMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
};

function statusLabel(status: SalesHealthStatus | null): string {
  if (!status) return "kisıtlı";
  if (status === "healthy") return "hazır";
  if (status === "degraded") return "kısıtlı";
  return "kapalı";
}

function statusTone(status: SalesHealthStatus | null): string {
  if (!status) return "hz-badge-warning";
  if (status === "healthy") return "hz-badge-success";
  if (status === "degraded") return "hz-badge-warning";
  return "hz-badge-danger";
}

export function DashboardAiAssistantPanel({ compact = true }: { compact?: boolean }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<SalesHealth | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [lastAssistantReply, setLastAssistantReply] = useState<string>("");

  const voiceReady = health?.voice?.ttsReady === true && health?.voice?.status === "healthy";
  const panelStatus = useMemo(() => statusLabel(health?.status ?? null), [health?.status]);

  useEffect(() => {
    let active = true;
    const loadHealth = async () => {
      try {
        const response = await getSalesAssistantHealth();
        if (!active) return;
        setHealth(response.item as SalesHealth);
      } catch {
        if (!active) return;
        setHealth({ status: "degraded" });
        setSystemMessage("Asistan servisi şu an kısıtlı.");
      }
    };

    void loadHealth();
    return () => {
      active = false;
    };
  }, []);

  const runChat = async (nextPrompt: string) => {
    const message = nextPrompt.trim();
    if (!message) return;

    setLoading(true);
    setSystemMessage(null);
    setMessages((previous) => [...previous, { id: `u_${Date.now()}`, role: "user", text: message }]);

    try {
      const response = await chatSalesAssistant({ message, channel: "web" });
      const item = response.item as SalesChatResult;
      const replyText = item.reply?.trim() || "Bu bilgi sistemde görünmüyor.";
      setLastAssistantReply(replyText);
      setMessages((previous) => [...previous, { id: `a_${Date.now()}`, role: "assistant", text: replyText }]);

      if (item.status !== "live") {
        setSystemMessage("Asistan kısıtlı modda yanıt üretti.");
      } else if (item.suggestedActions.length > 0) {
        setSystemMessage("Öneri üretildi. Canlı işlem otomatik çalıştırılmadı.");
      }
    } catch (error) {
      setSystemMessage(error instanceof Error ? error.message : "Asistan yanıt üretemedi.");
      setMessages((previous) => [...previous, { id: `s_${Date.now()}`, role: "system", text: "Asistan yanıtı alınamadı." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceButton = async () => {
    if (!voiceReady || !lastAssistantReply) return;
    try {
      const response = await speakSalesVoice({ text: lastAssistantReply });
      if (response.item.status !== "live") {
        setSystemMessage("Ses özelliği şu an kısıtlı.");
      }
    } catch {
      setSystemMessage("Ses özelliği şu an kullanılamıyor.");
    }
  };

  return (
    <aside className={`hz-ai-panel hz-ai-panel--compact hz-right-rail-ai-simple ${compact ? "" : "hz-ai-panel--premium"}`} aria-label="Sag kolon AI asistan">
      <header className="hz-right-rail-simple-head">
        <h3 className="hz-right-rail-simple-title">AI Asistan</h3>
        <span className={`hz-badge ${statusTone(health?.status ?? null)}`}>{panelStatus}</span>
      </header>

      <section className="hz-right-rail-simple-chat" aria-label="Asistan sohbeti">
        <div className="hz-right-rail-simple-messages">
          {messages.length === 0 ? (
            <div className="hz-ai-bubble hz-ai-bubble--ai">
              <p>Satış asistanına müşteri niyetini yazın.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`hz-ai-bubble ${message.role === "user" ? "hz-ai-bubble--user" : "hz-ai-bubble--ai"} ${message.role === "system" ? "hz-right-rail-system-bubble" : ""}`}
              >
                <p>{message.text}</p>
              </div>
            ))
          )}

          {systemMessage ? (
            <div className="hz-ai-bubble hz-ai-bubble--ai hz-right-rail-system-bubble">
              <p>{systemMessage}</p>
            </div>
          ) : null}
        </div>

        <footer className="hz-right-rail-simple-composer">
          <input
            type="text"
            className="hz-live-assistant-local-input"
            placeholder="Mesaj yazın"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            autoComplete="off"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                const nextPrompt = prompt.trim();
                if (!nextPrompt || loading) return;
                setPrompt("");
                void runChat(nextPrompt);
              }
            }}
          />
          <button
            type="button"
            className="hz-live-assistant-local-icon"
            aria-label="Sesli kullanim"
            title={voiceReady ? "Son yaniti seslendir" : "Ses özelliği hazır değil"}
            disabled={!voiceReady}
            onClick={() => void handleVoiceButton()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
              <path d="M19 10v1a7 7 0 01-14 0v-1M12 18v3M8 22h8" />
            </svg>
          </button>
          <button
            type="button"
            className="hz-live-assistant-local-icon"
            aria-label="Gonder"
            title="Asistana gonder"
            disabled={loading || prompt.trim().length === 0}
            onClick={() => {
              const nextPrompt = prompt.trim();
              if (!nextPrompt || loading) return;
              setPrompt("");
              void runChat(nextPrompt);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinejoin="round" />
            </svg>
          </button>
        </footer>
      </section>
    </aside>
  );
}
