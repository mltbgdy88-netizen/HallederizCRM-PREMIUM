"use client";

import { useMemo, useState } from "react";
import { OfferEntityLayerNav } from "../../ui-inventory/components/EntityLayerNav";
import { TekliflerOfferidCommandCenterShell } from "../../ui-inventory/components/TekliflerShellWrappers";
import { useOfferDetailReferenceState } from "../hooks/use-offer-detail-reference-state";
import {
  OFFER_LAYER_TITLES,
  buildQuickOfferHref,
  type OfferReferenceLayerKey
} from "../utils/map-offer-detail-to-reference";
import { OfferConversionPanel } from "./OfferConversionPanel";
import { OfferConvertDialog } from "./OfferConvertDialog";
import { OfferFollowupPanel } from "./OfferFollowupPanel";
import { OfferLineEditor } from "./OfferLineEditor";
import { OfferLineTable } from "./OfferLineTable";
import { OfferSendModal } from "./OfferSendModal";
import { customerPriceSlots } from "../../customers/queries/customer-mock-data";
import {
  OfferReferenceCustomerPanel,
  OfferReferenceDemoBand,
  OfferReferenceFieldGrid,
  OfferReferenceHeader,
  OfferReferenceKpiStrip,
  OfferReferenceLoadingState,
  OfferReferenceNotFoundState,
  OfferReferenceSection,
  OfferReferenceShell,
  OfferReferenceSidePanel,
  OfferReferenceTimelineList,
  offerInfoFields,
  offerTotalsFields
} from "./offer-reference-shared";

function LayerContent({
  layer,
  offer,
  customer,
  model,
  onConvert,
  onSend
}: {
  layer: OfferReferenceLayerKey;
  offer: NonNullable<ReturnType<typeof useOfferDetailReferenceState>["offer"]>;
  customer: ReturnType<typeof useOfferDetailReferenceState>["customer"];
  model: NonNullable<ReturnType<typeof useOfferDetailReferenceState>["referenceModel"]>;
  onConvert: () => void;
  onSend: () => void;
}) {
  if (layer === "ozet") {
    return (
      <main className="ofd-layout">
        <section className="ofd-main">
          <OfferReferenceSection title="Teklif özeti">
            <OfferReferenceFieldGrid fields={offerInfoFields(offer, customer)} />
          </OfferReferenceSection>
          <OfferReferenceSection title="Toplamlar">
            <OfferReferenceFieldGrid fields={offerTotalsFields(offer)} />
          </OfferReferenceSection>
          <OfferReferenceSection title="Dönüşüm özeti">
            <OfferConversionPanel offer={offer} customer={customer} />
          </OfferReferenceSection>
          <OfferReferenceSection title="Son hareketler">
            <OfferReferenceTimelineList events={model.timelineEvents.slice(0, 6)} />
          </OfferReferenceSection>
        </section>
        <aside className="ofd-side">
          <OfferReferenceSidePanel offer={offer} customer={customer} model={model} onConvert={onConvert} onSend={onSend} />
        </aside>
      </main>
    );
  }

  if (layer === "satirlar") {
    return (
      <main className="ofd-layout ofd-layout--wide">
        <section className="ofd-main">
          <OfferReferenceSection title="Teklif satırları" description="Satır düzenleme sonraki fazda; görünüm salt okunur.">
            <OfferLineEditor offer={offer} customer={customer} priceSlots={customerPriceSlots} />
            <OfferLineTable lines={offer.lines} variant="reference" />
            <p className="ofd-note">Satır ekleme ve düzenleme canlı mutation gerektirir; bu turda devre dışıdır.</p>
          </OfferReferenceSection>
        </section>
      </main>
    );
  }

  if (layer === "musteri") {
    return (
      <main className="ofd-layout">
        <section className="ofd-main">
          <OfferReferenceSection title="Müşteri / cari bilgileri" description="Finans route yerine müşteri katmanı.">
            <OfferReferenceCustomerPanel offer={offer} customer={customer} />
          </OfferReferenceSection>
        </section>
        <aside className="ofd-side">
          <OfferReferenceSidePanel offer={offer} customer={customer} model={model} onConvert={onConvert} onSend={onSend} />
        </aside>
      </main>
    );
  }

  if (layer === "siparise-donusturme") {
    return (
      <main className="ofd-layout ofd-layout--wide">
        <section className="ofd-main">
          <OfferConversionPanel offer={offer} customer={customer} embedded />
        </section>
      </main>
    );
  }

  if (layer === "belgeler") {
    return (
      <main className="ofd-layout">
        <section className="ofd-main">
          <OfferReferenceSection title="Teklif belgeleri">
            <OfferReferenceFieldGrid
              fields={[
                { label: "Belge durumu", value: model.documentStatusLabel },
                { label: "Teklif no", value: offer.offerNo },
                { label: "Gönderim", value: offer.sentAt ? "Gönderildi" : "Bekliyor" },
                { label: "PDF", value: "Taslak önizleme" }
              ]}
            />
            <p className="ofd-note">PDF oluşturma ve gönderim canlı mutation gerektirir; toast/disabled davranış korunur.</p>
          </OfferReferenceSection>
        </section>
        <aside className="ofd-side">
          <OfferReferenceSidePanel offer={offer} customer={customer} model={model} onConvert={onConvert} onSend={onSend} />
        </aside>
      </main>
    );
  }

  return (
    <main className="ofd-layout ofd-layout--wide">
      <section className="ofd-main">
        <OfferReferenceSection title="Zaman akışı">
          <OfferReferenceTimelineList events={model.timelineEvents} />
        </OfferReferenceSection>
        {offer.followUps.length > 0 ? (
          <OfferReferenceSection title="Follow-up kayıtları">
            <OfferFollowupPanel followUps={offer.followUps} />
          </OfferReferenceSection>
        ) : null}
      </section>
    </main>
  );
}

export function OfferReferenceLayerPage({ offerId, layer }: { offerId: string; layer: OfferReferenceLayerKey }) {
  const state = useOfferDetailReferenceState(offerId);
  const [convertOpen, setConvertOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);

  const quickHref = useMemo(() => {
    if (!state.offer) {
      return undefined;
    }
    return buildQuickOfferHref(state.customer?.id ?? state.offer.customerId);
  }, [state.offer, state.customer?.id]);

  if (state.loading) {
    return <OfferReferenceLoadingState />;
  }

  if (state.notFound || !state.offer || !state.referenceModel) {
    return <OfferReferenceNotFoundState />;
  }

  return (
    <TekliflerOfferidCommandCenterShell>
      <OfferReferenceShell className="ofd-layer">
        <OfferEntityLayerNav offerId={offerId} />
        <OfferReferenceHeader title={OFFER_LAYER_TITLES[layer]} meta={state.referenceModel.headerMeta} quickHref={quickHref} />
        <OfferReferenceDemoBand />
        <OfferReferenceKpiStrip kpis={state.referenceModel.kpis} />
        <LayerContent
          layer={layer}
          offer={state.offer}
          customer={state.customer}
          model={state.referenceModel}
          onConvert={() => setConvertOpen(true)}
          onSend={() => setSendOpen(true)}
        />
      </OfferReferenceShell>
      <OfferSendModal open={sendOpen} offer={state.offer} customer={state.customer} onClose={() => setSendOpen(false)} />
      <OfferConvertDialog open={convertOpen} offer={state.offer} customer={state.customer} onClose={() => setConvertOpen(false)} />
    </TekliflerOfferidCommandCenterShell>
  );
}
