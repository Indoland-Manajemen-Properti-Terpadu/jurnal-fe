import { sumMinor, toMinor } from '@/lib/money/money';
import type { PettyCashVoucherRecord } from '@/module/petty-cash/domain/pettyCashEntities';

/** What the user types on the voucher form. Money is whole rupiah until the product decides on cents. */
export interface VoucherLineDraft {
  key: string;
  expenseAccountId: string | null;
  description: string;
  amount: number | '';
  taxId: string | null;
}

export interface VoucherDraft {
  date: string;
  beneficiary: string;
  receiptNumber: string;
  description: string;
  taxInvoiceNumber: string;
  vendorTaxId: string;
  lines: VoucherLineDraft[];
}

/** The body the backend accepts for create and for update (update replaces the whole voucher). */
export interface VoucherInput {
  date: string;
  beneficiary: string;
  receiptNumber?: string;
  description?: string;
  taxInvoiceNumber?: string;
  vendorTaxId?: string;
  lines: Array<{ expenseAccountId: string; description?: string; amount: number; taxId?: string }>;
}

export type VoucherDraftIssueCode =
  | 'REQUIRED'
  | 'FUTURE_DATE'
  | 'NO_LINES'
  | 'POSITIVE_AMOUNT'
  | 'WHOLE_RUPIAH'
  | 'TOO_LARGE'
  | 'TAX_NEEDS_INVOICE';

export interface VoucherDraftIssue {
  path: string;
  code: VoucherDraftIssueCode;
}

/** Largest amount a line accepts; far above any petty cash voucher and safely inside integer math. */
export const MAX_AMOUNT = 999_999_999_999;

export const newLineKey = () => crypto.randomUUID();

export const emptyLine = (key: string = newLineKey()): VoucherLineDraft => ({
  key,
  expenseAccountId: null,
  description: '',
  amount: '',
  taxId: null,
});

export const emptyDraft = (today: string): VoucherDraft => ({
  date: today,
  beneficiary: '',
  receiptNumber: '',
  description: '',
  taxInvoiceNumber: '',
  vendorTaxId: '',
  lines: [emptyLine()],
});

const filled = (value: string) => value.trim() !== '';

export const validateVoucherDraft = (draft: VoucherDraft, today: string): VoucherDraftIssue[] => {
  const issues: VoucherDraftIssue[] = [];
  if (!filled(draft.date)) issues.push({ path: 'date', code: 'REQUIRED' });
  else if (draft.date > today) issues.push({ path: 'date', code: 'FUTURE_DATE' });
  if (!filled(draft.beneficiary)) issues.push({ path: 'beneficiary', code: 'REQUIRED' });
  if (draft.lines.length === 0) issues.push({ path: 'lines', code: 'NO_LINES' });

  draft.lines.forEach((line, index) => {
    const at = `lines.${index}`;
    if (!line.expenseAccountId) issues.push({ path: `${at}.expenseAccountId`, code: 'REQUIRED' });
    if (line.amount === '') {
      issues.push({ path: `${at}.amount`, code: 'REQUIRED' });
    } else if (line.amount <= 0) {
      issues.push({ path: `${at}.amount`, code: 'POSITIVE_AMOUNT' });
    } else if (line.amount > MAX_AMOUNT) {
      issues.push({ path: `${at}.amount`, code: 'TOO_LARGE' });
    } else if (!Number.isInteger(line.amount)) {
      issues.push({ path: `${at}.amount`, code: 'WHOLE_RUPIAH' });
    }
    if (line.taxId && !filled(draft.taxInvoiceNumber)) {
      issues.push({ path: `${at}.taxId`, code: 'TAX_NEEDS_INVOICE' });
    }
  });
  return issues;
};

/** Minor units of an amount, or null when it cannot be represented (too many decimals or too large). */
const minorOrNull = (amount: number): number | null => {
  try {
    return toMinor(amount);
  } catch {
    return null;
  }
};

/**
 * Sum of the net line amounts (tax is added by the server on top of them). It runs on every render,
 * so an amount that cannot be represented is skipped here and flagged by `validateVoucherDraft`
 * instead of crashing the form.
 */
export const draftNet = (draft: VoucherDraft): number =>
  sumMinor(
    draft.lines.map((line) =>
      typeof line.amount === 'number' ? (minorOrNull(line.amount) ?? 0) : 0
    )
  ) / 100;

/**
 * Only filled optional fields are sent: the backend replaces the whole voucher on update and
 * clears what is omitted, and it rejects `null` for text fields.
 */
export const toVoucherInput = (draft: VoucherDraft): VoucherInput => {
  const invoice = draft.taxInvoiceNumber.trim();
  const input: VoucherInput = {
    date: draft.date,
    beneficiary: draft.beneficiary.trim(),
    lines: draft.lines.map((line) => {
      const out: VoucherInput['lines'][number] = {
        expenseAccountId: line.expenseAccountId as string,
        amount: line.amount as number,
      };
      if (filled(line.description)) out.description = line.description.trim();
      if (line.taxId && invoice) out.taxId = line.taxId;
      return out;
    }),
  };
  if (filled(draft.receiptNumber)) input.receiptNumber = draft.receiptNumber.trim();
  if (filled(draft.description)) input.description = draft.description.trim();
  if (invoice) input.taxInvoiceNumber = invoice;
  if (filled(draft.vendorTaxId)) input.vendorTaxId = draft.vendorTaxId.trim();
  return input;
};

export const draftFromVoucher = (
  voucher: PettyCashVoucherRecord,
  makeKey: () => string = newLineKey
): VoucherDraft => ({
  date: voucher.transactionDate,
  beneficiary: voucher.beneficiary,
  receiptNumber: voucher.receiptNumber ?? '',
  description: voucher.description ?? '',
  taxInvoiceNumber: voucher.taxInvoiceNumber ?? '',
  vendorTaxId: voucher.vendorTaxId ?? '',
  lines: voucher.lines.map((line) => ({
    key: makeKey(),
    expenseAccountId: line.expenseAccountId,
    description: line.description ?? '',
    amount: line.amount,
    taxId: line.tax?.id ?? null,
  })),
});

/** Poka-yoke check against the cash on hand; the server still has the last word. */
export const cashCheck = (net: number, availableCash: number) => {
  const netMinor = minorOrNull(net);
  const cashMinor = minorOrNull(availableCash);
  if (netMinor === null || cashMinor === null) {
    return { exceeds: net > availableCash, remaining: availableCash - net };
  }
  return { exceeds: netMinor > cashMinor, remaining: (cashMinor - netMinor) / 100 };
};

export type ApprovalHint = 'REQUIRED' | 'POSSIBLE' | 'NONE';

/**
 * The backend sends a voucher to approval when its TOTAL (net plus tax) reaches the fund threshold.
 * The tax is only known after saving, so with a tax code on a line a net below the threshold can
 * still cross it.
 */
export const approvalHint = (net: number, threshold: number, hasTax: boolean): ApprovalHint => {
  if (net >= threshold) return 'REQUIRED';
  return hasTax && net > 0 ? 'POSSIBLE' : 'NONE';
};

/** The backend asks for a receipt from the fund's threshold upward. */
export const attachmentRequired = (net: number, threshold: number) => net >= threshold;

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export type AttachmentIssueCode = 'TYPE' | 'SIZE' | 'COUNT';

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export const validateAttachmentFiles = (
  files: FileInfo[],
  alreadyAttached: number
): Array<{ name: string; code: AttachmentIssueCode }> => {
  const issues: Array<{ name: string; code: AttachmentIssueCode }> = [];
  files.forEach((file) => {
    if (!ATTACHMENT_TYPES.includes(file.type)) issues.push({ name: file.name, code: 'TYPE' });
    else if (file.size > MAX_ATTACHMENT_BYTES) issues.push({ name: file.name, code: 'SIZE' });
  });
  if (alreadyAttached + files.length > MAX_ATTACHMENTS) issues.push({ name: '', code: 'COUNT' });
  return issues;
};
