import {
  cashRemainder,
  canDeactivatePocket,
  emptyPocketDraft,
  emptyTransfer,
  toCreatePocketsInput,
  toPocketPatch,
  toTransferInput,
  validateAddPocket,
  validateNewPockets,
  validatePocketEdit,
  validateTransfer,
  editDraftFromPocket,
  pocketLabel,
  type PocketDraft,
} from '@/module/petty-cash/domain/pockets';
import type { FundPocket } from '@/module/petty-cash/domain/pettyCashEntities';

const draft = (over: Partial<PocketDraft>): PocketDraft => ({
  ...emptyPocketDraft(),
  code: 'bca-kk',
  name: 'Rekening BCA',
  ...over,
});

const pocket = (over: Partial<FundPocket> & Pick<FundPocket, 'code' | 'balance'>): FundPocket => ({
  name: over.code,
  type: 'BANK',
  provider: null,
  accountNumber: null,
  accountHolder: null,
  isActive: true,
  ...over,
});

describe('new fund pockets', () => {
  it('leaves for the cash box what the other pockets do not take', () => {
    expect(
      cashRemainder(5000000, [draft({ amount: 2000000 }), draft({ code: 'gopay', amount: 500000 })])
    ).toBe(2500000);
    expect(cashRemainder('', [])).toBe(0);
  });

  it('accepts valid pockets and a share within the ceiling', () => {
    expect(validateNewPockets([draft({ amount: 2000000 })], 5000000)).toEqual([]);
  });

  it('rejects an empty or malformed code, a duplicate and the reserved cash code', () => {
    const issues = validateNewPockets(
      [
        draft({ code: '' }),
        draft({ code: 'a b' }),
        draft({ code: 'bca' }),
        draft({ code: 'BCA' }),
        draft({ code: 'tunai' }),
      ],
      5000000
    );
    expect(issues.map((issue) => `${issue.path}:${issue.code}`)).toEqual([
      'pockets.0.code:REQUIRED',
      'pockets.1.code:INVALID_CODE',
      'pockets.3.code:DUPLICATE_CODE',
      'pockets.4.code:DUPLICATE_CODE',
    ]);
  });

  it('rejects shares above the ceiling', () => {
    expect(validateNewPockets([draft({ amount: 6000000 })], 5000000)).toEqual([
      { path: 'pockets', code: 'OVER_PAGU' },
    ]);
  });

  it('rejects a negative or fractional share', () => {
    const issues = validateNewPockets(
      [draft({ amount: -1 }), draft({ code: 'gopay', amount: 1.5 })],
      5000000
    );
    expect(issues.map((issue) => issue.code)).toEqual(['NEGATIVE', 'WHOLE_NUMBER']);
  });

  it('sends nothing for a fund without pockets', () => {
    expect(toCreatePocketsInput([], 5000000)).toEqual({});
  });

  it('sends the split with the cash remainder first and drops empty shares', () => {
    const input = toCreatePocketsInput(
      [
        draft({ amount: 2000000, provider: ' BCA ' }),
        draft({ code: 'gopay', type: 'EWALLET', amount: '' }),
      ],
      5000000
    );
    expect(input.pockets).toEqual([
      { code: 'BCA-KK', name: 'Rekening BCA', type: 'BANK', provider: 'BCA' },
      { code: 'GOPAY', name: 'Rekening BCA', type: 'EWALLET' },
    ]);
    expect(input.fundingAllocation).toEqual([
      { pocket: 'TUNAI', amount: 3000000 },
      { pocket: 'BCA-KK', amount: 2000000 },
    ]);
  });

  it('omits the split when no pocket gets money', () => {
    expect(toCreatePocketsInput([draft({})], 5000000).fundingAllocation).toBeUndefined();
  });
});

describe('adding a pocket to an existing fund', () => {
  const existing = [pocket({ code: 'TUNAI', type: 'CASH', balance: 100 })];

  it('refuses a code already used on the fund', () => {
    expect(validateAddPocket(draft({ code: 'tunai' }), existing)).toEqual([
      { path: 'code', code: 'DUPLICATE_CODE' },
    ]);
  });

  it('requires a name', () => {
    expect(validateAddPocket(draft({ name: ' ' }), existing)).toEqual([
      { path: 'name', code: 'REQUIRED' },
    ]);
  });
});

describe('editing a pocket', () => {
  const bank = pocket({ code: 'BCA', balance: 0, name: 'BCA', provider: 'BCA' });

  it('sends only what changed, with the reason', () => {
    const edit = { ...editDraftFromPocket(bank), name: 'BCA Kas Kecil', reason: 'Ganti nama' };
    expect(toPocketPatch(bank, edit)).toEqual({ name: 'BCA Kas Kecil', reason: 'Ganti nama' });
  });

  it('sends nothing when nothing changed', () => {
    expect(toPocketPatch(bank, editDraftFromPocket(bank))).toEqual({});
  });

  it('allows deactivating only an empty non-cash pocket', () => {
    expect(canDeactivatePocket(bank)).toBe(true);
    expect(canDeactivatePocket(pocket({ code: 'BCA', balance: 10 }))).toBe(false);
    expect(canDeactivatePocket(pocket({ code: 'TUNAI', type: 'CASH', balance: 0 }))).toBe(false);
  });

  it('flags deactivating a pocket that still holds money', () => {
    const full = pocket({ code: 'BCA', balance: 500 });
    const issues = validatePocketEdit(full, { ...editDraftFromPocket(full), isActive: false });
    expect(issues).toEqual([{ path: 'isActive', code: 'OVER_BALANCE' }]);
  });
});

describe('pocket transfer', () => {
  const pockets = [
    pocket({ code: 'TUNAI', type: 'CASH', balance: 1000000 }),
    pocket({ code: 'BCA', balance: 4000000 }),
  ];
  const today = '2026-11-04';
  const valid = {
    ...emptyTransfer(today),
    fromPocket: 'BCA',
    toPocket: 'TUNAI',
    amount: 500000,
    memo: ' Tarik tunai ',
  };

  it('accepts a transfer within the source balance', () => {
    expect(validateTransfer(valid, pockets, today)).toEqual([]);
    expect(toTransferInput(valid)).toEqual({
      fromPocket: 'BCA',
      toPocket: 'TUNAI',
      amount: 500000,
      date: today,
      memo: 'Tarik tunai',
    });
  });

  it('refuses the same pocket, an amount above the balance and a future date', () => {
    expect(validateTransfer({ ...valid, toPocket: 'BCA' }, pockets, today)).toContainEqual({
      path: 'toPocket',
      code: 'SAME_POCKET',
    });
    expect(
      validateTransfer(
        { ...valid, fromPocket: 'TUNAI', toPocket: 'BCA', amount: 2000000 },
        pockets,
        today
      )
    ).toContainEqual({
      path: 'amount',
      code: 'OVER_BALANCE',
    });
    expect(validateTransfer({ ...valid, date: '2026-11-05' }, pockets, today)).toContainEqual({
      path: 'date',
      code: 'FUTURE_DATE',
    });
  });

  it('requires both pockets and a positive amount', () => {
    const issues = validateTransfer(emptyTransfer(today), pockets, today);
    expect(issues.map((issue) => `${issue.path}:${issue.code}`)).toEqual([
      'fromPocket:REQUIRED',
      'toPocket:REQUIRED',
      'amount:REQUIRED',
    ]);
    expect(validateTransfer({ ...valid, amount: 0 }, pockets, today)[0].code).toBe(
      'POSITIVE_AMOUNT'
    );
  });
});

describe('pocketLabel', () => {
  const pockets = [
    pocket({ code: 'TUNAI', type: 'CASH', balance: 0, name: 'Tunai' }),
    pocket({ code: 'BCA', balance: 0, name: 'BCA 1102' }),
  ];

  it('names the pocket of a document', () => {
    expect(pocketLabel(pockets, 'BCA')).toBe('BCA 1102');
  });

  it('says nothing for a fund with one pocket or a document without one', () => {
    expect(pocketLabel(pockets.slice(0, 1), 'TUNAI')).toBeNull();
    expect(pocketLabel(pockets, null)).toBeNull();
  });
});
