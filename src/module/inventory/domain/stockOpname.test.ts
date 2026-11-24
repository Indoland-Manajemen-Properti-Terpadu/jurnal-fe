import { describe, expect, it } from 'vitest';
import {
  lineIssue,
  lineState,
  opnameActions,
  reasonsForDiff,
  stepIndex,
  validateOpnameInput,
  submitReadiness,
  type OpnameLine,
} from './stockOpname';

const line = (overrides: Partial<OpnameLine> = {}): OpnameLine => ({
  id: 'l1',
  productId: 'p1',
  name: 'Kertas A4',
  sku: 'K',
  unit: 'rim',
  bookQty: 10,
  countedQty: 10,
  diffQty: 0,
  unitCost: 56800,
  costEditable: false,
  diffValue: 0,
  reason: null,
  allowedReasons: [],
  note: '',
  isFound: false,
  needsRecount: false,
  ...overrides,
});

describe('reasonsForDiff', () => {
  it('offers the loss reasons for a shortage', () => {
    expect(reasonsForDiff(-1)).toEqual([
      'rusak',
      'kedaluwarsa',
      'hilang',
      'salah_catat',
      'lainnya',
    ]);
  });

  it('offers the gain reasons for an excess', () => {
    expect(reasonsForDiff(2)).toEqual(['ditemukan', 'salah_catat', 'lainnya']);
  });

  it('offers none when the count matches the book', () => {
    expect(reasonsForDiff(0)).toEqual([]);
    expect(reasonsForDiff(null)).toEqual([]);
  });

  it('never offers "Hilang" for an excess or "Ditemukan" for a shortage', () => {
    expect(reasonsForDiff(3)).not.toContain('hilang');
    expect(reasonsForDiff(-3)).not.toContain('ditemukan');
  });
});

describe('lineIssue', () => {
  it('has none for a counted line that matches the book', () => {
    expect(lineIssue(line())).toBeNull();
  });

  it('asks for a reason when the count differs from the book', () => {
    expect(lineIssue(line({ countedQty: 9, diffQty: -1 }))).toBe('reasonRequired');
  });

  it('is satisfied once a reason is chosen', () => {
    expect(lineIssue(line({ countedQty: 9, diffQty: -1, reason: 'hilang' }))).toBeNull();
  });

  it('asks for a note when the reason is "Lainnya"', () => {
    expect(lineIssue(line({ countedQty: 9, diffQty: -1, reason: 'lainnya' }))).toBe('noteRequired');
    expect(
      lineIssue(line({ countedQty: 9, diffQty: -1, reason: 'lainnya', note: 'Rusak kena air' }))
    ).toBeNull();
  });

  it('does not accept a note of only spaces for "Lainnya"', () => {
    expect(lineIssue(line({ countedQty: 9, diffQty: -1, reason: 'lainnya', note: '   ' }))).toBe(
      'noteRequired'
    );
  });

  it('asks for a unit price when something is found of a product with no price yet', () => {
    expect(
      lineIssue(
        line({
          bookQty: 0,
          countedQty: 3,
          diffQty: 3,
          reason: 'ditemukan',
          costEditable: true,
          unitCost: 0,
        })
      )
    ).toBe('costRequired');
    expect(
      lineIssue(
        line({
          bookQty: 0,
          countedQty: 3,
          diffQty: 3,
          reason: 'ditemukan',
          costEditable: true,
          unitCost: 5000,
        })
      )
    ).toBeNull();
  });

  it('has no issue for a line not counted yet (that is a separate count)', () => {
    expect(lineIssue(line({ countedQty: null, diffQty: null }))).toBeNull();
  });
});

describe('submitReadiness', () => {
  it('is ready when every line is counted and every difference has a reason', () => {
    expect(submitReadiness([line(), line({ id: 'l2', productId: 'p2' })])).toEqual({
      ready: true,
      uncounted: 0,
      incomplete: 0,
    });
  });

  it('counts lines not counted yet; zero counts as counted', () => {
    const result = submitReadiness([
      line({ countedQty: null, diffQty: null }),
      line({ id: 'l2', countedQty: 0, diffQty: -10, reason: 'hilang' }),
    ]);

    expect(result).toEqual({ ready: false, uncounted: 1, incomplete: 0 });
  });

  it('counts counted lines that still miss a reason or a note', () => {
    const result = submitReadiness([
      line({ countedQty: 9, diffQty: -1 }),
      line({ id: 'l2', countedQty: 9, diffQty: -1, reason: 'lainnya' }),
    ]);

    expect(result).toEqual({ ready: false, uncounted: 0, incomplete: 2 });
  });

  it('is not ready for a document with no lines', () => {
    expect(submitReadiness([]).ready).toBe(false);
  });
});

describe('stepIndex', () => {
  it('places each status on the stepper and a cancelled count off it', () => {
    expect(stepIndex('draft')).toBe(0);
    expect(stepIndex('counting')).toBe(1);
    expect(stepIndex('pending_approval')).toBe(2);
    expect(stepIndex('posted')).toBe(3);
    expect(stepIndex('cancelled')).toBe(-1);
  });
});

describe('opnameActions', () => {
  const rights = { count: false, review: false, cancel: false, approve: false, remove: false };

  it('lets whoever may count start a draft and fill the counts', () => {
    expect(opnameActions('draft', { ...rights, count: true }).start).toBe(true);
    expect(opnameActions('counting', { ...rights, count: true }).fillCounts).toBe(true);
  });

  it('keeps reasons, submit and cancel for the reviewer', () => {
    const counter = opnameActions('counting', { ...rights, count: true });
    const reviewer = opnameActions('counting', { ...rights, review: true, cancel: true });

    expect(counter.fillReasons).toBe(false);
    expect(counter.submit).toBe(false);
    expect(reviewer.fillReasons).toBe(true);
    expect(reviewer.submit).toBe(true);
    expect(reviewer.cancel).toBe(true);
  });

  it('lets only the approver approve or reject a count waiting for approval', () => {
    const approver = opnameActions('pending_approval', { ...rights, approve: true });
    const reviewer = opnameActions('pending_approval', { ...rights, review: true, cancel: true });

    expect(approver.approve).toBe(true);
    expect(approver.reject).toBe(true);
    expect(reviewer.approve).toBe(false);
    expect(reviewer.cancel).toBe(false);
  });

  it('lets only someone who may cancel cancel a posted count', () => {
    expect(opnameActions('posted', { ...rights, cancel: true }).cancel).toBe(true);
    expect(opnameActions('posted', { ...rights, count: true }).cancel).toBe(false);
  });

  it('lets only someone with the delete right delete a draft', () => {
    expect(opnameActions('draft', { ...rights, count: true }).remove).toBe(false);
    expect(opnameActions('draft', { ...rights, count: true, remove: true }).remove).toBe(true);
  });

  it('never offers delete once a count was started or finished', () => {
    const all = { count: true, review: true, cancel: true, approve: true, remove: true };

    (['counting', 'pending_approval', 'posted', 'cancelled'] as const).forEach((status) => {
      expect(opnameActions(status, all).remove).toBe(false);
    });
  });

  it('offers the minutes of a posted count to the reviewer and the approver, not to the counter', () => {
    expect(opnameActions('posted', { ...rights, review: true }).minutes).toBe(true);
    expect(opnameActions('posted', { ...rights, approve: true }).minutes).toBe(true);
    expect(opnameActions('posted', { ...rights, count: true, cancel: true }).minutes).toBe(false);
  });

  it('has no minutes before a count is posted or once it is cancelled', () => {
    const all = { count: true, review: true, cancel: true, approve: true, remove: true };

    (['draft', 'counting', 'pending_approval', 'cancelled'] as const).forEach((status) => {
      expect(opnameActions(status, all).minutes).toBe(false);
    });
  });

  it('offers nothing on a cancelled count', () => {
    const all = { count: true, review: true, cancel: true, approve: true, remove: true };

    expect(Object.values(opnameActions('cancelled', all)).some(Boolean)).toBe(false);
  });
});

describe('validateOpnameInput', () => {
  const input = {
    warehouse: 'w1',
    date: '2026-11-22',
    scope: { type: 'all' as const, categoryIds: [], productIds: [] },
    counterUser: '',
    notes: '',
  };

  it('accepts a warehouse, a date up to today and the whole stock', () => {
    expect(validateOpnameInput(input, '2026-11-22', false)).toEqual({});
  });

  it('asks for a warehouse, and refuses one that is already being counted', () => {
    expect(validateOpnameInput({ ...input, warehouse: '' }, '2026-11-22', false).warehouse).toBe(
      'warehouse'
    );
    expect(validateOpnameInput(input, '2026-11-22', true).warehouse).toBe('warehouseBusy');
  });

  it('refuses a missing date and a date after today', () => {
    expect(validateOpnameInput({ ...input, date: '' }, '2026-11-22', false).date).toBe('date');
    expect(validateOpnameInput({ ...input, date: '2026-11-23' }, '2026-11-22', false).date).toBe(
      'date'
    );
  });

  it('asks for at least one category when the scope is by category', () => {
    const byCategory = {
      ...input,
      scope: { type: 'category' as const, categoryIds: [], productIds: [] },
    };

    expect(validateOpnameInput(byCategory, '2026-11-22', false).categories).toBe('categories');
    expect(
      validateOpnameInput(
        { ...byCategory, scope: { ...byCategory.scope, categoryIds: ['c1'] } },
        '2026-11-22',
        false
      )
    ).toEqual({});
  });

  it('asks for at least one product when the products are chosen by hand', () => {
    const manual = {
      ...input,
      scope: { type: 'manual' as const, categoryIds: [], productIds: [] },
    };

    expect(validateOpnameInput(manual, '2026-11-22', false).products).toBe('products');
    expect(
      validateOpnameInput(
        { ...manual, scope: { ...manual.scope, productIds: ['p1'] } },
        '2026-11-22',
        false
      )
    ).toEqual({});
  });
});

describe('lineState', () => {
  it('reads a line for the person who sees values', () => {
    expect(lineState(line({ countedQty: null, diffQty: null }), true)).toBe('uncounted');
    expect(lineState(line(), true)).toBe('match');
    expect(lineState(line({ countedQty: 9, diffQty: -1 }), true)).toBe('reasonRequired');
    expect(lineState(line({ countedQty: 9, diffQty: -1, reason: 'hilang' }), true)).toBe(
      'complete'
    );
  });

  it('only says counted or not to a person who counts blind', () => {
    expect(lineState(line({ countedQty: null, diffQty: null }), false)).toBe('uncounted');
    expect(lineState(line({ countedQty: 9, diffQty: null }), false)).toBe('counted');
  });
});
