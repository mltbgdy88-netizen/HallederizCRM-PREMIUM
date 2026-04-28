"use client";

import { useEffect, useMemo, useState } from "react";
import type { Customer, PaymentReceipt } from "@hallederiz/types";
import { mapPaymentRow } from "../mappers/map-payment-row";
import { getPayments } from "../queries/get-payments";
import type { PaymentFilters } from "../schemas/payment-filter-schema";
import { filterPayments } from "../utils/filter-payments";

export function usePaymentsData(filters: PaymentFilters) {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    let mounted = true;
    getPayments()
      .then((result) => {
        if (mounted) {
          setPayments(result.payments);
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

  const filteredPayments = useMemo(() => filterPayments(payments, customers, filters), [payments, customers, filters]);
  const rows = useMemo(() => filteredPayments.map((payment) => mapPaymentRow(payment, customers)), [filteredPayments, customers]);

  return {
    loading,
    payments,
    customers,
    filteredPayments,
    rows
  };
}
