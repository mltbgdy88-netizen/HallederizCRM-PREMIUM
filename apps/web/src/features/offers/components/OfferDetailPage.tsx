"use client";

import { EmptyState, LoadingState, PageHeader, SplitContentLayout, TabSwitcher } from "@hallederiz/ui";
import { useEffect, useMemo, useState } from "react";
import { OfferActionButtons } from "./OfferActionButtons";
import { OfferConvertDialog } from "./OfferConvertDialog";
import { OfferFollowupPanel } from "./OfferFollowupPanel";
import { OfferHeaderInfo } from "./OfferHeaderInfo";
import { OfferLineEditor } from "./OfferLineEditor";
import { OfferLineTable } from "./OfferLineTable";
import { OfferSendModal } from "./OfferSendModal";
import { OfferTotalsPanel } from "./OfferTotalsPanel";
import { customerPriceSlots } from "../../customers/queries/customer-mock-data";
import { getOfferDetail, type OfferDetailQueryResult } from "../queries/get-offers";

export function OfferDetailPage({ offerId, customerId }: { offerId?: string; customerId?: string | null }) {
  const [data, setData] = useState<OfferDetailQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Satirlar");
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    getOfferDetail(offerId, customerId)
      .then((result) => {
        if (mounted) {
          setData(result);
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
  }, [offerId, customerId]);

  const offer = data?.offer ?? null;
  const customer = useMemo(
    () => data?.customers.find((item) => item.id === offer?.customerId) ?? null,
    [data?.customers, offer?.customerId]
  );

  if (loading) {
    return <LoadingState title="Teklif yukleniyor" message="Fiyat slotlari, satirlar ve follow-up kayitlari hazirlaniyor." />;
  }

  if (!data || !offer) {
    return <EmptyState title="Teklif Bulunamadi" message="Secilen teklif bulunamadi veya erisim kapsaminda degil." />;
  }

  return (
    <div className="hz-page-stack">
      <PageHeader
        title={offerId ? "Teklif Detayi" : "Yeni Teklif"}
        description="Cari fiyat grubu ile bagli teklif satirlari, follow-up ve siparise donusum omurgasi."
      />

      <OfferHeaderInfo offer={offer} customers={data.customers} />
      <OfferActionButtons onSend={() => setSendModalOpen(true)} onConvert={() => setConvertDialogOpen(true)} />

      <SplitContentLayout
        main={
          <div className="hz-page-stack">
            <OfferLineEditor offer={offer} customer={customer} priceSlots={customerPriceSlots} />
            <section className="hz-content-card">
              <TabSwitcher
                items={["Satirlar", "Follow-up", "Belgeler", "Timeline"].map((tab) => ({ key: tab, label: tab }))}
                activeKey={activeTab}
                onChange={setActiveTab}
              />
              {activeTab === "Satirlar" ? <OfferLineTable lines={offer.lines} /> : null}
              {activeTab === "Follow-up" ? <OfferFollowupPanel followUps={offer.followUps} /> : null}
              {activeTab === "Belgeler" ? (
                <div className="hz-state-card hz-tab-content">
                  <h4>Belgeler</h4>
                  <p>Teklif PDF onizleme, gonderim ve document delivery kayitlari bu sekmede izlenecek.</p>
                </div>
              ) : null}
              {activeTab === "Timeline" ? (
                <div className="hz-state-card hz-tab-content">
                  <h4>Timeline</h4>
                  <p>Teklif olusumu, gonderim, follow-up ve conversion olaylari entity timeline'a baglanacak.</p>
                </div>
              ) : null}
            </section>
          </div>
        }
        side={<OfferTotalsPanel offer={offer} customer={customer} />}
      />

      <OfferSendModal open={sendModalOpen} offer={offer} customer={customer} onClose={() => setSendModalOpen(false)} />
      <OfferConvertDialog
        open={convertDialogOpen}
        offer={offer}
        customer={customer}
        onClose={() => setConvertDialogOpen(false)}
      />
    </div>
  );
}
