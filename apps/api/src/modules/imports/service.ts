import type {
  Customer,
  CustomerRiskLevel,
  ImportApplyResult,
  ImportFilePayload,
  ImportHistoryRecord,
  ImportPreviewIssue,
  ImportPreviewRecord,
  ImportPreviewResult,
  ImportTemplateDefinition,
  ImportType,
  PlatformSettings,
  PriceSlotNumber,
  Product,
  WarehouseSetupItem
} from "@hallederiz/types";
import { normalizeBarcode } from "@hallederiz/domain";
import type { RequestContext } from "../../shared/request-context";
import {
  addImportHistoryRecord,
  buildImportSummary,
  getImportHistoryById,
  listImportHistory
} from "../../shared/import-history-store";
import { ProductStockPricingService } from "../product-stock-pricing/service";
import { SalesCrmService } from "../sales-crm/service";
import { getTenantSettingsState, setTenantSettingsState } from "../../platform-core/settings-state";

interface ParsedTable {
  headers: string[];
  rows: string[][];
}

type PreviewRow = {
  rowNumber: number;
  values: Record<string, string>;
};

const CSV_TEMPLATES: Record<ImportType, ImportTemplateDefinition> = {
  customers: {
    type: "customers",
    fileName: "cari-import-template.csv",
    contentType: "text/csv",
    description: "Cari temel kimlik, iletisim, vergi ve fiyat grubu bilgileri.",
    columns: [
      "cari_kodu",
      "cari_adi",
      "musteri_tipi",
      "telefon",
      "e_posta",
      "sehir",
      "adres",
      "vergi_dairesi",
      "vergi_numarasi",
      "fiyat_grubu",
      "risk_seviyesi",
      "aktif"
    ],
    sampleRows: [
      ["CAR-1001", "Aydin Dekor", "bayi", "+90 532 111 22 33", "operasyon@aydindekor.com", "Istanbul", "Kadikoy", "Kadikoy", "1234567890", "4", "medium", "evet"]
    ]
  },
  products: {
    type: "products",
    fileName: "urun-import-template.csv",
    contentType: "text/csv",
    description: "Urun kartlari, barkodlar, kategori slotlari, kritik stok ve kaynak bilgileri.",
    columns: [
      "urun_kodu",
      "urun_adi",
      "marka_kodu",
      "fabrika_kodu",
      "ana_barkod",
      "alias_barkodlar",
      "qr_degeri",
      "kategori_1",
      "kategori_2",
      "kategori_3",
      "kategori_4",
      "kritik_stok",
      "varsayilan_kaynak",
      "aktif"
    ],
    sampleRows: [["DKG-1001", "Marvel Duvar Kagidi 1001", "ALFA", "ANK", "8690001001001", "DKG1001A|DKG1001B", "QR-DKG-1001", "Marvel", "Luxe", "Modern", "Ivory", "20", "warehouse", "evet"]]
  },
  pricing: {
    type: "pricing",
    fileName: "fiyat-import-template.csv",
    contentType: "text/csv",
    description: "Urun bazli fiyat slotu degerleri.",
    columns: ["urun_kodu", "fiyat_slotu", "fiyat_degeri", "para_birimi", "aktif"],
    sampleRows: [["DKG-1001", "4", "590.50", "TRY", "evet"]]
  },
  warehouses: {
    type: "warehouses",
    fileName: "depo-import-template.csv",
    contentType: "text/csv",
    description: "Depo tanimlari ve varsayilan depo secimi.",
    columns: ["depo_kodu", "depo_adi", "depo_tipi", "aktif", "varsayilan"],
    sampleRows: [["MERKEZ", "Merkez Depo", "center", "evet", "evet"]]
  },
  "stock-locations": {
    type: "stock-locations",
    fileName: "stok-import-template.csv",
    contentType: "text/csv",
    description: "Depo bazli stok, rezerve stok ve raf/lokasyon bilgileri.",
    columns: ["urun_kodu", "depo_kodu", "mevcut_stok", "rezerve_stok", "raf_no", "lokasyon_kodu"],
    sampleRows: [["DKG-1001", "MERKEZ", "120", "10", "A-01-01", "A BLOK / 1. RAF"]]
  }
};

function canonicalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseCsvLine(line: string, delimiter: "," | ";"): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === "\"") {
      const next = line[i + 1];
      if (inQuotes && next === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && char === delimiter) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function parseCsv(content: string): ParsedTable {
  const lines = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const firstLine = lines[0] ?? "";
  const commaCells = parseCsvLine(firstLine, ",").length;
  const semicolonCells = parseCsvLine(firstLine, ";").length;
  const delimiter: "," | ";" = semicolonCells > commaCells ? ";" : ",";

  const headers = parseCsvLine(firstLine, delimiter).map(canonicalizeHeader);
  const rows = lines.slice(1).map((line) => parseCsvLine(line, delimiter));
  return { headers, rows };
}

function decodeFileContent(file: ImportFilePayload): string {
  const buffer = Buffer.from(file.contentBase64, "base64");
  return buffer.toString("utf-8");
}

function toPreviewRows(table: ParsedTable): PreviewRow[] {
  return table.rows.map((row, index) => {
    const values: Record<string, string> = {};
    table.headers.forEach((header, headerIndex) => {
      values[header] = String(row[headerIndex] ?? "").trim();
    });
    return { rowNumber: index + 2, values };
  });
}

function getValue(row: PreviewRow, key: string): string {
  return String(row.values[key] ?? "").trim();
}

function parseBoolean(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return ["1", "true", "evet", "aktif", "yes"].includes(normalized);
}

function parseRiskLevel(value: string): CustomerRiskLevel {
  const normalized = value.trim().toLowerCase();
  if (normalized === "high" || normalized === "yuksek") return "high";
  if (normalized === "medium" || normalized === "orta") return "medium";
  return "low";
}

function parsePriceSlot(value: string, fallback: PriceSlotNumber = 1): PriceSlotNumber {
  const parsed = Number(value);
  if (parsed >= 1 && parsed <= 6) return parsed as PriceSlotNumber;
  return fallback;
}

function parseNumber(value: string, fallback = 0): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePhone(value: string): string {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("90")) return `+${digits}`;
  return digits ? `+90${digits}` : "";
}

function buildIssue(rowNumber: number, field: string, severity: "error" | "warning", message: string): ImportPreviewIssue {
  return { rowNumber, field, severity, message };
}

function toPreviewRecords(rows: PreviewRow[]): ImportPreviewRecord[] {
  return rows.map((row) => ({
    rowNumber: row.rowNumber,
    data: row.values
  }));
}

export class ImportsService {
  private readonly salesCrmService: SalesCrmService;
  private readonly stockService: ProductStockPricingService;

  constructor(private readonly context: RequestContext) {
    this.salesCrmService = new SalesCrmService(context);
    this.stockService = new ProductStockPricingService(context);
  }

  listTemplates(): ImportTemplateDefinition[] {
    return Object.values(CSV_TEMPLATES);
  }

  getTemplate(type: ImportType): ImportTemplateDefinition {
    return CSV_TEMPLATES[type];
  }

  getTemplateCsv(type: ImportType): string {
    const template = this.getTemplate(type);
    const lines = [
      template.columns.join(","),
      ...template.sampleRows.map((row) => row.join(","))
    ];
    return lines.join("\n");
  }

  async preview(type: ImportType, file: ImportFilePayload): Promise<ImportPreviewResult> {
    if (!file.fileName.toLowerCase().endsWith(".csv")) {
      return {
        importType: type,
        fileName: file.fileName,
        totalRows: 0,
        validRows: 0,
        errorCount: 1,
        warningCount: 0,
        records: [],
        issues: [buildIssue(1, "file", "error", "Bu surumde sadece CSV dosyasi desteklenir. Excel dosyasini CSV olarak disa aktarip tekrar yukleyin.")]
      };
    }

    const table = parseCsv(decodeFileContent(file));
    const rows = toPreviewRows(table);
    const issues: ImportPreviewIssue[] = [];

    const expectedColumns = new Set(this.getTemplate(type).columns.map(canonicalizeHeader));
    for (const column of expectedColumns) {
      if (!table.headers.includes(column)) {
        issues.push(buildIssue(1, column, "error", `${column} kolonu bulunamadi.`));
      }
    }

    const existingCustomers = await this.salesCrmService.listCustomers();
    const existingProducts = await this.stockService.listProducts({});
    const existingCustomerCodes = new Set(existingCustomers.map((item) => item.code.toLowerCase()));
    const existingProductCodes = new Set(existingProducts.map((item) => item.code.toLowerCase()));
    const productByCode = new Map(existingProducts.map((item) => [item.code.toLowerCase(), item]));
    const priceSlots = await this.stockService.getPriceSlots();
    const priceSlotByName = new Map(priceSlots.map((slot) => [slot.slotName.toLowerCase(), slot.slotNumber]));
    const warehouseCodeSet = new Set(
      (getTenantSettingsState().warehouses ?? []).map((warehouse) => warehouse.code.toLowerCase())
    );
    const seenCustomerCodes = new Set<string>();
    const seenProductCodes = new Set<string>();
    const seenWarehouseCodes = new Set<string>();

    for (const row of rows) {
      const data = row.values;
      if (type === "customers") {
        const code = (data.cari_kodu ?? "").trim();
        const name = (data.cari_adi ?? "").trim();
        if (!code) issues.push(buildIssue(row.rowNumber, "cari_kodu", "error", "Cari kodu zorunludur."));
        if (!name) issues.push(buildIssue(row.rowNumber, "cari_adi", "error", "Cari adi zorunludur."));
        const codeKey = code.toLowerCase();
        if (code && seenCustomerCodes.has(codeKey)) {
          issues.push(buildIssue(row.rowNumber, "cari_kodu", "error", "Dosya icinde duplicate cari kodu var."));
        }
        seenCustomerCodes.add(codeKey);
        if (code && existingCustomerCodes.has(codeKey)) {
          issues.push(buildIssue(row.rowNumber, "cari_kodu", "warning", "Cari kodu mevcut kayitla eslesiyor, update yapilacak."));
        }
      }

      if (type === "products") {
        const code = (data.urun_kodu ?? "").trim();
        const name = (data.urun_adi ?? "").trim();
        if (!code) issues.push(buildIssue(row.rowNumber, "urun_kodu", "error", "Urun kodu zorunludur."));
        if (!name) issues.push(buildIssue(row.rowNumber, "urun_adi", "error", "Urun adi zorunludur."));
        const codeKey = code.toLowerCase();
        if (code && seenProductCodes.has(codeKey)) {
          issues.push(buildIssue(row.rowNumber, "urun_kodu", "error", "Dosya icinde duplicate urun kodu var."));
        }
        seenProductCodes.add(codeKey);
        if (code && existingProductCodes.has(codeKey)) {
          issues.push(buildIssue(row.rowNumber, "urun_kodu", "warning", "Urun kodu mevcut kayitla eslesiyor, update yapilacak."));
        }
        const mainBarcode = normalizeBarcode(data.ana_barkod ?? "");
        if (mainBarcode) {
          const conflict = existingProducts.find(
            (product) =>
              normalizeBarcode(product.primaryBarcode) === mainBarcode ||
              product.barcodeAliases.some((alias) => normalizeBarcode(alias.value) === mainBarcode)
          );
          if (conflict && conflict.code.toLowerCase() !== codeKey) {
            issues.push(buildIssue(row.rowNumber, "ana_barkod", "error", `Barkod cakisiyor (${conflict.code}).`));
          }
        }
      }

      if (type === "pricing") {
        const code = (data.urun_kodu ?? "").trim().toLowerCase();
        const slotRaw = (data.fiyat_slotu ?? "").trim();
        const currency = (data.para_birimi ?? "").trim().toUpperCase();
        if (!productByCode.has(code)) {
          issues.push(buildIssue(row.rowNumber, "urun_kodu", "error", "Urun kodu bulunamadi."));
        }
        const slotNo = Number(slotRaw);
        const slotByName = priceSlotByName.get(slotRaw.toLowerCase());
        if (!(slotNo >= 1 && slotNo <= 6) && !slotByName) {
          issues.push(buildIssue(row.rowNumber, "fiyat_slotu", "error", "Fiyat slotu 1-6 veya gecerli slot adi olmali."));
        }
        if (!["TRY", "USD", "EUR"].includes(currency)) {
          issues.push(buildIssue(row.rowNumber, "para_birimi", "error", "Para birimi TRY/USD/EUR olmali."));
        }
        if (!Number.isFinite(Number((data.fiyat_degeri ?? "").replace(",", ".")))) {
          issues.push(buildIssue(row.rowNumber, "fiyat_degeri", "error", "Fiyat degeri sayi olmali."));
        }
      }

      if (type === "warehouses") {
        const code = (data.depo_kodu ?? "").trim();
        const name = (data.depo_adi ?? "").trim();
        if (!code) issues.push(buildIssue(row.rowNumber, "depo_kodu", "error", "Depo kodu zorunludur."));
        if (!name) issues.push(buildIssue(row.rowNumber, "depo_adi", "error", "Depo adi zorunludur."));
        const codeKey = code.toLowerCase();
        if (code && seenWarehouseCodes.has(codeKey)) {
          issues.push(buildIssue(row.rowNumber, "depo_kodu", "error", "Dosya icinde duplicate depo kodu var."));
        }
        seenWarehouseCodes.add(codeKey);
      }

      if (type === "stock-locations") {
        const code = (data.urun_kodu ?? "").trim().toLowerCase();
        const warehouseCode = (data.depo_kodu ?? "").trim().toLowerCase();
        if (!productByCode.has(code)) {
          issues.push(buildIssue(row.rowNumber, "urun_kodu", "error", "Urun kodu bulunamadi."));
        }
        if (!warehouseCodeSet.has(warehouseCode)) {
          issues.push(buildIssue(row.rowNumber, "depo_kodu", "error", "Depo kodu bulunamadi."));
        }
        if (!Number.isFinite(Number((data.mevcut_stok ?? "").replace(",", ".")))) {
          issues.push(buildIssue(row.rowNumber, "mevcut_stok", "error", "Mevcut stok sayi olmali."));
        }
        if (!Number.isFinite(Number((data.rezerve_stok ?? "0").replace(",", ".")))) {
          issues.push(buildIssue(row.rowNumber, "rezerve_stok", "error", "Rezerve stok sayi olmali."));
        }
      }
    }

    const errorCount = issues.filter((issue) => issue.severity === "error").length;
    const warningCount = issues.filter((issue) => issue.severity === "warning").length;
    const rowHasError = new Set(issues.filter((item) => item.severity === "error").map((item) => item.rowNumber));
    const validRows = rows.length - rowHasError.size;

    return {
      importType: type,
      fileName: file.fileName,
      totalRows: rows.length,
      validRows: Math.max(validRows, 0),
      errorCount,
      warningCount,
      records: toPreviewRecords(rows).slice(0, 250),
      issues: issues.slice(0, 500)
    };
  }

  async apply(type: ImportType, file: ImportFilePayload): Promise<ImportApplyResult> {
    const preview = await this.preview(type, file);
    if (preview.errorCount > 0) {
      const failedRecord = addImportHistoryRecord({
        tenantId: this.context.tenantId,
        type,
        fileName: file.fileName,
        uploadedBy: this.context.userId,
        previewRecordCount: preview.totalRows,
        successCount: 0,
        errorCount: preview.errorCount,
        warningCount: preview.warningCount,
        status: "failed",
        summary: buildImportSummary("failed", preview.totalRows, 0, preview.errorCount)
      });
      return {
        importId: failedRecord.id,
        importType: type,
        fileName: file.fileName,
        totalRows: preview.totalRows,
        successCount: 0,
        errorCount: preview.errorCount,
        warningCount: preview.warningCount,
        status: "failed",
        errors: preview.issues.filter((item) => item.severity === "error").map((item) => `Satir ${item.rowNumber}: ${item.message}`)
      };
    }

    const table = parseCsv(decodeFileContent(file));
    const rows = toPreviewRows(table);
    let successCount = 0;
    const errors: string[] = [];

    try {
      if (type === "customers") {
        const existing = await this.salesCrmService.listCustomers();
        const byCode = new Map(existing.map((item) => [item.code.toLowerCase(), item]));
        for (const row of rows) {
          try {
            const code = getValue(row, "cari_kodu");
            const existingCustomer = byCode.get(code.toLowerCase());
            const payload: Partial<Customer> = {
              code,
              name: getValue(row, "cari_adi"),
              city: getValue(row, "sehir"),
              phone: normalizePhone(getValue(row, "telefon")),
              email: getValue(row, "e_posta") || undefined,
              addressLine: getValue(row, "adres"),
              type: (getValue(row, "musteri_tipi").toLowerCase() as Customer["type"]) || "perakende",
              taxOffice: getValue(row, "vergi_dairesi") || undefined,
              taxNumber: getValue(row, "vergi_numarasi") || undefined,
              riskLevel: parseRiskLevel(getValue(row, "risk_seviyesi") || "low"),
              active: parseBoolean(getValue(row, "aktif") || "evet")
            };

            const customer = existingCustomer
              ? await this.salesCrmService.patchCustomer(existingCustomer.id, payload)
              : await this.salesCrmService.createCustomer(payload);
            if (!customer) {
              throw new Error("Cari kaydi olusturulamadi.");
            }
            const slotNo = parsePriceSlot(getValue(row, "fiyat_grubu") || "1", 1);
            await this.salesCrmService.patchPricingProfile(customer.id, {
              selectedPriceSlotNo: slotNo,
              active: true
            });
            successCount += 1;
          } catch (error) {
            errors.push(`Satir ${row.rowNumber}: ${error instanceof Error ? error.message : "Cari kaydedilemedi."}`);
          }
        }
      }

      if (type === "products") {
        const existing = await this.stockService.listProducts({});
        const byCode = new Map(existing.map((item) => [item.code.toLowerCase(), item]));
        const lookups = this.stockService.getStockLookupOptions();
        const brandByCode = new Map(lookups.brands.map((item) => [item.code.toLowerCase(), item.id]));
        const factoryByCode = new Map(lookups.factories.map((item) => [item.code.toLowerCase(), item.id]));
        const fallbackBrandId = lookups.brands[0]?.id ?? "brand_1";

        for (const row of rows) {
          try {
            const code = getValue(row, "urun_kodu");
            const existingProduct = byCode.get(code.toLowerCase());
            const brandId = brandByCode.get(getValue(row, "marka_kodu").toLowerCase()) ?? fallbackBrandId;
            const factoryId = factoryByCode.get(getValue(row, "fabrika_kodu").toLowerCase()) ?? undefined;
            const aliasesRaw = getValue(row, "alias_barkodlar")
              .split("|")
              .map((item) => item.trim())
              .filter(Boolean);
            const payload: Partial<Product> = {
              code,
              name: getValue(row, "urun_adi"),
              brandId,
              factoryId,
              primaryBarcode: getValue(row, "ana_barkod"),
              qrCodeValue: getValue(row, "qr_degeri"),
              defaultSource: (getValue(row, "varsayilan_kaynak") as Product["defaultSource"]) || "warehouse",
              criticalStockLevel: parseNumber(getValue(row, "kritik_stok") || "0", 0),
              active: parseBoolean(getValue(row, "aktif") || "evet"),
              barcodeAliases: aliasesRaw.map((value, index) => ({
                id: existingProduct?.barcodeAliases[index]?.id ?? `alias_${Date.now()}_${index}`,
                productId: existingProduct?.id ?? "pending",
                value,
                normalizedValue: normalizeBarcode(value)
              })),
              categoryValues: [
                { productId: existingProduct?.id ?? "pending", slotNumber: 1 as const, value: getValue(row, "kategori_1") },
                { productId: existingProduct?.id ?? "pending", slotNumber: 2 as const, value: getValue(row, "kategori_2") },
                { productId: existingProduct?.id ?? "pending", slotNumber: 3 as const, value: getValue(row, "kategori_3") },
                { productId: existingProduct?.id ?? "pending", slotNumber: 4 as const, value: getValue(row, "kategori_4") }
              ].filter((item) => item.value.trim().length > 0)
            };

            if (existingProduct) {
              await this.stockService.patchProduct(existingProduct.id, payload);
            } else {
              await this.stockService.createProduct(payload);
            }
            successCount += 1;
          } catch (error) {
            errors.push(`Satir ${row.rowNumber}: ${error instanceof Error ? error.message : "Urun kaydedilemedi."}`);
          }
        }
      }

      if (type === "pricing") {
        const products = await this.stockService.listProducts({});
        const byCode = new Map(products.map((item) => [item.code.toLowerCase(), item]));
        const priceSlots = await this.stockService.getPriceSlots();
        const slotByName = new Map(priceSlots.map((slot) => [slot.slotName.toLowerCase(), slot.slotNumber]));

        for (const row of rows) {
          try {
            const code = getValue(row, "urun_kodu").toLowerCase();
            const product = byCode.get(code);
            if (!product) {
              throw new Error("Urun bulunamadi.");
            }
            const slotText = getValue(row, "fiyat_slotu");
            const slotNoRaw = Number(slotText);
            const slotNo = (slotNoRaw >= 1 && slotNoRaw <= 6 ? slotNoRaw : slotByName.get(slotText.toLowerCase())) as PriceSlotNumber | undefined;
            if (!slotNo) throw new Error("Gecerli fiyat slotu bulunamadi.");
            const updated = [...product.priceTiers];
            const existingTierIndex = updated.findIndex((item) => item.slotNumber === slotNo);
            const tier = {
              productId: product.id,
              slotNumber: slotNo,
              amount: parseNumber(getValue(row, "fiyat_degeri"), 0),
              currency: (getValue(row, "para_birimi").toUpperCase() as "TRY" | "USD" | "EUR") || "TRY",
              active: parseBoolean(getValue(row, "aktif") || "evet")
            };
            if (existingTierIndex >= 0) {
              updated[existingTierIndex] = tier;
            } else {
              updated.push(tier);
            }
            await this.stockService.patchProduct(product.id, { priceTiers: updated });
            successCount += 1;
          } catch (error) {
            errors.push(`Satir ${row.rowNumber}: ${error instanceof Error ? error.message : "Fiyat kaydi yazilamadi."}`);
          }
        }
      }

      if (type === "warehouses") {
        const settings = getTenantSettingsState();
        const nextWarehouses: WarehouseSetupItem[] = rows.map((row, index) => {
          const code = getValue(row, "depo_kodu");
          const existing = settings.warehouses.find((item) => item.code.toLowerCase() === code.toLowerCase());
          const typeRaw = getValue(row, "depo_tipi").toLowerCase();
          const warehouseType: WarehouseSetupItem["warehouseType"] =
            typeRaw === "center" || typeRaw === "branch" || typeRaw === "transfer" ? typeRaw : "branch";
          return {
            id: existing?.id ?? `wh_import_${index + 1}`,
            code,
            name: getValue(row, "depo_adi"),
            warehouseType,
            active: parseBoolean(row.values.aktif ?? "evet"),
            sortOrder: index + 1,
            isDefault: parseBoolean(getValue(row, "varsayilan") || "hayir")
          };
        });
        const defaultWarehouse = nextWarehouses.find((item) => item.isDefault) ?? nextWarehouses[0];
        const nextSettings: PlatformSettings = {
          ...settings,
          warehouses: nextWarehouses,
          company: {
            ...settings.company,
            defaultWarehouseId: defaultWarehouse?.id ?? settings.company.defaultWarehouseId
          }
        };
        setTenantSettingsState(nextSettings);
        successCount = rows.length;
      }

      if (type === "stock-locations") {
        const products = await this.stockService.listProducts({});
        const byCode = new Map(products.map((item) => [item.code.toLowerCase(), item]));
        const warehouseByCode = new Map(
          getTenantSettingsState().warehouses.map((item) => [item.code.toLowerCase(), item.id])
        );
        const grouped = new Map<string, PreviewRow[]>();
        for (const row of rows) {
          const code = getValue(row, "urun_kodu").toLowerCase();
          const arr = grouped.get(code) ?? [];
          arr.push(row);
          grouped.set(code, arr);
        }

        for (const [code, productRows] of grouped.entries()) {
          const product = byCode.get(code);
          if (!product) {
            for (const row of productRows) {
              errors.push(`Satir ${row.rowNumber}: Urun bulunamadi.`);
            }
            continue;
          }
          try {
            const stocks = [];
            const locations = [];
            for (const row of productRows) {
              const warehouseId = warehouseByCode.get(getValue(row, "depo_kodu").toLowerCase());
              if (!warehouseId) {
                errors.push(`Satir ${row.rowNumber}: Depo kodu bulunamadi.`);
                continue;
              }
              stocks.push({
                productId: product.id,
                warehouseId,
                onHand: parseNumber(getValue(row, "mevcut_stok"), 0),
                reserved: parseNumber(getValue(row, "rezerve_stok") || "0", 0)
              });
              locations.push({
                productId: product.id,
                warehouseId,
                rackNo: getValue(row, "raf_no") || "-",
                locationCode: getValue(row, "lokasyon_kodu") || "-"
              });
              successCount += 1;
            }
            await this.stockService.patchProduct(product.id, {
              warehouseStocks: stocks,
              locations
            });
          } catch (error) {
            errors.push(`Urun ${product.code}: ${error instanceof Error ? error.message : "Stok kaydi yazilamadi."}`);
          }
        }
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Import islemi tamamlanamadi.");
    }

    const status = errors.length > 0 ? (successCount > 0 ? "applied" : "failed") : "applied";
    const history = addImportHistoryRecord({
      tenantId: this.context.tenantId,
      type,
      fileName: file.fileName,
      uploadedBy: this.context.userId,
      previewRecordCount: preview.totalRows,
      successCount,
      errorCount: errors.length,
      warningCount: preview.warningCount,
      status,
      summary: buildImportSummary(status, preview.totalRows, successCount, errors.length)
    });

    return {
      importId: history.id,
      importType: type,
      fileName: file.fileName,
      totalRows: preview.totalRows,
      successCount,
      errorCount: errors.length,
      warningCount: preview.warningCount,
      status,
      errors
    };
  }

  listHistory(type?: ImportType): ImportHistoryRecord[] {
    return listImportHistory(this.context.tenantId, type);
  }

  getHistoryById(id: string): ImportHistoryRecord | null {
    return getImportHistoryById(this.context.tenantId, id);
  }
}
