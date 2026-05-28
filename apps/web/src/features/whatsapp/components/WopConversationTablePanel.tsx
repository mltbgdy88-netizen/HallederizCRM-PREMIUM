// @ts-nocheck
"use client";

import type { WopConversation, WopConversationStatus } from "@/features/whatsapp/data/whatsapp-operasyon-mock";

export type WopConversationTablePagination = {
  range: string;
  total: string;
  page: number;
};

function statusClass(status: WopConversationStatus): string {
  switch (status) {
    case "Onay Bekliyor":
      return "wop-badge wop-badge--approval";
    case "Beklemede":
      return "wop-badge wop-badge--hold";
    case "Aktif":
      return "wop-badge wop-badge--active";
    default:
      return "wop-badge wop-badge--done";
  }
}

function ConversationRow({ row }: { row: WopConversation }) {
  return (
    <tr className={row.selected ? "wop-row wop-row--selected" : "wop-row"}>
      <td>
        <div className="wop-conv-cell">
          <strong>#{row.code}</strong>
          <span>{row.phone}</span>
        </div>
      </td>
      <td className="wop-td-customer">{row.customer}</td>
      <td>
        <div className="wop-msg-cell">
          <span className="wop-msg-text">{row.lastMessage}</span>
          <span className="wop-msg-time">{row.lastTime}</span>
        </div>
      </td>
      <td>
        <span className={statusClass(row.status)}>{row.status}</span>
      </td>
      <td>
        <span className={`wop-sla wop-sla--${row.slaTone}`}>
          <span className="wop-sla-dot" aria-hidden />
          {row.sla}
        </span>
      </td>
      <td>
        <div className="wop-row-actions">
          <button type="button" className="wop-icon-btn" aria-label="Mesaj">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
              <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
            </svg>
          </button>
          <button type="button" className="wop-icon-btn" aria-label="Yeni sekmede aÃ§">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
              <path d="M14 3h7v7M10 14 21 3M21 14v7h-7M3 10V3h7" />
            </svg>
          </button>
          <button type="button" className="wop-icon-btn" aria-label="DiÄŸer">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

export function WopConversationTablePanel({
  conversations,
  pagination,
  className
}: {
  conversations: WopConversation[];
  pagination: WopConversationTablePagination;
  className?: string;
}) {
  return (
    <article className={className ? `wop-table-panel ${className}` : "wop-table-panel"}>
      <div className="wop-table-wrap">
        <table className="wop-table">
          <thead>
            <tr>
              <th>KonuÅŸma</th>
              <th>Cari</th>
              <th>Son Mesaj</th>
              <th>Durum</th>
              <th>SLA</th>
              <th>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((row) => (
              <ConversationRow key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="wop-table-foot">
        <span>
          {pagination.range} / {pagination.total}
        </span>
        <nav className="wop-pager" aria-label="Sayfalama">
          <button type="button" className="wop-pager-btn" aria-label="Ã–nceki">
            â€¹
          </button>
          <button type="button" className="wop-pager-num wop-pager-num--active">
            {pagination.page}
          </button>
          <button type="button" className="wop-pager-num">
            2
          </button>
          <button type="button" className="wop-pager-num">
            3
          </button>
          <span className="wop-pager-ellipsis">â€¦</span>
          <button type="button" className="wop-pager-num">
            15
          </button>
          <button type="button" className="wop-pager-btn" aria-label="Sonraki">
            â€º
          </button>
        </nav>
      </footer>
    </article>
  );
}

