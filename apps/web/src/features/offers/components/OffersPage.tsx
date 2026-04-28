"use client";

import { LoadingState, MetricCard, PageHeader, PrimaryActionToolbar, SplitContentLayout } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { OfferFilterBar } from "./OfferFilterBar";
import { OfferQuickPreviewPanel } from "./OfferQuickPreviewPanel";
import { OfferTable } from "./OfferTable";
import { useOfferFilters } from "../hooks/use-offer-filters";
import { useOffersData } from "../hooks/use-offers-data";

export function OffersPage() {
  const router = useRouter();
  const { filters, updateFilter, resetFilters } = useOfferFilters();
  const { loading, customers, filteredOffers, rows } = useOffersData(filters);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const selectedOffer = useMemo(
    () => filteredOffers.find((offer) => offer.id === selectedOfferId) ?? filteredOffers[0] ?? null,
    [filteredOffers, selectedOfferId]
  );
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedOffer?.customerId) ?? null,
    [customers, selectedOffer?.customerId]
  );

  return (
    <div className="hz-page-stack">
      <PageHeader
        title="Teklifler"
        description="Satis oncesi teklifleri, fiyat grubu snapshotlarini ve follow-up akislarini yonetin."
      />

      <section className="hz-metric-grid">
        <MetricCard title="Acik Teklif" value={String(filteredOffers.length)} detail="Filtre kapsaminda" tone="info" />
        <MetricCard title="Onaylanan" value={String(filteredOffers.filter((offer) => offer.status === "approved").length)} detail="Siparise hazir" tone="success" />
        <MetricCard title="Cevap Bekleyen" value={String(filteredOffers.filter((offer) => offer.status === "waiting_response").length)} detail="Follow-up gerekli" tone="warning" />
        <MetricCard title="Toplam Hacim" value={`${Math.round(filteredOffers.reduce((sum, offer) => sum + offer.grandTotal, 0) / 1000)}K`} detail="TRY" tone="info" />
      </section>

      <PrimaryActionToolbar>
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={() => router.push("/teklifler/yeni")}>
          Yeni Teklif
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
          PDF Uret
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
          Follow-up Planla
        </button>
      </PrimaryActionToolbar>

      <OfferFilterBar filters={filters} customers={customers} onFilterChange={updateFilter} onReset={resetFilters} />

      <SplitContentLayout
        main={
          loading ? (
            <LoadingState title="Teklifler yukleniyor" message="Teklif, follow-up ve fiyat grubu ozetleri hazirlaniyor." />
          ) : (
            <OfferTable
              rows={rows}
              selectedOfferId={selectedOffer?.id ?? null}
              onSelectOffer={setSelectedOfferId}
              onOpenOffer={(offerId) => router.push(`/teklifler/${offerId}`)}
            />
          )
        }
        side={<OfferQuickPreviewPanel offer={selectedOffer} customer={selectedCustomer} />}
      />
    </div>
  );
}
