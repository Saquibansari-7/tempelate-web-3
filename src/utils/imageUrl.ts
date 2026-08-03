const EXPECTED_SUPABASE_HOST = (() => {
  try {
    const raw = (import.meta.env.VITE_PUBLIC_SUPABASE_URL as string) || '';
    if (!raw) return '';
    const parsed = new URL(raw);
    return parsed.hostname;
  } catch {
    return '';
  }
})();

export function normalizeImage(value: string): string {
  if (!value || value.startsWith('/uploads/')) return value;
  const normalized = value.replace(/https?:\/\/[^/]+\.supabase\.co\//, (match) => {
    if (!EXPECTED_SUPABASE_HOST) return match;
    if (match.includes(EXPECTED_SUPABASE_HOST)) return match;
    return `https://${EXPECTED_SUPABASE_HOST}/`;
  });
  return normalized;
}
