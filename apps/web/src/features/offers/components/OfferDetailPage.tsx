"use client";

import { EmptyState, EntityDetailLayout, FormPageShell, LoadingState, PageHeader, TabSwitcher } from "@hallederiz/ui";
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
  const [activeTab, setActiveTab] = useState("Satırlar");
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
    return <LoadingState title="Teklif yükleniyor" message="Fiyat slotları, satırlar ve follow-up kayıtları hazırlanıyor." />;
  }

  if (!data || !offer) {
    return <EmptyState title="Teklif bulunamadı" message="Seçilen teklif bulunamadı veya erişim kapsamında değil." />;
  }

  return (
    <div className="hz-offers-detail-page">
      <EntityDetailLayout
        summary={
          <>
            <PageHeader
              title={offerId ? "Teklif detayı" : "Yeni teklif"}
              description="Cari fiyat grubu ile bağlı teklif satırları, follow-up ve siparişe dönüşüm omurgası."
            />
            <OfferHeaderInfo offer={offer} customers={data.customers} />
            <OfferActionButtons onSend={() => setSendModalOpen(true)} onConvert={() => setConvertDialogOpen(true)} />
          </>
        }
        sections={
          <FormPageShell className="hz-offers-form">
            <div className="hz-page-stack">
              <OfferLineEditor offer={offer} customer={customer} priceSlots={customerPriceSlots} />
              <section className="hz-content-card">
                <TabSwitcher
                  items={["Satırlar", "Follow-up", "Belgeler", "Zaman çizelgesi"].map((tab) => ({ key: tab, label: tab }))}
                  activeKey={activeTab}
                  onChange={setActiveTab}
                />
                {activeTab === "Satırlar" ? <OfferLineTable lines={offer.lines} /> : null}
                {activeTab === "Follow-up" ? <OfferFollowupPanel followUps={offer.followUps} /> : null}
                {activeTab === "Belgeler" ? (
                  <div className="hz-state-card hz-tab-content">
                    <h4>Belgeler</h4>
                    <p>Teklif PDF önizleme, gönderim ve belge teslim kayıtları bu sekmede izlenecek.</p>
                  </div>
                ) : null}
                {activeTab === "Zaman çizelgesi" ? (
                  <div className="hz-state-card hz-tab-content">
                    <h4>Zaman çizelgesi</h4>
                    <p>Teklif oluşumu, gönderim, follow-up ve dönüşüm olayları kayıt zaman çizelgesine bağlanacak.</p>
                  </div>
                ) : null}
              </section>
            </div>
          </FormPageShell>
        }
        sidebar={<OfferTotalsPanel offer={offer} customer={customer} />}
      />

      <OfferSendModal open={sendModalOpen} offer={offer} customer={customer} onClose={() => setSendModalOpen(false)} />
      <OfferConvertDialog open={convertDialogOpen} offer={offer} customer={customer} onClose={() => setConvertDialogOpen(false)} />
    </div>
  );
}
