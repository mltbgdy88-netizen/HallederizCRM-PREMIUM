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
    patterns: ["window.sessionStorage.setItem(\"hallederiz:order-draft\"", "router.push(draft.navigationPath)"],
    description: "Tekliften siparise draft handoff"
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
    file: "apps/web/src/features/ai/components/AIAssistantPage.tsx",
    patterns: ["/ai/onaylar", "/ai/icgoruler"],
    description: "AI merkezi onay ve icgoru gecisleri"
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
