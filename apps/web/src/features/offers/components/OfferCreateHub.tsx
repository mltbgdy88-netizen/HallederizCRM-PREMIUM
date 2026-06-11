"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Offer } from "@hallederiz/types";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { getOffers } from "../queries/get-offers";
import { getOfferStatusLabel } from "../queries/offer-mock-data";

export function buildQuickOfferHref(customerId?: string | null): string {
  const params = new URLSearchParams();
  params.set("tab", "offer");
  if (customerId) {
    params.set("customer", customerId);
  }
  return `/hizli-islem/satis-masasi?${params.toString()}`;
}

function formatMoney(amount: number, currency: string): string {
  const prefix = currency === "TRY" ? "₺" : `${currency} `;
  return `${prefix}${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pickRecentOffers(offers: Offer[]): { items: Offer[]; title: string } {
  const drafts = offers
    .filter((offer) => offer.status === "draft")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  if (drafts.length > 0) {
    return { items: drafts, title: "Son Taslak Teklifler" };
  }

  const recent = [...offers]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  return { items: recent, title: "Son Teklifler" };
}

export function OfferCreateHub({ customerId }: { customerId: string | null }) {
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [customerNames, setCustomerNames] = useState<Map<string, string>>(new Map());
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [resolvingCustomer, setResolvingCustomer] = useState(Boolean(customerId));
  const [tipDismissed, setTipDismissed] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoadingOffers(true);
    if (customerId) {
      setResolvingCustomer(true);
    }

    getOffers()
      .then((result) => {
        if (!mounted) {
          return;
        }
        setOffers(result.offers);
        const nameMap = new Map(result.customers.map((customer) => [customer.id, customer.name]));
        setCustomerNames(nameMap);
        if (customerId) {
          setCustomerName(nameMap.get(customerId) ?? null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingOffers(false);
          setResolvingCustomer(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [customerId]);

  const quickOfferHref = useMemo(() => buildQuickOfferHref(customerId), [customerId]);
  const recentSection = useMemo(() => pickRecentOffers(offers), [offers]);

  return (
    <section className="tof-page" aria-labelledby="tof-page-title">
      <div className="tof-shell">
        <header className="tof-header">
          <div className="tof-header__main">
            <span className="tof-header__icon" aria-hidden>
              <LucideIcon name="file-text" size={20} />
            </span>
            <div>
              <p className="tof-header__eyebrow">Teklifler</p>
              <h1 id="tof-page-title">Yeni Teklif</h1>
              <p className="tof-header__lead">Teklif oluşturma yöntemini seçin.</p>
            </div>
          </div>
          <Link className="tof-header__back" href="/teklifler">
            Teklifler listesine dön
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="tof-preview-band" role="status">
            Demo teklif verileri gösteriliyor. Canlı teklif kaydı Hızlı İşlem Masası üzerinden çalışır.
          </p>
        ) : null}

        <p className="tof-context-band" role="status">
          {resolvingCustomer ? (
            <span>Bağlam yükleniyor…</span>
          ) : customerName || customerId ? (
            <span>
              Cari: <strong>{customerName ?? customerId}</strong>
            </span>
          ) : (
            <span>Bağımsız teklif başlangıcı</span>
          )}
        </p>

        <div className="tof-card-grid">
          <article className="tof-action-card tof-action-card--primary">
            <span className="tof-action-card__icon" aria-hidden>
              <LucideIcon name="zap" size={20} />
            </span>
            <div>
              <h2 className="tof-action-card__title">Hızlı Teklif</h2>
              <p className="tof-action-card__desc">
                Cari ve ürünleri hızlı işlem masasında seçerek teklif oluşturun.
              </p>
            </div>
            <Link className="tof-action-card__cta tof-action-card__cta--primary" href={quickOfferHref}>
              Hızlı teklif başlat
              <LucideIcon name="arrow-right" size={14} />
            </Link>
          </article>

          <article className="tof-action-card">
            <span className="tof-action-card__icon" aria-hidden>
              <LucideIcon name="clipboard-list" size={20} />
            </span>
            <div>
              <h2 className="tof-action-card__title">Detaylı Teklif</h2>
              <p className="tof-action-card__desc">
                Detaylı teklif formu sonraki fazda ayrıştırılacak; şu anda teklif girişi Hızlı İşlem Masası üzerinden
                yapılır.
              </p>
            </div>
            <Link className="tof-action-card__cta" href={quickOfferHref}>
              Detaylı teklifi hızlı masada aç
              <LucideIcon name="arrow-right" size={14} />
            </Link>
          </article>
        </div>

        <section className="tof-drafts" aria-labelledby="tof-drafts-title">
          <div className="tof-drafts__head">
            <h2 id="tof-drafts-title">{recentSection.title}</h2>
            <Link className="tof-drafts__all" href="/teklifler">
              Tümünü gör
            </Link>
          </div>

          {loadingOffers ? (
            <p className="tof-drafts__empty">Teklifler yükleniyor…</p>
          ) : recentSection.items.length === 0 ? (
            <p className="tof-drafts__empty">Henüz taslak teklif bulunmuyor.</p>
          ) : (
            <div className="tof-drafts__grid">
              {recentSection.items.map((offer) => {
                const customerLabel = customerNames.get(offer.customerId) ?? offer.customerId;
                return (
                  <article key={offer.id} className="tof-draft-card">
                    <div className="tof-draft-card__top">
                      <span className="tof-draft-card__icon" aria-hidden>
                        <LucideIcon name="file-text" size={16} />
                      </span>
                      <div className="tof-draft-card__meta">
                        <Link className="tof-draft-card__no" href={`/teklifler/${offer.id}`}>
                          {offer.offerNo}
                        </Link>
                        <p className="tof-draft-card__customer">{customerLabel}</p>
                      </div>
                      <span className={`tof-draft-card__badge tof-draft-card__badge--${offer.status}`}>
                        {getOfferStatusLabel(offer.status)}
                      </span>
                    </div>
                    <div className="tof-draft-card__bottom">
                      <strong>{formatMoney(offer.grandTotal, offer.currency)}</strong>
                      <Link className="tof-draft-card__link" href={`/teklifler/${offer.id}`}>
                        Detay
                        <LucideIcon name="arrow-right" size={12} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {!tipDismissed ? (
          <section className="tof-tip" aria-label="İpucu">
            <span className="tof-tip__icon" aria-hidden>
              <LucideIcon name="sparkles" size={16} />
            </span>
            <p>
              İpucu: Hızlı teklif ile zamandan tasarruf edin veya detaylı teklif ile tüm ihtiyaçlarınızı karşılayın.
              Kayıt oluşturma Hızlı İşlem Masası&apos;nda yapılır.
            </p>
            <button type="button" className="tof-tip__close" onClick={() => setTipDismissed(true)} aria-label="İpucunu kapat">
              <LucideIcon name="x" size={14} />
            </button>
          </section>
        ) : null}
      </div>
    </section>
  );
}
