"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PaymentMethod } from "@hallederiz/types";
import { LucideIcon } from "../../../components/icons/lucide-icons";
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

type DeskOrderRow = {
  id: string;
  orderNo: string;
  customerId: string;
  grandTotal: number;
  paidTotal: number;
};

function money(value: number): string {
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function resolveOrderOpenBalance(order: DeskOrderRow): number {
  return Math.max(0, order.grandTotal - order.paidTotal);
}

function buildHizliIslemHref(customerId: string, orderId: string): string {
  const params = new URLSearchParams({ tab: "payment" });
  if (customerId) {
    params.set("customer", customerId);
  }
  if (orderId) {
    params.set("order", orderId);
  }
  return `/hizli-islem/satis-masasi?${params.toString()}`;
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
  const initialSyncRef = useRef(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [orders, setOrders] = useState<DeskOrderRow[]>([]);
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

  useEffect(() => {
    if (initialSyncRef.current) return;
    if (loading) return;

    if (sourceOrderId) {
      const matchedOrder = orders.find((order) => order.id === sourceOrderId);
      if (matchedOrder) {
        setOrderId(matchedOrder.id);
        setCustomerId(matchedOrder.customerId);
        const open = resolveOrderOpenBalance(matchedOrder);
        if (open > 0) {
          setAmount((current) => (current <= 0 ? open : current));
        }
        initialSyncRef.current = true;
        return;
      }
    }

    if (initialCustomerId) {
      setCustomerId(initialCustomerId);
      initialSyncRef.current = true;
    }
  }, [sourceOrderId, initialCustomerId, orders, loading]);

  const customerOrders = useMemo(
    () => orders.filter((order) => !customerId || order.customerId === customerId),
    [customerId, orders]
  );

  const selectedOrder = useMemo(() => orders.find((o) => o.id === orderId) ?? null, [orderId, orders]);

  const selectedCustomerName = useMemo(
    () => customers.find((customer) => customer.id === customerId)?.name ?? "—",
    [customers, customerId]
  );

  useEffect(() => {
    if (!selectedOrder) return;
    const open = resolveOrderOpenBalance(selectedOrder);
    if (open > 0 && amount <= 0) {
      setAmount(open);
    }
  }, [selectedOrder, amount]);

  const openAmount = selectedOrder ? resolveOrderOpenBalance(selectedOrder) : null;
  const remainingBalance = openAmount !== null ? Math.max(0, openAmount - amount) : null;

  function handleCustomerChange(nextCustomerId: string) {
    setCustomerId(nextCustomerId);
    if (!orderId) return;
    const linkedOrder = orders.find((order) => order.id === orderId);
    if (linkedOrder && linkedOrder.customerId !== nextCustomerId) {
      setOrderId("");
    }
  }

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
      <section className="thf-page thf-page--success" aria-live="polite">
        <div className="thf-shell">
          <header className="thf-header">
            <div className="thf-header__main">
              <span className="thf-header__icon" aria-hidden>
                <LucideIcon name="check-circle-2" size={20} />
              </span>
              <div>
                <p className="thf-header__eyebrow">Tahsilatlar</p>
                <h1>Tahsilat hazırlandı</h1>
                <p className="thf-header__lead">Kayıt işlendi. Detayı inceleyebilir veya listeye dönebilirsiniz.</p>
              </div>
            </div>
          </header>

          <div className="thf-card">
            <div className="thf-card__body">
              <p className="thf-success-lead">Tahsilat kaydı oluşturuldu. Sonraki adımı seçin.</p>
            </div>
            <footer className="thf-actions">
              <Link className="thf-btn thf-btn--primary" href={`/tahsilatlar/${encodeURIComponent(savedPaymentId)}`}>
                Tahsilat detayına git
              </Link>
              {orderId ? (
                <Link className="thf-btn" href={`/siparisler/${encodeURIComponent(orderId)}`}>
                  Kaynak siparişe git
                </Link>
              ) : null}
              <Link className="thf-btn" href="/tahsilatlar">
                Tahsilat listesine dön
              </Link>
            </footer>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="thf-page" aria-live="polite">
      <div className="thf-shell">
        <header className="thf-header">
          <div className="thf-header__main">
            <span className="thf-header__icon" aria-hidden>
              <LucideIcon name="circle-dollar-sign" size={20} />
            </span>
            <div>
              <p className="thf-header__eyebrow">Tahsilatlar</p>
              <h1>Yeni Tahsilat</h1>
              <p className="thf-header__lead">Cari veya siparişe bağlı tahsilat kaydı oluşturun.</p>
            </div>
          </div>
          <Link className="thf-header__back" href="/tahsilatlar">
            Tahsilatlara dön
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="thf-preview-band" role="status">
            Demo mod: form doldurulabilir; canlı kayıt oluşturulmaz.
          </p>
        ) : null}

        {loading ? (
          <p className="thf-loading" role="status">
            Yükleniyor…
          </p>
        ) : (
          <form
            className="thf-card"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSave();
            }}
          >
            <div className="thf-card__body">
              <div className="thf-form-grid">
                <label className="thf-field thf-field--span-12">
                  <span className="thf-field__label thf-field__label-required">Cari</span>
                  <span className="thf-field__control">
                    <select value={customerId} onChange={(event) => handleCustomerChange(event.target.value)} required>
                      <option value="">Cari seçiniz…</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="thf-field__addon"
                      disabled
                      title="Cari oluşturma ayrı ekranda yapılacak"
                      aria-label="Cari oluşturma ayrı ekranda yapılacak"
                    >
                      <LucideIcon name="plus" size={14} />
                    </button>
                  </span>
                </label>

                <label className="thf-field thf-field--span-12">
                  <span className="thf-field__label">Bağlı sipariş (isteğe bağlı)</span>
                  <span className="thf-field__control">
                    <select value={orderId} onChange={(event) => setOrderId(event.target.value)}>
                      <option value="">Sipariş seçmeyin</option>
                      {customerOrders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.orderNo} · Açık: ₺{money(resolveOrderOpenBalance(order))}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>

                {openAmount !== null ? (
                  <p className="thf-hint" role="status">
                    Sipariş açık bakiye: <strong>₺{money(openAmount)}</strong>
                  </p>
                ) : null}

                <label className="thf-field thf-field--span-4">
                  <span className="thf-field__label thf-field__label-required">Tahsilat tutarı (₺)</span>
                  <span className="thf-field__control">
                    <input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={amount || ""}
                      onChange={(event) => setAmount(Math.max(0, Number(event.target.value || 0)))}
                      required
                    />
                  </span>
                </label>

                <label className="thf-field thf-field--span-4">
                  <span className="thf-field__label thf-field__label-required">Yöntem</span>
                  <span className="thf-field__control">
                    <select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
                      {METHODS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>

                <label className="thf-field thf-field--span-4">
                  <span className="thf-field__label thf-field__label-required">Tarih</span>
                  <span className="thf-field__control">
                    <input type="date" value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} required />
                  </span>
                </label>

                <label className="thf-field thf-field--span-6">
                  <span className="thf-field__label">Referans no</span>
                  <span className="thf-field__control">
                    <input value={referenceNo} onChange={(event) => setReferenceNo(event.target.value)} />
                  </span>
                </label>

                <label className="thf-field thf-field--span-6">
                  <span className="thf-field__label">Açıklama</span>
                  <span className="thf-field__control">
                    <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tahsilat açıklaması giriniz…" />
                  </span>
                </label>
              </div>

              <section className="thf-allocation" aria-label="Tahsilat dağılımı">
                <h2 className="thf-section-title">Tahsilat Dağılımı</h2>
                {selectedOrder ? (
                  <div className="thf-allocation-table-wrap">
                    <table className="thf-allocation-table">
                      <thead>
                        <tr>
                          <th>Belge türü</th>
                          <th>Belge no</th>
                          <th>Cari</th>
                          <th>Açık bakiye</th>
                          <th>Tahsis tutarı</th>
                          <th>Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Sipariş</td>
                          <td>{selectedOrder.orderNo}</td>
                          <td>{selectedCustomerName}</td>
                          <td>₺{money(openAmount ?? 0)}</td>
                          <td>₺{money(amount)}</td>
                          <td>
                            <span className="thf-badge">Bağlı</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="thf-allocation-empty">
                    Bağımsız tahsilat olarak kaydedilecek. Belge tahsisi yapılmadı.
                  </p>
                )}
              </section>

              <section className="thf-summary" aria-label="Tahsilat özeti">
                <article className="thf-summary__item">
                  <p className="thf-summary__label">Toplam bakiye</p>
                  <p className="thf-summary__value">₺{money(openAmount ?? 0)}</p>
                </article>
                <article className="thf-summary__item">
                  <p className="thf-summary__label">Tahsilat toplamı</p>
                  <p className="thf-summary__value">₺{money(amount)}</p>
                </article>
                <article className="thf-summary__item">
                  <p className="thf-summary__label">Kalan bakiye</p>
                  <p className={`thf-summary__value${remainingBalance !== null && remainingBalance > 0 ? " thf-summary__value--warn" : ""}`}>
                    ₺{money(remainingBalance ?? 0)}
                  </p>
                </article>
              </section>
            </div>

            <footer className="thf-actions">
              <Link className="thf-btn" href="/tahsilatlar">
                İptal
              </Link>
              <button type="button" className="thf-btn" onClick={() => router.push(buildHizliIslemHref(customerId, orderId))}>
                Hızlı İşlem&apos;e git
              </button>
              <button type="submit" className="thf-btn thf-btn--primary" disabled={saving}>
                <LucideIcon name="receipt" size={14} />
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
              <button type="button" className="thf-btn thf-btn--gold" disabled title="Onay akışı sonraki fazda bağlanacak">
                <LucideIcon name="send" size={14} />
                Onaya Gönder
              </button>
            </footer>
          </form>
        )}
      </div>
    </section>
  );
}
