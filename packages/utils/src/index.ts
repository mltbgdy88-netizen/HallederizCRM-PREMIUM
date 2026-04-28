export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function noopAsync(): Promise<void> {
  return Promise.resolve();
}
