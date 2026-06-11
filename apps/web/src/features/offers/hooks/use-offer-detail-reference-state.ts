"use client";

import type { Customer, Offer } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { getOfferDetail } from "../queries/get-offers";
import { buildOfferReferenceModel, type OfferReferenceModel } from "../utils/map-offer-detail-to-reference";

export function useOfferDetailReferenceState(offerId: string | undefined, customerId?: string | null) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId) {
      setOffer(null);
      setLoading(false);
      setError("Teklif kimliği bulunamadı.");
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    getOfferDetail(offerId, customerId)
      .then((result) => {
        if (!mounted) {
          return;
        }
        setOffer(result.offer);
        setCustomers(result.customers);
        if (!result.offer) {
          setError("Teklif bulunamadı.");
        }
      })
      .catch(() => {
        if (mounted) {
          setError("Teklif verisi alınamadı.");
          setOffer(null);
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

  const customer = useMemo(
    () => customers.find((item) => item.id === offer?.customerId) ?? null,
    [customers, offer?.customerId]
  );

  const referenceModel = useMemo<OfferReferenceModel | null>(
    () => (offer ? buildOfferReferenceModel(offer, customer) : null),
    [offer, customer]
  );

  return {
    offer,
    customer,
    customers,
    referenceModel,
    loading,
    error,
    notFound: !loading && !offer
  };
}
