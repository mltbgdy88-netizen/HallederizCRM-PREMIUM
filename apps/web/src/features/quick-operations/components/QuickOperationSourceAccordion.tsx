import type { QuickOperationLine, QuickOperationSourceType } from "../types";
import { sourceOptions } from "../hooks/use-quick-operation-state";

interface Props {
  line: QuickOperationLine;
  onSelectSource: (lineId: string, sourceType: QuickOperationSourceType) => void;
}

export function QuickOperationSourceAccordion({ line, onSelectSource }: Props) {
  return (
    <div className="hz-content-card hz-qop-source-accordion">
      <div className="crm-identity-header">
        <div>
          <h3>Satır kaynak seçimi</h3>
          <p className="hz-content-card-description">
            Kaynak seçildiğinde depo, raf ve lokasyon alanları satıra otomatik yazılır.
          </p>
        </div>
        <span className="hz-badge hz-badge-info">Satır {line.productCode || "—"}</span>
      </div>
      <div className="hz-list-stack hz-margin-top-sm">
        {sourceOptions.map((option) => {
          const selected = option.type === line.sourceType;
          return (
            <div key={option.type} className="hz-list-item" style={{ borderColor: selected ? "var(--hz-info)" : undefined }}>
              <div className="crm-identity-header">
                <div>
                  <strong style={{ color: "var(--hz-text-strong)", fontSize: 14 }}>{option.title}</strong>
                  <div className="hz-pill-grid hz-margin-top-sm">
                    <span className="hz-badge hz-badge-info">{option.badge}</span>
                    <span className="hz-badge hz-badge-warning">Kaynak: {option.sourceLabel}</span>
                  </div>
                  <p className="hz-content-card-description hz-margin-top-sm">{option.description}</p>
                </div>
                <button
                  type="button"
                  className={`hz-btn ${selected ? "hz-btn-primary" : "hz-btn-secondary"}`}
                  onClick={() => onSelectSource(line.id, option.type)}
                >
                  {selected ? "Seçildi" : "Seç"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="hz-state-card hz-margin-top-sm">
        <h4>
          Sonuç: Kaynak = {line.sourceLabel} · Depo = {line.warehouseName} · Raf = {line.rackCode} · Lokasyon ={" "}
          {line.locationCode}
        </h4>
      </div>
    </div>
  );
}
