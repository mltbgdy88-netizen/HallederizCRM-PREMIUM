"use client";

import { EntityListPageTemplate, LoadingState, Pagination } from "@hallederiz/ui";
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
  const { loading, data, filteredCustomers, rows } = useCustomersData(filters);
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
    return {
      totalCustomers: data.customers.length,
      openBalanceTry: data.accounts.reduce((total, account) => total + Math.max(account.balance, 0), 0),
      highRiskCount: data.customers.filter((c) => c.riskLevel === "high" || c.riskLevel === "blocked").length,
      waMatchCount: data.customers.filter((c) => c.whatsappMatched).length,
      overdueCount: data.accounts.filter((a) => a.overdueAmount > 0).length,
      priceGroupCount: data.priceSlots.filter((s) => s.active).length
    };
  }, [usingDemoFallback, displayRows, data.customers, data.accounts, data.priceSlots]);

  /** KPI “Açık bakiye”: tam TRY gösterimi (₺294.050), liste ile tutarlı. */
  const formatKpiOpenBalanceTry = (value: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);

  const demoRowToast = useCallback(() => {
    pushToast("Bu kayıt önizleme verisidir; gerçek cari kaydı değildir.");
  }, [pushToast]);

  const handleTopStatement = useCallback(() => {
    if (!selectedCustomerId) {
      pushToast("Ekstre taslağı için önce listeden bir cari seçin.");
      return;
    }
    if (isCustomersDemoRowId(selectedCustomerId)) {
      pushToast("Önizleme kaydı: ekstre taslağı oluşturulmaz veya yönlendirilmez.");
      return;
    }
    const customer =
      data.customers.find((c) => c.id === selectedCustomerId) ??
      filteredCustomers.find((c) => c.id === selectedCustomerId) ??
      null;
    if (!customer) {
      pushToast("Ekstre taslağı için önce listeden bir cari seçin.");
      return;
    }
    router.push(`/belgeler?customer=${customer.id}&type=statement_pdf`);
  }, [data.customers, filteredCustomers, pushToast, router, selectedCustomerId]);

  const emptyFiltered = !usingDemoFallback && !loading && data.customers.length > 0 && rows.length === 0;

  return (
    <EntityListPageTemplate
      className="hz-customers-page"
      header={
        <>
          <header className="hz-customers-topbar">
            <div className="hz-customers-topbar-text">
              <h1 className="hz-customers-topbar-title">Cari Portföyü</h1>
              <p className="hz-customers-topbar-sub">Risk, bakiye, fiyat grubu ve WhatsApp eşleşmelerini tek ekranda yönetin.</p>
            </div>
            <div className="hz-customers-topbar-actions">
              <button
                type="button"
                className="hz-customers-toolbar-btn hz-customers-toolbar-btn--primary"
                title="Yeni cari kaydı ekranını açar"
                onClick={() => router.push("/cariler/yeni")}
              >
                <IconPlusCircle size={16} />
                Yeni Cari
              </button>
              <button
                type="button"
                className="hz-customers-toolbar-btn hz-customers-toolbar-btn--outline"
                title="Veri yükleme ve içe aktarma ayarları"
                onClick={() => router.push("/ayarlar/veri-yukleme")}
              >
                <IconUpload size={16} />
                İçe Aktar
              </button>
              <button
                type="button"
                className="hz-customers-toolbar-btn hz-customers-toolbar-btn--outline"
                title={selectedCustomer && !isCustomersDemoRowId(selectedCustomerId ?? "") ? "Seçili cari için ekstre taslağı" : "Önce listeden cari seçin"}
                onClick={handleTopStatement}
              >
                <IconSend size={16} />
                Ekstre Taslağı
              </button>
            </div>
          </header>

          <div className="hz-customers-kpi-strip" aria-label="Portföy özeti">
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
                <span className="hz-customers-kpi-label">Açık bakiye</span>
                <span className="hz-customers-kpi-value hz-customers-kpi-value--money">{formatKpiOpenBalanceTry(kpiDisplay.openBalanceTry)}</span>
              </div>
            </div>
            <div className="hz-customers-kpi hz-customers-kpi--danger">
              <span className="hz-customers-kpi-ico" aria-hidden>
                <IconShieldCheck size={16} />
              </span>
              <div>
                <span className="hz-customers-kpi-label">Yüksek risk</span>
                <span className="hz-customers-kpi-value">{kpiDisplay.highRiskCount}</span>
              </div>
            </div>
            <div className="hz-customers-kpi hz-customers-kpi--ok">
              <span className="hz-customers-kpi-ico" aria-hidden>
                <IconMessageCircle size={16} />
              </span>
              <div>
                <span className="hz-customers-kpi-label">WhatsApp eşleşmesi</span>
                <span className="hz-customers-kpi-value">{kpiDisplay.waMatchCount}</span>
              </div>
            </div>
            <div className="hz-customers-kpi hz-customers-kpi--amber">
              <span className="hz-customers-kpi-ico" aria-hidden>
                <IconBanknote size={16} />
              </span>
              <div>
                <span className="hz-customers-kpi-label">Vadesi geçen</span>
                <span className="hz-customers-kpi-value">{kpiDisplay.overdueCount}</span>
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
          </div>
        </>
      }
      filters={<CustomerFilterBar filters={filters} cities={cities} priceSlots={data.priceSlots} onFilterChange={updateFilter} onReset={resetFilters} />}
      list={
        <div className="hz-customers-list-wrap">
          {loading ? (
            <LoadingState title="Cariler yükleniyor" message="Hesap, fiyat ve risk özetleri hazırlanıyor." />
          ) : (
            <>
              {usingDemoFallback ? (
                <div className="hz-customers-demo-banner" role="note">
                  Önizleme verisi — detay ve işlemler gerçek cari kaydı için geçerli değildir.
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
                onEmptyNew={emptyFiltered ? undefined : () => router.push("/cariler/yeni")}
                onEmptyImport={emptyFiltered ? undefined : () => router.push("/ayarlar/veri-yukleme")}
              />
              <div className="hz-customers-pagination">
                <Pagination totalItems={displayRows.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      }
      preview={
        <aside className="hz-customers-side">
          <CustomerQuickPreviewPanel customer={selectedCustomer} account={selectedAccount} previewRow={selectedPreviewRow} />
        </aside>
      }
    />
  );
}
