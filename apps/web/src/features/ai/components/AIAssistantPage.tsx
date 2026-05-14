"use client";

import type { AiInsight, AiMessage, AiProposal, Approval } from "@hallederiz/types";
import type { SalesAiTrainingScope } from "@hallederiz/ai-contracts";
import { MetricCard, PageHeader, PrimaryActionToolbar, TabSwitcher } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  chatSalesAssistant,
  classifySalesIntent,
  confirmAiProposal,
  createAiProposal,
  createSalesKnowledge,
  getAiAssistantData,
  getSalesAssistantHealth,
  listSalesKnowledge,
  rejectAiProposal,
  removeSalesKnowledge,
  runAiChat,
  runAiInsights,
  speakAiText,
  speakSalesVoice,
  transcribeSalesVoice,
  updateSalesKnowledge
} from "../queries";

const statusLabel: Record<AiProposal["status"], string> = {
  draft: "Taslak",
  waiting_approval: "Onay Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  executed: "İcra Edildi",
  failed: "Hata"
};

type SalesHealth = {
  status: "healthy" | "degraded" | "not_configured" | "blocked";
  reason: string;
  model: string;
  fallbackModel: string;
  modelReady: boolean;
  fallbackReady: boolean;
  availableModels: string[];
  localService?: {
    status: "healthy" | "degraded" | "not_configured" | "blocked";
    reason: string;
    speakerReady: boolean;
    whisperModel?: string;
  };
  voice?: {
    status: "healthy" | "degraded" | "not_configured" | "blocked";
    sttReady: boolean;
    ttsReady: boolean;
    whisperModel?: string;
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
  provider: { provider: string; model: string; fallbackModel: string; effectiveModel?: string; fallbackUsed: boolean };
};

type KnowledgeFormState = {
  id?: string;
  productName: string;
  productId: string;
  category: string;
  description: string;
  salesNotes: string;
  allowedClaims: string;
  blockedClaims: string;
  faqSnippets: string;
  selectedDocuments: string;
  priceVisibility: "visible" | "hidden";
  stockVisibility: "visible" | "hidden";
};

const initialKnowledgeForm: KnowledgeFormState = {
  productName: "",
  productId: "",
  category: "",
  description: "",
  salesNotes: "",
  allowedClaims: "",
  blockedClaims: "",
  faqSnippets: "",
  selectedDocuments: "",
  priceVisibility: "hidden",
  stockVisibility: "hidden"
};

function parseCommaText(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toForm(record: SalesAiTrainingScope): KnowledgeFormState {
  return {
    id: record.id,
    productName: record.productName,
    productId: record.productId ?? "",
    category: record.category ?? "",
    description: record.description ?? "",
    salesNotes: record.salesNotes ?? "",
    allowedClaims: (record.allowedClaims ?? []).join(", "),
    blockedClaims: (record.blockedClaims ?? []).join(", "),
    faqSnippets: (record.faqSnippets ?? []).join(", "),
    selectedDocuments: (record.selectedDocuments ?? []).join(", "),
    priceVisibility: record.priceVisibility,
    stockVisibility: record.stockVisibility
  };
}

function buildKnowledgePayload(form: KnowledgeFormState) {
  return {
    productName: form.productName.trim(),
    productId: form.productId.trim() || undefined,
    category: form.category.trim() || undefined,
    description: form.description.trim() || undefined,
    salesNotes: form.salesNotes.trim() || undefined,
    allowedClaims: parseCommaText(form.allowedClaims),
    blockedClaims: parseCommaText(form.blockedClaims),
    faqSnippets: parseCommaText(form.faqSnippets),
    selectedDocuments: parseCommaText(form.selectedDocuments),
    priceVisibility: form.priceVisibility,
    stockVisibility: form.stockVisibility
  };
}

function statusBadge(status: string) {
  if (status === "healthy" || status === "live") return "hz-badge-success";
  if (status === "degraded") return "hz-badge-warning";
  return "hz-badge-danger";
}

export function AiModeToggle() {
  return (
    <div className="hz-inline-actions">
      <span className="hz-badge hz-badge-success">Local-first AI</span>
      <span className="hz-badge hz-badge-info">Öneri ve taslak modu</span>
      <span className="hz-badge hz-badge-warning">Kritik işlem için onay zorunlu</span>
    </div>
  );
}

export function VoiceInputButton({ onClick }: { onClick?: () => void }) {
  return (
    <button className="hz-btn hz-btn-secondary" type="button" onClick={onClick}>
      Mikrofon
    </button>
  );
}

export function AiInputPanel({ onSubmit, onVoice }: { onSubmit?: (prompt: string) => void; onVoice?: () => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="hz-chat-composer">
      <input className="hz-control" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Komut yaz: geciken tahsilatları özetle" />
      <button
        className="hz-btn hz-btn-primary"
        type="button"
        onClick={() => {
          if (!value.trim()) return;
          onSubmit?.(value.trim());
          setValue("");
        }}
      >
        Gönder
      </button>
      <VoiceInputButton onClick={onVoice} />
    </div>
  );
}

export function AiProposalCardList({ proposals, onConfirm, onReject }: { proposals: AiProposal[]; onConfirm?: (id: string) => void; onReject?: (id: string) => void }) {
  return (
    <section className="hz-content-card">
      <h3>Proposal Kartları</h3>
      {proposals.map((proposal) => (
        <div key={proposal.id} className="hz-list-item">
          <strong>
            {proposal.proposalNo} / {proposal.actionType}
          </strong>
          <span>{proposal.summary}</span>
          <div className="hz-inline-actions">
            <span className="hz-badge hz-badge-info">{statusLabel[proposal.status]}</span>
            {proposal.requiresApproval ? (
              <>
                <button className="hz-btn hz-btn-secondary" type="button" onClick={() => onConfirm?.(proposal.id)}>
                  Onayla
                </button>
                <button className="hz-btn hz-btn-secondary" type="button" onClick={() => onReject?.(proposal.id)}>
                  Reddet
                </button>
              </>
            ) : (
              <span className="hz-badge hz-badge-success">Read-only</span>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

export function AiApprovalPanel({ approvals }: { approvals: Approval[] }) {
  const router = useRouter();
  return (
    <section className="hz-content-card">
      <h3>Onay Bekleyen AI Proposal'lar</h3>
      {approvals.map((approval) => (
        <div key={approval.id} className="hz-list-item">
          <strong>{approval.approvalNo}</strong>
          <span>{approval.payloadSummary}</span>
          <button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push("/ai/onaylar")}>
            Onaya Git
          </button>
        </div>
      ))}
    </section>
  );
}

export function AiInsightPanel({ insights }: { insights: AiInsight[] }) {
  const router = useRouter();
  return (
    <section className="hz-content-card">
      <h3>İlgili Kayıt Önizlemeleri</h3>
      {insights.slice(0, 3).map((insight) => (
        <div key={insight.id} className="hz-list-item">
          <strong>{insight.title}</strong>
          <span>{insight.summary}</span>
          <button
            className="hz-btn hz-btn-secondary"
            type="button"
            onClick={() => router.push(insight.targetType === "customer" ? `/cariler/${insight.targetId}` : insight.targetType === "product" ? "/stok" : "/ai/icgoruler")}
          >
            Kayda Git
          </button>
        </div>
      ))}
    </section>
  );
}

export function AiContextSidePanel({ approvals, insights }: { approvals: Approval[]; insights: AiInsight[] }) {
  return (
    <article className="hz-column-card">
      <h3 className="hz-column-title">Onay ve Bağlam Paneli</h3>
      <AiApprovalPanel approvals={approvals} />
      <section className="hz-content-card">
        <h3>Yetki Uyarıları</h3>
        <p className="muted">AI kritik mutation işlemlerini çalıştırmaz. Sadece öneri üretir ve onay akışına yönlendirir.</p>
      </section>
      <AiInsightPanel insights={insights} />
    </article>
  );
}

export function AIAssistantPage() {
  const [data, setData] = useState<{ messages: AiMessage[]; proposals: AiProposal[]; approvals: Approval[]; executions: unknown[]; insights: AiInsight[] }>({
    messages: [],
    proposals: [],
    approvals: [],
    executions: [],
    insights: []
  });
  const [mode, setMode] = useState("text");
  const [chatStatus, setChatStatus] = useState<{ provider: string; mode: string } | null>(null);
  const [salesPrompt, setSalesPrompt] = useState("");
  const [salesIntent, setSalesIntent] = useState<{ intent: string; confidence: number } | null>(null);
  const [salesHealth, setSalesHealth] = useState<SalesHealth | null>(null);
  const [salesChatResult, setSalesChatResult] = useState<SalesChatResult | null>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<SalesAiTrainingScope[]>([]);
  const [knowledgeForm, setKnowledgeForm] = useState<KnowledgeFormState>(initialKnowledgeForm);
  const [knowledgeState, setKnowledgeState] = useState<{ level: "info" | "error"; text: string } | null>(null);
  const [voiceState, setVoiceState] = useState<{ transcript?: string; speakStatus?: string; reason?: string } | null>(null);

  const healthSummary = useMemo(() => {
    if (!salesHealth) return "Health yükleniyor...";
    return `Durum: ${salesHealth.status} | Model: ${salesHealth.model} | Fallback: ${salesHealth.fallbackModel} | Sebep: ${salesHealth.reason}`;
  }, [salesHealth]);

  const reload = async () => {
    const next = await getAiAssistantData();
    setData((previous) => ({ ...next, messages: previous.messages.length > 0 ? previous.messages : next.messages }));

    try {
      const [health, knowledge] = await Promise.all([getSalesAssistantHealth(), listSalesKnowledge()]);
      setSalesHealth(health.item as SalesHealth);
      setKnowledgeItems(knowledge.items ?? []);
      setKnowledgeState(null);
    } catch (error) {
      setKnowledgeState({ level: "error", text: error instanceof Error ? error.message : "Knowledge verisi alınamadı." });
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const handleSubmit = async (prompt: string) => {
    const chat = await runAiChat(prompt);
    setData((previous) => ({ ...previous, messages: [...previous.messages, ...chat.messages] }));
    setChatStatus({ provider: chat.provider, mode: chat.mode });
    if (chat.requiresProposal) {
      await createAiProposal({ prompt, inputMode: mode === "voice" ? "voice" : "text" });
    }
    await reload();
  };

  const handleConfirm = async (id: string) => {
    await confirmAiProposal(id);
    await reload();
  };

  const handleReject = async (id: string) => {
    await rejectAiProposal(id);
    await reload();
  };

  const handleVoice = async () => {
    await speakAiText({ text: "Sesli yanıt testi." });
  };

  const handleSalesChat = async (prompt?: string) => {
    const nextPrompt = (prompt ?? salesPrompt).trim();
    if (!nextPrompt) return;
    setSalesPrompt(nextPrompt);
    const [intent, response] = await Promise.all([
      classifySalesIntent({ message: nextPrompt }),
      chatSalesAssistant({ message: nextPrompt, channel: "web" })
    ]);
    setSalesIntent(intent.item);
    setSalesChatResult(response.item as SalesChatResult);
  };

  const handleVoiceTranscribe = async () => {
    const response = await transcribeSalesVoice({
      audioBase64: typeof window !== "undefined" ? window.btoa("demo") : "ZGVtbw==",
      mimeType: "audio/webm",
      language: "tr"
    });
    setVoiceState({ transcript: response.item.transcript, reason: response.item.reason });
  };

  const handleVoiceSpeak = async () => {
    const response = await speakSalesVoice({ text: salesChatResult?.reply || "Merhaba, nasıl yardımcı olabilirim?" });
    setVoiceState((previous) => ({
      ...(previous ?? {}),
      speakStatus: response.item.status,
      reason: response.item.reason
    }));
  };

  const resetKnowledgeForm = () => {
    setKnowledgeForm(initialKnowledgeForm);
  };

  const saveKnowledge = async () => {
    if (!knowledgeForm.productName.trim()) {
      setKnowledgeState({ level: "error", text: "Ürün adı zorunludur." });
      return;
    }
    const payload = buildKnowledgePayload(knowledgeForm);
    try {
      if (knowledgeForm.id) {
        await updateSalesKnowledge(knowledgeForm.id, payload);
        setKnowledgeState({ level: "info", text: "Bilgi kaydı güncellendi." });
      } else {
        await createSalesKnowledge(payload);
        setKnowledgeState({ level: "info", text: "Bilgi kaydı oluşturuldu." });
      }
      resetKnowledgeForm();
      await reload();
    } catch (error) {
      setKnowledgeState({ level: "error", text: error instanceof Error ? error.message : "Bilgi kaydı kaydedilemedi." });
    }
  };

  const deleteKnowledge = async (id: string) => {
    try {
      await removeSalesKnowledge(id);
      setKnowledgeState({ level: "info", text: "Bilgi kaydı silindi." });
      await reload();
    } catch (error) {
      setKnowledgeState({ level: "error", text: error instanceof Error ? error.message : "Bilgi kaydı silinemedi." });
    }
  };

  const voiceInfo = [
    voiceState?.transcript ? `transcript=${voiceState.transcript}` : "",
    voiceState?.speakStatus ? `tts=${voiceState.speakStatus}` : "",
    voiceState?.reason ? `reason=${voiceState.reason}` : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="hz-page-stack">
      <PageHeader title="AI" description="Lokal satış asistanı: niyet analizi, bilgi tabanı ve güvenli onay akışı." />
      <section className="hz-metric-grid">
        <MetricCard title="Proposal" value={String(data.proposals.length)} detail="AI önerisi" tone="info" />
        <MetricCard title="Onay Bekleyen" value={String(data.approvals.length)} detail="Mutation guard" tone="warning" />
        <MetricCard title="Insight" value={String(data.insights.length)} detail="Dashboard uyumlu" tone="success" />
        <MetricCard title="Knowledge" value={String(knowledgeItems.length)} detail="Tenant kayıt" tone="info" />
      </section>

      <PrimaryActionToolbar>
        <button type="button" className="hz-btn hz-toolbar-btn hz-btn-primary" onClick={() => void runAiInsights().then(reload)}>
          Insight Üret
        </button>
        <button type="button" className="hz-btn hz-toolbar-btn hz-btn-secondary" onClick={() => void handleSalesChat("Alpha Pompa hakkında ürün bilgisi ver")}>Ürün bilgisi sor</button>
        <button type="button" className="hz-btn hz-toolbar-btn hz-btn-secondary" onClick={() => void handleSalesChat("Alpha Pompa fiyatı nedir")}>Fiyat sor</button>
        <button type="button" className="hz-btn hz-toolbar-btn hz-btn-secondary" onClick={() => void handleSalesChat("Alpha Pompa stokta var mı")}>Stok sor</button>
        <button type="button" className="hz-btn hz-toolbar-btn hz-btn-secondary" onClick={() => void handleSalesChat("Bu ürün için teklif hazırlayalım")}>Teklif iste</button>
        <AiModeToggle />
        {chatStatus ? <span className="hz-badge hz-badge-info">{`Aktif Provider: ${chatStatus.provider} (${chatStatus.mode})`}</span> : null}
      </PrimaryActionToolbar>

      <section className="hz-content-card">
        <h3>Satış Asistanı Sağlık Durumu</h3>
        <p className="hz-content-card-description">{healthSummary}</p>
        {salesHealth ? (
          <div className="hz-inline-actions" style={{ flexWrap: "wrap", gap: "8px" }}>
            <span className={`hz-badge ${statusBadge(salesHealth.status)}`}>{`Model Durumu: ${salesHealth.status}`}</span>
            <span className="hz-badge hz-badge-info">{`Primary hazır: ${salesHealth.modelReady ? "evet" : "hayır"}`}</span>
            <span className="hz-badge hz-badge-info">{`Fallback hazır: ${salesHealth.fallbackReady ? "evet" : "hayır"}`}</span>
            <span className={`hz-badge ${statusBadge(salesHealth.localService?.status ?? "degraded")}`}>{`Local service: ${salesHealth.localService?.status ?? "degraded"}`}</span>
            <span className={`hz-badge ${statusBadge(salesHealth.voice?.status ?? "degraded")}`}>{`Voice: ${salesHealth.voice?.status ?? "degraded"}`}</span>
          </div>
        ) : null}
      </section>

      <section className="hz-content-card">
        <h3>Satış Asistanı Chat</h3>
        <p className="hz-content-card-description">Cevaplar sistem verisine dayanır. Kritik işlemler canlı çalıştırılmaz, yalnızca suggestedActions döner.</p>
        <div className="hz-chat-composer">
          <input className="hz-control" value={salesPrompt} onChange={(event) => setSalesPrompt(event.target.value)} placeholder="Müşteri niyet mesajı yazın" />
          <button type="button" className="hz-btn hz-btn-primary" onClick={() => void handleSalesChat()}>
            Satış Yanıtı Üret
          </button>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={() => void handleVoiceTranscribe()}>
            Ses › Metin
          </button>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={() => void handleVoiceSpeak()}>
            Metin › Ses
          </button>
        </div>
        {salesIntent ? <p className="hz-content-card-description">{`Intent: ${salesIntent.intent} (güven ${salesIntent.confidence.toFixed(2)})`}</p> : null}
        {salesChatResult ? (
          <>
            <p>{salesChatResult.reply}</p>
            <div className="hz-inline-actions" style={{ flexWrap: "wrap", gap: "8px" }}>
              <span className={`hz-badge ${statusBadge(salesChatResult.status)}`}>{`Yanıt durumu: ${salesChatResult.status}`}</span>
              <span className="hz-badge hz-badge-info">{`Model: ${salesChatResult.provider.effectiveModel ?? salesChatResult.provider.model}`}</span>
              <span className="hz-badge hz-badge-warning">mutationExecuted: false</span>
              <span className="hz-badge hz-badge-warning">externalProviderCallExecuted: false</span>
            </div>
            {salesChatResult.usedSources.length > 0 ? (
              <ul className="hz-content-card-description" style={{ marginTop: "8px" }}>
                {salesChatResult.usedSources.map((source) => (
                  <li key={source.id}>{`${source.title} (${source.type})`}</li>
                ))}
              </ul>
            ) : (
              <p className="hz-content-card-description">Grounding source bulunamadıysa asistan güvenli yanıt verir.</p>
            )}
            {salesChatResult.suggestedActions.length > 0 ? (
              <ul className="hz-content-card-description" style={{ marginTop: "8px" }}>
                {salesChatResult.suggestedActions.map((action) => (
                  <li key={action.actionKey}>{`${action.label} [${action.actionKey}]`}</li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <p className="hz-content-card-description">Chat sonucu burada görünecek.</p>
        )}
        {voiceInfo ? <p className="hz-content-card-description">{`Voice: ${voiceInfo}`}</p> : null}
      </section>

      <section className="hz-content-card">
        <h3>Satış Bilgi Tabanı</h3>
        <p className="hz-content-card-description">Bu bilgiler tenant-scoped saklanır. “Bu bilgilerle asistanı dene” ile anlık prompt üretebilirsiniz.</p>
        {knowledgeState ? <p className={`hz-content-card-description ${knowledgeState.level === "error" ? "text-red-600" : "text-green-700"}`}>{knowledgeState.text}</p> : null}
        <div className="task-center-filter-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <label>Ürün adı<input className="hz-control" value={knowledgeForm.productName} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, productName: event.target.value }))} /></label>
          <label>Ürün ID<input className="hz-control" value={knowledgeForm.productId} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, productId: event.target.value }))} /></label>
          <label>Kategori<input className="hz-control" value={knowledgeForm.category} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, category: event.target.value }))} /></label>
          <label>Açıklama<input className="hz-control" value={knowledgeForm.description} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, description: event.target.value }))} /></label>
          <label>Satış notu<input className="hz-control" value={knowledgeForm.salesNotes} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, salesNotes: event.target.value }))} /></label>
          <label>İzinli iddialar (virgül)<input className="hz-control" value={knowledgeForm.allowedClaims} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, allowedClaims: event.target.value }))} /></label>
          <label>Yasak iddialar (virgül)<input className="hz-control" value={knowledgeForm.blockedClaims} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, blockedClaims: event.target.value }))} /></label>
          <label>FAQ snippet (virgül)<input className="hz-control" value={knowledgeForm.faqSnippets} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, faqSnippets: event.target.value }))} /></label>
          <label>Döküman referans (virgül)<input className="hz-control" value={knowledgeForm.selectedDocuments} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, selectedDocuments: event.target.value }))} /></label>
          <label>
            Fiyat görünürlüğü
            <select className="hz-control" value={knowledgeForm.priceVisibility} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, priceVisibility: event.target.value as "visible" | "hidden" }))}>
              <option value="hidden">hidden</option>
              <option value="visible">visible</option>
            </select>
          </label>
          <label>
            Stok görünürlüğü
            <select className="hz-control" value={knowledgeForm.stockVisibility} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, stockVisibility: event.target.value as "visible" | "hidden" }))}>
              <option value="hidden">hidden</option>
              <option value="visible">visible</option>
            </select>
          </label>
        </div>
        <div className="hz-inline-actions" style={{ marginTop: "12px" }}>
          <button type="button" className="hz-btn hz-btn-primary" onClick={() => void saveKnowledge()}>{knowledgeForm.id ? "Kaydı Güncelle" : "Yeni Kayıt Ekle"}</button>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={resetKnowledgeForm}>Formu Temizle</button>
        </div>

        <div className="table-wrap hz-table-wrap" style={{ marginTop: "14px" }}>
          <table className="table hz-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Kategori</th>
                <th>Fiyat</th>
                <th>Stok</th>
                <th>Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {knowledgeItems.length === 0 ? (
                <tr>
                  <td colSpan={5}>Kayıt bulunamadı. Repo unavailable ise API 503/degraded döner.</td>
                </tr>
              ) : (
                knowledgeItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.category ?? "-"}</td>
                    <td>{item.priceVisibility}</td>
                    <td>{item.stockVisibility}</td>
                    <td>
                      <div className="hz-inline-actions">
                        <button type="button" className="hz-btn hz-btn-secondary" onClick={() => setKnowledgeForm(toForm(item))}>Düzenle</button>
                        <button type="button" className="hz-btn hz-btn-secondary" onClick={() => void deleteKnowledge(item.id)}>Sil</button>
                        <button type="button" className="hz-btn hz-btn-secondary" onClick={() => void handleSalesChat(`${item.productName} hakkında ürün bilgisi ver`)}>
                          Bu bilgilerle asistanı dene
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <TabSwitcher activeKey={mode} onChange={setMode} items={[{ key: "text", label: "Yazılı Giriş" }, { key: "voice", label: "Sesli Giriş" }]} />

      <section className="hz-ai-layout">
        <article className="hz-column-card">
          <h3 className="hz-column-title">AI Asistan Akışı</h3>
          <div className="hz-chat-feed">
            {data.messages.map((message) => (
              <div key={message.id} className={`hz-chat-bubble ${message.role === "user" ? "is-outgoing" : ""}`}>
                <p>{message.body}</p>
                <small>{message.inputMode}</small>
              </div>
            ))}
          </div>
          <AiInputPanel onSubmit={(prompt) => void handleSubmit(prompt)} onVoice={handleVoice} />
        </article>
        <article className="hz-column-card">
          <AiProposalCardList proposals={data.proposals} onConfirm={(id) => void handleConfirm(id)} onReject={(id) => void handleReject(id)} />
          <AiContextSidePanel approvals={data.approvals} insights={data.insights} />
        </article>
      </section>
    </div>
  );
}

