"use client";

import type { CustomerBalanceState, CustomerRiskLevel } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useToast } from "../../../providers/toast-provider";
import { isCustomersDemoRowId } from "../data/customers-demo-rows";
import { useCustomersPortfolioDeskState } from "../hooks/use-customers-portfolio-desk-state";
import type { ComReferenceTableRow } from "../utils/map-customer-to-reference-desk";
import { riskBadgeClass, statusBadgeClass } from "../utils/map-customer-to-reference-desk";
import {
  ComKpiIconSvg,
  ComQuickActionIcon,
  IconAlert,
  IconChevron,
  IconClose,
  IconExport,
  IconInfo,
  IconPin,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconZap
} from "./customers-reference-icons";

const PAGE_COPY = {
  title: "Cariler Operasyon Masası",
  subtitle: "Müşteri hesabı, bakiye ve risk yönetimi ve operasyon ekranı.",
  searchPlaceholder: "Cari ara (kod, unvan, vergi no...)",
  demoBanner: "Demo Verisi: Bu ekran demo amaçlıdır. Gerçek veriler farklılık gösterebilir."
} as const;

function CustomerTableRow({
  row,
  selected,
  onSelect,
  onDetail,
  onCollection,
  onStatement
}: {
  row: ComReferenceTableRow;
  selected: boolean;
  onSelect: () => void;
  onDetail: () => void;
  onCollection: () => void;
  onStatement: () => void;
}) {
  return (
    <tr className={selected ? "com-row com-row--selected" : "com-row"} onClick={onSelect}>
      <td className="com-cell-code">{row.code}</td>
      <td className="com-cell-customer">{row.customer}</td>
      <td>{row.city}</td>
      <td className="com-cell-balance">{row.balance}</td>
      <td>
        <span className={riskBadgeClass(row.risk)}>{row.risk}</span>
      </td>
      <td className="com-cell-actions" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="com-row-link" onClick={onDetail}>
          Detay
        </button>
        <button type="button" onClick={onCollection}>
          Tahsilat
        </button>
        <button type="button" onClick={onStatement}>
          Ekstre
        </button>
      </td>
    </tr>
  );
}

export function CustomersReferenceLayout() {
  const router = useRouter();
  const { pushToast } = useToast();
  const desk = useCustomersPortfolioDeskState();

  const demoRowToast = useCallback(() => {
    pushToast("Bu kayıt önizleme verisidir; gerçek cari kaydı değildir.");
  }, [pushToast]);

  const guardDemo = useCallback(
    (customerId: string | null, action: () => void) => {
      if (customerId && isCustomersDemoRowId(customerId)) {
        demoRowToast();
        return;
      }
      action();
    },
    [demoRowToast]
  );

  const openDetail = (customerId: string) => {
    guardDemo(customerId, () => router.push(`/cariler/${customerId}`));
  };

  const openCollection = (customerId: string) => {
    guardDemo(customerId, () => router.push(`/hizli-islem/satis-masasi?tab=payment&customer=${customerId}`));
  };

  const openStatement = (customerId: string) => {
    guardDemo(customerId, () => router.push(`/belgeler?customer=${customerId}&type=statement_pdf`));
  };

  const handleTopStatement = () => {
    if (!desk.selectedCustomerId) {
      pushToast("Ekstre taslağı için önce listeden bir cari seçin.");
      return;
    }
    openStatement(desk.selectedCustomerId);
  };

  const handleQuickAction = (actionId: string) => {
    const id = desk.selectedCustomerId;
    if (!id) {
      pushToast("İşlem için önce listeden bir cari seçin.");
      return;
    }
    if (actionId === "collection") {
      openCollection(id);
      return;
    }
    if (actionId === "statement") {
      openStatement(id);
      return;
    }
    if (actionId === "detail") {
      openDetail(id);
      return;
    }
    if (actionId === "payment" || actionId === "open-items") {
      guardDemo(id, () => pushToast("Bu işlem henüz canlıya bağlı değil; onay zinciri gerekir."));
      return;
    }
    pushToast("İşlem henüz canlıya bağlı değil.");
  };

  return (
    <div className="com-home com-home--embedded" data-page="cariler-reference-desk" aria-live="polite">
      <header className="com-head">
        <div className="com-head-text">
          <h1>{PAGE_COPY.title}</h1>
          <p>{PAGE_COPY.subtitle}</p>
        </div>
        <div className="com-head-actions">
          <button type="button" className="com-btn com-btn--primary" onClick={() => router.push("/cariler/yeni")}>
            <IconPlus className="com-btn-icon" />
            Yeni Cari
          </button>
          <button
            type="button"
            className="com-btn com-btn--outline"
            onClick={() => {
              if (desk.selectedCustomerId && !desk.isSelectedDemo) {
                router.push(`/hizli-islem/satis-masasi?tab=order&customer=${desk.selectedCustomerId}`);
                return;
              }
              if (desk.isSelectedDemo) {
                demoRowToast();
                return;
              }
              router.push("/hizli-islem/satis-masasi");
            }}
          >
            <IconZap className="com-btn-icon" />
            Hızlı İşlem
          </button>
          <button type="button" className="com-btn com-btn--outline" onClick={handleTopStatement}>
            <IconExport className="com-btn-icon" />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="com-kpi-row" aria-label="Cari özetleri">
        {desk.kpis.map((kpi) => (
          <article key={kpi.id} className={`com-kpi-card com-kpi-card--${kpi.tone}`}>
            <div className={`com-kpi-icon com-kpi-icon--${kpi.tone}`}>
              <ComKpiIconSvg icon={kpi.icon} />
            </div>
            <div className="com-kpi-body">
              <span className="com-kpi-value">{kpi.value}</span>
              <span className="com-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="com-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="com-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      {desk.showDemoBanner ? (
        <p className="com-mode-band" role="status">
          {PAGE_COPY.demoBanner}
        </p>
      ) : desk.loadFailed && !desk.usingDemoFallback ? (
        <p className="com-mode-band com-mode-band--error" role="alert">
          {desk.loadUnavailableTitle}: {desk.loadUnavailableDetail}
        </p>
      ) : !desk.usingDemoFallback && !desk.loading && desk.displayRowsCount > 0 ? (
        <p className="com-mode-band com-mode-band--live" role="status">
          Canlı portföy verisi yüklendi.
        </p>
      ) : null}

      <div className="com-workspace">
        <section className="com-main" aria-label="Cari listesi">
          <div className="com-filters">
            <label className="com-filter-search">
              <IconSearch className="com-filter-search-icon" />
              <input
                type="search"
                value={desk.filters.searchText}
                onChange={(event) => desk.updateFilter("searchText", event.target.value)}
                placeholder={PAGE_COPY.searchPlaceholder}
                aria-label="Cari ara"
              />
            </label>
            <label className="com-filter-field">
              <span>Şehir</span>
              <select
                value={desk.filters.city}
                onChange={(event) => desk.updateFilter("city", event.target.value)}
                aria-label="Şehir"
              >
                <option value="">Tümü</option>
                {desk.cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="com-filter-field">
              <span>Risk</span>
              <select
                value={desk.filters.riskLevel}
                onChange={(event) => desk.updateFilter("riskLevel", event.target.value as CustomerRiskLevel | "")}
                aria-label="Risk"
              >
                <option value="">Tümü</option>
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
                <option value="blocked">Blokeli</option>
              </select>
            </label>
            <label className="com-filter-field">
              <span>Bakiye</span>
              <select
                value={desk.filters.balanceState}
                onChange={(event) => desk.updateFilter("balanceState", event.target.value as CustomerBalanceState)}
                aria-label="Bakiye"
              >
                <option value="all">Tümü</option>
                <option value="open_balance">Açık bakiye</option>
                <option value="credit">Alacak</option>
                <option value="zero">Sıfır</option>
              </select>
            </label>
            <button
              type="button"
              className="com-filter-reset"
              title="Filtreleri sıfırla"
              aria-label="Filtreleri sıfırla"
              onClick={() => {
                desk.resetAllFilters();
                pushToast("Filtreler sıfırlandı.");
              }}
            >
              <IconRefresh className="com-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          {desk.showDemoBanner ? (
            <div className="com-demo-banner" role="note">
              <span>Önizleme verisi — detay ve işlemler gerçek cari kaydı için geçerli değildir.</span>
              <button type="button" className="com-demo-close" aria-label="Bildirimi kapat" onClick={desk.dismissDemoBanner}>
                <IconClose />
              </button>
            </div>
          ) : null}

          <div className="com-table-panel">
            {desk.loading ? (
              <div className="com-state">Cariler yükleniyor…</div>
            ) : (
              <>
                <div className="com-table-wrap">
                  <table className="com-table">
                    <thead>
                      <tr>
                        <th>Cari Kodu</th>
                        <th>Müşteri</th>
                        <th>Şehir</th>
                        <th>Bakiye</th>
                        <th>Risk</th>
                        <th>Aksiyon</th>
                      </tr>
                    </thead>
                    <tbody>
                      {desk.tableRows.map((row) => (
                        <CustomerTableRow
                          key={row.id}
                          row={row}
                          selected={desk.selectedCustomerId === row.id}
                          onSelect={() => desk.setSelectedCustomerId(row.id)}
                          onDetail={() => openDetail(row.id)}
                          onCollection={() => openCollection(row.id)}
                          onStatement={() => openStatement(row.id)}
                        />
                      ))}
                      {desk.tableRows.length === 0 ? (
                        <tr>
                          <td colSpan={6}>
                            <div className="com-state com-state--empty">
                              {desk.emptyFiltered
                                ? "Filtrelere uygun cari bulunamadı."
                                : desk.loadFailed
                                  ? "Cari listesi yüklenemedi."
                                  : "Kayıt bulunamadı."}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>

                <footer className="com-table-foot">
                  <span>{desk.tableTotalLabel}</span>
                  <div className="com-pagination">
                    <span className="com-page-label">{desk.paginationLabel}</span>
                    <div className="com-page-nums" aria-label="Sayfalama">
                      <button
                        type="button"
                        className="com-page-btn"
                        aria-label="Önceki"
                        disabled={desk.page <= 1}
                        onClick={() => desk.setPage((current) => Math.max(1, current - 1))}
                      >
                        ‹
                      </button>
                      <button type="button" className="com-page-btn com-page-btn--active">
                        {desk.page}
                      </button>
                      <button
                        type="button"
                        className="com-page-btn"
                        aria-label="Sonraki"
                        disabled={desk.page >= desk.totalPages}
                        onClick={() => desk.setPage((current) => Math.min(desk.totalPages, current + 1))}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </footer>
              </>
            )}
          </div>
        </section>

        <aside className="com-context" aria-label="Cari bağlamı">
          {!desk.contextPanel ? (
            <div className="com-context-empty">Tablodan bir cari seçildiğinde bağlam, uyarı ve hızlı işlemler görünür.</div>
          ) : (
            <>
              <header className="com-context-head">
                <h2>
                  <IconPin className="com-context-pin" />
                  Cari Bağlamı
                </h2>
                <button
                  type="button"
                  className="com-context-expand"
                  aria-label="Cari detayına git"
                  onClick={() => openDetail(desk.contextPanel!.rowId)}
                >
                  <IconChevron />
                </button>
              </header>

              <div className="com-context-hero">
                <div>
                  <span className="com-context-code">{desk.contextPanel.code}</span>
                  <h3>{desk.contextPanel.name}</h3>
                  <span className={statusBadgeClass(desk.contextPanel.status)}>{desk.contextPanel.status}</span>
                </div>
              </div>

              <dl className="com-context-dl">
                <div>
                  <dt>Vergi No</dt>
                  <dd>{desk.contextPanel.taxNo}</dd>
                </div>
                <div>
                  <dt>Vergi Dairesi</dt>
                  <dd>{desk.contextPanel.taxOffice}</dd>
                </div>
                <div>
                  <dt>Şehir</dt>
                  <dd>{desk.contextPanel.city}</dd>
                </div>
                <div>
                  <dt>Grup</dt>
                  <dd>{desk.contextPanel.group}</dd>
                </div>
                <div>
                  <dt>Cari Tipi</dt>
                  <dd>{desk.contextPanel.accountType}</dd>
                </div>
                <div>
                  <dt>Açılış Tarihi</dt>
                  <dd>{desk.contextPanel.openedAt}</dd>
                </div>
                <div>
                  <dt>Kredi Limiti</dt>
                  <dd>{desk.contextPanel.creditLimit}</dd>
                </div>
                <div>
                  <dt>Kalan Limit</dt>
                  <dd>{desk.contextPanel.remainingLimit}</dd>
                </div>
              </dl>

              <article className="com-notice com-notice--warn">
                <IconAlert className="com-notice-icon" />
                <div>
                  <strong>{desk.contextPanel.financeWarningTitle}</strong>
                  <p>{desk.contextPanel.financeWarningDetail}</p>
                </div>
              </article>

              <article className="com-context-card">
                <h4>Hızlı İşlemler</h4>
                <ul className="com-quick-list">
                  {desk.contextPanel.quickActions.map((action) => (
                    <li key={action.id}>
                      <button type="button" onClick={() => handleQuickAction(action.id)}>
                        <ComQuickActionIcon id={action.id} />
                        <span>{action.label}</span>
                        <IconChevron className="com-quick-chevron" />
                      </button>
                    </li>
                  ))}
                </ul>
              </article>

              <footer className="com-context-actions">
                <button
                  type="button"
                  className="com-btn com-btn--primary com-btn--block"
                  onClick={() => openDetail(desk.contextPanel!.rowId)}
                >
                  Cari Hareketleri Görüntüle
                </button>
                <button
                  type="button"
                  className="com-btn com-btn--outline com-btn--block"
                  onClick={() => handleQuickAction("payment")}
                >
                  Cari Limit Düzenle
                </button>
              </footer>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
