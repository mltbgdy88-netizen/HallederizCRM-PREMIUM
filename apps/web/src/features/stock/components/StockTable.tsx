"use client";

import { IconFileText, IconTag, IconZap } from "../../dashboard/components/dashboard-inline-icons";
import type { StockRow } from "../mappers/map-stock-row";
import { isStockDemoRowId } from "../data/stock-demo-rows";

export interface StockTableProps {
  rows: StockRow[];
  selectedProductId: string | null;
  onSelectProduct: (productId: string) => void;
  onOpenDetail: (row: StockRow) => void;
  onStockMovement: (row: StockRow) => void;
  onLabelAction: (row: StockRow) => void;
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
  emptyFiltered
}: StockTableProps) {
  return (
    <div className="hz-stock-list" role="list" aria-label="Ürün stok listesi">
      <div className="hz-stock-list-header" aria-hidden>
        <span className="hz-stock-list-hdr hz-stock-list-hdr--product">Ürün</span>
        <span className="hz-stock-list-hdr hz-stock-list-hdr--center">Merkez stok</span>
        <span className="hz-stock-list-hdr hz-stock-list-hdr--factory">Fabrika stok</span>
        <span className="hz-stock-list-hdr hz-stock-list-hdr--loc">Depo / raf</span>
        <span className="hz-stock-list-hdr hz-stock-list-hdr--price">Fiyat</span>
        <span className="hz-stock-list-hdr hz-stock-list-hdr--status">Durum</span>
        <span className="hz-stock-list-hdr hz-stock-list-hdr--act">Aksiyon</span>
      </div>
      <div className="hz-stock-list-body">
        {rows.length === 0 ? (
          <div className="hz-stock-empty" role="status">
            <p className="hz-stock-empty-title">{emptyFiltered ? "Filtrelere uygun ürün yok" : "Kayıt yok"}</p>
            <p className="hz-stock-empty-text">
              {emptyFiltered
                ? "Filtreleri sıfırlayarak veya arama metnini daraltarak tekrar deneyin."
                : "Katalog boş veya veri henüz yüklenmedi."}
            </p>
          </div>
        ) : (
          rows.map((row) => {
            const selected = selectedProductId === row.productId;
            return (
              <div
                key={row.productId}
                role="listitem"
                className={`hz-stock-row${selected ? " hz-stock-row--selected" : ""}`}
                onClick={() => onSelectProduct(row.productId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectProduct(row.productId);
                  }
                }}
                tabIndex={0}
              >
                <div className="hz-stock-cell hz-stock-cell--product">
                  <div className="hz-stock-product-block">
                    <span className="hz-stock-code">{row.productCode}</span>
                    <span className="hz-stock-name">{row.productName}</span>
                    <span className="hz-stock-sub">{row.productSubline}</span>
                  </div>
                </div>
                <div className="hz-stock-cell hz-stock-cell--stack">
                  <span className="hz-stock-strong">{row.centerWarehouseStockTotal}</span>
                  <span className="hz-stock-muted">{row.centerDetailLine}</span>
                </div>
                <div className="hz-stock-cell hz-stock-cell--stack">
                  <span className="hz-stock-strong">{row.factoryStockTotal}</span>
                  <span className="hz-stock-muted hz-stock-muted--2">{row.factorySubline}</span>
                </div>
                <div className="hz-stock-cell hz-stock-cell--stack">
                  <span className="hz-stock-strong">{row.depotDisplayName}</span>
                  <span className="hz-stock-muted">{row.rackDisplayLine}</span>
                </div>
                <div className="hz-stock-cell hz-stock-cell--stack">
                  <span className="hz-stock-strong">{row.priceMainLine}</span>
                  <span className="hz-stock-muted">{row.priceSubLine}</span>
                </div>
                <div className="hz-stock-cell hz-stock-cell--status">
                  <span className={statusBadgeClass(row.displayStatus)}>{statusLabel(row.displayStatus)}</span>
                </div>
                <div className="hz-stock-cell hz-stock-actions" onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="hz-stock-act-btn" onClick={() => onOpenDetail(row)}>
                    <IconFileText size={14} aria-hidden />
                    Detay
                  </button>
                  <button type="button" className="hz-stock-act-btn hz-stock-act-btn--soft" onClick={() => onStockMovement(row)}>
                    Stok
                  </button>
                  <button
                    type="button"
                    className="hz-stock-act-icon"
                    aria-label="Etiket veya barkod"
                    title="Etiket / barkod"
                    onClick={() => onLabelAction(row)}
                  >
                    <IconTag size={16} />
                  </button>
                  {isStockDemoRowId(row.productId) ? null : (
                    <button type="button" className="hz-stock-act-icon" aria-label="Hızlı işlem" title="Hızlı işlem" onClick={() => onOpenDetail(row)}>
                      <IconZap size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
