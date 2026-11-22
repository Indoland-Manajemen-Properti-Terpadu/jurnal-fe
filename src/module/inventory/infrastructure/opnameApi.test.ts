import { describe, expect, it } from 'vitest';
import {
  toAccountsBody,
  toCreateOpnameBody,
  toJournalPreview,
  toLineBody,
  toOpname,
  toOpnameItem,
  toOpnameQuery,
  type OpnameDto,
} from './opnameApi';

const dto: OpnameDto = {
  id: 'o1',
  number: 'SO/2026/11/0003',
  status: 'counting',
  date: '2026-11-22T00:00:00.000Z',
  warehouse: { id: 'w1', code: 'GDG-009', name: 'Uji Gudang Semarang' },
  scope: { type: 'manual', categoryIds: [], productIds: ['p1'] },
  notes: '',
  counterUser: { id: 'u1', name: 'Asep Anas' },
  createdBy: { id: 'u2', name: 'Firman Bojong' },
  createdAt: '2026-11-22T08:49:33.000Z',
  startedAt: '2026-11-22T08:49:34.000Z',
  canSeeValues: true,
  progress: { counted: 0, total: 1 },
  lines: [
    {
      id: 'l1',
      productId: 'p1',
      name: 'Kertas',
      sku: 'K',
      unit: 'rim',
      bookQty: 10,
      countedQty: null,
      diffQty: null,
      unitCost: 56800,
      costEditable: false,
      diffValue: null,
      reason: null,
      allowedReasons: [],
      note: '',
      isFound: false,
      needsRecount: false,
    },
  ],
  history: [
    {
      at: '2026-11-22T08:49:33.000Z',
      action: 'Dokumen dibuat',
      note: '',
      user: { id: 'u2', name: 'Firman Bojong' },
    },
  ],
  summary: {
    counted: 0,
    total: 1,
    withDiff: 0,
    gainQty: 0,
    lossQty: 0,
    gainValue: 0,
    lossValue: 0,
    netValue: 0,
  },
};

describe('toOpname', () => {
  it('maps a count with its lines, scope and history', () => {
    const opname = toOpname(dto);

    expect(opname).toMatchObject({
      number: 'SO/2026/11/0003',
      status: 'counting',
      counterName: 'Asep Anas',
      createdByName: 'Firman Bojong',
      canSeeValues: true,
    });
    expect(opname.lines[0]).toMatchObject({ productId: 'p1', bookQty: 10, countedQty: null });
    expect(opname.history[0].userName).toBe('Firman Bojong');
  });

  it('keeps what a blind counter is not sent as null, never zero', () => {
    const opname = toOpname({
      ...dto,
      canSeeValues: false,
      lines: [
        {
          ...dto.lines![0],
          bookQty: undefined,
          diffQty: undefined,
          unitCost: undefined,
          diffValue: undefined,
        },
      ],
      summary: { counted: 0, total: 1, withDiff: 0 },
    });

    expect(opname.canSeeValues).toBe(false);
    expect(opname.lines[0]).toMatchObject({
      bookQty: null,
      diffQty: null,
      unitCost: null,
      diffValue: null,
    });
    expect(opname.summary).toMatchObject({ gainValue: null, lossValue: null, netValue: null });
  });

  it('keeps a missing counter as null', () => {
    expect(toOpname({ ...dto, counterUser: null }).counterName).toBeNull();
  });
});

describe('toOpnameItem', () => {
  it('maps a row of the list, with the value hidden when the service sends none', () => {
    const item = toOpnameItem({
      id: 'o1',
      number: 'SO/1',
      status: 'posted',
      date: '2026-11-22T00:00:00.000Z',
      warehouse: dto.warehouse,
      progress: { counted: 2, total: 2 },
      createdBy: { id: 'u', name: 'Maya' },
      diffProducts: 1,
      diffValue: null,
    });

    expect(item).toMatchObject({ counted: 2, total: 2, diffProducts: 1, diffValue: null });
  });
});

describe('toOpnameQuery', () => {
  it('uses the names the service takes and sends only what was chosen', () => {
    expect(
      toOpnameQuery({
        q: ' SO/2026 ',
        warehouse: 'w1',
        status: 'counting',
        startDate: '2026-11-01',
        endDate: '2026-11-30',
        page: 2,
        limit: 10,
      })
    ).toEqual({
      q: 'SO/2026',
      warehouse: 'w1',
      status: 'counting',
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      page: 2,
      limit: 10,
    });
    expect(toOpnameQuery({ q: '  ' })).toEqual({});
  });
});

describe('toCreateOpnameBody', () => {
  it('names the warehouse `warehouse` and leaves empty optional fields out', () => {
    expect(
      toCreateOpnameBody({
        warehouse: 'w1',
        date: '2026-11-22',
        scope: { type: 'all', categoryIds: [], productIds: [] },
        counterUser: '',
        notes: '  ',
      })
    ).toEqual({
      warehouse: 'w1',
      date: '2026-11-22',
      scope: { type: 'all', categoryIds: [], productIds: [] },
    });
  });

  it('carries the person who counts and the note when given', () => {
    expect(
      toCreateOpnameBody({
        warehouse: 'w1',
        date: '2026-11-22',
        scope: { type: 'manual', categoryIds: [], productIds: ['p1'] },
        counterUser: 'u1',
        notes: ' Opname akhir bulan ',
      })
    ).toMatchObject({ counterUser: 'u1', notes: 'Opname akhir bulan' });
  });
});

describe('toLineBody', () => {
  it('sends only the fields that changed, and a cleared reason as null', () => {
    expect(toLineBody({ product: 'p1', countedQty: 9 })).toEqual({ product: 'p1', countedQty: 9 });
    expect(toLineBody({ product: 'p1', reason: null })).toEqual({ product: 'p1', reason: null });
    expect(toLineBody({ product: 'p1', note: ' x ', needsRecount: true })).toEqual({
      product: 'p1',
      note: 'x',
      needsRecount: true,
    });
  });
});

describe('toJournalPreview', () => {
  it('maps the entries by account', () => {
    const preview = toJournalPreview({
      entries: [
        {
          account: 'a1',
          accountNumber: '1-10300',
          accountName: 'Persediaan',
          reasons: [],
          count: 5,
          debit: 100,
          credit: 0,
        },
        {
          account: 'a2',
          accountNumber: '8-10001',
          accountName: 'Penyesuaian Persediaan',
          reasons: ['ditemukan'],
          count: 5,
          debit: 0,
          credit: 100,
        },
      ],
      missing: [],
    });

    expect(preview.entries).toHaveLength(2);
    expect(preview.entries[1]).toMatchObject({
      accountNumber: '8-10001',
      reasons: ['ditemukan'],
      credit: 100,
    });
    expect(preview.missing).toEqual([]);
  });

  it('reads reasons that still have no account', () => {
    expect(toJournalPreview({ entries: [], missing: ['hilang'] }).missing).toEqual(['hilang']);
  });
});

describe('toAccountsBody', () => {
  it('sends a map of reason to account id', () => {
    expect(toAccountsBody({ rusak: 'a1', hilang: 'a2' })).toEqual({
      accounts: { rusak: 'a1', hilang: 'a2' },
    });
  });
});
