"use client";

import { LoadingState, Pagination } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
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

  const approvedCount = filteredOffers.filter((offer) => offer.status === "approved").length;
  const waitingCount = filteredOffers.filter((offer) => offer.status === "waiting_response").length;
  const expiringCount = filteredOffers.filter((offer) => {
    const valid = new Date(offer.validUntil).getTime();
    return valid > Date.now() && valid - Date.now() < 7 * 24 * 60 * 60 * 1000;
  }).length;
  const convertedCount = filteredOffers.filter((offer) => offer.status === "converted").length;
  const volume = filteredOffers.reduce((sum, offer) => sum + offer.grandTotal, 0);

  return (
    <main className="hz-offers-page hz-offers-page--desk">
      <header className="hz-offers-desk-head">
        <div className="hz-offers-desk-head__text">
          <h1>Teklif Operasyon Masası</h1>
          <p>Teklif hazırlığı, müşteri takibi ve siparişe dönüşümü tek ekranda yönetin.</p>
        </div>
        <div className="hz-offers-desk-head__actions">
          <button type="button" className="hz-offers-desk-btn hz-offers-desk-btn--primary" onClick={() => router.push("/teklifler/yeni")}>
            <LucideIcon name="plus-square" size={14} />
            Yeni Teklif
          </button>
          <button type="button" className="hz-offers-desk-btn" onClick={() => router.push("/hizli-islem")}>
            <LucideIcon name="zap" size={14} />
            Hızlı Satış
          </button>
          <button type="button" className="hz-offers-desk-btn" onClick={() => pushToast("Dışa aktarım taslağı hazırlandı.")}>
            <LucideIcon name="file-text" size={14} />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="hz-offers-desk-stats" aria-label="Teklif özetleri">
        <article>
          <span className="hz-offers-stat-ico" aria-hidden><LucideIcon name="file-text" size={18} /></span>
          <div><span>Açık Teklif</span><strong>{filteredOffers.length}</strong><small>₺{Math.round(volume / 1000).toLocaleString("tr-TR")}.000</small></div>
        </article>
        <article>
          <span className="hz-offers-stat-ico" aria-hidden><LucideIcon name="send" size={18} /></span>
          <div><span>Gönderilen</span><strong>{approvedCount}</strong><small>Siparişe hazır</small></div>
        </article>
        <article>
          <span className="hz-offers-stat-ico" aria-hidden><LucideIcon name="clock" size={18} /></span>
          <div><span>Yanıt Bekleyen</span><strong>{waitingCount}</strong><small>Takip gerekli</small></div>
        </article>
        <article>
          <span className="hz-offers-stat-ico hz-offers-stat-ico--gold" aria-hidden><LucideIcon name="alert-triangle" size={18} /></span>
          <div><span>Süresi Yaklaşan</span><strong>{expiringCount}</strong><small>7 gün içinde dolacak</small></div>
        </article>
        <article>
          <span className="hz-offers-stat-ico" aria-hidden><LucideIcon name="shopping-cart" size={18} /></span>
          <div><span>Siparişe Dönüşen</span><strong>{convertedCount}</strong><small>Bu ay</small></div>
        </article>
      </section>

      {dataSourceConfig.useDemoData ? (
        <p className="hz-offers-preview-band" role="status">
          Örnek veri modu: liste kayıtları demo amaçlıdır.
        </p>
      ) : null}

      <div className="hz-offers-desk-grid">
        <section className="hz-offers-desk-main">
          <OfferFilterBar filters={filters} customers={customers} onFilterChange={updateFilter} onReset={resetFilters} />
          {loading ? (
            <LoadingState title="Teklifler yükleniyor" message="Teklif, follow-up ve fiyat grubu özetleri hazırlanıyor." />
          ) : (
            <>
              <OfferTable
                rows={pagedRows}
                selectedOfferId={selectedOffer?.id ?? null}
                onSelectOffer={setSelectedOfferId}
                onOpenOffer={(offerId) => router.push(`/teklifler/${offerId}`)}
              />
              <div className="hz-offers-pagination">
                <Pagination totalItems={rows.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
              </div>
            </>
          )}
        </section>
        <aside className="hz-offers-side">
          <OfferQuickPreviewPanel offer={selectedOffer} customer={selectedCustomer} />
        </aside>
      </div>
    </main>
  );
}
