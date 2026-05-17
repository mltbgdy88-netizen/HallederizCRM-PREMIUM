import type { ReactNode } from "react";
import { IconRotateCcw } from "../../../dashboard/components/dashboard-inline-icons";
import { ApprovalInboxViewIcon } from "./approval-inbox-view-icons";
import type { ApprovalInboxRecord, ApprovalInboxViewId } from "./types";

const VIEW_DEFS: { id: ApprovalInboxViewId; label: string }[] = [
  { id: "kritik", label: "Kritik" },
  { id: "bana_atanan", label: "Bana Atananlar" },
  { id: "finans", label: "Finans" },
  { id: "operasyon", label: "Operasyon" },
  { id: "ai_onerileri", label: "AI \u00d6nerileri" },
  { id: "tum", label: "T\u00fcm Onaylar" },
  { id: "yakin_sonuclanan", label: "Yak\u0131n Zamanda Sonu\u00e7lananlar" }
];

export type ApprovalInboxFilterState = {
  status: string;
  priority: string;
  approvalType: string;
  assignee: string;
  tenantBranch: string;
  dateRange: string;
};

export const DEFAULT_APPROVAL_INBOX_FILTERS: ApprovalInboxFilterState = {
  status: "tumu",
  priority: "tumu",
  approvalType: "tumu",
  assignee: "tumu",
  tenantBranch: "tumu",
  dateRange: "son_7"
};

type ApprovalSidebarProps = {
  activeView: ApprovalInboxViewId;
  onViewChange: (view: ApprovalInboxViewId) => void;
  filters: ApprovalInboxFilterState;
  onFilterChange: <K extends keyof ApprovalInboxFilterState>(key: K, value: ApprovalInboxFilterState[K]) => void;
  onClearFilters: () => void;
  onSaveView: () => void;
  rows: ApprovalInboxRecord[];
};

export function ApprovalSidebar({
  activeView,
  onViewChange,
  filters,
  onFilterChange,
  onClearFilters,
  onSaveView,
  rows
}: ApprovalSidebarProps) {
  return (
    <aside className="hz-approvals-inbox-desk-side" aria-label="Görünümler ve filtreler">
      <section className="hz-approvals-inbox-desk-side-block">
        <h2 className="hz-approvals-inbox-desk-side-title">Görünümler</h2>
        <ul className="hz-approvals-inbox-desk-views" role="list">
          {VIEW_DEFS.map((view) => (
            <li key={view.id}>
              <button
                type="button"
                className={`hz-approvals-inbox-desk-view${activeView === view.id ? " is-active" : ""}`}
                onClick={() => onViewChange(view.id)}
              >
                <span className="hz-approvals-inbox-desk-view-label">
                  <ApprovalInboxViewIcon viewId={view.id} />
                  <span>{view.label}</span>
                </span>
                <span className="hz-approvals-inbox-desk-view-count">
                  {rows.filter((row) => row.viewTags.includes(view.id)).length}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="hz-approvals-inbox-desk-side-block">
        <h2 className="hz-approvals-inbox-desk-side-title">Filtreler</h2>
        <div className="hz-approvals-inbox-desk-filters">
          <FilterAccordion label="Durum">
            <FilterSelect value={filters.status} onChange={(v) => onFilterChange("status", v)}>
              <option value="tumu">Tümü</option>
              <option value="bekliyor">Bekliyor</option>
              <option value="incelemede">İncelemede</option>
              <option value="onay_bekliyor">Onay Bekliyor</option>
              <option value="sure_asildi">Süre Aşıldı</option>
            </FilterSelect>
          </FilterAccordion>
          <FilterAccordion label="Öncelik">
            <FilterSelect value={filters.priority} onChange={(v) => onFilterChange("priority", v)}>
              <option value="tumu">Tümü</option>
              <option value="kritik">Kritik</option>
              <option value="yuksek">Yüksek</option>
              <option value="orta">Orta</option>
              <option value="dusuk">Düşük</option>
              <option value="ai">AI Önerisi</option>
            </FilterSelect>
          </FilterAccordion>
          <FilterAccordion label="Onay Türü">
            <FilterSelect value={filters.approvalType} onChange={(v) => onFilterChange("approvalType", v)}>
              <option value="tumu">Tümü</option>
              <option value="iade">İade</option>
              <option value="tahsilat">Tahsilat / Ödeme</option>
              <option value="satis">Satış / Fiyat</option>
              <option value="finans">Finans</option>
              <option value="belge">Belge</option>
              <option value="siparis">Sipariş</option>
              <option value="ai">AI</option>
            </FilterSelect>
          </FilterAccordion>
          <FilterAccordion label="Atanan Kişi">
            <FilterSelect value={filters.assignee} onChange={(v) => onFilterChange("assignee", v)}>
              <option value="tumu">Tümü</option>
              <option value="taner">Taner Yılmaz</option>
              <option value="fuat">Fuat Yılmaz</option>
              <option value="kubra">Kübra Yıldız</option>
              <option value="merve">Merve Yılmaz</option>
            </FilterSelect>
          </FilterAccordion>
          <FilterAccordion label="Tenant / Şube">
            <FilterSelect value={filters.tenantBranch} onChange={(v) => onFilterChange("tenantBranch", v)}>
              <option value="tumu">Tümü</option>
              <option value="merkez">Merkez</option>
              <option value="izmir">İzmir</option>
              <option value="bursa">Bursa</option>
              <option value="ankara">Ankara</option>
            </FilterSelect>
          </FilterAccordion>
          <FilterAccordion label="Tarih Aralığı">
            <FilterSelect value={filters.dateRange} onChange={(v) => onFilterChange("dateRange", v)}>
              <option value="son_7">Son 7 Gün</option>
              <option value="son_30">Son 30 Gün</option>
              <option value="bu_ay">Bu Ay</option>
            </FilterSelect>
          </FilterAccordion>
        </div>
      </section>

      <div className="hz-approvals-inbox-desk-side-foot">
        <button type="button" className="hz-approvals-inbox-desk-link-btn" onClick={onClearFilters}>
          <IconRotateCcw size={12} aria-hidden />
          Filtreleri Temizle
        </button>
        <button type="button" className="hz-approvals-inbox-desk-save-btn" onClick={onSaveView}>
          Görünümü Kaydet
        </button>
      </div>
    </aside>
  );
}

function FilterAccordion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="hz-approvals-inbox-desk-filter-acc">
      <summary>{label}</summary>
      <div className="hz-approvals-inbox-desk-filter-acc-body">{children}</div>
    </details>
  );
}

function FilterSelect({
  value,
  onChange,
  children
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select className="hz-approvals-inbox-desk-input" value={value} onChange={(event) => onChange(event.target.value)}>
      {children}
    </select>
  );
}
