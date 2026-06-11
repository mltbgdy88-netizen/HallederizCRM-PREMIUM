"use client";

import type { ReactNode } from "react";
import type { FoundSaleSummary } from "../data/quick-operation-find-sale-demo";
import { QuickOperationFindSalePanel } from "./QuickOperationFindSalePanel";

export type QuickOperationRightPanelMode = "operation" | "find_sale";

export type QuickOperationRightPanelProps = {
  mode: QuickOperationRightPanelMode;
  selectedSale: FoundSaleSummary | null;
  onOpenFindSale: () => void;
  query: string;
  onQueryChange: (value: string) => void;
  onBack: () => void;
  onClose: () => void;
  onSelect: (sale: FoundSaleSummary) => void;
  children: ReactNode;
};

type OperationPanelProps = {
  selectedSale: FoundSaleSummary | null;
  onOpenFindSale: () => void;
  children: ReactNode;
};

function OperationPanel({ selectedSale, onOpenFindSale, children }: OperationPanelProps) {
  return (
    <aside className="hism-operation-panel" aria-label="Operasyon paneli">
      <button type="button" className="hism-find-sale-trigger" onClick={onOpenFindSale}>
        Gerçekleşen Satışları Getir
      </button>
      {selectedSale ? (
        <div className="hism-loaded-sale-band" role="status">
          <strong>{selectedSale.saleNo} satış bağlamı seçildi</strong>
          <span>
            {selectedSale.customerName} · {selectedSale.amount} · {selectedSale.status}
          </span>
        </div>
      ) : null}
      <div className="hism-operation-body">{children}</div>
    </aside>
  );
}

export function QuickOperationRightPanel({
  mode,
  selectedSale,
  onOpenFindSale,
  query,
  onQueryChange,
  onBack,
  onClose,
  onSelect,
  children
}: QuickOperationRightPanelProps) {
  if (mode === "find_sale") {
    return (
      <QuickOperationFindSalePanel
        query={query}
        onQueryChange={onQueryChange}
        onBack={onBack}
        onClose={onClose}
        onSelect={onSelect}
      />
    );
  }

  return (
    <OperationPanel selectedSale={selectedSale} onOpenFindSale={onOpenFindSale}>
      {children}
    </OperationPanel>
  );
}
