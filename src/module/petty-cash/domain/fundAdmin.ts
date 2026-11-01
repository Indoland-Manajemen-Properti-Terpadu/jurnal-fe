import { MAX_AMOUNT } from '@/module/petty-cash/domain/voucherForm';
import type { FundSettings, PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import type { FundStatus } from '@/module/petty-cash/domain/pettyCashStatus';

/** Fund administration: opening a fund, changing its rules, moving its ceiling, closing it. */

export type NumberField = number | '';

export interface FundSettingsDraft {
  warningThresholdPct: NumberField;
  voucherApprovalThreshold: NumberField;
  attachmentRequiredThreshold: NumberField;
  advanceMaxAmount: NumberField;
  advanceApprovalThreshold: NumberField;
  advanceSettlementDays: NumberField;
  requireCountBeforeReimbursement: boolean;
  requireWitness: boolean;
  singleUserOverride: boolean;
  advanceExcludeSaturday: boolean;
  advanceExcludeSunday: boolean;
}

export const draftFromSettings = (settings: FundSettings): FundSettingsDraft => ({
  warningThresholdPct: settings.warningThresholdPct,
  voucherApprovalThreshold: settings.voucherApprovalThreshold,
  attachmentRequiredThreshold: settings.attachmentRequiredThreshold,
  advanceMaxAmount: settings.advanceMaxAmount,
  advanceApprovalThreshold: settings.advanceApprovalThreshold,
  advanceSettlementDays: settings.advanceSettlementDays,
  requireCountBeforeReimbursement: settings.requireCountBeforeReimbursement,
  requireWitness: settings.requireWitness,
  singleUserOverride: settings.singleUserOverride,
  advanceExcludeSaturday: settings.advanceExcludeSaturday,
  advanceExcludeSunday: settings.advanceExcludeSunday,
});

/** Defaults offered for a new fund; the owner can change every one of them. */
export const defaultSettingsDraft = (): FundSettingsDraft => ({
  warningThresholdPct: 20,
  voucherApprovalThreshold: 1_000_000,
  attachmentRequiredThreshold: 100_000,
  advanceMaxAmount: 2_000_000,
  advanceApprovalThreshold: 0,
  advanceSettlementDays: 7,
  requireCountBeforeReimbursement: false,
  requireWitness: false,
  singleUserOverride: false,
  advanceExcludeSaturday: false,
  advanceExcludeSunday: false,
});

export type FundIssueCode =
  | 'REQUIRED'
  | 'NEGATIVE'
  | 'POSITIVE_AMOUNT'
  | 'WHOLE_NUMBER'
  | 'TOO_LARGE'
  | 'OVER_100'
  | 'FUTURE_DATE'
  | 'SAME_AS_CURRENT';

export interface FundIssue {
  path: string;
  code: FundIssueCode;
}

const NUMBER_FIELDS = [
  'warningThresholdPct',
  'voucherApprovalThreshold',
  'attachmentRequiredThreshold',
  'advanceMaxAmount',
  'advanceApprovalThreshold',
  'advanceSettlementDays',
] as const;

export const validateFundSettings = (draft: FundSettingsDraft): FundIssue[] => {
  const issues: FundIssue[] = [];
  NUMBER_FIELDS.forEach((field) => {
    const value = draft[field];
    if (value === '') issues.push({ path: field, code: 'REQUIRED' });
    else if (value < 0) issues.push({ path: field, code: 'NEGATIVE' });
    else if (!Number.isInteger(value)) issues.push({ path: field, code: 'WHOLE_NUMBER' });
    else if (value > MAX_AMOUNT) issues.push({ path: field, code: 'TOO_LARGE' });
    else if (field === 'warningThresholdPct' && value > 100) {
      issues.push({ path: field, code: 'OVER_100' });
    }
  });
  return issues;
};

const positiveWhole = (path: string, value: NumberField): FundIssue[] => {
  if (value === '') return [{ path, code: 'REQUIRED' }];
  if (value <= 0) return [{ path, code: 'POSITIVE_AMOUNT' }];
  if (!Number.isInteger(value)) return [{ path, code: 'WHOLE_NUMBER' }];
  if (value > MAX_AMOUNT) return [{ path, code: 'TOO_LARGE' }];
  return [];
};

export interface NewFundDraft {
  code: string;
  name: string;
  accountId: string | null;
  custodianId: string | null;
  pagu: NumberField;
  /** When chosen, the ceiling is moved from this bank account on the funding date. */
  fundingBankAccountId: string | null;
  fundingDate: string;
  settings: FundSettingsDraft;
}

export const emptyNewFund = (today: string): NewFundDraft => ({
  code: '',
  name: '',
  accountId: null,
  custodianId: null,
  pagu: '',
  fundingBankAccountId: null,
  fundingDate: today,
  settings: defaultSettingsDraft(),
});

export const validateNewFund = (draft: NewFundDraft, today: string): FundIssue[] => {
  const issues: FundIssue[] = [];
  if (draft.code.trim() === '') issues.push({ path: 'code', code: 'REQUIRED' });
  if (draft.name.trim() === '') issues.push({ path: 'name', code: 'REQUIRED' });
  if (!draft.accountId) issues.push({ path: 'accountId', code: 'REQUIRED' });
  if (!draft.custodianId) issues.push({ path: 'custodianId', code: 'REQUIRED' });
  issues.push(...positiveWhole('pagu', draft.pagu));
  if (draft.fundingBankAccountId) {
    if (draft.fundingDate === '') issues.push({ path: 'fundingDate', code: 'REQUIRED' });
    else if (draft.fundingDate > today) issues.push({ path: 'fundingDate', code: 'FUTURE_DATE' });
  }
  return [...issues, ...validateFundSettings(draft.settings)];
};

const settingsPayload = (settings: FundSettingsDraft) => ({
  ...settings,
  warningThresholdPct: settings.warningThresholdPct as number,
  voucherApprovalThreshold: settings.voucherApprovalThreshold as number,
  attachmentRequiredThreshold: settings.attachmentRequiredThreshold as number,
  advanceMaxAmount: settings.advanceMaxAmount as number,
  advanceApprovalThreshold: settings.advanceApprovalThreshold as number,
  advanceSettlementDays: settings.advanceSettlementDays as number,
});

export const toCreateFundInput = (draft: NewFundDraft) => ({
  code: draft.code.trim(),
  name: draft.name.trim(),
  accountId: draft.accountId as string,
  custodianId: draft.custodianId as string,
  pagu: draft.pagu as number,
  ...(draft.fundingBankAccountId
    ? { fundingBankAccountId: draft.fundingBankAccountId, fundingDate: draft.fundingDate }
    : {}),
  ...settingsPayload(draft.settings),
});

export interface EditFundDraft {
  name: string;
  custodianId: string;
  status: Exclude<FundStatus, 'CLOSED'>;
  reason: string;
  settings: FundSettingsDraft;
}

export const editDraftFromFund = (fund: PettyCashFund): EditFundDraft => ({
  name: fund.name,
  custodianId: fund.custodian.id,
  status: fund.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
  reason: '',
  settings: draftFromSettings(fund.settings),
});

/** Only what changed is sent, so an untouched rule is never rewritten. */
export const toFundPatch = (fund: PettyCashFund, draft: EditFundDraft) => {
  const patch: Record<string, unknown> = {};
  if (draft.name.trim() !== fund.name) patch.name = draft.name.trim();
  if (draft.custodianId !== fund.custodian.id) patch.custodianId = draft.custodianId;
  if (draft.status !== fund.status) patch.status = draft.status;
  const before = draftFromSettings(fund.settings);
  (Object.keys(before) as Array<keyof FundSettingsDraft>).forEach((key) => {
    if (draft.settings[key] !== before[key]) patch[key] = draft.settings[key];
  });
  if (Object.keys(patch).length > 0 && draft.reason.trim()) patch.reason = draft.reason.trim();
  return patch;
};

export const validateFundEdit = (fund: PettyCashFund, draft: EditFundDraft): FundIssue[] => {
  const issues: FundIssue[] = [];
  if (draft.name.trim() === '') issues.push({ path: 'name', code: 'REQUIRED' });
  const changesStatusOrCustodian =
    draft.status !== fund.status || draft.custodianId !== fund.custodian.id;
  if (changesStatusOrCustodian && draft.reason.trim() === '') {
    issues.push({ path: 'reason', code: 'REQUIRED' });
  }
  return [...issues, ...validateFundSettings(draft.settings)];
};

export interface PaguAdjustmentDraft {
  newPagu: NumberField;
  bankAccountId: string | null;
  date: string;
  reason: string;
}

export const validatePaguAdjustment = (
  draft: PaguAdjustmentDraft,
  currentPagu: number,
  today: string
): FundIssue[] => {
  const issues = positiveWhole('newPagu', draft.newPagu);
  if (issues.length === 0 && draft.newPagu === currentPagu) {
    issues.push({ path: 'newPagu', code: 'SAME_AS_CURRENT' });
  }
  if (!draft.bankAccountId) issues.push({ path: 'bankAccountId', code: 'REQUIRED' });
  if (draft.date === '') issues.push({ path: 'date', code: 'REQUIRED' });
  else if (draft.date > today) issues.push({ path: 'date', code: 'FUTURE_DATE' });
  if (draft.reason.trim() === '') issues.push({ path: 'reason', code: 'REQUIRED' });
  return issues;
};

/** Which way the money moves: more ceiling comes from the bank, less goes back to it. */
export const paguDirection = (currentPagu: number, newPagu: number) => {
  if (newPagu > currentPagu) return { kind: 'INCREASE' as const, amount: newPagu - currentPagu };
  if (newPagu < currentPagu) return { kind: 'DECREASE' as const, amount: currentPagu - newPagu };
  return { kind: 'NONE' as const, amount: 0 };
};

export const toPaguInput = (draft: PaguAdjustmentDraft) => ({
  newPagu: draft.newPagu as number,
  bankAccountId: draft.bankAccountId as string,
  date: draft.date,
  reason: draft.reason.trim(),
});
