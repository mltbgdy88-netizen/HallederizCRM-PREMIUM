import type { ApprovalInboxRecord } from "./types";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

/** Sabit kolon genişlikleri — orta alan içinde yatay scroll ile korunur */
const TABLE_COLS = "32px 74px 156px 128px 100px 116px 72px 88px";
const TABLE_MIN_WIDTH_PX = 790;

type ApprovalTableProps = {
  rows: ApprovalInboxRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function ApprovalTable({
  rows,
  selectedId,
  onSelect,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange
}: ApprovalTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <section className="hz-approvals-inbox-desk-table-wrap" aria-label="Onay listesi">
      <div className="hz-approvals-inbox-desk-table-scroll">
        <div className="hz-approvals-inbox-desk-table-inner" style={{ minWidth: TABLE_MIN_WIDTH_PX }}>
          <div className="hz-approvals-inbox-desk-table-head" style={{ gridTemplateColumns: TABLE_COLS }}>
            <span className="hz-approvals-inbox-desk-cell--check" aria-hidden />
            <span title="Öncelik">Öncelik</span>
            <span title="Onay">Onay</span>
            <span title="Müşteri / Firma">Müşteri</span>
            <span title="Tutar / Etki">Tutar</span>
            <span title="Atanan kişi">Atanan</span>
            <span title="Güncellendi">Güncel.</span>
            <span title="Durum">Durum</span>
          </div>

          <div className="hz-approvals-inbox-desk-table-body" role="listbox" aria-label="Onay kayıtları">
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                role="option"
                aria-selected={selectedId === row.id}
                className={`hz-approvals-inbox-desk-row${selectedId === row.id ? " is-selected" : ""}${row.priority === "kritik" || row.slaBreached ? " is-critical" : ""}${row.priority === "ai" ? " is-ai" : ""}`}
                style={{ gridTemplateColumns: TABLE_COLS }}
                onClick={() => onSelect(row.id)}
              >
                <span className="hz-approvals-inbox-desk-cell hz-approvals-inbox-desk-cell--check">
                  <input
                    type="checkbox"
                    className="hz-approvals-inbox-desk-row-check"
                    aria-label={`${row.title} seç`}
                    checked={selectedId === row.id}
                    onChange={() => onSelect(row.id)}
                    onClick={(event) => event.stopPropagation()}
                  />
                </span>
                <span className="hz-approvals-inbox-desk-cell">
                  <PriorityBadge priority={row.priority} />
                </span>
                <span className="hz-approvals-inbox-desk-cell hz-approvals-inbox-desk-cell--title">
                  <strong>{row.title}</strong>
                  <small>{row.approvalNo}</small>
                </span>
                <span className="hz-approvals-inbox-desk-cell hz-approvals-inbox-desk-cell--customer">
                  {row.customerName}
                </span>
                <span className="hz-approvals-inbox-desk-cell hz-approvals-inbox-desk-cell--num">{row.amountLabel}</span>
                <span className="hz-approvals-inbox-desk-cell hz-approvals-inbox-desk-cell--assignee">
                  <span className="hz-approvals-inbox-desk-avatar" aria-hidden>
                    {initials(row.assigneeName)}
                  </span>
                  <span>
                    <strong>{row.assigneeName}</strong>
                    <small>{row.assigneeRole}</small>
                  </span>
                </span>
                <span className="hz-approvals-inbox-desk-cell hz-approvals-inbox-desk-cell--updated">
                  {formatUpdated(row.updatedAt)}
                </span>
                <span className="hz-approvals-inbox-desk-cell">
                  <StatusBadge status={row.status} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="hz-approvals-inbox-desk-pagination">
        <p className="hz-approvals-inbox-desk-pagination-meta">
          {from} - {to} / {totalCount} kayıt gösteriliyor
        </p>
        <div className="hz-approvals-inbox-desk-pagination-nav" aria-label="Sayfalama">
          <button
            type="button"
            className="hz-approvals-inbox-desk-page-btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Önceki sayfa"
          >
            ‹
          </button>
          {buildPageButtons(page, totalPages).map((token, index) =>
            token === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="hz-approvals-inbox-desk-page-ellipsis">
                …
              </span>
            ) : (
              <button
                key={token}
                type="button"
                className={`hz-approvals-inbox-desk-page-btn${page === token ? " is-active" : ""}`}
                onClick={() => onPageChange(token)}
              >
                {token}
              </button>
            )
          )}
          <button
            type="button"
            className="hz-approvals-inbox-desk-page-btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Sonraki sayfa"
          >
            ›
          </button>
        </div>
        <label className="hz-approvals-inbox-desk-page-size">
          <select
            className="hz-approvals-inbox-desk-input"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            aria-label="Sayfa başına kayıt"
          >
            <option value={10}>10 / sayfa</option>
            <option value={20}>20 / sayfa</option>
          </select>
        </label>
      </footer>
    </section>
  );
}

function formatUpdated(value: string) {
  const [datePart, timePart] = value.split(" ");
  if (!timePart) {
    return <>{value}</>;
  }
  return (
    <>
      <strong>{timePart}</strong>
      <small>{datePart}</small>
    </>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function buildPageButtons(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: Array<number | "ellipsis"> = [1];
  if (current > 3) pages.push("ellipsis");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p += 1) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

