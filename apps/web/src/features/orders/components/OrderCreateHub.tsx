"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { getOfferDetail } from "../../offers/queries/get-offers";
import { getOrders } from "../queries/get-orders";

function buildQuickOpHref(customerId: string | null): string {
  if (!customerId) {
    return "/hizli-islem";
  }
  return `/hizli-islem?customer=${encodeURIComponent(customerId)}`;
}

export function OrderCreateHub({
  customerId,
  sourceOfferId
}: {
  customerId: string | null;
  sourceOfferId: string | null;
}) {
  const router = useRouter();
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

  const quickHref = useMemo(() => buildQuickOpHref(customerId), [customerId]);

  return (
    <div className="hz-commercial-create-hub hz-orders-create-hub">
      <div className="hz-commercial-create-hub-card">
        <p className="hz-commercial-create-hub-eyebrow">Siparişler</p>
        <h1 className="hz-commercial-create-hub-title">Yeni sipariş</h1>
        <p className="hz-commercial-create-hub-lead">
          Hızlı İşlem&apos;de hazırlayın, onaya gönderin; onay sonrası kayıt işlenecek.
        </p>

        {dataSourceConfig.useDemoData ? (
          <p className="hz-orders-preview-band" role="status">
            Örnek veri modu: liste ve yan sekmeler demo kayıtları gösterebilir; canlı kayıt oluşturulmaz.
          </p>
        ) : null}

        <ul className="hz-commercial-create-hub-points">
          <li>Hızlı İşlem&apos;de <strong>Sipariş</strong> segmentini seçerek satır, kaynak ve operasyon etkisini hazırlayın.</li>
          <li>Bu ekranda doğrudan kayıt oluşturulmaz; işlem onay zincirinden geçer.</li>
          {sourceOfferId ? (
            <li>
              Kaynak teklif: <strong>{resolving ? "yükleniyor…" : sourceOfferNo ?? sourceOfferId}</strong>
            </li>
          ) : null}
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
          <Link className="hz-btn hz-btn-secondary hz-toolbar-btn" href="/siparisler">
            Sipariş listesine dön
          </Link>
          {sourceOfferId ? (
            <Link className="hz-btn hz-btn-secondary hz-toolbar-btn" href={`/teklifler/${encodeURIComponent(sourceOfferId)}`}>
              Kaynak teklife git
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
