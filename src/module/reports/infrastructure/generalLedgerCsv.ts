import type { GeneralLedgerAccount } from '@/module/reports/domain/generalLedger.types';

export interface GeneralLedgerCsvLabels {
  columns: [string, string, string, string, string, string, string, string, string, string];
  opening: string;
  closing: string;
}

const safeCell = (value: string, text = true): string => {
  const safe = text && /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/** One CSV line for every journal line, plus the opening and closing lines of each account. */
export function generalLedgerCsv(
  accounts: GeneralLedgerAccount[],
  precision: number,
  labels: GeneralLedgerCsvLabels
): string {
  const amount = (value: number) => (Object.is(value, -0) ? 0 : value).toFixed(precision);
  const rows: string[][] = [labels.columns];
  accounts.forEach((account) => {
    const identity = [account.category, account.number, account.name];
    rows.push([...identity, '', '', labels.opening, '', '', '', amount(account.openingBalance)]);
    account.transactions.forEach((row) => {
      rows.push([
        ...identity,
        row.transactionDate.slice(0, 10),
        row.transactionNumber.startsWith('#') ? row.transactionNumber : `#${row.transactionNumber}`,
        row.referenceNumber &&
        !row.description.toLowerCase().includes(row.referenceNumber.toLowerCase())
          ? `${row.description} ${row.referenceNumber}`
          : row.description,
        row.notes,
        amount(row.debit),
        amount(row.credit),
        amount(row.balance),
      ]);
    });
    rows.push([
      ...identity,
      '',
      '',
      labels.closing,
      '',
      amount(account.periodDebit),
      amount(account.periodCredit),
      amount(account.closingBalance),
    ]);
  });
  return `\uFEFF${rows.map((row) => row.map((cell, index) => safeCell(cell, index < 7)).join(',')).join('\r\n')}\r\n`;
}
