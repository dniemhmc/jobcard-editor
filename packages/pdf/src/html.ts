const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes user text for safe inclusion in HTML. Use for ALL interpolated values. */
export function escapeHtml(value: string | undefined | null): string {
  return (value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}
