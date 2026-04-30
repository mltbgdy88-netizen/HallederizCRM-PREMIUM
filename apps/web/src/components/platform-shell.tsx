"use client";

import {
  AppShell,
  Header,
  Sidebar,
  ThemeToggle,
  UserMenu,
  type AppShellNavItem
} from "@hallederiz/ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CRMIcon } from "./icons";
import { useAuth } from "../providers/auth-provider";
import { useTheme } from "../providers/theme-provider";

const PRIMARY_NAV_ITEMS: AppShellNavItem[] = [
  { key: "dashboard", label: "Gorev Merkezi", href: "/", icon: <CRMIcon name="dashboard" /> },
  { key: "tasks", label: "Gorevler", href: "/gorevler", icon: <CRMIcon name="dashboard" /> },
  { key: "approvals", label: "Onaylar", href: "/onaylar", icon: <CRMIcon name="roles" /> },
  { key: "customers", label: "Cariler", href: "/cariler", icon: <CRMIcon name="customers" /> },
  { key: "stock", label: "Stok", href: "/stok", icon: <CRMIcon name="stock" /> },
  { key: "offers", label: "Teklifler", href: "/teklifler", icon: <CRMIcon name="offers" /> },
  { key: "orders", label: "Siparisler", href: "/siparisler", icon: <CRMIcon name="orders" /> },
  { key: "quick-operations", label: "Hizli Islem", href: "/hizli-islem", icon: <CRMIcon name="orders" /> },
  { key: "payments", label: "Tahsilatlar", href: "/tahsilatlar", icon: <CRMIcon name="payments" /> },
  { key: "warehouse", label: "Depo", href: "/depo", icon: <CRMIcon name="warehouse" /> },
  { key: "delivery", label: "Teslimatlar", href: "/teslimatlar", icon: <CRMIcon name="delivery" /> },
  { key: "invoices", label: "Faturalar", href: "/faturalar", icon: <CRMIcon name="invoices" /> },
  { key: "returns", label: "Iadeler", href: "/iadeler", icon: <CRMIcon name="returns" /> },
  { key: "factories", label: "Fabrikalar", href: "/fabrikalar/stoklar", icon: <CRMIcon name="factories" /> },
  { key: "erp", label: "ERP", href: "/erp", icon: <CRMIcon name="erp" /> },
  { key: "whatsapp", label: "WhatsApp", href: "/whatsapp", icon: <CRMIcon name="whatsapp" /> },
  { key: "ai", label: "AI", href: "/ai", icon: <CRMIcon name="ai" />, badge: "5", pulse: true },
  { key: "documents", label: "Belgeler", href: "/belgeler", icon: <CRMIcon name="documents" /> },
  { key: "reports", label: "Raporlar", href: "/raporlar", icon: <CRMIcon name="reports" /> }
];

const SECONDARY_NAV_ITEMS: AppShellNavItem[] = [
  { key: "users", label: "Kullanicilar", href: "/kullanicilar", icon: <CRMIcon name="users" /> },
  { key: "roles", label: "Roller", href: "/kullanicilar/roller", icon: <CRMIcon name="roles" /> },
  { key: "settings", label: "Ayarlar", href: "/ayarlar", icon: <CRMIcon name="settings" /> }
];

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
  ["/hizli-islem", { title: "Hizli Islem Merkezi", subtitle: "Klasik fis hissiyle satir, kaynak ve operasyon etkisini tek ekranda yonetin.", breadcrumb: "Hizli Islem" }],
  ["/kurulum/veri-yukleme", { title: "Pilot Veri Yukleme", subtitle: "CSV tabanli import merkezi ile cari, urun, fiyat ve stok yukleyin.", breadcrumb: "Kurulum / Veri Yukleme" }],
  ["/ayarlar/pilot-veri-yukleme", { title: "Pilot Veri Yukleme", subtitle: "Template indir, dosya yukle, onizle ve ice aktar.", breadcrumb: "Ayarlar / Pilot Veri Yukleme" }],
  ["/", { title: "Gorev Merkezi", subtitle: "Sistem ve AI kartlariyla operasyon odakli kontrol merkezi.", breadcrumb: "Anasayfa" }],
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
  if (pathname === "/") {
    return "/";
  }

  if (pathname.startsWith("/fabrikalar")) {
    return "/fabrikalar/stoklar";
  }

  for (const item of [...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS]) {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return item.href;
    }
  }

  return "/";
}

function getPageMeta(pathname: string): PageMeta {
  for (const [prefix, meta] of PAGE_META) {
    if (prefix.endsWith("/")) {
      if (pathname.startsWith(prefix)) {
        return meta;
      }
      continue;
    }

    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return meta;
    }
  }

  return {
    title: "Modul",
    subtitle: "Bu alan icin sayfa iskeleti hazirdir.",
    breadcrumb: "Modul"
  };
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

  const pageMeta = useMemo(() => getPageMeta(pathname), [pathname]);
  const activeHref = resolveActiveHref(pathname);

  return (
    <AppShell
      mobileSidebarOpen={mobileSidebarOpen}
      onMobileSidebarOpenChange={setMobileSidebarOpen}
      sidebar={
        <Sidebar
          appTitle="HallederizCRM"
          appSubtitle="Premium Operations Suite"
          versionLabel="v0.4 UI Foundation"
          primaryItems={PRIMARY_NAV_ITEMS}
          secondaryItems={SECONDARY_NAV_ITEMS}
          activeHref={activeHref}
          onNavigate={(href) => router.push(href)}
        />
      }
      header={
        <Header
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          breadcrumb={pageMeta.breadcrumb}
          searchPlaceholder="Cari, siparis, urun kodu veya barkod ara"
          notificationSlot={
            <button type="button" className="hz-header-icon-button" aria-label="Bildirimler">
              <span className="hz-dot hz-dot-info" />
              Bildirimler
            </button>
          }
          themeSlot={<ThemeToggle mode={theme} onToggle={toggleTheme} />}
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
