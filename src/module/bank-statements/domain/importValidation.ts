import type { BankStatementPreviewItem } from './importPreview';

/** Error codes of an import row. The screen translates each one (`importDraft.errors.<code>`). */
export type ImportErrorCode =
  | 'description'
  | 'date'
  | 'bothSides'
  | 'noSide'
  | 'receivedNumber'
  | 'spentNumber'
  | 'negativeAmount'
  | 'unexpectedColumn';

export interface ImportRowError {
  code: ImportErrorCode;
  /** Only `unexpectedColumn` carries a value: the column names the file should not have. */
  detail?: string;
}

const MAX_DESCRIPTION_LENGTH = 1000;
const DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

/** `dd/mm/yyyy`, as the template asks, and only a date that exists (31/02 is not). */
export const isValidImportDate = (value: string): boolean => {
  const match = DATE_PATTERN.exec(value.trim());
  if (!match) return false;
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const NEGATIVE_AMOUNT = /^-\d+(\.\d+)?$/;

/** `null` is text that is not a number; `'negative'` is a number below zero. */
const toAmount = (value: string | undefined): number | 'negative' | null => {
  const text = (value ?? '').trim();
  if (text === '') return 0;
  if (NEGATIVE_AMOUNT.test(text)) return 'negative';
  return /^\d+(\.\d+)?$/.test(text) ? Number(text) : null;
};

/**
 * The rules the preview applies on the server, checked again after the user edits a row, so an
 * edited row is never marked valid just because it was edited.
 */
export const validateImportRow = (
  row: Pick<BankStatementPreviewItem, 'Description' | 'TransactionDate' | 'Received' | 'Spent'>
): ImportRowError[] => {
  const errors: ImportRowError[] = [];
  const description = (row.Description ?? '').trim();
  if (description === '' || description.length >= MAX_DESCRIPTION_LENGTH) {
    errors.push({ code: 'description' });
  }
  if (!isValidImportDate(row.TransactionDate ?? '')) errors.push({ code: 'date' });

  const received = toAmount(row.Received);
  const spent = toAmount(row.Spent);
  if (received === 'negative' || spent === 'negative') errors.push({ code: 'negativeAmount' });
  if (received === null) errors.push({ code: 'receivedNumber' });
  if (spent === null) errors.push({ code: 'spentNumber' });
  if (typeof received === 'number' && typeof spent === 'number') {
    if (received > 0 && spent > 0) errors.push({ code: 'bothSides' });
    if (received === 0 && spent === 0) errors.push({ code: 'noSide' });
  }
  return errors;
};

/** A message the app wrote itself, kept in the same list as the server's messages. */
const CLIENT_PREFIX = 'client:';

/**
 * The server's preview passes rows the template forbids (an ISO date, an empty description) and
 * blames a negative amount on the thousand separator. Every preview row is checked again here;
 * the app's findings replace the server's known messages, and unknown ones are kept.
 */
export const recheckPreviewRow = (row: BankStatementPreviewItem): BankStatementPreviewItem => {
  const found = validateImportRow(row);
  if (found.length === 0) return row;
  const kept = row.errors.filter((message) => {
    const known = parseServerImportError(message);
    return known === null || known.code === 'unexpectedColumn';
  });
  return {
    ...row,
    isValid: false,
    errors: [...kept, ...found.map(({ code }) => `${CLIENT_PREFIX}${code}`)],
  };
};

/** The server answers in English; this maps its known messages to the codes above. */
export const parseServerImportError = (message: string): ImportRowError | null => {
  if (message.startsWith(CLIENT_PREFIX)) {
    return { code: message.slice(CLIENT_PREFIX.length) as ImportErrorCode };
  }
  if (message.startsWith('Description')) return { code: 'description' };
  if (message.startsWith('TransactionDate')) return { code: 'date' };
  if (message.startsWith('Only one of Received or Spent')) return { code: 'bothSides' };
  if (message.startsWith('Either Received or Spent')) return { code: 'noSide' };
  if (message.startsWith('Received is required')) return { code: 'receivedNumber' };
  if (message.startsWith('Spent is required')) return { code: 'spentNumber' };
  const unexpected = /^Unexpected field\(s\):\s*(.+)$/.exec(message);
  if (unexpected) return { code: 'unexpectedColumn', detail: unexpected[1].trim() };
  return null;
};
