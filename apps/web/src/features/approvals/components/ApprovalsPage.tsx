"use client";

import { buildApprovalSummary, canExecuteApprovedAction, summarizeApprovalTarget } from "@hallederiz/domain";
import type { Approval } from "@hallederiz/types";
import { FilterActions, FilterBar, LoadingState, MetricCard, PageHeader, Pagination, SplitContentLayout } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getOperationsEngineData } from "../../dashboard/queries";

const statusLabels: Record<Approval["status"], string> = { pending: "Bekliyor", approved: "Onaylandi", rejected: "Reddedildi", expired: "Suresi Doldu", executed: "Icra Edildi" };
const typeLabels: Record<Approval["type"], string> = { order_high_value: "Yuksek Tutar", delivery_payment_missing: "Eksik Tahsilatli Teslim", return_approval: "Iade Onayi", price_override: "Fiyat Override", ai_action_proposal: "AI Proposal", manual_operation: "Manuel Operasyon" };

function statusBadge(status: Approval["status"]) { return status === "pending" ? "hz-badge hz-badge-warning" : status === "approved" ? "hz-badge hz-badge-success" : status === "rejected" ? "hz-badge hz-badge-danger" : "hz-badge hz-badge-info"; }

export function ApprovalFilterBar() {
  return <FilterBar><div className="task-center-filter-grid"><label>Approval Tipi<select defaultValue=""><option value="">Tum tipler</option><option>AI Proposal</option><option>Eksik Tahsilatli Teslim</option></select></label><label>Durum<select defaultValue=""><option value="">Tum durumlar</option><option>Bekliyor</option><option>Onaylandi</option><option>Reddedildi</option></select></label><label>Istenen Rol<select defaultValue=""><option value="">Tum roller</option><option>Yonetici</option><option>Satis Muduru</option></select></label><label>Entity Tipi<select defaultValue=""><option value="">Tum entityler</option><option>Siparis</option><option>Teslimat</option><option>AI Proposal</option></select></label><label>Tarih<input type="date" /></label></div><FilterActions><button type="button" className="hz-btn hz-btn-secondary">Filtrele</button><button type="button" className="reset-btn">Temizle</button></FilterActions></FilterBar>;
}

export function ApprovalTable({ approvals, onOpen }: { approvals: Approval[]; onOpen: (approvalId: string) => void }) {
  return <section className="hz-content-card"><div className="table-wrap hz-table-wrap"><table className="table hz-table hz-table-sticky"><thead><tr><th>Onay No</th><th>Approval Tipi</th><th>Bagli Kayit</th><th>Durum</th><th>Isteyen</th><th>Karar Veren</th><th>Olusturma</th></tr></thead><tbody>{approvals.map((approval) => <tr key={approval.id} className="stock-table-row" onDoubleClick={() => onOpen(approval.id)}><td>{approval.approvalNo}</td><td>{typeLabels[approval.type]}</td><td>{approval.entityNo}</td><td><span className={statusBadge(approval.status)}>{statusLabels[approval.status]}</span></td><td>{approval.requestedByName}</td><td>{approval.decidedByName ?? "-"}</td><td>{new Date(approval.createdAt).toLocaleString("tr-TR")}</td></tr>)}{approvals.length === 0 ? <tr><td colSpan={7}><div className="table-empty">Onay kaydi bulunamadi.</div></td></tr> : null}</tbody></table></div></section>;
}

export function ApprovalPreviewPanel({ approval }: { approval: Approval | null }) {
  if (!approval) return <aside className="hz-side-panel"><p className="muted">Onay kaydi secimi bekleniyor.</p></aside>;
  return <aside className="hz-side-panel"><p className="drawer-eyebrow">Approval Onizleme</p><h3>{approval.approvalNo}</h3><p className="muted">{summarizeApprovalTarget(approval)}</p><div className="detail-list"><span>Durum</span><strong>{statusLabels[approval.status]}</strong><span>Istenen rol</span><strong>{approval.requestedRole}</strong><span>Server action</span><strong>{approval.policySnapshot.serverActionKey ?? "-"}</strong><span>Executable</span><strong>{canExecuteApprovedAction(approval) ? "Evet" : "Hayir"}</strong></div></aside>;
}

export function ApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<Approval[] | null>(null);
  const [selectedApprovalId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  useEffect(() => { getOperationsEngineData().then((data) => setApprovals(data.approvals)); }, []);
  const summary = useMemo(() => buildApprovalSummary(approvals ?? []), [approvals]);
  const selectedApproval = useMemo(() => approvals?.find((approval) => approval.id === selectedApprovalId) ?? approvals?.[0] ?? null, [approvals, selectedApprovalId]);
  const pagedApprovals = useMemo(() => (approvals ?? []).slice((page - 1) * pageSize, page * pageSize), [approvals, page]);
  return <div className="hz-page-stack"><PageHeader title="Onaylar" description="Human-in-the-loop approval kayitlarini ve server-side execution hazirligini yonetin." /><section className="hz-metric-grid"><MetricCard title="Toplam" value={String(summary.total)} detail="Approval kaydi" tone="info" /><MetricCard title="Bekleyen" value={String(summary.pending)} detail="Karar bekliyor" tone="warning" /><MetricCard title="Icra Edilebilir" value={String(summary.executable)} detail="Server action hazir" tone="success" /><MetricCard title="Reddedilen" value={String(summary.rejected)} detail="Kontrol gecmisi" tone="danger" /></section><ApprovalFilterBar />{!approvals ? <LoadingState title="Onaylar yukleniyor" message="Approval kayitlari hazirlaniyor." /> : <SplitContentLayout main={<><ApprovalTable approvals={pagedApprovals} onOpen={(approvalId) => router.push(`/onaylar/${approvalId}`)} /><Pagination totalItems={approvals.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} /></>} side={<ApprovalPreviewPanel approval={selectedApproval} />} />}</div>;
}

export function ApprovalHeaderInfo({ approval }: { approval: Approval }) {
  return <section className="hz-content-card"><p className="drawer-eyebrow">{approval.approvalNo}</p><h2>{typeLabels[approval.type]}</h2><p className="muted">{summarizeApprovalTarget(approval)}</p><div className="hz-inline-actions"><span className={statusBadge(approval.status)}>{statusLabels[approval.status]}</span><span className="hz-badge hz-badge-info">{approval.requestedRole}</span></div></section>;
}

export function ApprovalSummaryPanel({ approval }: { approval: Approval }) {
  return <section className="hz-content-card"><h3>Islem Ozeti</h3><div className="detail-list"><span>Hedef entity</span><strong>{approval.entityType} / {approval.entityNo}</strong><span>Risk notu</span><strong>{approval.riskNote ?? "-"}</strong><span>Policy</span><strong>{approval.policySnapshot.reason}</strong><span>Execution</span><strong>{canExecuteApprovedAction(approval) ? "Onay sonrasi icra edilebilir" : "Beklemede"}</strong></div></section>;
}

export function ApprovalPayloadViewer({ approval }: { approval: Approval }) {
  return <section className="hz-content-card"><h3>Payload Summary</h3><p className="muted">{approval.payloadSummary}</p><pre className="code-block">{JSON.stringify(approval.payload, null, 2)}</pre><h3>Approval History</h3><p className="muted">Karar gecmisi ve audit izi burada genisletilecek.</p></section>;
}

export function ApprovalActionsBar({ approval }: { approval: Approval }) {
  const router = useRouter();
  return <section className="hz-content-card"><h3>Aksiyonlar</h3><div className="hz-inline-actions"><button className="hz-btn hz-btn-primary" type="button">Onayla</button><button className="hz-btn hz-btn-secondary" type="button">Reddet</button><button className="hz-btn hz-btn-secondary" type="button">Expire</button><button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push(approval.entityType === "delivery" ? `/teslimatlar/${approval.entityId}` : "/ai/onaylar")}>Ilgili Kayda Git</button></div></section>;
}

export function ApprovalDetailPage({ approval }: { approval: Approval }) {
  return <div className="hz-page-stack"><PageHeader title="Onay Detayi" description="Approval kararini, hedef entity'yi ve payload ozetini denetlenebilir sekilde gorun." /><ApprovalHeaderInfo approval={approval} /><SplitContentLayout main={<ApprovalPayloadViewer approval={approval} />} side={<><ApprovalSummaryPanel approval={approval} /><ApprovalActionsBar approval={approval} /></>} /></div>;
}
