import { sumMinor, toMinor } from '@/lib/money/money';
import type { CountRecord } from '@/module/petty-cash/domain/pettyCashEntities';

export interface ReplenishmentDraft {
  voucherIds: string[];
  bankAccountId: string | null;
  countId: string | null;
  notes: string;
}

export interface ReplenishmentInput {
  fundId: string;
  voucherIds: string[];
  bankAccountId: string;
  countId?: string;
  notes?: string;
}

export type ReplenishmentIssueCode = 'NO_VOUCHERS' | 'REQUIRED' | 'COUNT_REQUIRED';

export interface ReplenishmentIssue {
  path: string;
  code: ReplenishmentIssueCode;
}

export const validateReplenishmentDraft = (
  draft: ReplenishmentDraft,
  options: { countRequired: boolean }
): ReplenishmentIssue[] => {
  const issues: ReplenishmentIssue[] = [];
  if (draft.voucherIds.length === 0) issues.push({ path: 'voucherIds', code: 'NO_VOUCHERS' });
  if (!draft.bankAccountId) issues.push({ path: 'bankAccountId', code: 'REQUIRED' });
  if (options.countRequired && !draft.countId) {
    issues.push({ path: 'countId', code: 'COUNT_REQUIRED' });
  }
  return issues;
};

export const toReplenishmentInput = (
  fundId: string,
  draft: ReplenishmentDraft
): ReplenishmentInput => {
  const input: ReplenishmentInput = {
    fundId,
    voucherIds: draft.voucherIds,
    bankAccountId: draft.bankAccountId as string,
  };
  if (draft.countId) input.countId = draft.countId;
  if (draft.notes.trim()) input.notes = draft.notes.trim();
  return input;
};

export type ReplenishmentPreviewInput = Omit<ReplenishmentInput, 'notes'>;

/**
 * The preview accepts the fund, vouchers, bank account and count only; the backend refuses `notes`
 * (400). Leaving them out also means typing a note does not ask for a new preview.
 */
export const toPreviewInput = (input: ReplenishmentInput): ReplenishmentPreviewInput => {
  const { notes: _notes, ...rest } = input;
  return rest;
};

/**
 * The lists a wizard shows can change while it is open (a voucher voided, a newer count approved),
 * so only ids still on offer count; a stale id would fail the request without being seen.
 */
export const reconcileDraft = (
  draft: ReplenishmentDraft,
  offered: { voucherIds: string[]; countIds: string[] }
): ReplenishmentDraft => ({
  ...draft,
  voucherIds: draft.voucherIds.filter((id) => offered.voucherIds.includes(id)),
  countId: draft.countId && offered.countIds.includes(draft.countId) ? draft.countId : null,
});

export const toggleVoucher = (selected: string[], id: string): string[] =>
  selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];

/** Selects every voucher, or clears the selection when all of them are already selected. */
export const toggleAll = (allIds: string[], selected: string[]): string[] =>
  allIds.every((id) => selected.includes(id)) ? [] : allIds;

/** Sum of the voucher totals the backend reported, for the list; the payout comes from the preview. */
export const selectedTotal = (
  vouchers: Array<{ id: string; totalAmount: number }>,
  selected: string[]
): number =>
  sumMinor(
    vouchers
      .filter((voucher) => selected.includes(voucher.id))
      .map((voucher) => toMinor(voucher.totalAmount))
  ) / 100;

/** The count a replenishment would settle: the newest one that is approved and not yet settled. */
export const latestApprovedCount = (counts: CountRecord[]): CountRecord | null =>
  counts
    .filter((count) => count.status === 'APPROVED')
    .sort((a, b) => b.countedAt.localeCompare(a.countedAt))[0] ?? null;

export const isDisbursementDateValid = (date: string, today: string): boolean =>
  date.trim() !== '' && date <= today;
