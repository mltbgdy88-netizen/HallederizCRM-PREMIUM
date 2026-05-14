"use client";

import type { AiInsight, AiProposal, Approval } from "@hallederiz/types";
import { FilterActions, FilterBar, MetricCard, PageHeader, SplitContentLayout } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAiAssistantData } from "../queries";
import { buildAiProposalSnapshotJson } from "../utils/ai-proposal-snapshot";

export function AiApprovalFilterBar() {
  return <FilterBar><div className="task-center-filter-grid"><label>Proposal No<input placeholder="AI-401" /></label><label>Durum<select defaultValue=""><option value="">Tum durumlar</option><option>Bekliyor</option><option>Onaylandi</option></select></label><label>Aksiyon Tipi<select defaultValue=""><option value="">Tum aksiyonlar</option><option>create_offer</option><option>send_document_whatsapp</option></select></label></div><FilterActions><button type="button" className="hz-btn hz-btn-secondary" disabled>Filtreler read-only</button><button type="button" className="reset-btn" disabled>Temizle</button></FilterActions><p className="muted">Bu panelde filtreler bilgilendirme amaçlıdır. Canlı execute başarısı üretmez.</p></FilterBar>;
}

export function AiApprovalTable({ proposals, approvals }: { proposals: AiProposal[]; approvals: Approval[] }) {
  const router = useRouter();
  return (
    <section className="hz-content-card hz-ai-approval-table-wrap">
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>Proposal No</th>
              <th>Aksiyon</th>
              <th>Durum</th>
              <th>Onay gerekli</th>
              <th>Isteyen</th>
              <th>Hedef</th>
              <th>Tarih</th>
              <th>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((proposal) => (
              <tr key={proposal.id}>
                <td>{proposal.proposalNo}</td>
                <td>{proposal.actionType}</td>
                <td>{proposal.status}</td>
                <td>{proposal.requiresApproval ? "Evet" : "Hayir"}</td>
                <td>{proposal.requestedByName}</td>
                <td>{proposal.targetNo}</td>
                <td>{new Date(proposal.createdAt).toLocaleDateString("tr-TR")}</td>
                <td>
                  <button
                    className="hz-btn hz-btn-secondary"
                    type="button"
                    onClick={() => router.push(proposal.targetType === "customer" ? `/cariler/${proposal.targetId}` : "/ai")}
                  >
                    Ilgili Kayda Git
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">Approval kaydi: {approvals.map((approval) => approval.approvalNo).join(", ")}</p>
    </section>
  );
}

export function AiApprovalDetailDrawer({ approval, proposal }: { approval: Approval | undefined; proposal: AiProposal | undefined }) {
  return (
    <aside className="hz-side-panel hz-ai-approval-drawer">
      <p className="drawer-eyebrow">AI Approval Detail</p>
      <h3>{approval?.approvalNo ?? "Secim yok"}</h3>
      <p className="muted">{approval?.payloadSummary ?? "Onay secildiginde ozet burada gorunur."}</p>
      {proposal ? (
        <>
          <p className="drawer-eyebrow">Bagli proposal</p>
          <p className="muted">
            {proposal.proposalNo} —{" "}
            <span className={proposal.requiresApproval ? "hz-badge hz-badge-warning" : "hz-badge hz-badge-success"}>
              Onay gerekli: {proposal.requiresApproval ? "Evet" : "Hayir"}
            </span>
          </p>
          <details className="hz-ai-proposal-snapshot">
            <summary>Proposal snapshot (salt okunur)</summary>
            <pre className="hz-ai-proposal-snapshot-pre">{buildAiProposalSnapshotJson(proposal)}</pre>
          </details>
        </>
      ) : (
        <p className="muted">Bagli proposal bulunamadi.</p>
      )}
      <div className="hz-inline-actions">
        <button className="hz-btn hz-btn-primary" type="button" disabled>
          Onayla (Foundation)
        </button>
        <button className="hz-btn hz-btn-secondary" type="button" disabled>
          Reddet (Foundation)
        </button>
        <button className="hz-btn hz-btn-secondary" type="button" disabled>
          Execution Kaydi (Foundation)
        </button>
      </div>
      <p className="muted">Not: Bu paneldeki aksiyonlar bilgilendirme amaclidir. Canli onay/isletme akislari merkezi onay ekrani ve API tarafinda yonetilir.</p>
    </aside>
  );
}

function ApprovalCoveragePanel() {
  const rows = [
    { action: "create_offer", approval: "Evet", state: "Bagli" },
    { action: "create_order", approval: "Evet", state: "Bagli" },
    { action: "create_payment", approval: "Evet", state: "Bagli" },
    { action: "mark_warehouse_ready", approval: "Evet", state: "Bagli" },
    { action: "complete_delivery", approval: "Evet", state: "Bagli" },
    { action: "create_invoice", approval: "Evet", state: "Bagli" },
    { action: "create_return", approval: "Evet", state: "Bagli" },
    { action: "send_document_whatsapp", approval: "Evet", state: "Bagli" },
    { action: "queue_document_save", approval: "Evet", state: "Bagli" },
    { action: "queue_document_print", approval: "Evet", state: "Bagli" }
  ];

  return (
    <section className="hz-content-card">
      <h3>Approval Coverage</h3>
      <p className="muted">Operatormodu aksiyonlari approval zorunlulugu ile calisir. Read-only yanitlar approval gerektirmez.</p>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>Aksiyon</th>
              <th>Approval</th>
              <th>Execution</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.action}>
                <td>{row.action}</td>
                <td><span className="hz-badge hz-badge-warning">{row.approval}</span></td>
                <td><span className="hz-badge hz-badge-success">{row.state}</span></td>
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
    <div className="hz-page-stack">
      <PageHeader title="AI Onaylar" description="Local-first AI operatormodu: mutation talepleri proposal + approval zinciriyle yonetilir." />
      <section className="hz-metric-grid">
        <MetricCard title="Proposal" value={String(data.proposals.length)} detail="Toplam" tone="info" />
        <MetricCard title="Onay Bekleyen" value={String(data.approvals.length)} detail="Pending" tone="warning" />
        <MetricCard title="Execution" value={String(data.executions.length)} detail="Authorized" tone="success" />
        <MetricCard title="Rejected" value="0" detail="Bugun" tone="danger" />
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
  return <FilterBar><div className="task-center-filter-grid"><label>Modul<select defaultValue=""><option value="">Tum moduller</option><option>Risk</option><option>Stok</option><option>Fabrika</option></select></label><label>Donem<select defaultValue="today"><option value="today">Bugun</option><option value="week">Bu Hafta</option></select></label><label className="hz-toggle"><input type="checkbox" />Kritikler</label></div><FilterActions><button type="button" className="hz-btn hz-btn-secondary" disabled>Filtreler read-only</button><button type="button" className="reset-btn" disabled>Temizle</button></FilterActions><p className="muted">AI içgörüler yalnız öneri üretir; canlı mutation/execute bu ekrandan yapılmaz.</p></FilterBar>;
}

export function AiInsightGrid({ insights }: { insights: AiInsight[] }) {
  return <section className="hz-task-card-grid">{insights.map((insight) => <article key={insight.id} className="hz-task-card"><div className="hz-task-card-header"><span className={`hz-badge ${insight.severity === "critical" ? "hz-badge-danger" : "hz-badge-warning"}`}>{insight.category}</span><strong>%{Math.round(insight.confidence * 100)}</strong></div><h3 className="hz-card-title">{insight.title}</h3><p className="hz-task-card-sub">{insight.summary}</p></article>)}</section>;
}

export function AiInsightDetailPanel({ insight }: { insight: AiInsight | undefined }) {
  return <aside className="hz-side-panel"><p className="drawer-eyebrow">Insight Detail</p><h3>{insight?.title ?? "Insight"}</h3><p className="muted">{insight?.summary}</p><div className="detail-list"><span>Hedef</span><strong>{insight?.targetNo ?? "-"}</strong><span>Onerilen aksiyon</span><strong>{insight?.suggestedAction ?? "-"}</strong></div></aside>;
}

export function AiInsightsPage() {
  const [insights, setInsights] = useState<AiInsight[]>([]);

  useEffect(() => {
    void getAiAssistantData().then((next) => setInsights(next.insights));
  }, []);

  return <div className="hz-page-stack"><PageHeader title="AI Icgoruler" description="Local-first AI analiz katmani: read-only icgorulerle risk, firsat, tahsilat, stok ve fabrika sinyallerini izleyin." /><AiInsightFilterBar /><SplitContentLayout main={<AiInsightGrid insights={insights} />} side={<AiInsightDetailPanel insight={insights[0]} />} /></div>;
}
