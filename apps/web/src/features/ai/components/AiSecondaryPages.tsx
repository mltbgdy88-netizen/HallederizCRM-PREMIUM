"use client";

import type { AiInsight, AiProposal, Approval } from "@hallederiz/types";
import { FilterActions, FilterBar, MetricCard, PageHeader, SplitContentLayout } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAiAssistantData } from "../queries";
import { buildAiProposalSnapshotJson } from "../utils/ai-proposal-snapshot";

const proposalStatusLabel: Record<AiProposal["status"], string> = {
  draft: "Taslak",
  waiting_approval: "Onay bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  executed: "İcra edildi",
  failed: "Hata"
};

export function AiApprovalFilterBar() {
  return (
    <FilterBar>
      <div className="task-center-filter-grid">
        <label>
          Öneri no
          <input placeholder="AI-0001" readOnly aria-readonly="true" />
        </label>
        <label>
          Durum
          <select defaultValue="" disabled aria-disabled="true">
            <option value="">Tüm durumlar</option>
            <option>Bekliyor</option>
            <option>Onaylandı</option>
          </select>
        </label>
        <label>
          Aksiyon tipi
          <select defaultValue="" disabled aria-disabled="true">
            <option value="">Tüm aksiyonlar</option>
            <option>create_offer</option>
            <option>send_document_whatsapp</option>
          </select>
        </label>
      </div>
      <FilterActions>
        <button type="button" className="hz-btn hz-btn-secondary" disabled title="Filtreler inceleme amaçlıdır">
          Filtreler (salt okunur)
        </button>
        <button type="button" className="reset-btn" disabled title="Temizle">
          Temizle
        </button>
      </FilterActions>
      <p className="muted">AI önerileri yalnız inceleme içindir; canlı işlem merkezi onay ekranından yürütülür.</p>
    </FilterBar>
  );
}

export function AiApprovalTable({ proposals, approvals }: { proposals: AiProposal[]; approvals: Approval[] }) {
  const router = useRouter();
  return (
    <section className="hz-content-card hz-ai-approval-table-wrap">
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>Öneri no</th>
              <th>Aksiyon</th>
              <th>Durum</th>
              <th>Onay gerekli</th>
              <th>İsteyen</th>
              <th>Hedef</th>
              <th>Tarih</th>
              <th>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <tr>
                <td colSpan={8}>Canlı AI önerisi bekleniyor. Öneri kaydı API bağlandığında listelenir.</td>
              </tr>
            ) : (
              proposals.map((proposal) => (
                <tr key={proposal.id}>
                  <td>{proposal.proposalNo}</td>
                  <td>{proposal.actionType}</td>
                  <td>{proposalStatusLabel[proposal.status] ?? proposal.status}</td>
                  <td>{proposal.requiresApproval ? "Evet" : "Hayır"}</td>
                  <td>{proposal.requestedByName}</td>
                  <td>{proposal.targetNo}</td>
                  <td>{new Date(proposal.createdAt).toLocaleDateString("tr-TR")}</td>
                  <td>
                    <button
                      className="hz-btn hz-btn-secondary"
                      type="button"
                      onClick={() =>
                        router.push(
                          proposal.approvalId
                            ? `/onaylar/${encodeURIComponent(proposal.approvalId)}`
                            : "/onaylar"
                        )
                      }
                    >
                      Onay ekranına git
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {approvals.length > 0 ? (
        <p className="muted">Bağlı onay kayıtları: {approvals.map((approval) => approval.approvalNo).join(", ")}</p>
      ) : null}
    </section>
  );
}

export function AiApprovalDetailDrawer({
  approval,
  proposal
}: {
  approval: Approval | undefined;
  proposal: AiProposal | undefined;
}) {
  const router = useRouter();
  return (
    <aside className="hz-side-panel hz-ai-approval-drawer">
      <p className="drawer-eyebrow">AI öneri detayı</p>
      <h3>{approval?.approvalNo ?? "Seçim yok"}</h3>
      <p className="muted">{approval?.payloadSummary ?? "Onay seçildiğinde özet burada görünür."}</p>
      {proposal ? (
        <>
          <p className="drawer-eyebrow">Bağlı öneri</p>
          <p className="muted">
            {proposal.proposalNo} —{" "}
            <span className={proposal.requiresApproval ? "hz-badge hz-badge-warning" : "hz-badge hz-badge-success"}>
              Onay gerekli: {proposal.requiresApproval ? "Evet" : "Hayır"}
            </span>
          </p>
          <details className="hz-ai-proposal-snapshot">
            <summary>Öneri özeti (salt okunur)</summary>
            <pre className="hz-ai-proposal-snapshot-pre">{buildAiProposalSnapshotJson(proposal)}</pre>
          </details>
        </>
      ) : (
        <p className="muted">Bağlı öneri bulunamadı.</p>
      )}
      <p className="hz-ai-review-note">Bu öneri uygulanmadan önce kullanıcı onayı gerektirir.</p>
      <div className="hz-inline-actions">
        <button
          className="hz-btn hz-btn-primary"
          type="button"
          onClick={() =>
            router.push(approval?.id ? `/onaylar/${encodeURIComponent(approval.id)}` : "/onaylar")
          }
        >
          Onay ekranına git
        </button>
        <button
          className="hz-btn hz-btn-secondary"
          type="button"
          onClick={() => router.push(proposal ? `/ai` : "/ai")}
        >
          Öneriyi incele
        </button>
      </div>
      <p className="muted">Canlı onay ve icra akışları merkezi onay ekranı ve API tarafında yönetilir.</p>
    </aside>
  );
}

function ApprovalCoveragePanel() {
  const rows = [
    { action: "create_offer", approval: "Evet", state: "Bağlı" },
    { action: "create_order", approval: "Evet", state: "Bağlı" },
    { action: "create_payment", approval: "Evet", state: "Bağlı" },
    { action: "mark_warehouse_ready", approval: "Evet", state: "Bağlı" },
    { action: "complete_delivery", approval: "Evet", state: "Bağlı" },
    { action: "create_invoice", approval: "Evet", state: "Bağlı" },
    { action: "create_return", approval: "Evet", state: "Bağlı" },
    { action: "send_document_whatsapp", approval: "Evet", state: "Bağlı" },
    { action: "queue_document_save", approval: "Evet", state: "Bağlı" },
    { action: "queue_document_print", approval: "Evet", state: "Bağlı" }
  ];

  return (
    <section className="hz-content-card">
      <h3>Onay kapsamı</h3>
      <p className="muted">Operatör modu aksiyonları onay zorunluluğu ile çalışır. Salt okunur yanıtlar onay gerektirmez.</p>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>Aksiyon</th>
              <th>Onay</th>
              <th>İcra</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.action}>
                <td>{row.action}</td>
                <td>
                  <span className="hz-badge hz-badge-warning">{row.approval}</span>
                </td>
                <td>
                  <span className="hz-badge hz-badge-success">{row.state}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AiApprovalsPage() {
  const [data, setData] = useState<{ proposals: AiProposal[]; approvals: Approval[]; executions: unknown[] }>({
    proposals: [],
    approvals: [],
    executions: []
  });

  useEffect(() => {
    void getAiAssistantData().then((next) =>
      setData({
        proposals: next.proposals,
        approvals: next.approvals,
        executions: next.executions
      })
    );
  }, []);

  const activeApproval = data.approvals[0];
  const linkedProposal = useMemo(() => {
    if (!activeApproval) return data.proposals[0];
    return data.proposals.find((p) => p.approvalId === activeApproval.id) ?? data.proposals[0];
  }, [activeApproval, data.proposals]);

  return (
    <div className="hz-page-stack hz-ai-approvals-page">
      <PageHeader
        title="AI Onay Önerileri"
        description="Local-first AI operatör modu: mutation talepleri öneri + onay zinciriyle yönetilir; bu ekran yalnız inceleme içindir."
      />
      <p className="hz-ai-review-note">AI doğrudan kayıt değiştirmez. Onay ve icra merkezi onay ekranından yapılır.</p>
      <section className="hz-metric-grid">
        <MetricCard title="Öneri" value={String(data.proposals.length)} detail="Toplam" tone="info" />
        <MetricCard title="Onay bekleyen" value={String(data.approvals.length)} detail="Bekleyen" tone="warning" />
        <MetricCard title="İcra" value={String(data.executions.length)} detail="Yetkili" tone="success" />
        <MetricCard title="Red" value="0" detail="Bugün" tone="danger" />
      </section>
      <AiApprovalFilterBar />
      <SplitContentLayout
        main={
          <>
            <AiApprovalTable proposals={data.proposals} approvals={data.approvals} />
            <ApprovalCoveragePanel />
          </>
        }
        side={<AiApprovalDetailDrawer approval={activeApproval} proposal={linkedProposal} />}
      />
    </div>
  );
}

export function AiInsightFilterBar() {
  return (
    <FilterBar>
      <div className="task-center-filter-grid">
        <label>
          Modül
          <select defaultValue="" disabled aria-disabled="true">
            <option value="">Tüm modüller</option>
            <option>Risk</option>
            <option>Stok</option>
            <option>Fabrika</option>
          </select>
        </label>
        <label>
          Dönem
          <select defaultValue="today" disabled aria-disabled="true">
            <option value="today">Bugün</option>
            <option value="week">Bu hafta</option>
          </select>
        </label>
        <label className="hz-toggle">
          <input type="checkbox" disabled aria-disabled="true" />
          Kritikler
        </label>
      </div>
      <FilterActions>
        <button type="button" className="hz-btn hz-btn-secondary" disabled>
          Filtreler (salt okunur)
        </button>
        <button type="button" className="reset-btn" disabled>
          Temizle
        </button>
      </FilterActions>
      <p className="muted">AI içgörüler yalnız öneri üretir; canlı mutation bu ekrandan yapılmaz.</p>
    </FilterBar>
  );
}

export function AiInsightGrid({ insights }: { insights: AiInsight[] }) {
  const router = useRouter();
  if (insights.length === 0) {
    return (
      <section className="hz-content-card" role="status">
        <p className="muted">Lokal AI yapılandırıldığında içgörüler burada görünecek.</p>
      </section>
    );
  }
  return (
    <section className="hz-task-card-grid">
      {insights.map((insight) => (
        <article key={insight.id} className="hz-task-card">
          <div className="hz-task-card-header">
            <span
              className={`hz-badge ${insight.severity === "critical" ? "hz-badge-danger" : "hz-badge-warning"}`}
            >
              {insight.category}
            </span>
            <strong>%{Math.round(insight.confidence * 100)}</strong>
          </div>
          <h3 className="hz-card-title">{insight.title}</h3>
          <p className="hz-task-card-sub">{insight.summary}</p>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={() => router.push("/ai")}>
            Detayı aç
          </button>
        </article>
      ))}
    </section>
  );
}

export function AiInsightDetailPanel({ insight }: { insight: AiInsight | undefined }) {
  const router = useRouter();
  return (
    <aside className="hz-side-panel">
      <p className="drawer-eyebrow">İçgörü detayı</p>
      <h3>{insight?.title ?? "İçgörü"}</h3>
      <p className="muted">{insight?.summary ?? "Seçili içgörü özeti burada görünür."}</p>
      <div className="detail-list">
        <span>Hedef</span>
        <strong>{insight?.targetNo ?? "—"}</strong>
        <span>Önerilen aksiyon</span>
        <strong>{insight?.suggestedAction ?? "—"}</strong>
      </div>
      <p className="hz-ai-review-note">Öneri uygulanmadan önce operatör incelemesi gerekir.</p>
      <button type="button" className="hz-btn hz-btn-primary" onClick={() => router.push("/onaylar")}>
        İlgili kaydı aç
      </button>
    </aside>
  );
}

export function AiInsightsPage() {
  const [insights, setInsights] = useState<AiInsight[]>([]);

  useEffect(() => {
    void getAiAssistantData().then((next) => setInsights(next.insights));
  }, []);

  return (
    <div className="hz-page-stack hz-ai-insights-page">
      <PageHeader
        title="AI İçgörüler"
        description="Local-first AI analiz katmanı: salt okunur içgörülerle risk, fırsat ve operasyon sinyallerini izleyin."
      />
      <AiInsightFilterBar />
      <SplitContentLayout main={<AiInsightGrid insights={insights} />} side={<AiInsightDetailPanel insight={insights[0]} />} />
    </div>
  );
}

