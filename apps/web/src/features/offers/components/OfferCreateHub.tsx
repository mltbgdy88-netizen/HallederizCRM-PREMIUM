"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { getOffers } from "../queries/get-offers";

function buildQuickOpHref(customerId: string | null): string {
  if (!customerId) {
    return "/hizli-islem";
  }
  return `/hizli-islem?customer=${encodeURIComponent(customerId)}`;
}

export function OfferCreateHub({ customerId }: { customerId: string | null }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [resolving, setResolving] = useState(Boolean(customerId));

  useEffect(() => {
    if (!customerId) {
      setResolving(false);
      return;
    }

    let mounted = true;
    getOffers()
      .then((result) => {
        if (!mounted) {
          return;
        }
        const match = result.customers.find((item) => item.id === customerId);
        setCustomerName(match?.name ?? null);
      })
      .finally(() => {
        if (mounted) {
          setResolving(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [customerId]);

  const quickHref = useMemo(() => buildQuickOpHref(customerId), [customerId]);

  return (
    <div className="hz-commercial-create-hub hz-offers-create-hub">
      <div className="hz-commercial-create-hub-card">
        <p className="hz-commercial-create-hub-eyebrow">Teklifler</p>
        <h1 className="hz-commercial-create-hub-title">Yeni teklif</h1>
        <p className="hz-commercial-create-hub-lead">
          Bu işlem Hızlı İşlem workbench üzerinden hazırlanır. Gerçek kayıt için onay ve işlem kuyruğu bağlantısı gerekir.
        </p>

        {dataSourceConfig.useDemoData ? (
          <p className="hz-offers-preview-band" role="status">
            Örnek veri modu: liste ve önizleme kayıtları demo amaçlıdır; canlı kayıt oluşturulmaz.
          </p>
        ) : null}

        <ul className="hz-commercial-create-hub-points">
          <li>Hızlı İşlem&apos;de <strong>Teklif</strong> segmentini seçerek satır, fiyat ve belge taslağını hazırlayın.</li>
          <li>Bu ekranda taslak kaydet veya gönder simülasyonu yapılmaz.</li>
          {customerId ? (
            <li>
              Cari bağlamı:{" "}
              <strong>{resolving ? "yükleniyor…" : customerName ?? customerId}</strong>
              {!customerName && !resolving ? " (listedeki cari kodu; canlıda eşleşme kontrol edin)" : null}
            </li>
          ) : (
            <li>Cari seçimi Hızlı İşlem ekranında yapılır.</li>
          )}
        </ul>

        <div className="hz-commercial-create-hub-actions">
          <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={() => router.push(quickHref)}>
            Hızlı İşlem&apos;de hazırla
          </button>
          <Link className="hz-btn hz-btn-secondary hz-toolbar-btn" href="/teklifler">
            Teklif listesine dön
          </Link>
        </div>
      </div>
    </div>
  );
}
