/**
 * Sanitizes a string for CSV export to prevent CSV / Formula Injection attacks
 * (e.g. formulas starting with =, +, -, @, \t, \r)
 */
export function sanitizeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '';
  const str = String(field);

  // If the cell starts with formula characters, prefix with single quote
  let sanitized = str;
  if (/^[=+\-@\t\r]/.test(sanitized)) {
    sanitized = `'${sanitized}`;
  }

  // Escape internal double quotes and wrap in quotes if necessary
  if (sanitized.includes('"') || sanitized.includes(',') || sanitized.includes('\n')) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }

  return sanitized;
}

export function transactionsToCsv(
  transactions: Array<{
    date: string | Date;
    type: string;
    amount: number;
    category?: { name: string } | string;
    account?: { name: string } | string;
    description: string;
    notes?: string;
  }>
): string {
  const headers = ['Date', 'Type', 'Amount', 'Category', 'Account', 'Description', 'Notes'];
  const rows = transactions.map((t) => {
    const catName = typeof t.category === 'object' ? t.category?.name : t.category || '';
    const accName = typeof t.account === 'object' ? t.account?.name : t.account || '';
    const formattedDate =
      typeof t.date === 'string' ? t.date.split('T')[0] : t.date.toISOString().split('T')[0];

    return [
      sanitizeCsvField(formattedDate),
      sanitizeCsvField(t.type),
      sanitizeCsvField(t.amount),
      sanitizeCsvField(catName),
      sanitizeCsvField(accName),
      sanitizeCsvField(t.description),
      sanitizeCsvField(t.notes || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
