"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { getOrders } from "../../orders/queries/get-orders";
import { getPayments } from "../queries/get-payments";

function buildQuickOpHref(customerId: string | null): string {
  if (!customerId) {
    return "/hizli-islem";
  }
  return `/hizli-islem?customer=${encodeURIComponent(customerId)}`;
}

export function PaymentCreateHub({
  customerId,
  sourceOrderId
}: {
  customerId: string | null;
  sourceOrderId: string | null;
}) {
  const router = useRouter();
  const [resolvedCustomerId, setResolvedCustomerId] = useState<string | null>(customerId);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [sourceOrderNo, setSourceOrderNo] = useState<string | null>(null);
  const [resolving, setResolving] = useState(Boolean(customerId || sourceOrderId));

  useEffect(() => {
    let mounted = true;

    Promise.all([
      customerId
        ? getPayments().then((result) => result.customers.find((item) => item.id === customerId)?.name ?? null)
        : Promise.resolve(null),
      sourceOrderId
        ? getOrders().then((result) => {
            const order = result.orders.find((item) => item.id === sourceOrderId);
            if (!order) {
              return { orderNo: sourceOrderId, customerId: null as string | null, customerName: null as string | null };
            }
            const name = result.customers.find((item) => item.id === order.customerId)?.name ?? null;
            return { orderNo: order.orderNo, customerId: order.customerId, customerName: name };
          })
        : Promise.resolve(null)
    ])
      .then(([nameFromCustomer, orderContext]) => {
        if (!mounted) {
          return;
        }
        if (nameFromCustomer) {
          setCustomerName(nameFromCustomer);
        }
        if (orderContext) {
          setSourceOrderNo(orderContext.orderNo);
          if (!customerId && orderContext.customerId) {
            setResolvedCustomerId(orderContext.customerId);
          }
          if (orderContext.customerName) {
            setCustomerName(orderContext.customerName);
          }
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
  }, [customerId, sourceOrderId]);

  const quickHref = useMemo(() => buildQuickOpHref(resolvedCustomerId), [resolvedCustomerId]);

  return (
    <div className="hz-commercial-create-hub hz-payments-create-hub">
      <div className="hz-commercial-create-hub-card">
        <p className="hz-commercial-create-hub-eyebrow">Tahsilatlar</p>
        <h1 className="hz-commercial-create-hub-title">Yeni tahsilat</h1>
        <p className="hz-commercial-create-hub-lead">
          Tahsilat kaydı henüz canlı kullanıma bağlı değil. Bu işlem Hızlı İşlem workbench üzerinden hazırlanır; onay ve
          işlem kuyruğu bağlantısı gerekir. Önizleme verisiyle gerçek tahsilat oluşturulmaz.
        </p>

        {dataSourceConfig.useDemoData ? (
          <p className="hz-payments-preview-band" role="status">
            Örnek veri modu: liste ve önizleme kayıtları demo amaçlıdır; canlı tahsilat oluşturulmaz.
          </p>
        ) : null}

        <ul className="hz-commercial-create-hub-points">
          <li>
            Hızlı İşlem&apos;de <strong>Tahsilat</strong> segmentini seçerek tutar, ödeme yöntemi ve cari eşleşmesini
            hazırlayın.
          </li>
          <li>Bu ekranda taslak kaydet veya doğrula simülasyonu yapılmaz.</li>
          {sourceOrderId ? (
            <li>
              Sipariş bağlamı: <strong>{resolving ? "yükleniyor…" : sourceOrderNo ?? sourceOrderId}</strong>
            </li>
          ) : null}
          {resolvedCustomerId ? (
            <li>
              Cari bağlamı:{" "}
              <strong>{resolving ? "yükleniyor…" : customerName ?? resolvedCustomerId}</strong>
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
          <Link className="hz-btn hz-btn-secondary hz-toolbar-btn" href="/tahsilatlar">
            Tahsilat listesine dön
          </Link>
          {sourceOrderId ? (
            <Link className="hz-btn hz-btn-secondary hz-toolbar-btn" href={`/siparisler/${encodeURIComponent(sourceOrderId)}`}>
              Kaynak siparişe git
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
