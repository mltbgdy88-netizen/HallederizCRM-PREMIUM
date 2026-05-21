"use client";

import { canExecuteApprovedAction, summarizeApprovalTarget } from "@hallederiz/domain";
import type { Approval } from "@hallederiz/types";
import { EntityDetailLayout, FilterActions, FilterBar, PageHeader, SplitContentLayout } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { approveApprovalMutation, executeApprovalMutation, rejectApprovalMutation } from "../mutations";
import { ApprovalCommandDeskPage } from "./ApprovalCommandDeskPage";

const statusLabels: Record<Approval["status"], string> = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  expired: "Süresi doldu",
  executed: "İşlendi"
};
const typeLabels: Record<Approval["type"], string> = {
  order_high_value: "Yüksek tutar",
  delivery_payment_missing: "Eksik tahsilatlı teslim",
  return_approval: "İade onayı",
  price_override: "Fiyat değişikliği",
  ai_action_proposal: "AI önerisi",
  manual_operation: "Manuel operasyon"
};

function statusBadge(status: Approval["status"]) { return status === "pending" ? "hz-badge hz-badge-warning" : status === "approved" ? "hz-badge hz-badge-success" : status === "rejected" ? "hz-badge hz-badge-danger" : "hz-badge hz-badge-info"; }

export function ApprovalFilterBar() {
  return <FilterBar><div className="task-center-filter-grid"><label>Approval Tipi<select defaultValue=""><option value="">Tum tipler</option><option>AI Proposal</option><option>Eksik Tahsilatli Teslim</option></select></label><label>Durum<select defaultValue=""><option value="">Tum durumlar</option><option>Bekliyor</option><option>Onaylandi</option><option>Reddedildi</option></select></label><label>Istenen Rol<select defaultValue=""><option value="">Tum roller</option><option>Yonetici</option><option>Satis Muduru</option></select></label><label>Entity Tipi<select defaultValue=""><option value="">Tum entityler</option><option>Siparis</option><option>Teslimat</option><option>AI Proposal</option></select></label><label>Tarih<input type="date" /></label></div><FilterActions><button type="button" className="hz-btn hz-btn-secondary">Filtrele</button><button type="button" className="reset-btn">Temizle</button></FilterActions></FilterBar>;
}

export function ApprovalTable({ approvals, selectedId, onSelect, onOpen }: { approvals: Approval[]; selectedId: string | null; onSelect: (approvalId: string) => void; onOpen: (approvalId: string) => void }) {
  return <section className="hz-content-card"><div className="table-wrap hz-table-wrap"><table className="table hz-table hz-table-sticky"><thead><tr><th>Onay No</th><th>Approval Tipi</th><th>Bagli Kayit</th><th>Durum</th><th>Isteyen</th><th>Karar Veren</th><th>Olusturma</th><th>Aksiyon</th></tr></thead><tbody>{approvals.map((approval) => <tr key={approval.id} className={`stock-table-row ${selectedId === approval.id ? "is-selected" : ""}`} onClick={() => onSelect(approval.id)} onDoubleClick={() => onOpen(approval.id)}><td>{approval.approvalNo}</td><td>{typeLabels[approval.type]}</td><td>{approval.entityNo}</td><td><span className={statusBadge(approval.status)}>{statusLabels[approval.status]}</span></td><td>{approval.requestedByName}</td><td>{approval.decidedByName ?? "-"}</td><td>{new Date(approval.createdAt).toLocaleString("tr-TR")}</td><td><button type="button" className="hz-btn hz-btn-secondary" onClick={(event) => { event.stopPropagation(); onOpen(approval.id); }}>Detay</button></td></tr>)}{approvals.length === 0 ? <tr><td colSpan={8}><div className="table-empty">Onay kaydi bulunamadi.</div></td></tr> : null}</tbody></table></div></section>;
}

export function ApprovalPreviewPanel({ approval }: { approval: Approval | null }) {
  if (!approval) return <aside className="hz-side-panel"><p className="muted">Onay kaydi secimi bekleniyor.</p></aside>;
  return <aside className="hz-side-panel"><p className="drawer-eyebrow">Approval Onizleme</p><h3>{approval.approvalNo}</h3><p className="muted">{summarizeApprovalTarget(approval)}</p><div className="detail-list"><span>Durum</span><strong>{statusLabels[approval.status]}</strong><span>Istenen rol</span><strong>{approval.requestedRole}</strong><span>Server action</span><strong>{approval.policySnapshot.serverActionKey ?? "-"}</strong><span>Executable</span><strong>{canExecuteApprovedAction(approval) ? "Evet" : "Hayir"}</strong></div></aside>;
}

export function ApprovalsPage() {
  return <ApprovalCommandDeskPage />;
}

export function ApprovalHeaderInfo({ approval }: { approval: Approval }) {
  return <section className="hz-content-card"><p className="drawer-eyebrow">{approval.approvalNo}</p><h2>{typeLabels[approval.type]}</h2><p className="muted">{summarizeApprovalTarget(approval)}</p><div className="hz-inline-actions"><span className={statusBadge(approval.status)}>{statusLabels[approval.status]}</span><span className="hz-badge hz-badge-info">{approval.requestedRole}</span></div></section>;
}

export function ApprovalSummaryPanel({ approval }: { approval: Approval }) {
  return <section className="hz-content-card"><h3>Islem Ozeti</h3><div className="detail-list"><span>Hedef entity</span><strong>{approval.entityType} / {approval.entityNo}</strong><span>Risk notu</span><strong>{approval.riskNote ?? "-"}</strong><span>Policy</span><strong>{approval.policySnapshot.reason}</strong><span>Execution</span><strong>{canExecuteApprovedAction(approval) ? "Onay sonrasi icra edilebilir" : "Beklemede"}</strong></div></section>;
}

export function ApprovalPayloadViewer({ approval }: { approval: Approval }) {
  return (
    <section className="hz-content-card hz-approvals-detail-section">
      <h3>İşlem detayları</h3>
      <p className="muted">{approval.payloadSummary || "Özet bilgisi bulunmuyor."}</p>
      <h3>Onay geçmişi</h3>
      <p className="muted">
        {approval.decidedByName
          ? `Son karar: ${approval.decidedByName} — ${statusLabels[approval.status]}`
          : "Karar geçmişi henüz kayıtlı değil."}
      </p>
      <h3>Denetim izi</h3>
      <p className="muted">Zaman çizelgesi bağlandığında adımlar burada listelenir.</p>
    </section>
  );
}

export function ApprovalActionsBar({ approval }: { approval: Approval }) {
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<"approve" | "reject" | "execute" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const runAction = async (action: "approve" | "reject" | "execute") => {
    setBusyAction(action);
    setFeedback(null);
    try {
      if (action === "approve") {
        await approveApprovalMutation(approval.id);
      } else if (action === "reject") {
        await rejectApprovalMutation(approval.id);
      } else {
        const result = await executeApprovalMutation(approval.id);
        const executionMessage = (result.execution as { result?: { message?: string } } | undefined)?.result?.message;
        setFeedback(executionMessage ?? "Onayli islem execution zincirine gonderildi.");
      }
      router.refresh();
      if (action !== "execute") {
        setFeedback(action === "approve" ? "Onay kaydi onaylandi." : "Onay kaydi reddedildi.");
      }
    } catch {
      setFeedback("İşlem tamamlanamadı. Lütfen tekrar deneyin.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <section className="hz-content-card hz-approvals-detail-actions">
      <h3>Onay kararı</h3>
      <p className="muted">Kararlar denetim kaydına işlenir; geri alınamaz işlemlerde dikkatli ilerleyin.</p>
      <div className="hz-inline-actions">
        <button className="hz-btn hz-btn-primary" type="button" disabled={busyAction !== null} onClick={() => void runAction("approve")}>
          Onayla
        </button>
        <button className="hz-btn hz-btn-secondary" type="button" disabled={busyAction !== null} onClick={() => void runAction("reject")}>
          Reddet
        </button>
        <button className="hz-btn hz-btn-secondary" type="button" disabled={busyAction !== null} onClick={() => void runAction("execute")}>
          İşle
        </button>
        <button
          className="hz-btn hz-btn-secondary"
          type="button"
          onClick={() => router.push(approval.entityType === "delivery" ? `/teslimatlar/${approval.entityId}` : "/onaylar")}
        >
          İlgili kayda git
        </button>
      </div>
      {feedback ? <p className="muted" role="status">{feedback}</p> : null}
    </section>
  );
}

export function ApprovalDetailPage({ approval }: { approval: Approval }) {
  return (
    <EntityDetailLayout
      className="hz-approvals-detail-page"
      header={
        <PageHeader
          title="Onay detayı"
          description="Karar, hedef kayıt ve işlem özetini denetlenebilir şekilde görüntüleyin."
          breadcrumb={approval.approvalNo}
        />
      }
      summary={<div className="hz-approvals-detail-summary"><ApprovalHeaderInfo approval={approval} /></div>}
      sections={<ApprovalPayloadViewer approval={approval} />}
      sidebar={
        <>
          <ApprovalSummaryPanel approval={approval} />
          <ApprovalActionsBar approval={approval} />
        </>
      }
    />
  );
}
