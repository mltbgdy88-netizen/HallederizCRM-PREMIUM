"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { chatSalesAssistant, getSalesAssistantHealth } from "../../ai/queries";

type SalesHealthStatus = "healthy" | "degraded" | "not_configured" | "blocked";

type SalesHealth = {
  status: SalesHealthStatus;
  voice?: {
    status: SalesHealthStatus;
    sttReady?: boolean;
    ttsReady?: boolean;
  };
};

type SalesChatResult = {
  reply: string;
  status: "live" | "degraded" | "not_configured" | "blocked";
};

type LocalMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  ts: number;
};

type SpeechRecognitionAlternative = { transcript: string };
type SpeechRecognitionResult = { isFinal: boolean; 0: SpeechRecognitionAlternative };
type SpeechRecognitionResultList = { length: number; [index: number]: SpeechRecognitionResult };
type SpeechRecognitionEventLike = { results: SpeechRecognitionResultList };
type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function formatMsgTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
      <path d="M19 10v1a7 7 0 01-14 0v-1M12 18v3M8 22h8" />
    </svg>
  );
}

export function DashboardCommandCenterAiPanel() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<SalesHealth | null>(null);
  const [healthFetchFailed, setHealthFetchFailed] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceHint, setVoiceHint] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const aiReady = health?.status === "healthy" && !healthFetchFailed;
  const aiPending = !health && !healthFetchFailed;
  const aiBlocked =
    healthFetchFailed || health?.status === "not_configured" || health?.status === "blocked";
  const speechSupported = useMemo(() => getSpeechRecognitionCtor() !== null, []);

  const inputDisabled = loading || !aiReady;
  const placeholder = aiBlocked ? "Lokal AI yapılandırılmadı." : "Mesaj yazın…";

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const runChat = async (nextPrompt: string) => {
    const message = nextPrompt.trim();
    if (!message || !aiReady) return;

    const userTs = Date.now();
    setLoading(true);
    setMessages((previous) => [...previous, { id: `u_${userTs}`, role: "user", text: message, ts: userTs }]);

    try {
      const response = await chatSalesAssistant({ message, channel: "web" });
      const item = response.item as SalesChatResult;
      const replyText = item.reply?.trim() || "Bu bilgi sistemde görünmüyor.";
      const asTs = Date.now();
      setMessages((previous) => [...previous, { id: `a_${asTs}`, role: "assistant", text: replyText, ts: asTs }]);
    } catch {
      const sysTs = Date.now();
      setMessages((previous) => [...previous, { id: `s_${sysTs}`, role: "system", text: "Yanıt alınamadı.", ts: sysTs }]);
    } finally {
      setLoading(false);
    }
  };

  const submitPrompt = () => {
    const next = prompt.trim();
    if (!next) return;
    setPrompt("");
    setVoiceOpen(false);
    void runChat(next);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  };

  const startListening = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceHint("Tarayıcı ses tanımayı desteklemiyor.");
      return;
    }
    if (listening) {
      stopListening();
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "tr-TR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    setVoiceHint("Dinleniyor…");
    setListening(true);

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const transcript = last?.[0]?.transcript?.trim() ?? "";
      if (!transcript) return;
      setPrompt(transcript);
      if (last?.isFinal) {
        setVoiceHint("Metin alındı. Gönder ile iletin.");
        stopListening();
      }
    };

    recognition.onerror = () => {
      setVoiceHint("Ses algılanamadı. Tekrar deneyin.");
      stopListening();
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch {
      setVoiceHint("Mikrofon başlatılamadı.");
      stopListening();
    }
  };

  const toggleVoicePanel = () => {
    if (voiceOpen) {
      stopListening();
      setVoiceOpen(false);
      setVoiceHint("");
      return;
    }
    setVoiceHint(speechSupported ? "Kayıt için mikrofona basın." : "Ses tanıma bu tarayıcıda kullanılamıyor.");
    setVoiceOpen(true);
  };

  const statusBand = useMemo(() => {
    if (aiPending) return null;
    if (aiBlocked) {
      return <p className="hz-cc-ai-status">Lokal AI yapılandırılmadı.</p>;
    }
    return null;
  }, [aiBlocked, aiPending]);

  return (
    <>
      <article className="hz-dash-card hz-cc-ai-chat-panel" aria-label="AI Asistan sohbet">
        <header className="hz-dash-card__head hz-ai-panel__head">
          <div className="hz-ai-panel__title-row">
            <LucideIcon name="sparkles" size={15} strokeWidth={2.25} className="hz-ai-panel__title-icon" />
            <h2>AI Asistan</h2>
            <span className="hz-ai-panel__beta">BETA</span>
          </div>
        </header>

        <div className="hz-cc-ai-chat" aria-label="Sohbet mesajları">
          <div className="hz-cc-ai-messages">
            {messages.length === 0 && !loading ? (
              <div className="hz-cc-ai-empty" aria-hidden>
                <span className="hz-cc-ai-empty-icon">
                  <LucideIcon name="sparkles" size={20} strokeWidth={2.25} />
                </span>
              </div>
            ) : null}
            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="hz-cc-ai-msg hz-cc-ai-msg--user">
                  <div className="hz-cc-ai-msg-col hz-cc-ai-msg-col--user">
                    <div className="hz-cc-ai-bubble hz-cc-ai-bubble--user">{message.text}</div>
                    <time className="hz-cc-ai-msg-time">{formatMsgTime(message.ts)}</time>
                  </div>
                </div>
              ) : message.role === "system" ? (
                <div key={message.id} className="hz-cc-ai-msg hz-cc-ai-msg--system">
                  <div className="hz-cc-ai-bubble hz-cc-ai-bubble--system">{message.text}</div>
                </div>
              ) : (
                <div key={message.id} className="hz-cc-ai-msg hz-cc-ai-msg--assistant">
                  <span className="hz-cc-ai-avatar" aria-hidden>
                    <LucideIcon name="sparkles" size={12} strokeWidth={2.25} />
                  </span>
                  <div className="hz-cc-ai-msg-col">
                    <div className="hz-cc-ai-bubble hz-cc-ai-bubble--assistant">{message.text}</div>
                    <time className="hz-cc-ai-msg-time">{formatMsgTime(message.ts)}</time>
                  </div>
                </div>
              )
            )}
            {loading ? (
              <div className="hz-cc-ai-msg hz-cc-ai-msg--assistant hz-cc-ai-msg--typing" aria-live="polite">
                <span className="hz-cc-ai-avatar" aria-hidden>
                  <LucideIcon name="sparkles" size={12} strokeWidth={2.25} />
                </span>
                <div className="hz-cc-ai-msg-col">
                  <div className="hz-cc-ai-bubble hz-cc-ai-bubble--assistant hz-cc-ai-bubble--typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} className="hz-cc-ai-messages-anchor" />
          </div>
          {statusBand}
        </div>
      </article>

      <div className="hz-cc-ai-composer-host">
        {voiceOpen ? (
          <div className="hz-cc-ai-voice" role="region" aria-label="Sesli giriş">
            <div className="hz-cc-ai-voice-head">
              <span className="hz-cc-ai-voice-title">Sesli giriş</span>
              <button
                type="button"
                className="hz-dash-icon-btn hz-cc-ai-voice-close"
                aria-label="Sesli girişi kapat"
                onClick={() => {
                  stopListening();
                  setVoiceOpen(false);
                  setVoiceHint("");
                }}
              >
                <LucideIcon name="x" size={12} />
              </button>
            </div>
            <div className={`hz-cc-ai-voice-wave${listening ? " is-active" : ""}`} aria-hidden>
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} className="hz-cc-ai-voice-bar" style={{ animationDelay: `${i * 0.05}s` }} />
              ))}
            </div>
            {voiceHint ? <p className="hz-cc-ai-voice-hint">{voiceHint}</p> : null}
            <button
              type="button"
              className={`hz-cc-ai-voice-mic${listening ? " is-listening" : ""}`}
              aria-label={listening ? "Dinlemeyi durdur" : "Dinlemeyi başlat"}
              disabled={!speechSupported || inputDisabled}
              onClick={startListening}
            >
              <MicIcon />
            </button>
          </div>
        ) : null}

        <div className="hz-cc-ai-composer">
          <input
            type="text"
            className="hz-cc-ai-composer-input"
            placeholder={placeholder}
            value={prompt}
            disabled={inputDisabled}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitPrompt();
              }
            }}
            aria-label="AI asistana mesaj"
          />
          <button
            type="button"
            className={`hz-cc-ai-composer-mic${voiceOpen ? " is-active" : ""}`}
            aria-label="Sesli giriş"
            aria-pressed={voiceOpen}
            disabled={inputDisabled}
            onClick={toggleVoicePanel}
          >
            <MicIcon />
          </button>
          <button
            type="button"
            className="hz-cc-ai-composer-send"
            aria-label="Gönder"
            disabled={inputDisabled || !prompt.trim()}
            onClick={submitPrompt}
          >
            <LucideIcon name="send" size={14} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </>
  );
}
