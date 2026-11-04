import {
  draftFromSettings,
  editDraftFromFund,
  emptyNewFund,
  paguDirection,
  toCreateFundInput,
  toFundPatch,
  toPaguInput,
  validateFundEdit,
  validateNewFund,
  validatePaguAdjustment,
} from '@/module/petty-cash/domain/fundAdmin';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';

const TODAY = '2026-10-31';

const fund = {
  id: 'f1',
  name: 'Kas Kecil HQ',
  pagu: 5_000_000,
  status: 'ACTIVE',
  custodian: { id: 'u1', name: 'Pemegang' },
  settings: {
    warningThresholdPct: 20,
    voucherApprovalThreshold: 1_000_000,
    attachmentRequiredThreshold: 100_000,
    requireCountBeforeReimbursement: false,
    requireWitness: false,
    singleUserOverride: false,
    advanceMaxAmount: 2_000_000,
    advanceApprovalThreshold: 0,
    advanceSettlementDays: 7,
    advanceExcludeSaturday: false,
    advanceExcludeSunday: false,
  },
} as unknown as PettyCashFund;

const validNew = () => ({
  ...emptyNewFund(TODAY),
  code: 'PC-X',
  name: 'Dana X',
  accountId: 'a1',
  custodianId: 'u1',
  pagu: 1_000_000,
});

describe('new fund', () => {
  it('needs code, name, account, custodian and a positive whole ceiling', () => {
    const paths = validateNewFund(emptyNewFund(TODAY), TODAY).map((issue) => issue.path);
    expect(paths).toEqual(['code', 'name', 'accountId', 'custodianId', 'pagu']);
    expect(validateNewFund(validNew(), TODAY)).toEqual([]);
  });

  it('rejects a funding date in the future only when a bank account is chosen', () => {
    const base = { ...validNew(), fundingDate: '2026-11-01' };
    expect(validateNewFund(base, TODAY)).toEqual([]);
    const funded = { ...base, fundingBankAccountId: 'b1' };
    expect(validateNewFund(funded, TODAY)).toEqual([{ path: 'fundingDate', code: 'FUTURE_DATE' }]);
  });

  it('flags a warning threshold above 100 and a negative limit', () => {
    const draft = validNew();
    draft.settings.warningThresholdPct = 150;
    draft.settings.advanceMaxAmount = -1;
    expect(validateNewFund(draft, TODAY)).toEqual([
      { path: 'warningThresholdPct', code: 'OVER_100' },
      { path: 'advanceMaxAmount', code: 'NEGATIVE' },
    ]);
  });

  it('sends funding details only when a bank account is chosen', () => {
    expect(toCreateFundInput(validNew())).not.toHaveProperty('fundingBankAccountId');
    const funded = toCreateFundInput({ ...validNew(), fundingBankAccountId: 'b1' });
    expect(funded).toMatchObject({ fundingBankAccountId: 'b1', fundingDate: TODAY });
  });
});

describe('editing a fund', () => {
  it('sends nothing when nothing changed', () => {
    expect(toFundPatch(fund, editDraftFromFund(fund))).toEqual({});
  });

  it('sends only the changed rules, with the reason', () => {
    const draft = editDraftFromFund(fund);
    draft.settings.advanceSettlementDays = 14;
    draft.reason = ' Kebijakan baru ';
    expect(toFundPatch(fund, draft)).toEqual({
      advanceSettlementDays: 14,
      reason: 'Kebijakan baru',
    });
  });

  it('asks for a reason when the custodian or the status changes', () => {
    const draft = editDraftFromFund(fund);
    draft.status = 'INACTIVE';
    expect(validateFundEdit(fund, draft)).toEqual([{ path: 'reason', code: 'REQUIRED' }]);
    draft.reason = 'Ditutup sementara';
    expect(validateFundEdit(fund, draft)).toEqual([]);
  });

  it('round-trips settings through the draft', () => {
    expect(draftFromSettings(fund.settings).advanceMaxAmount).toBe(2_000_000);
  });
});

describe('ceiling adjustment', () => {
  const draft = { newPagu: 6_000_000, bankAccountId: 'b1', date: TODAY, reason: 'Kebutuhan naik' };

  it('accepts a complete change', () => {
    expect(validatePaguAdjustment(draft, 5_000_000, TODAY)).toEqual([]);
  });

  it('rejects the same ceiling, a missing bank account and a missing reason', () => {
    const issues = validatePaguAdjustment(
      { ...draft, newPagu: 5_000_000, bankAccountId: null, reason: ' ' },
      5_000_000,
      TODAY
    );
    expect(issues.map((issue) => issue.code)).toEqual(['SAME_AS_CURRENT', 'REQUIRED', 'REQUIRED']);
  });

  it('tells which way the money moves', () => {
    expect(paguDirection(5, 8)).toEqual({ kind: 'INCREASE', amount: 3 });
    expect(paguDirection(8, 5)).toEqual({ kind: 'DECREASE', amount: 3 });
    expect(paguDirection(5, 5).kind).toBe('NONE');
  });
});

describe('toPaguInput pocket', () => {
  const base = { newPagu: 7000000, bankAccountId: 'b1', date: '2026-11-04', reason: ' naik ' };

  it('adds the pocket only when one was chosen', () => {
    expect(toPaguInput({ ...base, pocket: 'BCA-KK' })).toEqual({
      newPagu: 7000000,
      bankAccountId: 'b1',
      pocket: 'BCA-KK',
      date: '2026-11-04',
      reason: 'naik',
    });
    expect(toPaguInput({ ...base, pocket: null })).not.toHaveProperty('pocket');
  });
});
