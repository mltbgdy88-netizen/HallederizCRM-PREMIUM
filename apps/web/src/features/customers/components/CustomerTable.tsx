import type { CustomerRow } from "../mappers/map-customer-row";
import {
  IconExternalLink,
  IconMessageCircle,
  IconPlusCircle,
  IconUpload,
  IconUser,
  IconZap
} from "../../dashboard/components/dashboard-inline-icons";

export interface CustomerTableProps {
  rows: CustomerRow[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string) => void;
  onOpenCustomer: (customerId: string) => void;
  onQuickOperation: (customerId: string) => void;
  onWhatsApp: (customerId: string) => void;
  /** No rows after filters (real portfolio only). */
  emptyFiltered?: boolean;
  onEmptyNew?: () => void;
  onEmptyImport?: () => void;
}

export function CustomerTable({
  rows,
  selectedCustomerId,
  onSelectCustomer,
  onOpenCustomer,
  onQuickOperation,
  onWhatsApp,
  emptyFiltered,
  onEmptyNew,
  onEmptyImport
}: CustomerTableProps) {
  return (
    <div className="hz-customers-list" role="list" aria-label="Cari portföy listesi">
      <div className="hz-customers-list-header" aria-hidden>
        <span className="hz-customers-col--hdr hz-customers-col--cari">Cari</span>
        <span className="hz-customers-col--hdr hz-customers-col--price">Fiyat grubu</span>
        <span className="hz-customers-col--hdr hz-customers-col--bal">Bakiye</span>
        <span className="hz-customers-col--hdr hz-customers-col--risk">Risk</span>
        <span className="hz-customers-col--hdr hz-customers-col--wa">WhatsApp</span>
        <span className="hz-customers-col--hdr hz-customers-col--last">Son işlem</span>
        <span className="hz-customers-col--hdr hz-customers-col--act">Aksiyon</span>
      </div>
      <div className="hz-customers-list-body">
        {rows.length === 0 ? (
          emptyFiltered ? (
            <div className="hz-customers-empty" role="status">
              <p className="hz-customers-empty-title">Filtrelere uygun cari yok</p>
              <p className="hz-customers-empty-text">Filtreleri sıfırlayarak veya arama metnini daraltarak tekrar deneyin.</p>
            </div>
          ) : (
            <div className="hz-customers-empty" role="status">
              <p className="hz-customers-empty-title">Henüz cari kaydı yok</p>
              <p className="hz-customers-empty-text">Yeni cari ekleyerek veya içe aktararak portföyü başlatın.</p>
              {(onEmptyNew || onEmptyImport) && (
                <div className="hz-customers-empty-actions">
                  {onEmptyNew ? (
                    <button type="button" className="hz-customers-toolbar-btn hz-customers-toolbar-btn--primary" onClick={onEmptyNew}>
                      <IconPlusCircle size={16} />
                      Yeni Cari
                    </button>
                  ) : null}
                  {onEmptyImport ? (
                    <button type="button" className="hz-customers-toolbar-btn hz-customers-toolbar-btn--outline" onClick={onEmptyImport}>
                      <IconUpload size={16} />
                      İçe Aktar
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          )
        ) : (
          rows.map((row) => {
            const selected = selectedCustomerId === row.customerId;
            return (
              <div
                key={row.customerId}
                role="listitem"
                tabIndex={0}
                className={`hz-customers-row ${selected ? "hz-customers-row--selected" : ""}`}
                onClick={() => onSelectCustomer(row.customerId)}
                onDoubleClick={() => onOpenCustomer(row.customerId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectCustomer(row.customerId);
                  }
                }}
              >
                <span className="hz-customers-col hz-customers-col--cari">
                  <span className="hz-customers-row-ico" aria-hidden>
                    <IconUser size={16} />
                  </span>
                  <span className="hz-customers-row-cari-text">
                    <span className="hz-customers-row-name">{row.name}</span>
                    <span className="hz-customers-row-sub">
                      {row.code} · {row.typeLabel} · {row.city}
                    </span>
                  </span>
                </span>
                <span className="hz-customers-col hz-customers-col--price">
                  <span className="hz-customers-muted">{row.priceGroupLabel}</span>
                </span>
                <span className="hz-customers-col hz-customers-col--bal">
                  <span className="hz-customers-bal-line hz-customers-bal-line--rec">{row.balanceCreditLine}</span>
                  <span className="hz-customers-bal-line hz-customers-bal-line--pay">{row.balanceDebitLine}</span>
                </span>
                <span className="hz-customers-col hz-customers-col--risk">
                  <span className={`hz-customers-badge hz-customers-badge--risk-${row.riskTone}`}>{row.riskLabel}</span>
                </span>
                <span className="hz-customers-col hz-customers-col--wa">
                  <span className={`hz-customers-badge ${row.whatsappMatched ? "hz-customers-badge--wa-yes" : "hz-customers-badge--wa-no"}`}>
                    {row.whatsappMatched ? "Eşleşti" : "Eşleşmedi"}
                  </span>
                </span>
                <span className="hz-customers-col hz-customers-col--last">
                  <span className="hz-customers-last-l1">Sipariş</span>
                  <span className="hz-customers-last-l2">{row.lastOrderLabel}</span>
                </span>
                <span className="hz-customers-col hz-customers-col--act">
                  <span className="hz-customers-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="hz-customers-act-btn hz-customers-act-btn--primary"
                      onClick={() => onOpenCustomer(row.customerId)}
                    >
                      <IconExternalLink size={14} />
                      Detay
                    </button>
                    <button
                      type="button"
                      className="hz-customers-act-btn hz-customers-act-btn--icon"
                      title="Hızlı işlem"
                      aria-label="Hızlı işlem"
                      onClick={() => onQuickOperation(row.customerId)}
                    >
                      <IconZap size={15} />
                    </button>
                    <button
                      type="button"
                      className="hz-customers-act-btn hz-customers-act-btn--wa"
                      title="WhatsApp"
                      aria-label="WhatsApp"
                      onClick={() => onWhatsApp(row.customerId)}
                    >
                      <IconMessageCircle size={14} />
                      WA
                    </button>
                  </span>
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
