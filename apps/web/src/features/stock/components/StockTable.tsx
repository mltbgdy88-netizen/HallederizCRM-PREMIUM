// @ts-nocheck
"use client";

import { LucideIcon } from "../../../components/icons/lucide-icons";
import type { StockRow } from "../mappers/map-stock-row";
import { isStockDemoRowId } from "../data/stock-demo-rows";

export interface StockTableProps {
  rows: StockRow[];
  selectedProductId: string | null;
  onSelectProduct: (productId: string) => void;
  onOpenDetail: (row: StockRow) => void;
  onStockMovement: (row: StockRow) => void;
  onLabelAction: (row: StockRow) => void;
  onQuickOperation: (row: StockRow) => void;
  emptyFiltered?: boolean;
}

function statusBadgeClass(status: StockRow["displayStatus"]): string {
  switch (status) {
    case "kritik":
      return "hz-stock-badge hz-stock-badge--danger";
    case "tukeniyor":
      return "hz-stock-badge hz-stock-badge--warn";
    case "blokeli":
      return "hz-stock-badge hz-stock-badge--neutral";
    default:
      return "hz-stock-badge hz-stock-badge--ok";
  }
}

function statusLabel(status: StockRow["displayStatus"]): string {
  switch (status) {
    case "kritik":
      return "Kritik";
    case "tukeniyor":
      return "Tükeniyor";
    case "blokeli":
      return "Blokeli";
    default:
      return "Sağlıklı";
  }
}

export function StockTable({
  rows,
  selectedProductId,
  onSelectProduct,
  onOpenDetail,
  onStockMovement,
  onLabelAction,
  onQuickOperation,
  emptyFiltered
}: StockTableProps) {
  return (
    <section className="hz-stock-table-card">
      <div className="hz-stock-table-wrap">
        <table className="hz-stock-table">
          <thead>
            <tr>
              <th>Ürün</th>
              <th>Merkez Stok</th>
              <th>Fabrika Stok</th>
              <th>Depo / Raf</th>
              <th>Fiyat</th>
              <th>Durum</th>
              <th>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.productId}
                className={`hz-stock-row ${selectedProductId === row.productId ? "is-selected" : ""}`}
                onClick={() => onSelectProduct(row.productId)}
              >
                <td className="hz-stock-cell-product">
                  <div className="hz-stock-product-block">
                    <span className="hz-stock-thumb" aria-hidden>
                      <LucideIcon name="package" size={14} />
                    </span>
                    <div className="hz-stock-product-text">
                      <span className="hz-stock-code">{row.productCode}</span>
                      <span className="hz-stock-name">{row.productName}</span>
                      <span className="hz-stock-sub">{row.productSubline}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="hz-stock-strong">{row.centerWarehouseStockTotal}</span>
                  <span className="hz-stock-muted">{row.centerDetailLine}</span>
                </td>
                <td>
                  <span className="hz-stock-strong">{row.factoryStockTotal}</span>
                  <span className="hz-stock-muted">{row.factorySubline}</span>
                </td>
                <td>
                  <span className="hz-stock-strong">{row.depotDisplayName}</span>
                  <span className="hz-stock-muted">{row.rackDisplayLine}</span>
                </td>
                <td>
                  <span className="hz-stock-strong">{row.priceMainLine}</span>
                  <span className="hz-stock-muted">{row.priceSubLine}</span>
                </td>
                <td>
                  <span className={statusBadgeClass(row.displayStatus)}>{statusLabel(row.displayStatus)}</span>
                </td>
                <td className="hz-stock-row-actions" onClick={(event) => event.stopPropagation()}>
                  <button type="button" className="hz-stock-row-action hz-stock-row-action--link" onClick={() => onOpenDetail(row)} title="Detay">
                    Detay
                  </button>
                  <button type="button" className="hz-stock-row-action hz-stock-row-action--link" onClick={() => onStockMovement(row)} title="Stok hareketi">
                    Stok
                  </button>
                  <button type="button" className="hz-stock-row-action hz-stock-row-action--link" onClick={() => onLabelAction(row)} title="Etiket">
                    Etiket
                  </button>
                  {isStockDemoRowId(row.productId) ? null : (
                    <button
                      type="button"
                      className="hz-stock-row-action hz-stock-row-action--icon"
                      onClick={() => onQuickOperation(row)}
                      title="Hızlı işlem"
                      aria-label="Hızlı işlem"
                    >
                      <LucideIcon name="zap" size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {rows.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="table-empty">
                    {emptyFiltered ? "Filtrelere uygun ürün bulunamadı." : "Kayıt yok."}
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}


