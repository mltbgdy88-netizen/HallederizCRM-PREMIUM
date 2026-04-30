const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const appRoot = path.join(repoRoot, "apps", "web", "app");
const demoDataMapPath = path.join(repoRoot, "docs", "demo-data-map.md");

const expectedPageFiles = [
  "(platform)/page.tsx",
  "(platform)/cariler/page.tsx",
  "(platform)/cariler/[customerId]/page.tsx",
  "(platform)/stok/page.tsx",
  "(platform)/teklifler/page.tsx",
  "(platform)/teklifler/yeni/page.tsx",
  "(platform)/teklifler/[offerId]/page.tsx",
  "(platform)/siparisler/page.tsx",
  "(platform)/hizli-islem/page.tsx",
  "(platform)/siparisler/yeni/page.tsx",
  "(platform)/siparisler/[orderId]/page.tsx",
  "(platform)/tahsilatlar/page.tsx",
  "(platform)/tahsilatlar/yeni/page.tsx",
  "(platform)/tahsilatlar/[paymentId]/page.tsx",
  "(platform)/depo/page.tsx",
  "(platform)/depo/emirler/[warehouseOrderId]/page.tsx",
  "(platform)/teslimatlar/page.tsx",
  "(platform)/teslimatlar/[deliveryId]/page.tsx",
  "(platform)/faturalar/page.tsx",
  "(platform)/faturalar/[invoiceId]/page.tsx",
  "(platform)/iadeler/page.tsx",
  "(platform)/iadeler/yeni/page.tsx",
  "(platform)/iadeler/[returnId]/page.tsx",
  "(platform)/belgeler/page.tsx",
  "(platform)/whatsapp/page.tsx",
  "(platform)/erp/page.tsx",
  "(platform)/fabrikalar/stoklar/page.tsx",
  "(platform)/fabrikalar/siparisler/page.tsx",
  "(platform)/fabrikalar/siparisler/[factoryOrderId]/page.tsx",
  "(platform)/ai/page.tsx",
  "(platform)/ai/onaylar/page.tsx",
  "(platform)/ai/icgoruler/page.tsx",
  "(platform)/kullanicilar/page.tsx",
  "(platform)/kullanicilar/roller/page.tsx",
  "(platform)/ayarlar/page.tsx"
];

const requiredDemoIds = [
  "customer_1",
  "offer_2",
  "order_1",
  "payment_1",
  "warehouse_order_1",
  "delivery_1",
  "invoice_1",
  "return_1",
  "factory_order_1",
  "document_2",
  "approval_1",
  "ai_proposal_1"
];

function checkPages() {
  const missing = [];
  for (const relativePage of expectedPageFiles) {
    const absolutePage = path.join(appRoot, ...relativePage.split("/"));
    if (!fs.existsSync(absolutePage)) {
      missing.push(relativePage);
    }
  }
  return missing;
}

function checkDemoDataIds() {
  if (!fs.existsSync(demoDataMapPath)) {
    return ["docs/demo-data-map.md bulunamadi."];
  }

  const content = fs.readFileSync(demoDataMapPath, "utf8");
  return requiredDemoIds.filter((id) => !content.includes(id));
}

function main() {
  const missingPages = checkPages();
  const missingIds = checkDemoDataIds();

  if (missingPages.length || missingIds.length) {
    console.error("Route smoke kontrolu basarisiz.");
    if (missingPages.length) {
      console.error("Eksik page dosyalari:");
      for (const page of missingPages) {
        console.error(` - ${page}`);
      }
    }
    if (missingIds.length) {
      console.error("Demo data map icinde bulunamayan ID'ler:");
      for (const id of missingIds) {
        console.error(` - ${id}`);
      }
    }
    process.exit(1);
  }

  console.log(`Route smoke basarili: ${expectedPageFiles.length} route dosyasi ve demo ID kontrolleri gecti.`);
}

main();
