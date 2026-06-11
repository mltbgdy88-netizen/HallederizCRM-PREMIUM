"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type { QuickOperationType } from "@hallederiz/types";
import { getOfferDetail } from "../../offers/queries/get-offers";
import { getOrderDetail } from "../../orders/queries/get-orders";
import { findCatalogProductAsync, productToQuickOperationLine } from "../data/quick-operation-catalog";
import { isQuickOpPreviewProductId } from "../data/quick-operation-guards";
import { MSG_CUSTOMER_PARAM_NOT_FOUND, MSG_PREVIEW_PRODUCT } from "../data/quick-operation-messages";
import type { QuickOperationCustomer, QuickOperationLine } from "../types";
import { mapOfferLinesToQuickOperation } from "../utils/map-offer-lines-to-quick-operation";
import { mapOrderToQuickOperationContext, type QuickOperationOrderContext } from "../utils/map-order-to-quick-operation-context";

export type QuickOperationOfferContext = {
  offerId: string;
  offerNo: string;
};

export type DeeplinkPrefillSnapshot = {
  tab: string | null;
  customer: string | null;
  order: string | null;
  offer: string | null;
  product: string | null;
};

type PrefillParams = {
  snapshot: DeeplinkPrefillSnapshot;
  tabBootstrapComplete: boolean;
  customersLoading: boolean;
  catalogCustomers: QuickOperationCustomer[];
  userEditedRef: MutableRefObject<boolean>;
  setCustomerId: (id: string) => void;
  setLinkedOrderId: (id: string | null) => void;
  replaceLines: (lines: QuickOperationLine[]) => void;
  setOperationType: (type: QuickOperationType) => void;
  setNotice: (notice: string | null) => void;
  patchPaymentForm: (patch: {
    enabled?: boolean;
    amount?: number;
    allocateToOrder?: boolean;
  }) => void;
  setProductSearch: (value: string) => void;
  activeTab: "order" | "price" | "payment" | "delivery" | "return";
};

export function useQuickOperationDeeplinkPrefill({
  snapshot,
  tabBootstrapComplete,
  customersLoading,
  catalogCustomers,
  userEditedRef,
  setCustomerId,
  setLinkedOrderId,
  replaceLines,
  setOperationType,
  setNotice,
  patchPaymentForm,
  setProductSearch,
  activeTab
}: PrefillParams) {
  const [offerContext, setOfferContext] = useState<QuickOperationOfferContext | null>(null);
  const [orderContext, setOrderContext] = useState<QuickOperationOrderContext | null>(null);

  const prefillAppliedRef = useRef(false);
  const appliedOfferRef = useRef<string | null>(null);
  const appliedOrderRef = useRef<string | null>(null);
  const appliedProductRef = useRef<string | null>(null);

  useEffect(() => {
    if (!tabBootstrapComplete || customersLoading || userEditedRef.current) {
      return;
    }

    if (prefillAppliedRef.current) {
      return;
    }

    const requestedCustomer = snapshot.customer?.trim();
    if (requestedCustomer && !catalogCustomers.some((customer) => customer.id === requestedCustomer)) {
      setNotice(MSG_CUSTOMER_PARAM_NOT_FOUND);
    }

    let cancelled = false;

    const run = async () => {
      const offerId = snapshot.offer?.trim();
      const orderId = snapshot.order?.trim();
      const productId = snapshot.product?.trim();

      if (offerId) {
        if (appliedOfferRef.current === offerId) {
          prefillAppliedRef.current = true;
          return;
        }

        try {
          const result = await getOfferDetail(offerId, snapshot.customer ?? undefined);
          if (cancelled || userEditedRef.current) return;

          const offer = result.offer;
          if (!offer) {
            setNotice("Teklif bağlantısı alındı; teklif kaydı bulunamadı.");
            prefillAppliedRef.current = true;
            return;
          }

          appliedOfferRef.current = offerId;
          setOfferContext({ offerId: offer.id, offerNo: offer.offerNo });
          setOperationType("sale_order");
          setCustomerId(offer.customerId);
          setLinkedOrderId(null);

          const mappedLines = mapOfferLinesToQuickOperation(offer);
          if (mappedLines.length > 0) {
            replaceLines(mappedLines);
          } else {
            setNotice("Teklif bulundu ancak yüklenecek satır yok.");
          }
        } catch {
          if (!cancelled) {
            setNotice("Teklif bağlantısı alındı; teklif kaydı yüklenemedi.");
          }
        }

        prefillAppliedRef.current = true;
        return;
      }

      if (orderId) {
        if (appliedOrderRef.current === orderId) {
          prefillAppliedRef.current = true;
          return;
        }

        try {
          const result = await getOrderDetail(orderId, null, snapshot.customer ?? undefined);
          if (cancelled || userEditedRef.current) return;

          const order = result.order;
          if (!order) {
            setNotice("Sipariş bağlantısı alındı; sipariş kaydı bulunamadı.");
            prefillAppliedRef.current = true;
            return;
          }

          appliedOrderRef.current = orderId;
          const customer = result.customers.find((item) => item.id === order.customerId) ?? null;
          const context = mapOrderToQuickOperationContext(order, customer);
          setOrderContext(context);
          setLinkedOrderId(order.id);
          setCustomerId(order.customerId);

          if (activeTab === "payment" && context.openBalance !== null) {
            patchPaymentForm({
              enabled: true,
              amount: context.openBalance,
              allocateToOrder: true
            });
          }
        } catch {
          if (!cancelled) {
            setNotice("Sipariş bağlantısı alındı; sipariş kaydı yüklenemedi.");
          }
        }

        prefillAppliedRef.current = true;
        return;
      }

      if (productId) {
        if (appliedProductRef.current === productId) {
          prefillAppliedRef.current = true;
          return;
        }

        appliedProductRef.current = productId;

        if (isQuickOpPreviewProductId(productId)) {
          setNotice(MSG_PREVIEW_PRODUCT);
          prefillAppliedRef.current = true;
          return;
        }

        const product = await findCatalogProductAsync(productId);
        if (cancelled || userEditedRef.current) return;

        if (product) {
          const line = productToQuickOperationLine(product);
          replaceLines([line]);
        } else {
          setProductSearch(productId);
          setNotice("Ürün bağlantısı alındı; canlı ürün çözümleme sonraki fazda bağlanacak.");
        }

        prefillAppliedRef.current = true;
        return;
      }

      prefillAppliedRef.current = true;
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    activeTab,
    catalogCustomers.length,
    customersLoading,
    patchPaymentForm,
    replaceLines,
    setCustomerId,
    setLinkedOrderId,
    setNotice,
    setOperationType,
    setProductSearch,
    snapshot.customer,
    snapshot.offer,
    snapshot.order,
    snapshot.product,
    tabBootstrapComplete,
    userEditedRef
  ]);

  return {
    offerContext,
    orderContext
  };
}
