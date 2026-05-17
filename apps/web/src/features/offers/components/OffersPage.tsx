"use client";

import { EntityListPageTemplate, LoadingState, MetricCard, Pagination, PrimaryActionToolbar } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { OfferFilterBar } from "./OfferFilterBar";
import { OfferQuickPreviewPanel } from "./OfferQuickPreviewPanel";
import { OfferTable } from "./OfferTable";
import { useOfferFilters } from "../hooks/use-offer-filters";
import { useOffersData } from "../hooks/use-offers-data";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";

export function OffersPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { filters, updateFilter, resetFilters } = useOfferFilters();
  const { loading, customers, filteredOffers, rows } = useOffersData(filters);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pagedRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [page, rows]);
  const selectedOffer = useMemo(
    () => filteredOffers.find((offer) => offer.id === selectedOfferId) ?? filteredOffers[0] ?? null,
    [filteredOffers, selectedOfferId]
  );
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedOffer?.customerId) ?? null,
    [customers, selectedOffer?.customerId]
  );

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (!filteredOffers.length) {
      setSelectedOfferId(null);
      return;
    }
    const first = filteredOffers[0];
    if (!first) {
      setSelectedOfferId(null);
      return;
    }
    if (!selectedOfferId || !filteredOffers.some((o) => o.id === selectedOfferId)) {
      setSelectedOfferId(first.id);
    }
  }, [filteredOffers, selectedOfferId]);

  return (
    <EntityListPageTemplate
      className="hz-offers-page"
      header={
        <div className="hz-offers-head">
          <div className="hz-offers-head-text">
            <h1 className="hz-offers-head-title">Teklifler</h1>
            <p className="hz-offers-head-sub">Satış öncesi teklifleri, fiyat grubu snapshotlarını ve follow-up akışlarını yönetin.</p>
          </div>
          <section className="hz-metric-grid">
            <MetricCard title="Açık teklif" value={String(filteredOffers.length)} detail="Filtre kapsamında" tone="info" />
            <MetricCard
              title="Onaylanan"
              value={String(filteredOffers.filter((offer) => offer.status === "approved").length)}
              detail="Siparişe hazır"
              tone="success"
            />
            <MetricCard
              title="Cevap bekleyen"
              value={String(filteredOffers.filter((offer) => offer.status === "waiting_response").length)}
              detail="Follow-up gerekli"
              tone="warning"
            />
            <MetricCard
              title="Toplam hacim"
              value={`${Math.round(filteredOffers.reduce((sum, offer) => sum + offer.grandTotal, 0) / 1000)}K`}
              detail="TRY"
              tone="info"
            />
          </section>
          {dataSourceConfig.useDemoData ? (
            <p className="hz-offers-preview-band" role="status">
              Örnek veri modu: liste kayıtları demo amaçlıdır.
            </p>
          ) : null}
          <PrimaryActionToolbar>
            <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={() => router.push("/teklifler/yeni")}>
              Yeni teklif
            </button>
            <button
              type="button"
              className="hz-btn hz-btn-secondary hz-toolbar-btn"
              onClick={() => pushToast("Belge önizlemesi hazırlanır; canlı gönderim henüz bağlı değil.")}
            >
              PDF üret
            </button>
            <button
              type="button"
              className="hz-btn hz-btn-secondary hz-toolbar-btn"
              onClick={() => pushToast("Follow-up planı taslak olarak kaydedilir; canlı hatırlatma henüz bağlı değil.")}
            >
              Follow-up planla
            </button>
          </PrimaryActionToolbar>
        </div>
      }
      filters={<OfferFilterBar filters={filters} customers={customers} onFilterChange={updateFilter} onReset={resetFilters} />}
      list={
        loading ? (
          <LoadingState title="Teklifler yükleniyor" message="Teklif, follow-up ve fiyat grubu özetleri hazırlanıyor." />
        ) : (
          <OfferTable
            rows={pagedRows}
            selectedOfferId={selectedOffer?.id ?? null}
            onSelectOffer={setSelectedOfferId}
            onOpenOffer={(offerId) => router.push(`/teklifler/${offerId}`)}
          />
        )
      }
      pagination={
        loading ? null : <Pagination totalItems={rows.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
      }
      preview={
        <div className="hz-offers-side">
          <OfferQuickPreviewPanel offer={selectedOffer} customer={selectedCustomer} />
        </div>
      }
    />
  );
}
