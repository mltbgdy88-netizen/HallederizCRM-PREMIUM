"use client";

import type { AiInsight, AiProposal, Approval } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useToast } from "../../../providers/toast-provider";
import { buildAiProposalSnapshotJson } from "../utils/ai-proposal-snapshot";
import { useAiAssistantData } from "../hooks/use-ai-assistant-data";
import { useLocalAiChannel } from "../hooks/use-local-ai-channel";
import { LocalAiChannelBand } from "./LocalAiChannelBand";
import { confirmAiProposalMutation, rejectAiProposalMutation, runAiInsightsMutation } from "../mutations";

const proposalStatusLabel: Record<AiProposal["status"], string> = {
  draft: "Taslak",
  waiting_approval: "Onay bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  executed: "İcra edildi",
  failed: "Hata"
};

function severityBadge(severity: AiInsight["severity"]): string {
  return severity === "critical" ? "aif-badge--danger" : "aif-badge--warn";
}

export function AiApprovalsPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const channel = useLocalAiChannel();
  const assistant = useAiAssistantData();
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  const data = assistant.data ?? { proposals: [] as AiProposal[], approvals: [] as Approval[], executions: [] as unknown[] };

  const selectedProposal = useMemo(() => {
    const fallbackId = data.proposals[0]?.id ?? null;
    const activeId = selectedProposalId ?? fallbackId;
    return data.proposals.find((proposal) => proposal.id === activeId) ?? data.proposals[0];
  }, [data.proposals, selectedProposalId]);

  const linkedApproval = useMemo(() => {
    if (!selectedProposal?.approvalId) return data.approvals[0];
    return data.approvals.find((approval) => approval.id === selectedProposal.approvalId) ?? data.approvals[0];
  }, [selectedProposal, data.approvals]);

  const waitingCount = data.proposals.filter((proposal) => proposal.status === "waiting_approval").length;

  const handleConfirmProposal = async (id: string) => {
    const updated = await confirmAiProposalMutation(id, { useDemoData: assistant.useDemo, pushToast });
    if (updated || assistant.useDemo) {
      await assistant.refresh();
    }
  };

  const handleRejectProposal = async (id: string) => {
    const updated = await rejectAiProposalMutation(id, { useDemoData: assistant.useDemo, pushToast });
    if (updated || assistant.useDemo) {
      await assistant.refresh();
    }
  };

  return (
    <div className="aif-page aif-page--approvals">
      {assistant.useDemo ? (
        <p className="aif-demo-band" role="status">
          Yapay zekâ onay kuyruğu: onay ve icra merkezi onay ekranından yürütülür; bu ekran inceleme ve yalnızca bilgi aksiyonu içindir.
        </p>
      ) : (
        <LocalAiChannelBand channelView={channel.channelView} />
      )}

      <div className="aif-layout">
        <div className="aif-main">
          <header className="aif-card aif-topbar">
            <div>
              <p className="aif-topbar__eyebrow">Yapay zekâ onayı</p>
              <h1 className="aif-topbar__title">Yapay Zekâ Onay Kuyruğu</h1>
              <p className="aif-topbar__sub">Değişiklik önerileri onay zincirine yönlendirilir; doğrudan icra yok.</p>
            </div>
            <div className="aif-topbar__actions">
              <button className="aif-btn aif-btn--ghost" type="button" onClick={() => router.push("/ai")}>
                Yapay zekâ merkezine dön
              </button>
              <button
                className="aif-btn aif-btn--primary"
                type="button"
                onClick={() => router.push(linkedApproval?.id ? `/onaylar/${encodeURIComponent(linkedApproval.id)}` : "/onaylar")}
              >
                Merkezi onaya git
              </button>
            </div>
          </header>

          <div className="aif-kpi-strip" aria-label="Onay özetleri">
            <article className="aif-card aif-kpi">
              <span className="aif-kpi__label">Toplam öneri</span>
              <span className="aif-kpi__value">{data.proposals.length}</span>
            </article>
            <article className="aif-card aif-kpi aif-kpi--warn">
              <span className="aif-kpi__label">Onay bekleyen</span>
              <span className="aif-kpi__value">{waitingCount}</span>
            </article>
            <article className="aif-card aif-kpi aif-kpi--success">
              <span className="aif-kpi__label">Bağlı onay</span>
              <span className="aif-kpi__value">{data.approvals.length}</span>
            </article>
            <article className="aif-card aif-kpi">
              <span className="aif-kpi__label">Yetkili icra</span>
              <span className="aif-kpi__value">{data.executions.length}</span>
            </article>
          </div>

          <div className="aif-card aif-filter">
            <label className="aif-field">
              <span>Öneri no</span>
              <input placeholder="AI-0001" readOnly aria-readonly="true" />
            </label>
            <label className="aif-field">
              <span>Durum</span>
              <select defaultValue="" disabled aria-disabled="true">
                <option value="">Tüm durumlar</option>
                <option>Bekliyor</option>
                <option>Onaylandı</option>
              </select>
            </label>
            <label className="aif-field">
              <span>Aksiyon tipi</span>
              <select defaultValue="" disabled aria-disabled="true">
                <option value="">Tüm aksiyonlar</option>
                <option>create_offer</option>
                <option>send_document_whatsapp</option>
              </select>
            </label>
            <label className="aif-field">
              <span>İsteyen</span>
              <input placeholder="Operatör" readOnly aria-readonly="true" />
            </label>
            <div className="aif-filter__actions">
              <button
                className="aif-btn aif-btn--ghost"
                type="button"
                title="Filtreleri sıfırla"
                aria-label="Filtreleri sıfırla"
                onClick={() => pushToast("Filtreler canlı API sorgusuna bağlandığında aktif olacaktır.")}
              >
                Sıfırla
              </button>
            </div>
          </div>

          <div className="aif-body">
            <div className="aif-scroll">
              <section className="aif-card">
                <header className="erpf-section-head">
                  <h2>Öneri kartları</h2>
                </header>
                <div className="aif-queue">
                  {data.proposals.length === 0 ? (
                    <p className="erpf-side-note" style={{ padding: "8px 12px" }}>
                      Canlı yapay zekâ önerisi bekleniyor.
                    </p>
                  ) : (
                    data.proposals.map((proposal) => (
                      <article
                        key={proposal.id}
                        className={`aif-card aif-proposal-card${proposal.id === selectedProposal?.id ? " is-selected" : ""}`}
                        onClick={() => setSelectedProposalId(proposal.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") setSelectedProposalId(proposal.id);
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="aif-proposal-card__head">
                          <h3 className="aif-proposal-card__title">
                            {proposal.proposalNo} · {proposal.actionType}
                          </h3>
                          <span className={`aif-badge ${proposal.requiresApproval ? "aif-badge--warn" : "aif-badge--success"}`}>
                            {proposalStatusLabel[proposal.status]}
                          </span>
                        </div>
                        <p className="aif-proposal-card__summary">{proposal.summary}</p>
                        <p className="erpf-side-note">
                          {proposal.requestedByName} · {proposal.targetNo} ·{" "}
                          {new Date(proposal.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                        <div className="aif-proposal-card__actions">
                          <button
                            className="aif-btn aif-btn--primary"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleConfirmProposal(proposal.id);
                            }}
                          >
                            Onayla
                          </button>
                          <button
                            className="aif-btn aif-btn--danger"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleRejectProposal(proposal.id);
                            }}
                          >
                            Reddet
                          </button>
                          <button
                            className="aif-btn aif-btn--ghost"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              router.push(
                                proposal.approvalId
                                  ? `/onaylar/${encodeURIComponent(proposal.approvalId)}`
                                  : "/onaylar"
                              );
                            }}
                          >
                            Onay ekranı
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        <aside className="aif-side">
          <section className="aif-card aif-side-card">
            <h3>Seçili öneri</h3>
            <p className="erpf-side-note">{selectedProposal?.summary ?? "Öneri seçildiğinde özet burada görünür."}</p>
            {selectedProposal ? (
              <>
                <ul className="aif-settings-list">
                  <li>
                    <span>Öneri no</span>
                    <strong>{selectedProposal.proposalNo}</strong>
                  </li>
                  <li>
                    <span>Aksiyon</span>
                    <strong>{selectedProposal.actionType}</strong>
                  </li>
                  <li>
                    <span>Onay gerekli</span>
                    <strong>{selectedProposal.requiresApproval ? "Evet" : "Hayır"}</strong>
                  </li>
                </ul>
                <details style={{ marginTop: 8 }}>
                  <summary>Öneri özeti (salt okunur)</summary>
                  <pre style={{ fontSize: 10, overflow: "auto", maxHeight: 140 }}>{buildAiProposalSnapshotJson(selectedProposal)}</pre>
                </details>
              </>
            ) : null}
          </section>
          <section className="aif-card aif-side-card">
            <h3>Bağlı onay</h3>
            <p className="erpf-side-note">{linkedApproval?.payloadSummary ?? "Bağlı onay kaydı yok."}</p>
            {linkedApproval ? (
              <button
                className="aif-btn aif-btn--primary"
                type="button"
                onClick={() => router.push(`/onaylar/${encodeURIComponent(linkedApproval.id)}`)}
              >
                {linkedApproval.approvalNo}
              </button>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}

export function AiInsightsPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const channel = useLocalAiChannel();
  const assistant = useAiAssistantData();
  const [insightsRunning, setInsightsRunning] = useState(false);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);

  const insights = assistant.data?.insights ?? [];

  const selectedInsight = useMemo(() => {
    const fallbackId = insights[0]?.id ?? null;
    const activeId = selectedInsightId ?? fallbackId;
    return insights.find((insight) => insight.id === activeId) ?? insights[0];
  }, [insights, selectedInsightId]);

  const criticalCount = insights.filter((insight) => insight.severity === "critical").length;

  const handleRefreshInsights = async () => {
    if (!channel.canRunInsights || insightsRunning) return;
    setInsightsRunning(true);
    const items = await runAiInsightsMutation({ useDemoData: assistant.useDemo, pushToast });
    if (items) {
      await assistant.refresh();
      setSelectedInsightId(items[0]?.id ?? null);
    }
    setInsightsRunning(false);
  };

  return (
    <div className="aif-page aif-page--insights">
      {assistant.useDemo ? (
        <p className="aif-demo-band" role="status">
          Yapay zekâ içgörüleri salt okunur öneri üretir; canlı değişiklik bu ekrandan yapılmaz.
        </p>
      ) : (
        <LocalAiChannelBand channelView={channel.channelView} />
      )}

      <div className="aif-layout">
        <div className="aif-main">
          <header className="aif-card aif-topbar">
            <div>
              <p className="aif-topbar__eyebrow">Yapay zekâ içgörüsü</p>
              <h1 className="aif-topbar__title">Yapay Zekâ İçgörü Paneli</h1>
              <p className="aif-topbar__sub">Risk, fırsat ve operasyon sinyalleri yerel öncelikli analiz katmanından gelir.</p>
            </div>
            <div className="aif-topbar__actions">
              <button className="aif-btn aif-btn--ghost" type="button" onClick={() => router.push("/ai")}>
                Yapay zekâ merkezine dön
              </button>
              <button
                className="aif-btn aif-btn--primary"
                type="button"
                disabled={!channel.canRunInsights || insightsRunning || assistant.loading}
                title={channel.canRunInsights ? "Yerel model ile içgörüleri yenile" : channel.channelView.note}
                onClick={() => void handleRefreshInsights()}
              >
                {insightsRunning ? "Yenileniyor…" : "İçgörüleri yenile"}
              </button>
            </div>
          </header>

          <div className="aif-kpi-strip" aria-label="İçgörü özetleri">
            <article className="aif-card aif-kpi">
              <span className="aif-kpi__label">Toplam</span>
              <span className="aif-kpi__value">{insights.length}</span>
            </article>
            <article className="aif-card aif-kpi aif-kpi--danger">
              <span className="aif-kpi__label">Kritik</span>
              <span className="aif-kpi__value">{criticalCount}</span>
            </article>
            <article className="aif-card aif-kpi aif-kpi--warn">
              <span className="aif-kpi__label">Uyarı</span>
              <span className="aif-kpi__value">{insights.length - criticalCount}</span>
            </article>
            <article className="aif-card aif-kpi aif-kpi--success">
              <span className="aif-kpi__label">Güven ort.</span>
              <span className="aif-kpi__value">
                {insights.length
                  ? `%${Math.round((insights.reduce((sum, item) => sum + item.confidence, 0) / insights.length) * 100)}`
                  : "—"}
              </span>
            </article>
          </div>

          <div className="aif-card aif-filter">
            <label className="aif-field">
              <span>Modül</span>
              <select defaultValue="" disabled aria-disabled="true">
                <option value="">Tüm modüller</option>
                <option>Risk</option>
                <option>Stok</option>
                <option>Fabrika</option>
              </select>
            </label>
            <label className="aif-field">
              <span>Dönem</span>
              <select defaultValue="today" disabled aria-disabled="true">
                <option value="today">Bugün</option>
                <option value="week">Bu hafta</option>
              </select>
            </label>
            <label className="aif-field">
              <span>Önem</span>
              <select defaultValue="" disabled aria-disabled="true">
                <option value="">Tümü</option>
                <option value="critical">Kritik</option>
              </select>
            </label>
            <label className="aif-field aif-field">
              <span>Kritikler</span>
              <input type="checkbox" disabled aria-disabled="true" />
            </label>
            <div className="aif-filter__actions">
              <button
                className="aif-btn aif-btn--ghost"
                type="button"
                title="Filtreleri sıfırla"
                aria-label="Filtreleri sıfırla"
                onClick={() => pushToast("Filtreler canlı API sorgusuna bağlandığında aktif olacaktır.")}
              >
                Sıfırla
              </button>
            </div>
          </div>

          <div className="aif-body">
            <div className="aif-insight-grid">
              {insights.length === 0 ? (
                <section className="aif-card aif-side-card" role="status">
                  <p className="erpf-side-note">Yerel yapay zekâ yapılandırıldığında içgörüler burada görünecek.</p>
                </section>
              ) : (
                insights.map((insight) => (
                  <article
                    key={insight.id}
                    className={`aif-card aif-insight-card${insight.id === selectedInsight?.id ? " is-selected" : ""}`}
                    onClick={() => setSelectedInsightId(insight.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") setSelectedInsightId(insight.id);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <span className={`aif-badge ${severityBadge(insight.severity)}`}>{insight.category}</span>
                    <strong style={{ float: "right", fontSize: 11 }}>%{Math.round(insight.confidence * 100)}</strong>
                    <h3>{insight.title}</h3>
                    <p>{insight.summary}</p>
                    <button
                      className="aif-btn aif-btn--ghost"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        pushToast(`${insight.title} detayı salt okunur gösterilir.`);
                      }}
                    >
                      Detayı aç
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="aif-side">
          <section className="aif-card aif-side-card">
            <h3>İçgörü detayı</h3>
            <p className="erpf-side-note">{selectedInsight?.summary ?? "Seçili içgörü özeti burada görünür."}</p>
            {selectedInsight ? (
              <ul className="aif-settings-list">
                <li>
                  <span>Hedef</span>
                  <strong>{selectedInsight.targetNo}</strong>
                </li>
                <li>
                  <span>Önerilen aksiyon</span>
                  <strong>{selectedInsight.suggestedAction}</strong>
                </li>
                <li>
                  <span>Güven</span>
                  <strong>%{Math.round(selectedInsight.confidence * 100)}</strong>
                </li>
              </ul>
            ) : null}
            <p className="erpf-side-note">Öneri uygulanmadan önce operatör incelemesi gerekir.</p>
            <button
              className="aif-btn aif-btn--primary"
              type="button"
              onClick={() =>
                router.push(
                  selectedInsight?.targetType === "customer"
                    ? `/cariler/${selectedInsight.targetId}`
                    : selectedInsight?.targetType === "product"
                      ? "/stok"
                      : "/onaylar"
                )
              }
            >
              İlgili kaydı aç
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
