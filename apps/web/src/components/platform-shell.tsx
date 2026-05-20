"use client";

import {
  AppShell,
  Header,
  PageContent,
  Sidebar,
  ThemeToggle,
  UserMenu,
  type AppShellNavItem
} from "@hallederiz/ui";
import type { SidebarNavSection } from "@hallederiz/ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { buildProductSidebarNavSections } from "./product-sidebar-nav";
import { shouldSuppressShellPageMeta } from "../navigation/product-route-manifest";
import { useAuth } from "../providers/auth-provider";
import { useTheme } from "../providers/theme-provider";

/** Sidebar’da sayı badge’i gösterilmez (PR #31); kaynak veride olsa bile kaldırılır. */
function stripNavBadges(sections: SidebarNavSection[]): SidebarNavSection[] {
  return sections.map((section) => ({
    ...section,
    items: section.items.map(({ badge: _removed, ...rest }) => rest)
  }));
}

const NAV_SECTIONS_FOR_SHELL = stripNavBadges(buildProductSidebarNavSections());

const ALL_SHELL_NAV_ITEMS: AppShellNavItem[] = NAV_SECTIONS_FOR_SHELL.flatMap((s) => s.items);

interface PageMeta {
  title: string;
  subtitle: string;
  breadcrumb: string;
}

const PAGE_META: Array<[string, PageMeta]> = [
  ["/gorevler/", { title: "Görev Detayı", subtitle: "Görev yorumları, durum ve aksiyonları.", breadcrumb: "Görevler / Detay" }],
  ["/onaylar/kurallar", { title: "Politika Matrisi", subtitle: "Onay gerektiren aksiyonlar ve politika anahtarlarının özeti.", breadcrumb: "Onaylar / Kurallar" }],
  ["/onaylar/", { title: "Onay Detayı", subtitle: "Onay yükü, risk ve icra hazırlığı.", breadcrumb: "Onaylar / Detay" }],
  ["/workflow/", { title: "İş Akışı Zaman Çizelgesi", subtitle: "Kayıt bazlı operasyon adımları.", breadcrumb: "İş Akışı" }],
  ["/cariler/", { title: "Cari Kartı", subtitle: "Müşteri detayını finans ve operasyon bağlamıyla yönetin.", breadcrumb: "Cariler / Detay" }],
  ["/teklifler/yeni", { title: "Yeni Teklif", subtitle: "Teklif oluşturma editörü iskeleti.", breadcrumb: "Teklifler / Yeni" }],
  ["/teklifler/", { title: "Teklif Detayı", subtitle: "Teklif satırları ve takip yönetimi.", breadcrumb: "Teklifler / Detay" }],
  ["/siparisler/yeni", { title: "Yeni Sipariş", subtitle: "Sipariş oluşturma ve kaynak planı.", breadcrumb: "Siparişler / Yeni" }],
  ["/siparisler/", { title: "Sipariş Detayı", subtitle: "Satır, operasyon etkisi ve risk paneli.", breadcrumb: "Siparişler / Detay" }],
  ["/tahsilatlar/yeni", { title: "Yeni Tahsilat", subtitle: "Tahsilat ve tahsis giriş ekranı.", breadcrumb: "Tahsilatlar / Yeni" }],
  ["/tahsilatlar/", { title: "Tahsilat Detayı", subtitle: "Tahsilat doğrulama ve belge paneli.", breadcrumb: "Tahsilatlar / Detay" }],
  ["/depo/emirler/", { title: "Depo Hazırlık Fişi", subtitle: "Belge satırları, raf/lokasyon ve teslim öncesi özet.", breadcrumb: "Depo Hazırlık / Fiş" }],
  ["/teslimatlar/", { title: "Teslimat Detayı", subtitle: "Teslim satırları ve doğrulama paneli.", breadcrumb: "Teslimatlar / Detay" }],
  ["/faturalar/", { title: "Fatura Detayı", subtitle: "Fatura satırları ve belge aksiyonları.", breadcrumb: "Faturalar / Detay" }],
  ["/iadeler/yeni", { title: "Yeni İade", subtitle: "Sipariş veya teslime bağlı iade taslağı.", breadcrumb: "İadeler / Yeni" }],
  ["/iadeler/", { title: "İade Detayı", subtitle: "İade satırları, etkileri ve onay akışı.", breadcrumb: "İadeler / Detay" }],
  ["/fabrikalar/siparisler/", { title: "Fabrika Sipariş Detayı", subtitle: "Fabrika durum ve senkron paneli.", breadcrumb: "Fabrikalar / Sipariş Detay" }],
  ["/ai/onaylar", { title: "AI Onaylar", subtitle: "Taslak ve onay kayıtlarını yönetin.", breadcrumb: "AI / Onaylar" }],
  ["/ai/icgoruler", { title: "AI İçgörüler", subtitle: "AI risk ve fırsat analizlerini takip edin.", breadcrumb: "AI / İçgörüler" }],
  ["/hizli-islem", { title: "Hızlı İşlem", subtitle: "Sipariş, tahsilat, teslim ve belge işlemlerini tek akıştan başlatın.", breadcrumb: "Hızlı İşlem" }],
  ["/dashboard", { title: "Gösterge Paneli", subtitle: "", breadcrumb: "" }],
  ["/archive", { title: "Arşiv", subtitle: "Geçmiş işlemler ve belge arşivi.", breadcrumb: "Arşiv" }],
  ["/kurulum/veri-yukleme", { title: "Veri Yükleme", subtitle: "CSV tabanlı içe aktarma ile cari, ürün, fiyat ve stok yükleyin.", breadcrumb: "Kurulum / Veri Yükleme" }],
  ["/ayarlar/veri-yukleme", { title: "Veri Yükleme", subtitle: "Şablon indir, dosya yükle, önizle ve içe aktar.", breadcrumb: "Ayarlar / Veri Yükleme" }],
  ["/ayarlar/operasyon-gozlem", { title: "Operasyon ve Gözlem", subtitle: "İz kaydı, kiracı korelasyonu ve sürüm deneme özeti.", breadcrumb: "Ayarlar / Operasyon" }],
  ["/ayarlar/kullanim-hazirligi", { title: "Kullanım Hazırlığı", subtitle: "Canlı kullanım öncesi kritik eksik ve servis durumunu izleyin.", breadcrumb: "Ayarlar / Kullanım Hazırlığı" }],
  ["/", { title: "Gösterge Paneli", subtitle: "Yönlendiriliyor…", breadcrumb: "Gösterge Paneli" }],
  ["/gorevler", { title: "Görevler", subtitle: "Gösterge paneli ve iş akışı kaynaklı operasyon görevleri.", breadcrumb: "Görevler" }],
  ["/onaylar", { title: "Onaylar", subtitle: "Onay kutusu, operatör onayları ve arka plan sinyalleri.", breadcrumb: "Onaylar" }],
  ["/cariler", { title: "Cariler", subtitle: "Cari portföy, risk ve finans bağlamı.", breadcrumb: "Cariler" }],
  ["/stok", { title: "Stok", subtitle: "Ürün, depo, barkod ve fabrika görünürlüğü.", breadcrumb: "Stok" }],
  ["/teklifler", { title: "Teklifler", subtitle: "Teklif yaşam döngüsü ve dönüşüm takipleri.", breadcrumb: "Teklifler" }],
  ["/siparisler", { title: "Siparişler", subtitle: "Sipariş, kaynak planı ve operasyon etkisi.", breadcrumb: "Siparişler" }],
  ["/tahsilatlar", { title: "Tahsilatlar", subtitle: "Tahsilat kayıtları ve tahsis yönetimi.", breadcrumb: "Tahsilatlar" }],
  ["/depo", { title: "Depo Hazırlık", subtitle: "Satılan ürünlerin depo toplama ve teslim öncesi hazırlığı.", breadcrumb: "Depo Hazırlık" }],
  ["/teslimatlar", { title: "Teslimatlar", subtitle: "Teslimat planlama ve doğrulama paneli.", breadcrumb: "Teslimatlar" }],
  ["/faturalar", { title: "Faturalar", subtitle: "Fatura kayıtları ve belge bağlantıları.", breadcrumb: "Faturalar" }],
  ["/iadeler", { title: "İadeler", subtitle: "İade süreci ve neden bazlı takip.", breadcrumb: "İadeler" }],
  ["/fabrikalar", { title: "Fabrikalar", subtitle: "Fabrika stok ve sipariş görünürlüğü.", breadcrumb: "Fabrikalar" }],
  ["/erp", { title: "ERP", subtitle: "Bağlantılar, eşlemeler ve senkron paneli.", breadcrumb: "ERP" }],
  ["/whatsapp", { title: "WhatsApp", subtitle: "Kanal bazlı operasyon ve iletişim paneli.", breadcrumb: "WhatsApp" }],
  ["/gelen-kutu", { title: "Gelen Kutu", subtitle: "Çok kanallı iletişim merkezi ve konuşma kuyruğu.", breadcrumb: "Gelen Kutu" }],
  ["/gelen-kutu/konusma/", { title: "Konuşma", subtitle: "Tekil konuşma ve mesaj bağlamı.", breadcrumb: "Gelen Kutu / Konuşma" }],
  ["/ai", { title: "AI", subtitle: "Asistan, onay ve içgörü paneli.", breadcrumb: "AI" }],
  ["/belgeler", { title: "Belgeler", subtitle: "Belge üretim, dağıtım ve arşiv takibi.", breadcrumb: "Belgeler" }],
  ["/raporlar", { title: "Raporlar", subtitle: "Operasyonel metrikler ve karar destek raporları.", breadcrumb: "Raporlar" }],
  ["/kullanicilar/roller", { title: "Roller", subtitle: "Rol, izin matrisi ve onay yetkileri.", breadcrumb: "Kullanıcılar / Roller" }],
  ["/kullanicilar", { title: "Kullanıcılar", subtitle: "Kullanıcı hesapları ve erişim kapsamlarının yönetimi.", breadcrumb: "Kullanıcılar" }],
  ["/ayarlar", { title: "Ayarlar", subtitle: "Kiracı bazlı platform yapılandırması.", breadcrumb: "Ayarlar" }]
];

function resolveActiveHref(pathname: string): string {
  const p = normalizePathname(pathname);
  const items = [...ALL_SHELL_NAV_ITEMS].sort((a, b) => b.href.length - a.href.length);
  for (const item of items) {
    if (p === item.href || p.startsWith(`${item.href}/`)) {
      return item.href;
    }
  }
  return "";
}

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "") || "/";
  }
  return pathname;
}

function getPageMeta(pathname: string): PageMeta {
  const p = normalizePathname(pathname);

  for (const [prefix, meta] of PAGE_META) {
    if (prefix.endsWith("/")) {
      if (prefix === "/") {
        if (p === "/") {
          return meta;
        }
        continue;
      }
      if (p.startsWith(prefix)) {
        return meta;
      }
      continue;
    }

    if (p === prefix || p.startsWith(`${prefix}/`)) {
      return meta;
    }
  }

  return {
    title: "Modül",
    subtitle: "Bu alan için sayfa iskeleti hazırdır.",
    breadcrumb: "Modül"
  };
}

function formatDashboardDateLine(): string {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
}

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const normalizedPath = useMemo(() => normalizePathname(pathname), [pathname]);
  const pageMeta = useMemo(() => getPageMeta(pathname), [pathname]);
  const activeHref = resolveActiveHref(pathname);
  const isDashboard = normalizedPath === "/dashboard";
  const isQuickOperation = normalizedPath === "/hizli-islem";
  const isApprovalsList = normalizedPath.startsWith("/onaylar");
  const isWhatsApp = normalizedPath === "/whatsapp" || normalizedPath === "/gelen-kutu/whatsapp";
  const isGelenKutuUnified = normalizedPath === "/gelen-kutu" || normalizedPath.startsWith("/gelen-kutu/konusma/");
  const isCustomersList = normalizedPath === "/cariler";
  const isStockList = normalizedPath === "/stok";
  const isOrdersList = normalizedPath === "/siparisler";
  const isOffersList = normalizedPath === "/teklifler";
  const isPaymentsList = normalizedPath === "/tahsilatlar";
  const isDeliveriesList = normalizedPath === "/teslimatlar";
  const isReturnsList = normalizedPath === "/iadeler";
  const isInvoicesList = normalizedPath === "/faturalar";
  const isArchiveList = normalizedPath === "/archive";
  const isReportsList = normalizedPath === "/raporlar";
  const isSettingsArea = normalizedPath === "/ayarlar" || normalizedPath.startsWith("/ayarlar/");
  const isWarehousePrep = normalizedPath === "/depo" || normalizedPath.startsWith("/depo/");
  const isTasksWorkspace = normalizedPath === "/gorevler" || normalizedPath.startsWith("/gorevler/");
  const isAiWorkspace = normalizedPath === "/ai" || normalizedPath.startsWith("/ai/");
  const isDocumentsWorkspace = normalizedPath === "/belgeler" || normalizedPath.startsWith("/belgeler/");
  const isFabrikalarList =
    normalizedPath === "/fabrikalar/stoklar" || normalizedPath === "/fabrikalar/siparisler";
  const isFabrikalarEntityDetail =
    normalizedPath.startsWith("/fabrikalar/siparisler/") && normalizedPath !== "/fabrikalar/siparisler";
  const isCustomersEntityDetail =
    normalizedPath.startsWith("/cariler/") && normalizedPath !== "/cariler/yeni" && normalizedPath !== "/cariler/liste";
  const isOrdersEntityDetail =
    normalizedPath.startsWith("/siparisler/") && normalizedPath !== "/siparisler/yeni" && normalizedPath !== "/siparisler/liste";
  const isOffersEntityDetail =
    normalizedPath.startsWith("/teklifler/") && normalizedPath !== "/teklifler/yeni" && normalizedPath !== "/teklifler/liste";
  const isPaymentsEntityDetail =
    normalizedPath.startsWith("/tahsilatlar/") &&
    normalizedPath !== "/tahsilatlar/yeni" &&
    normalizedPath !== "/tahsilatlar/liste";
  const isDeliveriesEntityDetail =
    normalizedPath.startsWith("/teslimatlar/") &&
    normalizedPath !== "/teslimatlar/yeni" &&
    normalizedPath !== "/teslimatlar/liste" &&
    normalizedPath !== "/teslimatlar/rota";
  const isReturnsEntityDetail =
    normalizedPath.startsWith("/iadeler/") && normalizedPath !== "/iadeler/yeni" && normalizedPath !== "/iadeler/liste";
  const isInvoicesEntityDetail =
    normalizedPath.startsWith("/faturalar/") &&
    normalizedPath !== "/faturalar/yeni" &&
    normalizedPath !== "/faturalar/liste";
  const isEntityFormNew =
    normalizedPath === "/cariler/yeni" ||
    normalizedPath === "/siparisler/yeni" ||
    normalizedPath === "/teklifler/yeni" ||
    normalizedPath === "/tahsilatlar/yeni";

  const dashboardGreeting = useMemo(() => {
    const display = session?.user.fullName?.trim() || "Ahmet Yılmaz";
    return (
      <div className="hz-header-greeting">
        <p className="hz-header-greeting-line">Günaydın, {display}</p>
        <p className="hz-header-greeting-date">{formatDashboardDateLine()}</p>
      </div>
    );
  }, [session?.user.fullName]);

  return (
    <AppShell
      mobileSidebarOpen={mobileSidebarOpen}
      onMobileSidebarOpenChange={setMobileSidebarOpen}
      sidebar={
        <Sidebar
          logoMarkLabel="LOGO ALANI"
          appTitle="HallederizCRM Premium"
          navSections={NAV_SECTIONS_FOR_SHELL}
          activeHref={activeHref}
          companyCard={{ name: "Hallederiz A.Ş.", branch: "Merkez", status: "Çevrimiçi" }}
          onNavigate={(href) => router.push(href)}
        />
      }
      header={
        <Header
          layout={isDashboard ? "dashboard" : "default"}
          suppressPageMeta={
            isQuickOperation ||
            isApprovalsList ||
            isWhatsApp ||
            isGelenKutuUnified ||
            isCustomersList ||
            isStockList ||
            isOrdersList ||
            isOffersList ||
            isPaymentsList ||
            isDeliveriesList ||
            isReturnsList ||
            isInvoicesList ||
            isArchiveList ||
            isReportsList ||
            isSettingsArea ||
            isWarehousePrep ||
            isTasksWorkspace ||
            isAiWorkspace ||
            isDocumentsWorkspace ||
            isFabrikalarList ||
            isFabrikalarEntityDetail ||
            isCustomersEntityDetail ||
            isOrdersEntityDetail ||
            isOffersEntityDetail ||
            isPaymentsEntityDetail ||
            isDeliveriesEntityDetail ||
            isReturnsEntityDetail ||
            isInvoicesEntityDetail ||
            isEntityFormNew ||
            shouldSuppressShellPageMeta(normalizedPath)
          }
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          breadcrumb={pageMeta.breadcrumb}
          leadingSlot={isDashboard ? dashboardGreeting : undefined}
          searchPlaceholder={
            isDashboard
              ? "Ara (Cari, Sipariş, Ürün, Belge...)"
              : isTasksWorkspace
                ? "Görev no, başlık, atanan, müşteri veya kayıt ara..."
                : isAiWorkspace
                  ? "AI: taslak no, onay no, oturum, içgörü veya müşteri ara..."
                    : isDocumentsWorkspace
                    ? "Belge no, cari, entity, tip veya gönderim durumu ara..."
                    : isFabrikalarList
                      ? normalizedPath === "/fabrikalar/stoklar"
                        ? "Ürün kodu, fabrika, marka veya senkron durumu ara..."
                        : "Fabrika sipariş no, satış siparişi veya durum ara..."
                      : isFabrikalarEntityDetail
                        ? "Fabrika sipariş detayı: satır, log veya durum ara..."
                        : isApprovalsList
                      ? "Cari, onay no, belge no, tutar ara..."
                      : isWhatsApp
                        ? "Cari, telefon, mesaj, belge no veya tutar ara..."
                        : isGelenKutuUnified
                    ? "Konuşma no, kanal, müşteri, telefon veya durum ara..."
                    : isCustomersList
                    ? "Cari, telefon, vergi no, şehir veya bakiye ara..."
                    : isStockList
                      ? "Ürün kodu, barkod, marka, depo, raf veya fiyat ara..."
                      : isOrdersList
                        ? "Sipariş no, müşteri, kanal, ödeme veya teslimat durumu ara..."
                        : isOffersList
                          ? "Teklif no, müşteri, durum, fiyat grubu veya geçerlilik ara..."
                          : isPaymentsList
                            ? "Fiş no, müşteri, tutar, yöntem veya belge bağlantısı ara..."
                            : isDeliveriesList
                              ? "Teslimat no, müşteri, sipariş, durum veya belge ara..."
                              : isReturnsList
                                ? "İade no, müşteri, sipariş, teslimat veya durum ara..."
                                : isInvoicesList
                                  ? "Fatura no, müşteri, sipariş, tutar veya durum ara..."
                                  : isWarehousePrep
                              ? "Belge no, cari, ürün, raf veya depo görevlisi ara..."
                              : isArchiveList
                                ? "Belge no, cari, işlem, tarih, kullanıcı veya etiket ara..."
                                : isReportsList
                                  ? "Rapor, cari, belge, tarih, metrik veya kullanıcı ara..."
                                  : isSettingsArea
                                    ? "Ayar, kullanıcı, bağlantı, depo, fiyat veya belge ara..."
                                    : isCustomersEntityDetail
                                      ? "Cari kartı: iletişim, hesap, teklif veya ekstre notu ara..."
                                      : isOrdersEntityDetail
                                        ? "Sipariş detayı: satır, belge no veya referans ara..."
                                        : isOffersEntityDetail
                                          ? "Teklif detayı: satır, follow-up veya belge ara..."
                                          : isPaymentsEntityDetail
                                            ? "Tahsilat detayı: fiş, allocation veya belge ara..."
                                            : isDeliveriesEntityDetail
                                              ? "Teslimat detayı: satır, doğrulama veya belge ara..."
                                              : isReturnsEntityDetail
                                                ? "İade detayı: satır, sebep veya etki ara..."
                                                : isInvoicesEntityDetail
                                                  ? "Fatura detayı: satır, kesim veya belge ara..."
                                                  : isEntityFormNew
                                              ? "Yeni kayıt: müşteri, belge no, tutar veya referans ara..."
                                              : "Cari, sipariş, ürün kodu veya barkod ara"
          }
          toolbarSlot={
            isDashboard ? (
              <button
                type="button"
                className="hz-header-quick-primary"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("dashboard:open-card-editor"));
                }}
              >
                Kartları Düzenle
              </button>
            ) : null
          }
          notificationSlot={
            <>
              <button type="button" className="hz-header-icon-button hz-header-icon-button--ghost" aria-label="Bildirimler">
                <span className="hz-header-bell" aria-hidden />
                <span className="hz-sr-only">Bildirimler</span>
              </button>
              <button
                type="button"
                className="hz-header-icon-button hz-header-icon-button--ghost"
                aria-label="WhatsApp"
                onClick={() => router.push("/whatsapp")}
              >
                <span className="hz-header-wa" aria-hidden />
                <span className="hz-sr-only">WhatsApp</span>
              </button>
            </>
          }
          themeSlot={<ThemeToggle mode={theme} onToggle={toggleTheme} compact={isDashboard} />}
          userSlot={
            <UserMenu
              fullName={session?.user.fullName ?? "Bilinmeyen Kullanıcı"}
              roleLabel={session?.roles[0]?.name ?? "Rol tanımsız"}
              onLogout={logout}
            />
          }
        />
      }
    >
      <PageContent>{children}</PageContent>
    </AppShell>
  );
}
