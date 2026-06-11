import { Suspense } from "react";
import {
  QuickOperationReferenceWorkbench,
  type QuickOperationReferenceWorkbenchProps
} from "./QuickOperationReferenceWorkbench";

function SalesDeskFallback() {
  return (
    <div className="hism-home hims-home--embedded" data-page="quick-operation-reference-workbench-loading">
      <header className="hism-head">
        <div>
          <h1>Satış Masası</h1>
          <p>Yükleniyor…</p>
        </div>
      </header>
    </div>
  );
}

export function QuickOperationSalesDeskPage(props: QuickOperationReferenceWorkbenchProps) {
  return (
    <Suspense fallback={<SalesDeskFallback />}>
      <QuickOperationReferenceWorkbench {...props} />
    </Suspense>
  );
}
