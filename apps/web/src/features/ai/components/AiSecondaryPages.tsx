"use client";

import type { AiInsight, AiProposal, Approval } from "@hallederiz/types";
import { FilterActions, FilterBar, MetricCard, PageHeader, SplitContentLayout } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAiAssistantData } from "../queries";

export function AiApprovalFilterBar() {
  return <FilterBar><div className="task-center-filter-grid"><label>Proposal No<input placeholder="AI-401" /></label><label>Durum<select defaultValue=""><option value="">Tum durumlar</option><option>Bekliyor</option><option>Onaylandi</option></select></label><label>Aksiyon Tipi<select defaultValue=""><option value="">Tum aksiyonlar</option><option>create_offer</option><option>send_document_whatsapp</option></select></label></div><FilterActions><button type="button" className="hz-btn hz-btn-secondary">Filtrele</button><button type="button" className="reset-btn">Temizle</button></FilterActions></FilterBar>;
}

export function AiApprovalTable({ proposals, approvals }: { proposals: AiProposal[]; approvals: Approval[] }) {
  const router = useRouter();
  return <section className="hz-content-card"><div className="table-wrap hz-table-wrap"><table className="table hz-table"><thead><tr><th>Proposal No</th><th>Aksiyon</th><th>Durum</th><th>Isteyen</th><th>Hedef</th><th>Tarih</th><th>Aksiyon</th></tr></thead><tbody>{proposals.map((proposal) => <tr key={proposal.id}><td>{proposal.proposalNo}</td><td>{proposal.actionType}</td><td>{proposal.status}</td><td>{proposal.requestedByName}</td><td>{proposal.targetNo}</td><td>{new Date(proposal.createdAt).toLocaleDateString("tr-TR")}</td><td><button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push(proposal.targetType === "customer" ? `/cariler/${proposal.targetId}` : "/ai")}>Ilgili Kayda Git</button></td></tr>)}</tbody></table></div><p className="muted">Approval kaydi: {approvals.map((approval) => approval.approvalNo).join(", ")}</p></section>;
}

export function AiApprovalDetailDrawer({ approval }: { approval: Approval | undefined }) {
  return <aside className="hz-side-panel"><p className="drawer-eyebrow">AI Approval Detail</p><h3>{approval?.approvalNo ?? "Secim yok"}</h3><p className="muted">{approval?.payloadSummary ?? "Proposal secildiginde payload burada gorunur."}</p><div className="hz-inline-actions"><button className="hz-btn hz-btn-primary" type="button">Onayla</button><button className="hz-btn hz-btn-secondary" type="button">Reddet</button><button className="hz-btn hz-btn-secondary" type="button">Execution Kaydi</button></div></aside>;
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

  return <div className="hz-page-stack"><PageHeader title="AI Onaylar" description="AI proposal kayitlarini insan onayi ve execution zinciriyle yonetin." /><section className="hz-metric-grid"><MetricCard title="Proposal" value={String(data.proposals.length)} detail="Toplam" tone="info" /><MetricCard title="Onay Bekleyen" value={String(data.approvals.length)} detail="Pending" tone="warning" /><MetricCard title="Execution" value={String(data.executions.length)} detail="Authorized" tone="success" /><MetricCard title="Rejected" value="0" detail="Bugun" tone="danger" /></section><AiApprovalFilterBar /><SplitContentLayout main={<AiApprovalTable proposals={data.proposals} approvals={data.approvals} />} side={<AiApprovalDetailDrawer approval={data.approvals[0]} />} /></div>;
}

export function AiInsightFilterBar() {
  return <FilterBar><div className="task-center-filter-grid"><label>Modul<select defaultValue=""><option value="">Tum moduller</option><option>Risk</option><option>Stok</option><option>Fabrika</option></select></label><label>Donem<select defaultValue="today"><option value="today">Bugun</option><option value="week">Bu Hafta</option></select></label><label className="hz-toggle"><input type="checkbox" />Kritikler</label></div><FilterActions><button type="button" className="hz-btn hz-btn-secondary">Filtrele</button><button type="button" className="reset-btn">Temizle</button></FilterActions></FilterBar>;
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

  return <div className="hz-page-stack"><PageHeader title="AI Icgoruler" description="Risk, firsat, tahsilat, stok ve fabrika sinyallerini dashboard uyumlu kartlarla izleyin." /><AiInsightFilterBar /><SplitContentLayout main={<AiInsightGrid insights={insights} />} side={<AiInsightDetailPanel insight={insights[0]} />} /></div>;
}

