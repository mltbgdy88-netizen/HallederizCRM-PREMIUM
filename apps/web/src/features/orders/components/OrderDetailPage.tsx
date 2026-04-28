"use client";

import { EmptyState, LoadingState, PageHeader, SplitContentLayout, TabSwitcher } from "@hallederiz/ui";
import type { Customer, PaymentReceipt, SaleOrder, WarehouseOrder } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { OrderActionButtons } from "./OrderActionButtons";
import { OrderApprovalSummaryModal } from "./OrderApprovalSummaryModal";
import { OrderHeaderInfo } from "./OrderHeaderInfo";
import { OrderLineEntryBar } from "./OrderLineEntryBar";
import { OrderLinesTable } from "./OrderLinesTable";
import { OrderSideSummaryPanel } from "./OrderSideSummaryPanel";
import { OrderTimelinePanel } from "./OrderTimelinePanel";
import { OrderTopForm } from "./OrderTopForm";
import { PaymentCreateModal } from "./PaymentCreateModal";
import { SourcingPlanModal } from "./SourcingPlanModal";
import { WarehouseOrderPanel } from "./WarehouseOrderPanel";
import { getOrderDetail } from "../queries/get-orders";
import { getPaymentMockData } from "../../payments/queries/payment-mock-data";
import { getWarehouseOrderMockData } from "../../warehouse/queries/warehouse-mock-data";

const tabs = ["Genel", "Satirlar", "Kaynak Plani", "Tahsilatlar", "Depo", "Teslim", "Belgeler", "Timeline"];

export function OrderDetailPage({ orderId, sourceOfferId }: { orderId?: string; sourceOfferId?: string | null }) {
  const router = useRouter();
  const [order, setOrder] = useState<SaleOrder | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [warehouseOrders, setWarehouseOrders] = useState<WarehouseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Genel");
  const [sourcingOpen, setSourcingOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    Promise.all([getOrderDetail(orderId, sourceOfferId), getPaymentMockData(), getWarehouseOrderMockData()])
      .then(([orderResult, paymentResult, warehouseResult]) => {
        if (mounted) {
          setOrder(orderResult.order);
          setCustomers(orderResult.customers);
          setPayments(paymentResult);
          setWarehouseOrders(warehouseResult);
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
  }, [orderId, sourceOfferId]);

  const customer = useMemo(() => customers.find((item) => item.id === order?.customerId) ?? null, [customers, order?.customerId]);
  const orderPayments = useMemo(
    () => payments.filter((payment) => payment.allocations.some((allocation) => allocation.targetId === order?.id)),
    [payments, order?.id]
  );
  const orderWarehouseOrders = useMemo(
    () => warehouseOrders.filter((warehouseOrder) => warehouseOrder.orderId === order?.id),
    [warehouseOrders, order?.id]
  );

  if (loading) {
    return <LoadingState title="Siparis yukleniyor" message="Satirlar, kaynak plani, tahsilat ve depo baglamlari hazirlaniyor." />;
  }

  if (!order) {
    return <EmptyState title="Siparis Bulunamadi" message="Secilen siparis veya tekliften draft baglami bulunamadi." />;
  }

  return (
    <div className="hz-page-stack">
      <PageHeader
        title={orderId ? "Siparis Detayi" : "Yeni Siparis"}
        description="Siparis merkezli operasyon, tahsilat, kaynak plani ve depo zinciri."
      />
      <OrderHeaderInfo order={order} customer={customer} />
      <OrderActionButtons
        onSourcing={() => setSourcingOpen(true)}
        onApproval={() => setApprovalOpen(true)}
        onPayment={() => setPaymentOpen(true)}
        onWarehouse={() => setActiveTab("Depo")}
        onDelivery={() => router.push("/teslimatlar")}
        onInvoice={() => router.push("/faturalar")}
      />

      <SplitContentLayout
        main={
          <section className="hz-content-card">
            <TabSwitcher items={tabs.map((tab) => ({ key: tab, label: tab }))} activeKey={activeTab} onChange={setActiveTab} />
            {activeTab === "Genel" ? <div className="hz-tab-content"><OrderTopForm order={order} customer={customer} /><OrderLineEntryBar order={order} /></div> : null}
            {activeTab === "Satirlar" ? <OrderLinesTable lines={order.lines} /> : null}
            {activeTab === "Kaynak Plani" ? <SourcingPlanInline order={order} /> : null}
            {activeTab === "Tahsilatlar" ? <PaymentsInline payments={orderPayments} /> : null}
            {activeTab === "Depo" ? <WarehouseOrderPanel order={order} warehouseOrders={orderWarehouseOrders} /> : null}
            {activeTab === "Teslim" ? <DeliveryInline order={order} warehouseOrders={orderWarehouseOrders} /> : null}
            {activeTab === "Belgeler" ? <DocumentsInline order={order} /> : null}
            {activeTab === "Timeline" ? <OrderTimelinePanel order={order} payments={orderPayments} warehouseOrders={orderWarehouseOrders} /> : null}
          </section>
        }
        side={<OrderSideSummaryPanel order={order} customer={customer} payments={orderPayments} warehouseOrders={orderWarehouseOrders} />}
      />

      <SourcingPlanModal open={sourcingOpen} order={order} onClose={() => setSourcingOpen(false)} />
      <OrderApprovalSummaryModal open={approvalOpen} order={order} onClose={() => setApprovalOpen(false)} />
      <PaymentCreateModal open={paymentOpen} order={order} onClose={() => setPaymentOpen(false)} />
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

function DeliveryInline({ order, warehouseOrders }: { order: SaleOrder; warehouseOrders: WarehouseOrder[] }) {
  return (
    <div className="hz-tab-content">
      <h3>Teslim</h3>
      <ul className="hz-side-list">
        <li>Teslim durumu: {order.deliveryStatus}</li>
        <li>Depo emri: {warehouseOrders[0]?.warehouseOrderNo ?? "Bekliyor"}</li>
        <li>Teslim dogrulama ve rollback akisleri sonraki teslimat modulunde aktiflesecek.</li>
      </ul>
    </div>
  );
}

function DocumentsInline({ order }: { order: SaleOrder }) {
  return (
    <div className="hz-tab-content">
      <h3>Belgeler</h3>
      <p className="hz-content-card-description">{order.orderNo} icin siparis formu, tahsilat makbuzu ve teslim belgeleri document system'e baglanacak.</p>
    </div>
  );
}
