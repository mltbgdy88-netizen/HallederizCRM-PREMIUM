"use client";

import { EmptyState, EntityDetailLayout, LoadingState, PageHeader } from "@hallederiz/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { isCustomersDemoRowId } from "../data/customers-demo-rows";
import { CustomerIdentityHeader } from "./CustomerIdentityHeader";
import { CustomerInsightSidePanel } from "./CustomerInsightSidePanel";
import { CustomerSummaryCards } from "./CustomerSummaryCards";
import { CustomerTabs } from "./CustomerTabs";
import { getCustomerDetail, type CustomerDetailQueryResult } from "../queries/get-customers";
import { getOffers } from "../../offers/queries/get-offers";
import type { Offer } from "@hallederiz/types";

const emptyDetailResult: CustomerDetailQueryResult = {
  customer: null,
  account: null,
  contacts: [],
  addresses: [],
  ledgerEntries: [],
  priceSlots: []
};

function CustomerDetailBackNav() {
  return (
    <nav className="hz-customers-detail-topnav" aria-label="Cari gezinme">
      <Link href="/cariler" className="hz-customers-detail-back">
        ← Cari listesine dön
      </Link>
    </nav>
  );
}

export function CustomerDetailPage({ customerId }: { customerId: string }) {
  const isDemoPreview = isCustomersDemoRowId(customerId);
  const [data, setData] = useState<CustomerDetailQueryResult | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(!isDemoPreview);

  useEffect(() => {
    if (isDemoPreview) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    Promise.all([getCustomerDetail(customerId), getOffers()])
      .then(([customerResult, offerResult]) => {
        if (!mounted) {
          return;
        }

        setData(customerResult);
        setOffers(offerResult.offers.filter((offer) => offer.customerId === customerId));
      })
      .catch(() => {
        if (mounted) {
          setData(emptyDetailResult);
          setOffers([]);
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
  }, [customerId, isDemoPreview]);

  if (isDemoPreview) {
    return (
      <div className="hz-customers-detail-page">
        <CustomerDetailBackNav />
        <EmptyState
          title="Önizleme kaydı"
          message="Bu kayıt portföy önizlemesidir; gerçek cari detayı açılmaz. Listeden gerçek bir cari seçin."
          actions={
            <Link href="/cariler" className="hz-btn hz-btn-secondary hz-toolbar-btn">
              Cari listesine dön
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) {
    return <LoadingState title="Cari yükleniyor" message="Cari kartı ve bağlı kayıtlar hazırlanıyor." />;
  }

  if (!data?.customer) {
    return (
      <div className="hz-customers-detail-page">
        <CustomerDetailBackNav />
        <EmptyState
          title="Cari bulunamadı"
          message="Seçilen cari kaydı bulunamadı, silinmiş olabilir veya erişim kapsamınız dışında olabilir."
          actions={
            <Link href="/cariler" className="hz-btn hz-btn-secondary hz-toolbar-btn">
              Cari listesine dön
            </Link>
          }
        />
      </div>
    );
  }

  const { customer, account, contacts, addresses, ledgerEntries } = data;

  return (
    <div className="hz-customers-detail-page">
      <CustomerDetailBackNav />
      <EntityDetailLayout
        summary={
          <>
            <PageHeader title="Cari kartı" description="Müşteri/bayi finans, teklif ve operasyon bağlamını tek kartta yönetin." />
            <CustomerIdentityHeader customer={customer} financeLinked={account !== null} />
            <CustomerSummaryCards customer={customer} account={account} />
          </>
        }
        sections={
          <CustomerTabs
            customer={customer}
            account={account}
            contacts={contacts}
            addresses={addresses}
            ledgerEntries={ledgerEntries}
            offers={offers}
          />
        }
        sidebar={<CustomerInsightSidePanel customer={customer} account={account} />}
      />
    </div>
  );
}

