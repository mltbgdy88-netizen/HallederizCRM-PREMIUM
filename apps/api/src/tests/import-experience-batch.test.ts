import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";
import { ImportsService } from "../modules/imports/service";

const context = {
  tenantId: "tenant_1",
  userId: "user_admin",
  persistenceMode: "demo",
  isAuthenticated: true
} as never;

function toBase64(content: string): string {
  return Buffer.from(content, "utf-8").toString("base64");
}

async function toXlsxBase64(sheets: Record<string, string[][]>): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  Object.entries(sheets).forEach(([name, rows]) => {
    const worksheet = workbook.addWorksheet(name);
    rows.forEach((row) => worksheet.addRow(row));
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer).toString("base64");
}

test("xlsx best sheet suggestion picks closest matching headers", async () => {
  const service = new ImportsService(context);
  const file = {
    fileName: "customers.xlsx",
    contentBase64: await toXlsxBase64({
      Notlar: [["A", "B"], ["1", "2"]],
      Cariler: [["Cari Kodu", "Cari Adi", "Telefon"], ["CAR-1", "Aydin", "+905001112233"]]
    })
  };

  const preview = await service.preview("customers", file);
  assert.equal(preview.fileType, "xlsx");
  assert.equal(preview.suggestedSheetName, "Cariler");
  assert.ok((preview.sheetScoreSummary?.length ?? 0) >= 2);
});

test("import preview rejects unsupported file extension", async () => {
  const service = new ImportsService(context);
  await assert.rejects(
    () =>
      service.preview("customers", {
        fileName: "customers.xlsm",
        contentBase64: toBase64("cari_kodu,cari_adi\nCAR-1,Aydin")
      }),
    /Sadece CSV veya XLSX/
  );
});

test("header alias mapping resolves common product aliases", async () => {
  const service = new ImportsService(context);
  const csv = [
    "Stok Kodu,Urun Adi,Barkod,Aktif",
    "PRD-1,Deneme Urun,8690000000001,evet"
  ].join("\n");

  const preview = await service.preview("products", {
    fileName: "products.csv",
    contentBase64: toBase64(csv)
  });

  assert.equal(preview.columnMapping?.["Stok Kodu"], "urun_kodu");
  assert.equal(preview.columnMapping?.Barkod, "ana_barkod");
});

test("preview validation reports duplicate customer code", async () => {
  const service = new ImportsService(context);
  const csv = [
    "cari_kodu,cari_adi",
    "CAR-X,A",
    "CAR-X,B"
  ].join("\n");

  const preview = await service.preview("customers", {
    fileName: "customers.csv",
    contentBase64: toBase64(csv)
  });

  assert.ok(preview.errorCount > 0);
  assert.ok(preview.issues.some((issue) => issue.code === "duplicate_in_file"));
});

test("import apply happy path writes history", async () => {
  const service = new ImportsService(context);
  const csv = [
    "depo_kodu,depo_adi,depo_tipi,aktif,varsayilan",
    "MERKEZ,Merkez Depo,center,evet,evet"
  ].join("\n");

  const result = await service.apply("warehouses", {
    fileName: "warehouses.csv",
    contentBase64: toBase64(csv)
  });

  assert.equal(result.status, "applied");
  const history = service.getHistoryById(result.importId);
  assert.ok(history);
  assert.equal(history?.fileType, "csv");
});

test("history error report available for failed import", async () => {
  const service = new ImportsService(context);
  const csv = [
    "urun_kodu,fiyat_slotu,fiyat_degeri,para_birimi",
    "UNKNOWN,99,ABC,XXX"
  ].join("\n");

  const result = await service.apply("pricing", {
    fileName: "pricing.csv",
    contentBase64: toBase64(csv)
  });

  assert.equal(result.status, "failed");
  const report = service.getErrorReport(result.importId);
  assert.ok(report.length > 0);
});
