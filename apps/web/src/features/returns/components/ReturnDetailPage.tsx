"use client";

import { EmptyState, LoadingState, PageHeader, SplitContentLayout } from "@hallederiz/ui";
import type { Customer, Return } from "@hallederiz/types";
import { calculateReturnImpact } from "@hallederiz/domain";
import { useEffect, useMemo, useState } from "react";
import { getReturnDetail } from "../queries/get-returns";
import { getReturnStatusLabel } from "../queries/return-mock-data";

export function ReturnHeaderInfo({ returnRecord, customer }: { returnRecord: Return; customer: Customer | null }) {
  return <section className="crm-identity-header"><div><p className="drawer-eyebrow">Iade</p><h2>{returnRecord.returnNo}</h2><p>{customer?.name ?? returnRecord.customerId} / {returnRecord.orderNo ?? returnRecord.deliveryNo ?? "Baglanti secilecek"}</p></div><span className="hz-badge hz-badge-info">{getReturnStatusLabel(returnRecord.status)}</span></section>;
}

export function ReturnActionsBar() {
  return <section className="hz-action-toolbar"><button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button">Kaydet</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Onaya Gonder</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Teslim Alindi</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Tamamla</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Iptal Et</button></section>;
}

export function ReturnLineEditor({ returnRecord }: { returnRecord: Return }) {
  return <section className="hz-content-card"><h3>Iade Satirlari</h3><div className="hz-filter-grid hz-margin-top-sm"><label>Siparis/Teslim<input readOnly value={returnRecord.orderNo ?? returnRecord.deliveryNo ?? ""} /></label><label>Urun<select defaultValue={returnRecord.lines[0]?.productCode ?? ""}>{returnRecord.lines.map((line) => <option key={line.id}>{line.productCode}</option>)}</select></label><label>Adet<input type="number" defaultValue={returnRecord.lines[0]?.quantity ?? 1} /></label><label>Sebep<select defaultValue={returnRecord.lines[0]?.reasonCategory ?? "damaged"}><option value="damaged">Hasar</option><option value="wrong_product">Yanlis Urun</option><option value="quality">Kalite</option><option value="customer_request">Musteri Talebi</option></select></label><label>Not<input defaultValue={returnRecord.note ?? ""} /></label></div></section>;
}

export function ReturnImpactPanel({ returnRecord }: { returnRecord: Return }) {
  const impact = calculateReturnImpact(returnRecord);
  return <section className="hz-content-card"><h3>Iade Etkisi</h3><ul className="hz-side-list">{impact.messages.map((message) => <li key={message}>{message}</li>)}<li>Belge etkisi: {impact.documentImpact}</li></ul></section>;
}

export function ReturnDetailPage({ returnId }: { returnId?: string }) {
  const [returnRecord, setReturnRecord] = useState<Return | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getReturnDetail(returnId).then((result) => { setReturnRecord(result.returnRecord); setCustomers(result.customers); }).finally(() => setLoading(false)); }, [returnId]);
  const customer = useMemo(() => customers.find((item) => item.id === returnRecord?.customerId) ?? null, [customers, returnRecord?.customerId]);
  if (loading) return <LoadingState title="Iade yukleniyor" message="Satirlar ve etki paneli hazirlaniyor." />;
  if (!returnRecord) return <EmptyState title="Iade Bulunamadi" message="Secilen iade kaydi bulunamadi." />;
  return <div className="hz-page-stack"><PageHeader title={returnId ? "Iade Detayi" : "Yeni Iade"} description="Siparis/teslim baglantisi, satir secimi, neden ve etki paneli." /><ReturnHeaderInfo returnRecord={returnRecord} customer={customer} /><ReturnActionsBar /><SplitContentLayout main={<ReturnLineEditor returnRecord={returnRecord} />} side={<ReturnImpactPanel returnRecord={returnRecord} />} /></div>;
}
