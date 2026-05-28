// @ts-nocheck
"use client";

import Link from "next/link";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import type { OrdersDeskBadgeTone, OrdersDeskChip, OrdersDeskRow } from "../utils/orders-desk-view-model";
import { ORDERS_DESK_CHIPS } from "../utils/orders-desk-view-model";

function badgeClass(tone: OrdersDeskBadgeTone): string {
  if (tone === "success") return "hz-orders-badge hz-orders-badge--success";
  if (tone === "danger") return "hz-orders-badge hz-orders-badge--danger";
  if (tone === "gold") return "hz-orders-badge hz-orders-badge--gold";
  if (tone === "info") return "hz-orders-badge hz-orders-badge--info";
  if (tone === "warning") return "hz-orders-badge hz-orders-badge--warning";
  return "hz-orders-badge hz-orders-badge--muted";
}

type OrdersDeskListProps = {
  rows: OrdersDeskRow[];
  totalCount: number;
  selectedOrderId: string | null;
  searchQuery: string;
  deskChip: OrdersDeskChip;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onDeskChipChange: (chip: OrdersDeskChip) => void;
  onResetFilters: () => void;
  onSelectOrder: (orderId: string) => void;
};

export function OrdersDeskList({
  rows,
  totalCount,
  selectedOrderId,
  searchQuery,
  deskChip,
  loading,
  onSearchChange,
  onDeskChipChange,
  onResetFilters,
  onSelectOrder
}: OrdersDeskListProps) {
  return (
    <section className="hz-orders-card hz-orders-list" aria-label="SipariÅŸ listesi">
      <header className="hz-orders-card__head">
        <h2 className="hz-orders-card__title">SipariÅŸ Listesi</h2>
        <span className="hz-orders-card__meta">{totalCount} kayÄ±t</span>
      </header>

      <div className="hz-orders-toolbar" role="toolbar" aria-label="Liste filtreleri">
        <label className="hz-orders-search-wrap">
          <LucideIcon name="search" size={14} />
          <input
            type="search"
            className="hz-orders-search"
            placeholder="SipariÅŸ no veya cari ara..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="SipariÅŸ ara"
          />
        </label>
        <div className="hz-orders-toolbar__chips">
          {ORDERS_DESK_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={`hz-orders-toolbar__chip${deskChip === chip.id ? " is-active" : ""}`}
              onClick={() => onDeskChipChange(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="hz-orders-toolbar__clear"
          onClick={onResetFilters}
          title="Filtreleri sÄ±fÄ±rla"
          aria-label="Filtreleri sÄ±fÄ±rla"
        >
          <LucideIcon name="x" size={13} />
        </button>
      </div>

      <div className="hz-orders-table-wrap">
        {loading ? (
          <p className="hz-orders-list__loading">SipariÅŸler yÃ¼kleniyorâ€¦</p>
        ) : (
          <table className="hz-orders-table">
            <thead>
              <tr>
                <th>SipariÅŸ No</th>
                <th>Cari</th>
                <th>Tarih</th>
                <th>Durum</th>
                <th>Tutar</th>
                <th>Ã–deme</th>
                <th>Teslimat</th>
                <th>Fatura</th>
                <th>Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.orderId}
                  className={`hz-orders-row${selectedOrderId === row.orderId ? " is-selected" : ""}`}
                  onClick={() => onSelectOrder(row.orderId)}
                >
                  <td>
                    <strong className="hz-orders-row__order">{row.orderNo}</strong>
                    <span className="hz-orders-row__hint">{row.channelHint}</span>
                  </td>
                  <td>{row.customerName}</td>
                  <td>{row.dateLabel}</td>
                  <td>
                    <span className={badgeClass(row.statusTone)}>{row.statusLabel}</span>
                  </td>
                  <td>{row.totalLabel}</td>
                  <td>
                    <span className={badgeClass(row.paymentTone)}>{row.paymentLabel}</span>
                  </td>
                  <td>
                    <span className={badgeClass(row.shipmentTone)}>{row.shipmentLabel}</span>
                  </td>
                  <td>
                    <span className={badgeClass(row.invoiceTone)}>{row.invoiceLabel}</span>
                  </td>
                  <td className="hz-orders-row__actions" onClick={(event) => event.stopPropagation()}>
                    <Link href={`/siparisler/${row.orderId}`} className="hz-orders-link-action">
                      <LucideIcon name="eye" size={13} />
                      Detay
                    </Link>
                    <Link href={`/hizli-islem?order=${encodeURIComponent(row.orderId)}`} className="hz-orders-link-action">
                      <LucideIcon name="zap" size={13} />
                      HÄ±zlÄ± Ä°ÅŸlem
                    </Link>
                    <Link href={`/belgeler?order=${encodeURIComponent(row.orderId)}`} className="hz-orders-link-action">
                      <LucideIcon name="file-text" size={13} />
                      Belge
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <p className="hz-orders-list__empty">Filtreye uygun sipariÅŸ bulunamadÄ±.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalCount > 0 ? (
        <footer className="hz-orders-list__footer" aria-live="polite">
          Toplam {totalCount} kayÄ±ttan 1â€“{totalCount} arasÄ± gÃ¶steriliyor
        </footer>
      ) : null}
    </section>
  );
}

