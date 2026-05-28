// @ts-nocheck
"use client";

import { dataSourceConfig } from "../../../lib/data-source";
import { MSG_FINANCE_NOT_LINKED } from "../data/quick-operation-messages";
import type { QuickOperationCustomer, QuickOperationTotals } from "../types";
import type { WorkflowTabId } from "./QuickOperationPage";
import { QuickOperationPaymentBlock, type QuickOperationPaymentFormState } from "./QuickOperationPaymentBlock";
import { QuickOperationTotalsPanel } from "./QuickOperationTotalsPanel";

interface Props {
  activeTab: WorkflowTabId;
  selectedCustomer: QuickOperationCustomer;
  totals: QuickOperationTotals;
  paymentForm: QuickOperationPaymentFormState;
  onPaymentChange: (patch: Partial<QuickOperationPaymentFormState>) => void;
  showAllocateToggle: boolean;
  disabled?: boolean;
}

export function QuickOperationWorkbenchSide({
  activeTab,
  selectedCustomer,
  totals,
  paymentForm,
  onPaymentChange,
  showAllocateToggle,
  disabled
}: Props) {
  const pdfReady = activeTab === "price" || activeTab === "order";
  const waReady = Boolean(selectedCustomer.whatsappMatched);

  return (
    <aside className="hz-qop-wb-side" aria-label="Operasyon etkisi">
      <div className="hz-qop-wb-side-scroll">
        <section className="hz-qop-wb-block">
          <h3 className="hz-qop-wb-block-h">Toplam Ã–zeti</h3>
          {selectedCustomer.financeLinked === false && !dataSourceConfig.useDemoData ? (
            <p className="hz-qop-wb-muted">{MSG_FINANCE_NOT_LINKED}</p>
          ) : null}
          <QuickOperationTotalsPanel totals={totals} layout="finance" />
        </section>

        <section className="hz-qop-wb-block hz-qop-wb-block--payment">
          <QuickOperationPaymentBlock
            state={paymentForm}
            onChange={onPaymentChange}
            grandTotal={totals.grandTotal}
            showAllocateToggle={showAllocateToggle}
            disabled={disabled}
          />
        </section>

        <section className="hz-qop-wb-block">
          <h3 className="hz-qop-wb-block-h">Belge &amp; Kanal</h3>
          <div className="hz-qop-wb-document-actions">
            <button type="button" className="hz-qop-wb-doc-btn" disabled={!pdfReady}>
              Belge Ã–nizle
            </button>
            <button type="button" className="hz-qop-wb-doc-btn" disabled={!waReady}>
              WhatsApp ile GÃ¶nder
            </button>
          </div>
        </section>
      </div>
    </aside>
  );
}

