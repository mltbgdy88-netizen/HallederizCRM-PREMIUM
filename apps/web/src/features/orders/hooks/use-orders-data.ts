"use client";

import { useEffect, useMemo, useState } from "react";
import type { Customer, SaleOrder } from "@hallederiz/types";
import { mapOrderRow } from "../mappers/map-order-row";
import { getOrders } from "../queries/get-orders";
import type { OrderFilters } from "../schemas/order-filter-schema";
import { filterOrders } from "../utils/filter-orders";

export function useOrdersData(filters: OrderFilters) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    let mounted = true;

    getOrders()
      .then((result) => {
        if (mounted) {
          setOrders(result.orders);
          setCustomers(result.customers);
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
  }, []);

  const filteredOrders = useMemo(() => filterOrders(orders, customers, filters), [orders, customers, filters]);
  const rows = useMemo(() => filteredOrders.map((order) => mapOrderRow(order, customers)), [filteredOrders, customers]);

  return {
    loading,
    orders,
    customers,
    filteredOrders,
    rows
  };
}
