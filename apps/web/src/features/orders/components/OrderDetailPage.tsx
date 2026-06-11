"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useOrderDetailReferenceState } from "../hooks/use-order-detail-reference-state";
import { buildQuickOrderHref } from "../utils/map-order-detail-to-reference";
import { OrderActionButtons } from "./OrderActionButtons";
import { OrderApprovalSummaryModal } from "./OrderApprovalSummaryModal";
import { OrderLinesTable } from "./OrderLinesTable";
import { SourcingPlanModal } from "./SourcingPlanModal";
import {
  OrderReferenceDemoBand,
  OrderReferenceFieldGrid,
  OrderReferenceHeader,
  OrderReferenceKpiStrip,
  OrderReferenceLoadingState,
  OrderReferenceNotFoundState,
  OrderReferenceSection,
  OrderReferenceShell,
  OrderReferenceSidePanel,
  OrderReferenceTimelineList,
  orderInfoFields
} from "./order-reference-shared";

export function OrderDetailPage({
  orderId,
  sourceOfferId,
  customerId
}: {
  orderId?: string;
  sourceOfferId?: string | null;
  customerId?: string | null;
}) {
  const router = useRouter();
  const state = useOrderDetailReferenceState(orderId, sourceOfferId, customerId);
  const [sourcingOpen, setSourcingOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);

  const relatedDelivery = state.scopedSide.deliveries[0] ?? null;
  const relatedInvoice = state.scopedSide.invoices[0] ?? null;

  const quickHref = useMemo(() => {
    if (!state.order) {
      return undefined;
    }
    return buildQuickOrderHref(state.order.id, state.customer?.id ?? state.order.customerId);
  }, [state.order, state.customer?.id]);

  if (state.loading) {
    return <OrderReferenceLoadingState />;
  }

  if (state.notFound || !state.order || !state.referenceModel) {
    return <OrderReferenceNotFoundState />;
  }

  const order = state.order;

  return (
    <>
      <OrderReferenceShell>
        <OrderReferenceHeader title="Sipariş Detayı" meta={state.referenceModel.headerMeta} quickHref={quickHref} />
        <OrderReferenceDemoBand />
        <OrderReferenceKpiStrip kpis={state.referenceModel.kpis} />
        <main className="spd-layout">
          <section className="spd-main">
            <OrderReferenceSection title="Sipariş bilgileri" description="Detay katmanları üst menüden açılır.">
              <OrderReferenceFieldGrid fields={orderInfoFields(order, state.customer)} />
            </OrderReferenceSection>
            <OrderReferenceSection title="Ürün / satır özeti">
              <OrderLinesTable lines={order.lines} variant="reference" compact />
            </OrderReferenceSection>
            <OrderReferenceSection title="Son hareketler">
              <OrderReferenceTimelineList events={state.referenceModel.timelineEvents.slice(0, 8)} />
            </OrderReferenceSection>
          </section>
          <aside className="spd-side">
            <OrderReferenceSidePanel
              order={order}
              customer={state.customer}
              scoped={state.scopedSide}
              model={state.referenceModel}
              relatedDelivery={relatedDelivery}
              relatedInvoice={relatedInvoice}
              actions={
                <section className="spd-actions-wrap" aria-label="Sipariş aksiyonları">
                  <OrderActionButtons
                    layout="reference"
                    onSourcing={() => setSourcingOpen(true)}
                    onApproval={() => setApprovalOpen(true)}
                    onPayment={() => router.push(`/tahsilatlar/yeni?order=${order.id}`)}
                    onWarehouse={() =>
                      router.push(
                        state.scopedSide.warehouseOrders[0]
                          ? `/depo/emirler/${state.scopedSide.warehouseOrders[0].id}`
                          : "/depo"
                      )
                    }
                    onDelivery={() => router.push(relatedDelivery ? `/teslimatlar/${relatedDelivery.id}` : "/teslimatlar")}
                    onInvoice={() => router.push(relatedInvoice ? `/faturalar/${relatedInvoice.id}` : "/faturalar")}
                  />
                  <p className="spd-note">Kaydet / Onayla aksiyonları demo/sonraki fazdır; canlı mutation bağlı değildir.</p>
                </section>
              }
            />
          </aside>
        </main>
      </OrderReferenceShell>

      <SourcingPlanModal open={sourcingOpen} order={order} onClose={() => setSourcingOpen(false)} />
      <OrderApprovalSummaryModal open={approvalOpen} order={order} onClose={() => setApprovalOpen(false)} />
    </>
  );
}
