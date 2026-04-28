"use client";

import { EmptyState, LoadingState, PageHeader, SplitContentLayout } from "@hallederiz/ui";
import type { Customer, Delivery } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { getDeliveryDetail } from "../queries/get-deliveries";
import { getDeliveryStatusLabel } from "../queries/delivery-mock-data";

export function DeliveryHeaderInfo({ delivery, customer }: { delivery: Delivery; customer: Customer | null }) {
  return <section className="crm-identity-header"><div><p className="drawer-eyebrow">Teslimat</p><h2>{delivery.deliveryNo}</h2><p>{customer?.name ?? delivery.customerId} / {delivery.orderNo}</p></div><div className="stock-filter-actions"><span className="hz-badge hz-badge-info">{getDeliveryStatusLabel(delivery.status)}</span><span className="hz-badge hz-badge-warning">{delivery.documentStatus}</span></div></section>;
}

export function DeliveryActionsBar({ onRollback }: { onRollback: () => void }) {
  return <section className="hz-action-toolbar"><button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button">Dogrula</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Teslimi Tamamla</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={onRollback}>Rollback</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Musteriye Haber Ver</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Teslim Fisi Olustur</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Irsaliye Olustur</button></section>;
}

export function DeliveryValidationPanel({ delivery }: { delivery: Delivery }) {
  const validation = delivery.validation;
  return <section className="hz-content-card"><h3>Teslim Dogrulama</h3><ul className="hz-side-list hz-margin-top-sm"><li>Musteri dogrulandi: {validation.customerVerified ? "Evet" : "Hayir"}</li><li>Siparis eslesmesi: {validation.orderMatched ? "Dogru" : "Kontrol"}</li><li>Depo emri hazir: {validation.warehouseReady ? "Evet" : "Hayir"}</li><li>Eksik odeme: {validation.paymentMissing ? "Var" : "Yok"}</li><li>Onay gerekiyor: {validation.approvalRequired ? "Evet" : "Hayir"}</li><li>Risk notu: {validation.riskNote}</li></ul></section>;
}

export function DeliveryLineTable({ delivery }: { delivery: Delivery }) {
  return <section className="hz-content-card"><h3>Teslim Satirlari</h3><div className="table-wrap hz-table-wrap"><table className="table hz-table"><thead><tr><th>Urun Kodu</th><th>Urun Adi</th><th>Siparis Adedi</th><th>Hazirlanmis</th><th>Teslim Edilen</th></tr></thead><tbody>{delivery.lines.map((line) => <tr key={line.id}><td>{line.productCode}</td><td>{line.productName}</td><td>{line.orderedQuantity}</td><td>{line.preparedQuantity}</td><td>{line.deliveredQuantity}</td></tr>)}</tbody></table></div></section>;
}

export function CustomerNotificationCard({ delivery }: { delivery: Delivery }) {
  return <section className="hz-content-card"><h3>Musteri Bildirimi</h3><p className="hz-content-card-description">WhatsApp hybrid workflow ile teslim bilgisi gonderilecek.</p><ul className="hz-side-list"><li>Bildirim: {delivery.confirmation?.customerNotified ? "Gonderildi" : "Taslak"}</li><li>Kanal: WhatsApp</li><li>Fallback: PDF link + operator notu</li></ul></section>;
}

export function DeliveryDocumentPanel({ delivery }: { delivery: Delivery }) {
  return <section className="hz-content-card"><h3>Belge Karti</h3><ul className="hz-side-list"><li>Teslim fisi: {delivery.documentStatus}</li><li>Irsaliye: placeholder</li><li>Belge kaydi entity=delivery olarak tutulur.</li></ul></section>;
}

export function DeliveryRollbackDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <div className="hz-modal-overlay" onClick={onClose}><section className="hz-modal offer-small-modal" onClick={(event) => event.stopPropagation()}><header className="hz-modal-header"><div><p className="drawer-eyebrow">Rollback</p><h3>Teslim geri alma</h3><p className="muted">Rollback audit ve approval kaydi ile calisacak.</p></div><button className="hz-btn hz-btn-secondary" type="button" onClick={onClose}>Kapat</button></header><div className="hz-modal-content"><button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button">Rollback Onayi</button></div></section></div>;
}

export function DeliveryDetailPage({ deliveryId }: { deliveryId?: string }) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackOpen, setRollbackOpen] = useState(false);

  useEffect(() => { getDeliveryDetail(deliveryId).then((result) => { setDelivery(result.delivery); setCustomers(result.customers); }).finally(() => setLoading(false)); }, [deliveryId]);
  const customer = useMemo(() => customers.find((item) => item.id === delivery?.customerId) ?? null, [customers, delivery?.customerId]);
  if (loading) return <LoadingState title="Teslimat yukleniyor" message="Dogrulama ve satirlar hazirlaniyor." />;
  if (!delivery) return <EmptyState title="Teslimat Bulunamadi" message="Secilen teslimat kaydi bulunamadi." />;

  return <div className="hz-page-stack"><PageHeader title="Teslimat Detayi" description="Teslim dogrulama, bildirim, belge ve rollback aksiyonlari." /><DeliveryHeaderInfo delivery={delivery} customer={customer} /><DeliveryActionsBar onRollback={() => setRollbackOpen(true)} /><SplitContentLayout main={<div className="hz-page-stack"><DeliveryValidationPanel delivery={delivery} /><DeliveryLineTable delivery={delivery} /><CustomerNotificationCard delivery={delivery} /></div>} side={<DeliveryDocumentPanel delivery={delivery} />} /><DeliveryRollbackDialog open={rollbackOpen} onClose={() => setRollbackOpen(false)} /></div>;
}
