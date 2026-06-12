"use client";

import type { AiInsight, AiMessage, AiProposal, Approval } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../../providers/toast-provider";
import { getAiAssistantData, getAiSettingsData, getSalesAssistantHealth } from "../queries";
import { formatUserFacingHealthStatus } from "../../../lib/user-facing-labels";
import { buildAiProposalSnapshotJson } from "../utils/ai-proposal-snapshot";

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
};

function statusBadge(status: string): string {
  if (status === "healthy" || status === "live") return "aif-badge--success";
  if (status === "degraded") return "aif-badge--warn";
  return "aif-badge--danger";
}

export function AiProposalCardList({
  proposals,
  selectedId,
  onSelect,
  onConfirm,
  onReject
}: {
  proposals: AiProposal[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  return (
    <section className="aif-card">
      <header className="erpf-section-head">
        <h2>Öneri kuyruğu</h2>
        <span className="aif-badge aif-badge--info">{proposals.length} kayıt</span>
      </header>
      <div className="aif-queue">
        {proposals.length === 0 ? (
          <p className="erpf-side-note" style={{ padding: "8px 12px" }}>
            Canlı yapay zekâ önerisi bekleniyor.
          </p>
        ) : (
          proposals.map((proposal) => (
            <article
              key={proposal.id}
              className={`aif-card aif-proposal-card${selectedId === proposal.id ? " is-selected" : ""}`}
              onClick={() => onSelect?.(proposal.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onSelect?.(proposal.id);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="aif-proposal-card__head">
                <h3 className="aif-proposal-card__title">
                  {proposal.proposalNo} · {proposal.actionType}
                </h3>
                <span className={`aif-badge ${proposal.requiresApproval ? "aif-badge--warn" : "aif-badge--success"}`}>
                  {statusLabel[proposal.status]}
                </span>
              </div>
              <p className="aif-proposal-card__summary">{proposal.summary}</p>
              <div className="aif-proposal-card__actions">
                {proposal.requiresApproval ? (
                  <>
                    <button
                      className="aif-btn aif-btn--primary"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onConfirm?.(proposal.id);
                      }}
                    >
                      Onayla
                    </button>
                    <button
                      className="aif-btn aif-btn--danger"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onReject?.(proposal.id);
                      }}
                    >
                      Reddet
                    </button>
                  </>
                ) : (
                  <span className="aif-badge aif-badge--success">Salt okunur</span>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function AiRecentOpsList({ messages, executions }: { messages: AiMessage[]; executions: unknown[] }) {
  return (
    <section className="aif-card">
      <header className="erpf-section-head">
        <h2>Son yapay zekâ işlemleri</h2>
      </header>
      <ul className="aif-ops-list">
        {messages.length === 0 && executions.length === 0 ? (
          <li>
            <span>Henüz işlem kaydı yok.</span>
          </li>
        ) : (
          <>
            {messages.slice(-4).map((message) => (
              <li key={message.id}>
                <strong>{message.role === "user" ? "Kullanıcı" : "Asistan"}</strong>
                <span>{message.body}</span>
              </li>
            ))}
            {executions.length > 0 ? (
              <li>
                <strong>Yetkili icra</strong>
                <span>{executions.length} kayıt bağlı</span>
              </li>
            ) : null}
          </>
        )}
      </ul>
    </section>
  );
}

function AiModelConnectionCard({ health }: { health: SalesHealth | null }) {
  return (
    <section className="aif-card aif-model-card">
      <header className="erpf-section-head">
        <h2>Model bağlantısı</h2>
      </header>
      {!health ? (
        <p className="erpf-side-note" style={{ padding: "0 12px 10px" }}>
          Lokal AI durumu yükleniyor...
        </p>
      ) : (
        <div style={{ padding: "0 12px 10px" }}>
          <p className="erpf-side-note">
            {health.status === "not_configured" || health.status === "blocked"
              ? "Yerel yapay zekâ yapılandırılmadı. Ortam değişkeni ile uç adres tanımlandığında durum güncellenir."
              : health.status === "degraded"
                ? "Yerel yapay zekâ uç noktasına ulaşılamıyor veya model hazır değil."
                : `Yerel yapay zekâ hazır. Model: ${health.model}`}
          </p>
          <div className="aif-model-row">
            <span className={`aif-badge ${statusBadge(health.status)}`}>{health.status}</span>
            <span className="aif-badge aif-badge--info">Birincil: {health.modelReady ? "hazır" : "değil"}</span>
            <span className="aif-badge aif-badge--info">Yedek: {health.fallbackReady ? "hazır" : "değil"}</span>
          </div>
        </div>
      )}
    </section>
  );
}

function AiUsageSummary({
  proposals,
  approvals,
  insights
}: {
  proposals: AiProposal[];
  approvals: Approval[];
  insights: AiInsight[];
}) {
  return (
    <section className="aif-card">
      <header className="erpf-section-head">
        <h2>Kullanım özeti</h2>
      </header>
      <div className="aif-usage-grid">
        <div className="aif-usage-item">
          <span>Öneri</span>
          <strong>{proposals.length}</strong>
        </div>
        <div className="aif-usage-item">
          <span>Onay bekleyen</span>
          <strong>{approvals.length}</strong>
        </div>
        <div className="aif-usage-item">
          <span>İçgörü</span>
          <strong>{insights.length}</strong>
        </div>
      </div>
    </section>
  );
}

function AiRiskSidePanel({ insights, settings }: { insights: AiInsight[]; settings: ReturnType<typeof getAiSettingsData> }) {
  const critical = insights.filter((insight) => insight.severity === "critical");

  return (
    <>
      <section className="aif-card aif-side-card">
        <h3>Risk ve uyarılar</h3>
        {critical.length === 0 ? (
          <p className="erpf-side-note">Kritik içgörü sinyali yok.</p>
        ) : (
          <ul className="aif-risk-list">
            {critical.slice(0, 4).map((insight) => (
              <li key={insight.id}>{insight.title}</li>
            ))}
          </ul>
        )}
        <p className="erpf-side-note">Yapay zekâ kritik değişiklik işlemlerini çalıştırmaz; yalnızca öneri üretir.</p>
      </section>
      <section className="aif-card aif-side-card">
        <h3>Yapay zekâ ayarları</h3>
        <ul className="aif-settings-list">
          <li>
            <span>Salt okunur varsayılan</span>
            <strong>{settings.readOnlyDefault ? "Evet" : "Hayır"}</strong>
          </li>
          <li>
            <span>Mutation için onay</span>
            <strong>{settings.approvalRequiredForMutations ? "Zorunlu" : "Kapalı"}</strong>
          </li>
          <li>
            <span>Sesli giriş</span>
            <strong>{settings.voiceEnabled ? "Açık" : "Kapalı"}</strong>
          </li>
          <li>
            <span>İçgörü sıklığı</span>
            <strong>{settings.insightFrequency}</strong>
          </li>
          <li>
            <span>Lokal ajan</span>
            <strong>{settings.localAgentStatus}</strong>
          </li>
        </ul>
      </section>
      {insights[0] ? (
        <section className="aif-card aif-side-card">
          <h3>Seçili içgörü</h3>
          <p className="erpf-side-note">{insights[0].summary}</p>
          <span className="aif-badge aif-badge--warn">{insights[0].category}</span>
        </section>
      ) : null}
    </>
  );
}

export function AIAssistantPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [data, setData] = useState<{
    messages: AiMessage[];
    proposals: AiProposal[];
    approvals: Approval[];
    executions: unknown[];
    insights: AiInsight[];
  }>({
    messages: [],
    proposals: [],
    approvals: [],
    executions: [],
    insights: []
  });
  const [salesHealth, setSalesHealth] = useState<SalesHealth | null>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const settings = useMemo(() => getAiSettingsData(), []);

  useEffect(() => {
    void getAiAssistantData().then((next) => {
      setData(next);
      setSelectedProposalId(next.proposals[0]?.id ?? null);
    });
    void getSalesAssistantHealth().then((response) => setSalesHealth(response.item as SalesHealth));
  }, []);

  const selectedProposal = useMemo(
    () => data.proposals.find((proposal) => proposal.id === selectedProposalId) ?? data.proposals[0],
    [data.proposals, selectedProposalId]
  );

  return (
    <div className="aif-page">
      <p className="aif-demo-band" role="status">
        Yapay Zekâ Operasyon Merkezi: motor öneri/onay modunda çalışır; kritik değişiklikler doğrudan icra edilmez.
      </p>

      <div className="aif-layout">
        <div className="aif-main">
          <header className="aif-card aif-topbar">
            <div>
              <p className="aif-topbar__eyebrow">Yapay zekâ yönetimi</p>
              <h1 className="aif-topbar__title">Yapay Zekâ Yönetim Merkezi</h1>
              <p className="aif-topbar__sub aif-topbar__sub--mgmt">
                Operasyon önerileri, onay kuyruğu ve model durumu. Günlük asistan etkileşimi Gösterge Paneli üzerinden yürütülür.
              </p>
            </div>
            <div className="aif-topbar__actions">
              <button
                className="aif-btn aif-btn--primary aif-btn--pending"
                type="button"
                disabled
                title="İçgörü üretimi API bağlandığında etkinleşir"
              >
                İçgörü üret
              </button>
              <button
                className="aif-btn aif-btn--ghost"
                type="button"
                onClick={() => router.push("/ai/onaylar")}
              >
                Onay kuyruğu
              </button>
            </div>
          </header>

          <div className="aif-kpi-strip" aria-label="Yapay zekâ durum kartları">
            <article className="aif-card aif-kpi">
              <span className="aif-kpi__label">Model</span>
              <span className="aif-kpi__value">{salesHealth ? formatUserFacingHealthStatus(salesHealth.status) : "—"}</span>
            </article>
            <article className="aif-card aif-kpi aif-kpi--warn">
              <span className="aif-kpi__label">Onay bekleyen</span>
              <span className="aif-kpi__value">{data.approvals.length}</span>
            </article>
            <article className="aif-card aif-kpi aif-kpi--success">
              <span className="aif-kpi__label">İçgörü</span>
              <span className="aif-kpi__value">{data.insights.length}</span>
            </article>
            <article className="aif-card aif-kpi">
              <span className="aif-kpi__label">Öneri</span>
              <span className="aif-kpi__value">{data.proposals.length}</span>
            </article>
          </div>

          <nav className="aif-nav-row" aria-label="Yapay zekâ modülleri">
            <button type="button" className="aif-nav-chip" onClick={() => router.push("/ai/onaylar")}>
              Yapay Zekâ Onayları
            </button>
            <button type="button" className="aif-nav-chip" onClick={() => router.push("/ai/icgoruler")}>
              Yapay Zekâ İçgörüleri
            </button>
            <button type="button" className="aif-nav-chip" onClick={() => router.push("/onaylar")}>
              Merkezi Onaylar
            </button>
            <button type="button" className="aif-nav-chip" onClick={() => router.push("/ayarlar")}>
              Yapay Zekâ Ayarları
            </button>
          </nav>

          <div className="aif-body">
            <div className="aif-scroll">
              <AiUsageSummary proposals={data.proposals} approvals={data.approvals} insights={data.insights} />
              <AiModelConnectionCard health={salesHealth} />
              <AiProposalCardList
                proposals={data.proposals}
                selectedId={selectedProposalId}
                onSelect={setSelectedProposalId}
                onConfirm={() => pushToast("Onay işlemi demo modda toast-only çalışır; merkezi onay ekranından yürütülür.")}
                onReject={() => pushToast("Red işlemi demo modda toast-only çalışır.")}
              />
              <AiRecentOpsList messages={data.messages} executions={data.executions} />
              {selectedProposal ? (
                <section className="aif-card aif-side-card">
                  <h3>Seçili öneri özeti</h3>
                  <p className="erpf-side-note">{selectedProposal.summary}</p>
                  <details>
                    <summary>Proposal snapshot (salt okunur)</summary>
                    <pre style={{ fontSize: 10, overflow: "auto", maxHeight: 120 }}>{buildAiProposalSnapshotJson(selectedProposal)}</pre>
                  </details>
                </section>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="aif-side">
          <AiRiskSidePanel insights={data.insights} settings={settings} />
        </aside>
      </div>
    </div>
  );
}
