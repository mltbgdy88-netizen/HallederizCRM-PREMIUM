"use client";

import { EmptyState, LoadingState, PageHeader, SplitContentLayout } from "@hallederiz/ui";
import type { Customer, Invoice } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { money } from "../utils";
import { getInvoiceDetail } from "../queries/get-invoices";
import { getInvoiceStatusLabel } from "../queries/invoice-mock-data";

export function InvoiceHeaderInfo({ invoice, customer }: { invoice: Invoice; customer: Customer | null }) {
  return <section className="crm-identity-header"><div><p className="drawer-eyebrow">Fatura</p><h2>{invoice.invoiceNo}</h2><p>{customer?.name ?? invoice.customerId} / {invoice.orderNo ?? "Siparis baglantisi yok"}</p></div><div className="stock-filter-actions"><span className="hz-badge hz-badge-info">{getInvoiceStatusLabel(invoice.status)}</span><span className="hz-badge hz-badge-warning">{invoice.paymentStatus}</span></div></section>;
}

export function InvoiceActionsBar({ onIssue }: { onIssue: () => void }) {
  return <section className="hz-action-toolbar"><button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button">Faturayi Olustur</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={onIssue}>Kes</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Iptal Et</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">PDF Onizle</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Gonder</button></section>;
}

export function InvoiceLineTable({ invoice }: { invoice: Invoice }) {
  return <section className="hz-content-card"><h3>Fatura Satirlari</h3><div className="table-wrap hz-table-wrap"><table className="table hz-table"><thead><tr><th>Urun Kodu</th><th>Urun Adi</th><th>Adet</th><th>Birim</th><th>KDV</th><th>Toplam</th></tr></thead><tbody>{invoice.lines.map((line) => <tr key={line.id}><td>{line.productCode}</td><td>{line.productName}</td><td>{line.quantity}</td><td>{money(line.unitPrice, line.currency)}</td><td>{money(line.taxTotal, line.currency)}</td><td>{money(line.lineTotal, line.currency)}</td></tr>)}</tbody></table></div></section>;
}

export function InvoiceSummaryPanel({ invoice }: { invoice: Invoice }) {
  return <section className="hz-content-card"><h3>Fatura Ozeti</h3><ul className="hz-side-list"><li>Ara toplam: {money(invoice.subtotal, invoice.currency)}</li><li>KDV: {money(invoice.taxTotal, invoice.currency)}</li><li>Genel toplam: {money(invoice.grandTotal, invoice.currency)}</li><li>Siparis: {invoice.orderNo ?? "-"}</li><li>Belge aksiyonu: PDF onizleme ve gonderim hazir.</li></ul></section>;
}

export function InvoiceIssueDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <div className="hz-modal-overlay" onClick={onClose}><section className="hz-modal offer-small-modal" onClick={(event) => event.stopPropagation()}><header className="hz-modal-header"><div><p className="drawer-eyebrow">Fatura Kes</p><h3>Issue foundation</h3><p className="muted">Gercek e-fatura/ERP baglantisi sonraki entegrasyon adiminda baglanacak.</p></div><button className="hz-btn hz-btn-secondary" type="button" onClick={onClose}>Kapat</button></header><div className="hz-modal-content"><button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button">Kesim Onayi</button></div></section></div>;
}

export function InvoiceDetailPage({ invoiceId }: { invoiceId?: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueOpen, setIssueOpen] = useState(false);
  useEffect(() => { getInvoiceDetail(invoiceId).then((result) => { setInvoice(result.invoice); setCustomers(result.customers); }).finally(() => setLoading(false)); }, [invoiceId]);
  const customer = useMemo(() => customers.find((item) => item.id === invoice?.customerId) ?? null, [customers, invoice?.customerId]);
  if (loading) return <LoadingState title="Fatura yukleniyor" message="Satirlar ve belge aksiyonlari hazirlaniyor." />;
  if (!invoice) return <EmptyState title="Fatura Bulunamadi" message="Secilen fatura bulunamadi." />;
  return <div className="hz-page-stack"><PageHeader title="Fatura Detayi" description="Fatura ozeti, satirlar, siparis baglantisi ve belge aksiyonlari." /><InvoiceHeaderInfo invoice={invoice} customer={customer} /><InvoiceActionsBar onIssue={() => setIssueOpen(true)} /><SplitContentLayout main={<InvoiceLineTable invoice={invoice} />} side={<InvoiceSummaryPanel invoice={invoice} />} /><InvoiceIssueDialog open={issueOpen} onClose={() => setIssueOpen(false)} /></div>;
}
