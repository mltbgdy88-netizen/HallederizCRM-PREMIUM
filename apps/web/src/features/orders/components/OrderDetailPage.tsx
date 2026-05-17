"use client";

import { EmptyState, EntityDetailLayout, FormPageShell, FormValidationSummary, LoadingState, PageHeader, TabSwitcher } from "@hallederiz/ui";
import type { Customer, Delivery, Invoice, PaymentReceipt, SaleOrder, WarehouseOrder } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { OrderActionButtons } from "./OrderActionButtons";
import { OrderApprovalSummaryModal } from "./OrderApprovalSummaryModal";
import { OrderHeaderInfo } from "./OrderHeaderInfo";
import { OrderLineEntryBar } from "./OrderLineEntryBar";
import { OrderLinesTable } from "./OrderLinesTable";
import { OrderSideSummaryPanel } from "./OrderSideSummaryPanel";
import { OrderTimelinePanel } from "./OrderTimelinePanel";
import { OrderTopForm } from "./OrderTopForm";
import { SourcingPlanModal } from "./SourcingPlanModal";
import { WarehouseOrderPanel } from "./WarehouseOrderPanel";
import { getOrderDetail } from "../queries/get-orders";
import { getOrderDetailSideData } from "../queries/get-order-detail-side-data";

const tabs = ["Genel", "Satirlar", "Kaynak Plani", "Tahsilatlar", "Depo", "Teslim", "Belgeler", "Timeline"];

export function OrderDetailPage({ orderId, sourceOfferId, customerId }: { orderId?: string; sourceOfferId?: string | null; customerId?: string | null }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [order, setOrder] = useState<SaleOrder | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [warehouseOrders, setWarehouseOrders] = useState<WarehouseOrder[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Genel");
  const [sourcingOpen, setSourcingOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    let mounted = true;

    Promise.all([getOrderDetail(orderId, sourceOfferId, customerId), getOrderDetailSideData(orderId)])
      .then(([orderResult, side]) => {
        if (mounted) {
          setOrder(orderResult.order);
          setCustomers(orderResult.customers);
          setPayments(side.payments);
          setWarehouseOrders(side.warehouseOrders);
          setDeliveries(side.deliveries);
          setInvoices(side.invoices);
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
  }, [orderId, sourceOfferId, customerId]);

  useEffect(() => {
    setDraftSaved(false);
  }, [orderId, sourceOfferId, customerId]);

  const customer = useMemo(() => customers.find((item) => item.id === order?.customerId) ?? null, [customers, order?.customerId]);
  const orderPayments = useMemo(
    () => payments.filter((payment) => payment.allocations.some((allocation) => allocation.targetId === order?.id)),
    [payments, order?.id]
  );
  const orderWarehouseOrders = useMemo(
    () => warehouseOrders.filter((warehouseOrder) => warehouseOrder.orderId === order?.id),
    [warehouseOrders, order?.id]
  );
  const relatedDelivery = useMemo(() => deliveries.find((delivery) => delivery.orderId === order?.id) ?? null, [deliveries, order?.id]);
  const relatedInvoice = useMemo(() => invoices.find((invoice) => invoice.orderId === order?.id) ?? null, [invoices, order?.id]);

  const newFormHints = useMemo(
    () =>
      !orderId
        ? [
            dataSourceConfig.useDemoData
              ? "Taslak sipariş: kaydet yalnızca demo; kesinleştirme onay ve execution zincirinden geçer."
              : "Taslak sipariş: kaydetme canlıda policy ve onay zincirine bağlıdır; yan sekmeler API verisiyle dolar."
          ]
        : [],
    [orderId]
  );

  if (loading) {
    return <LoadingState title="Siparis yukleniyor" message="Satirlar, kaynak plani, tahsilat ve depo baglamlari hazirlaniyor." />;
  }

  if (!order) {
    return <EmptyState title="Siparis Bulunamadi" message="Secilen siparis veya tekliften draft baglami bulunamadi." />;
  }

  return (
    <div className="hz-orders-detail-page">
      <EntityDetailLayout
        summary={
          <>
            <PageHeader
              title={orderId ? "Sipariş detayı" : "Yeni sipariş"}
              description="Sipariş merkezli operasyon, tahsilat, kaynak planı ve depo zinciri."
            />
            <OrderHeaderInfo order={order} customer={customer} />
            <OrderActionButtons
              onSourcing={() => setSourcingOpen(true)}
              onApproval={() => setApprovalOpen(true)}
              onPayment={() => router.push(`/tahsilatlar/yeni?order=${order.id}`)}
              onWarehouse={() => router.push(orderWarehouseOrders[0] ? `/depo/emirler/${orderWarehouseOrders[0].id}` : "/depo")}
              onDelivery={() => router.push(relatedDelivery ? `/teslimatlar/${relatedDelivery.id}` : "/teslimatlar")}
              onInvoice={() => router.push(relatedInvoice ? `/faturalar/${relatedInvoice.id}` : "/faturalar")}
            />
          </>
        }
        sections={
          <FormPageShell
            className="hz-orders-form"
            stickyActions={
              !orderId ? (
                <>
                  <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => router.push("/siparisler")}>
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    className="hz-btn hz-btn-primary hz-toolbar-btn"
                    disabled={draftSaved}
                    onClick={() => {
                      pushToast(
                        dataSourceConfig.useDemoData
                          ? "Sipariş taslağı kaydedildi (demo)."
                          : "Taslak kaydı canlıda policy ve onay akışına bağlıdır; bu adım yalnızca arayüz bildirimidir."
                      );
                      setDraftSaved(true);
                    }}
                  >
                    Taslak kaydet
                  </button>
                </>
              ) : undefined
            }
          >
            <FormValidationSummary variant="info" title="Bilgi" messages={newFormHints} />
            <section className="hz-content-card">
              <TabSwitcher items={tabs.map((tab) => ({ key: tab, label: tab }))} activeKey={activeTab} onChange={setActiveTab} />
              {activeTab === "Genel" ? (
                <div className="hz-tab-content">
                  <OrderTopForm order={order} customer={customer} />
                  <OrderLineEntryBar order={order} />
                </div>
              ) : null}
              {activeTab === "Satirlar" ? <OrderLinesTable lines={order.lines} /> : null}
              {activeTab === "Kaynak Plani" ? <SourcingPlanInline order={order} /> : null}
              {activeTab === "Tahsilatlar" ? <PaymentsInline payments={orderPayments} /> : null}
              {activeTab === "Depo" ? <WarehouseOrderPanel order={order} warehouseOrders={orderWarehouseOrders} /> : null}
              {activeTab === "Teslim" ? <DeliveryInline order={order} warehouseOrders={orderWarehouseOrders} delivery={relatedDelivery} /> : null}
              {activeTab === "Belgeler" ? <DocumentsInline order={order} invoice={relatedInvoice} /> : null}
              {activeTab === "Timeline" ? <OrderTimelinePanel order={order} payments={orderPayments} warehouseOrders={orderWarehouseOrders} /> : null}
            </section>
          </FormPageShell>
        }
        sidebar={<OrderSideSummaryPanel order={order} customer={customer} payments={orderPayments} warehouseOrders={orderWarehouseOrders} />}
      />

      <SourcingPlanModal open={sourcingOpen} order={order} onClose={() => setSourcingOpen(false)} />
      <OrderApprovalSummaryModal open={approvalOpen} order={order} onClose={() => setApprovalOpen(false)} />
    </div>
  );
}

function SourcingPlanInline({ order }: { order: SaleOrder }) {
  return (
    <div className="hz-tab-content">
      <h3>Kaynak Plani</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead><tr><th>Urun</th><th>Merkez</th><th>Fabrika</th><th>Durum</th><th>Not</th></tr></thead>
          <tbody>
            {order.sourcePlans.map((plan) => (
              <tr key={plan.id}><td>{plan.productId}</td><td>{plan.warehouseQuantity}</td><td>{plan.factoryQuantity}</td><td>{plan.status}</td><td>{plan.note}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsInline({ payments }: { payments: PaymentReceipt[] }) {
  return (
    <div className="hz-tab-content">
      <h3>Tahsilatlar</h3>
      {payments.length === 0 ? <div className="hz-state-card"><h4>Tahsilat Yok</h4><p>Bu siparise bagli allocation henuz yok.</p></div> : null}
      <ul className="hz-side-list">{payments.map((payment) => <li key={payment.id}>{payment.receiptNo} - {payment.amount.toLocaleString("tr-TR")} {payment.currency}</li>)}</ul>
    </div>
  );
}

function DeliveryInline({ order, warehouseOrders, delivery }: { order: SaleOrder; warehouseOrders: WarehouseOrder[]; delivery: Delivery | null }) {
  return (
    <div className="hz-tab-content">
      <h3>Teslim</h3>
      <ul className="hz-side-list">
        <li>Teslim durumu: {order.deliveryStatus}</li>
        <li>Depo emri: {warehouseOrders[0]?.warehouseOrderNo ?? "Bekliyor"}</li>
        <li>Teslim kaydi: {delivery ? `${delivery.deliveryNo} / ${delivery.status}` : "Bu siparis icin delivery foundation bekliyor."}</li>
        <li>Teslim dogrulama paneli ilgili delivery kaydinda musteri, odeme ve depo hazirlik kontrollerini gosterir.</li>
      </ul>
    </div>
  );
}

function DocumentsInline({ order, invoice }: { order: SaleOrder; invoice: Invoice | null }) {
  return (
    <div className="hz-tab-content">
      <h3>Belgeler</h3>
      <p className="hz-content-card-description">{order.orderNo} icin siparis PDF, teslim fisi ve fatura record zinciri belge merkezinde izlenir.</p>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>Siparis belgesi: document entity=order olarak hazir.</li>
        <li>Fatura baglantisi: {invoice ? `${invoice.invoiceNo} / ${invoice.status}` : "Fatura taslagi bekliyor."}</li>
        <li>Local output: belge merkezinden queue save / queue print foundation'i kullanilir.</li>
      </ul>
    </div>
  );
}
