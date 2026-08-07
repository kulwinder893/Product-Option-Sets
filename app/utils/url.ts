export function getSearchParam(
  url: URL,
  key: string,
  fallback = "",
): string {
  return url.searchParams.get(key)?.trim() || fallback;
}

export function buildSearchParams(
  params: Record<string, string | number | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
