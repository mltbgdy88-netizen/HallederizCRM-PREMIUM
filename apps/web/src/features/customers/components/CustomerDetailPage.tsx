"use client";

import { EmptyState, EntityDetailLayout, LoadingState, PageHeader } from "@hallederiz/ui";
import { useEffect, useState } from "react";
import { CustomerIdentityHeader } from "./CustomerIdentityHeader";
import { CustomerInsightSidePanel } from "./CustomerInsightSidePanel";
import { CustomerSummaryCards } from "./CustomerSummaryCards";
import { CustomerTabs } from "./CustomerTabs";
import { getCustomerDetail, type CustomerDetailQueryResult } from "../queries/get-customers";
import { getOffers } from "../../offers/queries/get-offers";
import type { Offer } from "@hallederiz/types";

export function CustomerDetailPage({ customerId }: { customerId: string }) {
  const [data, setData] = useState<CustomerDetailQueryResult | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([getCustomerDetail(customerId), getOffers()])
      .then(([customerResult, offerResult]) => {
        if (!mounted) {
          return;
        }

        setData(customerResult);
        setOffers(offerResult.offers.filter((offer) => offer.customerId === customerId));
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [customerId]);

  if (loading || !data) {
    return <LoadingState title="Cari yukleniyor" message="Cari karti, hesap ozeti ve bagli kayitlar hazirlaniyor." />;
  }

  if (!data.customer || !data.account) {
    return <EmptyState title="Cari Bulunamadi" message="Secilen cari kaydi bulunamadi veya erisim kapsaminda degil." />;
  }

  return (
    <div className="hz-customers-detail-page">
      <EntityDetailLayout
        summary={
          <>
            <PageHeader title="Cari kartı" description="Müşteri/bayi finans, teklif ve operasyon bağlamını tek kartta yönetin." />
            <CustomerIdentityHeader customer={data.customer} />
            <CustomerSummaryCards customer={data.customer} account={data.account} />
          </>
        }
        sections={
          <CustomerTabs
            customer={data.customer}
            account={data.account}
            contacts={data.contacts}
            addresses={data.addresses}
            ledgerEntries={data.ledgerEntries}
            offers={offers}
          />
        }
        sidebar={<CustomerInsightSidePanel customer={data.customer} account={data.account} />}
      />
    </div>
  );
}
