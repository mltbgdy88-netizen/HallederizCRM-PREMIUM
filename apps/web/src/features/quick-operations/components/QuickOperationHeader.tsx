import { PageHeader, PrimaryActionToolbar } from "@hallederiz/ui";
import type { QuickOperationType } from "../types";
import { operationTypeLabels } from "../hooks/use-quick-operation-state";

const operationTypes = Object.keys(operationTypeLabels) as QuickOperationType[];

interface Props {
  operationType: QuickOperationType;
  onOperationTypeChange: (operationType: QuickOperationType) => void;
  onAction: (action: string) => void;
}

export function QuickOperationHeader({ operationType, onOperationTypeChange, onAction }: Props) {
  const meta = operationTypeLabels[operationType];

  return (
    <>
      <PageHeader title="Hizli Islem Merkezi" description="Klasik fis/tablo hissiyle CRM, depo, fabrika ve belge etkisini tek ekranda onizleyin." />

      <section className="hz-content-card">
        <div className="crm-identity-header">
          <div>
            <h3>Islem Turu</h3>
            <p className="hz-content-card-description">{meta.description}</p>
          </div>
          <span className="hz-badge hz-badge-info">Frontend foundation</span>
        </div>
        <div className="hz-tab-switcher hz-margin-top-sm" aria-label="Islem turu secimi">
          {operationTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={type === operationType ? "is-active" : undefined}
              onClick={() => onOperationTypeChange(type)}
            >
              {operationTypeLabels[type].label}
            </button>
          ))}
        </div>
      </section>

      <PrimaryActionToolbar>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => onAction("Taslak Kaydet")}>Taslak Kaydet</button>
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={() => onAction("Islemi Olustur")}>Islemi Olustur</button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => onAction("Belge Onizle")}>Belge Onizle</button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => onAction("WhatsApp Taslagi")}>WhatsApp Taslagi</button>
      </PrimaryActionToolbar>
    </>
  );
}
