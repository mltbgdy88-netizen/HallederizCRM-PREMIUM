"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { getOrders } from "../../orders/queries/get-orders";
import {
  buildQuickReturnContinueHref,
  evaluateReturnWindowFromIso
} from "../utils/map-return-detail-to-reference";

const RETURN_REASONS = [
  { value: "damaged", label: "Hasar" },
  { value: "wrong_product", label: "Yanlış ürün" },
  { value: "quality", label: "Kalite" },
  { value: "customer_request", label: "Müşteri talebi" },
  { value: "other", label: "Diğer" }
];

const STOCK_LOCATIONS = [
  { value: "main", label: "Ana depo — A raf (placeholder)" },
  { value: "returns", label: "İade kabul alanı (placeholder)" },
  { value: "qc", label: "Kalite kontrol (placeholder)" }
];

type DeskOrderRow = {
  id: string;
  orderNo: string;
  customerId: string;
  createdAt: string;
};

export function ReturnCreatePage({ sourceOrderId }: { sourceOrderId?: string | null }) {
  const { pushToast } = useToast();
  const initialSyncRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [draftSaved, setDraftSaved] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [orders, setOrders] = useState<DeskOrderRow[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [orderId, setOrderId] = useState(sourceOrderId ?? "");
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const [reasonCategory, setReasonCategory] = useState("damaged");
  const [note, setNote] = useState("");
  const [stockLocation, setStockLocation] = useState("returns");
  const [stockMovementNote, setStockMovementNote] = useState("Stok hareketi taslak aşamasında oluşturulmaz.");
  const [financeNote, setFinanceNote] = useState("");

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
            customerId: order.customerId,
            createdAt: order.createdAt
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

  const returnWindow = useMemo(() => {
    if (!selectedOrder) return "unknown" as const;
    return evaluateReturnWindowFromIso(selectedOrder.createdAt);
  }, [selectedOrder]);

  const quickHref = useMemo(
    () => buildQuickReturnContinueHref(orderId || undefined, customerId || undefined),
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
    pushToast("Demo modda iade taslağı kaydedildi. Canlı oluşturma bağlı değildir.");
  }

  if (loading) {
    return (
      <section className="idf-page idf-page--form hz-returns-create-page">
        <div className="idf-state" role="status" aria-live="polite">
          <div className="idf-state__spinner" aria-hidden />
          <h2>Yeni iade formu hazırlanıyor</h2>
          <p>Sipariş ve cari bağlamı kontrol ediliyor.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="idf-page idf-page--form hz-returns-create-page">
      <div className="idf-shell idf-shell--form">
        <header className="idf-header">
          <div className="idf-header__main">
            <span className="idf-header__icon" aria-hidden>
              <LucideIcon name="rotate-ccw" size={20} />
            </span>
            <div>
              <p className="idf-header__eyebrow">İadeler</p>
              <h1>Yeni İade</h1>
              <p className="idf-header__meta">İade taslağı oluşturun; satır prefill sonraki fazda bağlanacaktır.</p>
            </div>
          </div>
          <Link href="/iadeler" className="idf-header__back">
            ← Listeye dön
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="idf-demo-band" role="status">
            Örnek veri modu: bu form canlı iade oluşturmaz; kaydet yalnızca demo taslak bildirimi verir.
          </p>
        ) : (
          <p className="idf-demo-band idf-demo-band--info" role="status">
            Canlı iade oluşturma bu ekranda bağlı değildir; onay akışı sonraki fazda bağlanacaktır.
          </p>
        )}

        {sourceOrderId ? (
          <p className="idf-order-band" role="status">
            Sipariş bağlantısı alındı: {selectedOrder?.orderNo ?? sourceOrderId}. İade edilebilir satırların gerçek
            prefill&apos;i sonraki fazda bağlanacak.
          </p>
        ) : null}

        {orderId && returnWindow === "unknown" && !warningDismissed ? (
          <p className="idf-info-band" role="status">
            15 gün iade kontrolü, sipariş satırları yüklendiğinde kesinleşir.
          </p>
        ) : null}

        {orderId && returnWindow === "expired" && !warningDismissed ? (
          <section className="idf-warning-band" role="alert">
            <p>
              Bu siparişin satış tarihinden itibaren 15 gün geçmiş olabilir. İade işlemi için yetkili onayı
              gerekebilir.
            </p>
            <div className="idf-warning-band__actions">
              <Link href={orderId ? `/siparisler/${orderId}` : "/iadeler"} className="idf-warning-band__btn">
                İade işleminden vazgeç
              </Link>
              <button type="button" className="idf-warning-band__btn idf-warning-band__btn--continue" onClick={() => setWarningDismissed(true)}>
                Yine de taslak hazırlamaya devam et
              </button>
            </div>
          </section>
        ) : null}

        <main className="idf-form-layout">
          <section className="idf-form-main">
            <section className="idf-section" aria-label="İade bağlamı">
              <header className="idf-section__head">
                <h2>İade bağlamı</h2>
              </header>
              <div className="idf-field-grid">
                <label className="idf-field">
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
                <label className="idf-field">
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
                <label className="idf-field">
                  <span>İade tarihi</span>
                  <input type="date" value={returnDate} onChange={(event) => setReturnDate(event.target.value)} />
                </label>
                <label className="idf-field">
                  <span>İade nedeni</span>
                  <select value={reasonCategory} onChange={(event) => setReasonCategory(event.target.value)}>
                    {RETURN_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="idf-field idf-field--full">
                  <span>İade notu</span>
                  <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Operasyon notu" />
                </label>
              </div>
            </section>

            <section className="idf-section" aria-label="Stok geri giriş">
              <header className="idf-section__head">
                <h2>Stok geri giriş</h2>
              </header>
              <div className="idf-field-grid">
                <label className="idf-field">
                  <span>Depo / lokasyon</span>
                  <select value={stockLocation} onChange={(event) => setStockLocation(event.target.value)}>
                    {STOCK_LOCATIONS.map((location) => (
                      <option key={location.value} value={location.value}>
                        {location.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="idf-field idf-field--full">
                  <span>Stok hareketi bilgisi</span>
                  <input readOnly value={stockMovementNote} />
                </label>
              </div>
              <p className="idf-section__desc">Stok hareketi bu ekranda oluşturulmaz; onay sonrası depo akışına bağlanır.</p>
            </section>

            <section className="idf-section" aria-label="İade edilecek satırlar">
              <header className="idf-section__head">
                <h2>İade edilecek satırlar</h2>
              </header>
              <p className="idf-section__desc">
                {selectedOrder
                  ? `${selectedOrder.orderNo} siparişi için satır prefill sonraki fazda bağlanacak.`
                  : "Sipariş seçildiğinde satırlar burada listelenecek."}
              </p>
              <div className="idf-table-wrap">
                <table className="idf-table">
                  <thead>
                    <tr>
                      <th>Ürün kodu</th>
                      <th>Ürün adı</th>
                      <th>Adet</th>
                      <th>Sebep</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="idf-table__empty">
                        Henüz satır yüklenmedi — sipariş bağlantısı sonrası prefill eklenecek.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="idf-section" aria-label="Finans notu">
              <header className="idf-section__head">
                <h2>Finans notu</h2>
              </header>
              <label className="idf-field idf-field--full">
                <span>Bakiye / iade faturası notu</span>
                <textarea
                  rows={2}
                  value={financeNote}
                  onChange={(event) => setFinanceNote(event.target.value)}
                  placeholder="Finans etkisi notu (opsiyonel)"
                />
              </label>
            </section>
          </section>

          <aside className="idf-form-side">
            <section className="idf-side-card" aria-label="Özet">
              <header className="idf-side-card__head">
                <h3>Özet</h3>
              </header>
              <ul className="idf-side-list">
                <li>
                  <span>Cari</span>
                  <strong>{selectedCustomerName}</strong>
                </li>
                <li>
                  <span>Sipariş</span>
                  <strong>{selectedOrder?.orderNo ?? "—"}</strong>
                </li>
                <li>
                  <span>İade tarihi</span>
                  <strong>{returnDate || "—"}</strong>
                </li>
                <li>
                  <span>15 gün kontrol</span>
                  <strong>
                    {returnWindow === "expired"
                      ? "Uyarı — süre aşımı olabilir"
                      : returnWindow === "ok"
                        ? "Uygun görünüyor"
                        : "Bekleniyor"}
                  </strong>
                </li>
              </ul>
            </section>

            <section className="idf-actions" aria-label="Form aksiyonları">
              <h3 className="idf-actions__title">İşlemler</h3>
              <div className="idf-actions__stack">
                <button type="button" className="idf-actions__btn idf-actions__btn--primary" onClick={handleDraftSave} disabled={draftSaved}>
                  {draftSaved ? "Taslak hazırlandı" : "İade taslağı hazırla"}
                </button>
                <Link href={quickHref} className="idf-actions__link">
                  Hızlı İşlem&apos;de iadeye devam et
                </Link>
                {orderId ? (
                  <Link href={`/siparisler/${orderId}`} className="idf-actions__link idf-actions__link--muted">
                    Siparişe dön
                  </Link>
                ) : null}
                <Link href="/iadeler" className="idf-actions__link idf-actions__link--muted">
                  İadeler listesine dön
                </Link>
              </div>
              <p className="idf-actions__note">Kaydet canlı mutation çalıştırmaz. Stok hareketi sonraki fazda bağlanacaktır.</p>
            </section>
          </aside>
        </main>
      </div>
    </section>
  );
}
