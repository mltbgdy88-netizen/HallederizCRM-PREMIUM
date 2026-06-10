"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { PaymentMethod } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { submitQuickOperationRecord } from "../../../services/api/quick-operations.service";
import { getOrders } from "../../orders/queries/get-orders";
import { getPayments } from "../queries/get-payments";

const METHODS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "cash", label: "Nakit" },
  { value: "transfer", label: "Havale / EFT" },
  { value: "card", label: "Kredi kartı" },
  { value: "check", label: "Çek / senet" },
  { value: "mixed", label: "Diğer" }
];

function money(value: number): string {
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function PaymentCreatePage({
  customerId: initialCustomerId,
  sourceOrderId
}: {
  customerId: string | null;
  sourceOrderId: string | null;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [orders, setOrders] = useState<Array<{ id: string; orderNo: string; customerId: string; grandTotal: number; paidTotal: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedPaymentId, setSavedPaymentId] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState(initialCustomerId ?? "");
  const [orderId, setOrderId] = useState(sourceOrderId ?? "");
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNo, setReferenceNo] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getPayments(), getOrders()])
      .then(([paymentsResult, ordersResult]) => {
        if (!active) return;
        setCustomers(paymentsResult.customers.map((c) => ({ id: c.id, name: c.name })));
        setOrders(
          ordersResult.orders.map((o) => ({
            id: o.id,
            orderNo: o.orderNo,
            customerId: o.customerId,
            grandTotal: o.grandTotal,
            paidTotal: o.paidTotal
          }))
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const customerOrders = useMemo(
    () => orders.filter((order) => !customerId || order.customerId === customerId),
    [customerId, orders]
  );

  const selectedOrder = useMemo(() => orders.find((o) => o.id === orderId), [orderId, orders]);

  useEffect(() => {
    if (!selectedOrder) return;
    const open = Math.max(0, selectedOrder.grandTotal - selectedOrder.paidTotal);
    if (open > 0 && amount <= 0) {
      setAmount(open);
    }
  }, [selectedOrder, amount]);

  const openAmount = selectedOrder ? Math.max(0, selectedOrder.grandTotal - selectedOrder.paidTotal) : null;

  const handleSave = async () => {
    if (!customerId) {
      pushToast("Önce cari seçin veya oluşturun.");
      return;
    }
    if (amount <= 0) {
      pushToast("Tahsilat tutarı sıfırdan büyük olmalıdır.");
      return;
    }
    if (selectedOrder && amount > (openAmount ?? amount)) {
      pushToast("Tahsilat tutarı sipariş açık bakiyesini aşamaz.");
      return;
    }

    if (dataSourceConfig.useDemoData) {
      pushToast("Demo modda canlı tahsilat oluşturulmaz. Taslak bilgileri kaydedildi.");
      setSavedPaymentId("demo_blocked");
      return;
    }

    setSaving(true);
    try {
      if (orderId) {
        const result = await submitQuickOperationRecord({
          operationType: "payment",
          customerId,
          orderId,
          note: note.trim() || undefined,
          paidAmount: amount,
          payment: {
            enabled: true,
            amount,
            method,
            receivedAt: `${receivedAt}T12:00:00.000Z`,
            referenceNo: referenceNo.trim() || undefined,
            note: note.trim() || undefined,
            allocateToOrder: true
          },
          lines: []
        });
        if (!result.ok || !result.createdEntityId) {
          pushToast("Tahsilat kaydı tamamlanamadı. Bilgileri kontrol edin.");
          return;
        }
        setSavedPaymentId(result.createdEntityId);
        pushToast("Tahsilat kaydı hazırlandı.");
        return;
      }

      const response = await sdk.payments.create({
        customerId,
        amount,
        currency: "TRY",
        method,
        status: "draft",
        description: note.trim() || "Tahsilat girişi",
        referenceNo: referenceNo.trim() || undefined,
        receivedAt: `${receivedAt}T12:00:00.000Z`
      });
      setSavedPaymentId(response.item.id);
      pushToast("Tahsilat kaydı hazırlandı.");
    } catch {
      pushToast("Tahsilat kaydı şu an tamamlanamadı. Bağlantıyı kontrol edin.");
    } finally {
      setSaving(false);
    }
  };

  if (savedPaymentId && savedPaymentId !== "demo_blocked") {
    return (
      <div className="hz-commercial-create-hub hz-payments-create-page">
        <div className="hz-commercial-create-hub-card">
          <p className="hz-commercial-create-hub-eyebrow">Tahsilatlar</p>
          <h1 className="hz-commercial-create-hub-title">Tahsilat hazırlandı</h1>
          <p className="hz-commercial-create-hub-lead">Kayıt işlendi. Detayı inceleyebilir veya listeye dönebilirsiniz.</p>
          <div className="hz-commercial-create-hub-actions">
            <Link className="hz-btn hz-btn-primary hz-toolbar-btn" href={`/tahsilatlar/${encodeURIComponent(savedPaymentId)}`}>
              Tahsilat detayına git
            </Link>
            {orderId ? (
              <Link className="hz-btn hz-btn-secondary hz-toolbar-btn" href={`/siparisler/${encodeURIComponent(orderId)}`}>
                Kaynak siparişe git
              </Link>
            ) : null}
            <Link className="hz-btn hz-btn-secondary hz-toolbar-btn" href="/tahsilatlar">
              Tahsilat listesine dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hz-commercial-create-hub hz-payments-create-page">
      <div className="hz-commercial-create-hub-card">
        <p className="hz-commercial-create-hub-eyebrow">Tahsilatlar</p>
        <h1 className="hz-commercial-create-hub-title">Yeni tahsilat</h1>
        <p className="hz-commercial-create-hub-lead">
          Cari ve isteğe bağlı sipariş seçerek tahsilat kaydı oluşturun. Sipariş bağlantısı açık bakiyeyi günceller.
        </p>

        {dataSourceConfig.useDemoData ? (
          <p className="hz-payments-preview-band" role="status">
            Demo mod: form doldurulabilir; canlı kayıt oluşturulmaz.
          </p>
        ) : null}

        {loading ? (
          <p role="status">Yükleniyor…</p>
        ) : (
          <form
            className="hz-payments-create-form"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
          >
            <label className="hz-qop-field">
              <span className="hz-qop-label">Cari</span>
              <select className="hz-qop-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                <option value="">Seçin…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="hz-qop-field">
              <span className="hz-qop-label">Bağlı sipariş (isteğe bağlı)</span>
              <select className="hz-qop-input" value={orderId} onChange={(e) => setOrderId(e.target.value)}>
                <option value="">Sipariş seçmeyin</option>
                {customerOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNo} · Açık: ₺{money(Math.max(0, o.grandTotal - o.paidTotal))}
                  </option>
                ))}
              </select>
            </label>

            {openAmount !== null ? (
              <p className="hz-qop-payment-hint" role="status">
                Sipariş açık bakiye: <strong>₺{money(openAmount)}</strong>
              </p>
            ) : null}

            <label className="hz-qop-field">
              <span className="hz-qop-label">Tahsilat tutarı (₺)</span>
              <input
                className="hz-qop-input"
                type="number"
                min={0.01}
                step={0.01}
                value={amount || ""}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value || 0)))}
                required
              />
            </label>

            <label className="hz-qop-field">
              <span className="hz-qop-label">Ödeme yöntemi</span>
              <select className="hz-qop-input" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {METHODS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="hz-qop-field">
              <span className="hz-qop-label">Tahsilat tarihi</span>
              <input className="hz-qop-input" type="date" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} />
            </label>

            <label className="hz-qop-field">
              <span className="hz-qop-label">Referans no</span>
              <input className="hz-qop-input" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} />
            </label>

            <label className="hz-qop-field">
              <span className="hz-qop-label">Açıklama</span>
              <input className="hz-qop-input" value={note} onChange={(e) => setNote(e.target.value)} />
            </label>

            <div className="hz-commercial-create-hub-actions">
              <button type="submit" className="hz-btn hz-btn-primary hz-toolbar-btn" disabled={saving}>
                {saving ? "Kaydediliyor…" : "Tahsilatı kaydet"}
              </button>
              <button
                type="button"
                className="hz-btn hz-btn-secondary hz-toolbar-btn"
                onClick={() =>
                  router.push(
                    customerId
                      ? `/hizli-islem?customer=${encodeURIComponent(customerId)}${orderId ? `&order=${encodeURIComponent(orderId)}` : ""}`
                      : "/hizli-islem"
                  )
                }
              >
                Hızlı İşlem&apos;e git
              </button>
              <Link className="hz-btn hz-btn-secondary hz-toolbar-btn" href="/tahsilatlar">
                Listeye dön
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

