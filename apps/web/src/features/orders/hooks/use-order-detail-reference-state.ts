"use client";

import type { Customer, SaleOrder } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { getOrderDetailSideData, type OrderDetailSideData } from "../queries/get-order-detail-side-data";
import { getOrderDetail } from "../queries/get-orders";
import {
  buildOrderReferenceModel,
  scopeOrderSideData,
  type OrderReferenceModel,
  type OrderScopedSideData
} from "../utils/map-order-detail-to-reference";

export function useOrderDetailReferenceState(
  orderId: string | undefined,
  sourceOfferId?: string | null,
  customerId?: string | null
) {
  const [order, setOrder] = useState<SaleOrder | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sideData, setSideData] = useState<OrderDetailSideData>({
    payments: [],
    warehouseOrders: [],
    deliveries: [],
    invoices: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      setError("Sipariş kimliği bulunamadı.");
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([getOrderDetail(orderId, sourceOfferId, customerId), getOrderDetailSideData(orderId)])
      .then(([orderResult, side]) => {
        if (!mounted) {
          return;
        }
        setOrder(orderResult.order);
        setCustomers(orderResult.customers);
        setSideData(side);
        if (!orderResult.order) {
          setError("Sipariş bulunamadı.");
        }
      })
      .catch(() => {
        if (mounted) {
          setError("Sipariş verisi alınamadı.");
          setOrder(null);
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
  }, [orderId, sourceOfferId, customerId]);

  const customer = useMemo(
    () => customers.find((item) => item.id === order?.customerId) ?? null,
    [customers, order?.customerId]
  );

  const scopedSide = useMemo<OrderScopedSideData>(
    () => (order ? scopeOrderSideData(order.id, sideData) : { payments: [], warehouseOrders: [], deliveries: [], invoices: [] }),
    [order, sideData]
  );

  const referenceModel = useMemo<OrderReferenceModel | null>(
    () => (order ? buildOrderReferenceModel(order, customer, scopedSide) : null),
    [order, customer, scopedSide]
  );

  return {
    order,
    customer,
    sideData,
    scopedSide,
    referenceModel,
    loading,
    error,
    notFound: !loading && !order
  };
}
