// @ts-nocheck
"use client";

import { EmptyState, EntityDetailLayout, LoadingState, PageHeader } from "@hallederiz/ui";
import type { Customer, Return } from "@hallederiz/types";
import { calculateReturnImpact } from "@hallederiz/domain";
import { useEffect, useMemo, useState } from "react";
import { getReturnDetail } from "../queries/get-returns";
import { getReturnStatusLabel } from "../queries/return-mock-data";
import { useToast } from "../../../providers/toast-provider";

export function ReturnHeaderInfo({ returnRecord, customer }: { returnRecord: Return; customer: Customer | null }) {
  return (
    <section className="hz-content-card hz-returns-detail-summary">
      <p className="drawer-eyebrow">Ä°ade</p>
      <h2>{returnRecord.returnNo}</h2>
      <p className="muted">
        {customer?.name ?? "â€”"} Â· {returnRecord.orderNo ?? returnRecord.deliveryNo ?? "BaÄŸlantÄ± seÃ§ilecek"}
      </p>
      <span className="hz-badge hz-badge-info">{getReturnStatusLabel(returnRecord.status)}</span>
    </section>
  );
}

export function ReturnActionsBar() {
  const { pushToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [received, setReceived] = useState(false);
  const [finished, setFinished] = useState(false);

  function handleSave() {
    setSaved(true);
    pushToast("Taslak hazÄ±rlandÄ±: iade kaydÄ± oluÅŸturma onay akÄ±ÅŸÄ±na iletildi.");
  }

  function handleReceive() {
    setReceived(true);
    pushToast("Taslak hazÄ±rlandÄ±: teslim alÄ±ndÄ± kaydÄ± onay akÄ±ÅŸÄ±na iletildi.");
  }

  function handleFinish() {
    setFinished(true);
    pushToast("Taslak hazÄ±rlandÄ±: iade tamamlama onay akÄ±ÅŸÄ±na iletildi.");
  }

  return (
    <section className="hz-content-card hz-returns-detail-actions">
      <h3>Ä°ÅŸlemler</h3>
      <p className="muted">Ä°ade onay ve tamamlama adÄ±mlarÄ± mevcut iÅŸ akÄ±ÅŸÄ±yla ilerler.</p>
      <div className="hz-inline-actions">
        <button
          className="hz-btn hz-btn-primary hz-toolbar-btn"
          type="button"
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? "Taslak hazÄ±rlandÄ±" : "Kaydet"}
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={() => pushToast("Taslak hazÄ±rlandÄ±: iade onaya gÃ¶nderildi.")}
        >
          Onaya gÃ¶nder
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={handleReceive}
          disabled={received}
        >
          {received ? "AlÄ±ndÄ± kaydedildi" : "Teslim alÄ±ndÄ±"}
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={handleFinish}
          disabled={finished}
        >
          {finished ? "TamamlandÄ±" : "Tamamla"}
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={() => pushToast("Taslak hazÄ±rlandÄ±: iptal iÅŸlemi onay akÄ±ÅŸÄ±na iletildi.")}
        >
          Ä°ptal et
        </button>
      </div>
    </section>
  );
}

export function ReturnLineEditor({ returnRecord }: { returnRecord: Return }) {
  return (
    <section className="hz-content-card">
      <h3>Ä°ade satÄ±rlarÄ±</h3>
      <div className="hz-filter-grid hz-margin-top-sm">
        <label>
          SipariÅŸ / teslim
          <input readOnly value={returnRecord.orderNo ?? returnRecord.deliveryNo ?? ""} />
        </label>
        <label>
          ÃœrÃ¼n
          <select defaultValue={returnRecord.lines[0]?.productCode ?? ""}>
            {returnRecord.lines.map((line) => (
              <option key={line.id}>{line.productCode}</option>
            ))}
          </select>
        </label>
        <label>
          Adet
          <input type="number" defaultValue={returnRecord.lines[0]?.quantity ?? 1} />
        </label>
        <label>
          Sebep
          <select defaultValue={returnRecord.lines[0]?.reasonCategory ?? "damaged"}>
            <option value="damaged">Hasar</option>
            <option value="wrong_product">YanlÄ±ÅŸ Ã¼rÃ¼n</option>
            <option value="quality">Kalite</option>
            <option value="customer_request">MÃ¼ÅŸteri talebi</option>
          </select>
        </label>
        <label>
          Not
          <input defaultValue={returnRecord.note ?? ""} />
        </label>
      </div>
    </section>
  );
}

export function ReturnImpactPanel({ returnRecord }: { returnRecord: Return }) {
  const impact = calculateReturnImpact(returnRecord);
  return (
    <section className="hz-content-card">
      <h3>Ä°ade etkisi</h3>
      <ul className="hz-side-list">
        {impact.messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
        <li>Belge etkisi: {impact.documentImpact}</li>
      </ul>
    </section>
  );
}

export function ReturnDetailPage({ returnId }: { returnId?: string }) {
  const [returnRecord, setReturnRecord] = useState<Return | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReturnDetail(returnId)
      .then((result) => {
        setReturnRecord(result.returnRecord);
        setCustomers(result.customers);
      })
      .finally(() => setLoading(false));
  }, [returnId]);

  const customer = useMemo(
    () => customers.find((item) => item.id === returnRecord?.customerId) ?? null,
    [customers, returnRecord?.customerId]
  );

  if (loading) {
    return <LoadingState title="Ä°ade yÃ¼kleniyor" message="SatÄ±rlar ve etki paneli hazÄ±rlanÄ±yor." />;
  }
  if (!returnRecord) {
    return <EmptyState title="Ä°ade bulunamadÄ±" message="SeÃ§ilen iade kaydÄ± bulunamadÄ±." />;
  }

  return (
    <EntityDetailLayout
      className="hz-commercial-entity-detail-page hz-returns-detail-page"
      header={
        <PageHeader
          title={returnId ? "Ä°ade detayÄ±" : "Yeni iade"}
          description="SipariÅŸ veya teslim baÄŸlantÄ±sÄ±, satÄ±r seÃ§imi, neden ve etki paneli."
          breadcrumb={returnRecord.returnNo}
        />
      }
      summary={<ReturnHeaderInfo returnRecord={returnRecord} customer={customer} />}
      sections={
        <>
          <ReturnActionsBar />
          <ReturnLineEditor returnRecord={returnRecord} />
        </>
      }
      sidebar={<ReturnImpactPanel returnRecord={returnRecord} />}
    />
  );
}

