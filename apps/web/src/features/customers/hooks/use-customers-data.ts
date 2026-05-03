"use client";

import { useEffect, useMemo, useState } from "react";
import { mapCustomerToRow } from "../mappers/map-customer-row";
import { getCustomers, type CustomersQueryResult } from "../queries/get-customers";
import { filterCustomers } from "../utils/filter-customers";
import type { CustomerFilters } from "../schemas/customer-filter-schema";

const emptyData: CustomersQueryResult = {
  customers: [],
  accounts: [],
  contacts: [],
  addresses: [],
  ledgerEntries: [],
  priceSlots: []
};

export function useCustomersData(filters: CustomerFilters) {
  const [data, setData] = useState<CustomersQueryResult>(emptyData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getCustomers()
      .then((result) => {
        if (mounted) {
          setData(result);
        }
      })
      .catch(() => {
        if (mounted) {
          setData(emptyData);
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

  const filteredCustomers = useMemo(
    () =>
      filterCustomers({
        customers: data.customers,
        accounts: data.accounts,
        contacts: data.contacts,
        filters
      }),
    [data.accounts, data.contacts, data.customers, filters]
  );

  const rows = useMemo(
    () =>
      filteredCustomers.map((customer) =>
        mapCustomerToRow(
          customer,
          data.accounts.find((account) => account.customerId === customer.id) ?? {
            id: `account_${customer.id}`,
            tenantId: customer.tenantId,
            customerId: customer.id,
            balance: 0,
            currency: "TRY",
            overdueAmount: 0,
            openOfferCount: 0,
            openOrderCount: 0
          }
        )
      ),
    [data.accounts, filteredCustomers]
  );

  return {
    loading,
    data,
    customers: data.customers,
    filteredCustomers,
    rows
  };
}
