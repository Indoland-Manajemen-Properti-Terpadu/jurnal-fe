import { buildConfirmPayload, filledSides, formatBytes, summarizePreview } from './importDraft';
import type { BankStatementPreviewItem } from './importPreview';

const row = (over: Partial<BankStatementPreviewItem> = {}): BankStatementPreviewItem => ({
  rowIndex: 1,
  TransactionDate: '01/02/2026',
  Received: '100.50',
  Spent: '',
  Description: 'Setoran',
  date: null,
  received: null,
  spent: null,
  amount: null,
  description: '',
  isDateValid: true,
  isReceivedValid: true,
  isSpentValid: true,
  isDescriptionValid: true,
  isValid: true,
  errors: [],
  ...over,
});

describe('summarizePreview', () => {
  it('splits valid and invalid rows and counts them', () => {
    const rows = [row({ rowIndex: 1 }), row({ rowIndex: 2, isValid: false }), row({ rowIndex: 3 })];
    const summary = summarizePreview(rows);
    expect(summary.sumTotalData).toBe(3);
    expect(summary.totalCorrectData).toBe(2);
    expect(summary.totalWrongData).toBe(1);
    expect(summary.wrongData.map((r) => r.rowIndex)).toEqual([2]);
  });
});

describe('buildConfirmPayload', () => {
  it('sends every row, invalid ones included, with empty sides as "0"', () => {
    const rows = [row(), row({ rowIndex: 2, isValid: false, Received: '', Spent: '2500.75' })];
    const payload = buildConfirmPayload('acc-1', rows);
    expect(payload.accountId).toBe('acc-1');
    expect(payload.statements).toEqual([
      { TransactionDate: '01/02/2026', Received: '100.50', Spent: '0', Description: 'Setoran' },
      { TransactionDate: '01/02/2026', Received: '0', Spent: '2500.75', Description: 'Setoran' },
    ]);
  });

  it('turns a missing description into an empty string', () => {
    const payload = buildConfirmPayload('a', [
      row({ Description: undefined as unknown as string }),
    ]);
    expect(payload.statements[0].Description).toBe('');
  });
});

describe('formatBytes', () => {
  it('formats sizes', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(30 * 1024 ** 2)).toBe('30 MB');
  });
});

describe('filledSides', () => {
  it('treats empty and "0" as not filled', () => {
    expect(filledSides(row({ Received: '0', Spent: '' }))).toEqual({
      hasReceived: false,
      hasSpent: false,
    });
    expect(filledSides(row({ Received: '10', Spent: '' }))).toEqual({
      hasReceived: true,
      hasSpent: false,
    });
    expect(filledSides(null)).toEqual({ hasReceived: false, hasSpent: false });
  });
});
