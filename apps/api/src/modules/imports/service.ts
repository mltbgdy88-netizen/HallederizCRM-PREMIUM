import type {
  Customer,
  CustomerRiskLevel,
  ImportApplyResult,
  ImportFilePayload,
  ImportHistoryRecord,
  ImportPreviewIssue,
  ImportPreviewRecord,
  ImportPreviewResult,
  ImportSheetScore,
  ImportTemplateDefinition,
  ImportType,
  PlatformSettings,
  PriceSlotNumber,
  Product,
  WarehouseSetupItem
} from "@hallederiz/types";
import { normalizeBarcode } from "@hallederiz/domain";
import XLSX from "xlsx";
import type { RequestContext } from "../../shared/request-context";
import {
  addImportHistoryRecord,
  buildImportSummary,
  getImportHistoryById,
  listImportHistory,
  updateImportHistoryRecord
} from "../../shared/import-history-store";
import { ProductStockPricingService } from "../product-stock-pricing/service";
import { SalesCrmService } from "../sales-crm/service";
import { getTenantSettingsState, setTenantSettingsState } from "../../platform-core/settings-state";

interface ParsedTable {
  headers: string[];
  rows: string[][];
  source: {
    fileType: "csv" | "xlsx";
    sheetName?: string;
    sheetNames?: string[];
    suggestedSheetName?: string;
    sheetScoreSummary?: ImportSheetScore[];
  };
}

type PreviewRow = {
  rowNumber: number;
  values: Record<string, string>;
  normalized: Record<string, string>;
};

const REQUIRED_COLUMNS: Record<ImportType, string[]> = {
  customers: ["cari_kodu", "cari_adi"],
  products: ["urun_kodu", "urun_adi"],
  pricing: ["urun_kodu", "fiyat_slotu", "fiyat_degeri", "para_birimi"],
  warehouses: ["depo_kodu", "depo_adi"],
  "stock-locations": ["urun_kodu", "depo_kodu", "mevcut_stok"]
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
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const HEADER_ALIASES: Record<string, string> = {
  carikodu: "cari_kodu",
  carikod: "cari_kodu",
  cari_kod: "cari_kodu",
  caricode: "cari_kodu",
  musterikodu: "cari_kodu",
  musterikod: "cari_kodu",
  urunkodu: "urun_kodu",
  urunkod: "urun_kodu",
  urun_kod: "urun_kodu",
  stokkodu: "urun_kodu",
  stokkod: "urun_kodu",
  sku: "urun_kodu",
  barkod: "ana_barkod",
  anabarkod: "ana_barkod",
  barcode: "ana_barkod",
  fiyatslotu: "fiyat_slotu",
  slot: "fiyat_slotu",
  slotadi: "fiyat_slotu",
  bayifiyati: "fiyat_slotu",
  mimarfiyati: "fiyat_slotu",
  fiyatgrubu: "fiyat_grubu",
  parabirimi: "para_birimi",
  depokodu: "depo_kodu",
  warehousecode: "depo_kodu",
  depoadi: "depo_adi",
  warehouse: "depo_adi",
  lokasyon: "lokasyon_kodu",
  raf: "raf_no",
  rafno: "raf_no",
  mevcutstok: "mevcut_stok",
  kullanilabilirstok: "mevcut_stok"
};

function resolveHeaderAlias(value: string): string {
  const canonical = canonicalizeHeader(value);
  const aliasKey = canonical.replace(/_/g, "");
  return HEADER_ALIASES[aliasKey] ?? canonical;
}

function scoreSheetHeaders(importType: ImportType, headers: string[], sheetName: string): ImportSheetScore {
  const normalized = headers.map(resolveHeaderAlias);
  const expected = new Set(CSV_TEMPLATES[importType].columns);
  const matchedColumns = normalized.filter((header) => expected.has(header));
  const missingRequiredColumns = REQUIRED_COLUMNS[importType].filter((required) => !normalized.includes(required));
  const score = matchedColumns.length * 2 - missingRequiredColumns.length * 3;
  return {
    sheetName,
    score,
    matchedColumns,
    missingRequiredColumns
  };
}

function buildSheetSuggestionSummary(scores: ImportSheetScore[]): ImportSheetScore[] {
  return [...scores].sort((a, b) => b.score - a.score || b.matchedColumns.length - a.matchedColumns.length);
}

function resolveColumnMapping(importType: ImportType, headers: string[]): {
  mappedHeaders: string[];
  columnMapping: Record<string, string>;
  requiredMissingColumns: string[];
  unmappedColumns: string[];
} {
  const expected = new Set(CSV_TEMPLATES[importType].columns);
  const mappedHeaders = headers.map(resolveHeaderAlias);
  const columnMapping: Record<string, string> = {};
  const unmappedColumns: string[] = [];
  headers.forEach((header, index) => {
    const mapped = mappedHeaders[index] ?? "";
    columnMapping[header] = mapped;
    if (!expected.has(mapped)) {
      unmappedColumns.push(header);
    }
  });
  const requiredMissingColumns = REQUIRED_COLUMNS[importType].filter((required) => !mappedHeaders.includes(required));
  return { mappedHeaders, columnMapping, requiredMissingColumns, unmappedColumns };
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
    return { headers: [], rows: [], source: { fileType: "csv" } };
  }

  const firstLine = lines[0] ?? "";
  const commaCells = parseCsvLine(firstLine, ",").length;
  const semicolonCells = parseCsvLine(firstLine, ";").length;
  const delimiter: "," | ";" = semicolonCells > commaCells ? ";" : ",";

  const headers = parseCsvLine(firstLine, delimiter).map((header) => header.trim());
  const rows = lines.slice(1).map((line) => parseCsvLine(line, delimiter));
  return { headers, rows, source: { fileType: "csv" } };
}

function parseXlsx(buffer: Buffer, importType: ImportType, selectedSheetName?: string): ParsedTable {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetNames = workbook.SheetNames ?? [];
  const sheetScores = buildSheetSuggestionSummary(
    sheetNames.map((name) => {
      const sheet = workbook.Sheets[name];
      if (!sheet) {
        return {
          sheetName: name,
          score: -999,
          matchedColumns: [],
          missingRequiredColumns: [...REQUIRED_COLUMNS[importType]]
        };
      }
      const headerRow = (XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        blankrows: false,
        raw: false,
        defval: ""
      }) as string[][])[0] ?? [];
      return scoreSheetHeaders(importType, headerRow.map((cell) => String(cell ?? "")), name);
    })
  );
  const suggestedSheetName = sheetScores[0]?.sheetName;
  const sheetName = selectedSheetName && sheetNames.includes(selectedSheetName) ? selectedSheetName : suggestedSheetName ?? sheetNames[0];
  if (!sheetName) {
    return { headers: [], rows: [], source: { fileType: "xlsx", sheetNames, suggestedSheetName, sheetScoreSummary: sheetScores } };
  }

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    return { headers: [], rows: [], source: { fileType: "xlsx", sheetName, sheetNames, suggestedSheetName, sheetScoreSummary: sheetScores } };
  }
  const rawRows = (XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    blankrows: false,
    raw: false,
    defval: ""
  }) as Array<Array<string | number | boolean | Date | null>>).filter((row) =>
    row.some((cell) => String(cell ?? "").trim().length > 0)
  );
  if (rawRows.length === 0) {
    return { headers: [], rows: [], source: { fileType: "xlsx", sheetName, sheetNames, suggestedSheetName, sheetScoreSummary: sheetScores } };
  }
  const headerRow = rawRows[0] ?? [];
  const headers = headerRow.map((cell) => String(cell ?? "").trim());
  const rows = rawRows
    .slice(1)
    .map((row) => row.map((cell) => String(cell ?? "").trim()))
    .filter((row) => row.some((cell) => cell.length > 0));

  return {
    headers,
    rows,
    source: { fileType: "xlsx", sheetName, sheetNames, suggestedSheetName, sheetScoreSummary: sheetScores }
  };
}

function decodeFileContent(file: ImportFilePayload): Buffer {
  return Buffer.from(file.contentBase64, "base64");
}

function parseFile(type: ImportType, file: ImportFilePayload): ParsedTable {
  const fileName = file.fileName.toLowerCase();
  const buffer = decodeFileContent(file);
  if (fileName.endsWith(".xlsx")) {
    return parseXlsx(buffer, type, file.sheetName);
  }
  return parseCsv(buffer.toString("utf-8"));
}

function toPreviewRows(headers: string[], rows: string[][]): PreviewRow[] {
  return rows.map((row, index) => {
    const values: Record<string, string> = {};
    const normalized: Record<string, string> = {};
    headers.forEach((header, headerIndex) => {
      values[header] = String(row[headerIndex] ?? "").trim();
      normalized[header] = String(row[headerIndex] ?? "").trim();
    });
    return { rowNumber: index + 2, values, normalized };
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

function buildIssue(
  rowNumber: number,
  field: string,
  severity: "error" | "warning",
  message: string,
  code?: string,
  suggestion?: string
): ImportPreviewIssue {
  return { rowNumber, field, severity, message, code, suggestion };
}

function toPreviewRecords(rows: PreviewRow[], issues: ImportPreviewIssue[]): ImportPreviewRecord[] {
  const rowsWithError = new Set(issues.filter((issue) => issue.severity === "error").map((issue) => issue.rowNumber));
  const rowsWithWarning = new Set(issues.filter((issue) => issue.severity === "warning").map((issue) => issue.rowNumber));
  return rows.map((row) => {
    const status = rowsWithError.has(row.rowNumber) ? "error" : rowsWithWarning.has(row.rowNumber) ? "warning" : "valid";
    return {
      rowNumber: row.rowNumber,
      data: row.values,
      normalized: row.normalized,
      status
    };
  });
}

function buildErrorReport(issues: ImportPreviewIssue[]): string[] {
  return issues
    .filter((item) => item.severity === "error")
    .map((item) => `Satir ${item.rowNumber} [${item.field}] ${item.message}${item.suggestion ? ` | Cozum: ${item.suggestion}` : ""}`);
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
    const table = parseFile(type, file);
    const mapping = resolveColumnMapping(type, table.headers);
    const rows = toPreviewRows(mapping.mappedHeaders, table.rows);
    const issues: ImportPreviewIssue[] = [];

    mapping.requiredMissingColumns.forEach((column) => {
      issues.push(buildIssue(1, column, "error", `${column} kolonu bulunamadi.`, "missing_required_column", "Template basliklarini kullanin."));
    });
    mapping.unmappedColumns.forEach((column) => {
      issues.push(buildIssue(1, column, "warning", `${column} kolonu eslestirilemedi.`, "unmapped_column", "Kolon adini standart basliga yaklastirin."));
    });

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
          issues.push(buildIssue(row.rowNumber, "cari_kodu", "error", "Dosya icinde duplicate cari kodu var.", "duplicate_in_file"));
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
            issues.push(buildIssue(row.rowNumber, "ana_barkod", "error", `Barkod cakisiyor (${conflict.code}).`, "barcode_conflict"));
          }
        }
      }

      if (type === "pricing") {
        const code = (data.urun_kodu ?? "").trim().toLowerCase();
        const slotRaw = (data.fiyat_slotu ?? "").trim();
        const currency = (data.para_birimi ?? "").trim().toUpperCase();
        if (!productByCode.has(code)) {
          issues.push(buildIssue(row.rowNumber, "urun_kodu", "error", "Urun kodu bulunamadi.", "unknown_product"));
        }
        const slotNo = Number(slotRaw);
        const slotByName = priceSlotByName.get(slotRaw.toLowerCase());
        if (!(slotNo >= 1 && slotNo <= 6) && !slotByName) {
          issues.push(buildIssue(row.rowNumber, "fiyat_slotu", "error", "Fiyat slotu 1-6 veya gecerli slot adi olmali.", "invalid_slot"));
        }
        if (!["TRY", "USD", "EUR"].includes(currency)) {
          issues.push(buildIssue(row.rowNumber, "para_birimi", "error", "Para birimi TRY/USD/EUR olmali.", "invalid_currency"));
        }
        if (!Number.isFinite(Number((data.fiyat_degeri ?? "").replace(",", ".")))) {
          issues.push(buildIssue(row.rowNumber, "fiyat_degeri", "error", "Fiyat degeri sayi olmali.", "invalid_number"));
        }
      }

      if (type === "warehouses") {
        const code = (data.depo_kodu ?? "").trim();
        const name = (data.depo_adi ?? "").trim();
        if (!code) issues.push(buildIssue(row.rowNumber, "depo_kodu", "error", "Depo kodu zorunludur."));
        if (!name) issues.push(buildIssue(row.rowNumber, "depo_adi", "error", "Depo adi zorunludur."));
        const codeKey = code.toLowerCase();
        if (code && seenWarehouseCodes.has(codeKey)) {
          issues.push(buildIssue(row.rowNumber, "depo_kodu", "error", "Dosya icinde duplicate depo kodu var.", "duplicate_in_file"));
        }
        seenWarehouseCodes.add(codeKey);
      }

      if (type === "stock-locations") {
        const code = (data.urun_kodu ?? "").trim().toLowerCase();
        const warehouseCode = (data.depo_kodu ?? "").trim().toLowerCase();
        if (!productByCode.has(code)) {
          issues.push(buildIssue(row.rowNumber, "urun_kodu", "error", "Urun kodu bulunamadi.", "unknown_product"));
        }
        if (!warehouseCodeSet.has(warehouseCode)) {
          issues.push(buildIssue(row.rowNumber, "depo_kodu", "error", "Depo kodu bulunamadi.", "unknown_warehouse"));
        }
        if (!Number.isFinite(Number((data.mevcut_stok ?? "").replace(",", ".")))) {
          issues.push(buildIssue(row.rowNumber, "mevcut_stok", "error", "Mevcut stok sayi olmali.", "invalid_number"));
        }
        if (!Number.isFinite(Number((data.rezerve_stok ?? "0").replace(",", ".")))) {
          issues.push(buildIssue(row.rowNumber, "rezerve_stok", "error", "Rezerve stok sayi olmali.", "invalid_number"));
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
      fileType: table.source.fileType,
      sheetName: table.source.sheetName,
      sheetNames: table.source.sheetNames,
      suggestedSheetName: table.source.suggestedSheetName,
      sheetScoreSummary: table.source.sheetScoreSummary,
      columnMapping: mapping.columnMapping,
      unmappedColumns: mapping.unmappedColumns,
      requiredMissingColumns: mapping.requiredMissingColumns,
      totalRows: rows.length,
      validRows: Math.max(validRows, 0),
      errorCount,
      warningCount,
      records: toPreviewRecords(rows, issues).slice(0, 250),
      issues: issues.slice(0, 500)
    };
  }

  async apply(type: ImportType, file: ImportFilePayload): Promise<ImportApplyResult> {
    const startedAt = Date.now();
    const preview = await this.preview(type, file);
    if (preview.errorCount > 0) {
      const failedRecord = addImportHistoryRecord({
        tenantId: this.context.tenantId,
        type,
        fileName: file.fileName,
        fileType: preview.fileType,
        sheetName: preview.sheetName,
        uploadedBy: this.context.userId,
        previewRecordCount: preview.totalRows,
        successCount: 0,
        errorCount: preview.errorCount,
        skippedCount: preview.totalRows,
        conflictCount: preview.issues.filter((issue) => (issue.code ?? "").includes("duplicate") || (issue.code ?? "").includes("conflict")).length,
        warningCount: preview.warningCount,
        durationMs: Date.now() - startedAt,
        status: "failed",
        summary: buildImportSummary("failed", preview.totalRows, 0, preview.errorCount),
        details: {
          issues: preview.issues.slice(0, 500),
          records: preview.records.slice(0, 250),
          errorReport: buildErrorReport(preview.issues)
        }
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
        errors: buildErrorReport(preview.issues)
      };
    }

    const table = parseFile(type, file);
    const mapping = resolveColumnMapping(type, table.headers);
    const rows = toPreviewRows(mapping.mappedHeaders, table.rows);
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
    const conflictCount = preview.issues.filter((issue) => (issue.code ?? "").includes("duplicate") || (issue.code ?? "").includes("conflict")).length;
    const skippedCount = Math.max(preview.totalRows - successCount, 0);
    const history = addImportHistoryRecord({
      tenantId: this.context.tenantId,
      type,
      fileName: file.fileName,
      fileType: preview.fileType,
      sheetName: preview.sheetName,
      uploadedBy: this.context.userId,
      previewRecordCount: preview.totalRows,
      successCount,
      errorCount: errors.length,
      skippedCount,
      conflictCount,
      warningCount: preview.warningCount,
      durationMs: Date.now() - startedAt,
      status,
      summary: buildImportSummary(status, preview.totalRows, successCount, errors.length),
      details: {
        issues: preview.issues.slice(0, 500),
        records: preview.records.slice(0, 250),
        errorReport: errors.length > 0 ? errors : buildErrorReport(preview.issues)
      }
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

  retryHistory(id: string): ImportHistoryRecord | null {
    const target = this.getHistoryById(id);
    if (!target) return null;
    return updateImportHistoryRecord(this.context.tenantId, id, {
      status: target.status === "failed" ? "previewed" : target.status,
      summary: target.status === "failed" ? "Import yeniden deneme icin hazirlandi." : target.summary
    });
  }

  getErrorReport(id: string): string[] {
    const target = this.getHistoryById(id);
    return target?.details?.errorReport ?? [];
  }
}


