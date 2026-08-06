/** Formatting helpers for money and dates. */

/**
 * Format a number as currency. Uses grouping and, by default, hides the
 * decimals when the amount is a whole number — matching the clean look of
 * modern finance apps.
 */
export function formatMoney(
  amount: number,
  symbol = '₹',
  opts: { decimals?: boolean; sign?: boolean } = {},
): string {
  const { decimals, sign } = opts;
  const abs = Math.abs(amount);
  const showDecimals = decimals ?? !Number.isInteger(abs);
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
  const prefix = sign ? (amount < 0 ? '−' : '+') : amount < 0 ? '−' : '';
  return `${prefix}${symbol}${formatted}`;
}

/** Compact money for axis labels, e.g. ₹12.5k, ₹1.2L. */
export function formatCompact(amount: number, symbol = '₹'): string {
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `${symbol}${(abs / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `${symbol}${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${symbol}${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
  return `${symbol}${abs}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function monthName(monthIndex: number, short = false): string {
  return (short ? MONTHS_SHORT : MONTHS)[monthIndex];
}

/** Ordinal suffix for a day of month, e.g. 1 -> "1st", 6 -> "6th". */
export function ordinal(n: number): string {
  const v = n % 100;
  const suffixes = ['th', 'st', 'nd', 'rd'];
  return `${n}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
}

/** Today's date as a human label, e.g. "6th August". Recomputes each call. */
export function todayLabel(date: Date = new Date()): string {
  return `${ordinal(date.getDate())} ${MONTHS[date.getMonth()]}`;
}

/** Human date, e.g. "Today", "Yesterday", or "Mon, 4 Aug". */
export function friendlyDate(iso: string): string {
  const d = parseISO(iso);
  const today = startOfDay(new Date());
  const diffDays = Math.round((startOfDay(d).getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  const sameYear = d.getFullYear() === today.getFullYear();
  return `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}${
    sameYear ? '' : ` ${d.getFullYear()}`
  }`;
}

export function shortDate(iso: string): string {
  const d = parseISO(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Advance an ISO date by one recurrence period. */
export function advanceRecurrence(iso: string, frequency: 'weekly' | 'monthly'): string {
  const d = parseISO(iso);
  if (frequency === 'weekly') d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1);
  return toISODate(d);
}

export function daysShort(dayIndex: number): string {
  return DAYS_SHORT[dayIndex];
}

/** Generate a reasonably unique id without pulling in a uuid dependency. */
export function makeId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
