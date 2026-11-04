import type { BankStatementPreviewItem } from './importPreview';

/** Error codes of an import row. The screen translates each one (`importDraft.errors.<code>`). */
export type ImportErrorCode =
  | 'description'
  | 'date'
  | 'bothSides'
  | 'noSide'
  | 'receivedNumber'
  | 'spentNumber'
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

const toAmount = (value: string | undefined): number | null => {
  const text = (value ?? '').trim();
  if (text === '') return 0;
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
  if (received === null) errors.push({ code: 'receivedNumber' });
  if (spent === null) errors.push({ code: 'spentNumber' });
  if (received !== null && spent !== null) {
    if (received > 0 && spent > 0) errors.push({ code: 'bothSides' });
    if (received === 0 && spent === 0) errors.push({ code: 'noSide' });
  }
  return errors;
};

/** The server answers in English; this maps its known messages to the codes above. */
export const parseServerImportError = (message: string): ImportRowError | null => {
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
