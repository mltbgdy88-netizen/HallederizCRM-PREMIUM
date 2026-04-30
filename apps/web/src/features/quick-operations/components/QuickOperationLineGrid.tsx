import { Fragment, useMemo } from "react";
import { demoProducts } from "../hooks/use-quick-operation-state";
import type { QuickOperationLine, QuickOperationSourceType } from "../types";
import { QuickOperationSourceAccordion } from "./QuickOperationSourceAccordion";

interface Props {
  lines: QuickOperationLine[];
  expandedLineId: string | null;
  onToggleExpanded: (lineId: string) => void;
  onAddLine: () => void;
  onRemoveLine: (lineId: string) => void;
  onUpdateLine: (lineId: string, patch: Partial<QuickOperationLine>) => void;
  onSelectProduct: (lineId: string, productCode: string) => void;
  onSelectSource: (lineId: string, sourceType: QuickOperationSourceType) => void;
}

function formatMoney(value: number) {
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function QuickOperationLineGrid({
  lines,
  expandedLineId,
  onToggleExpanded,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
  onSelectProduct,
  onSelectSource
}: Props) {
  const productOptions = useMemo(() => demoProducts.map((item) => ({ label: `${item.code} · ${item.name}`, value: item.code })), []);

  return (
    <section className="hz-content-card">
      <div className="crm-identity-header">
        <div>
          <h3>Urun / Hizmet Satirlari</h3>
          <p className="hz-content-card-description">Klasik fis/tablo hissi korunur; satir altindan kaynak akordiyonu acilir.</p>
        </div>
        <button type="button" className="hz-btn hz-btn-secondary" onClick={onAddLine}>Satir Ekle</button>
      </div>

      <div className="hz-table-wrap hz-margin-top-sm">
        <table className="hz-table hz-table-sticky" style={{ minWidth: 1120 }}>
          <thead>
            <tr>
              <th style={{ width: 50 }}>NO</th>
              <th style={{ width: 120 }}>KOD</th>
              <th>URUN / HIZMET ADI</th>
              <th style={{ width: 90 }}>MIKTAR</th>
              <th style={{ width: 100 }}>KAYNAK</th>
              <th style={{ width: 130 }}>DEPO</th>
              <th style={{ width: 100 }}>RAF</th>
              <th style={{ width: 110 }}>BIRIM FIYAT</th>
              <th style={{ width: 80 }}>KDV</th>
              <th style={{ width: 120 }}>TOPLAM</th>
              <th style={{ width: 120 }}>AKSIYON</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const lineTotal = line.quantity * line.unitPrice * (1 + line.taxRate / 100);
              const isExpanded = line.id === expandedLineId;
              return (
                <Fragment key={line.id}>
                  <tr className={isExpanded ? "is-selected-row" : undefined}>
                    <td>{index + 1}</td>
                    <td>
                      <select className="hz-control" value={line.productCode} onChange={(event) => onSelectProduct(line.id, event.target.value)}>
                        {productOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.value}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="hz-control"
                        value={line.productName}
                        onChange={(event) => onUpdateLine(line.id, { productName: event.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="hz-control"
                        type="number"
                        min={0}
                        value={line.quantity}
                        onChange={(event) => onUpdateLine(line.id, { quantity: Math.max(0, Number(event.target.value || 0)) })}
                      />
                    </td>
                    <td>
                      <span className="hz-badge hz-badge-info">{line.sourceLabel}</span>
                    </td>
                    <td>{line.warehouseName}</td>
                    <td>{line.rackCode}</td>
                    <td>
                      <input
                        className="hz-control"
                        type="number"
                        min={0}
                        value={line.unitPrice}
                        onChange={(event) => onUpdateLine(line.id, { unitPrice: Math.max(0, Number(event.target.value || 0)) })}
                      />
                    </td>
                    <td>
                      <input
                        className="hz-control"
                        type="number"
                        min={0}
                        max={100}
                        value={line.taxRate}
                        onChange={(event) => onUpdateLine(line.id, { taxRate: Math.max(0, Number(event.target.value || 0)) })}
                      />
                    </td>
                    <td>{formatMoney(lineTotal)} TL</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button type="button" className="hz-btn hz-btn-secondary" onClick={() => onToggleExpanded(line.id)}>
                          {isExpanded ? "Kapat" : "Kaynak"}
                        </button>
                        <button type="button" className="hz-btn hz-btn-secondary" onClick={() => onRemoveLine(line.id)} disabled={lines.length <= 1}>
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded ? (
                    <tr>
                      <td colSpan={11}>
                        <QuickOperationSourceAccordion line={line} onSelectSource={onSelectSource} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
