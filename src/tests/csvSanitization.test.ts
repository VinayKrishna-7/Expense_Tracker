import { describe, it, expect } from 'vitest';
import { sanitizeCsvField, transactionsToCsv } from '../../server/services/exportService';

describe('CSV Sanitization & Formula Injection Defense', () => {
  it('prefixes dangerous formula characters (=, +, -, @) with single quote', () => {
    expect(sanitizeCsvField('=cmd|/C calc')).toBe(`'=cmd|/C calc`);
    expect(sanitizeCsvField('+12345')).toBe(`'+12345`);
    expect(sanitizeCsvField('-SUM(A1:A10)')).toBe(`'-SUM(A1:A10)`);
    expect(sanitizeCsvField('@SUM(1+1)')).toBe(`'@SUM(1+1)`);
  });

  it('leaves safe standard text unmodified', () => {
    expect(sanitizeCsvField('Grocery shopping at Whole Foods')).toBe('Grocery shopping at Whole Foods');
    expect(sanitizeCsvField(250.75)).toBe('250.75');
  });

  it('escapes fields with commas and double quotes correctly', () => {
    expect(sanitizeCsvField('Target, Supercenter')).toBe('"Target, Supercenter"');
    expect(sanitizeCsvField('Coffee "Latte"')).toBe('"Coffee ""Latte"""');
  });

  it('generates fully sanitized CSV transaction output', () => {
    const csv = transactionsToCsv([
      {
        date: '2026-09-11',
        type: 'expense',
        amount: 50,
        category: 'Food',
        account: 'Checking',
        description: '=MALICIOUS_FORMULA',
      },
    ]);

    expect(csv).toContain(`'=MALICIOUS_FORMULA`);
    expect(csv.startsWith('Date,Type,Amount,Category,Account,Description,Notes')).toBe(true);
  });
});
