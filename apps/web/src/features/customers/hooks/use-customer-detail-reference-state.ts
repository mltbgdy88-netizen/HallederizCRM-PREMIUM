"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Offer } from "@hallederiz/types";
import { isCustomersDemoRowId } from "../data/customers-demo-rows";
import { getCustomerDetail, type CustomerDetailQueryResult } from "../queries/get-customers";
import { getOffers } from "../../offers/queries/get-offers";
import { mapCustomerToDetailReference } from "../utils/map-customer-detail-to-reference";

const emptyDetailResult: CustomerDetailQueryResult = {
  customer: null,
  account: null,
  contacts: [],
  addresses: [],
  ledgerEntries: [],
  priceSlots: []
};

export function useCustomerDetailReferenceState(customerId: string) {
  const router = useRouter();
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
        if (!mounted) return;
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
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [customerId, isDemoPreview]);

  const view = useMemo(() => {
    if (!data?.customer) return null;
    return mapCustomerToDetailReference({ customerId, data, offers });
  }, [customerId, data, offers]);

  return {
    isDemoPreview,
    loading,
    data,
    offers,
    view,
    goToList: () => router.push("/cariler"),
    goToCreateOffer: () => router.push(`/teklifler/yeni?customer=${customerId}`),
    goToCreateOrder: () => router.push(`/siparisler/yeni?customer=${customerId}`),
    goToCreatePayment: () => router.push(`/tahsilatlar/yeni?customer=${customerId}`)
  };
}
