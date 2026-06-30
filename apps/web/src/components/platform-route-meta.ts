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
  ["/ai/onaylar", { title: "Yapay Zekâ Onayları", subtitle: "Taslak ve onay kayıtlarını yönetin.", breadcrumb: "Yapay Zekâ / Onaylar" }],
  ["/ai/icgoruler", { title: "Yapay Zekâ İçgörüleri", subtitle: "Yapay zekâ risk ve fırsat analizlerini takip edin.", breadcrumb: "Yapay Zekâ / İçgörüler" }],
  ["/hizli-islem", { title: "Hızlı İşlem", subtitle: "Sipariş, tahsilat, teslim ve belge işlemlerini tek akıştan başlatın.", breadcrumb: "Hızlı İşlem" }],
  ["/dashboard", { title: "Gösterge Paneli", subtitle: "", breadcrumb: "" }],
  ["/archive", { title: "Arşiv", subtitle: "Geçmiş işlemler ve belge arşivi.", breadcrumb: "Arşiv" }],
  ["/kurulum/veri-yukleme", { title: "Veri Yükleme", subtitle: "CSV tabanlı içe aktarma ile cari, ürün, fiyat ve stok yükleyin.", breadcrumb: "Kurulum / Veri Yükleme" }],
  ["/ayarlar/duyuru-videolari", { title: "Duyuru Videoları", subtitle: "Dashboard tanıtım ve duyuru videolarını yönetin.", breadcrumb: "Ayarlar / Duyuru Videoları" }],
  ["/ayarlar/genel", { title: "Genel Ayarlar", subtitle: "Firma, fiyat, entegrasyon ve platform yapılandırması.", breadcrumb: "Ayarlar / Genel" }],
  ["/ayarlar/veri-yukleme", { title: "Veri Yükleme", subtitle: "Şablon indir, dosya yükle, önizle ve içe aktar.", breadcrumb: "Ayarlar / Veri Yükleme" }],
  ["/ayarlar/operasyon-gozlem", { title: "Operasyon ve Gözlem", subtitle: "İz kaydı, kiracı korelasyonu ve sürüm deneme özeti.", breadcrumb: "Ayarlar / Operasyon" }],
  ["/ayarlar/kullanim-hazirligi", { title: "Kullanım Hazırlığı", subtitle: "Canlı kullanım öncesi kritik eksik ve servis durumunu izleyin.", breadcrumb: "Ayarlar / Kullanım Hazırlığı" }],
  ["/ayarlar/staging-kontrol", { title: "Hazırlık Kontrolü", subtitle: "Servis sağlığı ve entegrasyon doğrulama paneli.", breadcrumb: "Ayarlar / Hazırlık Kontrolü" }],
  ["/ayarlar/canli-kullanim-hazirligi", { title: "Canlıya Hazırlık", subtitle: "Canlıya hazırlık ve güvenli mod kontrolleri.", breadcrumb: "Ayarlar / Canlıya Hazırlık" }],
  ["/unauthorized", { title: "Erişim yok", subtitle: "Bu sayfaya erişim yetkiniz bulunmuyor.", breadcrumb: "Erişim" }],
  ["/", { title: "Ana giriş", subtitle: "Rota hazırlık durumu ve operasyon girişi.", breadcrumb: "Ana giriş" }],
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
  ["/offline-api", { title: "API bağlantısı", subtitle: "Sunucuya ulaşılamıyor; güvenli sistem durumu.", breadcrumb: "Sistem" }],
  ["/demo-mode", { title: "Önizleme modu", subtitle: "Demo ve canlı veri ayrımı.", breadcrumb: "Sistem" }],
  ["/live-empty", { title: "Canlı veri boş", subtitle: "Bağlantı var, kayıt yok.", breadcrumb: "Sistem" }],
  ["/ayarlar", { title: "Ayarlar", subtitle: "Kiracı bazlı platform yapılandırması.", breadcrumb: "Ayarlar" }]
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
    title: "Modül",
    subtitle: "Bu alan için sayfa iskeleti hazırdır.",
    breadcrumb: "Modül"
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
    path === "/tahsilatlar/yeni" ||
    path === "/teslimatlar/yeni" ||
    path === "/teslimatlar/rota" ||
    path === "/faturalar/yeni" ||
    path === "/iadeler/yeni" ||
    path === "/belgeler/yeni" ||
    path === "/belgeler/sablonlar" ||
    path === "/belgeler/arsiv";

  if (path === "/") return "Rota, modül grubu veya hazırlık durumu ara...";
  if (path === "/panel" || path.startsWith("/panel/")) return "Panel katmanı, rota veya hazırlık durumu ara...";
  if (path === "/unauthorized") return "Erişim senaryosu, rol veya hazırlık durumu ara...";
  if (path === "/offline-api") return "Bağlantı, yeniden deneme veya hazırlık durumu ara...";
  if (path === "/demo-mode") return "Önizleme modu, veri kaynağı ara...";
  if (path === "/live-empty") return "Boş liste, filtre veya modül ara...";
  if (path === "/mobile-drawer") return "Drawer davranışı veya nav ara...";
  if (path === "/print-export") return "Yazdırma, PDF veya dışa aktarma hazırlığı ara...";
  if (isDashboard) return "Ara (Cari, Sipariş, Ürün, Belge...)";
  if (isTasksWorkspace) return "Görev no, başlık, atanan, müşteri veya kayıt ara...";
  if (isAiWorkspace) return "Yapay zekâ: taslak no, onay no, oturum, içgörü veya müşteri ara...";
  if (isDocumentsWorkspace) return "Belge no, cari, entity, tip veya gönderim durumu ara...";
  if (isFabrikalarList) {
    return path === "/fabrikalar/stoklar"
      ? "Ürün kodu, fabrika, marka veya senkron durumu ara..."
      : "Fabrika sipariş no, satış siparişi veya durum ara...";
  }
  if (isFabrikalarEntityDetail) return "Fabrika sipariş detayı: satır, log veya durum ara...";
  if (isApprovalsList) return "Cari, onay no, belge no, tutar ara...";
  if (isWhatsApp) return "Cari, telefon, mesaj, belge no veya tutar ara...";
  if (isGelenKutuUnified) return "Konuşma no, kanal, müşteri, telefon veya durum ara...";
  if (isCustomersList) return "Cari, telefon, vergi no, şehir veya bakiye ara...";
  if (isStockList) return "Ürün kodu, barkod, marka, depo, raf veya fiyat ara...";
  if (isOrdersList) return "Sipariş no, müşteri, kanal, ödeme veya teslimat durumu ara...";
  if (isOffersList) return "Teklif no, müşteri, durum, fiyat grubu veya geçerlilik ara...";
  if (isPaymentsList) return "Fiş no, müşteri, tutar, yöntem veya belge bağlantısı ara...";
  if (isDeliveriesList) return "Teslimat no, müşteri, sipariş, durum veya belge ara...";
  if (isReturnsList) return "İade no, müşteri, sipariş, teslimat veya durum ara...";
  if (isInvoicesList) return "Fatura no, müşteri, sipariş, tutar veya durum ara...";
  if (isWarehousePrep) return "Belge no, cari, ürün, raf veya depo görevlisi ara...";
  if (isArchiveList) return "Belge no, cari, işlem, tarih, kullanıcı veya etiket ara...";
  if (isReportsList) return "Rapor, cari, belge, tarih, metrik veya kullanıcı ara...";
  if (isSettingsArea) return "Ayar, kullanıcı, bağlantı, depo, fiyat veya belge ara...";
  if (isUsersList) return "Kullanıcı adı, e-posta, rol veya durum ara...";
  if (isUsersRoles) return "Rol adı, kod, modül veya yetki ara...";
  if (isErpPage) return "ERP bağlantı, eşleme, senkron veya hata ara...";
  if (path === "/kurulum" || path.startsWith("/kurulum/")) return "İçe aktarma türü, şablon, dosya veya geçmiş ara...";
  if (path === "/onaylar/kurallar") return "Aksiyon anahtarı, politika veya kritiklik ara...";
  if (isSystemStatePage) return "Sistem durumu veya mod ara...";
  if (isCustomersEntityDetail) return "Cari kartı: iletişim, hesap, teklif veya ekstre notu ara...";
  if (isOrdersEntityDetail) return "Sipariş detayı: satır, belge no veya referans ara...";
  if (isOffersEntityDetail) return "Teklif detayı: satır, follow-up veya belge ara...";
  if (isPaymentsEntityDetail) return "Tahsilat detayı: fiş, allocation veya belge ara...";
  if (isDeliveriesEntityDetail) return "Teslimat detayı: satır, doğrulama veya belge ara...";
  if (isReturnsEntityDetail) return "İade detayı: satır, sebep veya etki ara...";
  if (isInvoicesEntityDetail) return "Fatura detayı: satır, kesim veya belge ara...";
  if (isEntityFormNew) return "Yeni kayıt: müşteri, belge no, tutar veya referans ara...";
  if (isQuickOperation) return "Hızlı işlem: cari, belge, tutar veya referans ara...";
  return "Cari, sipariş, ürün kodu veya barkod ara";
}

function resolveShellSuppressPageMeta(path: string): boolean {
  if (path === "/") return true;
  if (path === "/dashboard") return true;
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
  if (path === "/faturalar" || path === "/faturalar/liste") return true;
  if (path === "/archive") return true;
  if (path === "/raporlar" || path.startsWith("/raporlar/")) return true;
  if (path === "/ayarlar" || path.startsWith("/ayarlar/")) return true;
  if (path === "/kullanicilar" || path === "/kullanicilar/roller") return true;
  if (path === "/erp") return true;
  if (path.startsWith("/workflow/")) return true;
  if (path === "/kurulum" || path.startsWith("/kurulum/")) return true;
  if (path === "/onaylar/kurallar") return true;
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
    path === "/tahsilatlar/yeni" ||
    path === "/teslimatlar/yeni" ||
    path === "/teslimatlar/rota" ||
    path === "/faturalar/yeni" ||
    path === "/iadeler/yeni" ||
    path === "/belgeler/yeni" ||
    path === "/belgeler/sablonlar" ||
    path === "/belgeler/arsiv" ||
    path === "/onaylar/limitler"
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
