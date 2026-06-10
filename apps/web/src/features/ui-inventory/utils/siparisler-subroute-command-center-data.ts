import {
  buildConfig,
  type InventoryPageConfig,
  type InventoryScopeRow,
  type InventoryScopeStatus
} from "./system-state-command-center-data";
import type { LucideIconName } from "../../../components/icons/lucide-icons";
import { buildOrderEntityNav, orderEntityHref } from "./entity-layer-nav";

const STATUS_LABEL: Record<InventoryScopeStatus, string> = {
  ready: "Hazır",
  shell: "İskelet",
  "needs-api": "API bekleniyor",
  blocked: "Kapalı"
};

function invRow(partial: Omit<InventoryScopeRow, "statusLabel">): InventoryScopeRow {
  return { ...partial, statusLabel: STATUS_LABEL[partial.status] };
}

function orderHref(orderId: string, suffix = ""): string {
  return `/siparisler/${orderId}${suffix}`;
}

export const LISTE_ROWS: InventoryScopeRow[] = [
  invRow({
    id: "main-desk",
    title: "Sipariş komut masası",
    relatedEntity: "Siparişler",
    status: "ready",
    sourceRoute: "/siparisler",
    readinessChips: ["liste", "sağ panel", "aksiyon"],
    description: "Ana sipariş masası /siparisler üzerinde; bu route liste katmanı sözleşmesini dokümante eder.",
    navHref: "/siparisler"
  }),
  invRow({
    id: "list-alias",
    title: "Liste alias route",
    relatedEntity: "Navigasyon",
    status: "ready",
    sourceRoute: "/siparisler/liste",
    readinessChips: ["alias", "redirect kaldırıldı"],
    description: "Eski /siparisler/liste bağlantıları readiness katmanına yönlendirilir."
  }),
  invRow({
    id: "filter-contract",
    title: "Filtre sözleşmesi",
    relatedEntity: "Filtre",
    status: "needs-api",
    sourceRoute: "/siparisler/liste",
    readinessChips: ["durum", "cari", "tarih"],
    description: "Canlı filtre sonuçları API bağlanınca tenant-scope uygulanır."
  }),
  invRow({
    id: "export-guard",
    title: "Export hazırlığı",
    relatedEntity: "Export",
    status: "blocked",
    sourceRoute: "/siparisler/liste",
    readinessChips: ["PDF", "Excel"],
    description: "Export butonları API hazır olana kadar kapalı kalır."
  })
];

export const LISTE_CONFIG = buildConfig({
  prefix: "hz-siparisler-liste-center",
  dataPage: "siparisler-liste-command-center",
  title: "Sipariş listesi katmanı",
  subtitle:
    "Sipariş liste alias route'unu gerçek API sonucu uydurmadan, ana masa bağlantısı ve readiness contract ile yönetin.",
  icon: "shopping-cart",
  rows: LISTE_ROWS,
  alertCopy: "Liste verisi ana /siparisler komut masasında gösterilir; bu sayfa canlı sayaç üretmez.",
  listNav: { href: "/siparisler", label: "← Operasyon masası" }
});

export type OrderLayerKey =
  | "ozet"
  | "satirlar"
  | "odeme-tahsilat"
  | "teslimat"
  | "fatura"
  | "iade"
  | "depo-stok-etkisi"
  | "timeline";

const LAYER_META: Record<
  OrderLayerKey,
  {
    prefix: string;
    dataPage: string;
    title: string;
    subtitle: string;
    icon: LucideIconName;
    alertCopy: string;
    buildRows: (orderId: string) => InventoryScopeRow[];
  }
> = {
  ozet: {
    prefix: "hz-siparisler-orderid-ozet-center",
    dataPage: "siparisler-orderid-ozet-command-center",
    title: "Sipariş özet katmanı",
    subtitle: "Sipariş detay özet katmanını readiness contract ile yönetin; canlı KPI uydurulmaz.",
    icon: "clipboard-list",
    alertCopy: "Özet kartları API hazır olunca tenant-scope okunur; önizleme kayıtları canlı veri değildir.",
    buildRows: (id) => [
      invRow({
        id: "detail-root",
        title: "Sipariş detay kökü",
        relatedEntity: "Sipariş",
        status: "ready",
        sourceRoute: orderHref(id),
        readinessChips: ["orderId", "durum"],
        description: "Ana detay sekmeleri kök route üzerinde birleşir.",
        navHref: orderHref(id)
      }),
      invRow({
        id: "summary-cards",
        title: "Özet kartları",
        relatedEntity: "KPI",
        status: "needs-api",
        sourceRoute: orderHref(id, "/ozet"),
        readinessChips: ["tutar", "kaynak", "risk"],
        description: "Sipariş özeti gerçek sipariş API'si ile gelir."
      }),
      invRow({
        id: "quick-op",
        title: "Hızlı işlem bağlantısı",
        relatedEntity: "Hızlı işlem",
        status: "ready",
        sourceRoute: "/hizli-islem",
        readinessChips: ["sipariş", "onay"],
        description: "Operasyon aksiyonları Hızlı İşlem ve onay zincirinden geçer.",
        navHref: "/hizli-islem/siparis"
      }),
      invRow({
        id: "demo-guard",
        title: "Önizleme kayıt koruması",
        relatedEntity: "UI",
        status: "ready",
        sourceRoute: orderHref(id, "/ozet"),
        readinessChips: ["demo-row", "fail-closed"],
        description: "Önizleme satır kimlikleri canlı sipariş detayı açmaz."
      })
    ]
  },
  satirlar: {
    prefix: "hz-siparisler-orderid-satirlar-center",
    dataPage: "siparisler-orderid-satirlar-command-center",
    title: "Sipariş satırları",
    subtitle: "Sipariş satır katmanını readiness contract ile yönetin.",
    icon: "clipboard-list",
    alertCopy: "Satır tutarları ve stok etkisi canlı API olmadan hesaplanmaz.",
    buildRows: (id) => [
      invRow({
        id: "line-grid",
        title: "Satır grid",
        relatedEntity: "Satır",
        status: "needs-api",
        sourceRoute: orderHref(id, "/satirlar"),
        readinessChips: ["lineId", "ürün", "miktar"],
        description: "Satır listesi tenant-scope sipariş API ile okunur.",
        navHref: orderHref(id)
      }),
      invRow({
        id: "stock-reserve",
        title: "Stok rezervasyonu",
        relatedEntity: "Stok",
        status: "shell",
        sourceRoute: orderHref(id, "/depo-stok-etkisi"),
        readinessChips: ["rezervasyon", "depo"],
        description: "Stok düşümü onay ve domain servisi ile yapılır.",
        navHref: orderHref(id, "/depo-stok-etkisi")
      }),
      invRow({
        id: "totals",
        title: "Toplamlar",
        relatedEntity: "Finans",
        status: "needs-api",
        sourceRoute: orderHref(id, "/satirlar"),
        readinessChips: ["ara toplam", "KDV"],
        description: "Toplam alanları gerçek hesap sonucu ile doldurulur."
      }),
      invRow({
        id: "write-guard",
        title: "Satır yazımı",
        relatedEntity: "Mutation",
        status: "blocked",
        sourceRoute: orderHref(id, "/satirlar"),
        readinessChips: ["Kaydet", "guard"],
        description: "Satır mutation'ı permission guard olmadan çalışmaz."
      })
    ]
  },
  "odeme-tahsilat": {
    prefix: "hz-siparisler-orderid-odeme-tahsilat-center",
    dataPage: "siparisler-orderid-odeme-tahsilat-command-center",
    title: "Ödeme / tahsilat katmanı",
    subtitle: "Sipariş ödeme ve tahsilat readiness katmanını finans guard ile yönetin.",
    icon: "circle-dollar-sign",
    alertCopy: "Tahsilat kayıtları onay ve audit zincirinden geçer; başarı durumu uydurulmaz.",
    buildRows: (id) => [
      invRow({
        id: "payment-list",
        title: "Tahsilat listesi",
        relatedEntity: "Tahsilat",
        status: "needs-api",
        sourceRoute: orderHref(id, "/odeme-tahsilat"),
        readinessChips: ["paymentId", "tutar"],
        description: "Siparişe bağlı tahsilatlar API ile okunur.",
        navHref: "/tahsilatlar"
      }),
      invRow({
        id: "new-payment",
        title: "Yeni tahsilat",
        relatedEntity: "Tahsilat",
        status: "ready",
        sourceRoute: "/tahsilatlar/yeni",
        readinessChips: ["create_payment", "onay"],
        description: "Yeni tahsilat formu sipariş bağlamı ile açılabilir.",
        navHref: "/tahsilatlar/yeni"
      }),
      invRow({
        id: "approval",
        title: "Onay bileti",
        relatedEntity: "Onay",
        status: "ready",
        sourceRoute: "/onaylar",
        readinessChips: ["policy", "guard"],
        description: "Kritik tahsilat işlemleri onay kutusuna düşer.",
        navHref: "/onaylar"
      }),
      invRow({
        id: "write-guard",
        title: "Tahsilat yazımı",
        relatedEntity: "Mutation",
        status: "blocked",
        sourceRoute: orderHref(id, "/odeme-tahsilat"),
        readinessChips: ["Kaydet", "guard"],
        description: "Tahsilat mutation'ı permission guard olmadan çalışmaz."
      })
    ]
  },
  teslimat: {
    prefix: "hz-siparisler-orderid-teslimat-center",
    dataPage: "siparisler-orderid-teslimat-command-center",
    title: "Sipariş teslimat katmanı",
    subtitle: "Teslimat planı ve tamamlama readiness katmanını operasyon guard ile yönetin.",
    icon: "truck",
    alertCopy: "Teslim tamamlama onay gerektirir; sahte teslim durumu üretilmez.",
    buildRows: (id) => [
      invRow({
        id: "delivery-plan",
        title: "Teslimat planı",
        relatedEntity: "Teslimat",
        status: "needs-api",
        sourceRoute: orderHref(id, "/teslimat"),
        readinessChips: ["rota", "tarih"],
        description: "Teslimat planı tenant-scope API ile okunur.",
        navHref: "/teslimatlar"
      }),
      invRow({
        id: "complete-delivery",
        title: "Teslim tamamlama",
        relatedEntity: "Mutation",
        status: "blocked",
        sourceRoute: orderHref(id, "/teslimat"),
        readinessChips: ["complete_delivery", "onay"],
        description: "Tamamlama execution dispatcher ile çalışır."
      }),
      invRow({
        id: "quick-op",
        title: "Hızlı işlem teslim",
        relatedEntity: "Hızlı işlem",
        status: "ready",
        sourceRoute: "/hizli-islem",
        readinessChips: ["teslim", "fiş"],
        description: "Teslim fişi Hızlı İşlem workbench üzerinden başlatılır.",
        navHref: "/hizli-islem/teslim"
      }),
      invRow({
        id: "document",
        title: "Teslim belgesi",
        relatedEntity: "Belge",
        status: "shell",
        sourceRoute: "/belgeler",
        readinessChips: ["PDF", "arşiv"],
        description: "Teslim belgesi belge merkezinde izlenir.",
        navHref: "/belgeler"
      })
    ]
  },
  fatura: {
    prefix: "hz-siparisler-orderid-fatura-center",
    dataPage: "siparisler-orderid-fatura-command-center",
    title: "Sipariş fatura katmanı",
    subtitle: "Fatura kesim readiness katmanını onay ve belge zinciri ile yönetin.",
    icon: "file-text",
    alertCopy: "Fatura oluşturma create_invoice policy ve onay gerektirir.",
    buildRows: (id) => [
      invRow({
        id: "invoice-draft",
        title: "Fatura taslağı",
        relatedEntity: "Fatura",
        status: "shell",
        sourceRoute: orderHref(id, "/fatura"),
        readinessChips: ["taslak", "satır"],
        description: "Fatura taslağı proposal/onay akışı ile üretilir.",
        navHref: "/faturalar"
      }),
      invRow({
        id: "approval",
        title: "Onay bileti",
        relatedEntity: "Onay",
        status: "ready",
        sourceRoute: "/onaylar",
        readinessChips: ["create_invoice", "policy"],
        description: "Fatura kesimi onay kutusuna düşer.",
        navHref: "/onaylar"
      }),
      invRow({
        id: "erp-sync",
        title: "ERP senkron",
        relatedEntity: "ERP",
        status: "needs-api",
        sourceRoute: "/erp",
        readinessChips: ["adapter", "outbox"],
        description: "ERP yazımı adapter ve kuyruk ile yapılır.",
        navHref: "/erp"
      }),
      invRow({
        id: "export",
        title: "Belge export",
        relatedEntity: "Export",
        status: "blocked",
        sourceRoute: orderHref(id, "/fatura"),
        readinessChips: ["PDF", "e-Fatura"],
        description: "Export API hazır olana kadar kapalı."
      })
    ]
  },
  iade: {
    prefix: "hz-siparisler-orderid-iade-center",
    dataPage: "siparisler-orderid-iade-command-center",
    title: "Sipariş iade katmanı",
    subtitle: "İade readiness katmanını stok ve onay zinciri ile yönetin.",
    icon: "rotate-ccw",
    alertCopy: "İade işlemi create_return policy ve onay gerektirir; stok etkisi domain servisi ile yazılır.",
    buildRows: (id) => [
      invRow({
        id: "return-draft",
        title: "İade taslağı",
        relatedEntity: "İade",
        status: "shell",
        sourceRoute: orderHref(id, "/iade"),
        readinessChips: ["satır", "neden"],
        description: "İade taslağı onay öncesi düzenlenir.",
        navHref: "/iadeler"
      }),
      invRow({
        id: "approval",
        title: "Onay bileti",
        relatedEntity: "Onay",
        status: "ready",
        sourceRoute: "/onaylar",
        readinessChips: ["create_return", "policy"],
        description: "İade onay kutusuna düşer.",
        navHref: "/onaylar"
      }),
      invRow({
        id: "stock-return",
        title: "Stok iade girişi",
        relatedEntity: "Stok",
        status: "needs-api",
        sourceRoute: orderHref(id, "/depo-stok-etkisi"),
        readinessChips: ["stok+", "depo"],
        description: "İade stok hareketi tenant-scope yazılır.",
        navHref: orderHref(id, "/depo-stok-etkisi")
      }),
      invRow({
        id: "quick-op",
        title: "Hızlı işlem iade",
        relatedEntity: "Hızlı işlem",
        status: "ready",
        sourceRoute: "/hizli-islem",
        readinessChips: ["iade", "fiş"],
        description: "İade fişi Hızlı İşlem üzerinden başlatılır.",
        navHref: "/hizli-islem/iade"
      })
    ]
  },
  "depo-stok-etkisi": {
    prefix: "hz-siparisler-orderid-depo-stok-etkisi-center",
    dataPage: "siparisler-orderid-depo-stok-etkisi-command-center",
    title: "Depo / stok etkisi",
    subtitle: "Sipariş depo ve stok etkisi readiness katmanını rezervasyon guard ile yönetin.",
    icon: "package",
    alertCopy: "Stok düşümü ve rezervasyon canlı stok API'si ile doğrulanır; sahte stok miktarı gösterilmez.",
    buildRows: (id) => [
      invRow({
        id: "reservation",
        title: "Rezervasyon",
        relatedEntity: "Stok",
        status: "needs-api",
        sourceRoute: orderHref(id, "/depo-stok-etkisi"),
        readinessChips: ["rezervasyon", "depo"],
        description: "Rezervasyon satırları stok servisi ile okunur.",
        navHref: "/stok"
      }),
      invRow({
        id: "warehouse",
        title: "Depo seçimi",
        relatedEntity: "Depo",
        status: "shell",
        sourceRoute: "/depo",
        readinessChips: ["depoId", "raf"],
        description: "Depo ataması operasyon kurallarına bağlıdır.",
        navHref: "/depo"
      }),
      invRow({
        id: "factory",
        title: "Fabrika siparişi",
        relatedEntity: "Fabrika",
        status: "needs-api",
        sourceRoute: "/fabrikalar/siparisler",
        readinessChips: ["senkron", "adapter"],
        description: "Fabrika entegrasyonu adapter ile senkronize edilir.",
        navHref: "/fabrikalar/siparisler"
      }),
      invRow({
        id: "mutation-guard",
        title: "Stok yazımı",
        relatedEntity: "Mutation",
        status: "blocked",
        sourceRoute: orderHref(id, "/depo-stok-etkisi"),
        readinessChips: ["guard", "onay"],
        description: "Stok mutation'ı policy onayı olmadan çalışmaz."
      })
    ]
  },
  timeline: {
    prefix: "hz-siparisler-orderid-timeline-center",
    dataPage: "siparisler-orderid-timeline-command-center",
    title: "Sipariş timeline",
    subtitle: "Sipariş timeline katmanını audit izi ve readiness contract ile yönetin.",
    icon: "clipboard-check",
    alertCopy: "Timeline olayları tenant-scope audit API ile yazılır; sahte olay eklenmez.",
    buildRows: (id) => [
      invRow({
        id: "timeline-feed",
        title: "Timeline akışı",
        relatedEntity: "Audit",
        status: "needs-api",
        sourceRoute: orderHref(id, "/timeline"),
        readinessChips: ["timeline", "auditEventId"],
        description: "Durum değişimleri ve operasyon notları kronolojik listelenir.",
        navHref: orderHref(id)
      }),
      invRow({
        id: "approval-events",
        title: "Onay olayları",
        relatedEntity: "Onay",
        status: "ready",
        sourceRoute: "/onaylar",
        readinessChips: ["onay", "execution"],
        description: "Onay ve icra olayları audit ile timeline'a yazılır.",
        navHref: "/onaylar"
      }),
      invRow({
        id: "factory-events",
        title: "Fabrika olayları",
        relatedEntity: "Fabrika",
        status: "shell",
        sourceRoute: "/fabrikalar/siparisler",
        readinessChips: ["webhook", "senkron"],
        description: "Fabrika durum güncellemeleri adapter üzerinden gelir.",
        navHref: "/fabrikalar/siparisler"
      }),
      invRow({
        id: "ai-note",
        title: "AI öneri notu",
        relatedEntity: "AI",
        status: "shell",
        sourceRoute: orderHref(id, "/timeline"),
        readinessChips: ["proposal-only"],
        description: "AI yalnızca öneri üretir; doğrudan timeline yazmaz."
      })
    ]
  }
};

export function buildOrderLayerConfig(layer: OrderLayerKey, orderId: string): InventoryPageConfig {
  const meta = LAYER_META[layer];
  return buildConfig({
    prefix: meta.prefix,
    dataPage: meta.dataPage,
    title: meta.title,
    subtitle: meta.subtitle,
    icon: meta.icon,
    alertCopy: meta.alertCopy,
    rows: meta.buildRows(orderId),
    navItems: buildOrderEntityNav(orderId),
    activeNavHref: orderEntityHref(orderId, layer),
    listNav: { href: "/siparisler", label: "← Sipariş listesi" }
  });
}

