"use client";

import { LoadingState, MetricCard, PageHeader, PrimaryActionToolbar, SplitContentLayout } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CustomerFilterBar } from "./CustomerFilterBar";
import { CustomerQuickPreviewPanel } from "./CustomerQuickPreviewPanel";
import { CustomerTable } from "./CustomerTable";
import { useCustomerFilters } from "../hooks/use-customer-filters";
import { useCustomersData } from "../hooks/use-customers-data";

export function CustomersPage() {
  const router = useRouter();
  const { filters, updateFilter, resetFilters } = useCustomerFilters();
  const { loading, data, filteredCustomers, rows } = useCustomersData(filters);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const selectedCustomer = useMemo(
    () => data.customers.find((customer) => customer.id === selectedCustomerId) ?? filteredCustomers[0] ?? null,
    [data.customers, filteredCustomers, selectedCustomerId]
  );
  const selectedAccount = useMemo(
    () => data.accounts.find((account) => account.customerId === selectedCustomer?.id) ?? null,
    [data.accounts, selectedCustomer?.id]
  );
  const cities = useMemo(() => Array.from(new Set(data.customers.map((customer) => customer.city))).sort(), [data.customers]);
  const totalOpenBalance = useMemo(
    () => data.accounts.reduce((total, account) => total + Math.max(account.balance, 0), 0),
    [data.accounts]
  );
  const highRiskCount = data.customers.filter((customer) => customer.riskLevel === "high" || customer.riskLevel === "blocked").length;

  return (
    <div className="hz-page-stack">
      <PageHeader
        title="Cariler"
        description="Bayi, mimar, kurumsal ve perakende musterileri fiyat grubu, risk ve ticari baglamla yonetin."
      />

      <section className="hz-metric-grid">
        <MetricCard title="Toplam Cari" value={String(data.customers.length)} detail="Aktif portfoy" tone="info" />
        <MetricCard title="Acik Bakiye" value={`${Math.round(totalOpenBalance / 1000)}K`} detail="TRY" tone="warning" />
        <MetricCard title="Yuksek Risk" value={String(highRiskCount)} detail="Onay gerektirebilir" tone="danger" pulse={highRiskCount > 0} />
        <MetricCard title="WhatsApp Eslesme" value={String(data.customers.filter((item) => item.whatsappMatched).length)} detail="Aktif kanal" tone="success" />
      </section>

      <PrimaryActionToolbar>
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn">
          Yeni Cari
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
          Iceri Aktar
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
          Ekstre Gonder
        </button>
      </PrimaryActionToolbar>

      <CustomerFilterBar
        filters={filters}
        cities={cities}
        priceSlots={data.priceSlots}
        onFilterChange={updateFilter}
        onReset={resetFilters}
      />

      <SplitContentLayout
        main={
          loading ? (
            <LoadingState title="Cariler yukleniyor" message="Cari hesap, fiyat grubu ve risk ozetleri hazirlaniyor." />
          ) : (
            <CustomerTable
              rows={rows}
              selectedCustomerId={selectedCustomer?.id ?? null}
              onSelectCustomer={setSelectedCustomerId}
              onOpenCustomer={(customerId) => router.push(`/cariler/${customerId}`)}
            />
          )
        }
        side={<CustomerQuickPreviewPanel customer={selectedCustomer} account={selectedAccount} />}
      />
    </div>
  );
}
