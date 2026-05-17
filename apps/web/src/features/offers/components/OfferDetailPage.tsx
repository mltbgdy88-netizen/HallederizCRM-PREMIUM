"use client";

import { EmptyState, EntityDetailLayout, FormPageShell, FormValidationSummary, LoadingState, PageHeader, TabSwitcher } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../../providers/toast-provider";
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
  const router = useRouter();
  const { pushToast } = useToast();
  const [data, setData] = useState<OfferDetailQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Satirlar");
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

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

  useEffect(() => {
    setDraftSaved(false);
  }, [offerId, customerId]);

  const offer = data?.offer ?? null;
  const customer = useMemo(
    () => data?.customers.find((item) => item.id === offer?.customerId) ?? null,
    [data?.customers, offer?.customerId]
  );

  const newFormHints = useMemo(
    () =>
      !offerId ? ["Yeni teklif: taslak kayıt demo amaçlıdır; gönderim ve dönüşüm onay zincirine tabidir."] : [],
    [offerId]
  );

  if (loading) {
    return <LoadingState title="Teklif yukleniyor" message="Fiyat slotlari, satirlar ve follow-up kayitlari hazirlaniyor." />;
  }

  if (!data || !offer) {
    return <EmptyState title="Teklif Bulunamadi" message="Secilen teklif bulunamadi veya erisim kapsaminda degil." />;
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
          <FormPageShell
            className="hz-offers-form"
            stickyActions={
              !offerId ? (
                <>
                  <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => router.push("/teklifler")}>
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    className="hz-btn hz-btn-primary hz-toolbar-btn"
                    disabled={draftSaved}
                    onClick={() => {
                      pushToast("Teklif taslağı kaydedildi (demo).");
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
                    <p>Teklif PDF önizleme, gönderim ve document delivery kayıtları bu sekmede izlenecek.</p>
                  </div>
                ) : null}
                {activeTab === "Timeline" ? (
                  <div className="hz-state-card hz-tab-content">
                    <h4>Timeline</h4>
                    <p>Teklif oluşumu, gönderim, follow-up ve conversion olayları entity timeline&apos;a bağlanacak.</p>
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
