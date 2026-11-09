import { describe, expect, it } from 'vitest';
import type { ActivationValues, DisposalValues } from '@/module/assets/domain/asset';
import {
  canActivateAsset,
  canDisposeAsset,
  canEditAsset,
  canReviseAsset,
  estimateDisposalGainLoss,
  getAssetEditRights,
  previewAcquisitionJournal,
  sumJournalLines,
  validateActivation,
  validateDisposal,
} from '@/module/assets/domain/assetRules';

const activation = (overrides: Partial<ActivationValues> = {}): ActivationValues => ({
  assetAccount: 'a',
  creditAccount: 'b',
  accumDeprAccount: 'c',
  deprExpenseAccount: 'd',
  depreciationMethod: 'straight_line',
  usefulLifeYears: 4,
  residualValue: 0,
  accumulatedDepreciation: 0,
  depreciationStartDate: '',
  ...overrides,
});

describe('getAssetEditRights', () => {
  it('lets a ProApps asset change tags only', () => {
    expect(getAssetEditRights({ source: 'proapps', status: 'pending' })).toEqual({
      details: false,
      terms: false,
      tags: true,
    });
  });

  it('lets a Jurnal asset change code, date and cost only while pending', () => {
    expect(getAssetEditRights({ source: 'jurnal', status: 'pending' })).toEqual({
      details: true,
      terms: true,
      tags: true,
    });
    expect(getAssetEditRights({ source: 'jurnal', status: 'active' })).toEqual({
      details: true,
      terms: false,
      tags: true,
    });
  });

  it('closes a disposed asset', () => {
    expect(canEditAsset({ source: 'jurnal', status: 'disposed' })).toBe(false);
  });
});

describe('asset actions by status', () => {
  it('activates pending, disposes active, revises active and fully depreciated', () => {
    expect(canActivateAsset({ status: 'pending' })).toBe(true);
    expect(canActivateAsset({ status: 'active' })).toBe(false);
    expect(canDisposeAsset({ status: 'active' })).toBe(true);
    expect(canDisposeAsset({ status: 'pending' })).toBe(false);
    expect(canReviseAsset({ status: 'fully_depreciated' })).toBe(true);
    expect(canReviseAsset({ status: 'disposed' })).toBe(false);
  });
});

describe('validateActivation', () => {
  it('accepts complete, distinct accounts and sane terms', () => {
    expect(validateActivation(activation(), 12000000)).toEqual({});
  });

  it('asks for every account when the asset is depreciated', () => {
    const errors = validateActivation(
      activation({ assetAccount: '', accumDeprAccount: '', deprExpenseAccount: '' }),
      1000
    );
    expect(Object.keys(errors).sort()).toEqual([
      'accumDeprAccount',
      'assetAccount',
      'deprExpenseAccount',
    ]);
  });

  it('needs only the asset and counter account without depreciation', () => {
    expect(
      validateActivation(
        activation({
          depreciationMethod: 'none',
          usefulLifeYears: 0,
          accumDeprAccount: '',
          deprExpenseAccount: '',
        }),
        1000
      )
    ).toEqual({});
  });

  it('flags an account used twice', () => {
    expect(validateActivation(activation({ creditAccount: 'a' }), 1000)).toEqual({
      creditAccount: 'errAccountsDistinct',
    });
  });

  it('checks useful life, residual value and the opening accumulation', () => {
    expect(validateActivation(activation({ usefulLifeYears: 0 }), 1000).usefulLifeYears).toBe(
      'errUsefulLifeMin'
    );
    expect(validateActivation(activation({ residualValue: 1000 }), 1000).residualValue).toBe(
      'errResidualTooHigh'
    );
    expect(
      validateActivation(activation({ residualValue: 200, accumulatedDepreciation: 900 }), 1000)
        .accumulatedDepreciation
    ).toBe('errOpeningTooHigh');
  });
});

describe('previewAcquisitionJournal', () => {
  it('credits the counter account for the book value', () => {
    expect(previewAcquisitionJournal({ accumulatedDepreciation: 2500000 }, 10000000)).toEqual({
      asset: 10000000,
      accumulated: 2500000,
      counter: 7500000,
    });
  });

  it('never credits more than the cost', () => {
    expect(previewAcquisitionJournal({ accumulatedDepreciation: 99 }, 50)).toEqual({
      asset: 50,
      accumulated: 50,
      counter: 0,
    });
  });
});

describe('disposal', () => {
  const disposal = (overrides: Partial<DisposalValues> = {}): DisposalValues => ({
    disposalDate: '2026-11-01',
    disposalPrice: 0,
    proceedsAccount: '',
    gainLossAccount: '',
    ...overrides,
  });

  it('needs a date that is not in the future', () => {
    expect(validateDisposal(disposal({ disposalDate: '' }), '2026-11-09').disposalDate).toBe(
      'errDisposalDate'
    );
    expect(
      validateDisposal(disposal({ disposalDate: '2026-11-10' }), '2026-11-09').disposalDate
    ).toBe('errDisposalFuture');
    expect(validateDisposal(disposal(), '2026-11-09')).toEqual({});
  });

  it('asks a sold asset for its price and proceeds account, and a scrapped one for neither', () => {
    expect(validateDisposal(disposal(), '2026-11-09', 'sold')).toEqual({
      disposalPrice: 'errDisposalPrice',
      proceedsAccount: 'errProceedsAccount',
    });
    expect(validateDisposal(disposal({ proceedsAccount: '' }), '2026-11-09', 'scrapped')).toEqual(
      {}
    );
  });

  it('needs a proceeds account only when the asset is sold for money', () => {
    expect(validateDisposal(disposal({ disposalPrice: 5 }), '2026-11-09').proceedsAccount).toBe(
      'errProceedsAccount'
    );
    expect(
      validateDisposal(disposal({ disposalPrice: 5, proceedsAccount: 'x' }), '2026-11-09')
    ).toEqual({});
  });

  it('estimates the gain or loss without floating point drift', () => {
    expect(estimateDisposalGainLoss(0.3, 0.1)).toBe(0.2);
    expect(estimateDisposalGainLoss(3000000, 1562500)).toBe(1437500);
    expect(estimateDisposalGainLoss(0, 500)).toBe(-500);
  });
});

describe('sumJournalLines', () => {
  it('sums debit and credit exactly', () => {
    expect(
      sumJournalLines([
        { account: 'a', debit: 0.1, credit: 0 },
        { account: 'b', debit: 0.2, credit: 0.3 },
      ])
    ).toEqual({ debit: 0.3, credit: 0.3 });
  });
});
