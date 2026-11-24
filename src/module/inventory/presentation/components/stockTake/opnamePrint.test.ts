import type { OpnameLine, StockOpname } from '@/module/inventory/domain/stockOpname';
import { buildOpnamePrint, type PrintLabels } from './opnamePrint';

const labels: PrintLabels = {
  countTitle: 'Lembar Hitung Stok Opname',
  meta: (opname) => `${opname.number} · ${opname.warehouse.name}`,
  people: (opname) => `Petugas: ${opname.counterName ?? '-'}`,
  cols: {
    no: 'No',
    product: 'Produk',
    sku: 'SKU',
    unit: 'Satuan',
    counted: 'Qty hitung',
    initial: 'Paraf',
  },
  countNote: 'Isi qty hasil hitungan fisik.',
  sign: { counter: 'Petugas Hitung', witness: 'Saksi' },
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

const opname = (lines: OpnameLine[]): StockOpname =>
  ({
    id: 'o1',
    number: 'SO/1',
    status: 'counting',
    date: '2026-11-22',
    warehouse: { id: 'w', code: 'G1', name: 'Gudang Utama' },
    counterName: 'Asep',
    createdByName: 'Maya',
    lines,
  }) as unknown as StockOpname;

describe('buildOpnamePrint', () => {
  it('prints a count sheet with empty boxes to fill in and no book balance', () => {
    const html = buildOpnamePrint(opname([line({})]), labels);

    expect(html).toContain('Lembar Hitung Stok Opname');
    expect(html).toContain('Qty hitung');
    expect(html).toContain('Saksi');
    expect(html).not.toContain('Saldo buku');
    expect(html).not.toContain('>10<');
  });

  it('escapes what a person typed so it cannot become markup', () => {
    const html = buildOpnamePrint(opname([line({})]), labels);

    expect(html).toContain('Kertas &lt;A4&gt; &amp; &quot;map&quot;');
    expect(html).not.toContain('<A4>');
  });
});
