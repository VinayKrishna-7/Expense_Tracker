import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatPercentage,
} from '../utils/formatters';

describe('Formatters Utility', () => {
  it('formats INR currency correctly', () => {
    const formatted = formatCurrency(42500, 'INR');
    expect(formatted).toContain('42,500');
  });

  it('formats USD currency correctly', () => {
    const formatted = formatCurrency(1250, 'USD');
    expect(formatted).toContain('$');
    expect(formatted).toContain('1,250');
  });

  it('formats EUR currency correctly', () => {
    const formatted = formatCurrency(500, 'EUR');
    expect(formatted).toContain('€');
  });

  it('formats compact representations correctly', () => {
    const formatted = formatCurrency(500000, 'INR', { compact: true });
    expect(formatted).toBe('₹5.0L');
  });

  it('formats percentage with sign', () => {
    expect(formatPercentage(8.4)).toBe('+8.4%');
    expect(formatPercentage(-3.8)).toBe('-3.8%');
    expect(formatPercentage(0)).toBe('0.0%');
  });

  it('formats valid dates gracefully', () => {
    expect(formatDate('2026-09-11', 'yyyy-MM-dd')).toBe('2026-09-11');
  });
});
