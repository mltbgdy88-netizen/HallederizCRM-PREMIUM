import {
  buildConfig,
  type InventoryPageConfig,
  type InventoryScopeRow,
  type InventoryScopeStatus
} from "./system-state-command-center-data";
import type { LucideIconName } from "../../../components/icons/lucide-icons";
import { buildCustomerEntityNav, customerEntityHref } from "./entity-layer-nav";

const STATUS_LABEL: Record<InventoryScopeStatus, string> = {
  ready: "Hazır",
  shell: "İskelet",
  "needs-api": "API bekleniyor",
  blocked: "Kapalı"
};

function invRow(partial: Omit<InventoryScopeRow, "statusLabel">): InventoryScopeRow {
  return { ...partial, statusLabel: STATUS_LABEL[partial.status] };
}

function customerHref(customerId: string, suffix = ""): string {
  return `/cariler/${customerId}${suffix}`;
}

export const LISTE_ROWS: InventoryScopeRow[] = [
  invRow({
    id: "main-list",
    title: "Cari komut listesi",
    relatedEntity: "Cariler",
    status: "ready",
    sourceRoute: "/cariler",
    readinessChips: ["liste", "sağ panel", "aksiyon"],
    description: "Ana cari listesi /cariler üzerinde; bu route liste katmanı sözleşmesini dokümante eder.",
    navHref: "/cariler"
  }),
  invRow({
    id: "list-alias",
    title: "Liste alias route",
    relatedEntity: "Navigasyon",
    status: "ready",
    sourceRoute: "/cariler/liste",
    readinessChips: ["alias", "redirect kaldırıldı"],
    description: "Eski /cariler/liste bağlantıları readiness katmanına yönlendirilir."
  }),
  invRow({
    id: "filter-contract",
    title: "Filtre sözleşmesi",
    relatedEntity: "Filtre",
    status: "needs-api",
    sourceRoute: "/cariler/liste",
    readinessChips: ["şehir", "risk", "bakiye"],
    description: "Canlı filtre sonuçları API bağlanınca tenant-scope uygulanır."
  }),
  invRow({
    id: "export-guard",
    title: "Export hazırlığı",
    relatedEntity: "Export",
    status: "blocked",
    sourceRoute: "/cariler/liste",
    readinessChips: ["PDF", "Excel"],
    description: "Export butonları API hazır olana kadar kapalı kalır."
  })
];

export const LISTE_CONFIG = buildConfig({
  prefix: "hz-cariler-liste-center",
  dataPage: "cariler-liste-command-center",
  title: "Cari listesi katmanı",
  subtitle:
    "Cari liste alias route'unu gerçek API sonucu uydurmadan, ana liste bağlantısı ve readiness contract ile yönetin.",
  icon: "users-round",
  rows: LISTE_ROWS,
  alertCopy: "Liste verisi ana /cariler ekranında gösterilir; bu sayfa canlı sayaç üretmez.",
  listNav: { href: "/cariler", label: "← Operasyon masası" }
});

export type CustomerLayerKey =
  | "ozet"
  | "iletisim"
  | "finans"
  | "teklifler"
  | "siparisler"
  | "tahsilatlar"
  | "timeline";

const LAYER_META: Record<
  CustomerLayerKey,
  {
    prefix: string;
    dataPage: string;
    title: string;
    subtitle: string;
    icon: LucideIconName;
    alertCopy: string;
    buildRows: (customerId: string) => InventoryScopeRow[];
  }
> = {
  ozet: {
    prefix: "hz-cariler-customerid-ozet-center",
    dataPage: "cariler-customerid-ozet-command-center",
    title: "Cari özet katmanı",
    subtitle: "Cari detay özet katmanını readiness contract ile yönetin; canlı KPI uydurulmaz.",
    icon: "clipboard-list",
    alertCopy: "Özet kartları API hazır olunca tenant-scope okunur; önizleme kayıtları canlı veri değildir.",
    buildRows: (id) => [
      invRow({
        id: "detail-root",
        title: "Cari detay kökü",
        relatedEntity: "Cari",
        status: "ready",
        sourceRoute: customerHref(id),
        readinessChips: ["customerId", "kimlik"],
        description: "Ana detay sekmeleri kök route üzerinde birleşir.",
        navHref: customerHref(id)
      }),
      invRow({
        id: "summary-cards",
        title: "Özet kartları",
        relatedEntity: "KPI",
        status: "needs-api",
        sourceRoute: customerHref(id, "/ozet"),
        readinessChips: ["bakiye", "risk", "açık iş"],
        description: "Finans ve operasyon özetleri gerçek hesap API'si ile gelir."
      }),
      invRow({
        id: "quick-actions",
        title: "Hızlı aksiyonlar",
        relatedEntity: "Navigasyon",
        status: "ready",
        sourceRoute: customerHref(id),
        readinessChips: ["teklif", "sipariş", "tahsilat"],
        description: "Hızlı işlem bağlantıları permission guard ile açılır.",
        navHref: "/hizli-islem"
      }),
      invRow({
        id: "demo-guard",
        title: "Önizleme kayıt koruması",
        relatedEntity: "UI",
        status: "ready",
        sourceRoute: customerHref(id, "/ozet"),
        readinessChips: ["demo-row", "fail-closed"],
        description: "Önizleme satır kimlikleri canlı cari detayı açmaz."
      })
    ]
  },
  iletisim: {
    prefix: "hz-cariler-customerid-iletisim-center",
    dataPage: "cariler-customerid-iletisim-command-center",
    title: "Cari iletişim katmanı",
    subtitle: "İletişim ve yetkili kişi katmanını readiness contract ile yönetin.",
    icon: "message-circle",
    alertCopy: "İletişim güncellemeleri mutation guard ve audit timeline ile yazılır.",
    buildRows: (id) => [
      invRow({
        id: "contacts",
        title: "Yetkili kişiler",
        relatedEntity: "İletişim",
        status: "needs-api",
        sourceRoute: customerHref(id, "/iletisim"),
        readinessChips: ["contactId", "telefon"],
        description: "Yetkili kişi listesi tenant-scope API ile okunur.",
        navHref: customerHref(id)
      }),
      invRow({
        id: "addresses",
        title: "Adresler",
        relatedEntity: "Adres",
        status: "needs-api",
        sourceRoute: customerHref(id, "/iletisim"),
        readinessChips: ["addressId", "şehir"],
        description: "Adres kartları API bağlanınca düzenlenebilir."
      }),
      invRow({
        id: "whatsapp-link",
        title: "WhatsApp bağlantısı",
        relatedEntity: "Kanal",
        status: "shell",
        sourceRoute: "/whatsapp",
        readinessChips: ["kanal policy", "outbound"],
        description: "Outbound mesaj kanal policy ve permission gerektirir.",
        navHref: "/whatsapp"
      }),
      invRow({
        id: "write-guard",
        title: "İletişim yazımı",
        relatedEntity: "Mutation",
        status: "blocked",
        sourceRoute: customerHref(id, "/iletisim"),
        readinessChips: ["Kaydet", "guard"],
        description: "İletişim mutation'ı onay ve audit zincirinden geçer."
      })
    ]
  },
  finans: {
    prefix: "hz-cariler-customerid-finans-center",
    dataPage: "cariler-customerid-finans-command-center",
    title: "Cari finans katmanı",
    subtitle: "Hesap özeti ve hareket katmanını readiness contract ile yönetin.",
    icon: "circle-dollar-sign",
    alertCopy: "Bakiye ve hareket satırları canlı ERP verisi uydurulmadan gösterilmez.",
    buildRows: (id) => [
      invRow({
        id: "account-summary",
        title: "Hesap özeti",
        relatedEntity: "Finans",
        status: "needs-api",
        sourceRoute: customerHref(id, "/finans"),
        readinessChips: ["bakiye", "vade", "limit"],
        description: "Hesap özeti tenant-scope finans API ile gelir.",
        navHref: customerHref(id)
      }),
      invRow({
        id: "ledger",
        title: "Hareket defteri",
        relatedEntity: "Ledger",
        status: "needs-api",
        sourceRoute: customerHref(id, "/finans"),
        readinessChips: ["ledgerEntryId", "tutar"],
        description: "Hareket listesi salt okunur arşiv olarak API'den okunur."
      }),
      invRow({
        id: "risk",
        title: "Risk profili",
        relatedEntity: "Risk",
        status: "shell",
        sourceRoute: customerHref(id, "/finans"),
        readinessChips: ["riskState", "limit"],
        description: "Risk rozeti domain hesabı ile üretilir; sahte risk skoru yok."
      }),
      invRow({
        id: "payment-link",
        title: "Tahsilat bağlantısı",
        relatedEntity: "Tahsilat",
        status: "ready",
        sourceRoute: customerHref(id, "/tahsilatlar"),
        readinessChips: ["tahsilat", "onay"],
        description: "Tahsilat katmanına güvenli geçiş.",
        navHref: customerHref(id, "/tahsilatlar")
      })
    ]
  },
  teklifler: {
    prefix: "hz-cariler-customerid-teklifler-center",
    dataPage: "cariler-customerid-teklifler-command-center",
    title: "Cari teklif ilişkileri",
    subtitle: "Cariye bağlı teklif katmanını readiness contract ile yönetin.",
    icon: "file-text",
    alertCopy: "Teklif listesi yalnızca gerçek teklif API'si ile doldurulur.",
    buildRows: (id) => [
      invRow({
        id: "offer-list",
        title: "Teklif listesi",
        relatedEntity: "Teklif",
        status: "needs-api",
        sourceRoute: customerHref(id, "/teklifler"),
        readinessChips: ["offerId", "durum"],
        description: "Cari filtreli teklif listesi API ile gelir.",
        navHref: "/teklifler"
      }),
      invRow({
        id: "convert",
        title: "Siparişe dönüşüm",
        relatedEntity: "Hızlı işlem",
        status: "shell",
        sourceRoute: "/hizli-islem",
        readinessChips: ["onay", "QOP"],
        description: "Dönüşüm Hızlı İşlem ve onay zincirinden geçer.",
        navHref: "/hizli-islem"
      }),
      invRow({
        id: "new-offer",
        title: "Yeni teklif",
        relatedEntity: "Teklif",
        status: "ready",
        sourceRoute: "/teklifler/yeni",
        readinessChips: ["customerId", "query"],
        description: "Yeni teklif formu cari bağlamı ile açılır.",
        navHref: `/teklifler/yeni?customer=${id}`
      }),
      invRow({
        id: "export",
        title: "Belge export",
        relatedEntity: "Export",
        status: "blocked",
        sourceRoute: customerHref(id, "/teklifler"),
        readinessChips: ["PDF", "Excel"],
        description: "Export API hazır olana kadar kapalı."
      })
    ]
  },
  siparisler: {
    prefix: "hz-cariler-customerid-siparisler-center",
    dataPage: "cariler-customerid-siparisler-command-center",
    title: "Cari sipariş ilişkileri",
    subtitle: "Cariye bağlı sipariş katmanını readiness contract ile yönetin.",
    icon: "shopping-cart",
    alertCopy: "Sipariş durumu yalnızca gerçek sipariş API'si ile gösterilir.",
    buildRows: (id) => [
      invRow({
        id: "order-list",
        title: "Sipariş listesi",
        relatedEntity: "Sipariş",
        status: "needs-api",
        sourceRoute: customerHref(id, "/siparisler"),
        readinessChips: ["orderId", "durum"],
        description: "Cari filtreli sipariş listesi API ile gelir.",
        navHref: "/siparisler"
      }),
      invRow({
        id: "delivery",
        title: "Teslimat bağlantısı",
        relatedEntity: "Teslimat",
        status: "shell",
        sourceRoute: "/hizli-islem",
        readinessChips: ["teslim", "onay"],
        description: "Teslim tamamlama onay gerektirir.",
        navHref: "/hizli-islem"
      }),
      invRow({
        id: "new-order",
        title: "Yeni sipariş",
        relatedEntity: "Sipariş",
        status: "ready",
        sourceRoute: "/siparisler/yeni",
        readinessChips: ["customerId"],
        description: "Yeni sipariş hub cari bağlamı ile açılır.",
        navHref: `/siparisler/yeni?customer=${id}`
      }),
      invRow({
        id: "archive",
        title: "Arşiv görünümü",
        relatedEntity: "Arşiv",
        status: "shell",
        sourceRoute: "/archive",
        readinessChips: ["geçmiş", "salt okunur"],
        description: "Tamamlanan siparişler arşiv mantığında tutulur.",
        navHref: "/archive"
      })
    ]
  },
  tahsilatlar: {
    prefix: "hz-cariler-customerid-tahsilatlar-center",
    dataPage: "cariler-customerid-tahsilatlar-command-center",
    title: "Cari tahsilat ilişkileri",
    subtitle: "Cariye bağlı tahsilat katmanını readiness contract ile yönetin.",
    icon: "circle-dollar-sign",
    alertCopy: "Tahsilat kayıtları finans mutation ve onay zincirinden geçer.",
    buildRows: (id) => [
      invRow({
        id: "payment-list",
        title: "Tahsilat listesi",
        relatedEntity: "Tahsilat",
        status: "needs-api",
        sourceRoute: customerHref(id, "/tahsilatlar"),
        readinessChips: ["paymentId", "tutar"],
        description: "Cari filtreli tahsilat listesi API ile gelir.",
        navHref: "/tahsilatlar"
      }),
      invRow({
        id: "new-payment",
        title: "Yeni tahsilat",
        relatedEntity: "Tahsilat",
        status: "ready",
        sourceRoute: "/tahsilatlar/yeni",
        readinessChips: ["customerId"],
        description: "Yeni tahsilat formu cari bağlamı ile açılır.",
        navHref: `/tahsilatlar/yeni?customer=${id}`
      }),
      invRow({
        id: "approval",
        title: "Onay gereksinimi",
        relatedEntity: "Onay",
        status: "ready",
        sourceRoute: "/onaylar",
        readinessChips: ["create_payment", "policy"],
        description: "Kritik tahsilat işlemleri onay kutusuna düşer.",
        navHref: "/onaylar"
      }),
      invRow({
        id: "write-guard",
        title: "Tahsilat yazımı",
        relatedEntity: "Mutation",
        status: "blocked",
        sourceRoute: customerHref(id, "/tahsilatlar"),
        readinessChips: ["Kaydet", "guard"],
        description: "Tahsilat mutation'ı permission guard olmadan çalışmaz."
      })
    ]
  },
  timeline: {
    prefix: "hz-cariler-customerid-timeline-center",
    dataPage: "cariler-customerid-timeline-command-center",
    title: "Cari notlar / timeline",
    subtitle: "Cari timeline katmanını readiness contract ve audit izi ile yönetin.",
    icon: "clipboard-check",
    alertCopy: "Timeline olayları tenant-scope audit API ile yazılır; sahte olay eklenmez.",
    buildRows: (id) => [
      invRow({
        id: "timeline-feed",
        title: "Timeline akışı",
        relatedEntity: "Audit",
        status: "needs-api",
        sourceRoute: customerHref(id, "/timeline"),
        readinessChips: ["timeline", "auditEventId"],
        description: "Operasyon notları ve sistem olayları kronolojik listelenir.",
        navHref: customerHref(id)
      }),
      invRow({
        id: "note-add",
        title: "Not ekleme",
        relatedEntity: "Not",
        status: "blocked",
        sourceRoute: customerHref(id, "/timeline"),
        readinessChips: ["mutation", "onay"],
        description: "Not ekleme API ve policy hazır olana kadar kapalı."
      }),
      invRow({
        id: "whatsapp-event",
        title: "Kanal olayları",
        relatedEntity: "WhatsApp",
        status: "shell",
        sourceRoute: "/whatsapp",
        readinessChips: ["webhook", "kanal"],
        description: "Kanal mesajları timeline'a policy ile bağlanır.",
        navHref: "/whatsapp"
      }),
      invRow({
        id: "ai-note",
        title: "AI öneri notu",
        relatedEntity: "AI",
        status: "shell",
        sourceRoute: customerHref(id, "/timeline"),
        readinessChips: ["proposal-only", "özet"],
        description: "AI yalnızca öneri üretir; doğrudan timeline yazmaz."
      })
    ]
  }
};

export function buildCustomerLayerConfig(
  layer: CustomerLayerKey,
  customerId: string
): InventoryPageConfig {
  const meta = LAYER_META[layer];
  return buildConfig({
    prefix: meta.prefix,
    dataPage: meta.dataPage,
    title: meta.title,
    subtitle: meta.subtitle,
    icon: meta.icon,
    alertCopy: meta.alertCopy,
    rows: meta.buildRows(customerId),
    navItems: buildCustomerEntityNav(customerId),
    activeNavHref: customerEntityHref(customerId, layer),
    listNav: { href: "/cariler", label: "← Cari listesi" }
  });
}
