import { sumMinor, toMinor } from '@/lib/money/money';
import { MAX_AMOUNT } from '@/module/petty-cash/domain/voucherForm';

/** Employee advance (uang muka karyawan, colloquially kasbon): request, then later its settlement. */
export interface AdvanceRequestDraft {
  amount: number | '';
  purpose: string;
}

export type AdvanceIssueCode =
  | 'REQUIRED'
  | 'POSITIVE_AMOUNT'
  | 'WHOLE_RUPIAH'
  | 'TOO_LARGE'
  | 'OVER_LIMIT';

export interface AdvanceIssue {
  path: string;
  code: AdvanceIssueCode;
}

/** `maxAmount` is the per-request limit of the fund; null or 0 means there is none. */
export const validateAdvanceRequest = (
  draft: AdvanceRequestDraft,
  options: { maxAmount: number | null }
): AdvanceIssue[] => {
  const issues: AdvanceIssue[] = [];
  const { amount } = draft;
  if (amount === '') {
    issues.push({ path: 'amount', code: 'REQUIRED' });
  } else if (amount <= 0) {
    issues.push({ path: 'amount', code: 'POSITIVE_AMOUNT' });
  } else if (amount > MAX_AMOUNT) {
    issues.push({ path: 'amount', code: 'TOO_LARGE' });
  } else if (!Number.isInteger(amount)) {
    issues.push({ path: 'amount', code: 'WHOLE_RUPIAH' });
  } else if (options.maxAmount && amount > options.maxAmount) {
    issues.push({ path: 'amount', code: 'OVER_LIMIT' });
  }
  if (draft.purpose.trim() === '') issues.push({ path: 'purpose', code: 'REQUIRED' });
  return issues;
};

export const toAdvanceRequestInput = (fundId: string, draft: AdvanceRequestDraft) => ({
  fundId,
  amount: draft.amount as number,
  purpose: draft.purpose.trim(),
});

export interface SettlementLineDraft {
  key: string;
  description: string;
  amount: number | '';
  expenseAccountId: string | null;
}

export interface SettlementDraft {
  date: string;
  beneficiary: string;
  description: string;
  receiptNumber: string;
  lines: SettlementLineDraft[];
}

export interface SettlementInput {
  date: string;
  beneficiary: string;
  description?: string;
  receiptNumber?: string;
  lines: Array<{ description: string; amount: number; expenseAccountId?: string }>;
}

export type SettlementIssueCode =
  | 'REQUIRED'
  | 'FUTURE_DATE'
  | 'POSITIVE_AMOUNT'
  | 'WHOLE_RUPIAH'
  | 'TOO_LARGE';

export interface SettlementIssue {
  path: string;
  code: SettlementIssueCode;
}

export const newSettlementLineKey = () => crypto.randomUUID();

export const emptySettlementLine = (key: string = newSettlementLineKey()): SettlementLineDraft => ({
  key,
  description: '',
  amount: '',
  expenseAccountId: null,
});

export const emptySettlementDraft = (today: string): SettlementDraft => ({
  date: today,
  beneficiary: '',
  description: '',
  receiptNumber: '',
  lines: [emptySettlementLine()],
});

/** No lines at all is valid: nothing was spent and the whole advance is returned. */
export const validateSettlementDraft = (
  draft: SettlementDraft,
  today: string
): SettlementIssue[] => {
  const issues: SettlementIssue[] = [];
  if (draft.date.trim() === '') issues.push({ path: 'date', code: 'REQUIRED' });
  else if (draft.date > today) issues.push({ path: 'date', code: 'FUTURE_DATE' });
  if (draft.lines.length > 0 && draft.beneficiary.trim() === '') {
    issues.push({ path: 'beneficiary', code: 'REQUIRED' });
  }
  draft.lines.forEach((line, index) => {
    const at = `lines.${index}`;
    if (line.description.trim() === '') {
      issues.push({ path: `${at}.description`, code: 'REQUIRED' });
    }
    if (line.amount === '') {
      issues.push({ path: `${at}.amount`, code: 'REQUIRED' });
    } else if (line.amount <= 0) {
      issues.push({ path: `${at}.amount`, code: 'POSITIVE_AMOUNT' });
    } else if (line.amount > MAX_AMOUNT) {
      issues.push({ path: `${at}.amount`, code: 'TOO_LARGE' });
    } else if (!Number.isInteger(line.amount)) {
      issues.push({ path: `${at}.amount`, code: 'WHOLE_RUPIAH' });
    }
  });
  return issues;
};

const minorOrZero = (amount: number | ''): number => {
  if (amount === '') return 0;
  try {
    return toMinor(amount);
  } catch {
    return 0;
  }
};

/** What was spent, from the lines typed so far; an amount that cannot be represented counts as nothing. */
export const settlementTotal = (draft: SettlementDraft): number =>
  sumMinor(draft.lines.map((line) => minorOrZero(line.amount))) / 100;

/** What goes back to the box (or is still owed to the employee) once the spending is accounted for. */
export const settlementBalance = (
  advanceAmount: number,
  spent: number
): { kind: 'RETURN' | 'EXTRA' | 'EVEN'; amount: number } => {
  const difference = (toMinor(advanceAmount) - toMinor(spent)) / 100;
  if (difference > 0) return { kind: 'RETURN', amount: difference };
  if (difference < 0) return { kind: 'EXTRA', amount: -difference };
  return { kind: 'EVEN', amount: 0 };
};

export const toSettlementInput = (draft: SettlementDraft): SettlementInput => {
  const input: SettlementInput = {
    date: draft.date,
    beneficiary: draft.beneficiary.trim(),
    lines: draft.lines.map((line) => {
      const out: SettlementInput['lines'][number] = {
        description: line.description.trim(),
        amount: line.amount as number,
      };
      if (line.expenseAccountId) out.expenseAccountId = line.expenseAccountId;
      return out;
    }),
  };
  if (draft.description.trim()) input.description = draft.description.trim();
  if (draft.receiptNumber.trim()) input.receiptNumber = draft.receiptNumber.trim();
  return input;
};
