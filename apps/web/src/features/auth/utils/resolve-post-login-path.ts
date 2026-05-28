export function resolvePostLoginPath(nextParam: string | null): string {
  if (!nextParam) return "/dashboard";
  if (!nextParam.startsWith("/") || nextParam.startsWith("//")) return "/dashboard";
  if (nextParam.startsWith("/login")) return "/dashboard";
  return nextParam;
}
