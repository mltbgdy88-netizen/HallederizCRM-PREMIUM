"use client";

import { LoadingState, MetricCard, PageHeader, Pagination, PrimaryActionToolbar, SplitContentLayout } from "@hallederiz/ui";
import type { Customer, Delivery } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dateLabel } from "../utils";
import { getDeliveries } from "../queries/get-deliveries";
import { getDeliveryStatusLabel } from "../queries/delivery-mock-data";

export function DeliveryFilterBar() {
  return (
    <section className="hz-filter-card">
      <div className="hz-filter-grid">
        <label>Musteri / Teslim No<input placeholder="DLV-401 veya cari adi" /></label>
        <label>Durum<select defaultValue=""><option value="">Tum durumlar</option><option>Hazir</option><option>Bekliyor</option><option>Teslim Edildi</option></select></label>
        <label className="hz-toggle"><input type="checkbox" />Hazir olanlar</label>
        <label className="hz-toggle"><input type="checkbox" />Eksik odemeliler</label>
        <label>Belge Durumu<select defaultValue=""><option value="">Tum belgeler</option><option>Hazir</option><option>Eksik</option><option>Gonderildi</option></select></label>
        <label>Tarih<select defaultValue="week"><option value="week">Bu hafta</option><option value="today">Bugun</option><option value="month">Bu ay</option></select></label>
      </div>
    </section>
  );
}

export function DeliveryTable({ deliveries, customers, selectedId, onSelect, onOpen }: { deliveries: Delivery[]; customers: Customer[]; selectedId: string | null; onSelect: (id: string) => void; onOpen: (id: string) => void }) {
  return (
    <section className="hz-content-card">
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table hz-table-sticky">
          <thead><tr><th>Teslim No</th><th>Siparis No</th><th>Musteri</th><th>Durum</th><th>Teslim Tarihi</th><th>Belge Durumu</th></tr></thead>
          <tbody>
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className={`stock-table-row ${selectedId === delivery.id ? "is-selected-row" : ""}`} onClick={() => onSelect(delivery.id)} onDoubleClick={() => onOpen(delivery.id)}>
                <td>{delivery.deliveryNo}</td><td>{delivery.orderNo}</td><td>{customers.find((customer) => customer.id === delivery.customerId)?.name ?? delivery.customerId}</td>
                <td><span className={`hz-badge hz-badge-${delivery.status === "delivered" ? "success" : delivery.validation.valid ? "info" : "warning"}`}>{getDeliveryStatusLabel(delivery.status)}</span></td>
                <td>{dateLabel(delivery.deliveredAt ?? delivery.plannedAt)}</td><td>{delivery.documentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DeliveryPreviewPanel({ delivery }: { delivery: Delivery | null }) {
  return (
    <section className="hz-content-card">
      <h3>Teslimat Preview</h3>
      {delivery ? (
        <ul className="hz-side-list hz-margin-top-sm">
          <li>Siparis: {delivery.orderNo}</li><li>Durum: {getDeliveryStatusLabel(delivery.status)}</li><li>Depo hazir: {delivery.validation.warehouseReady ? "Evet" : "Hayir"}</li><li>Eksik odeme: {delivery.validation.paymentMissing ? "Var" : "Yok"}</li><li>Belge: {delivery.documentStatus}</li>
        </ul>
      ) : <p className="hz-content-card-description">Bir teslimat secin.</p>}
    </section>
  );
}

export function DeliveriesPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    getDeliveries().then((result) => { setDeliveries(result.deliveries); setCustomers(result.customers); }).finally(() => setLoading(false));
  }, []);

  const selected = useMemo(() => deliveries.find((delivery) => delivery.id === selectedId) ?? deliveries[0] ?? null, [deliveries, selectedId]);
  const pagedDeliveries = useMemo(() => deliveries.slice((page - 1) * pageSize, page * pageSize), [deliveries, page]);

  return (
    <div className="hz-page-stack">
      <PageHeader title="Teslimatlar" description="Teslimat dogrulama, musteri bilgilendirme ve belge akislarini yonetin." />
      <section className="hz-metric-grid">
        <MetricCard title="Teslimat" value={String(deliveries.length)} detail="Aktif kayit" tone="info" />
        <MetricCard title="Hazir" value={String(deliveries.filter((item) => item.status === "ready").length)} detail="Tamamlanabilir" tone="success" />
        <MetricCard title="Eksik Odeme" value={String(deliveries.filter((item) => item.validation.paymentMissing).length)} detail="Onay gerekebilir" tone="warning" />
        <MetricCard title="Belge Eksik" value={String(deliveries.filter((item) => item.documentStatus === "missing").length)} detail="Uretilecek" tone="danger" />
      </section>
      <PrimaryActionToolbar><button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button">Yeni Teslimat</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Dogrula</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button">Musteriye Haber Ver</button></PrimaryActionToolbar>
      <DeliveryFilterBar />
      <SplitContentLayout main={loading ? <LoadingState title="Teslimatlar yukleniyor" message="Dogrulama ve belge durumlari hazirlaniyor." /> : <><DeliveryTable deliveries={pagedDeliveries} customers={customers} selectedId={selected?.id ?? null} onSelect={setSelectedId} onOpen={(id) => router.push(`/teslimatlar/${id}`)} /><Pagination totalItems={deliveries.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} /></>} side={<DeliveryPreviewPanel delivery={selected} />} />
    </div>
  );
}
