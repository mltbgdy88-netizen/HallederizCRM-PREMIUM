"use client";

import { LoadingState, MetricCard, PageHeader, PrimaryActionToolbar, SplitContentLayout } from "@hallederiz/ui";
import type { Customer, Invoice } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dateLabel, money } from "../utils";
import { getInvoices } from "../queries/get-invoices";
import { getInvoiceStatusLabel } from "../queries/invoice-mock-data";

export function InvoiceFilterBar() {
  return <section className="hz-filter-card"><div className="hz-filter-grid"><label>Musteri / Fatura<input placeholder="INV-1201 veya cari adi" /></label><label>Durum<select defaultValue=""><option value="">Tum durumlar</option><option>Taslak</option><option>Kesildi</option><option>Iptal</option></select></label><label>Tarih<select defaultValue="month"><option value="today">Bugun</option><option value="week">Bu hafta</option><option value="month">Bu ay</option></select></label><label className="hz-toggle"><input type="checkbox" />Siparis baglantili</label><label>Odeme<select defaultValue=""><option value="">Tum odemeler</option><option>Odenmedi</option><option>Kismi</option><option>Odendi</option></select></label></div></section>;
}

export function InvoiceTable({ invoices, customers, selectedId, onSelect, onOpen }: { invoices: Invoice[]; customers: Customer[]; selectedId: string | null; onSelect: (id: string) => void; onOpen: (id: string) => void }) {
  return <section className="hz-content-card"><div className="table-wrap hz-table-wrap"><table className="table hz-table hz-table-sticky"><thead><tr><th>Fatura No</th><th>Musteri</th><th>Toplam</th><th>Durum</th><th>Tarih</th><th>Bagli Siparis</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id} className={`stock-table-row ${selectedId === invoice.id ? "is-selected-row" : ""}`} onClick={() => onSelect(invoice.id)} onDoubleClick={() => onOpen(invoice.id)}><td>{invoice.invoiceNo}</td><td>{customers.find((customer) => customer.id === invoice.customerId)?.name ?? invoice.customerId}</td><td>{money(invoice.grandTotal, invoice.currency)}</td><td><span className={`hz-badge hz-badge-${invoice.status === "issued" ? "success" : invoice.status === "cancelled" ? "danger" : "warning"}`}>{getInvoiceStatusLabel(invoice.status)}</span></td><td>{dateLabel(invoice.issueDate ?? invoice.createdAt)}</td><td>{invoice.orderNo ?? "-"}</td></tr>)}</tbody></table></div></section>;
}

export function InvoicePreviewPanel({ invoice }: { invoice: Invoice | null }) {
  return <section className="hz-content-card"><h3>Fatura Preview</h3>{invoice ? <ul className="hz-side-list hz-margin-top-sm"><li>Toplam: {money(invoice.grandTotal, invoice.currency)}</li><li>Durum: {getInvoiceStatusLabel(invoice.status)}</li><li>Odeme: {invoice.paymentStatus}</li><li>Belge: {invoice.documentId ?? "Uretilecek"}</li></ul> : <p className="hz-content-card-description">Bir fatura secin.</p>}</section>;
}

export function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getInvoices().then((result) => { setInvoices(result.invoices); setCustomers(result.customers); }).finally(() => setLoading(false)); }, []);
  const selected = useMemo(() => invoices.find((invoice) => invoice.id === selectedId) ?? invoices[0] ?? null, [invoices, selectedId]);
  return <div className="hz-page-stack"><PageHeader title="Faturalar" description="Siparisten turetilen fatura taslaklari, kesim ve belge dagitim akislarini yonetin." /><section className="hz-metric-grid"><MetricCard title="Fatura" value={String(invoices.length)} detail="Toplam" tone="info" /><MetricCard title="Kesildi" value={String(invoices.filter((item) => item.status === "issued").length)} detail="Resmi kayit" tone="success" /><MetricCard title="Taslak" value={String(invoices.filter((item) => item.status === "draft").length)} detail="Kesim bekliyor" tone="warning" /><MetricCard title="PDF" value={String(invoices.filter((item) => item.documentId).length)} detail="Belge bagli" tone="info" /></section><PrimaryActionToolbar><button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button">Yeni Fatura</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">PDF Uret</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Musteriye Gonder</button></PrimaryActionToolbar><InvoiceFilterBar /><SplitContentLayout main={loading ? <LoadingState title="Faturalar yukleniyor" message="Siparis baglantilari ve belge durumlari hazirlaniyor." /> : <InvoiceTable invoices={invoices} customers={customers} selectedId={selected?.id ?? null} onSelect={setSelectedId} onOpen={(id) => router.push(`/faturalar/${id}`)} />} side={<InvoicePreviewPanel invoice={selected} />} /></div>;
}
