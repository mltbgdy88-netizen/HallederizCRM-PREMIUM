import { IconRotateCcw } from "../../../dashboard/components/dashboard-inline-icons";

type ApprovalInboxHeaderProps = {
  pendingCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onlyCritical: boolean;
  onOnlyCriticalChange: (value: boolean) => void;
  onRefresh: () => void;
  refreshing: boolean;
  lastSyncLabel?: string;
};

export function ApprovalInboxHeader({
  pendingCount,
  searchQuery,
  onSearchChange,
  onlyCritical,
  onOnlyCriticalChange,
  onRefresh,
  refreshing,
  lastSyncLabel = "-"
}: ApprovalInboxHeaderProps) {
  return (
    <header className="hz-approvals-inbox-desk-head">
      <div className="hz-approvals-inbox-desk-head-left">
        <div className="hz-approvals-inbox-desk-head-title-row">
          <h1 className="hz-approvals-inbox-desk-title">Onay Kutusu</h1>
          <span className="hz-approvals-inbox-desk-head-badge">{pendingCount} bekleyen</span>
        </div>
        <p className="hz-approvals-inbox-desk-subtitle">Finans, operasyon, satış ve belge onayları</p>
      </div>

      <div className="hz-approvals-inbox-desk-head-right" aria-label="Üst araçlar">
        <input
          type="search"
          className="hz-approvals-inbox-desk-input hz-approvals-inbox-desk-input--search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Ara: müşteri, onay no, belge…"
          aria-label="Onay ara"
        />
        <label className="hz-approvals-inbox-desk-toggle">
          <input type="checkbox" checked={onlyCritical} onChange={(event) => onOnlyCriticalChange(event.target.checked)} />
          <span>Sadece Kritikler</span>
        </label>
        <button type="button" className="hz-approvals-inbox-desk-btn" onClick={onRefresh} disabled={refreshing}>
          <IconRotateCcw size={13} className="hz-approvals-inbox-desk-btn-ico" aria-hidden />
          Yenile
        </button>
        <p className="hz-approvals-inbox-desk-sync" role="status">
          <span className="hz-approvals-inbox-desk-sync-dot" aria-hidden />
          Son senkronizasyon: {lastSyncLabel}
        </p>
      </div>
    </header>
  );
}
