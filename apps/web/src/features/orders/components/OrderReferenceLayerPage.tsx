"use client";

import Link from "next/link";
import { useMemo } from "react";
import { OrderEntityLayerNav } from "../../ui-inventory/components/EntityLayerNav";
import { SiparislerOrderidCommandCenterShell } from "../../ui-inventory/components/SiparislerShellWrappers";
import { useOrderDetailReferenceState } from "../hooks/use-order-detail-reference-state";
import {
  ORDER_LAYER_TITLES,
  buildQuickDeliveryHref,
  buildQuickOrderHref,
  buildQuickReturnHref,
  type OrderReferenceLayerKey
} from "../utils/map-order-detail-to-reference";
import { formatTryMoney } from "../utils/format";
import { OrderLinesTable } from "./OrderLinesTable";
import {
  OrderReferenceDeliveriesTable,
  OrderReferenceDemoBand,
  OrderReferenceFieldGrid,
  OrderReferenceHeader,
  OrderReferenceInvoicesTable,
  OrderReferenceKpiStrip,
  OrderReferenceLoadingState,
  OrderReferenceNotFoundState,
  OrderReferencePaymentsTable,
  OrderReferenceSection,
  OrderReferenceShell,
  OrderReferenceSidePanel,
  OrderReferenceSummaryScroll,
  OrderReferenceTimelineList,
  OrderReferenceWarehouseTable,
  orderInfoFields
} from "./order-reference-shared";

function LayerContent({
  layer,
  order,
  customer,
  scoped,
  model
}: {
  layer: OrderReferenceLayerKey;
  order: NonNullable<ReturnType<typeof useOrderDetailReferenceState>["order"]>;
  customer: ReturnType<typeof useOrderDetailReferenceState>["customer"];
  scoped: ReturnType<typeof useOrderDetailReferenceState>["scopedSide"];
  model: NonNullable<ReturnType<typeof useOrderDetailReferenceState>["referenceModel"]>;
}) {
  const relatedDelivery = scoped.deliveries[0] ?? null;
  const relatedInvoice = scoped.invoices[0] ?? null;
  const customerId = customer?.id ?? order.customerId;

  if (layer === "ozet") {
    return (
      <main className="spd-layout">
        <section className="spd-main">
          <OrderReferenceSection title="Sipariş özeti" description="Operasyon, tahsilat ve teslimat kısa görünümü.">
            <OrderReferenceFieldGrid fields={orderInfoFields(order, customer)} />
          </OrderReferenceSection>
          <OrderReferenceSection title="Finans özeti">
            <OrderReferenceFieldGrid
              fields={[
                { label: "Sipariş tutarı", value: formatTryMoney(order.grandTotal, order.currency) },
                { label: "Tahsil edilen", value: formatTryMoney(order.paidTotal, order.currency) },
                { label: "Açık tutar", value: model.openBalance },
                { label: "Tahsis toplamı", value: formatTryMoney(model.allocatedPaymentTotal, order.currency) }
              ]}
            />
          </OrderReferenceSection>
          <OrderReferenceSection title="Son hareketler">
            <OrderReferenceTimelineList events={model.timelineEvents.slice(0, 6)} />
          </OrderReferenceSection>
        </section>
        <aside className="spd-side">
          <OrderReferenceSidePanel
            order={order}
            customer={customer}
            scoped={scoped}
            model={model}
            relatedDelivery={relatedDelivery}
            relatedInvoice={relatedInvoice}
          />
        </aside>
      </main>
    );
  }

  if (layer === "satirlar") {
    return (
      <main className="spd-layout spd-layout--wide">
        <section className="spd-main">
          <OrderReferenceSection title="Sipariş satırları" description="Satır düzenleme sonraki fazda; görünüm salt okunur.">
            <OrderLinesTable lines={order.lines} variant="reference" />
            <p className="spd-note">Satır ekleme ve düzenleme canlı mutation gerektirir; bu turda devre dışıdır.</p>
          </OrderReferenceSection>
        </section>
      </main>
    );
  }

  if (layer === "odeme-tahsilat") {
    const openAmount = Math.max(order.grandTotal - order.paidTotal, 0);
    return (
      <main className="spd-layout">
        <section className="spd-main">
          <OrderReferenceSection title="Ödeme ve tahsilat özeti">
            <OrderReferenceFieldGrid
              fields={[
                { label: "Tahsilat durumu", value: model.paymentStatusLabel },
                { label: "Sipariş tutarı", value: formatTryMoney(order.grandTotal, order.currency) },
                { label: "Tahsil edilen", value: formatTryMoney(order.paidTotal, order.currency) },
                { label: "Açık bakiye", value: formatTryMoney(openAmount, order.currency) }
              ]}
            />
            <Link href={`/tahsilatlar/yeni?order=${encodeURIComponent(order.id)}`} className="spd-inline-cta">
              Tahsilat ekle →
            </Link>
          </OrderReferenceSection>
          <OrderReferenceSection title="Tahsilat listesi">
            <OrderReferencePaymentsTable payments={scoped.payments} />
          </OrderReferenceSection>
        </section>
        <aside className="spd-side">
          <OrderReferenceSidePanel
            order={order}
            customer={customer}
            scoped={scoped}
            model={model}
            relatedDelivery={relatedDelivery}
            relatedInvoice={relatedInvoice}
          />
        </aside>
      </main>
    );
  }

  if (layer === "teslimat") {
    return (
      <main className="spd-layout">
        <section className="spd-main">
          <OrderReferenceSection title="Teslimat özeti">
            <OrderReferenceFieldGrid
              fields={[
                { label: "Teslim durumu", value: model.deliveryStatusLabel },
                { label: "Depo emri", value: scoped.warehouseOrders[0]?.warehouseOrderNo ?? "—" },
                { label: "Teslim kaydı", value: relatedDelivery?.deliveryNo ?? "—" },
                { label: "Plan tarihi", value: relatedDelivery?.plannedAt ? new Date(relatedDelivery.plannedAt).toLocaleDateString("tr-TR") : "—" }
              ]}
            />
            <Link href={buildQuickDeliveryHref(order.id, customerId)} className="spd-inline-cta">
              Teslimat hazırla (Hızlı İşlem) →
            </Link>
          </OrderReferenceSection>
          <OrderReferenceSection title="Teslimat kayıtları">
            <OrderReferenceDeliveriesTable deliveries={scoped.deliveries} />
          </OrderReferenceSection>
        </section>
        <aside className="spd-side">
          <OrderReferenceSidePanel
            order={order}
            customer={customer}
            scoped={scoped}
            model={model}
            relatedDelivery={relatedDelivery}
            relatedInvoice={relatedInvoice}
          />
        </aside>
      </main>
    );
  }

  if (layer === "fatura") {
    return (
      <main className="spd-layout">
        <section className="spd-main">
          <OrderReferenceSection title="Fatura özeti">
            <OrderReferenceFieldGrid
              fields={[
                { label: "Fatura durumu", value: model.invoiceStatusLabel },
                { label: "Fatura no", value: relatedInvoice?.invoiceNo ?? "—" },
                { label: "Tutar", value: relatedInvoice ? formatTryMoney(relatedInvoice.grandTotal, relatedInvoice.currency) : "—" },
                { label: "Ödeme durumu", value: relatedInvoice?.paymentStatus ?? "—" }
              ]}
            />
            <Link href={relatedInvoice ? `/faturalar/${relatedInvoice.id}` : "/faturalar"} className="spd-inline-cta">
              Fatura ekranına git →
            </Link>
          </OrderReferenceSection>
          <OrderReferenceSection title="Fatura kayıtları">
            <OrderReferenceInvoicesTable invoices={scoped.invoices} />
          </OrderReferenceSection>
        </section>
        <aside className="spd-side">
          <OrderReferenceSidePanel
            order={order}
            customer={customer}
            scoped={scoped}
            model={model}
            relatedDelivery={relatedDelivery}
            relatedInvoice={relatedInvoice}
          />
        </aside>
      </main>
    );
  }

  if (layer === "iade") {
    const returnableLines = order.lines.filter((line) => line.deliveredQuantity > 0);
    return (
      <main className="spd-layout">
        <section className="spd-main">
          <OrderReferenceSection title="İade özeti" description="15 gün iade kuralı operasyon politikasına bağlıdır.">
            <OrderReferenceFieldGrid
              fields={[
                { label: "İade edilebilir satır", value: String(returnableLines.length) },
                { label: "Teslim edilen miktar", value: String(order.lines.reduce((sum, line) => sum + line.deliveredQuantity, 0)) },
                { label: "Sipariş durumu", value: model.deliveryStatusLabel }
              ]}
            />
            <p className="spd-note">İade başlatma Hızlı İşlem iade sekmesinden yapılır; gerçek iade mutation bu ekranda yoktur.</p>
            <Link href={buildQuickReturnHref(order.id, customerId)} className="spd-inline-cta">
              İade başlat (Hızlı İşlem) →
            </Link>
          </OrderReferenceSection>
          {returnableLines.length > 0 ? (
            <OrderReferenceSection title="İade edilebilir satırlar">
              <div className="spd-table-wrap">
                <table className="spd-table">
                  <thead>
                    <tr>
                      <th>Ürün</th>
                      <th>Teslim</th>
                      <th>Adet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnableLines.map((line) => (
                      <tr key={line.id}>
                        <td>{line.productCode}</td>
                        <td>{line.deliveredQuantity}</td>
                        <td>{line.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </OrderReferenceSection>
          ) : (
            <p className="spd-empty">İade edilebilir teslim satırı bulunmuyor.</p>
          )}
        </section>
        <aside className="spd-side">
          <OrderReferenceSidePanel
            order={order}
            customer={customer}
            scoped={scoped}
            model={model}
            relatedDelivery={relatedDelivery}
            relatedInvoice={relatedInvoice}
          />
        </aside>
      </main>
    );
  }

  if (layer === "depo-stok-etkisi") {
    return (
      <main className="spd-layout">
        <section className="spd-main">
          <OrderReferenceSection title="Depo / stok etkisi">
            <OrderReferenceFieldGrid
              fields={[
                { label: "Depo emri sayısı", value: String(scoped.warehouseOrders.length) },
                { label: "Kaynak planı", value: String(order.sourcePlans.length) },
                { label: "Teslim tipi", value: order.deliveryType }
              ]}
            />
          </OrderReferenceSection>
          <OrderReferenceSection title="Depo emirleri">
            <OrderReferenceWarehouseTable warehouseOrders={scoped.warehouseOrders} />
          </OrderReferenceSection>
          {order.sourcePlans.length > 0 ? (
            <OrderReferenceSection title="Kaynak planı">
              <div className="spd-table-wrap">
                <table className="spd-table">
                  <thead>
                    <tr>
                      <th>Ürün</th>
                      <th>Merkez</th>
                      <th>Fabrika</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.sourcePlans.map((plan) => (
                      <tr key={plan.id}>
                        <td>{plan.productId}</td>
                        <td>{plan.warehouseQuantity}</td>
                        <td>{plan.factoryQuantity}</td>
                        <td>{plan.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </OrderReferenceSection>
          ) : null}
          <p className="spd-note">Depo emri oluşturma canlı mutation gerektirir; toast/disabled davranış korunur.</p>
        </section>
        <aside className="spd-side">
          <OrderReferenceSidePanel
            order={order}
            customer={customer}
            scoped={scoped}
            model={model}
            relatedDelivery={relatedDelivery}
            relatedInvoice={relatedInvoice}
          />
        </aside>
      </main>
    );
  }

  return (
    <main className="spd-layout spd-layout--wide">
      <section className="spd-main">
        <OrderReferenceSection title="Zaman akışı" description="Sipariş, tahsilat, depo, teslimat ve fatura olayları.">
          <OrderReferenceTimelineList events={model.timelineEvents} />
        </OrderReferenceSection>
      </section>
    </main>
  );
}

export function OrderReferenceLayerPage({ orderId, layer }: { orderId: string; layer: OrderReferenceLayerKey }) {
  const state = useOrderDetailReferenceState(orderId);
  const quickHref = useMemo(
    () => (state.order ? buildQuickOrderHref(state.order.id, state.customer?.id ?? state.order.customerId) : undefined),
    [state.order, state.customer?.id]
  );

  if (state.loading) {
    return <OrderReferenceLoadingState />;
  }

  if (state.notFound || !state.order || !state.referenceModel) {
    return <OrderReferenceNotFoundState />;
  }

  return (
    <SiparislerOrderidCommandCenterShell>
      <OrderReferenceShell className="spd-layer">
        <OrderEntityLayerNav orderId={orderId} />
        <OrderReferenceHeader
          title={ORDER_LAYER_TITLES[layer]}
          meta={state.referenceModel.headerMeta}
          quickHref={quickHref}
        />
        <OrderReferenceSummaryScroll>
          <OrderReferenceDemoBand />
          <OrderReferenceKpiStrip kpis={state.referenceModel.kpis} />
          <LayerContent
            layer={layer}
            order={state.order}
            customer={state.customer}
            scoped={state.scopedSide}
            model={state.referenceModel}
          />
        </OrderReferenceSummaryScroll>
      </OrderReferenceShell>
    </SiparislerOrderidCommandCenterShell>
  );
}
