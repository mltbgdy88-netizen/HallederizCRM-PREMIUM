"use client";

import type { AiInsight, AiMessage, AiProposal, Approval } from "@hallederiz/types";
import { MetricCard, PageHeader, PrimaryActionToolbar, TabSwitcher } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { confirmAiProposal, createAiProposal, getAiAssistantData, rejectAiProposal, runAiInsights, speakAiText } from "../queries";

const statusLabel: Record<AiProposal["status"], string> = { draft: "Taslak", waiting_approval: "Onay Bekliyor", approved: "Onaylandi", rejected: "Reddedildi", executed: "Executed", failed: "Hata" };

export function AiModeToggle() { return <div className="hz-inline-actions"><span className="hz-badge hz-badge-success">Read-only default</span><span className="hz-badge hz-badge-warning">Mutation insan onayli</span></div>; }
export function VoiceInputButton({ onClick }: { onClick?: () => void }) { return <button className="hz-btn hz-btn-secondary" type="button" onClick={onClick}>Mikrofon</button>; }
export function AiConversationPanel({ messages }: { messages: AiMessage[] }) { return <article className="hz-column-card"><h3 className="hz-column-title">AI Asistan Akisi</h3><div className="hz-chat-feed">{messages.map((message) => <div key={message.id} className={`hz-chat-bubble ${message.role === "user" ? "is-outgoing" : ""}`}><p>{message.body}</p><small>{message.inputMode}</small></div>)}</div><AiInputPanel /></article>; }
export function AiInputPanel({ onSubmit, onVoice }: { onSubmit?: (prompt: string) => void; onVoice?: () => void }) {
  const [value, setValue] = useState("");
  return <div className="hz-chat-composer"><input className="hz-control" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Komut yaz: geciken tahsilatlari ozetle" /><button className="hz-btn hz-btn-primary" type="button" onClick={() => { if (!value.trim()) return; onSubmit?.(value.trim()); setValue(""); }}>Gonder</button><VoiceInputButton onClick={onVoice} /></div>;
}
export function AiProposalCardList({ proposals, onConfirm, onReject }: { proposals: AiProposal[]; onConfirm?: (id: string) => void; onReject?: (id: string) => void }) { return <section className="hz-content-card"><h3>Proposal Kartlari</h3>{proposals.map((proposal) => <div key={proposal.id} className="hz-list-item"><strong>{proposal.proposalNo} / {proposal.actionType}</strong><span>{proposal.summary}</span><div className="hz-inline-actions"><span className="hz-badge hz-badge-info">{statusLabel[proposal.status]}</span>{proposal.requiresApproval ? <><button className="hz-btn hz-btn-secondary" type="button" onClick={() => onConfirm?.(proposal.id)}>Onayla</button><button className="hz-btn hz-btn-secondary" type="button" onClick={() => onReject?.(proposal.id)}>Reddet</button></> : <span className="hz-badge hz-badge-success">Read-only cevap</span>}</div></div>)}</section>; }
export function AiApprovalPanel({ approvals }: { approvals: Approval[] }) { const router = useRouter(); return <section className="hz-content-card"><h3>Onay Bekleyen AI Proposal'lar</h3>{approvals.map((approval) => <div key={approval.id} className="hz-list-item"><strong>{approval.approvalNo}</strong><span>{approval.payloadSummary}</span><button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push("/ai/onaylar")}>Onaya Git</button></div>)}</section>; }
export function AiExecutionHistoryPanel() { return <section className="hz-content-card"><h3>Son Executed Islemler</h3><div className="hz-list-item"><strong>approval_exec_1</strong><span>send_document_whatsapp server-side mock execution icin yetkilendirildi.</span></div></section>; }
export function AiInsightPanel({ insights }: { insights: AiInsight[] }) { const router = useRouter(); return <section className="hz-content-card"><h3>Ilgili Kayit Onizlemeleri</h3>{insights.slice(0, 3).map((insight) => <div key={insight.id} className="hz-list-item"><strong>{insight.title}</strong><span>{insight.summary}</span><button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push(insight.targetType === "customer" ? `/cariler/${insight.targetId}` : insight.targetType === "product" ? "/stok" : "/ai/icgoruler")}>Kayda Git</button></div>)}</section>; }
export function AiContextSidePanel({ approvals, insights }: { approvals: Approval[]; insights: AiInsight[] }) { return <article className="hz-column-card"><h3 className="hz-column-title">Onay ve Baglam Paneli</h3><AiApprovalPanel approvals={approvals} /><AiExecutionHistoryPanel /><section className="hz-content-card"><h3>Yetki Uyarilari</h3><p className="muted">AI mutation islemleri approval olmadan execute edilemez. Server-side execution audit ile izlenir.</p></section><AiInsightPanel insights={insights} /></article>; }

export function AIAssistantPage() {
  const [data, setData] = useState<{ messages: AiMessage[]; proposals: AiProposal[]; approvals: Approval[]; executions: unknown[]; insights: AiInsight[] }>({ messages: [], proposals: [], approvals: [], executions: [], insights: [] });
  const [mode, setMode] = useState("text");

  const reload = async () => {
    const next = await getAiAssistantData();
    setData(next);
  };

  useEffect(() => {
    void reload();
  }, []);

  const handleSubmit = async (prompt: string) => {
    await createAiProposal({ prompt, inputMode: mode === "voice" ? "voice" : "text" });
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
    await speakAiText({ text: "Sesli yanit testi." });
  };

  return <div className="hz-page-stack"><PageHeader title="AI" description="Yazili/sesli komut, read-only cevap, proposal, approval ve execution akisini tek merkezde yonetin." /><section className="hz-metric-grid"><MetricCard title="Proposal" value={String(data.proposals.length)} detail="AI onerisi" tone="info" /><MetricCard title="Onay Bekleyen" value={String(data.approvals.length)} detail="Mutation guard" tone="warning" /><MetricCard title="Insight" value={String(data.insights.length)} detail="Dashboard uyumlu" tone="success" /><MetricCard title="Execution" value={String(data.executions.length)} detail="Server-side" tone="danger" /></section><PrimaryActionToolbar><button type="button" className="hz-btn hz-toolbar-btn hz-btn-primary" onClick={() => void runAiInsights().then(reload)}>Insight Uret</button><button type="button" className="hz-btn hz-toolbar-btn hz-btn-secondary">Prompt Kitapligi</button><button type="button" className="hz-btn hz-toolbar-btn hz-btn-secondary" onClick={handleVoice}>Sesli Giris</button><AiModeToggle /></PrimaryActionToolbar><TabSwitcher activeKey={mode} onChange={setMode} items={[{ key: "text", label: "Yazili Giris" }, { key: "voice", label: "Sesli Giris" }]} /><section className="hz-ai-layout"><article className="hz-column-card"><h3 className="hz-column-title">AI Asistan Akisi</h3><div className="hz-chat-feed">{data.messages.map((message) => <div key={message.id} className={`hz-chat-bubble ${message.role === "user" ? "is-outgoing" : ""}`}><p>{message.body}</p><small>{message.inputMode}</small></div>)}</div><AiInputPanel onSubmit={(prompt) => void handleSubmit(prompt)} onVoice={handleVoice} /></article><article className="hz-column-card"><AiProposalCardList proposals={data.proposals} onConfirm={(id) => void handleConfirm(id)} onReject={(id) => void handleReject(id)} /><AiContextSidePanel approvals={data.approvals} insights={data.insights} /></article></section></div>;
}
