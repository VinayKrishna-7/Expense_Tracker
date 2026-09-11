import { Transaction, TransactionType, PaymentMethod } from '../types/transaction';
import { Category } from '../types/category';

export interface CSVParseResult {
  valid: Partial<Transaction>[];
  invalid: { row: number; data: string[]; error: string }[];
}

/**
 * Escapes a cell value for CSV output
 */
function escapeCSVCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts transactions array into a formatted CSV string
 */
export function exportToCSV(
  transactions: Transaction[],
  categories: Category[]
): string {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = [
    'Date',
    'Title',
    'Type',
    'Category',
    'Amount',
    'Payment Method',
    'Notes',
    'Recurring',
  ];

  const rows = transactions.map((t) => [
    t.date,
    t.title,
    t.type,
    categoryMap.get(t.category) || t.category,
    t.amount,
    t.paymentMethod,
    t.notes || '',
    t.isRecurring ? t.recurringFrequency || 'Yes' : 'No',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSVCell).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Triggers a browser download of a CSV file
 */
export function downloadCSVFile(csvContent: string, filename?: string): void {
  const dateStr = new Date().toISOString().slice(0, 7);
  const defaultFilename = `expenseflow-transactions-${dateStr}.csv`;
  const finalFilename = filename || defaultFilename;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses a simple CSV text line taking into account quotes
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses and validates CSV content into transaction records
 */
export function parseCSV(
  csvText: string,
  categories: Category[]
): CSVParseResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      valid: [],
      invalid: [{ row: 1, data: [], error: 'CSV file is empty or missing data rows' }],
    };
  }

  const valid: Partial<Transaction>[] = [];
  const invalid: { row: number; data: string[]; error: string }[] = [];

  // Match category names to IDs
  const categoryNameToId = new Map<string, string>();
  for (const cat of categories) {
    categoryNameToId.set(cat.name.toLowerCase(), cat.id);
    categoryNameToId.set(cat.id.toLowerCase(), cat.id);
  }

  const validPaymentMethods: PaymentMethod[] = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'UPI',
    'Bank Transfer',
    'Wallet',
    'Other',
  ];

  // Skip header (row 0)
  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const values = parseCSVLine(lines[i]);

    if (values.length < 5) {
      invalid.push({
        row: rowNum,
        data: values,
        error: 'Insufficient columns (Expected at least Date, Title, Type, Category, Amount)',
      });
      continue;
    }

    const [dateStr, title, typeStr, categoryStr, amountStr, paymentMethodStr, notesStr] = values;

    // Validate Date
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      invalid.push({
        row: rowNum,
        data: values,
        error: `Invalid date format '${dateStr}'. Expected YYYY-MM-DD.`,
      });
      continue;
    }

    // Validate Title
    if (!title || title.trim().length === 0) {
      invalid.push({
        row: rowNum,
        data: values,
        error: 'Title is required',
      });
      continue;
    }

    // Validate Type
    const normalizedType = typeStr.toLowerCase().trim();
    if (normalizedType !== 'expense' && normalizedType !== 'income') {
      invalid.push({
        row: rowNum,
        data: values,
        error: `Invalid transaction type '${typeStr}'. Must be 'expense' or 'income'.`,
      });
      continue;
    }

    // Validate Amount
    const cleanAmountStr = amountStr.replace(/[^0-9.-]+/g, '');
    const amount = parseFloat(cleanAmountStr);
    if (isNaN(amount) || amount <= 0) {
      invalid.push({
        row: rowNum,
        data: values,
        error: `Invalid amount '${amountStr}'. Must be a positive number.`,
      });
      continue;
    }

    // Resolve Category
    const cleanCat = categoryStr.trim().toLowerCase();
    const matchedCategoryId = categoryNameToId.get(cleanCat) || (normalizedType === 'income' ? 'cat-salary' : 'cat-other-exp');

    // Resolve Payment Method
    let paymentMethod: PaymentMethod = 'Other';
    const foundMethod = validPaymentMethods.find(
      (m) => m.toLowerCase() === (paymentMethodStr || '').trim().toLowerCase()
    );
    if (foundMethod) {
      paymentMethod = foundMethod;
    } else if (/upi/i.test(paymentMethodStr || '')) {
      paymentMethod = 'UPI';
    } else if (/card/i.test(paymentMethodStr || '')) {
      paymentMethod = 'Credit Card';
    } else if (/bank/i.test(paymentMethodStr || '')) {
      paymentMethod = 'Bank Transfer';
    }

    valid.push({
      title: title.trim(),
      amount,
      type: normalizedType as TransactionType,
      category: matchedCategoryId,
      date: dateStr.trim(),
      paymentMethod,
      notes: notesStr ? notesStr.trim() : undefined,
    });
  }

  return { valid, invalid };
}
