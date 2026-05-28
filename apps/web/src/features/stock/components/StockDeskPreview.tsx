// @ts-nocheck
"use client";

import { LucideIcon } from "../../../components/icons/lucide-icons";
import type { StockRow } from "../mappers/map-stock-row";

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
      return "TÃ¼keniyor";
    case "blokeli":
      return "Blokeli";
    default:
      return "Stokta";
  }
}

export function StockDeskPreview({
  row,
  onOpenDetail,
  onStockMovement,
  onLabelAction,
  onTransfer
}: {
  row: StockRow | null;
  onOpenDetail: (row: StockRow) => void;
  onStockMovement: (row: StockRow) => void;
  onLabelAction: (row: StockRow) => void;
  onTransfer: (row: StockRow) => void;
}) {
  if (!row) {
    return (
      <section className="hz-stock-context hz-stock-context-card--empty" aria-label="Stok baÄŸlamÄ±">
        <article className="hz-stock-context-card">
          <h4>Stok BaÄŸlamÄ±</h4>
          <p>Tablodan bir Ã¼rÃ¼n seÃ§ildiÄŸinde stok, depo ve fiyat Ã¶zeti gÃ¶rÃ¼nÃ¼r.</p>
        </article>
      </section>
    );
  }

  const rackFill = row.displayStatus === "kritik" ? 92 : row.displayStatus === "tukeniyor" ? 78 : 68;

  return (
    <section className="hz-stock-context" aria-label="Stok baÄŸlamÄ±">
      <header className="hz-stock-context__head">
        <p className="hz-stock-context__eyebrow">Stok BaÄŸlamÄ±</p>
        <div className="hz-stock-context__hero">
          <span className="hz-stock-context__thumb" aria-hidden>
            <LucideIcon name="package" size={22} />
          </span>
          <div className="hz-stock-context__hero-text">
            <h3>{row.productName}</h3>
            <p>{row.productCode}</p>
            <span className={statusBadgeClass(row.displayStatus)}>{statusLabel(row.displayStatus)}</span>
          </div>
        </div>
        <dl className="hz-stock-context-dl">
          <div>
            <dt>Barkod</dt>
            <dd>{row.primaryBarcode}</dd>
          </div>
          <div>
            <dt>Marka</dt>
            <dd>{row.brandName}</dd>
          </div>
          <div>
            <dt>Kategori</dt>
            <dd>{row.categorySummary}</dd>
          </div>
        </dl>
      </header>

      <div className="hz-stock-context__body">
        {row.displayStatus !== "saglikli" ? (
          <article className="hz-stock-context-notice hz-stock-context-notice--warn">
            <LucideIcon name="alert-triangle" size={14} />
            <div>
              <strong>Fabrika stok seviyesi dÃ¼ÅŸÃ¼k</strong>
              <p>SipariÅŸ Ã¶ncesi fabrika stok teyidi Ã¶nerilir.</p>
            </div>
          </article>
        ) : null}
        <article className="hz-stock-context-notice hz-stock-context-notice--info">
          <LucideIcon name="package" size={14} />
          <div>
            <strong>Depo raf kapasitesi</strong>
            <p>
              {row.depotDisplayName} â€” {row.rackDisplayLine}
            </p>
          </div>
        </article>

        <article className="hz-stock-context-card">
          <h4>Stok Ã–zeti</h4>
          <dl className="hz-stock-context-dl hz-stock-context-dl--compact">
            <div>
              <dt>Merkez</dt>
              <dd>{row.centerWarehouseStockTotal}</dd>
            </div>
            <div>
              <dt>Fabrika</dt>
              <dd>{row.factoryStockTotal}</dd>
            </div>
            <div>
              <dt>KullanÄ±labilir</dt>
              <dd>{row.availableTotal}</dd>
            </div>
          </dl>
        </article>

        <article className="hz-stock-context-card">
          <h4>Depo / Raf Bilgileri</h4>
          <p>
            {row.depotDisplayName} Â· {row.rackDisplayLine}
          </p>
          <div className="hz-stock-context-progress" aria-label={`Raf doluluk ${rackFill}%`}>
            <span style={{ width: `${rackFill}%` }} />
          </div>
          <p className="hz-stock-context-progress-label">Doluluk: %{rackFill}</p>
        </article>
      </div>

      <footer className="hz-stock-context__actions">
        <button type="button" className="hz-stock-context-btn hz-stock-context-btn--primary" onClick={() => onStockMovement(row)}>
          Stok Hareketi OluÅŸtur
        </button>
        <button type="button" className="hz-stock-context-btn" onClick={() => onTransfer(row)}>
          Transfer Talebi OluÅŸtur
        </button>
        <button type="button" className="hz-stock-context-btn" onClick={() => onLabelAction(row)}>
          Etiket YazdÄ±r
        </button>
        <button type="button" className="hz-stock-context-btn hz-stock-context-btn--ghost" onClick={() => onOpenDetail(row)}>
          Detay AÃ§
        </button>
      </footer>
    </section>
  );
}

