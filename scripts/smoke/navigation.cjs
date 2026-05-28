const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");

const requiredRouteFiles = [
  "apps/web/src/navigation/product-route-manifest.ts",
  "apps/web/src/navigation/render-product-catch-all.tsx",
  "apps/web/src/components/product-page-shell.tsx",
  "apps/web/src/components/product-module-landing.tsx",
  "apps/web/app/(platform)/[...productSlug]/page.tsx",
  "apps/web/app/(platform)/gelen-kutu/konusma/[conversationId]/page.tsx",
  "apps/web/app/(platform)/cariler/liste/page.tsx",
  "apps/web/app/(platform)/onaylar/bekleyenler/page.tsx",
  "docs/product/PRODUCTION_ROUTE_MANIFEST.md",
  "apps/web/app/(platform)/ayarlar/operasyon-gozlem/page.tsx"
];

const checks = [
  {
    file: "apps/web/src/features/task-center/components/TaskListTable.tsx",
    patterns: ["/onaylar/"],
    description: "Dashboard gorev tablosunda approval gecisi"
  },
  {
    file: "apps/web/src/features/customers/components/CustomerIdentityHeader.tsx",
    patterns: ["/teklifler/yeni?customer=", "/siparisler/yeni?customer=", "/tahsilatlar/yeni?customer=", "/whatsapp?customer="],
    description: "Cari karti hizli aksiyon navigasyonu"
  },
  {
    file: "apps/web/src/features/offers/components/OfferConvertDialog.tsx",
    patterns: ["router.push(`/hizli-islem", "Hızlı İşlem"],
    description: "Tekliften siparişe Hızlı İşlem yönlendirmesi"
  },
  {
    file: "apps/web/src/features/offers/components/OfferCreateHub.tsx",
    patterns: ["onaya gönderin", "buildQuickOpHref"],
    description: "Yeni teklif Hızlı İşlem hub"
  },
  {
    file: "apps/web/src/features/orders/components/OrderCreateHub.tsx",
    patterns: ["onaya gönderin", "buildQuickOpHref"],
    description: "Yeni sipariş Hızlı İşlem hub"
  },
  {
    file: "apps/web/src/features/payments/components/PaymentCreatePage.tsx",
    patterns: ["Tahsilatı kaydet", "Yeni tahsilat", "Hızlı İşlem"],
    description: "Yeni tahsilat formu"
  },
  {
    file: "apps/web/src/features/quick-operations/data/quick-operation-messages.ts",
    patterns: ["MSG_SUBMIT_SENT_FOR_APPROVAL", "MSG_SUBMIT_QUEUED", "MSG_SUBMIT_AFTER_APPROVAL"],
    description: "Hızlı İşlem canlı zincir mesajları"
  },
  {
    file: "apps/web/src/features/approvals/data/approval-action-messages.ts",
    patterns: ["MSG_APPROVAL_QUEUED", "MSG_APPROVAL_PROCESS_DONE"],
    description: "Onaylar execute geri bildirim mesajları"
  },
  {
    file: "apps/web/src/lib/operation-entity-links.ts",
    patterns: ["resolveOperationEntityHref", "/teklifler/", "/belgeler/"],
    description: "Operasyon varlık detay rotaları"
  },
  {
    file: "apps/web/src/features/documents/data/document-action-messages.ts",
    patterns: [
      "Belge önizlemesi hazırlanır; gönderim yapılmaz",
      "PDF üretimi henüz canlı kullanıma bağlı değil",
      "Belge indirme henüz canlı kullanıma bağlı değil"
    ],
    description: "Belgeler canli olmayan aksiyon mesajlari"
  },
  {
    file: "apps/web/src/features/documents/components/DocumentsPage.tsx",
    patterns: ["hz-doc-context-band", "runDocumentLiveAction", "resolveDocumentsEmptyMessage"],
    description: "Belgeler baglam bandi ve aksiyon feedback"
  },
  {
    file: "apps/web/src/features/archive/components/ArchivePage.tsx",
    patterns: ["Bu işlem henüz canlı kullanıma bağlı değil", "Örnek veri modu: arşiv listesi"],
    description: "Arsiv demo ve canli olmayan aksiyon mesajlari"
  },
  {
    file: "apps/web/src/features/whatsapp/data/whatsapp-action-messages.ts",
    patterns: ["MSG_WA_CONNECTION_NOT_LIVE", "MSG_WA_PREVIEW_SEND", "MSG_WA_CUSTOMER_HISTORY_MISSING"],
    description: "WhatsApp baglanti ve taslak guvenligi"
  },
  {
    file: "apps/web/src/features/whatsapp/components/WhatsAppPage.tsx",
    patterns: ["initialCustomerId", "resolveCustomerEmptyMessage"],
    description: "WhatsApp cari baglami ve bos durum"
  },
  {
    file: "apps/web/src/features/orders/components/OrderDetailPage.tsx",
    patterns: ["/tahsilatlar/yeni?order=", "/depo/emirler/", "/teslimatlar/", "/faturalar/"],
    description: "Siparis detayindan operasyon modullerine gecis"
  },
  {
    file: "apps/web/src/features/whatsapp/components/WhatsAppPage.tsx",
    patterns: ["/cariler/", "/siparisler/", "/tahsilatlar/", "/belgeler?document="],
    description: "WhatsApp baglam paneli gecisleri"
  },
  {
    file: "apps/web/src/features/documents/components/DocumentsPage.tsx",
    patterns: ["/teklifler/", "/siparisler/", "/tahsilatlar/", "/depo/emirler/", "/teslimatlar/", "/faturalar/", "/iadeler/"],
    description: "Belge merkezinden ilgili kayda git"
  },
  {
    file: "apps/web/src/features/settings/components/SettingsSubNav.tsx",
    patterns: ["/ayarlar/operasyon-gozlem"],
    description: "Ayarlar ic navigasyon operasyon gozlem rotasi"
  },
  {
    file: "apps/web/src/features/tasks/components/OperatorWorkspaceContextPanel.tsx",
    patterns: ["/ayarlar/operasyon-gozlem"],
    description: "Gorevler sag panel operasyon gozlem kisayolu"
  },
  {
    file: "apps/web/src/components/platform-route-meta.ts",
    patterns: ['path.startsWith("/gorevler/")', 'path === "/gorevler"'],
    description: "Gorev alt rotalari icin tasks workspace bayragi"
  },
  {
    file: "apps/web/src/features/tasks/components/TasksPage.tsx",
    patterns: ["/ayarlar/operasyon-gozlem"],
    description: "Gorev detay TaskActionsBar operasyon kisayolu"
  },
  {
    file: "apps/web/src/features/ai/components/AIAssistantPage.tsx",
    patterns: ["/ai/onaylar", "/ai/icgoruler"],
    description: "AI merkezi onay ve icgoru gecisleri"
  },
  {
    file: "apps/web/app/(platform)/panel/page.tsx",
    patterns: ["PanelCommandCenterPage"],
    description: "Panel command center readiness hub"
  },
  {
    file: "apps/web/src/features/dashboard/components/DashboardHomePage.tsx",
    patterns: [
      "hz-dash-preview-band",
      "Örnek veri modu: KPI",
      "/teklifler/yeni",
      "/tahsilatlar/yeni",
      "Bağlantı bekleniyor"
    ],
    description: "Dashboard onizleme ve hizli aksiyonlar"
  }
];

function main() {
  const failures = [];

  for (const rel of requiredRouteFiles) {
    const abs = path.join(repoRoot, rel);
    if (!fs.existsSync(abs)) {
      failures.push(`Zorunlu route dosyasi eksik: ${rel}`);
    }
  }

  for (const check of checks) {
    const absoluteFile = path.join(repoRoot, check.file);
    if (!fs.existsSync(absoluteFile)) {
      failures.push(`${check.description}: dosya bulunamadi (${check.file})`);
      continue;
    }

    const source = fs.readFileSync(absoluteFile, "utf8");
    const missingPatterns = check.patterns.filter((pattern) => !source.includes(pattern));
    if (missingPatterns.length) {
      failures.push(`${check.description}: eksik pattern -> ${missingPatterns.join(", ")}`);
    }
  }

  if (failures.length) {
    console.error("Navigation smoke kontrolu basarisiz:");
    for (const failure of failures) {
      console.error(` - ${failure}`);
    }
    process.exit(1);
  }

  console.log(`Navigation smoke basarili: ${checks.length} kritik baglanti kontrolu gecti.`);
}

main();
