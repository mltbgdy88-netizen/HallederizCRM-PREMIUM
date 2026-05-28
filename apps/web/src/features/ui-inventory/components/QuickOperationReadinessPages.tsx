"use client";

import { InventoryCommandCenterPage } from "./InventoryCommandCenterPage";
import { buildConfig, type InventoryScopeRow } from "../utils/system-state-command-center-data";

const RESULT_ROWS: InventoryScopeRow[] = [
  {
    id: "approval-result",
    title: "Onay sonucu",
    relatedEntity: "Onay",
    status: "needs-api",
    statusLabel: "API bekleniyor",
    sourceRoute: "/hizli-islem/sonuc",
    readinessChips: ["approvalRequestId", "executionId"],
    description: "İşlem sonucu onay ve execution zinciri tamamlanınca görünür."
  },
  {
    id: "entity-links",
    title: "Bağlı kayıt linkleri",
    relatedEntity: "CRM",
    status: "shell",
    statusLabel: "İskelet",
    sourceRoute: "/hizli-islem",
    readinessChips: ["sipariş", "tahsilat", "belge"],
    description: "Sonuç ekranı ilgili kaydın detayına güvenli link verir.",
    navHref: "/hizli-islem"
  },
  {
    id: "export-state",
    title: "Export durumu",
    relatedEntity: "Export",
    status: "blocked",
    statusLabel: "Kapalı",
    sourceRoute: "/hizli-islem/sonuc",
    readinessChips: ["exportPdfStatus", "exportExcelStatus"],
    description: "API bağlanmadan PDF/Excel başarı durumu üretilmez."
  }
];

const IMPACT_ROWS: InventoryScopeRow[] = [
  {
    id: "stock-impact",
    title: "Stok etkisi",
    relatedEntity: "Stok",
    status: "shell",
    statusLabel: "İskelet",
    sourceRoute: "/stok",
    readinessChips: ["rezervasyon", "hazırlık"],
    description: "Hızlı işlem sonrası stok ve kaynak etkisi burada özetlenir.",
    navHref: "/stok"
  },
  {
    id: "finance-impact",
    title: "Finans etkisi",
    relatedEntity: "Tahsilat",
    status: "shell",
    statusLabel: "İskelet",
    sourceRoute: "/tahsilatlar",
    readinessChips: ["bakiye", "vade"],
    description: "Cari bakiye ve tahsilat etkisi bağlanır.",
    navHref: "/tahsilatlar"
  },
  {
    id: "audit-impact",
    title: "Audit / timeline",
    relatedEntity: "Audit",
    status: "needs-api",
    statusLabel: "API bekleniyor",
    sourceRoute: "/hizli-islem/etki-analizi",
    readinessChips: ["timeline", "auditEventId"],
    description: "Operasyonun tenant-scope timeline izi API ile yazılır."
  }
];

const RESULT_CONFIG = buildConfig({
  prefix: "hz-hizli-islem-sonuc-center",
  dataPage: "hizli-islem-sonuc-command-center",
  title: "Hızlı işlem sonuç katmanı",
  subtitle: "Hızlı işlem sonucunu gerçek API sonucu uydurmadan, readiness contract görünürlüğüyle yönetin.",
  icon: "check-circle-2",
  rows: RESULT_ROWS,
  alertCopy: "Kritik işlem sonucu yalnızca onay ve execution zinciri tamamlanınca görünür; başarı durumu uydurulmaz."
});

const IMPACT_CONFIG = buildConfig({
  prefix: "hz-hizli-islem-etki-analizi-center",
  dataPage: "hizli-islem-etki-analizi-command-center",
  title: "Hızlı işlem etki analizi",
  subtitle: "Hızlı işlem etkilerini gerçek API sonucu uydurmadan, readiness contract görünürlüğüyle yönetin.",
  icon: "clipboard-check",
  rows: IMPACT_ROWS,
  alertCopy: "Etki analizi stok, finans ve audit zincirini gösterir; canlı hesap API hazır olunca bağlanır."
});

export function QuickOperationResultPage() {
  return <InventoryCommandCenterPage config={RESULT_CONFIG} />;
}

export function QuickOperationImpactPage() {
  return <InventoryCommandCenterPage config={IMPACT_CONFIG} />;
}
