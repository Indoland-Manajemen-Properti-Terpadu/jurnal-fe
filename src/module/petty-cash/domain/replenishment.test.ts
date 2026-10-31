import {
  isDisbursementDateValid,
  latestApprovedCount,
  reconcileDraft,
  selectedTotal,
  toggleAll,
  toPreviewInput,
  toggleVoucher,
  toReplenishmentInput,
  validateReplenishmentDraft,
  type ReplenishmentDraft,
} from '@/module/petty-cash/domain/replenishment';

const draft = (over: Partial<ReplenishmentDraft> = {}): ReplenishmentDraft => ({
  voucherIds: ['v1'],
  bankAccountId: 'b1',
  countId: null,
  notes: '',
  ...over,
});

const codes = (d: ReplenishmentDraft, countRequired = false) =>
  validateReplenishmentDraft(d, { countRequired }).map((i) => `${i.path}:${i.code}`);

describe('validateReplenishmentDraft', () => {
  it('accepts vouchers with a bank account', () => {
    expect(codes(draft())).toEqual([]);
  });

  it('needs at least one voucher and a bank account', () => {
    expect(codes(draft({ voucherIds: [], bankAccountId: null }))).toEqual([
      'voucherIds:NO_VOUCHERS',
      'bankAccountId:REQUIRED',
    ]);
  });

  it('needs an approved cash count when the fund requires one', () => {
    expect(codes(draft(), true)).toEqual(['countId:COUNT_REQUIRED']);
    expect(codes(draft({ countId: 'c1' }), true)).toEqual([]);
  });
});

describe('toReplenishmentInput', () => {
  it('sends the fund, vouchers, bank, the count when chosen, and trimmed notes when filled', () => {
    expect(toReplenishmentInput('f1', draft({ countId: 'c1', notes: '  rutin  ' }))).toEqual({
      fundId: 'f1',
      voucherIds: ['v1'],
      bankAccountId: 'b1',
      countId: 'c1',
      notes: 'rutin',
    });
    const bare = toReplenishmentInput('f1', draft());
    expect(bare).not.toHaveProperty('countId');
    expect(bare).not.toHaveProperty('notes');
  });
});

describe('voucher selection', () => {
  it('toggles one voucher and selects or clears all', () => {
    expect(toggleVoucher(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleVoucher(['a', 'b'], 'a')).toEqual(['b']);
    expect(toggleAll(['a', 'b', 'c'], ['a'])).toEqual(['a', 'b', 'c']);
    expect(toggleAll(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual([]);
  });

  it('adds the selected totals without float drift', () => {
    const vouchers = [
      { id: 'a', totalAmount: 161000 },
      { id: 'b', totalAmount: 0.1 },
      { id: 'c', totalAmount: 0.2 },
    ];
    expect(selectedTotal(vouchers, ['a'])).toBe(161000);
    expect(selectedTotal(vouchers, ['b', 'c'])).toBe(0.3);
    expect(selectedTotal(vouchers, [])).toBe(0);
  });
});

describe('latestApprovedCount', () => {
  const count = (id: string, status: string, countedAt: string) =>
    ({ id, status, countedAt }) as never;

  it('picks the most recent approved count and ignores the rest', () => {
    const picked = latestApprovedCount([
      count('old', 'APPROVED', '2026-10-01T00:00:00.000Z'),
      count('new', 'APPROVED', '2026-10-20T00:00:00.000Z'),
      count('draft', 'DRAFT', '2026-10-30T00:00:00.000Z'),
      count('settled', 'SETTLED', '2026-10-31T00:00:00.000Z'),
    ]);
    expect(picked?.id).toBe('new');
  });

  it('is null when no count is approved', () => {
    expect(latestApprovedCount([count('a', 'SUBMITTED', '2026-10-01T00:00:00.000Z')])).toBeNull();
  });
});

describe('isDisbursementDateValid', () => {
  it('accepts today and earlier, refuses a future or empty date', () => {
    expect(isDisbursementDateValid('2026-10-31', '2026-10-31')).toBe(true);
    expect(isDisbursementDateValid('2026-10-01', '2026-10-31')).toBe(true);
    expect(isDisbursementDateValid('2026-11-01', '2026-10-31')).toBe(false);
    expect(isDisbursementDateValid('', '2026-10-31')).toBe(false);
  });
});

describe('toPreviewInput', () => {
  it('drops the notes, which the preview endpoint refuses, and keeps the rest', () => {
    const input = toReplenishmentInput('f1', draft({ countId: 'c1', notes: 'rutin' }));
    expect(toPreviewInput(input)).toEqual({
      fundId: 'f1',
      voucherIds: ['v1'],
      bankAccountId: 'b1',
      countId: 'c1',
    });
  });
});

describe('reconcileDraft', () => {
  it('drops voucher and count ids that are no longer offered, keeping the rest', () => {
    const result = reconcileDraft(draft({ voucherIds: ['a', 'gone', 'b'], countId: 'old' }), {
      voucherIds: ['a', 'b', 'c'],
      countIds: ['new'],
    });
    expect(result.voucherIds).toEqual(['a', 'b']);
    expect(result.countId).toBeNull();
  });

  it('keeps a count that is still offered, and leaves the other fields alone', () => {
    const result = reconcileDraft(draft({ countId: 'c1', notes: 'rutin' }), {
      voucherIds: ['v1'],
      countIds: ['c1'],
    });
    expect(result).toMatchObject({ countId: 'c1', notes: 'rutin', bankAccountId: 'b1' });
  });
});
