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

/** The rupee symbol used across the storefront (INR). */
export const CURRENCY_SYMBOL = "₹";

export interface CurrencyFormatOptions {
  /** ISO 4217 currency code (defaults to INR). */
  currency?: string;
  /** BCP 47 locale tag (defaults to en-IN for Indian number grouping). */
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format a number as Indian Rupees with Indian number formatting.
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {},
): string {
  const {
    currency = "INR",
    locale = "en-IN",
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Format a number with locale-aware separators.
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}
