import type { BankStatementPreviewItem, PreviewSummary } from './importPreview';

/** The upload accepts csv, xls and xlsx files of at most 30 MB. */
export const MAX_IMPORT_FILE_BYTES = 30 * 1024 ** 2;

export const summarizePreview = (rows: BankStatementPreviewItem[]): PreviewSummary => {
  const correctData = rows.filter((item) => item.isValid);
  const wrongData = rows.filter((item) => !item.isValid);
  return {
    totalData: rows,
    correctData,
    wrongData,
    sumTotalData: rows.length,
    totalCorrectData: correctData.length,
    totalWrongData: wrongData.length,
  };
};

export type ConfirmImportPayload = {
  accountId: string | undefined;
  statements: { TransactionDate: string; Received: string; Spent: string; Description: string }[];
};

/** The draft sends every row, valid or not: the server decides. */
export const buildConfirmPayload = (
  accountId: string | undefined,
  rows: BankStatementPreviewItem[]
): ConfirmImportPayload => ({
  accountId,
  statements: rows.map(({ TransactionDate, Received, Spent, Description }) => ({
    TransactionDate,
    Received: String(Received || '0'),
    Spent: String(Spent || '0'),
    Description: Description || '',
  })),
});

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

const isFilled = (value: string | undefined) => Boolean(value && value !== '0' && value !== '');

/** One row holds one side only: filling Received disables Spent and the other way round. */
export const filledSides = (row: Pick<BankStatementPreviewItem, 'Received' | 'Spent'> | null) => ({
  hasReceived: isFilled(row?.Received),
  hasSpent: isFilled(row?.Spent),
});
