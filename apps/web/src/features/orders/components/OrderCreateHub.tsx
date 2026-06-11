"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { getOfferDetail } from "../../offers/queries/get-offers";
import { getOrders } from "../queries/get-orders";

export function buildQuickOrderHref(customerId?: string | null, sourceOfferId?: string | null): string {
  const params = new URLSearchParams();
  params.set("tab", "order");
  if (customerId) {
    params.set("customer", customerId);
  }
  if (sourceOfferId) {
    params.set("offer", sourceOfferId);
  }
  return `/hizli-islem/satis-masasi?${params.toString()}`;
}

export function OrderCreateHub({
  customerId,
  sourceOfferId
}: {
  customerId: string | null;
  sourceOfferId: string | null;
}) {
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [sourceOfferNo, setSourceOfferNo] = useState<string | null>(null);
  const [resolving, setResolving] = useState(Boolean(customerId || sourceOfferId));

  useEffect(() => {
    let mounted = true;

    Promise.all([
      customerId ? getOrders().then((r) => r.customers.find((c) => c.id === customerId)?.name ?? null) : Promise.resolve(null),
      sourceOfferId
        ? getOfferDetail(sourceOfferId).then((r) => r.offer?.offerNo ?? sourceOfferId)
        : Promise.resolve(null)
    ])
      .then(([name, offerNo]) => {
        if (!mounted) {
          return;
        }
        if (name) {
          setCustomerName(name);
        }
        if (offerNo) {
          setSourceOfferNo(offerNo);
        }
      })
      .finally(() => {
        if (mounted) {
          setResolving(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [customerId, sourceOfferId]);

  const quickOrderHref = useMemo(
    () => buildQuickOrderHref(customerId || null, sourceOfferId || null),
    [customerId, sourceOfferId]
  );

  const offerCardHref = sourceOfferId ? quickOrderHref : "/teklifler";
  const offerCardCta = sourceOfferId ? "Tekliften sipariş başlat" : "Teklif seç";
  const offerCardDesc = sourceOfferId
    ? `Kaynak teklif seçili${sourceOfferNo ? `: ${sourceOfferNo}` : ""}. Hızlı İşlem Masası'nda siparişe dönüştürün.`
    : "Siparişe dönüştürülecek teklifi seçin.";

  const showContextBand = true;

  return (
    <section className="sof-page" aria-labelledby="sof-page-title">
      <div className="sof-shell">
        <header className="sof-header">
          <div className="sof-header__main">
            <span className="sof-header__icon" aria-hidden>
              <LucideIcon name="shopping-cart" size={20} />
            </span>
            <div>
              <p className="sof-header__eyebrow">Siparişler</p>
              <h1 id="sof-page-title">Yeni Sipariş</h1>
              <p className="sof-header__lead">Sipariş oluşturma yöntemini seçin.</p>
            </div>
          </div>
          <Link className="sof-header__back" href="/siparisler">
            Siparişlere dön
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="sof-preview-band" role="status">
            Demo sipariş verileri gösteriliyor. Canlı sipariş kaydı Hızlı İşlem Masası üzerinden çalışır.
          </p>
        ) : null}

        {showContextBand ? (
          <p className="sof-context-band" role="status">
            {resolving ? (
              <span>Bağlam yükleniyor…</span>
            ) : (
              <>
                {customerName || customerId ? (
                  <span>
                    Cari: <strong>{customerName ?? customerId}</strong>
                  </span>
                ) : null}
                {sourceOfferNo || sourceOfferId ? (
                  <span>
                    Kaynak teklif: <strong>{sourceOfferNo ?? sourceOfferId}</strong>
                  </span>
                ) : null}
                {!customerName && !customerId && !sourceOfferNo && !sourceOfferId ? (
                  <span>Bağımsız sipariş başlangıcı</span>
                ) : null}
              </>
            )}
          </p>
        ) : null}

        <div className="sof-card-grid">
          <article className="sof-action-card sof-action-card--primary">
            <span className="sof-action-card__icon" aria-hidden>
              <LucideIcon name="zap" size={20} />
            </span>
            <div>
              <h2 className="sof-action-card__title">Hızlı Sipariş</h2>
              <p className="sof-action-card__desc">
                Cari ve ürünleri hızlı işlem masasında seçerek sipariş oluşturun.
              </p>
            </div>
            <Link className="sof-action-card__cta sof-action-card__cta--primary" href={quickOrderHref}>
              Hızlı sipariş başlat
              <LucideIcon name="arrow-right" size={14} />
            </Link>
          </article>

          <article className="sof-action-card">
            <span className="sof-action-card__icon" aria-hidden>
              <LucideIcon name="file-text" size={20} />
            </span>
            <div>
              <h2 className="sof-action-card__title">Tekliften Aktar</h2>
              <p className="sof-action-card__desc">{offerCardDesc}</p>
            </div>
            <Link className="sof-action-card__cta" href={offerCardHref}>
              {offerCardCta}
              <LucideIcon name="arrow-right" size={14} />
            </Link>
          </article>

          <article className="sof-action-card">
            <span className="sof-action-card__icon" aria-hidden>
              <LucideIcon name="clipboard-plus" size={20} />
            </span>
            <div>
              <h2 className="sof-action-card__title">Manuel</h2>
              <p className="sof-action-card__desc">
                Manuel form sonraki fazda ayrıştırılacak; şu anda sipariş girişi Hızlı İşlem Masası üzerinden yapılır.
              </p>
            </div>
            <Link className="sof-action-card__cta" href={quickOrderHref}>
              Manuel girişi hızlı masada aç
              <LucideIcon name="arrow-right" size={14} />
            </Link>
          </article>
        </div>

        <section className="sof-feature-bar" aria-label="Sipariş oluşturma notları">
          <article>
            <h3>Güvenli ve hızlı</h3>
            <p>Onay sonrası kayıt işlenir; bu ekranda doğrudan kayıt oluşturulmaz.</p>
          </article>
          <article>
            <h3>Operasyon etkisi</h3>
            <p>Satır, kaynak planı ve tahsilat bağlantısı Hızlı İşlem Masası&apos;nda yönetilir.</p>
          </article>
          <article>
            <h3>Teklif bağlamı</h3>
            <p>Kaynak teklif varsa offer parametresi satış masasına taşınır.</p>
          </article>
        </section>
      </div>
    </section>
  );
}
