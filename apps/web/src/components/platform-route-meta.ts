// @ts-nocheck
import { shouldSuppressShellPageMeta } from "../navigation/product-route-manifest";

export interface ShellPageMeta {
  title: string;
  subtitle: string;
  breadcrumb: string;
}

export interface ShellHeaderOptions {
  layout: "dashboard" | "default";
  suppressPageMeta: boolean;
  searchPlaceholder: string;
  pageMeta: ShellPageMeta;
}

const PAGE_META_REGISTRY: Array<[string, ShellPageMeta]> = [
  ["/gorevler/", { title: "GÃ¶rev DetayÄ±", subtitle: "GÃ¶rev yorumlarÄ±, durum ve aksiyonlarÄ±.", breadcrumb: "GÃ¶revler / Detay" }],
  ["/onaylar/kurallar", { title: "Politika Matrisi", subtitle: "Onay gerektiren aksiyonlar ve politika anahtarlarÄ±nÄ±n Ã¶zeti.", breadcrumb: "Onaylar / Kurallar" }],
  ["/onaylar/", { title: "Onay DetayÄ±", subtitle: "Onay yÃ¼kÃ¼, risk ve icra hazÄ±rlÄ±ÄŸÄ±.", breadcrumb: "Onaylar / Detay" }],
  ["/workflow/", { title: "Ä°ÅŸ AkÄ±ÅŸÄ± Zaman Ã‡izelgesi", subtitle: "KayÄ±t bazlÄ± operasyon adÄ±mlarÄ±.", breadcrumb: "Ä°ÅŸ AkÄ±ÅŸÄ±" }],
  ["/cariler/", { title: "Cari KartÄ±", subtitle: "MÃ¼ÅŸteri detayÄ±nÄ± finans ve operasyon baÄŸlamÄ±yla yÃ¶netin.", breadcrumb: "Cariler / Detay" }],
  ["/teklifler/yeni", { title: "Yeni Teklif", subtitle: "Teklif oluÅŸturma editÃ¶rÃ¼ iskeleti.", breadcrumb: "Teklifler / Yeni" }],
  ["/teklifler/", { title: "Teklif DetayÄ±", subtitle: "Teklif satÄ±rlarÄ± ve takip yÃ¶netimi.", breadcrumb: "Teklifler / Detay" }],
  ["/siparisler/yeni", { title: "Yeni SipariÅŸ", subtitle: "SipariÅŸ oluÅŸturma ve kaynak planÄ±.", breadcrumb: "SipariÅŸler / Yeni" }],
  ["/siparisler/", { title: "SipariÅŸ DetayÄ±", subtitle: "SatÄ±r, operasyon etkisi ve risk paneli.", breadcrumb: "SipariÅŸler / Detay" }],
  ["/tahsilatlar/yeni", { title: "Yeni Tahsilat", subtitle: "Tahsilat ve tahsis giriÅŸ ekranÄ±.", breadcrumb: "Tahsilatlar / Yeni" }],
  ["/tahsilatlar/", { title: "Tahsilat DetayÄ±", subtitle: "Tahsilat doÄŸrulama ve belge paneli.", breadcrumb: "Tahsilatlar / Detay" }],
  ["/depo/emirler/", { title: "Depo HazÄ±rlÄ±k FiÅŸi", subtitle: "Belge satÄ±rlarÄ±, raf/lokasyon ve teslim Ã¶ncesi Ã¶zet.", breadcrumb: "Depo HazÄ±rlÄ±k / FiÅŸ" }],
  ["/teslimatlar/", { title: "Teslimat DetayÄ±", subtitle: "Teslim satÄ±rlarÄ± ve doÄŸrulama paneli.", breadcrumb: "Teslimatlar / Detay" }],
  ["/faturalar/", { title: "Fatura DetayÄ±", subtitle: "Fatura satÄ±rlarÄ± ve belge aksiyonlarÄ±.", breadcrumb: "Faturalar / Detay" }],
  ["/iadeler/yeni", { title: "Yeni Ä°ade", subtitle: "SipariÅŸ veya teslime baÄŸlÄ± iade taslaÄŸÄ±.", breadcrumb: "Ä°adeler / Yeni" }],
  ["/iadeler/", { title: "Ä°ade DetayÄ±", subtitle: "Ä°ade satÄ±rlarÄ±, etkileri ve onay akÄ±ÅŸÄ±.", breadcrumb: "Ä°adeler / Detay" }],
  ["/fabrikalar/siparisler/", { title: "Fabrika SipariÅŸ DetayÄ±", subtitle: "Fabrika durum ve senkron paneli.", breadcrumb: "Fabrikalar / SipariÅŸ Detay" }],
  ["/ai/onaylar", { title: "AI Onaylar", subtitle: "Taslak ve onay kayÄ±tlarÄ±nÄ± yÃ¶netin.", breadcrumb: "AI / Onaylar" }],
  ["/ai/icgoruler", { title: "AI Ä°Ã§gÃ¶rÃ¼ler", subtitle: "AI risk ve fÄ±rsat analizlerini takip edin.", breadcrumb: "AI / Ä°Ã§gÃ¶rÃ¼ler" }],
  ["/hizli-islem", { title: "HÄ±zlÄ± Ä°ÅŸlem", subtitle: "SipariÅŸ, tahsilat, teslim ve belge iÅŸlemlerini tek akÄ±ÅŸtan baÅŸlatÄ±n.", breadcrumb: "HÄ±zlÄ± Ä°ÅŸlem" }],
  ["/dashboard", { title: "GÃ¶sterge Paneli", subtitle: "", breadcrumb: "" }],
  ["/archive", { title: "ArÅŸiv", subtitle: "GeÃ§miÅŸ iÅŸlemler ve belge arÅŸivi.", breadcrumb: "ArÅŸiv" }],
  ["/kurulum/veri-yukleme", { title: "Veri YÃ¼kleme", subtitle: "CSV tabanlÄ± iÃ§e aktarma ile cari, Ã¼rÃ¼n, fiyat ve stok yÃ¼kleyin.", breadcrumb: "Kurulum / Veri YÃ¼kleme" }],
  ["/ayarlar/veri-yukleme", { title: "Veri YÃ¼kleme", subtitle: "Åablon indir, dosya yÃ¼kle, Ã¶nizle ve iÃ§e aktar.", breadcrumb: "Ayarlar / Veri YÃ¼kleme" }],
  ["/ayarlar/operasyon-gozlem", { title: "Operasyon ve GÃ¶zlem", subtitle: "Ä°z kaydÄ±, kiracÄ± korelasyonu ve sÃ¼rÃ¼m deneme Ã¶zeti.", breadcrumb: "Ayarlar / Operasyon" }],
  ["/ayarlar/kullanim-hazirligi", { title: "KullanÄ±m HazÄ±rlÄ±ÄŸÄ±", subtitle: "CanlÄ± kullanÄ±m Ã¶ncesi kritik eksik ve servis durumunu izleyin.", breadcrumb: "Ayarlar / KullanÄ±m HazÄ±rlÄ±ÄŸÄ±" }],
  ["/unauthorized", { title: "EriÅŸim yok", subtitle: "Bu sayfaya eriÅŸim yetkiniz bulunmuyor.", breadcrumb: "EriÅŸim" }],
  ["/", { title: "Ana giriÅŸ", subtitle: "Route readiness ve operasyon giriÅŸi.", breadcrumb: "Ana giriÅŸ" }],
  ["/gorevler", { title: "GÃ¶revler", subtitle: "GÃ¶sterge paneli ve iÅŸ akÄ±ÅŸÄ± kaynaklÄ± operasyon gÃ¶revleri.", breadcrumb: "GÃ¶revler" }],
  ["/onaylar", { title: "Onaylar", subtitle: "Onay kutusu, operatÃ¶r onaylarÄ± ve arka plan sinyalleri.", breadcrumb: "Onaylar" }],
  ["/cariler", { title: "Cariler", subtitle: "Cari portfÃ¶y, risk ve finans baÄŸlamÄ±.", breadcrumb: "Cariler" }],
  ["/stok", { title: "Stok", subtitle: "ÃœrÃ¼n, depo, barkod ve fabrika gÃ¶rÃ¼nÃ¼rlÃ¼ÄŸÃ¼.", breadcrumb: "Stok" }],
  ["/teklifler", { title: "Teklifler", subtitle: "Teklif yaÅŸam dÃ¶ngÃ¼sÃ¼ ve dÃ¶nÃ¼ÅŸÃ¼m takipleri.", breadcrumb: "Teklifler" }],
  ["/siparisler", { title: "SipariÅŸler", subtitle: "SipariÅŸ, kaynak planÄ± ve operasyon etkisi.", breadcrumb: "SipariÅŸler" }],
  ["/tahsilatlar", { title: "Tahsilatlar", subtitle: "Tahsilat kayÄ±tlarÄ± ve tahsis yÃ¶netimi.", breadcrumb: "Tahsilatlar" }],
  ["/depo", { title: "Depo HazÄ±rlÄ±k", subtitle: "SatÄ±lan Ã¼rÃ¼nlerin depo toplama ve teslim Ã¶ncesi hazÄ±rlÄ±ÄŸÄ±.", breadcrumb: "Depo HazÄ±rlÄ±k" }],
  ["/teslimatlar", { title: "Teslimatlar", subtitle: "Teslimat planlama ve doÄŸrulama paneli.", breadcrumb: "Teslimatlar" }],
  ["/faturalar", { title: "Faturalar", subtitle: "Fatura kayÄ±tlarÄ± ve belge baÄŸlantÄ±larÄ±.", breadcrumb: "Faturalar" }],
  ["/iadeler", { title: "Ä°adeler", subtitle: "Ä°ade sÃ¼reci ve neden bazlÄ± takip.", breadcrumb: "Ä°adeler" }],
  ["/fabrikalar", { title: "Fabrikalar", subtitle: "Fabrika stok ve sipariÅŸ gÃ¶rÃ¼nÃ¼rlÃ¼ÄŸÃ¼.", breadcrumb: "Fabrikalar" }],
  ["/erp", { title: "ERP", subtitle: "BaÄŸlantÄ±lar, eÅŸlemeler ve senkron paneli.", breadcrumb: "ERP" }],
  ["/whatsapp", { title: "WhatsApp", subtitle: "Kanal bazlÄ± operasyon ve iletiÅŸim paneli.", breadcrumb: "WhatsApp" }],
  ["/gelen-kutu", { title: "Gelen Kutu", subtitle: "Ã‡ok kanallÄ± iletiÅŸim merkezi ve konuÅŸma kuyruÄŸu.", breadcrumb: "Gelen Kutu" }],
  ["/gelen-kutu/konusma/", { title: "KonuÅŸma", subtitle: "Tekil konuÅŸma ve mesaj baÄŸlamÄ±.", breadcrumb: "Gelen Kutu / KonuÅŸma" }],
  ["/ai", { title: "AI", subtitle: "Asistan, onay ve iÃ§gÃ¶rÃ¼ paneli.", breadcrumb: "AI" }],
  ["/belgeler", { title: "Belgeler", subtitle: "Belge Ã¼retim, daÄŸÄ±tÄ±m ve arÅŸiv takibi.", breadcrumb: "Belgeler" }],
  ["/raporlar", { title: "Raporlar", subtitle: "Operasyonel metrikler ve karar destek raporlarÄ±.", breadcrumb: "Raporlar" }],
  ["/kullanicilar/roller", { title: "Roller", subtitle: "Rol, izin matrisi ve onay yetkileri.", breadcrumb: "KullanÄ±cÄ±lar / Roller" }],
  ["/kullanicilar", { title: "KullanÄ±cÄ±lar", subtitle: "KullanÄ±cÄ± hesaplarÄ± ve eriÅŸim kapsamlarÄ±nÄ±n yÃ¶netimi.", breadcrumb: "KullanÄ±cÄ±lar" }],
  ["/offline-api", { title: "API baÄŸlantÄ±sÄ±", subtitle: "Sunucuya ulaÅŸÄ±lamÄ±yor; gÃ¼venli sistem durumu.", breadcrumb: "Sistem" }],
  ["/demo-mode", { title: "Ã–nizleme modu", subtitle: "Demo ve canlÄ± veri ayrÄ±mÄ±.", breadcrumb: "Sistem" }],
  ["/live-empty", { title: "CanlÄ± veri boÅŸ", subtitle: "BaÄŸlantÄ± var, kayÄ±t yok.", breadcrumb: "Sistem" }],
  ["/ayarlar", { title: "Ayarlar", subtitle: "KiracÄ± bazlÄ± platform yapÄ±landÄ±rmasÄ±.", breadcrumb: "Ayarlar" }]
];

export function normalizeShellPathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "") || "/";
  }
  return pathname;
}

export function resolveShellPageMeta(pathname: string): ShellPageMeta {
  const p = normalizeShellPathname(pathname);

  for (const [prefix, meta] of PAGE_META_REGISTRY) {
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
    title: "ModÃ¼l",
    subtitle: "Bu alan iÃ§in sayfa iskeleti hazÄ±rdÄ±r.",
    breadcrumb: "ModÃ¼l"
  };
}

function resolveShellSearchPlaceholder(path: string): string {
  const isDashboard = path === "/dashboard";
  const isQuickOperation = path === "/hizli-islem" || path.startsWith("/hizli-islem/");
  const isApprovalsList = path.startsWith("/onaylar");
  const isWhatsApp = path === "/whatsapp" || path === "/gelen-kutu/whatsapp";
  const isGelenKutuUnified = path === "/gelen-kutu" || path.startsWith("/gelen-kutu/konusma/");
  const isCustomersList = path === "/cariler";
  const isStockList = path === "/stok";
  const isOrdersList = path === "/siparisler";
  const isOffersList = path === "/teklifler";
  const isPaymentsList = path === "/tahsilatlar";
  const isDeliveriesList = path === "/teslimatlar";
  const isReturnsList = path === "/iadeler";
  const isInvoicesList = path === "/faturalar";
  const isArchiveList = path === "/archive";
  const isMuhasebeHub = path === "/muhasebe";
  const isReportsList = path === "/raporlar" || path.startsWith("/raporlar/");
  const isSettingsArea = path === "/ayarlar" || path.startsWith("/ayarlar/");
  const isUsersList = path === "/kullanicilar";
  const isUsersRoles = path === "/kullanicilar/roller";
  const isErpPage = path === "/erp";
  const isSystemStatePage = path === "/offline-api" || path === "/demo-mode" || path === "/live-empty";
  const isWarehousePrep = path === "/depo" || path.startsWith("/depo/");
  const isTasksWorkspace = path === "/gorevler" || path.startsWith("/gorevler/");
  const isAiWorkspace = path === "/ai" || path.startsWith("/ai/");
  const isDocumentsWorkspace = path === "/belgeler" || path.startsWith("/belgeler/");
  const isFabrikalarList = path === "/fabrikalar/stoklar" || path === "/fabrikalar/siparisler";
  const isFabrikalarEntityDetail = path.startsWith("/fabrikalar/siparisler/") && path !== "/fabrikalar/siparisler";
  const isCustomersEntityDetail =
    path.startsWith("/cariler/") && path !== "/cariler/yeni" && path !== "/cariler/liste";
  const isOrdersEntityDetail =
    path.startsWith("/siparisler/") && path !== "/siparisler/yeni" && path !== "/siparisler/liste";
  const isOffersEntityDetail =
    path.startsWith("/teklifler/") && path !== "/teklifler/yeni" && path !== "/teklifler/liste";
  const isPaymentsEntityDetail =
    path.startsWith("/tahsilatlar/") && path !== "/tahsilatlar/yeni" && path !== "/tahsilatlar/liste";
  const isDeliveriesEntityDetail =
    path.startsWith("/teslimatlar/") &&
    path !== "/teslimatlar/yeni" &&
    path !== "/teslimatlar/liste" &&
    path !== "/teslimatlar/rota";
  const isReturnsEntityDetail = path.startsWith("/iadeler/") && path !== "/iadeler/yeni" && path !== "/iadeler/liste";
  const isInvoicesEntityDetail =
    path.startsWith("/faturalar/") && path !== "/faturalar/yeni" && path !== "/faturalar/liste";
  const isEntityFormNew =
    path === "/cariler/yeni" ||
    path === "/siparisler/yeni" ||
    path === "/teklifler/yeni" ||
    path === "/tahsilatlar/yeni";

  if (path === "/") return "Route, modÃ¼l grubu veya readiness durumu ara...";
  if (path === "/panel" || path.startsWith("/panel/")) return "Panel katmanÄ±, route veya readiness ara...";
  if (path === "/unauthorized") return "EriÅŸim senaryosu, rol veya readiness ara...";
  if (path === "/offline-api") return "BaÄŸlantÄ±, retry veya readiness ara...";
  if (path === "/demo-mode") return "Ã–nizleme modu, veri kaynaÄŸÄ± ara...";
  if (path === "/live-empty") return "BoÅŸ liste, filtre veya modÃ¼l ara...";
  if (path === "/mobile-drawer") return "Drawer davranÄ±ÅŸÄ± veya nav ara...";
  if (path === "/print-export") return "Print, PDF veya export readiness ara...";
  if (isDashboard) return "Ara (Cari, SipariÅŸ, ÃœrÃ¼n, Belge...)";
  if (isTasksWorkspace) return "GÃ¶rev no, baÅŸlÄ±k, atanan, mÃ¼ÅŸteri veya kayÄ±t ara...";
  if (isAiWorkspace) return "AI: taslak no, onay no, oturum, iÃ§gÃ¶rÃ¼ veya mÃ¼ÅŸteri ara...";
  if (isDocumentsWorkspace) return "Belge no, cari, entity, tip veya gÃ¶nderim durumu ara...";
  if (isFabrikalarList) {
    return path === "/fabrikalar/stoklar"
      ? "ÃœrÃ¼n kodu, fabrika, marka veya senkron durumu ara..."
      : "Fabrika sipariÅŸ no, satÄ±ÅŸ sipariÅŸi veya durum ara...";
  }
  if (isFabrikalarEntityDetail) return "Fabrika sipariÅŸ detayÄ±: satÄ±r, log veya durum ara...";
  if (isApprovalsList) return "Cari, onay no, belge no, tutar ara...";
  if (isWhatsApp) return "Cari, telefon, mesaj, belge no veya tutar ara...";
  if (isGelenKutuUnified) return "KonuÅŸma no, kanal, mÃ¼ÅŸteri, telefon veya durum ara...";
  if (isCustomersList) return "Cari, telefon, vergi no, ÅŸehir veya bakiye ara...";
  if (isStockList) return "ÃœrÃ¼n kodu, barkod, marka, depo, raf veya fiyat ara...";
  if (isOrdersList) return "SipariÅŸ no, mÃ¼ÅŸteri, kanal, Ã¶deme veya teslimat durumu ara...";
  if (isOffersList) return "Teklif no, mÃ¼ÅŸteri, durum, fiyat grubu veya geÃ§erlilik ara...";
  if (isPaymentsList) return "FiÅŸ no, mÃ¼ÅŸteri, tutar, yÃ¶ntem veya belge baÄŸlantÄ±sÄ± ara...";
  if (isDeliveriesList) return "Teslimat no, mÃ¼ÅŸteri, sipariÅŸ, durum veya belge ara...";
  if (isReturnsList) return "Ä°ade no, mÃ¼ÅŸteri, sipariÅŸ, teslimat veya durum ara...";
  if (isInvoicesList) return "Fatura no, mÃ¼ÅŸteri, sipariÅŸ, tutar veya durum ara...";
  if (isWarehousePrep) return "Belge no, cari, Ã¼rÃ¼n, raf veya depo gÃ¶revlisi ara...";
  if (isArchiveList) return "Belge no, cari, iÅŸlem, tarih, kullanÄ±cÄ± veya etiket ara...";
  if (isMuhasebeHub) return "Fatura, tahsilat, iade veya cari finans kaydÄ± ara...";
  if (isReportsList) return "Rapor, cari, belge, tarih, metrik veya kullanÄ±cÄ± ara...";
  if (isSettingsArea) return "Ayar, kullanÄ±cÄ±, baÄŸlantÄ±, depo, fiyat veya belge ara...";
  if (isUsersList) return "KullanÄ±cÄ± adÄ±, e-posta, rol veya durum ara...";
  if (isUsersRoles) return "Rol adÄ±, kod, modÃ¼l veya yetki ara...";
  if (isErpPage) return "ERP baÄŸlantÄ±, eÅŸleme, senkron veya hata ara...";
  if (isSystemStatePage) return "Sistem durumu veya mod ara...";
  if (isCustomersEntityDetail) return "Cari kartÄ±: iletiÅŸim, hesap, teklif veya ekstre notu ara...";
  if (isOrdersEntityDetail) return "SipariÅŸ detayÄ±: satÄ±r, belge no veya referans ara...";
  if (isOffersEntityDetail) return "Teklif detayÄ±: satÄ±r, follow-up veya belge ara...";
  if (isPaymentsEntityDetail) return "Tahsilat detayÄ±: fiÅŸ, allocation veya belge ara...";
  if (isDeliveriesEntityDetail) return "Teslimat detayÄ±: satÄ±r, doÄŸrulama veya belge ara...";
  if (isReturnsEntityDetail) return "Ä°ade detayÄ±: satÄ±r, sebep veya etki ara...";
  if (isInvoicesEntityDetail) return "Fatura detayÄ±: satÄ±r, kesim veya belge ara...";
  if (isEntityFormNew) return "Yeni kayÄ±t: mÃ¼ÅŸteri, belge no, tutar veya referans ara...";
  if (isQuickOperation) return "HÄ±zlÄ± iÅŸlem: cari, belge, tutar veya referans ara...";
  return "Cari, sipariÅŸ, Ã¼rÃ¼n kodu veya barkod ara";
}

function resolveShellSuppressPageMeta(path: string): boolean {
  if (path === "/") return true;
  if (path === "/panel" || path.startsWith("/panel/")) return true;
  if (path === "/unauthorized") return true;
  if (path === "/offline-api" || path === "/demo-mode" || path === "/live-empty") return true;
  if (path === "/mobile-drawer" || path === "/print-export") return true;
  if (path === "/hizli-islem" || path.startsWith("/hizli-islem/")) return true;
  if (path.startsWith("/onaylar")) return true;
  if (path === "/whatsapp" || path === "/gelen-kutu/whatsapp") return true;
  if (path === "/gelen-kutu" || path.startsWith("/gelen-kutu/konusma/")) return true;
  if (path === "/cariler" || path === "/cariler/liste") return true;
  if (path === "/stok") return true;
  if (path === "/siparisler" || path === "/siparisler/liste") return true;
  if (path === "/teklifler" || path === "/teklifler/liste") return true;
  if (path === "/tahsilatlar") return true;
  if (path === "/teslimatlar") return true;
  if (path === "/iadeler") return true;
  if (path === "/faturalar") return true;
  if (path === "/archive") return true;
  if (path === "/muhasebe") return true;
  if (path === "/raporlar" || path.startsWith("/raporlar/")) return true;
  if (path === "/ayarlar" || path.startsWith("/ayarlar/")) return true;
  if (path === "/kullanicilar" || path === "/kullanicilar/roller") return true;
  if (path === "/erp") return true;
  if (path === "/offline-api" || path === "/demo-mode" || path === "/live-empty") return true;
  if (path === "/depo" || path.startsWith("/depo/")) return true;
  if (path === "/gorevler" || path.startsWith("/gorevler/")) return true;
  if (path === "/ai" || path.startsWith("/ai/")) return true;
  if (path === "/belgeler" || path.startsWith("/belgeler/")) return true;
  if (path === "/fabrikalar/stoklar" || path === "/fabrikalar/siparisler") return true;
  if (path.startsWith("/fabrikalar/siparisler/") && path !== "/fabrikalar/siparisler") return true;
  if (path.startsWith("/cariler/") && path !== "/cariler/yeni") return true;
  if (path.startsWith("/siparisler/") && path !== "/siparisler/yeni") return true;
  if (path.startsWith("/teklifler/") && path !== "/teklifler/yeni") return true;
  if (
    path.startsWith("/tahsilatlar/") &&
    path !== "/tahsilatlar/yeni" &&
    path !== "/tahsilatlar/liste"
  ) {
    return true;
  }
  if (
    path.startsWith("/teslimatlar/") &&
    path !== "/teslimatlar/yeni" &&
    path !== "/teslimatlar/liste" &&
    path !== "/teslimatlar/rota"
  ) {
    return true;
  }
  if (path.startsWith("/iadeler/") && path !== "/iadeler/yeni" && path !== "/iadeler/liste") return true;
  if (path.startsWith("/faturalar/") && path !== "/faturalar/yeni" && path !== "/faturalar/liste") return true;
  if (
    path === "/cariler/yeni" ||
    path === "/siparisler/yeni" ||
    path === "/teklifler/yeni" ||
    path === "/tahsilatlar/yeni"
  ) {
    return true;
  }
  return shouldSuppressShellPageMeta(path);
}

export function resolveShellHeaderOptions(pathname: string): ShellHeaderOptions {
  const path = normalizeShellPathname(pathname);
  return {
    layout: path === "/dashboard" ? "dashboard" : "default",
    suppressPageMeta: resolveShellSuppressPageMeta(path),
    searchPlaceholder: resolveShellSearchPlaceholder(path),
    pageMeta: resolveShellPageMeta(pathname)
  };
}

