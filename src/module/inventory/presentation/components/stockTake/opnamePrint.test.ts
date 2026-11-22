import type {
  JournalPreview,
  OpnameLine,
  StockOpname,
} from '@/module/inventory/domain/stockOpname';
import { buildOpnamePrint, type PrintLabels } from './opnamePrint';

const labels: PrintLabels = {
  countTitle: 'Lembar Hitung Stok Opname',
  recordTitle: 'Berita Acara Stok Opname',
  meta: (opname) => `${opname.number} · ${opname.warehouse.name}`,
  people: (opname) => `Petugas: ${opname.counterName ?? '-'}`,
  cols: {
    no: 'No',
    product: 'Produk',
    sku: 'SKU',
    unit: 'Satuan',
    counted: 'Qty hitung',
    initial: 'Paraf',
    book: 'Saldo buku',
    diff: 'Selisih',
    value: 'Nilai',
    reason: 'Alasan',
    account: 'Akun',
    debit: 'Debit',
    credit: 'Kredit',
  },
  reason: (reason) => reason,
  countNote: 'Isi qty hasil hitungan fisik.',
  noDiff: 'Tidak ada selisih.',
  summary: () => 'Ringkasan',
  sign: {
    counter: 'Petugas Hitung',
    witness: 'Saksi',
    accounting: 'Accounting',
    manager: 'Building Manager',
  },
  money: (value) => `Rp ${value}`,
  qty: (value) => String(value),
};

const line = (overrides: Partial<OpnameLine>): OpnameLine => ({
  id: 'l1',
  productId: 'p1',
  name: 'Kertas <A4> & "map"',
  sku: 'K-1',
  unit: 'rim',
  bookQty: 10,
  countedQty: 8,
  diffQty: -2,
  unitCost: 100,
  costEditable: false,
  diffValue: -200,
  reason: 'hilang',
  allowedReasons: [],
  note: 'rak B',
  isFound: false,
  needsRecount: false,
  ...overrides,
});

const opname = (lines: OpnameLine[], canSeeValues = true): StockOpname =>
  ({
    id: 'o1',
    number: 'SO/1',
    status: 'posted',
    date: '2026-11-22',
    warehouse: { id: 'w', code: 'G1', name: 'Gudang Utama' },
    counterName: 'Asep',
    createdByName: 'Maya',
    canSeeValues,
    lines,
    summary: {
      counted: 1,
      total: 1,
      withDiff: 1,
      gainQty: 0,
      lossQty: 2,
      gainValue: 0,
      lossValue: 200,
      netValue: -200,
    },
  }) as unknown as StockOpname;

const preview: JournalPreview = {
  entries: [
    {
      accountId: 'a',
      accountNumber: '8-10006',
      accountName: 'Beban Kehilangan',
      reasons: ['hilang'],
      count: 1,
      debit: 200,
      credit: 0,
    },
  ],
  missing: [],
};

describe('buildOpnamePrint', () => {
  it('prints a count sheet with empty boxes to fill in and no book balance', () => {
    const html = buildOpnamePrint('count', opname([line({})]), undefined, labels);

    expect(html).toContain('Lembar Hitung Stok Opname');
    expect(html).toContain('Qty hitung');
    expect(html).toContain('Saksi');
    expect(html).not.toContain('Saldo buku');
    expect(html).not.toContain('>10<');
  });

  it('escapes what a person typed so it cannot become markup', () => {
    const html = buildOpnamePrint('count', opname([line({})]), undefined, labels);

    expect(html).toContain('Kertas &lt;A4&gt; &amp; &quot;map&quot;');
    expect(html).not.toContain('<A4>');
  });

  it('prints only the lines with a difference in the minutes, with the journal and signatures', () => {
    const html = buildOpnamePrint(
      'record',
      opname([
        line({}),
        line({ id: 'l2', productId: 'p2', name: 'Sama', countedQty: 10, diffQty: 0 }),
      ]),
      preview,
      labels
    );

    expect(html).toContain('Berita Acara Stok Opname');
    expect(html).toContain('Saldo buku');
    expect(html).toContain('8-10006');
    expect(html).toContain('Building Manager');
    expect(html).not.toContain('Sama');
  });

  it('says there is no difference when every count matches', () => {
    const html = buildOpnamePrint(
      'record',
      opname([line({ diffQty: 0, countedQty: 10 })]),
      preview,
      labels
    );

    expect(html).toContain('Tidak ada selisih.');
  });
});
