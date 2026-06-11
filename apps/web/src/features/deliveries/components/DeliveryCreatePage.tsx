"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { getOrders } from "../../orders/queries/get-orders";
import { buildQuickDeliveryContinueHref } from "../utils/map-delivery-detail-to-reference";

const DELIVERY_METHODS = [
  { value: "courier", label: "Kurye / lojistik" },
  { value: "pickup", label: "Depodan teslim" },
  { value: "field", label: "Saha teslimatı" },
  { value: "other", label: "Diğer" }
];

export function DeliveryCreatePage({ sourceOrderId }: { sourceOrderId?: string | null }) {
  const { pushToast } = useToast();
  const initialSyncRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [draftSaved, setDraftSaved] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [orders, setOrders] = useState<Array<{ id: string; orderNo: string; customerId: string }>>([]);

  const [customerId, setCustomerId] = useState("");
  const [orderId, setOrderId] = useState(sourceOrderId ?? "");
  const [plannedDate, setPlannedDate] = useState(new Date().toISOString().slice(0, 10));
  const [deliveryMethod, setDeliveryMethod] = useState("courier");
  const [recipientName, setRecipientName] = useState("");
  const [note, setNote] = useState("");
  const [documentNote, setDocumentNote] = useState("");

  useEffect(() => {
    let active = true;
    getOrders()
      .then((result) => {
        if (!active) return;
        setCustomers(result.customers.map((customer) => ({ id: customer.id, name: customer.name })));
        setOrders(
          result.orders.map((order) => ({
            id: order.id,
            orderNo: order.orderNo,
            customerId: order.customerId
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
    if (initialSyncRef.current || loading) return;
    if (!sourceOrderId) return;
    const matched = orders.find((order) => order.id === sourceOrderId);
    if (matched) {
      setOrderId(matched.id);
      setCustomerId(matched.customerId);
      initialSyncRef.current = true;
    }
  }, [sourceOrderId, orders, loading]);

  const selectedOrder = useMemo(() => orders.find((order) => order.id === orderId) ?? null, [orderId, orders]);
  const selectedCustomerName = useMemo(
    () => customers.find((customer) => customer.id === customerId)?.name ?? "—",
    [customers, customerId]
  );

  const quickHref = useMemo(
    () => buildQuickDeliveryContinueHref(orderId || undefined, customerId || undefined),
    [orderId, customerId]
  );

  function handleCustomerChange(nextCustomerId: string) {
    setCustomerId(nextCustomerId);
    if (!orderId) return;
    const linked = orders.find((order) => order.id === orderId);
    if (linked && linked.customerId !== nextCustomerId) {
      setOrderId("");
    }
  }

  function handleDraftSave() {
    if (!customerId && !orderId) {
      pushToast("Cari veya sipariş bağlamı seçin.");
      return;
    }
    setDraftSaved(true);
    pushToast("Demo modda teslimat taslağı kaydedildi. Canlı oluşturma bağlı değildir.");
  }

  if (loading) {
    return (
      <section className="dlf-page dlf-page--form hz-deliveries-create-page">
        <div className="dlf-state" role="status" aria-live="polite">
          <div className="dlf-state__spinner" aria-hidden />
          <h2>Yeni teslimat formu hazırlanıyor</h2>
          <p>Sipariş ve cari bağlamı kontrol ediliyor.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dlf-page dlf-page--form hz-deliveries-create-page">
      <div className="dlf-shell dlf-shell--form">
        <header className="dlf-header">
          <div className="dlf-header__main">
            <span className="dlf-header__icon" aria-hidden>
              <LucideIcon name="truck" size={20} />
            </span>
            <div>
              <p className="dlf-header__eyebrow">Teslimatlar</p>
              <h1>Yeni Teslimat</h1>
              <p className="dlf-header__meta">Teslimat taslağı oluşturun; satır prefill sonraki fazda bağlanacaktır.</p>
            </div>
          </div>
          <Link href="/teslimatlar" className="dlf-header__back">
            ← Listeye dön
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="dlf-demo-band" role="status">
            Örnek veri modu: bu form canlı teslimat oluşturmaz; kaydet yalnızca demo taslak bildirimi verir.
          </p>
        ) : (
          <p className="dlf-demo-band dlf-demo-band--info" role="status">
            Canlı teslimat oluşturma bu ekranda bağlı değildir; Hızlı İşlem teslim sekmesini kullanın.
          </p>
        )}

        {sourceOrderId ? (
          <p className="dlf-order-band" role="status">
            Sipariş bağlantısı alındı: {selectedOrder?.orderNo ?? sourceOrderId}. Gerçek satır prefill sonraki fazda
            bağlanacak.
          </p>
        ) : null}

        <main className="dlf-form-layout">
          <section className="dlf-form-main">
            <section className="dlf-section" aria-label="Teslimat bağlamı">
              <header className="dlf-section__head">
                <h2>Teslimat bağlamı</h2>
              </header>
              <div className="dlf-field-grid">
                <label className="dlf-field">
                  <span>Cari</span>
                  <select value={customerId} onChange={(event) => handleCustomerChange(event.target.value)}>
                    <option value="">Cari seçin</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="dlf-field">
                  <span>Sipariş</span>
                  <select value={orderId} onChange={(event) => setOrderId(event.target.value)}>
                    <option value="">Sipariş seçin (opsiyonel)</option>
                    {(customerId ? orders.filter((order) => order.customerId === customerId) : orders).map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.orderNo}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="dlf-field">
                  <span>Teslim tarihi</span>
                  <input type="date" value={plannedDate} onChange={(event) => setPlannedDate(event.target.value)} />
                </label>
                <label className="dlf-field">
                  <span>Teslim yöntemi</span>
                  <select value={deliveryMethod} onChange={(event) => setDeliveryMethod(event.target.value)}>
                    {DELIVERY_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="dlf-field">
                  <span>Teslim alan kişi</span>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(event) => setRecipientName(event.target.value)}
                    placeholder="Ad soyad veya yetkili"
                  />
                </label>
                <label className="dlf-field dlf-field--full">
                  <span>Açıklama</span>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Operasyon notu"
                  />
                </label>
              </div>
            </section>

            <section className="dlf-section" aria-label="Teslim edilecek satırlar">
              <header className="dlf-section__head">
                <h2>Teslim edilecek satırlar</h2>
              </header>
              <p className="dlf-section__desc">
                {selectedOrder
                  ? `${selectedOrder.orderNo} siparişi için satır prefill sonraki fazda bağlanacak.`
                  : "Sipariş seçildiğinde satırlar burada listelenecek."}
              </p>
              <div className="dlf-table-wrap">
                <table className="dlf-table">
                  <thead>
                    <tr>
                      <th>Ürün kodu</th>
                      <th>Ürün adı</th>
                      <th>Sipariş</th>
                      <th>Teslim</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="dlf-table__empty">
                        Henüz satır yüklenmedi — sipariş bağlantısı sonrası prefill eklenecek.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="dlf-section" aria-label="Belge notu">
              <header className="dlf-section__head">
                <h2>Belge notu</h2>
              </header>
              <label className="dlf-field dlf-field--full">
                <span>Teslim fişi / irsaliye notu</span>
                <textarea
                  rows={2}
                  value={documentNote}
                  onChange={(event) => setDocumentNote(event.target.value)}
                  placeholder="Belge üretim notu (opsiyonel)"
                />
              </label>
            </section>
          </section>

          <aside className="dlf-form-side">
            <section className="dlf-side-card" aria-label="Özet">
              <header className="dlf-side-card__head">
                <h3>Özet</h3>
              </header>
              <ul className="dlf-side-list">
                <li>
                  <span>Cari</span>
                  <strong>{selectedCustomerName}</strong>
                </li>
                <li>
                  <span>Sipariş</span>
                  <strong>{selectedOrder?.orderNo ?? "—"}</strong>
                </li>
                <li>
                  <span>Teslim tarihi</span>
                  <strong>{plannedDate || "—"}</strong>
                </li>
                <li>
                  <span>Yöntem</span>
                  <strong>{DELIVERY_METHODS.find((method) => method.value === deliveryMethod)?.label ?? "—"}</strong>
                </li>
              </ul>
            </section>

            <section className="dlf-actions" aria-label="Form aksiyonları">
              <h3 className="dlf-actions__title">İşlemler</h3>
              <div className="dlf-actions__stack">
                <button type="button" className="dlf-actions__btn dlf-actions__btn--primary" onClick={handleDraftSave} disabled={draftSaved}>
                  {draftSaved ? "Taslak hazırlandı" : "Teslimat taslağı hazırla"}
                </button>
                <Link href={quickHref} className="dlf-actions__link">
                  Hızlı İşlem&apos;de teslimata devam et
                </Link>
              </div>
              <p className="dlf-actions__note">Kaydet canlı mutation çalıştırmaz. Operasyon akışı Hızlı İşlem teslim sekmesindedir.</p>
            </section>
          </aside>
        </main>
      </div>
    </section>
  );
}
