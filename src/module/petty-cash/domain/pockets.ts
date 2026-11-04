import { sumMinor, toMinor } from '@/lib/money/money';
import type { FundPocket } from '@/module/petty-cash/domain/pettyCashEntities';
import { MAX_AMOUNT } from '@/module/petty-cash/domain/voucherForm';

/** Balance pockets of a fund: opening them with the fund, adding them later, moving cash between them. */

export type NumberField = number | '';

/** The cash box that every fund has; it is never added or deactivated. */
export const CASH_POCKET_CODE = 'TUNAI';

/** Types a user may add; the cash box type is built in. */
export type AddablePocketType = 'BANK' | 'EWALLET';

const CODE_PATTERN = /^[A-Z0-9_-]{2,20}$/;

export type PocketIssueCode =
  | 'REQUIRED'
  | 'INVALID_CODE'
  | 'DUPLICATE_CODE'
  | 'NEGATIVE'
  | 'WHOLE_NUMBER'
  | 'TOO_LARGE'
  | 'POSITIVE_AMOUNT'
  | 'OVER_PAGU'
  | 'SAME_POCKET'
  | 'OVER_BALANCE'
  | 'FUTURE_DATE';

export interface PocketIssue {
  path: string;
  code: PocketIssueCode;
}

export interface PocketDraft {
  code: string;
  type: AddablePocketType;
  name: string;
  provider: string;
  accountNumber: string;
  accountHolder: string;
  /** Share of the ceiling that starts in this pocket (opening a fund only). */
  amount: NumberField;
}

export const emptyPocketDraft = (): PocketDraft => ({
  code: '',
  type: 'BANK',
  name: '',
  provider: '',
  accountNumber: '',
  accountHolder: '',
  amount: '',
});

/** Pocket a transaction uses unless the user picks another: the cash box, else the first active one. */
export const defaultPocketCode = (pockets: FundPocket[]): string =>
  pockets.find((pocket) => pocket.code === CASH_POCKET_CODE && pocket.isActive)?.code ??
  pockets.find((pocket) => pocket.isActive)?.code ??
  CASH_POCKET_CODE;

/** Balance of one pocket, or null when the fund does not list it. */
export const pocketBalanceOf = (pockets: FundPocket[], code: string): number | null =>
  pockets.find((pocket) => pocket.code === code)?.balance ?? null;

/**
 * Name of a pocket for a detail screen, or null when there is nothing to tell: no pocket on the
 * document, or a fund with a single pocket where every transaction uses the cash box.
 */
export const pocketLabel = (pockets: FundPocket[], code: string | null): string | null => {
  if (!code || pockets.length < 2) return null;
  return pockets.find((pocket) => pocket.code === code)?.name ?? code;
};

/** Codes are stored in capitals, so they are compared and sent that way. */
export const normalizePocketCode = (code: string) => code.trim().toUpperCase();

const amountIssues = (path: string, value: NumberField, allowZero: boolean): PocketIssue[] => {
  if (value === '') return allowZero ? [] : [{ path, code: 'REQUIRED' }];
  if (value < 0) return [{ path, code: 'NEGATIVE' }];
  if (!allowZero && value === 0) return [{ path, code: 'POSITIVE_AMOUNT' }];
  if (!Number.isInteger(value)) return [{ path, code: 'WHOLE_NUMBER' }];
  if (value > MAX_AMOUNT) return [{ path, code: 'TOO_LARGE' }];
  return [];
};

const codeIssues = (path: string, code: string, taken: string[]): PocketIssue[] => {
  const normalized = normalizePocketCode(code);
  if (normalized === '') return [{ path, code: 'REQUIRED' }];
  if (!CODE_PATTERN.test(normalized)) return [{ path, code: 'INVALID_CODE' }];
  if (normalized === CASH_POCKET_CODE || taken.includes(normalized)) {
    return [{ path, code: 'DUPLICATE_CODE' }];
  }
  return [];
};

/** What is left of the ceiling for the cash box once the other pockets have their share. */
export const cashRemainder = (pagu: NumberField, pockets: PocketDraft[]): number =>
  (toMinor(pagu === '' ? 0 : pagu) -
    sumMinor(pockets.map((pocket) => toMinor(pocket.amount === '' ? 0 : pocket.amount)))) /
  100;

/** Pockets of a new fund: valid codes, no duplicates, and shares that do not exceed the ceiling. */
export const validateNewPockets = (pockets: PocketDraft[], pagu: NumberField): PocketIssue[] => {
  const issues: PocketIssue[] = [];
  pockets.forEach((pocket, index) => {
    const earlier = pockets.slice(0, index).map((item) => normalizePocketCode(item.code));
    issues.push(...codeIssues(`pockets.${index}.code`, pocket.code, earlier));
    if (pocket.name.trim() === '') issues.push({ path: `pockets.${index}.name`, code: 'REQUIRED' });
    issues.push(...amountIssues(`pockets.${index}.amount`, pocket.amount, true));
  });
  if (issues.length === 0 && cashRemainder(pagu, pockets) < 0) {
    issues.push({ path: 'pockets', code: 'OVER_PAGU' });
  }
  return issues;
};

const optionalText = (value: string) => {
  const text = value.trim();
  return text === '' ? {} : { value: text };
};

const pocketBody = (pocket: PocketDraft) => ({
  code: normalizePocketCode(pocket.code),
  name: pocket.name.trim(),
  type: pocket.type,
  ...(optionalText(pocket.provider).value ? { provider: pocket.provider.trim() } : {}),
  ...(optionalText(pocket.accountNumber).value
    ? { accountNumber: pocket.accountNumber.trim() }
    : {}),
  ...(optionalText(pocket.accountHolder).value
    ? { accountHolder: pocket.accountHolder.trim() }
    : {}),
});

/**
 * Pockets and the split of the ceiling for a new fund. Without any share given the backend puts
 * everything in the cash box, so the split is sent only when some pocket gets money.
 */
export interface CreatePocketsInput {
  pockets?: ReturnType<typeof pocketBody>[];
  fundingAllocation?: Array<{ pocket: string; amount: number }>;
}

export const toCreatePocketsInput = (pockets: PocketDraft[], pagu: number): CreatePocketsInput => {
  if (pockets.length === 0) return {};
  const shares = pockets.filter((pocket) => typeof pocket.amount === 'number' && pocket.amount > 0);
  return {
    pockets: pockets.map(pocketBody),
    ...(shares.length > 0
      ? {
          fundingAllocation: [
            { pocket: CASH_POCKET_CODE, amount: cashRemainder(pagu, pockets) },
            ...shares.map((pocket) => ({
              pocket: normalizePocketCode(pocket.code),
              amount: pocket.amount as number,
            })),
          ].filter((share) => share.amount > 0),
        }
      : {}),
  };
};

/** A pocket added to an existing fund starts at zero; money arrives by transfer or replenishment. */
export const validateAddPocket = (draft: PocketDraft, existing: FundPocket[]): PocketIssue[] => [
  ...codeIssues(
    'code',
    draft.code,
    existing.map((pocket) => pocket.code)
  ),
  ...(draft.name.trim() === '' ? [{ path: 'name', code: 'REQUIRED' as const }] : []),
];

export const toAddPocketInput = (draft: PocketDraft) => pocketBody(draft);

export interface PocketEditDraft {
  name: string;
  provider: string;
  accountNumber: string;
  accountHolder: string;
  isActive: boolean;
  reason: string;
}

export const editDraftFromPocket = (pocket: FundPocket): PocketEditDraft => ({
  name: pocket.name,
  provider: pocket.provider ?? '',
  accountNumber: pocket.accountNumber ?? '',
  accountHolder: pocket.accountHolder ?? '',
  isActive: pocket.isActive,
  reason: '',
});

/** A pocket can be switched off only while it holds nothing; the cash box is always on. */
export const canDeactivatePocket = (pocket: FundPocket) =>
  pocket.type !== 'CASH' && pocket.balance === 0;

export const validatePocketEdit = (pocket: FundPocket, draft: PocketEditDraft): PocketIssue[] => {
  const issues: PocketIssue[] = [];
  if (draft.name.trim() === '') issues.push({ path: 'name', code: 'REQUIRED' });
  if (!draft.isActive && pocket.isActive && !canDeactivatePocket(pocket)) {
    issues.push({ path: 'isActive', code: 'OVER_BALANCE' });
  }
  return issues;
};

/** Only what changed is sent; the reason travels with a change. */
export const toPocketPatch = (pocket: FundPocket, draft: PocketEditDraft) => {
  const patch: Record<string, unknown> = {};
  const text = (field: 'provider' | 'accountNumber' | 'accountHolder') => {
    if (draft[field].trim() !== (pocket[field] ?? '')) patch[field] = draft[field].trim();
  };
  if (draft.name.trim() !== pocket.name) patch.name = draft.name.trim();
  text('provider');
  text('accountNumber');
  text('accountHolder');
  if (draft.isActive !== pocket.isActive) patch.isActive = draft.isActive;
  if (Object.keys(patch).length > 0 && draft.reason.trim()) patch.reason = draft.reason.trim();
  return patch;
};

export interface PocketTransferDraft {
  fromPocket: string | null;
  toPocket: string | null;
  amount: NumberField;
  date: string;
  memo: string;
}

export const emptyTransfer = (today: string): PocketTransferDraft => ({
  fromPocket: null,
  toPocket: null,
  amount: '',
  date: today,
  memo: '',
});

export const validateTransfer = (
  draft: PocketTransferDraft,
  pockets: FundPocket[],
  today: string
): PocketIssue[] => {
  const issues: PocketIssue[] = [];
  if (!draft.fromPocket) issues.push({ path: 'fromPocket', code: 'REQUIRED' });
  if (!draft.toPocket) issues.push({ path: 'toPocket', code: 'REQUIRED' });
  if (draft.fromPocket && draft.fromPocket === draft.toPocket) {
    issues.push({ path: 'toPocket', code: 'SAME_POCKET' });
  }
  const amount = amountIssues('amount', draft.amount, false);
  issues.push(...amount);
  const source = pockets.find((pocket) => pocket.code === draft.fromPocket);
  if (amount.length === 0 && source && (draft.amount as number) > source.balance) {
    issues.push({ path: 'amount', code: 'OVER_BALANCE' });
  }
  if (draft.date === '') issues.push({ path: 'date', code: 'REQUIRED' });
  else if (draft.date > today) issues.push({ path: 'date', code: 'FUTURE_DATE' });
  return issues;
};

export const toTransferInput = (draft: PocketTransferDraft) => ({
  fromPocket: draft.fromPocket as string,
  toPocket: draft.toPocket as string,
  amount: draft.amount as number,
  date: draft.date,
  ...(draft.memo.trim() ? { memo: draft.memo.trim() } : {}),
});
