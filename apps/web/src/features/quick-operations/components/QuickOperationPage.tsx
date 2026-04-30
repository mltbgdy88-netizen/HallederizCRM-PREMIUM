"use client";

import { ContentSection, SplitContentLayout } from "@hallederiz/ui";
import { useQuickOperationState, operationTypeLabels } from "../hooks/use-quick-operation-state";
import { QuickOperationCustomerPanel } from "./QuickOperationCustomerPanel";
import { QuickOperationHeader } from "./QuickOperationHeader";
import { QuickOperationImpactPanel } from "./QuickOperationImpactPanel";
import { QuickOperationLineGrid } from "./QuickOperationLineGrid";
import { QuickOperationSideActionsPanel } from "./QuickOperationSideActionsPanel";
import { QuickOperationTotalsPanel } from "./QuickOperationTotalsPanel";

export function QuickOperationPage() {
  const {
    operationType,
    setOperationType,
    customerId,
    setCustomerId,
    selectedCustomer,
    lines,
    expandedLineId,
    setExpandedLineId,
    totals,
    impacts,
    notice,
    setNotice,
    addLine,
    removeLine,
    updateLine,
    selectProduct,
    selectSource,
    showFoundationNotice,
    openDocumentPreview,
    openWhatsappDraft,
    submitOperation,
    isSubmitting,
    aiInsight,
    documentPreview,
    whatsappDraft,
    documentPreviewVisible,
    setDocumentPreviewVisible,
    whatsappDraftVisible,
    setWhatsappDraftVisible
  } = useQuickOperationState();

  return (
    <div className="hz-page-stack">
      <QuickOperationHeader
        operationType={operationType}
        onOperationTypeChange={setOperationType}
        onFoundationAction={showFoundationNotice}
        onDocumentPreview={openDocumentPreview}
        onWhatsappDraft={openWhatsappDraft}
        onSubmit={submitOperation}
        submitting={isSubmitting}
      />

      {notice ? (
        <section className="hz-state-card tone-danger">
          <h4>{notice}</h4>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={() => setNotice(null)}>
            Mesaji Kapat
          </button>
        </section>
      ) : null}

      <QuickOperationCustomerPanel customerId={customerId} customer={selectedCustomer} onCustomerChange={setCustomerId} />

      <SplitContentLayout
        main={
          <>
            <QuickOperationLineGrid
              lines={lines}
              expandedLineId={expandedLineId}
              onToggleExpanded={(lineId) => setExpandedLineId((current) => (current === lineId ? null : lineId))}
              onAddLine={addLine}
              onRemoveLine={removeLine}
              onUpdateLine={updateLine}
              onSelectProduct={selectProduct}
              onSelectSource={selectSource}
            />
            <ContentSection title="Aciklamalar ve Kosullar" description="Bu alandaki metinler islem turune gore operasyonu aciklar.">
              <ul className="hz-list-stack" style={{ paddingLeft: 18, margin: 0 }}>
                <li>{operationTypeLabels[operationType].title}</li>
                <li>Satir kaynagi merkez depo secilirse depo hazirlik emri etkisi olusur.</li>
                <li>Fabrika/tedarikci secimleri sadece workflow etkisi onizlemesidir; write sonraki asamada baglanacaktir.</li>
                <li>Belge onizle ve WhatsApp taslagi submit sonrasi olusan side-actions ile calisir.</li>
              </ul>
            </ContentSection>
            <QuickOperationSideActionsPanel
              documentPreview={documentPreview}
              whatsappDraft={whatsappDraft}
              documentPreviewVisible={documentPreviewVisible}
              whatsappDraftVisible={whatsappDraftVisible}
              onCloseDocumentPreview={() => setDocumentPreviewVisible(false)}
              onCloseWhatsappDraft={() => setWhatsappDraftVisible(false)}
            />
          </>
        }
        side={
          <>
            <QuickOperationTotalsPanel totals={totals} />
            <QuickOperationImpactPanel impacts={impacts} aiInsight={aiInsight} />
          </>
        }
      />
    </div>
  );
}
