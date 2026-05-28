"use client";

import { EmptyState, LoadingState } from "@hallederiz/ui";
import type { Customer, WarehouseOrder, WarehouseOrderLine } from "@hallederiz/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconArchive,
  IconArrowLeft,
  IconBot,
  IconCheckCircle,
  IconEdit3,
  IconExternalLink,
  IconPrinter,
  IconSparkles,
  IconTruck,
  IconXCircle
} from "../../dashboard/components/dashboard-inline-icons";
import { useToast } from "../../../providers/toast-provider";
import { getWarehouseOrderDetail } from "../queries/get-warehouse-orders";
import { getWarehouseOrderStatusLabel } from "../queries/warehouse-mock-data";
import { dateLabel } from "../utils";
import {
  getWarehouseOrderPrepLabel,
  getWarehouseOrderPrepPillClass,
  lineShortage,
  orderPreparedTotal,
  orderTotalRollUnits
} from "../utils/warehouse-prep-status";

function lineNote(line: WarehouseOrderLine): string {
  if (lineShortage(line) > 0) return "Eksik";
  if (line.preparedQuantity >= line.requestedQuantity && line.requestedQuantity > 0) return "Tamam";
  return "Beklemede";
}

export function WarehouseOrderDetailPage({ warehouseOrderId }: { warehouseOrderId?: string }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [warehouseOrder, setWarehouseOrder] = useState<WarehouseOrder | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortagePanelOpen, setShortagePanelOpen] = useState(false);
  const [prepDoneDemo, setPrepDoneDemo] = useState(false);

  useEffect(() => {
    let mounted = true;
    getWarehouseOrderDetail(warehouseOrderId)
      .then((result) => {
        if (mounted) {
          setWarehouseOrder(result.warehouseOrder);
          setCustomers(result.customers);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [warehouseOrderId]);

  const customer = useMemo(() => customers.find((item) => item.id === warehouseOrder?.customerId) ?? null, [customers, warehouseOrder?.customerId]);

  const shortageLines = useMemo(() => warehouseOrder?.lines.filter((line) => lineShortage(line) > 0) ?? [], [warehouseOrder]);

  const handlePrint = useCallback(() => {
    if (typeof window === "undefined") return;
    window.print();
  }, []);

  if (loading) {
    return (
      <div className="hz-warehouse-prep-detail-page">
        <LoadingState title="Depo Hazırlık Fişi yükleniyor" message="Satır, raf ve durum bilgileri hazırlanıyor." />
      </div>
    );
  }

  if (!warehouseOrder) {
    return (
      <div className="hz-warehouse-prep-detail-page">
        <EmptyState title="Fiş bulunamadı" message="Seçilen Depo Hazırlık fişi bulunamadı." />
      </div>
    );
  }

  return (
    <div className="hz-warehouse-prep-detail-page">
      <div className="hz-warehouse-prep-detail-layout">
        <div className="hz-warehouse-prep-detail-main">
          <header className="hz-warehouse-prep-detail-top">
            <button type="button" className="hz-warehouse-prep-detail-back" onClick={() => router.push("/depo")}>
              <IconArrowLeft size={18} aria-hidden />
              Depo Hazırlık
            </button>
            <div className="hz-warehouse-prep-detail-heading">
              <div>
                <p className="hz-warehouse-prep-detail-eyebrow">Depo Hazırlık Belgesi</p>
                <h1 className="hz-warehouse-prep-detail-title">Depo Hazırlık Fişi</h1>
                <p className="hz-warehouse-prep-detail-lead">
                  Sipariş kendi stoğundan karşılanacaksa bu belge oluşur. Depo görevlisi rafa göre hazırlar; <strong>Hazırlandı</strong> denince teslim aşaması açılır. Müşteriye teslim
                  edilince Depo Hazırlık Belgesi ve <strong>Ürün Teslim Fişi</strong> arşivlenir.
                </p>
              </div>
              <span className={getWarehouseOrderPrepPillClass(warehouseOrder)}>{getWarehouseOrderPrepLabel(warehouseOrder)}</span>
            </div>
          </header>

          <div className="hz-warehouse-prep-printable">
            <header className="hz-warehouse-prep-print-only" aria-hidden="true">
              <h1 className="hz-warehouse-prep-print-title">Depo Hazırlık Fişi</h1>
              <p className="hz-warehouse-prep-print-meta">
                Belge: {warehouseOrder.warehouseOrderNo} · Sipariş: {warehouseOrder.orderNo} · Tarih: {dateLabel(warehouseOrder.createdAt)}
              </p>
            </header>

            <section className="hz-warehouse-prep-doc-card" aria-label="Fiş üst bilgisi">
              <div className="hz-warehouse-prep-doc-grid">
                <div>
                  <span className="hz-warehouse-prep-doc-k">Belge No</span>
                  <span className="hz-warehouse-prep-doc-v">{warehouseOrder.warehouseOrderNo}</span>
                </div>
                <div>
                  <span className="hz-warehouse-prep-doc-k">Sipariş No</span>
                  <span className="hz-warehouse-prep-doc-v">{warehouseOrder.orderNo}</span>
                </div>
                <div>
                  <span className="hz-warehouse-prep-doc-k">Tarih</span>
                  <span className="hz-warehouse-prep-doc-v">{dateLabel(warehouseOrder.createdAt)}</span>
                </div>
                <div>
                  <span className="hz-warehouse-prep-doc-k">Cari</span>
                  <span className="hz-warehouse-prep-doc-v">{customer?.name ?? warehouseOrder.customerId}</span>
                </div>
                <div>
                  <span className="hz-warehouse-prep-doc-k">Depo görevlisi</span>
                  <span className="hz-warehouse-prep-doc-v">{warehouseOrder.assignedTo ?? "—"}</span>
                </div>
                <div>
                  <span className="hz-warehouse-prep-doc-k">Durum (sistem)</span>
                  <span className="hz-warehouse-prep-doc-v">{getWarehouseOrderStatusLabel(warehouseOrder.status)}</span>
                </div>
                <div className="hz-warehouse-prep-doc-grid--wide">
                  <span className="hz-warehouse-prep-doc-k">Not</span>
                  <span className="hz-warehouse-prep-doc-v">{warehouseOrder.note ?? "—"}</span>
                </div>
              </div>
            </section>

            <section className="hz-warehouse-prep-lines-card" aria-label="Ürün satırları">
              <h2 className="hz-warehouse-prep-lines-title">Ürün satırları</h2>
              <div className="hz-warehouse-prep-lines-scroll">
                <table className="hz-warehouse-prep-lines-table">
                  <thead>
                    <tr>
                      <th>Ürün kodu</th>
                      <th>Ürün adı</th>
                      <th>Depo</th>
                      <th>Raf / lokasyon</th>
                      <th>İstenen</th>
                      <th>Hazırlanan</th>
                      <th>Eksik</th>
                      <th>Not / durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouseOrder.lines.map((line) => (
                      <tr key={line.id}>
                        <td>{line.productCode}</td>
                        <td className="hz-warehouse-prep-lines-td-name">{line.productName}</td>
                        <td>{line.warehouseName}</td>
                        <td>
                          {line.rackNo ?? "—"} / {line.locationCode ?? "—"}
                        </td>
                        <td>{line.requestedQuantity}</td>
                        <td>{line.preparedQuantity}</td>
                        <td>{lineShortage(line)}</td>
                        <td>{lineNote(line)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {shortagePanelOpen ? (
              <section className="hz-warehouse-prep-shortage-panel" aria-live="polite">
                <h3 className="hz-warehouse-prep-shortage-title">Eksik ürün özeti</h3>
                {shortageLines.length === 0 ? (
                  <p className="hz-warehouse-prep-side-muted">Bu fişte satır bazında eksik görünmüyor.</p>
                ) : (
                  <ul className="hz-warehouse-prep-shortage-list">
                    {shortageLines.map((line) => (
                      <li key={line.id}>
                        <strong>{line.productCode}</strong> — {lineShortage(line)} adet açık. Satış veya depo ile netleştirin; müşteriyi korkutmadan bilgilendirin.
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}
          </div>

          <p className="hz-warehouse-prep-print-hint">
            PDF arşiv motoru bağlanana kadar fiş yazdırma tarayıcı üzerinden yapılır.
          </p>

          <footer className="hz-warehouse-prep-detail-footer">
            <button
              type="button"
              className="hz-warehouse-prep-footer-btn hz-warehouse-prep-footer-btn--primary"
              disabled={prepDoneDemo}
              onClick={() => {
                pushToast("Hazırlandı işareti CRM’de teslim bekleyen aşamayı açar; bu sürümde kalıcı kayıt yok (demo).");
                setPrepDoneDemo(true);
              }}
            >
              <IconCheckCircle size={18} aria-hidden />
              Hazırlandı
            </button>
            <button
              type="button"
              className="hz-warehouse-prep-footer-btn hz-warehouse-prep-footer-btn--warn"
              onClick={() => {
                setShortagePanelOpen(true);
                pushToast("Eksik satırlar panelde listelenir; operasyon onayı olmadan stok düşülmez (demo).");
              }}
            >
              <IconXCircle size={18} aria-hidden />
              Eksik ürün
            </button>
            <button
              type="button"
              className="hz-warehouse-prep-footer-btn hz-warehouse-prep-footer-btn--outline"
              onClick={() => pushToast("Hazırlanan miktar düzenleme backend onayı ile açılacak (demo).")}
            >
              <IconEdit3 size={18} aria-hidden />
              Düzenle
            </button>
            <button
              type="button"
              className="hz-warehouse-prep-footer-btn hz-warehouse-prep-footer-btn--secondary"
              title="Depo hazırlık fişini yazdır"
              onClick={handlePrint}
            >
              <IconPrinter size={18} aria-hidden />
              Belgeyi Yazdır
            </button>
          </footer>
        </div>

        <aside className="hz-warehouse-prep-detail-side" aria-label="Fiş asistanı">
          <h2 className="hz-warehouse-prep-side-title">Fiş asistanı</h2>

          <section className="hz-warehouse-prep-radar-block">
            <h3 className="hz-warehouse-prep-radar-h">Hazırlık durumu</h3>
            <p className="hz-warehouse-prep-radar-text">
              Toplam <strong>{orderTotalRollUnits(warehouseOrder)}</strong> rulo/adet; hazırlanan <strong>{orderPreparedTotal(warehouseOrder)}</strong>.
            </p>
            <p className="hz-warehouse-prep-side-muted">Görünen durum: {getWarehouseOrderPrepLabel(warehouseOrder)}.</p>
          </section>

          <section className="hz-warehouse-prep-radar-block">
            <h3 className="hz-warehouse-prep-radar-h">Eksik ürünler</h3>
            {shortageLines.length === 0 ? (
              <p className="hz-warehouse-prep-side-muted">Satır bazında eksik yok veya teslim/iptal kapsamında.</p>
            ) : (
              <ul className="hz-warehouse-prep-bullet-list">
                {shortageLines.map((line) => (
                  <li key={line.id}>
                    {line.productCode}: {lineShortage(line)} adet
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="hz-warehouse-prep-radar-block">
            <h3 className="hz-warehouse-prep-radar-h">Teslim etkisi</h3>
            <p className="hz-warehouse-prep-radar-text">
              Hazırlandı durumundaki fişler <strong>Ürün Teslimi</strong> sırasında seçilebilir. Teslim tamamlanınca bu fiş aktif listeden çıkar ve arşivlenir.
            </p>
            <Link href="/hizli-islem" className="hz-warehouse-prep-inline-link">
              <IconTruck size={16} aria-hidden />
              Hızlı İşlem — Ürün Teslimi
              <IconExternalLink size={14} aria-hidden />
            </Link>
          </section>

          <section className="hz-warehouse-prep-radar-block">
            <h3 className="hz-warehouse-prep-radar-h">Belge / arşiv</h3>
            <p className="hz-warehouse-prep-radar-text">Depo Hazırlık Belgesi ve sonrasında oluşan Ürün Teslim Fişi Arşiv’de birlikte izlenebilir.</p>
            <div className="hz-warehouse-prep-archive-actions">
              <button type="button" className="hz-warehouse-prep-side-print-btn" title="Depo hazırlık fişini yazdır" onClick={handlePrint}>
                <IconPrinter size={16} aria-hidden />
                Belgeyi yazdır
              </button>
              <button type="button" className="hz-warehouse-prep-quick-btn" onClick={() => router.push("/archive")}>
                <IconArchive size={16} aria-hidden />
                Arşivi aç
              </button>
            </div>
          </section>

          <section className="hz-warehouse-prep-radar-block hz-warehouse-prep-radar-block--ai">
            <h3 className="hz-warehouse-prep-radar-h">
              <IconSparkles size={16} aria-hidden /> AI notu
            </h3>
            <p className="hz-warehouse-prep-radar-text hz-warehouse-prep-ai-line">
              <IconBot size={16} aria-hidden className="hz-warehouse-prep-ai-ico" />
              <span>AI yalnızca özet ve uyarı üretir; depo hazırlık ve teslim işlemi insan onayıyla yapılır.</span>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

