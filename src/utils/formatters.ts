/**
 * Format a date string to a locale-readable format.
 */
export function formatDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, options);
}

/**
 * Format a number as currency.
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format a number with locale-aware separators.
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}
