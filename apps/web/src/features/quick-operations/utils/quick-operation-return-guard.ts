export function parseTrDate(value: string): Date | null {
  const [day, month, year] = value.split(".").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

export function isReturnWindowExpired(saleDate: string, now = new Date()): boolean {
  const parsed = parseTrDate(saleDate);
  if (!parsed) return false;
  const diffMs = now.getTime() - parsed.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 15;
}
