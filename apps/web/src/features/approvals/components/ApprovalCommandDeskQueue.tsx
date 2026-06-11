"use client";

import { LucideIcon, type LucideIconName } from "../../../components/icons/lucide-icons";
import {
  approvalRiskLabel,
  approvalSourceFromRecord,
  approvalSourceLabel,
  formatQueueTime,
  type ApprovalSourceFilter
} from "../utils/approval-command-desk-present";
import type { ApprovalInboxRecord } from "./inbox/types";

const SOURCE_CHIPS: { id: ApprovalSourceFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "ai", label: "AI" },
  { id: "automation", label: "Otomasyon" },
  { id: "message", label: "Mesaj" },
  { id: "high_risk", label: "Yüksek Risk" }
];

function sourceIcon(kind: ReturnType<typeof approvalSourceFromRecord>): LucideIconName {
  if (kind === "ai") return "sparkles";
  if (kind === "message") return "message-circle";
  return "settings";
}

type ApprovalCommandDeskQueueProps = {
  rows: ApprovalInboxRecord[];
  selectedId: string | null;
  searchQuery: string;
  sourceFilter: ApprovalSourceFilter;
  onSearchChange: (value: string) => void;
  onSourceFilterChange: (filter: ApprovalSourceFilter) => void;
  onSelect: (id: string) => void;
};

export function ApprovalCommandDeskQueue({
  rows,
  selectedId,
  searchQuery,
  sourceFilter,
  onSearchChange,
  onSourceFilterChange,
  onSelect
}: ApprovalCommandDeskQueueProps) {
  return (
    <section className="hz-approval-queue hz-approval-panel" aria-label="Onay kuyruğu">
      <header className="hz-approval-panel__head">
        <div>
          <h2 className="hz-approval-panel__title">Onay Kuyruğu</h2>
          <p className="hz-approval-panel__meta">{rows.length} kayıt</p>
        </div>
        <button type="button" className="hz-approval-icon-btn" aria-label="Filtreler" title="Filtreler">
          <LucideIcon name="filter" size={14} />
        </button>
      </header>

      <input
        id="hz-approval-queue-search"
        type="search"
        className="hz-approval-queue__search"
        placeholder="Onay, cari veya kayıt ara..."
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label="Onay ara"
      />

      <div className="hz-approval-queue__chips" role="toolbar" aria-label="Kaynak filtreleri">
        {SOURCE_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`hz-approval-queue__chip${sourceFilter === chip.id ? " is-active" : ""}`}
            onClick={() => onSourceFilterChange(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="hz-approval-queue__list" role="listbox" aria-label="Onay kayıtları">
        {rows.map((row) => {
          const source = approvalSourceFromRecord(row);
          const risk = approvalRiskLabel(row);
          return (
            <button
              key={row.id}
              type="button"
              role="option"
              aria-selected={selectedId === row.id}
              className={`hz-approval-queue-item${selectedId === row.id ? " is-active" : ""}`}
              onClick={() => onSelect(row.id)}
            >
              <div className="hz-approval-queue-item__top">
                <span className={`hz-approval-source-badge hz-approval-source-badge--${source}`}>
                  <LucideIcon name={sourceIcon(source)} size={13} />
                  {approvalSourceLabel(source)}
                </span>
                <time className="hz-approval-queue-item__time">{formatQueueTime(row)}</time>
              </div>
              <strong className="hz-approval-queue-item__title">{row.title}</strong>
              <span className="hz-approval-queue-item__customer">
                <span className="hz-approval-queue-item__customer-label">Cari</span>
                {row.customerName}
              </span>
              <div className="hz-approval-queue-item__foot">
                <span className="hz-approval-queue-item__amount">{row.amountLabel}</span>
                <span
                  className={`hz-approval-risk-pill hz-approval-risk-pill--${risk === "Yüksek" ? "high" : risk === "Orta" ? "mid" : "low"}`}
                >
                  {risk}
                </span>
              </div>
            </button>
          );
        })}
        {rows.length === 0 ? (
          <p className="hz-approval-queue__empty">Filtreye uygun onay kaydı bulunamadı.</p>
        ) : null}
      </div>
    </section>
  );
}
