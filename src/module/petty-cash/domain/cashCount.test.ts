import {
  COIN_VALUES,
  denominationRows,
  countedGrandTotal,
  countedTotal,
  nonCashTotal,
  pocketVariance,
  emptyCountDraft,
  expectedCashEstimate,
  pieceSubtotal,
  NOTE_VALUES,
  toCountInput,
  validateCountDraft,
  variancePreview,
  type CountDraft,
} from '@/module/petty-cash/domain/cashCount';

const draft = (over: Partial<CountDraft> = {}): CountDraft => ({
  ...emptyCountDraft(),
  witnessId: 'w1',
  ...over,
});

const withNotes = (notes: Record<string, number | ''>): CountDraft =>
  draft({ notes: { ...emptyCountDraft().notes, ...notes } });

const issues = (d: CountDraft, options = { witnessRequired: true, varianceNonZero: false }) =>
  validateCountDraft(d, options).map((i) => `${i.path}:${i.code}`);

describe('denominations', () => {
  it('offers the seven banknotes and four coins the backend accepts', () => {
    expect(NOTE_VALUES).toEqual([100000, 50000, 20000, 10000, 5000, 2000, 1000]);
    expect(COIN_VALUES).toEqual([1000, 500, 200, 100]);
  });
});

describe('countedTotal', () => {
  it('multiplies each denomination by its pieces and adds notes and coins', () => {
    const d = draft({
      notes: {
        ...emptyCountDraft().notes,
        '100000': 35,
        '50000': 1,
        '10000': 1,
        '5000': 1,
        '2000': 2,
      },
      coins: { ...emptyCountDraft().coins, '500': 4 },
    });
    expect(countedTotal(d)).toBe(3569000 + 2000);
  });

  it('is zero for an empty count and ignores unusable quantities instead of crashing', () => {
    expect(countedTotal(emptyCountDraft())).toBe(0);
    expect(countedTotal(withNotes({ '100000': 2.5, '50000': -3 }))).toBe(0);
    expect(() => countedTotal(withNotes({ '100000': 1e15 }))).not.toThrow();
  });
});

describe('expected cash and variance preview', () => {
  const fund = { pagu: 5000000, pendingVoucherAmount: 1411000, outstandingAdvanceAmount: 0 };

  it('estimates the cash that should be in the box as the ceiling minus vouchers and advances', () => {
    expect(expectedCashEstimate(fund)).toBe(3589000);
    expect(expectedCashEstimate({ ...fund, outstandingAdvanceAmount: 400000 })).toBe(3189000);
  });

  it('reads counted minus expected as a signed variance', () => {
    expect(variancePreview(3569000, 3589000)).toEqual({ amount: -20000, type: 'SHORT' });
    expect(variancePreview(3600000, 3589000)).toEqual({ amount: 11000, type: 'OVER' });
    expect(variancePreview(3589000, 3589000)).toEqual({ amount: 0, type: 'BALANCED' });
  });
});

describe('validateCountDraft', () => {
  it('requires a witness when the fund asks for one, and something to be counted', () => {
    expect(issues(draft({ witnessId: null }))).toEqual([
      'witnessId:REQUIRED',
      'notes:NOTHING_COUNTED',
    ]);
    expect(issues(withNotes({ '100000': 1 }))).toEqual([]);
  });

  it('does not ask for a witness when the fund does not require one', () => {
    expect(
      issues(
        { ...withNotes({ '1000': 1 }), witnessId: null },
        {
          witnessRequired: false,
          varianceNonZero: false,
        }
      )
    ).toEqual([]);
  });

  it('rejects fractional, negative or absurd quantities by denomination', () => {
    const d = withNotes({ '100000': 1.5, '50000': -1, '20000': 2_000_000 });
    expect(issues(d).sort()).toEqual(
      [
        'notes.100000:INVALID_QUANTITY',
        'notes.50000:INVALID_QUANTITY',
        'notes.20000:INVALID_QUANTITY',
      ].sort()
    );
  });

  it('asks for a reason only when there is a variance', () => {
    const d = withNotes({ '100000': 1 });
    expect(issues(d, { witnessRequired: true, varianceNonZero: true })).toEqual([
      'reason:REASON_REQUIRED',
    ]);
    expect(
      issues(
        { ...d, reason: '  selisih struk  ' },
        { witnessRequired: true, varianceNonZero: true }
      )
    ).toEqual([]);
  });
});

describe('toCountInput', () => {
  it('sends every denomination (zero when empty), the witness and a trimmed reason', () => {
    const d = {
      ...withNotes({ '100000': 35, '2000': 2 }),
      witnessId: 'w1',
      reason: '  selisih kurang  ',
    };
    const input = toCountInput(d);
    expect(input.witnessedBy).toBe('w1');
    expect(input.reason).toBe('selisih kurang');
    expect(input.denominations['100000']).toBe(35);
    expect(input.denominations['50000']).toBe(0);
    expect(input.denominations.coins).toEqual({ '1000': 0, '500': 0, '200': 0, '100': 0 });
    expect(Object.keys(input.denominations).filter((k) => k !== 'coins')).toHaveLength(7);
  });

  it('leaves out the witness and the reason when they are empty', () => {
    const input = toCountInput({ ...withNotes({ '1000': 1 }), witnessId: null, reason: ' ' });
    expect(input).not.toHaveProperty('witnessedBy');
    expect(input).not.toHaveProperty('reason');
  });
});

describe('denominationRows', () => {
  it('lists banknotes then coins, largest first, with subtotals, and skips empty denominations', () => {
    const rows = denominationRows({
      notes: { '1000': 0, '2000': 2, '100000': 35, '50000': 1 },
      coins: { '100': 0, '500': 4, '1000': 3 },
    });
    expect(rows).toEqual([
      { kind: 'note', value: 100000, pieces: 35, subtotal: 3500000 },
      { kind: 'note', value: 50000, pieces: 1, subtotal: 50000 },
      { kind: 'note', value: 2000, pieces: 2, subtotal: 4000 },
      { kind: 'coin', value: 1000, pieces: 3, subtotal: 3000 },
      { kind: 'coin', value: 500, pieces: 4, subtotal: 2000 },
    ]);
  });

  it('is empty when nothing was counted', () => {
    expect(denominationRows({ notes: {}, coins: {} })).toEqual([]);
  });
});

describe('pieceSubtotal', () => {
  it('multiplies one denomination by its pieces and ignores unusable quantities', () => {
    expect(pieceSubtotal(100000, 35)).toBe(3500000);
    expect(pieceSubtotal(500, '')).toBe(0);
    expect(pieceSubtotal(500, 2.5)).toBe(0);
    expect(pieceSubtotal(500, -1)).toBe(0);
  });
});

describe('cash count per pocket', () => {
  const pockets = ['BCA', 'GOPAY'];
  const base = () => ({ ...emptyCountDraft(pockets), witnessId: 'w1' });
  const options = { witnessRequired: true, varianceNonZero: false, nonCashPockets: pockets };
  const codes = (d: CountDraft, o = options) =>
    validateCountDraft(d, o).map((i) => `${i.path}:${i.code}`);

  it('seeds an empty balance per pocket code', () => {
    expect(emptyCountDraft(pockets).nonCash).toEqual({ BCA: '', GOPAY: '' });
    expect(emptyCountDraft().nonCash).toEqual({});
  });

  it('adds the typed balances and ignores unusable ones', () => {
    expect(nonCashTotal({ ...base(), nonCash: { BCA: 100.1, GOPAY: 200.2 } })).toBe(0);
    expect(nonCashTotal({ ...base(), nonCash: { BCA: 1500000, GOPAY: 250000 } })).toBe(1750000);
    expect(nonCashTotal({ ...base(), nonCash: { BCA: -5, GOPAY: '' } })).toBe(0);
  });

  it('adds cash and non-cash into the grand total', () => {
    const d = { ...withNotes({ '100000': 2 }), nonCash: { BCA: 1500000, GOPAY: 250000 } };
    expect(countedGrandTotal(d)).toBe(1950000);
  });

  it('requires every listed pocket, rejects negative and fractional balances', () => {
    expect(codes({ ...base(), notes: { ...base().notes, '1000': 1 } })).toEqual([
      'nonCash.BCA:REQUIRED',
      'nonCash.GOPAY:REQUIRED',
    ]);
    const bad = { ...base(), nonCash: { BCA: -1, GOPAY: 10.5 } };
    expect(codes(bad)).toEqual(['nonCash.BCA:NEGATIVE', 'nonCash.GOPAY:WHOLE_RUPIAH']);
  });

  it('accepts zero as a typed balance and counts it as entered', () => {
    expect(codes({ ...base(), nonCash: { BCA: 0, GOPAY: 0 } })).toEqual([]);
  });

  it('flags nothing counted only when no balance was entered either', () => {
    expect(codes(base(), { ...options, nonCashPockets: [] })).toEqual(['notes:NOTHING_COUNTED']);
    expect(codes({ ...base(), nonCash: { BCA: 5000, GOPAY: 0 } })).toEqual([]);
  });

  it('sends the balances in the order given, only when there are pockets', () => {
    const d = { ...withNotes({ '1000': 1 }), nonCash: { GOPAY: 250000, BCA: 1500000 } };
    expect(toCountInput(d, pockets).nonCashBalances).toEqual([
      { pocket: 'BCA', balance: 1500000 },
      { pocket: 'GOPAY', balance: 250000 },
    ]);
    expect(toCountInput(d)).not.toHaveProperty('nonCashBalances');
  });

  it('reads a typed pocket balance against the book as a signed variance', () => {
    expect(pocketVariance(1400000, 1500000)).toEqual({ amount: -100000, type: 'SHORT' });
    expect(pocketVariance(1600000, 1500000)).toEqual({ amount: 100000, type: 'OVER' });
    expect(pocketVariance('', 0)).toEqual({ amount: 0, type: 'BALANCED' });
  });
});
