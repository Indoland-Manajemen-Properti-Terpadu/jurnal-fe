import { describe, expect, it } from 'vitest';
import type { ActivationValues } from '@/module/assets/domain/asset';
import {
  canActivateAsset,
  canDisposeAsset,
  canEditAsset,
  canReviseAsset,
  isValidPhotoUrl,
  getAssetEditRights,
  getWarrantyStatus,
  previewAcquisitionJournal,
  sumJournalLines,
  validateActivation,
  validatePhotos,
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
    // A fully depreciated asset is the natural case for a write-off report.
    expect(canDisposeAsset({ status: 'fully_depreciated' })).toBe(true);
    expect(canDisposeAsset({ status: 'disposed' })).toBe(false);
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

describe('validatePhotos', () => {
  it('accepts http(s) links and site paths, at most five', () => {
    expect(validatePhotos([])).toBeNull();
    expect(
      validatePhotos(['https://x.test/a.jpg', 'http://x.test/b.png', '/uploads/c.jpg'])
    ).toBeNull();
    expect(validatePhotos(Array(5).fill('https://x.test/a.jpg'))).toBeNull();
  });

  it('refuses a sixth photo and anything that is not a link', () => {
    expect(validatePhotos(Array(6).fill('https://x.test/a.jpg'))).toBe('errPhotoLimit');
    expect(validatePhotos(['foto.jpg'])).toBe('errPhotoUrl');
    expect(validatePhotos(['//x.test/a.jpg'])).toBe('errPhotoUrl');
    expect(validatePhotos(['https://x.test/a b.jpg'])).toBe('errPhotoUrl');
    expect(isValidPhotoUrl('ftp://x.test/a.jpg')).toBe(false);
  });
});

describe('sumJournalLines', () => {
  it('sums debit and credit exactly', () => {
    expect(
      sumJournalLines([
        { accountNumber: '1', accountName: 'a', debit: 0.1, credit: 0 },
        { accountNumber: '2', accountName: 'b', debit: 0.2, credit: 0.3 },
      ])
    ).toEqual({ debit: 0.3, credit: 0.3 });
  });
});

describe('getWarrantyStatus', () => {
  it('has no status without a warranty date', () => {
    expect(getWarrantyStatus(undefined, '2026-11-16')).toBeNull();
  });

  it('counts the months left on a running warranty', () => {
    expect(getWarrantyStatus('2027-11-01', '2026-11-16')).toEqual({
      state: 'active',
      monthsLeft: 12,
    });
  });

  it('flags a warranty that ends this month or next, and one that already ended', () => {
    expect(getWarrantyStatus('2026-11-30', '2026-11-16')).toEqual({ state: 'endingSoon' });
    expect(getWarrantyStatus('2026-12-31', '2026-11-16')).toEqual({ state: 'endingSoon' });
    expect(getWarrantyStatus('2026-11-16', '2026-11-16')).toEqual({ state: 'endingSoon' });
    expect(getWarrantyStatus('2026-11-15', '2026-11-16')).toEqual({ state: 'expired' });
  });
});
