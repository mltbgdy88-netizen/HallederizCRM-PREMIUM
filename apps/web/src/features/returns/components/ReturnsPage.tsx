"use client";

import { LoadingState, MetricCard, PageHeader, Pagination, PrimaryActionToolbar, SplitContentLayout } from "@hallederiz/ui";
import type { Customer, Return } from "@hallederiz/types";
import { calculateReturnImpact } from "@hallederiz/domain";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dateLabel } from "../utils";
import { getReturns } from "../queries/get-returns";
import { getReturnStatusLabel } from "../queries/return-mock-data";

export function ReturnFilterBar() {
  return <section className="hz-filter-card"><div className="hz-filter-grid"><label>Musteri<input placeholder="Cari veya iade no" /></label><label>Durum<select defaultValue=""><option value="">Tum durumlar</option><option>Taslak</option><option>Onaylandi</option><option>Tamamlandi</option></select></label><label>Bagli Siparis<input placeholder="SO-2481" /></label><label>Tarih<select defaultValue="month"><option>Bugun</option><option>Bu hafta</option><option>Bu ay</option></select></label></div></section>;
}

export function ReturnTable({ returns, customers, selectedId, onSelect, onOpen }: { returns: Return[]; customers: Customer[]; selectedId: string | null; onSelect: (id: string) => void; onOpen: (id: string) => void }) {
  return <section className="hz-content-card"><div className="table-wrap hz-table-wrap"><table className="table hz-table hz-table-sticky"><thead><tr><th>Iade No</th><th>Musteri</th><th>Bagli Siparis</th><th>Durum</th><th>Tarih</th><th>Toplam Etki</th></tr></thead><tbody>{returns.map((returnRecord) => { const impact = calculateReturnImpact(returnRecord); return <tr key={returnRecord.id} className={`stock-table-row ${selectedId === returnRecord.id ? "is-selected-row" : ""}`} onClick={() => onSelect(returnRecord.id)} onDoubleClick={() => onOpen(returnRecord.id)}><td>{returnRecord.returnNo}</td><td>{customers.find((customer) => customer.id === returnRecord.customerId)?.name ?? returnRecord.customerId}</td><td>{returnRecord.orderNo ?? "-"}</td><td><span className={`hz-badge hz-badge-${returnRecord.status === "completed" ? "success" : returnRecord.status === "cancelled" ? "danger" : "warning"}`}>{getReturnStatusLabel(returnRecord.status)}</span></td><td>{dateLabel(returnRecord.createdAt)}</td><td>{impact.stockImpact} adet</td></tr>; })}</tbody></table></div></section>;
}

export function ReturnPreviewPanel({ returnRecord }: { returnRecord: Return | null }) {
  const impact = returnRecord ? calculateReturnImpact(returnRecord) : null;
  return <section className="hz-content-card"><h3>Iade Preview</h3>{returnRecord && impact ? <ul className="hz-side-list"><li>Siparis: {returnRecord.orderNo ?? "-"}</li><li>Durum: {getReturnStatusLabel(returnRecord.status)}</li><li>Stok etkisi: {impact.stockImpact}</li><li>Onay: {impact.approvalRequired ? "Gerekli" : "Standart"}</li></ul> : <p className="hz-content-card-description">Bir iade secin.</p>}</section>;
}

export function ReturnsPage() {
  const router = useRouter();
  const [returns, setReturns] = useState<Return[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  useEffect(() => { getReturns().then((result) => { setReturns(result.returns); setCustomers(result.customers); }).finally(() => setLoading(false)); }, []);
  const selected = useMemo(() => returns.find((returnRecord) => returnRecord.id === selectedId) ?? returns[0] ?? null, [returns, selectedId]);
  const pagedReturns = useMemo(() => returns.slice((page - 1) * pageSize, page * pageSize), [returns, page]);
  return <div className="hz-page-stack"><PageHeader title="Iadeler" description="Siparis veya teslim baglantili iade akisini, stok/bakiye/belge etkisiyle yonetin." /><section className="hz-metric-grid"><MetricCard title="Iade" value={String(returns.length)} detail="Aktif kayit" tone="info" /><MetricCard title="Onay Bekleyen" value={String(returns.filter((item) => item.status === "draft" || item.status === "approved").length)} detail="Kontrol" tone="warning" /><MetricCard title="Tamamlanan" value={String(returns.filter((item) => item.status === "completed").length)} detail="Kapandi" tone="success" /><MetricCard title="Belge" value={String(returns.length)} detail="Iade notu" tone="neutral" /></section><PrimaryActionToolbar><button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button" onClick={() => router.push("/iadeler/yeni")}>Yeni Iade</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Durum Guncelle</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Belge Olustur</button></PrimaryActionToolbar><ReturnFilterBar /><SplitContentLayout main={loading ? <LoadingState title="Iadeler yukleniyor" message="Iade etkileri ve belge durumlari hazirlaniyor." /> : <><ReturnTable returns={pagedReturns} customers={customers} selectedId={selected?.id ?? null} onSelect={setSelectedId} onOpen={(id) => router.push(`/iadeler/${id}`)} /><Pagination totalItems={returns.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} /></>} side={<ReturnPreviewPanel returnRecord={selected} />} /></div>;
}
