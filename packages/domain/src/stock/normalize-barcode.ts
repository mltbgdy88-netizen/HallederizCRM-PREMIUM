export function normalizeBarcode(value: string): string {
  return value.replace(/[^0-9a-zA-Z]/g, "").toUpperCase().trim();
}
