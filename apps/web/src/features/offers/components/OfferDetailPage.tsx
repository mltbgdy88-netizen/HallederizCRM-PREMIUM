"use client";

import { useMemo, useState } from "react";
import { useOfferDetailReferenceState } from "../hooks/use-offer-detail-reference-state";
import { buildQuickOfferHref } from "../utils/map-offer-detail-to-reference";
import { OfferActionButtons } from "./OfferActionButtons";
import { OfferConversionPanel } from "./OfferConversionPanel";
import { OfferConvertDialog } from "./OfferConvertDialog";
import { OfferLineTable } from "./OfferLineTable";
import { OfferSendModal } from "./OfferSendModal";
import {
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
  offerInfoFields
} from "./offer-reference-shared";

export function OfferDetailPage({ offerId, customerId }: { offerId?: string; customerId?: string | null }) {
  const state = useOfferDetailReferenceState(offerId, customerId);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);

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

  const offer = state.offer;

  return (
    <>
      <OfferReferenceShell>
        <OfferReferenceHeader title="Teklif Detayı" meta={state.referenceModel.headerMeta} quickHref={quickHref} />
        <OfferReferenceDemoBand />
        <OfferReferenceKpiStrip kpis={state.referenceModel.kpis} />
        <main className="ofd-layout">
          <section className="ofd-main">
            <OfferReferenceSection title="Teklif bilgileri" description="Katman geçişleri üst menüden yapılır.">
              <OfferReferenceFieldGrid fields={offerInfoFields(offer, state.customer)} />
            </OfferReferenceSection>
            <OfferReferenceSection title="Teklif satır özeti">
              <OfferLineTable lines={offer.lines} variant="reference" compact />
            </OfferReferenceSection>
            <OfferReferenceSection title="Dönüşüm özeti">
              <OfferConversionPanel offer={offer} customer={state.customer} />
            </OfferReferenceSection>
            <OfferReferenceSection title="Son hareketler">
              <OfferReferenceTimelineList events={state.referenceModel.timelineEvents.slice(0, 8)} />
            </OfferReferenceSection>
          </section>
          <aside className="ofd-side">
            <OfferReferenceSidePanel
              offer={offer}
              customer={state.customer}
              model={state.referenceModel}
              onConvert={() => setConvertDialogOpen(true)}
              onSend={() => setSendModalOpen(true)}
              actions={
                <section className="ofd-actions-wrap" aria-label="Teklif aksiyonları">
                  <OfferActionButtons
                    layout="reference"
                    onSend={() => setSendModalOpen(true)}
                    onConvert={() => setConvertDialogOpen(true)}
                  />
                  <p className="ofd-note">Kaydet / PDF / Follow-up aksiyonları demo/sonraki fazdır; canlı mutation bağlı değildir.</p>
                </section>
              }
            />
          </aside>
        </main>
      </OfferReferenceShell>

      <OfferSendModal open={sendModalOpen} offer={offer} customer={state.customer} onClose={() => setSendModalOpen(false)} />
      <OfferConvertDialog open={convertDialogOpen} offer={offer} customer={state.customer} onClose={() => setConvertDialogOpen(false)} />
    </>
  );
}
