"use client";

import { useEffect, useMemo, useState } from "react";
import type { Customer, WarehouseOrder } from "@hallederiz/types";
import { mapWarehouseTaskRow } from "../mappers/map-warehouse-task-row";
import { getWarehouseOrders } from "../queries/get-warehouse-orders";
import type { WarehouseTaskFilters } from "../schemas/warehouse-filter-schema";
import { filterWarehouseOrders } from "../utils/filter-warehouse-tasks";

export function useWarehouseTasksData(filters: WarehouseTaskFilters) {
  const [loading, setLoading] = useState(true);
  const [warehouseOrders, setWarehouseOrders] = useState<WarehouseOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    let mounted = true;
    getWarehouseOrders()
      .then((result) => {
        if (mounted) {
          setWarehouseOrders(result.warehouseOrders);
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

  const filteredWarehouseOrders = useMemo(
    () => filterWarehouseOrders(warehouseOrders, filters, customers),
    [warehouseOrders, filters, customers]
  );
  const rows = useMemo(
    () => filteredWarehouseOrders.map((warehouseOrder) => mapWarehouseTaskRow(warehouseOrder, customers)),
    [filteredWarehouseOrders, customers]
  );

  return {
    loading,
    warehouseOrders,
    customers,
    filteredWarehouseOrders,
    rows
  };
}
