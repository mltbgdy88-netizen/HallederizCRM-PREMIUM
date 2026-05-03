"use client";

import {
  AppShell,
  Header,
  Sidebar,
  ThemeToggle,
  UserMenu,
  type AppShellNavItem
} from "@hallederiz/ui";
import type { SidebarNavSection } from "@hallederiz/ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CRMIcon } from "./icons";
import { useAuth } from "../providers/auth-provider";
import { useTheme } from "../providers/theme-provider";

const NAV_SECTIONS: SidebarNavSection[] = [
  {
    title: "ANA",
    items: [
      { key: "dashboard", label: "Gösterge Paneli", href: "/dashboard", icon: <CRMIcon name="dashboard" /> },
      { key: "quick-operations", label: "Hızlı İşlem", href: "/hizli-islem", icon: <CRMIcon name="orders" /> },
      { key: "approvals", label: "Onaylar", href: "/onaylar", icon: <CRMIcon name="roles" />, badge: "7" },
      { key: "whatsapp", label: "WhatsApp", href: "/whatsapp", icon: <CRMIcon name="whatsapp" />, badge: "12" }
    ]
  },
  {
    title: "VERİ",
    items: [
      { key: "customers", label: "Cariler", href: "/cariler", icon: <CRMIcon name="customers" /> },
      { key: "stock", label: "Ürün / Stok", href: "/stok", icon: <CRMIcon name="stock" /> },
      { key: "archive", label: "Arşiv", href: "/archive", icon: <CRMIcon name="documents" /> }
    ]
  },
  {
    title: "ANALİZ",
    items: [{ key: "reports", label: "Raporlar", href: "/raporlar", icon: <CRMIcon name="reports" /> }]
  },
  {
    title: "SİSTEM",
    items: [{ key: "settings", label: "Ayarlar", href: "/ayarlar", icon: <CRMIcon name="settings" /> }]
  }
];

const ALL_SHELL_NAV_ITEMS: AppShellNavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

interface PageMeta {
  title: string;
  subtitle: string;
  breadcrumb: string;
}

const PAGE_META: Array<[string, PageMeta]> = [
  ["/gorevler/", { title: "Gorev Detayi", subtitle: "Gorev yorumlari, durum ve aksiyonlari.", breadcrumb: "Gorevler / Detay" }],
  ["/onaylar/", { title: "Onay Detayi", subtitle: "Approval payload, risk ve icra hazirligi.", breadcrumb: "Onaylar / Detay" }],
  ["/workflow/", { title: "Workflow Timeline", subtitle: "Entity bazli operasyon adimlari.", breadcrumb: "Workflow" }],
  ["/cariler/", { title: "Cari Karti", subtitle: "Musteri detayini finans ve operasyon baglamiyla yonetin.", breadcrumb: "Cariler / Detay" }],
  ["/teklifler/yeni", { title: "Yeni Teklif", subtitle: "Teklif olusturma editoru iskeleti.", breadcrumb: "Teklifler / Yeni" }],
  ["/teklifler/", { title: "Teklif Detayi", subtitle: "Teklif satirlari ve follow-up yonetimi.", breadcrumb: "Teklifler / Detay" }],
  ["/siparisler/yeni", { title: "Yeni Siparis", subtitle: "Siparis olusturma ve kaynak plani.", breadcrumb: "Siparisler / Yeni" }],
  ["/siparisler/", { title: "Siparis Detayi", subtitle: "Satir, operasyon etkisi ve risk paneli.", breadcrumb: "Siparisler / Detay" }],
  ["/tahsilatlar/yeni", { title: "Yeni Tahsilat", subtitle: "Tahsilat ve allocation giris ekrani.", breadcrumb: "Tahsilatlar / Yeni" }],
  ["/tahsilatlar/", { title: "Tahsilat Detayi", subtitle: "Tahsilat dogrulama ve belge paneli.", breadcrumb: "Tahsilatlar / Detay" }],
  ["/depo/emirler/", { title: "Depo Emir Detayi", subtitle: "Toplama akisi ve operasyon aksiyonlari.", breadcrumb: "Depo / Emir Detay" }],
  ["/teslimatlar/", { title: "Teslimat Detayi", subtitle: "Teslim satirlari ve dogrulama paneli.", breadcrumb: "Teslimatlar / Detay" }],
  ["/faturalar/", { title: "Fatura Detayi", subtitle: "Fatura satirlari ve belge aksiyonlari.", breadcrumb: "Faturalar / Detay" }],
  ["/iadeler/yeni", { title: "Yeni Iade", subtitle: "Siparis veya teslim baglantili iade taslagi.", breadcrumb: "Iadeler / Yeni" }],
  ["/iadeler/", { title: "Iade Detayi", subtitle: "Iade satirlari, etkileri ve onay akisi.", breadcrumb: "Iadeler / Detay" }],
  ["/fabrikalar/siparisler/", { title: "Fabrika Siparis Detayi", subtitle: "Fabrika durum ve senkron paneli.", breadcrumb: "Fabrikalar / Siparis Detay" }],
  ["/ai/onaylar", { title: "AI Onaylar", subtitle: "Proposal ve approval kayitlarini yonetin.", breadcrumb: "AI / Onaylar" }],
  ["/ai/icgoruler", { title: "AI Icgoruler", subtitle: "AI risk/firsat analizlerini takip edin.", breadcrumb: "AI / Icgoruler" }],
  ["/hizli-islem", { title: "Hızlı İşlem", subtitle: "Sipariş, tahsilat, fiyat ve belge işlemlerini hızlıca hazırlayın.", breadcrumb: "Hızlı İşlem" }],
  ["/dashboard", { title: "Gösterge Paneli", subtitle: "", breadcrumb: "" }],
  ["/archive", { title: "Arşiv", subtitle: "Geçmiş işlemler ve belge arşivi (yer tutucu).", breadcrumb: "Arşiv" }],
  ["/kurulum/veri-yukleme", { title: "Veri Yukleme", subtitle: "CSV tabanli import merkezi ile cari, urun, fiyat ve stok yukleyin.", breadcrumb: "Kurulum / Veri Yukleme" }],
  ["/ayarlar/veri-yukleme", { title: "Veri Yukleme", subtitle: "Template indir, dosya yukle, onizle ve ice aktar.", breadcrumb: "Ayarlar / Veri Yukleme" }],
  ["/ayarlar/kullanim-hazirligi", { title: "Kullanim Hazirligi", subtitle: "Canli kullanim oncesi kritik eksik ve servis durumunu izleyin.", breadcrumb: "Ayarlar / Kullanim Hazirligi" }],
  ["/", { title: "Gösterge Paneli", subtitle: "Yönlendiriliyor…", breadcrumb: "Gösterge Paneli" }],
  ["/gorevler", { title: "Gorevler", subtitle: "Workflow ve dashboard kaynakli operasyon gorevleri.", breadcrumb: "Gorevler" }],
  ["/onaylar", { title: "Onaylar", subtitle: "Insan onayli operasyon ve AI proposal karar merkezi.", breadcrumb: "Onaylar" }],
  ["/cariler", { title: "Cariler", subtitle: "Cari portfoyu, risk ve finans baglami.", breadcrumb: "Cariler" }],
  ["/stok", { title: "Stok", subtitle: "Urun, depo, barkod ve fabrika gorunurlugu.", breadcrumb: "Stok" }],
  ["/teklifler", { title: "Teklifler", subtitle: "Teklif yasam dongusu ve donusum takipleri.", breadcrumb: "Teklifler" }],
  ["/siparisler", { title: "Siparisler", subtitle: "Siparis, kaynak plani ve operasyon etkisi.", breadcrumb: "Siparisler" }],
  ["/tahsilatlar", { title: "Tahsilatlar", subtitle: "Tahsilat kayitlari ve allocation yonetimi.", breadcrumb: "Tahsilatlar" }],
  ["/depo", { title: "Depo", subtitle: "Toplama emirleri ve depo operasyonlari.", breadcrumb: "Depo" }],
  ["/teslimatlar", { title: "Teslimatlar", subtitle: "Teslimat planlama ve dogrulama paneli.", breadcrumb: "Teslimatlar" }],
  ["/faturalar", { title: "Faturalar", subtitle: "Fatura kayitlari ve belge baglantilari.", breadcrumb: "Faturalar" }],
  ["/iadeler", { title: "Iadeler", subtitle: "Iade sureci ve neden bazli takip.", breadcrumb: "Iadeler" }],
  ["/fabrikalar", { title: "Fabrikalar", subtitle: "Fabrika stok ve siparis gorunurlugu.", breadcrumb: "Fabrikalar" }],
  ["/erp", { title: "ERP", subtitle: "Baglantilar, eslemeler ve senkron paneli.", breadcrumb: "ERP" }],
  ["/whatsapp", { title: "WhatsApp", subtitle: "Kanal bazli operasyon ve iletisim paneli.", breadcrumb: "WhatsApp" }],
  ["/ai", { title: "AI", subtitle: "Asistan, onay ve icgoru paneli.", breadcrumb: "AI" }],
  ["/belgeler", { title: "Belgeler", subtitle: "Belge uretim, dagitim ve arsiv takibi.", breadcrumb: "Belgeler" }],
  ["/raporlar", { title: "Raporlar", subtitle: "Operasyonel metrikler ve karar destek raporlari.", breadcrumb: "Raporlar" }],
  ["/kullanicilar/roller", { title: "Roller", subtitle: "Rol, izin matrisi ve approval yetkileri.", breadcrumb: "Kullanicilar / Roller" }],
  ["/kullanicilar", { title: "Kullanicilar", subtitle: "Kullanici hesaplari ve erisim kapsamlarinin yonetimi.", breadcrumb: "Kullanicilar" }],
  ["/ayarlar", { title: "Ayarlar", subtitle: "Tenant bazli platform konfigurasyonu.", breadcrumb: "Ayarlar" }]
];

function resolveActiveHref(pathname: string): string {
  const items = [...ALL_SHELL_NAV_ITEMS].sort((a, b) => b.href.length - a.href.length);
  for (const item of items) {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
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
    title: "Modul",
    subtitle: "Bu alan icin sayfa iskeleti hazirdir.",
    breadcrumb: "Modul"
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
  const isApprovalsList = normalizedPath === "/onaylar";
  const isWhatsApp = normalizedPath === "/whatsapp";
  const isCustomersList = normalizedPath === "/cariler";
  const isStockList = normalizedPath === "/stok";
  const isArchiveList = normalizedPath === "/archive";

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
          navSections={NAV_SECTIONS}
          activeHref={activeHref}
          companyCard={{ name: "Hallederiz A.Ş.", branch: "Merkez", status: "Çevrimiçi" }}
          onNavigate={(href) => router.push(href)}
        />
      }
      header={
        <Header
          layout={isDashboard ? "dashboard" : "default"}
          suppressPageMeta={isQuickOperation || isApprovalsList || isWhatsApp || isCustomersList || isStockList || isArchiveList}
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          breadcrumb={pageMeta.breadcrumb}
          leadingSlot={isDashboard ? dashboardGreeting : undefined}
          searchPlaceholder={
            isDashboard
              ? "Ara (Cari, Sipariş, Ürün, Belge...)"
              : isApprovalsList
                ? "Cari, onay no, belge no, tutar ara..."
                : isWhatsApp
                  ? "Cari, telefon, mesaj, belge no veya tutar ara..."
                  : isCustomersList
                    ? "Cari, telefon, vergi no, şehir veya bakiye ara..."
                    : isStockList
                      ? "Ürün kodu, barkod, marka, depo, raf veya fiyat ara..."
                      : isArchiveList
                        ? "Belge no, cari, işlem, tarih, kullanıcı veya etiket ara..."
                        : "Cari, siparis, urun kodu veya barkod ara"
          }
          toolbarSlot={
            isDashboard ? (
              <button type="button" className="hz-header-quick-primary" onClick={() => router.push("/hizli-islem")}>
                + Hızlı İşlem
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
              fullName={session?.user.fullName ?? "Bilinmeyen Kullanici"}
              roleLabel={session?.roles[0]?.name ?? "Rol tanimsiz"}
              onLogout={logout}
            />
          }
        />
      }
    >
      <div className="platform-content">{children}</div>
    </AppShell>
  );
}
