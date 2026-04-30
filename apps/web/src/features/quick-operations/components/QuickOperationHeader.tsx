import { PageHeader, PrimaryActionToolbar } from "@hallederiz/ui";
import type { QuickOperationType } from "../types";
import { operationTypeLabels } from "../hooks/use-quick-operation-state";

const operationTypes = Object.keys(operationTypeLabels) as QuickOperationType[];

interface Props {
  operationType: QuickOperationType;
  onOperationTypeChange: (operationType: QuickOperationType) => void;
  onFoundationAction: (action: string) => void;
  onDocumentPreview: () => void;
  onWhatsappDraft: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function QuickOperationHeader({
  operationType,
  onOperationTypeChange,
  onFoundationAction,
  onDocumentPreview,
  onWhatsappDraft,
  onSubmit,
  submitting
}: Props) {
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
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => onFoundationAction("Taslak Kaydet")}>Taslak Kaydet</button>
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Olusturuluyor..." : "Islemi Olustur"}
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onDocumentPreview}>Belge Onizle</button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onWhatsappDraft}>WhatsApp Taslagi</button>
      </PrimaryActionToolbar>
    </>
  );
}
