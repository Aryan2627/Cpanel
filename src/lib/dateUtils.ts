/**
 * dateUtils.ts
 * Timezone-safe date formatting utilities.
 * Fixes the UTC date corruption issue where dates show as "wrong day"
 * for users outside the UTC timezone.
 */

/**
 * Format an ISO date string or Date object to a locale-aware display string.
 * Respects the user's local timezone.
 */
export function formatDate(
  value: string | Date | null | undefined,
  opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  if (!value) return '—';
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, opts);
  } catch {
    return String(value);
  }
}

/**
 * Format as relative time (e.g., "2 hours ago", "3 days ago").
 */
export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return '—';
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(value);
  } catch {
    return '—';
  }
}

/**
 * Get current datetime formatted for DB storage.
 * Returns an ISO string - always use this instead of new Date().toISOString().split('T')[0]
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Format a date for display in the "11:55 pm, 05 Oct 2026" style used in the app.
 */
export function formatDisplayDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(value);
  }
}
