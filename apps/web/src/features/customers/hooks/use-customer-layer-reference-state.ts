"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Offer } from "@hallederiz/types";
import type { CustomerLayerKey } from "../../ui-inventory/utils/cariler-subroute-command-center-data";
import { isCustomersDemoRowId } from "../data/customers-demo-rows";
import { getCustomerDetail, type CustomerDetailQueryResult } from "../queries/get-customers";
import { getOffers } from "../../offers/queries/get-offers";
import { mapCustomerToLayerReference } from "../utils/map-customer-layer-to-reference";

const emptyDetailResult: CustomerDetailQueryResult = {
  customer: null,
  account: null,
  contacts: [],
  addresses: [],
  ledgerEntries: [],
  priceSlots: []
};

export function useCustomerLayerReferenceState(customerId: string, layer: CustomerLayerKey) {
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
    return mapCustomerToLayerReference({ customerId, layer, data, offers });
  }, [customerId, data, layer, offers]);

  return {
    isDemoPreview,
    loading,
    data,
    offers,
    view,
    goToList: () => router.push("/cariler"),
    goToDetail: () => router.push(`/cariler/${customerId}`)
  };
}
