// @ts-nocheck
"use client";

import { LoadingState, Pagination } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconBanknote,
  IconMessageCircle,
  IconPlusCircle,
  IconSend,
  IconShieldCheck,
  IconTag,
  IconUpload,
  IconUser,
  IconWallet
} from "../../dashboard/components/dashboard-inline-icons";
import { useToast } from "../../../providers/toast-provider";
import { dataSourceConfig } from "../../../lib/data-source";
import { computeKpiMetricsFromCustomerRows, CUSTOMERS_PORTFOLIO_DEMO_ROWS, isCustomersDemoRowId } from "../data/customers-demo-rows";
import { CustomerFilterBar } from "./CustomerFilterBar";
import { CustomerQuickPreviewPanel } from "./CustomerQuickPreviewPanel";
import { CustomerTable } from "./CustomerTable";
import { useCustomerFilters } from "../hooks/use-customer-filters";
import { useCustomersData } from "../hooks/use-customers-data";

export function CustomersPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { filters, updateFilter, resetFilters } = useCustomerFilters();
  const { loading, loadFailed, loadUnavailableTitle, loadUnavailableDetail, data, filteredCustomers, rows } =
    useCustomersData(filters);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const usingDemoFallback = dataSourceConfig.useDemoData && !loading && data.customers.length === 0;
  const displayRows = useMemo(() => (usingDemoFallback ? CUSTOMERS_PORTFOLIO_DEMO_ROWS : rows), [usingDemoFallback, rows]);
  const pagedRows = useMemo(() => displayRows.slice((page - 1) * pageSize, page * pageSize), [page, displayRows]);

  useEffect(() => {
    if (usingDemoFallback) {
      const first = CUSTOMERS_PORTFOLIO_DEMO_ROWS[0];
      if (first && (!selectedCustomerId || !CUSTOMERS_PORTFOLIO_DEMO_ROWS.some((r) => r.customerId === selectedCustomerId))) {
        setSelectedCustomerId(first.customerId);
      }
      return;
    }
    if (!filteredCustomers.length) {
      setSelectedCustomerId(null);
      return;
    }
    const first = filteredCustomers[0];
    if (first && (!selectedCustomerId || !filteredCustomers.some((c) => c.id === selectedCustomerId))) {
      setSelectedCustomerId(first.id);
    }
  }, [usingDemoFallback, filteredCustomers, selectedCustomerId]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId || isCustomersDemoRowId(selectedCustomerId)) {
      return null;
    }
    return data.customers.find((c) => c.id === selectedCustomerId) ?? filteredCustomers.find((c) => c.id === selectedCustomerId) ?? null;
  }, [data.customers, filteredCustomers, selectedCustomerId]);

  const selectedAccount = useMemo(
    () => (selectedCustomer ? data.accounts.find((account) => account.customerId === selectedCustomer.id) ?? null : null),
    [data.accounts, selectedCustomer?.id]
  );

  const selectedPreviewRow = useMemo(() => {
    if (!usingDemoFallback || !selectedCustomerId) {
      return null;
    }
    return displayRows.find((r) => r.customerId === selectedCustomerId) ?? null;
  }, [usingDemoFallback, selectedCustomerId, displayRows]);

  const cities = useMemo(() => Array.from(new Set(data.customers.map((customer) => customer.city))).sort(), [data.customers]);

  const kpiDisplay = useMemo(() => {
    if (usingDemoFallback) {
      const m = computeKpiMetricsFromCustomerRows(displayRows);
      return {
        totalCustomers: m.totalCount,
        openBalanceTry: m.receivableSumTry,
        highRiskCount: m.highRiskCount,
        waMatchCount: m.whatsappMatchedCount,
        overdueCount: m.overdueCount,
        priceGroupCount: m.uniquePriceGroupCount
      };
    }
    const hasFinanceSummary = data.accounts.length > 0;
    const uniquePriceGroups = new Set(
      data.customers
        .map((c) => c.pricingProfile?.priceSlotLabelSnapshot?.trim())
        .filter((label): label is string => Boolean(label))
    );

    return {
      totalCustomers: data.customers.length,
      openBalanceTry: hasFinanceSummary
        ? data.accounts.reduce((total, account) => total + Math.max(account.balance, 0), 0)
        : null,
      highRiskCount: data.customers.filter((c) => c.riskLevel === "high" || c.riskLevel === "blocked").length,
      waMatchCount: data.customers.filter((c) => c.whatsappMatched).length,
      overdueCount: hasFinanceSummary ? data.accounts.filter((a) => a.overdueAmount > 0).length : null,
      priceGroupCount: uniquePriceGroups.size
    };
  }, [usingDemoFallback, displayRows, data.customers, data.accounts, data.priceSlots]);

  /** KPI â€œAÃ§Ä±k bakiyeâ€: tam TRY gÃ¶sterimi (â‚º294.050), liste ile tutarlÄ±. */
  const formatKpiOpenBalanceTry = (value: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);

  const demoRowToast = useCallback(() => {
    pushToast("Bu kayÄ±t Ã¶nizleme verisidir; gerÃ§ek cari kaydÄ± deÄŸildir.");
  }, [pushToast]);

  const handleTopStatement = useCallback(() => {
    if (!selectedCustomerId) {
      pushToast("Ekstre taslaÄŸÄ± iÃ§in Ã¶nce listeden bir cari seÃ§in.");
      return;
    }
    if (isCustomersDemoRowId(selectedCustomerId)) {
      pushToast("Ã–nizleme kaydÄ±: ekstre taslaÄŸÄ± oluÅŸturulmaz veya yÃ¶nlendirilmez.");
      return;
    }
    const customer =
      data.customers.find((c) => c.id === selectedCustomerId) ??
      filteredCustomers.find((c) => c.id === selectedCustomerId) ??
      null;
    if (!customer) {
      pushToast("Ekstre taslaÄŸÄ± iÃ§in Ã¶nce listeden bir cari seÃ§in.");
      return;
    }
    router.push(`/belgeler?customer=${customer.id}&type=statement_pdf`);
  }, [data.customers, filteredCustomers, pushToast, router, selectedCustomerId]);

  const emptyFiltered = !usingDemoFallback && !loading && data.customers.length > 0 && rows.length === 0;

  return (
    <main className="hz-customers-page hz-customers-page--desk">
      <header className="hz-customers-topbar">
        <div className="hz-customers-topbar-text">
          <h1 className="hz-customers-topbar-title">Cari PortfÃ¶yÃ¼</h1>
        </div>
        <div className="hz-customers-topbar-actions">
          <button
            type="button"
            className="hz-customers-toolbar-btn hz-customers-toolbar-btn--primary"
            title="Yeni cari kaydÄ± ekranÄ±nÄ± aÃ§ar"
            onClick={() => router.push("/cariler/yeni")}
          >
            <IconPlusCircle size={16} />
            Yeni Cari
          </button>
          <button
            type="button"
            className="hz-customers-toolbar-btn hz-customers-toolbar-btn--outline"
            title="Veri yÃ¼kleme ve iÃ§e aktarma ayarlarÄ±"
            onClick={() => router.push("/ayarlar/veri-yukleme")}
          >
            <IconUpload size={16} />
            Ä°Ã§e Aktar
          </button>
          <button
            type="button"
            className="hz-customers-toolbar-btn hz-customers-toolbar-btn--outline"
            title={selectedCustomer && !isCustomersDemoRowId(selectedCustomerId ?? "") ? "SeÃ§ili cari iÃ§in ekstre taslaÄŸÄ±" : "Ã–nce listeden cari seÃ§in"}
            onClick={handleTopStatement}
          >
            <IconSend size={16} />
            Ekstre TaslaÄŸÄ±
          </button>
        </div>
      </header>

      <section className="hz-customers-kpi-strip" aria-label="PortfÃ¶y Ã¶zeti">
        <div className="hz-customers-kpi hz-customers-kpi--info">
          <span className="hz-customers-kpi-ico" aria-hidden>
            <IconUser size={16} />
          </span>
          <div>
            <span className="hz-customers-kpi-label">Toplam cari</span>
            <span className="hz-customers-kpi-value">{kpiDisplay.totalCustomers}</span>
          </div>
        </div>
        <div className="hz-customers-kpi hz-customers-kpi--warn">
          <span className="hz-customers-kpi-ico" aria-hidden>
            <IconWallet size={16} />
          </span>
          <div>
            <span className="hz-customers-kpi-label">AÃ§Ä±k bakiye</span>
            <span className="hz-customers-kpi-value hz-customers-kpi-value--money">
              {kpiDisplay.openBalanceTry === null ? "â€”" : formatKpiOpenBalanceTry(kpiDisplay.openBalanceTry)}
            </span>
          </div>
        </div>
        <div className="hz-customers-kpi hz-customers-kpi--danger">
          <span className="hz-customers-kpi-ico" aria-hidden>
            <IconShieldCheck size={16} />
          </span>
          <div>
            <span className="hz-customers-kpi-label">YÃ¼ksek risk</span>
            <span className="hz-customers-kpi-value">{kpiDisplay.highRiskCount}</span>
          </div>
        </div>
        <div className="hz-customers-kpi hz-customers-kpi--ok">
          <span className="hz-customers-kpi-ico" aria-hidden>
            <IconMessageCircle size={16} />
          </span>
          <div>
            <span className="hz-customers-kpi-label">WhatsApp eÅŸleÅŸmesi</span>
            <span className="hz-customers-kpi-value">{kpiDisplay.waMatchCount}</span>
          </div>
        </div>
        <div className="hz-customers-kpi hz-customers-kpi--amber">
          <span className="hz-customers-kpi-ico" aria-hidden>
            <IconBanknote size={16} />
          </span>
          <div>
            <span className="hz-customers-kpi-label">Vadesi geÃ§en</span>
            <span className="hz-customers-kpi-value">{kpiDisplay.overdueCount === null ? "â€”" : kpiDisplay.overdueCount}</span>
          </div>
        </div>
        <div className="hz-customers-kpi hz-customers-kpi--violet">
          <span className="hz-customers-kpi-ico" aria-hidden>
            <IconTag size={16} />
          </span>
          <div>
            <span className="hz-customers-kpi-label">Fiyat grubu</span>
            <span className="hz-customers-kpi-value">{kpiDisplay.priceGroupCount}</span>
          </div>
        </div>
      </section>

      <div className="hz-customers-layout">
        <section className="hz-customers-main" aria-label="Cari listesi">
          <CustomerFilterBar filters={filters} cities={cities} priceSlots={data.priceSlots} onFilterChange={updateFilter} onReset={resetFilters} />
          <div className="hz-customers-list-wrap">
            {loading ? (
              <LoadingState title="Cariler yÃ¼kleniyor" message="Hesap, fiyat ve risk Ã¶zetleri hazÄ±rlanÄ±yor." />
            ) : (
              <>
                {usingDemoFallback ? (
                  <div className="hz-customers-demo-banner" role="note">
                    Ã–nizleme verisi â€” detay ve iÅŸlemler gerÃ§ek cari kaydÄ± iÃ§in geÃ§erli deÄŸildir.
                  </div>
                ) : null}
                <CustomerTable
                  rows={pagedRows}
                  selectedCustomerId={selectedCustomerId}
                  onSelectCustomer={setSelectedCustomerId}
                  onOpenCustomer={(customerId) => {
                    if (isCustomersDemoRowId(customerId)) {
                      demoRowToast();
                      return;
                    }
                    router.push(`/cariler/${customerId}`);
                  }}
                  onQuickOperation={(customerId) => {
                    if (isCustomersDemoRowId(customerId)) {
                      demoRowToast();
                      return;
                    }
                    router.push(`/hizli-islem?customer=${customerId}`);
                  }}
                  onWhatsApp={(customerId) => {
                    if (isCustomersDemoRowId(customerId)) {
                      demoRowToast();
                      return;
                    }
                    router.push(`/whatsapp?customer=${customerId}`);
                  }}
                  emptyFiltered={emptyFiltered}
                  dataUnavailable={loadFailed && !usingDemoFallback}
                  dataUnavailableTitle={loadUnavailableTitle}
                  dataUnavailableDetail={loadUnavailableDetail}
                  onEmptyNew={emptyFiltered || loadFailed ? undefined : () => router.push("/cariler/yeni")}
                  onEmptyImport={emptyFiltered ? undefined : () => router.push("/ayarlar/veri-yukleme")}
                />
                <div className="hz-customers-pagination">
                  <Pagination totalItems={displayRows.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
                </div>
              </>
            )}
          </div>
        </section>

        <aside className="hz-customers-side">
          <CustomerQuickPreviewPanel customer={selectedCustomer} account={selectedAccount} previewRow={selectedPreviewRow} />
        </aside>
      </div>
    </main>
  );
}

