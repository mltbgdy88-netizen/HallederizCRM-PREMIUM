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
  ok?: boolean;
  status: "live" | "degraded" | "not_configured" | "blocked";
  reply: string;
  suggestedActions?: Array<{ actionKey: string; label: string; requiresApproval: boolean; suggestedOnly: true }>;
  mutationExecuted?: boolean;
  externalProviderCallExecuted?: boolean;
};

type LocalMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  ts: number;
};

/** Yalnızca UI karşılaması; API yanıtı değildir. */
const UI_GREETING = "Merhaba! Size nasıl yardımcı olabilirim?";

function formatMsgTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function statusDotKind(health: SalesHealth | null, healthFetchFailed: boolean): "red" | "green" | "amber" {
  if (healthFetchFailed) return "red";
  if (!health) return "amber";
  if (health.status === "healthy") return "green";
  return "amber";
}

function AssistantAvatar() {
  return (
    <span className="hz-dash-ai-msg-avatar" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path
          d="M12 3a2.5 2.5 0 0 0-2.5 2.5V8h-1.5A2 2 0 0 0 6 10v6.5L8.5 19v-2h7v2l2.5-2.5V10a2 2 0 0 0-2-2H14V5.5A2.5 2.5 0 0 0 12 3z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

function lastAssistantMessageIndex(messages: LocalMessage[]): number {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m && m.role === "assistant") return i;
  }
  return -1;
}

export function DashboardAiAssistantPanel({ compact = true }: { compact?: boolean }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<SalesHealth | null>(null);
  const [healthFetchFailed, setHealthFetchFailed] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [lastAssistantReply, setLastAssistantReply] = useState("");
  const [proposalFootnote, setProposalFootnote] = useState(false);
  const [introTs] = useState(() => Date.now());

  const voiceReady = health?.voice?.ttsReady === true && health?.voice?.status === "healthy";
  const dotKind = useMemo(() => statusDotKind(health, healthFetchFailed), [health, healthFetchFailed]);
  const dotAria =
    dotKind === "green" ? "Durum: bağlı" : dotKind === "red" ? "Durum: bağlantı hatası" : "Durum: beklemede";

  const lastAsstIdx = useMemo(() => lastAssistantMessageIndex(messages), [messages]);

  useEffect(() => {
    let active = true;
    const loadHealth = async () => {
      try {
        const response = await getSalesAssistantHealth();
        if (!active) return;
        setHealth(response.item as SalesHealth);
        setHealthFetchFailed(false);
      } catch {
        if (!active) return;
        setHealth(null);
        setHealthFetchFailed(true);
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

    const userTs = Date.now();
    setLoading(true);
    setProposalFootnote(false);
    setMessages((previous) => [...previous, { id: `u_${userTs}`, role: "user", text: message, ts: userTs }]);

    try {
      const response = await chatSalesAssistant({ message, channel: "web" });
      const item = response.item as SalesChatResult;
      const replyText = item.reply?.trim() || "Bu bilgi sistemde görünmüyor.";
      const asTs = Date.now();
      setLastAssistantReply(replyText);
      setMessages((previous) => [...previous, { id: `a_${asTs}`, role: "assistant", text: replyText, ts: asTs }]);

      const mut = item.mutationExecuted === true;
      const ext = item.externalProviderCallExecuted === true;
      const showFoot = !mut || !ext || item.status !== "live";
      setProposalFootnote(Boolean(showFoot));
    } catch {
      const sysTs = Date.now();
      setMessages((previous) => [...previous, { id: `s_${sysTs}`, role: "system", text: "Yanıt alınamadı.", ts: sysTs }]);
      setProposalFootnote(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceButton = async () => {
    if (!voiceReady || !lastAssistantReply) return;
    try {
      await speakSalesVoice({ text: lastAssistantReply });
    } catch {
      /* sessiz */
    }
  };

  return (
    <aside
      className={`hz-ai-panel hz-dash-ai-rail hz-dash-ai-rail--final hz-right-rail-ai-simple ${compact ? "hz-dash-ai-rail--compact" : "hz-ai-panel--premium"}`}
      aria-label="AI Asistan paneli"
    >
      <header className="hz-dash-ai-head">
        <h3 className="hz-dash-ai-head-title">AI Asistan</h3>
        <span className={`hz-dash-ai-status-dot hz-dash-ai-status-dot--${dotKind}`} role="status" aria-label={dotAria} />
      </header>

      <div className="hz-dash-ai-hero hz-dash-ai-hero--wide" aria-hidden>
        <div className="hz-dash-ai-hero-frame">
          <div className="hz-dash-ai-hero-visual">
            <div className="hz-dash-ai-hero-vignette" aria-hidden />
            <div className="hz-dash-ai-hero-glow" aria-hidden />
            <div className="hz-dash-ai-hero-ring" aria-hidden />
            <div className="hz-dash-ai-hero-orb" aria-hidden />
            <button type="button" className="hz-dash-ai-hero-play" disabled aria-label="Önizleme kullanılamıyor">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <section className="hz-right-rail-chat-stack" aria-label="AI sohbet">
        <div className="hz-dash-ai-chat-surface">
          <div className="hz-dash-ai-msg-list hz-right-rail-simple-messages">
            <div className="hz-dash-ai-msg hz-dash-ai-msg--assistant hz-dash-ai-msg--intro">
              <AssistantAvatar />
              <div className="hz-dash-ai-msg-col">
                <div className="hz-ai-bubble hz-ai-bubble--ai hz-dash-ai-msg-bubble">
                  <p>{UI_GREETING}</p>
                </div>
                <time className="hz-dash-ai-msg-time hz-dash-ai-msg-time--assistant" dateTime={new Date(introTs).toISOString()}>
                  {formatMsgTime(introTs)}
                </time>
              </div>
            </div>

            {messages.map((message, index) =>
              message.role === "user" ? (
                <div key={message.id} className="hz-dash-ai-msg hz-dash-ai-msg--user">
                  <div className="hz-dash-ai-msg-col hz-dash-ai-msg-col--user">
                    <div className="hz-ai-bubble hz-ai-bubble--user hz-dash-ai-msg-bubble">
                      <p>{message.text}</p>
                    </div>
                    <time className="hz-dash-ai-msg-time hz-dash-ai-msg-time--user" dateTime={new Date(message.ts).toISOString()}>
                      {formatMsgTime(message.ts)}
                    </time>
                  </div>
                </div>
              ) : message.role === "system" ? (
                <div key={message.id} className="hz-dash-ai-msg hz-dash-ai-msg--system">
                  <div className="hz-ai-bubble hz-ai-bubble--ai hz-dash-ai-msg-bubble hz-dash-ai-msg-bubble--system">
                    <p>{message.text}</p>
                  </div>
                  <time className="hz-dash-ai-msg-time hz-dash-ai-msg-time--system" dateTime={new Date(message.ts).toISOString()}>
                    {formatMsgTime(message.ts)}
                  </time>
                </div>
              ) : (
                <div key={message.id} className="hz-dash-ai-msg hz-dash-ai-msg--assistant">
                  <AssistantAvatar />
                  <div className="hz-dash-ai-msg-col">
                    <div className="hz-ai-bubble hz-ai-bubble--ai hz-dash-ai-msg-bubble">
                      <p>{message.text}</p>
                    </div>
                    {proposalFootnote && !loading && index === lastAsstIdx ? (
                      <p className="hz-dash-ai-footnote hz-dash-ai-footnote--attached">Öneri; canlı işlem yapılmadı.</p>
                    ) : null}
                    <time className="hz-dash-ai-msg-time hz-dash-ai-msg-time--assistant" dateTime={new Date(message.ts).toISOString()}>
                      {formatMsgTime(message.ts)}
                    </time>
                  </div>
                </div>
              )
            )}

            {loading ? (
              <div className="hz-dash-ai-msg hz-dash-ai-msg--assistant hz-dash-ai-msg--typing" aria-live="polite">
                <AssistantAvatar />
                <div className="hz-dash-ai-msg-col">
                  <div className="hz-ai-bubble hz-ai-bubble--ai hz-dash-ai-msg-bubble hz-dash-ai-msg-bubble--typing-wrap">
                    <div className="hz-dash-ai-typing-dots" aria-label="Yanıt bekleniyor">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <footer className="hz-dash-ai-composer hz-right-rail-simple-composer">
          <input
            type="text"
            className="hz-live-assistant-local-input hz-dash-ai-composer-input"
            placeholder=""
            aria-label="AI asistana mesaj yaz"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            autoComplete="off"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
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
            className="hz-live-assistant-local-icon hz-dash-ai-composer-icon hz-dash-ai-composer-mic"
            aria-label="Ses"
            title={!voiceReady || !lastAssistantReply ? "Ses servisi hazır değil" : undefined}
            disabled={!voiceReady || !lastAssistantReply}
            onClick={() => void handleVoiceButton()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
              <path d="M19 10v1a7 7 0 01-14 0v-1M12 18v3M8 22h8" />
            </svg>
          </button>
          <button
            type="button"
            className="hz-live-assistant-local-icon hz-dash-ai-composer-icon hz-dash-ai-composer-send"
            aria-label="Gönder"
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
