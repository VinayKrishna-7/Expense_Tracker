import { CURRENCIES } from '../constants/currencies';
import { CurrencyCode } from '../types/settings';
import { format, parseISO, isValid, isToday, isYesterday } from 'date-fns';

/**
 * Formats a numeric value into localized currency string using configured currency
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'INR',
  options?: { compact?: boolean; hideDecimals?: boolean }
): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const num = Number(amount) || 0;

  if (options?.compact && Math.abs(num) >= 1000) {
    if (currencyCode === 'INR') {
      if (Math.abs(num) >= 10000000) {
        return `${config.symbol}${(num / 10000000).toFixed(1)}Cr`;
      }
      if (Math.abs(num) >= 100000) {
        return `${config.symbol}${(num / 100000).toFixed(1)}L`;
      }
      if (Math.abs(num) >= 1000) {
        return `${config.symbol}${(num / 1000).toFixed(1)}k`;
      }
    } else {
      if (Math.abs(num) >= 1000000) {
        return `${config.symbol}${(num / 1000000).toFixed(1)}M`;
      }
      if (Math.abs(num) >= 1000) {
        return `${config.symbol}${(num / 1000).toFixed(1)}k`;
      }
    }
  }

  try {
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: options?.hideDecimals ? 0 : 2,
      minimumFractionDigits: options?.hideDecimals ? 0 : (num % 1 === 0 ? 0 : 2),
    });
    return formatter.format(num);
  } catch {
    return `${config.symbol}${num.toLocaleString()}`;
  }
}

/**
 * Formats standard date string with smart "Today", "Yesterday" or formatted date
 */
export function formatSmartDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;

    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Formats a date string into standard display format
 */
export function formatDate(dateStr: string, pattern: string = 'MMM dd, yyyy'): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, pattern);
  } catch {
    return dateStr;
  }
}

/**
 * Formats percentage with sign
 */
export function formatPercentage(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
