"use client";

import { dataSourceConfig } from "../../../lib/data-source";
import { MSG_FINANCE_NOT_LINKED } from "../data/quick-operation-messages";
import type { QuickOperationAiInsight, QuickOperationCustomer, QuickOperationImpact, QuickOperationTotals } from "../types";
import type { WorkflowTabId } from "./QuickOperationPage";
import { QuickOperationImpactPanel } from "./QuickOperationImpactPanel";
import { QuickOperationTotalsPanel } from "./QuickOperationTotalsPanel";

interface Props {
  activeTab: WorkflowTabId;
  workflowTitle: string;
  selectedCustomer: QuickOperationCustomer;
  riskLabel: string;
  riskHigh: boolean;
  totals: QuickOperationTotals;
  impacts: QuickOperationImpact[];
  aiInsight?: QuickOperationAiInsight;
  nextStepText: string;
  approvalLikely: boolean;
}

export function QuickOperationWorkbenchSide({
  activeTab,
  workflowTitle,
  selectedCustomer,
  riskLabel,
  riskHigh,
  totals,
  impacts,
  aiInsight,
  nextStepText,
  approvalLikely
}: Props) {
  const openBalance =
    selectedCustomer.financeLinked === false
      ? "—"
      : selectedCustomer.receivableDisplay && selectedCustomer.receivableDisplay !== "—"
        ? `₺${selectedCustomer.receivableDisplay}`
        : "—";

  const pdfReady = activeTab === "price" || activeTab === "order";
  const waReady = Boolean(selectedCustomer.whatsappMatched);

  return (
    <aside className="hz-qop-wb-side" aria-label="Operasyon etkisi">
      <div className="hz-qop-wb-side-head">
        <h2 className="hz-qop-wb-side-title">Operasyon Etkisi</h2>
        {approvalLikely ? <span className="hz-qop-wb-chip hz-qop-wb-chip--warn">Onay gerekebilir</span> : null}
      </div>

      <div className="hz-qop-wb-side-scroll">
        <section className="hz-qop-wb-block">
          <h3 className="hz-qop-wb-block-h">Cari Özeti</h3>
          <dl className="hz-qop-wb-kv">
            <div>
              <dt>Cari</dt>
              <dd className="hz-qop-wb-ellipsis" title={selectedCustomer.name}>
                {selectedCustomer.name}
              </dd>
            </div>
            <div>
              <dt>Tip</dt>
              <dd>{selectedCustomer.customerType ?? "—"}</dd>
            </div>
            <div>
              <dt>Fiyat grubu</dt>
              <dd>{selectedCustomer.priceGroup}</dd>
            </div>
            <div>
              <dt>Açık bakiye</dt>
              <dd>{openBalance}</dd>
            </div>
          </dl>
          <div className="hz-qop-wb-pill-row">
            <span className={`hz-qop-wb-pill${riskHigh ? " hz-qop-wb-pill--risk" : ""}`}>Risk: {riskLabel}</span>
            {selectedCustomer.whatsappMatched ? (
              <span className="hz-qop-wb-pill hz-qop-wb-pill--ok">WhatsApp eşleşti</span>
            ) : (
              <span className="hz-qop-wb-pill hz-qop-wb-pill--muted">WhatsApp: eşleşme yok</span>
            )}
          </div>
        </section>

        <section className="hz-qop-wb-block">
          <h3 className="hz-qop-wb-block-h">Finans Özeti</h3>
          {selectedCustomer.financeLinked === false && !dataSourceConfig.useDemoData ? (
            <p className="hz-qop-wb-muted">{MSG_FINANCE_NOT_LINKED}</p>
          ) : null}
          <QuickOperationTotalsPanel totals={totals} layout="finance" />
        </section>

        <section className="hz-qop-wb-block">
          <h3 className="hz-qop-wb-block-h">İş Akışı Etkisi</h3>
          <p className="hz-qop-wb-muted">{workflowTitle} · {nextStepText}</p>
          <QuickOperationImpactPanel impacts={impacts} layout="workflow" />
        </section>

        <section className="hz-qop-wb-block">
          <h3 className="hz-qop-wb-block-h">Belge &amp; Kanal</h3>
          <ul className="hz-qop-wb-channel-list">
            <li>
              <span>PDF teklif taslağı</span>
              <span className={pdfReady ? "hz-qop-wb-chip hz-qop-wb-chip--ok" : "hz-qop-wb-chip hz-qop-wb-chip--muted"}>
                {pdfReady ? "Hazır" : "Bekliyor"}
              </span>
            </li>
            <li>
              <span>WhatsApp taslağı</span>
              <span className={waReady ? "hz-qop-wb-chip hz-qop-wb-chip--ok" : "hz-qop-wb-chip hz-qop-wb-chip--warn"}>
                {waReady ? "Hazır" : "Hazır değil"}
              </span>
            </li>
            <li>
              <span>E-posta</span>
              <span className="hz-qop-wb-chip hz-qop-wb-chip--muted">Bağlı değil</span>
            </li>
          </ul>
        </section>

        {aiInsight ? (
          <section className="hz-qop-wb-block hz-qop-wb-block--ai">
            <h3 className="hz-qop-wb-block-h">AI / Risk Notu</h3>
            <QuickOperationImpactPanel impacts={[]} aiInsight={aiInsight} layout="ai-only" />
          </section>
        ) : dataSourceConfig.useDemoData ? (
          <section className="hz-qop-wb-block hz-qop-wb-block--ai">
            <h3 className="hz-qop-wb-block-h">AI / Risk Notu</h3>
            <p className="hz-qop-wb-muted">
              Önizleme modunda operasyon notu örnek olarak gösterilir; canlı kayıt bağlantısı sonrası güncellenir.
            </p>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
