import type { OwnerAgent, ProductModuleGroup, ProductRouteNode, RouteStatus } from "./product-route-types";

function n(
  id: string,
  segment: string,
  base: string,
  label: string,
  moduleGroup: ProductModuleGroup,
  packageGroup: string,
  status: RouteStatus,
  ownerAgent: OwnerAgent,
  description: string,
  opts?: {
    relatedApi?: string;
    existingFeature?: string;
    /** Shell / full-bleed sayfalar için üst PageMeta gizleme */
    suppressHeader?: boolean;
    children?: ProductRouteNode[];
  }
): ProductRouteNode {
  const href = segment ? `${base.replace(/\/$/, "")}/${segment}` : base;
  return {
    id,
    segment,
    href,
    label,
    moduleGroup,
    packageGroup,
    status,
    ownerAgent,
    description,
    relatedApi: opts?.relatedApi,
    existingFeature: opts?.existingFeature,
    suppressHeader: opts?.suppressHeader !== undefined ? opts.suppressHeader : status !== "implemented",
    children: opts?.children
  };
}

function ch(
  base: string,
  moduleGroup: ProductModuleGroup,
  packageGroup: string,
  ownerAgent: OwnerAgent,
  rows: Array<[string, string, RouteStatus, string, string?, string?]>
): ProductRouteNode[] {
  return rows.map(([segment, label, status, description, relatedApi, existingFeature]) =>
    n(`${packageGroup}-${segment}`, segment, base, label, moduleGroup, packageGroup, status, ownerAgent, description, {
      relatedApi,
      existingFeature
    })
  );
}

const OWNER: OwnerAgent = "both";

export const PRODUCT_ROUTE_FOREST: ProductRouteNode[] = [
  n("panel", "", "/panel", "Panel", "Panel", "panel", "shell", OWNER, "Operasyon özeti ve günlük odak.", {
    children: ch("/panel", "Panel", "panel", OWNER, [
      ["bugun", "Bugün", "shell", "Günün operasyon görünümü; gösterge paneli ile bağlantılı.", undefined, undefined],
      ["uyarilar", "Uyarılar", "needs-api", "Risk ve SLA uyarı akışı; backend bağlantısı bekleniyor."],
      ["bekleyen-onaylar", "Bekleyen onaylar", "implemented", "Onay kuyruğu.", undefined, "redirect:/onaylar"],
      ["ai-onerileri", "AI önerileri", "shell", "Öneri ve içgörü akışları.", undefined, "link:/ai"],
      ["kanal-ozeti", "Kanal özeti", "needs-api", "Çok kanallı özet; veri modeli tamamlanacak."]
    ])
  }),
  n("gelen-kutu", "", "/gelen-kutu", "Gelen Kutu", "Omnichannel", "inbox", "shell", OWNER, "Omnichannel gelen iletişim merkezi.", {
    children: [
      ...ch("/gelen-kutu", "Omnichannel", "inbox", OWNER, [
        ["tum-kanallar", "Tüm kanallar", "needs-api", "Birleşik gelen kutusu; API bağlantısı bekleniyor."]
      ]),
      n("inbox-whatsapp", "whatsapp", "/gelen-kutu", "WhatsApp", "Omnichannel", "inbox", "implemented", OWNER, "WhatsApp operasyon ekranı.", {
        existingFeature: "whatsapp-page",
        suppressHeader: true
      }),
      ...ch("/gelen-kutu", "Omnichannel", "inbox", OWNER, [
        ["instagram", "Instagram", "needs-api", "Instagram gelen kutusu; entegrasyon bağlantısı bekleniyor."],
        ["facebook-messenger", "Facebook Messenger", "needs-api", "Messenger gelen kutusu; entegrasyon bağlantısı bekleniyor."],
        ["web-chat", "Web chat", "needs-api", "Web chat gelen kutusu."],
        ["email", "E-posta", "needs-api", "E-posta gelen kutusu."],
        ["sms", "SMS", "needs-api", "SMS gelen kutusu."],
        ["atamalar", "Atamalar", "needs-api", "Konuşma atama kuralları."],
        ["etiketler", "Etiketler", "needs-api", "Etiket yönetimi."],
        ["sla-kurallari", "SLA kuralları", "needs-api", "SLA politikaları."],
        ["sablonlar", "Şablonlar", "needs-api", "Yanıt şablonları."],
        ["handoff-kuyrugu", "Handoff kuyruğu", "needs-api", "Devretme kuyruğu."]
      ]),
      n("gelen-kutu-konusma", "konusma", "/gelen-kutu", "Konuşma", "Omnichannel", "inbox", "shell", OWNER, "Tekil konuşma görünümü; backend bağlantısı bekleniyor.", {
        children: [] // dynamic id handled in resolver
      })
    ]
  }),
  n("yardimci", "", "/yardimci", "Yardımcı", "AI Operator", "ai-operator", "shell", OWNER, "AI yardımcı ve operatör araçları.", {
    children: [
      ...ch("/yardimci", "AI Operator", "ai-operator", OWNER, [
        ["sohbet", "Sohbet", "needs-api", "Metin sohbeti; servis bağlantısı bekleniyor."],
        ["sesli-asistan", "Sesli asistan", "needs-api", "Sesli etkileşim; servis bağlantısı bekleniyor."],
        ["gorev-isteme", "Görev isteme", "needs-api", "Görev talep akışı."],
        ["taslaklar", "Taslaklar", "needs-api", "Taslak içerikler."],
        ["oneriler", "Öneriler", "shell", "Öneri akışları.", undefined, "link:/ai"]
      ]),
      n("ai-operator-icgoruler", "icgoruler", "/yardimci", "İçgörüler", "AI Operator", "ai-operator", "implemented", OWNER, "İçgörü listesi.", {
        existingFeature: "ai-insights-page",
        suppressHeader: true
      }),
      ...ch("/yardimci", "AI Operator", "ai-operator", OWNER, [
        ["eylem-planlari", "Eylem planları", "needs-api", "Planlanmış eylemler."],
        ["bilgi-merkezi", "Bilgi merkezi", "needs-api", "Dokümantasyon ve bilgi bankası."],
        ["calisma-gunlugu", "Çalışma günlüğü", "needs-api", "Operatör günlüğü."]
      ])
    ]
  }),
  n("cariler", "", "/cariler", "Cariler", "Core CRM", "crm", "implemented", OWNER, "Cari portföyü.", {
    children: ch("/cariler", "Core CRM", "crm", OWNER, [
      ["liste", "Cari listesi", "implemented", "Cari listesi; mevcut liste ekranına yönlendirilir.", undefined, "redirect:/cariler"],
      ["yeni", "Yeni cari", "needs-api", "Cari oluşturma; veri modeli tamamlanacak."]
    ])
  }),
  n("teklifler", "", "/teklifler", "Teklifler", "Core CRM", "offers", "implemented", OWNER, "Teklif yaşam döngüsü.", {
    children: ch("/teklifler", "Core CRM", "offers", OWNER, [
      ["liste", "Teklif listesi", "implemented", "Liste görünümü.", undefined, "redirect:/teklifler"],
      ["yeni", "Yeni teklif", "implemented", "Teklif oluşturma.", undefined, "redirect:/teklifler/yeni"]
    ])
  }),
  n("siparisler", "", "/siparisler", "Siparişler", "Core CRM", "orders", "implemented", OWNER, "Sipariş operasyonu.", {
    children: ch("/siparisler", "Core CRM", "orders", OWNER, [
      ["liste", "Sipariş listesi", "implemented", "Liste görünümü.", undefined, "redirect:/siparisler"],
      ["yeni", "Yeni sipariş", "implemented", "Sipariş oluşturma.", undefined, "redirect:/siparisler/yeni"]
    ])
  }),
  n("hizli-islem", "", "/hizli-islem", "Hızlı İşlem", "Operations", "quick", "implemented", OWNER, "Hızlı işlem merkezi.", {
    children: ch("/hizli-islem", "Operations", "quick", OWNER, [
      ["teklif", "Teklif", "implemented", "Hızlı teklif.", undefined, "redirect:/hizli-islem"],
      ["siparis", "Sipariş", "implemented", "Hızlı sipariş.", undefined, "redirect:/hizli-islem"],
      ["teslim", "Teslim", "implemented", "Hızlı teslim.", undefined, "redirect:/hizli-islem"],
      ["tahsilat", "Tahsilat", "implemented", "Hızlı tahsilat.", undefined, "redirect:/hizli-islem"],
      ["iade", "İade", "implemented", "Hızlı iade.", undefined, "redirect:/hizli-islem"],
      ["sonuc", "Sonuç", "needs-api", "İşlem sonuç özeti."],
      ["etki-analizi", "Etki analizi", "needs-api", "Operasyon etkisi."]
    ])
  }),
  n("tahsilatlar", "", "/tahsilatlar", "Tahsilatlar", "Operations", "payments", "implemented", OWNER, "Tahsilat yönetimi.", {
    children: ch("/tahsilatlar", "Operations", "payments", OWNER, [
      ["liste", "Liste", "implemented", "Liste görünümü.", undefined, "redirect:/tahsilatlar"],
      ["yeni", "Yeni tahsilat", "implemented", "Tahsilat girişi.", undefined, "redirect:/tahsilatlar/yeni"]
    ])
  }),
  n("faturalar", "", "/faturalar", "Faturalar", "Operations", "invoices", "implemented", OWNER, "Fatura yönetimi.", {
    children: ch("/faturalar", "Operations", "invoices", OWNER, [
      ["liste", "Liste", "implemented", "Liste görünümü.", undefined, "redirect:/faturalar"],
      ["yeni", "Yeni fatura", "needs-api", "Fatura oluşturma."]
    ])
  }),
  n("iadeler", "", "/iadeler", "İadeler", "Operations", "returns", "implemented", OWNER, "İade süreci.", {
    children: ch("/iadeler", "Operations", "returns", OWNER, [
      ["liste", "Liste", "implemented", "Liste görünümü.", undefined, "redirect:/iadeler"],
      ["yeni", "Yeni iade", "implemented", "İade oluşturma.", undefined, "redirect:/iadeler/yeni"]
    ])
  }),
  n("urunler", "", "/urunler", "Ürünler", "Core CRM", "products", "shell", OWNER, "Ürün kataloğu; stok modülü ile ilişkili.", {
    children: ch("/urunler", "Core CRM", "products", OWNER, [
      ["liste", "Ürün listesi", "implemented", "Stok / ürün listesine yönlendirme.", undefined, "redirect:/stok"],
      ["yeni", "Yeni ürün", "needs-api", "Ürün oluşturma."]
    ])
  }),
  n("stok", "", "/stok", "Stok", "Field & WMS", "stock", "implemented", OWNER, "Stok ve ürün görünürlüğü.", {
    children: ch("/stok", "Field & WMS", "stock", OWNER, [
      ["genel-bakis", "Genel bakış", "implemented", "Stok ana görünümü.", undefined, "redirect:/stok"],
      ["kritik-stok", "Kritik stok", "needs-api", "Kritik stok listesi."],
      ["stok-hareketleri", "Stok hareketleri", "needs-api", "Hareket defteri."],
      ["rezervasyonlar", "Rezervasyonlar", "needs-api", "Rezervasyonlar."],
      ["transferler", "Transferler", "needs-api", "Depo transferleri."],
      ["sayim", "Sayım", "needs-api", "Sayım ve sayım fişleri; detay rotası dinamik id ile genişletilecek."]
    ])
  }),
  n("depo-hazirlik", "", "/depo-hazirlik", "Depo hazırlık", "Field & WMS", "wms", "shell", OWNER, "Depo hazırlık süreçleri.", {
    children: ch("/depo-hazirlik", "Field & WMS", "wms", OWNER, [
      ["is-listesi", "İş listesi", "implemented", "Depo iş listesi.", undefined, "redirect:/depo"],
      ["toplama", "Toplama", "needs-api", "Toplama görevleri."],
      ["paketleme", "Paketleme", "needs-api", "Paketleme istasyonu."],
      ["barkod-okutma", "Barkod okutma", "needs-api", "Okutma ekranı."],
      ["gorevler", "Görevler", "needs-api", "Depo görevleri."],
      ["transfer", "Transfer", "needs-api", "Transfer işlemleri."]
    ])
  }),
  n("teslimatlar", "", "/teslimatlar", "Teslimatlar", "Operations", "delivery", "implemented", OWNER, "Teslimat yönetimi.", {
    children: ch("/teslimatlar", "Operations", "delivery", OWNER, [
      ["liste", "Liste", "implemented", "Liste görünümü.", undefined, "redirect:/teslimatlar"],
      ["rota", "Rota", "needs-api", "Rota planlama."],
      ["yeni", "Yeni teslimat", "needs-api", "Teslimat oluşturma."]
    ])
  }),
  n("belgeler", "", "/belgeler", "Belgeler", "Operations", "documents", "implemented", OWNER, "Belge merkezi.", {
    children: ch("/belgeler", "Operations", "documents", OWNER, [
      ["liste", "Liste", "implemented", "Liste görünümü.", undefined, "redirect:/belgeler"],
      ["sablonlar", "Şablonlar", "needs-api", "Belge şablonları."],
      ["arsiv", "Arşiv", "needs-api", "Arşiv görünümü."],
      ["yeni", "Yeni belge", "needs-api", "Belge oluşturma."]
    ])
  }),
  n("onaylar", "", "/onaylar", "Onaylar", "Approvals", "approvals", "implemented", OWNER, "Onay inbox ve operatör ekranı.", {
    children: ch("/onaylar", "Approvals", "approvals", OWNER, [
      ["bekleyenler", "Bekleyenler", "implemented", "Bekleyen onaylar.", undefined, "redirect:/onaylar"],
      ["inceleme", "İnceleme", "shell", "İnceleme kuyruğu; API bağlantısı bekleniyor."],
      ["tamamlananlar", "Tamamlananlar", "shell", "Tamamlanan onaylar; API bağlantısı bekleniyor."],
      ["kurallar", "Kurallar", "implemented", "Politika matrisi; domain kayitlarindan onay gerektiren aksiyonlar."],
      ["limitler", "Limitler", "needs-api", "Limit ve eşikler."]
    ])
  }),
  n("gorevler", "", "/gorevler", "Görevler", "Tasks", "tasks", "implemented", OWNER, "Görev merkezi.", {
    children: ch("/gorevler", "Tasks", "tasks", OWNER, [
      ["merkez", "Merkez", "implemented", "Görev listesi.", undefined, "redirect:/gorevler"],
      ["benim-gorevlerim", "Benim görevlerim", "needs-api", "Kişisel görevler."],
      ["ekip-gorevleri", "Ekip görevleri", "needs-api", "Ekip görünümü."],
      ["gecikenler", "Gecikenler", "needs-api", "Geciken işler."],
      ["otomatik-gorevler", "Otomatik görevler", "needs-api", "Otomasyon görevleri."]
    ])
  }),
  n("is-akislari", "", "/is-akislari", "İş akışları", "Workflows", "workflows", "shell", OWNER, "İş akışı yönetimi.", {
    children: ch("/is-akislari", "Workflows", "workflows", OWNER, [
      ["senaryolar", "Senaryolar", "needs-api", "Senaryo kataloğu."],
      ["tetikleyiciler", "Tetikleyiciler", "needs-api", "Tetikleyici kuralları."],
      ["eylemler", "Eylemler", "needs-api", "Eylem kütüphanesi."],
      ["gecikmeler", "Gecikmeler", "needs-api", "Gecikme analitiği."],
      ["retry-dlq", "Retry / DLQ", "needs-api", "Yeniden deneme ve DLQ."],
      ["schedules", "Zamanlamalar", "needs-api", "Zamanlanmış işler."]
    ])
  }),
  n("entegrasyonlar", "", "/entegrasyonlar", "Entegrasyonlar", "Integrations", "integrations", "shell", OWNER, "Kanal ve sistem entegrasyonları.", {
    children: ch("/entegrasyonlar", "Integrations", "integrations", OWNER, [
      ["genel", "Genel", "needs-api", "Entegrasyon özeti."],
      ["whatsapp", "WhatsApp", "needs-api", "WhatsApp bağlayıcı ayarları."],
      ["instagram", "Instagram", "needs-api", "Instagram bağlayıcı."],
      ["facebook-messenger", "Facebook Messenger", "needs-api", "Messenger bağlayıcı."],
      ["email", "E-posta", "needs-api", "E-posta bağlayıcı."],
      ["sms", "SMS", "needs-api", "SMS bağlayıcı."],
      ["erp", "ERP", "implemented", "ERP ekranı.", undefined, "redirect:/erp"],
      ["fabrika", "Fabrika", "implemented", "Fabrika modülü.", undefined, "redirect:/fabrikalar/siparisler"],
      ["webhooks", "Webhooks", "needs-api", "Webhook uçları."],
      ["mapping", "Mapping", "needs-api", "Alan eşlemeleri."],
      ["queue-monitor", "Kuyruk izleme", "needs-api", "Kuyruk monitörü."],
      ["provider-health", "Sağlayıcı sağlığı", "needs-api", "Sağlık panosu."]
    ])
  }),
  n("raporlar", "", "/raporlar", "Raporlar", "Analytics", "reports", "implemented", OWNER, "Raporlama.", {
    children: ch("/raporlar", "Analytics", "reports", OWNER, [
      ["satis", "Satış", "needs-api", "Satış raporları."],
      ["tahsilat", "Tahsilat", "needs-api", "Tahsilat raporları."],
      ["stok", "Stok", "needs-api", "Stok raporları."],
      ["depo", "Depo", "needs-api", "Depo raporları."],
      ["kanal-performansi", "Kanal performansı", "needs-api", "Kanal metrikleri."],
      ["ai-performansi", "AI performansı", "needs-api", "AI metrikleri."],
      ["sla", "SLA", "needs-api", "SLA raporları."],
      ["tenant-kullanim", "Tenant kullanımı", "needs-api", "Kullanım metrikleri."],
      ["abonelik-ve-limitler", "Abonelik ve limitler", "needs-api", "Abonelik bilgisi."]
    ])
  }),
  n("uyumluluk", "", "/uyumluluk", "Uyumluluk", "Compliance", "compliance", "shell", OWNER, "Denetim ve uyumluluk.", {
    children: ch("/uyumluluk", "Compliance", "compliance", OWNER, [
      ["audit-olaylari", "Denetim olayları", "needs-api", "Denetim olay akışı."],
      ["timeline", "Zaman çizelgesi", "needs-api", "Uyumluluk zaman çizelgesi."],
      ["kvkk", "KVKK", "needs-api", "KVKK kayıtları."],
      ["veri-saklama", "Veri saklama", "needs-api", "Saklama politikaları."],
      ["erisim-kayitlari", "Erişim kayıtları", "needs-api", "Erişim günlüğü."],
      ["exportlar", "Dışa aktarımlar", "needs-api", "Export işlemleri."]
    ])
  }),
  n("kurulum", "", "/kurulum", "Kurulum", "Setup", "setup", "implemented", OWNER, "Kurulum ve veri hazırlığı.", {
    children: ch("/kurulum", "Setup", "setup", OWNER, [
      ["sirket", "Şirket", "needs-api", "Şirket profili."],
      ["subeler", "Şubeler", "needs-api", "Şube yönetimi."],
      ["depolar", "Depolar", "needs-api", "Depo tanımları."],
      ["kullanicilar", "Kullanıcılar", "needs-api", "Kullanıcı davet ve roller."],
      ["roller-ve-izinler", "Roller ve izinler", "needs-api", "RBAC yapılandırması."],
      ["veri-yukleme", "Veri yükleme", "implemented", "Veri içe aktarma.", undefined, "redirect:/kurulum/veri-yukleme"],
      ["fiyat-ve-kategori", "Fiyat ve kategori", "needs-api", "Fiyatlandırma hazırlığı."],
      ["pilot-hazirlik", "Canlıya hazırlık", "implemented", "Hazırlık kontrol listesi.", undefined, "redirect:/ayarlar/pilot-hazirlik"],
      ["staging-kontrol", "Staging kontrol", "implemented", "Staging kontrolü.", undefined, "redirect:/ayarlar/staging-kontrol"]
    ])
  }),
  n("ayarlar", "", "/ayarlar", "Ayarlar", "Settings", "settings", "implemented", OWNER, "Platform ayarları.", {
    children: [
      ...ch("/ayarlar", "Settings", "settings", OWNER, [
      ["tenant", "Tenant", "shell", "Kiracı ayarları; modül API bağlantısı eksik olabilir."],
      ["moduller", "Modüller", "needs-api", "Modül aç/kapa."],
      ["kanallar", "Kanallar", "needs-api", "Kanal politikaları."],
      ["onay-politikalari", "Onay politikaları", "needs-api", "Onay motoru politikaları."],
      ["ai-politikalari", "AI politikaları", "needs-api", "AI güvenlik politikaları."],
      ["risk-kurallari", "Risk kuralları", "needs-api", "Risk motoru."],
      ["bildirimler", "Bildirimler", "needs-api", "Bildirim şablonları."],
      ["tema", "Tema", "needs-api", "Görünüm ayarları."],
      ["faturalama-ve-paket", "Faturalama ve paket", "needs-api", "Abonelik ve faturalama."],
      ["gelistirici", "Geliştirici", "needs-api", "API anahtarları ve webhooks."]
    ]),
      n(
        "settings-operasyon-gozlem",
        "operasyon-gozlem",
        "/ayarlar",
        "Operasyon ve Gözlem",
        "Settings",
        "settings",
        "implemented",
        OWNER,
        "Trace/tenant korelasyonu, release/pilot checklist ve haftalık pilot geri bildirimi şablonu.",
        { existingFeature: "link:/ayarlar/operasyon-gozlem", suppressHeader: true }
      )
    ]
  })
];

let flatCache: Map<string, ProductRouteNode> | null = null;

export function resetProductRouteManifestCache(): void {
  flatCache = null;
}

export function flattenProductRoutes(nodes: ProductRouteNode[] = PRODUCT_ROUTE_FOREST): Map<string, ProductRouteNode> {
  if (flatCache) return flatCache;
  const map = new Map<string, ProductRouteNode>();
  const walk = (node: ProductRouteNode) => {
    map.set(node.href, node);
    node.children?.forEach(walk);
  };
  nodes.forEach(walk);
  flatCache = map;
  return map;
}

export function getProductRouteNode(href: string): ProductRouteNode | undefined {
  const normalized = href.length > 1 && href.endsWith("/") ? href.replace(/\/+$/, "") : href;
  return flattenProductRoutes().get(normalized);
}

/** PageMeta bastırma: manifestte suppressHeader true olan rotalar + tam eşleşme önekleri */
export function collectProductSuppressHeaderHrefs(): string[] {
  const set = new Set<string>();
  const walk = (node: ProductRouteNode) => {
    if (node.suppressHeader) set.add(node.href);
    node.children?.forEach(walk);
  };
  PRODUCT_ROUTE_FOREST.forEach(walk);
  set.add("/whatsapp");
  return [...set].sort((a, b) => b.length - a.length);
}

export function shouldSuppressShellPageMeta(pathname: string): boolean {
  const p = pathname.length > 1 && pathname.endsWith("/") ? pathname.replace(/\/+$/, "") : pathname;
  if (p.startsWith("/onaylar")) return true;
  return collectProductSuppressHeaderHrefs().some((h) => p === h || p.startsWith(`${h}/`));
}

export const PRODUCT_MODULE_ROOT_HREFS = PRODUCT_ROUTE_FOREST.map((m) => m.href);
