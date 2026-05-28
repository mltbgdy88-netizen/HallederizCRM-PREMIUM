// @ts-nocheck
"use client";

import { EntityListPageTemplate, EmptyState, LoadingState, Pagination } from "@hallederiz/ui";
import type { Customer, Delivery } from "@hallederiz/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { CommercialOperasyonDeskIntro } from "../../ui-inventory/components/CommercialOperasyonDeskIntro";
import { dateLabel } from "../utils";
import { getDeliveries } from "../queries/get-deliveries";
import { getDeliveryStatusLabel } from "../queries/delivery-mock-data";

function DeliveryFilterBar() {
  return (
    <section className="hz-filter-card hz-deliveries-filter">
      <div className="hz-filter-grid">
        <label>
          Müşteri / teslim no
          <input placeholder="Teslim veya cari ara" />
        </label>
        <label>
          Durum
          <select defaultValue="">
            <option value="">Tüm durumlar</option>
            <option>Hazır</option>
            <option>Bekliyor</option>
            <option>Teslim edildi</option>
          </select>
        </label>
        <label className="hz-toggle">
          <input type="checkbox" />
          Hazır olanlar
        </label>
        <label className="hz-toggle">
          <input type="checkbox" />
          Eksik ödemeliler
        </label>
        <label>
          Belge durumu
          <select defaultValue="">
            <option value="">Tüm belgeler</option>
            <option>Hazır</option>
            <option>Eksik</option>
            <option>Gönderildi</option>
          </select>
        </label>
        <label>
          Tarih
          <select defaultValue="week">
            <option value="week">Bu hafta</option>
            <option value="today">Bugün</option>
            <option value="month">Bu ay</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function DeliveryPreviewPanel({
  delivery,
  customerName,
  onNavigate
}: {
  delivery: Delivery | null;
  customerName: string | null;
  onNavigate: (id: string) => void;
}) {
  const { pushToast } = useToast();

  if (!delivery) {
    return (
      <aside className="hz-commercial-entity-side hz-deliveries-side">
        <p className="hz-commercial-entity-side-empty">Kayıt seçilmedi.</p>
      </aside>
    );
  }

  return (
    <aside className="hz-commercial-entity-side hz-deliveries-side">
      <h3>Teslimat önizleme</h3>
      <ul className="hz-commercial-entity-side-list">
        <li>
          <strong>Teslim:</strong> {delivery.deliveryNo}
        </li>
        <li>
          <strong>Sipariş:</strong> {delivery.orderNo}
        </li>
        <li>
          <strong>Cari:</strong> {customerName ?? "—"}
        </li>
        <li>
          <strong>Durum:</strong> {getDeliveryStatusLabel(delivery.status)}
        </li>
        <li>
          <strong>Depo hazır:</strong> {delivery.validation.warehouseReady ? "Evet" : "Hayır"}
        </li>
        <li>
          <strong>Eksik ödeme:</strong> {delivery.validation.paymentMissing ? "Var" : "Yok"}
        </li>
        <li>
          <strong>Belge:</strong> {delivery.documentStatus}
        </li>
      </ul>
      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          type="button"
          className="hz-btn hz-btn-primary hz-toolbar-btn"
          style={{ flex: 1 }}
          onClick={() => onNavigate(delivery.id)}
        >
          Detay
        </button>
        <button
          type="button"
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          style={{ flex: 1 }}
          onClick={() => pushToast("Taslak hazırlandı: doğrulama onay akışına iletildi.")}
        >
          Doğrula
        </button>
      </div>
    </aside>
  );
}

export function DeliveriesPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setLoadError(false);
    getDeliveries()
      .then((result) => {
        setDeliveries(result.deliveries);
        setCustomers(result.customers);
      })
      .catch(() => {
        setDeliveries([]);
        setCustomers([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || deliveries.length === 0) {
      if (!loading && deliveries.length === 0) setSelectedId(null);
      return;
    }
    if (!selectedId || !deliveries.some((d) => d.id === selectedId)) {
      setSelectedId(deliveries[0]?.id ?? null);
    }
  }, [loading, deliveries, selectedId]);

  const selected = useMemo(
    () => deliveries.find((delivery) => delivery.id === selectedId) ?? null,
    [deliveries, selectedId]
  );
  const selectedCustomerName = useMemo(
    () => (selected ? customers.find((c) => c.id === selected.customerId)?.name ?? null : null),
    [customers, selected]
  );
  const pagedDeliveries = useMemo(() => deliveries.slice((page - 1) * pageSize, page * pageSize), [deliveries, page]);

  const statusBadgeClass = (delivery: Delivery) => {
    if (delivery.status === "delivered") return "hz-badge hz-badge-success";
    if (delivery.validation.valid) return "hz-badge hz-badge-info";
    return "hz-badge hz-badge-warning";
  };

  return (
    <EntityListPageTemplate
      className="hz-commercial-entity-page hz-deliveries-page hz-teslimatlar-desk"
      previewSideWidth="detail"
      header={
        <>
          <CommercialOperasyonDeskIntro
            title="Teslimat Operasyon Masası"
            subtitle="Teslimat doğrulama, müşteri bilgilendirme ve belge akışlarını tek ekranda yönetin."
            icon="truck"
            actions={
              <>
                <Link href="/hizli-islem/teslim" className="hz-commercial-desk-btn hz-commercial-desk-btn--primary">
                  <LucideIcon name="plus" size={14} />
                  Hızlı Teslim
                </Link>
                <Link href="/teslimatlar/rota" className="hz-commercial-desk-btn hz-commercial-desk-btn--secondary">
                  <LucideIcon name="external-link" size={14} />
                  Rota Planı
                </Link>
                <button
                  type="button"
                  className="hz-commercial-desk-btn hz-commercial-desk-btn--secondary"
                  onClick={() => pushToast("Dışa aktarma backend onay akışına bağlıdır; demo modunda simüle edildi.")}
                >
                  <LucideIcon name="download" size={14} />
                  Dışa Aktar
                </button>
              </>
            }
          />
          <div className="hz-commercial-entity-kpi-strip" aria-label="Teslimat özeti">
            <div className="hz-commercial-entity-kpi">
              <span className="hz-commercial-entity-kpi-label">Kayıt</span>
              <span className="hz-commercial-entity-kpi-value">{deliveries.length}</span>
            </div>
            <div className="hz-commercial-entity-kpi">
              <span className="hz-commercial-entity-kpi-label">Hazır</span>
              <span className="hz-commercial-entity-kpi-value">
                {deliveries.filter((item) => item.status === "ready").length}
              </span>
            </div>
            <div className="hz-commercial-entity-kpi">
              <span className="hz-commercial-entity-kpi-label">Eksik ödeme</span>
              <span className="hz-commercial-entity-kpi-value">
                {deliveries.filter((item) => item.validation.paymentMissing).length}
              </span>
            </div>
            <div className="hz-commercial-entity-kpi">
              <span className="hz-commercial-entity-kpi-label">Belge eksik</span>
              <span className="hz-commercial-entity-kpi-value">
                {deliveries.filter((item) => item.documentStatus === "missing").length}
              </span>
            </div>
          </div>
          {dataSourceConfig.useDemoData ? (
            <p className="hz-commercial-entity-preview-band" role="status">
              Örnek veri modu: liste kayıtları demo amaçlıdır; canlı operasyon sonucu değildir.
            </p>
          ) : null}
        </>
      }
      filters={<DeliveryFilterBar />}
      list={
        <div className="hz-commercial-entity-list-wrap">
          {loading ? (
            <LoadingState title="Teslimatlar yükleniyor" message="Doğrulama ve belge durumları hazırlanıyor." />
          ) : loadError ? (
            <EmptyState title="Teslimat listesi alınamadı" message="Bağlantı kurulamadı. Lütfen tekrar deneyin." />
          ) : deliveries.length === 0 ? (
            <EmptyState title="Teslimat bulunamadı" message="Kayıt yok veya filtre sonucu boş." />
          ) : (
            <>
              <div className="hz-commercial-entity-table-head hz-deliveries-table-head" role="row">
                <span>Teslim no</span>
                <span>Sipariş</span>
                <span>Cari</span>
                <span>Durum</span>
                <span>Tarih</span>
                <span>Belge</span>
                <span>AKSİYON</span>
              </div>
              <div className="hz-commercial-entity-table-body">
                {pagedDeliveries.map((delivery) => {
                  const customerName = customers.find((c) => c.id === delivery.customerId)?.name ?? "—";
                  return (
                    <div
                      key={delivery.id}
                      role="row"
                      className={`hz-commercial-entity-table-row hz-deliveries-table-row${selectedId === delivery.id ? " is-selected" : ""}`}
                      onClick={() => setSelectedId(delivery.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") setSelectedId(delivery.id);
                      }}
                      tabIndex={0}
                    >
                      <span>{delivery.deliveryNo}</span>
                      <span>{delivery.orderNo}</span>
                      <span>{customerName}</span>
                      <span>
                        <span className={statusBadgeClass(delivery)}>{getDeliveryStatusLabel(delivery.status)}</span>
                      </span>
                      <span>{dateLabel(delivery.deliveredAt ?? delivery.plannedAt)}</span>
                      <span>{delivery.documentStatus}</span>
                      <span>
                        <button
                          type="button"
                          className="hz-commercial-entity-action-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/teslimatlar/${delivery.id}`);
                          }}
                        >
                          İncele
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
              <Pagination totalItems={deliveries.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
            </>
          )}
        </div>
      }
      preview={
        <DeliveryPreviewPanel
          delivery={selected}
          customerName={selectedCustomerName}
          onNavigate={(id) => router.push(`/teslimatlar/${id}`)}
        />
      }
    />
  );
}


