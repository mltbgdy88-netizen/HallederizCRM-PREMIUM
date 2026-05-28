// @ts-nocheck
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WopConversation, WopConversationStatus } from "../data/whatsapp-operasyon-mock";
import { markReferenceClickHandled } from "../../../lib/reference/reference-page-interaction";
import { useReferenceToast } from "../../../lib/reference/use-reference-demo-action";

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

function conversationHref(conversationId: string): string {
  return `/gelen-kutu/konusma/${encodeURIComponent(conversationId)}`;
}

function ConversationRow({
  row,
  onDemo
}: {
  row: WopConversation;
  onDemo: (message: string, target?: EventTarget | null) => void;
}) {
  const router = useRouter();
  const href = conversationHref(row.id);

  return (
    <tr className={row.selected ? "wop-row wop-row--selected" : "wop-row"}>
      <td>
        <Link href={(href) ?? "#"} className="wop-conv-cell wop-conv-cell--link">
          <strong>#{row.code}</strong>
          <span>{row.phone}</span>
        </Link>
      </td>
      <td className="wop-td-customer">
        <Link href={(href) ?? "#"} className="wop-row-text-link">
          {row.customer}
        </Link>
      </td>
      <td>
        <Link href={(href) ?? "#"} className="wop-msg-cell wop-row-text-link">
          <span className="wop-msg-text">{row.lastMessage}</span>
          <span className="wop-msg-time">{row.lastTime}</span>
        </Link>
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
          <button
            type="button"
            className="wop-icon-btn"
            aria-label="KonuÅŸmaya git"
            onClick={(e) => {
              markReferenceClickHandled(e.currentTarget);
              router.push(href);
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
              <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
            </svg>
          </button>
          <button
            type="button"
            className="wop-icon-btn"
            aria-label="WhatsApp masasÄ±nda aÃ§"
            onClick={(e) => {
              markReferenceClickHandled(e.currentTarget);
              router.push("/whatsapp");
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
              <path d="M14 3h7v7M10 14 21 3M21 14v7h-7M3 10V3h7" />
            </svg>
          </button>
          <button
            type="button"
            className="wop-icon-btn"
            aria-label="DiÄŸer iÅŸlemler"
            onClick={(e) => onDemo("KonuÅŸma iÅŸlemleri menÃ¼sÃ¼ demo modunda.", e.currentTarget)}
          >
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
  const pushReferenceToast = useReferenceToast();

  return (
    <article className={className ? `wop-table-panel ${className}` : "wop-table-panel"}>
      <header className="wop-table-panel-head">
        <h2 className="wop-table-panel-title">Aktif KonuÅŸmalar</h2>
        <Link href="/whatsapp" className="wop-table-panel-link">
          WhatsApp MasasÄ±
        </Link>
      </header>
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
              <ConversationRow key={row.id} row={row} onDemo={pushReferenceToast} />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="wop-table-foot">
        <span>
          {pagination.range} / {pagination.total}
        </span>
        <nav className="wop-pager" aria-label="Sayfalama">
          <button
            type="button"
            className="wop-pager-btn"
            aria-label="Ã–nceki"
            onClick={(e) => pushReferenceToast("Ã–nceki sayfa (demo).", e.currentTarget)}
          >
            â€¹
          </button>
          <button type="button" className="wop-pager-num wop-pager-num--active">
            {pagination.page}
          </button>
          <button type="button" className="wop-pager-num" onClick={(e) => pushReferenceToast("Sayfa 2 (demo).", e.currentTarget)}>
            2
          </button>
          <button type="button" className="wop-pager-num" onClick={(e) => pushReferenceToast("Sayfa 3 (demo).", e.currentTarget)}>
            3
          </button>
          <span className="wop-pager-ellipsis">â€¦</span>
          <button type="button" className="wop-pager-num" onClick={(e) => pushReferenceToast("Son sayfa (demo).", e.currentTarget)}>
            15
          </button>
          <button
            type="button"
            className="wop-pager-btn"
            aria-label="Sonraki"
            onClick={(e) => pushReferenceToast("Sonraki sayfa (demo).", e.currentTarget)}
          >
            â€º
          </button>
        </nav>
      </footer>
    </article>
  );
}



