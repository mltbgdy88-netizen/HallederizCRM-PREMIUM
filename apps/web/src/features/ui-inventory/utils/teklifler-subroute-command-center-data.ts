import {
  buildConfig,
  type InventoryPageConfig,
  type InventoryScopeRow,
  type InventoryScopeStatus
} from "./system-state-command-center-data";
import type { LucideIconName } from "../../../components/icons/lucide-icons";
import { buildOfferEntityNav, offerEntityHref } from "./entity-layer-nav";

const STATUS_LABEL: Record<InventoryScopeStatus, string> = {
  ready: "Hazır",
  shell: "İskelet",
  "needs-api": "API bekleniyor",
  blocked: "Kapalı"
};

function invRow(partial: Omit<InventoryScopeRow, "statusLabel">): InventoryScopeRow {
  return { ...partial, statusLabel: STATUS_LABEL[partial.status] };
}

function offerHref(offerId: string, suffix = ""): string {
  return `/teklifler/${offerId}${suffix}`;
}

export const LISTE_ROWS: InventoryScopeRow[] = [
  invRow({
    id: "main-list",
    title: "Teklif komut listesi",
    relatedEntity: "Teklifler",
    status: "ready",
    sourceRoute: "/teklifler",
    readinessChips: ["liste", "durum", "dönüşüm"],
    description: "Ana teklif listesi /teklifler üzerinde; bu route liste katmanı sözleşmesini dokümante eder.",
    navHref: "/teklifler"
  }),
  invRow({
    id: "list-alias",
    title: "Liste alias route",
    relatedEntity: "Navigasyon",
    status: "ready",
    sourceRoute: "/teklifler/liste",
    readinessChips: ["alias", "redirect kaldırıldı"],
    description: "Eski /teklifler/liste bağlantıları readiness katmanına yönlendirilir."
  }),
  invRow({
    id: "filter-contract",
    title: "Filtre sözleşmesi",
    relatedEntity: "Filtre",
    status: "needs-api",
    sourceRoute: "/teklifler/liste",
    readinessChips: ["durum", "geçerlilik", "müşteri"],
    description: "Canlı filtre sonuçları API bağlanınca tenant-scope uygulanır."
  }),
  invRow({
    id: "export-guard",
    title: "Dışa aktarma hazırlığı",
    relatedEntity: "Dışa aktar",
    status: "blocked",
    sourceRoute: "/teklifler/liste",
    readinessChips: ["PDF", "Excel"],
    description: "Dışa aktarma butonları API hazır olana kadar kapalı kalır."
  })
];

export const LISTE_CONFIG = buildConfig({
  prefix: "hz-teklifler-liste-center",
  dataPage: "teklifler-liste-command-center",
  title: "Teklif listesi katmanı",
  subtitle:
    "Teklif liste alias route'unu gerçek API sonucu uydurmadan, ana liste bağlantısı ve readiness contract ile yönetin.",
  icon: "file-text",
  rows: LISTE_ROWS,
  alertCopy: "Liste verisi ana /teklifler ekranında gösterilir; bu sayfa canlı sayaç üretmez.",
  listNav: { href: "/teklifler", label: "← Operasyon masası" }
});

export type OfferLayerKey =
  | "ozet"
  | "satirlar"
  | "musteri"
  | "siparise-donusturme"
  | "belgeler"
  | "timeline";

const LAYER_META: Record<
  OfferLayerKey,
  {
    prefix: string;
    dataPage: string;
    title: string;
    subtitle: string;
    icon: LucideIconName;
    alertCopy: string;
    buildRows: (offerId: string) => InventoryScopeRow[];
  }
> = {
  ozet: {
    prefix: "hz-teklifler-offerid-ozet-center",
    dataPage: "teklifler-offerid-ozet-command-center",
    title: "Teklif özet katmanı",
    subtitle: "Teklif detay özet katmanını readiness contract ile yönetin; canlı KPI uydurulmaz.",
    icon: "clipboard-list",
    alertCopy: "Özet kartları API hazır olunca tenant-scope okunur; önizleme kayıtları canlı veri değildir.",
    buildRows: (id) => [
      invRow({
        id: "detail-root",
        title: "Teklif detay kökü",
        relatedEntity: "Teklif",
        status: "ready",
        sourceRoute: offerHref(id),
        readinessChips: ["offerId", "durum"],
        description: "Ana detay sekmeleri kök route üzerinde birleşir.",
        navHref: offerHref(id)
      }),
      invRow({
        id: "summary-cards",
        title: "Özet kartları",
        relatedEntity: "KPI",
        status: "needs-api",
        sourceRoute: offerHref(id, "/ozet"),
        readinessChips: ["tutar", "geçerlilik", "follow-up"],
        description: "Teklif özeti gerçek teklif API'si ile gelir."
      }),
      invRow({
        id: "customer-link",
        title: "Müşteri bağlantısı",
        relatedEntity: "Cari",
        status: "ready",
        sourceRoute: offerHref(id, "/musteri"),
        readinessChips: ["customerId"],
        description: "Cari kartına güvenli geçiş.",
        navHref: offerHref(id, "/musteri")
      }),
      invRow({
        id: "demo-guard",
        title: "Önizleme kayıt koruması",
        relatedEntity: "UI",
        status: "ready",
        sourceRoute: offerHref(id, "/ozet"),
        readinessChips: ["demo-row", "fail-closed"],
        description: "Önizleme satır kimlikleri canlı teklif detayı açmaz."
      })
    ]
  },
  satirlar: {
    prefix: "hz-teklifler-offerid-satirlar-center",
    dataPage: "teklifler-offerid-satirlar-command-center",
    title: "Teklif satırları",
    subtitle: "Teklif satır katmanını readiness contract ile yönetin.",
    icon: "clipboard-list",
    alertCopy: "Satır tutarları ve iskonto alanları canlı fiyat API'si olmadan hesaplanmaz.",
    buildRows: (id) => [
      invRow({
        id: "line-grid",
        title: "Satır grid",
        relatedEntity: "Satır",
        status: "needs-api",
        sourceRoute: offerHref(id, "/satirlar"),
        readinessChips: ["lineId", "ürün", "miktar"],
        description: "Satır listesi tenant-scope teklif API ile okunur.",
        navHref: offerHref(id)
      }),
      invRow({
        id: "pricing",
        title: "Fiyat / iskonto",
        relatedEntity: "Fiyat",
        status: "shell",
        sourceRoute: offerHref(id, "/satirlar"),
        readinessChips: ["policy", "onay"],
        description: "Fiyat değişimi onay policy gerektirir."
      }),
      invRow({
        id: "totals",
        title: "Toplamlar",
        relatedEntity: "Finans",
        status: "needs-api",
        sourceRoute: offerHref(id, "/satirlar"),
        readinessChips: ["ara toplam", "KDV"],
        description: "Toplam alanları gerçek hesap sonucu ile doldurulur."
      }),
      invRow({
        id: "write-guard",
        title: "Satır yazımı",
        relatedEntity: "Mutation",
        status: "blocked",
        sourceRoute: offerHref(id, "/satirlar"),
        readinessChips: ["Kaydet", "guard"],
        description: "Satır mutation'ı permission guard olmadan çalışmaz."
      })
    ]
  },
  musteri: {
    prefix: "hz-teklifler-offerid-musteri-center",
    dataPage: "teklifler-offerid-musteri-command-center",
    title: "Teklif müşteri ilişkisi",
    subtitle: "Teklif–cari bağlantı katmanını readiness contract ile yönetin.",
    icon: "users-round",
    alertCopy: "Müşteri bilgisi teklif kaydından okunur; sahte cari profili üretilmez.",
    buildRows: (id) => [
      invRow({
        id: "customer-card",
        title: "Cari kartı",
        relatedEntity: "Cari",
        status: "needs-api",
        sourceRoute: offerHref(id, "/musteri"),
        readinessChips: ["customerId", "risk"],
        description: "Cari özet API ile tenant-scope gelir.",
        navHref: "/cariler"
      }),
      invRow({
        id: "contact",
        title: "İletişim",
        relatedEntity: "İletişim",
        status: "shell",
        sourceRoute: offerHref(id, "/musteri"),
        readinessChips: ["telefon", "e-posta"],
        description: "İletişim alanları cari detay ile senkronize edilir."
      }),
      invRow({
        id: "whatsapp",
        title: "WhatsApp gönderim",
        relatedEntity: "Kanal",
        status: "blocked",
        sourceRoute: "/whatsapp",
        readinessChips: ["kanal policy", "onay"],
        description: "Belge gönderimi onay ve kanal policy gerektirir.",
        navHref: "/whatsapp"
      }),
      invRow({
        id: "detail-link",
        title: "Teklif detay",
        relatedEntity: "Teklif",
        status: "ready",
        sourceRoute: offerHref(id),
        readinessChips: ["geri dön"],
        description: "Ana teklif detayına dönüş.",
        navHref: offerHref(id)
      })
    ]
  },
  "siparise-donusturme": {
    prefix: "hz-teklifler-offerid-siparise-donusturme-center",
    dataPage: "teklifler-offerid-siparise-donusturme-command-center",
    title: "Siparişe dönüştürme",
    subtitle: "Tekliften siparişe dönüşüm readiness katmanını onay ve Hızlı İşlem zinciri ile yönetin.",
    icon: "shopping-cart",
    alertCopy: "Dönüşüm yalnızca onaylı execution ile tamamlanır; başarı durumu uydurulmaz.",
    buildRows: (id) => [
      invRow({
        id: "convert-flow",
        title: "Dönüşüm akışı",
        relatedEntity: "Hızlı işlem",
        status: "shell",
        sourceRoute: "/hizli-islem/satis-masasi",
        readinessChips: ["QOP", "teklif→sipariş"],
        description: "Dönüşüm Hızlı İşlem workbench üzerinden başlatılır.",
        navHref: "/hizli-islem/satis-masasi?tab=offer"
      }),
      invRow({
        id: "approval",
        title: "Onay bileti",
        relatedEntity: "Onay",
        status: "ready",
        sourceRoute: "/onaylar",
        readinessChips: ["create_order", "policy"],
        description: "Sipariş kesinleştirme onay kutusuna düşer.",
        navHref: "/onaylar"
      }),
      invRow({
        id: "order-link",
        title: "Sipariş bağlantısı",
        relatedEntity: "Sipariş",
        status: "needs-api",
        sourceRoute: "/siparisler",
        readinessChips: ["orderId"],
        description: "Oluşan sipariş kaydı API yanıtı ile linklenir.",
        navHref: "/siparisler"
      }),
      invRow({
        id: "mutation-guard",
        title: "Dönüşüm yazımı",
        relatedEntity: "Mutation",
        status: "blocked",
        sourceRoute: offerHref(id, "/siparise-donusturme"),
        readinessChips: ["execute", "guard"],
        description: "Çalıştırma dağıtıcısı olmadan veri değişikliği çalışmaz."
      })
    ]
  },
  belgeler: {
    prefix: "hz-teklifler-offerid-belgeler-center",
    dataPage: "teklifler-offerid-belgeler-command-center",
    title: "Teklif belgeleri",
    subtitle: "Teklif belge katmanını readiness contract ve export guard ile yönetin.",
    icon: "file-text",
    alertCopy: "PDF/Excel ve WhatsApp belge gönderimi API hazır olana kadar kapalı kalır.",
    buildRows: (id) => [
      invRow({
        id: "pdf",
        title: "PDF önizleme",
        relatedEntity: "Belge",
        status: "blocked",
        sourceRoute: offerHref(id, "/belgeler"),
        readinessChips: ["PDF", "export"],
        description: "PDF üretimi gerçek belge servisi ile yapılır."
      }),
      invRow({
        id: "excel",
        title: "Excel dışa aktarma",
        relatedEntity: "Dışa aktar",
        status: "blocked",
        sourceRoute: offerHref(id, "/belgeler"),
        readinessChips: ["Excel"],
        description: "Excel dışa aktarma API hazır olana kadar devre dışı."
      }),
      invRow({
        id: "whatsapp-doc",
        title: "WhatsApp belge",
        relatedEntity: "Kanal",
        status: "shell",
        sourceRoute: "/whatsapp",
        readinessChips: ["send_document_whatsapp", "onay"],
        description: "Outbound belge kanal policy ve onay gerektirir.",
        navHref: "/whatsapp"
      }),
      invRow({
        id: "archive",
        title: "Arşiv",
        relatedEntity: "Arşiv",
        status: "shell",
        sourceRoute: "/archive",
        readinessChips: ["queue_document_save"],
        description: "Belge arşiv kuyruğu worker ile işlenir.",
        navHref: "/archive"
      })
    ]
  },
  timeline: {
    prefix: "hz-teklifler-offerid-timeline-center",
    dataPage: "teklifler-offerid-timeline-command-center",
    title: "Teklif timeline",
    subtitle: "Teklif timeline katmanını audit izi ve readiness contract ile yönetin.",
    icon: "clipboard-check",
    alertCopy: "Zaman akışı olayları kiracı kapsamlı denetim izi API ile yazılır; sahte olay eklenmez.",
    buildRows: (id) => [
      invRow({
        id: "timeline-feed",
        title: "Zaman akışı",
        relatedEntity: "Denetim izi",
        status: "needs-api",
        sourceRoute: offerHref(id, "/timeline"),
        readinessChips: ["timeline", "auditEventId"],
        description: "Durum değişimleri ve follow-up notları kronolojik listelenir.",
        navHref: offerHref(id)
      }),
      invRow({
        id: "follow-up",
        title: "Takip aksiyonu",
        relatedEntity: "Operasyon",
        status: "shell",
        sourceRoute: offerHref(id, "/timeline"),
        readinessChips: ["hatırlatma", "görev"],
        description: "Takip görevleri görev merkezi ile bağlanır.",
        navHref: "/gorevler"
      }),
      invRow({
        id: "approval-events",
        title: "Onay olayları",
        relatedEntity: "Onay",
        status: "ready",
        sourceRoute: "/onaylar",
        readinessChips: ["onay", "red"],
        description: "Onay kararları timeline'a audit ile yazılır.",
        navHref: "/onaylar"
      }),
      invRow({
        id: "ai-note",
        title: "AI öneri notu",
        relatedEntity: "AI",
        status: "shell",
        sourceRoute: offerHref(id, "/timeline"),
        readinessChips: ["proposal-only"],
        description: "AI yalnızca öneri üretir; doğrudan timeline yazmaz."
      })
    ]
  }
};

export function buildOfferLayerConfig(layer: OfferLayerKey, offerId: string): InventoryPageConfig {
  const meta = LAYER_META[layer];
  return buildConfig({
    prefix: meta.prefix,
    dataPage: meta.dataPage,
    title: meta.title,
    subtitle: meta.subtitle,
    icon: meta.icon,
    alertCopy: meta.alertCopy,
    rows: meta.buildRows(offerId),
    navItems: buildOfferEntityNav(offerId),
    activeNavHref: offerEntityHref(offerId, layer),
    listNav: { href: "/teklifler", label: "← Teklif listesi" }
  });
}
