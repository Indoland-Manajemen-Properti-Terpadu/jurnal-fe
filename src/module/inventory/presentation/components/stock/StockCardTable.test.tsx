import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@test-utils';
import type { StockCard, StockCardRow } from '@/module/inventory/domain/stockCard';
import { StockCardTable } from './StockCardTable';

const row = (overrides: Partial<StockCardRow> = {}): StockCardRow => ({
  id: 'r1',
  date: '2026-11-22T00:00:00.000Z',
  type: 'OPNAME_GAIN',
  typeLabel: 'Penyesuaian opname (lebih)',
  isReversal: false,
  documentNumber: 'SO/2026/11/0003',
  sourceType: 'StockOpname',
  sourceId: 'o1',
  warehouse: { id: 'a', code: 'GDG-004', name: 'Uji Gudang Bekasi' },
  quantityIn: 120,
  quantityOut: 0,
  balanceQty: 120,
  unitCost: 56800,
  value: 6816000,
  balanceValue: 6816000,
  avgCost: 56800,
  journalId: 'j1',
  ...overrides,
});

const card = (overrides: Partial<StockCard> = {}): StockCard => ({
  product: { id: 'p1', name: 'Kertas A4', sku: 'SKU-1', unit: 'rim', category: 'Other' },
  warehouse: null,
  from: '2026-01-01',
  to: '2026-11-22',
  transfersExcluded: true,
  opening: { quantity: 0, value: 0 },
  closing: { quantity: 130, value: 7384000 },
  totalIn: 130,
  totalOut: 0,
  rows: [
    row(),
    row({
      id: 'r2',
      documentNumber: 'FPB/2026/11/0001',
      type: 'RECEIPT',
      typeLabel: 'Penerimaan barang',
      sourceType: 'GoodsReceipt',
      sourceId: 'g1',
      warehouse: { id: 'b', code: 'GDG-001', name: 'Gudang Utama' },
      quantityIn: 10,
      balanceQty: 130,
      balanceValue: 7384000,
      unitCost: 56800,
      value: 568000,
    }),
  ],
  ...overrides,
});

const renderTable = (data: StockCard, showValue = true) =>
  render(
    <MemoryRouter>
      <StockCardTable card={data} showValue={showValue} today="2026-11-22" />
    </MemoryRouter>
  );

describe('StockCardTable', () => {
  it('opens with the opening balance and closes with the closing balance', () => {
    renderTable(card());

    expect(screen.getByText('Saldo awal per 1 Jan 2026')).toBeInTheDocument();
    expect(screen.getByText('Saldo akhir per 22 Nov 2026')).toBeInTheDocument();
  });

  it('shows the running balance of each movement', () => {
    renderTable(card());
    const first = within(screen.getByText('SO/2026/11/0003').closest('tr') as HTMLElement);

    expect(first.getAllByText('120').length).toBeGreaterThan(0);
    expect(first.getByText('Penyesuaian opname (lebih)')).toBeInTheDocument();
  });

  it('adds a warehouse column only for "all warehouses"', () => {
    renderTable(card());
    expect(screen.getByText('Uji Gudang Bekasi')).toBeInTheDocument();
  });

  it('leaves the warehouse column out when one warehouse is chosen', () => {
    renderTable(card({ warehouse: { id: 'a', code: 'GDG-004', name: 'Uji Gudang Bekasi' } }));

    expect(screen.queryByText('Uji Gudang Bekasi')).not.toBeInTheDocument();
  });

  it('hides price and value columns when the service sends no values', () => {
    renderTable(
      card({
        opening: { quantity: 0, value: null },
        closing: { quantity: 130, value: null },
        rows: card().rows.map((item) => ({
          ...item,
          unitCost: null,
          value: null,
          balanceValue: null,
          avgCost: null,
        })),
      }),
      false
    );

    expect(screen.queryByText('Harga satuan')).not.toBeInTheDocument();
    expect(screen.queryByText('Saldo nilai')).not.toBeInTheDocument();
  });

  it('keeps the frame and explains when the period has no movement', () => {
    renderTable(card({ rows: [], totalIn: 0, closing: { quantity: 0, value: 0 } }));

    expect(screen.getByText('Belum ada mutasi pada periode ini')).toBeInTheDocument();
    expect(screen.getByText('Saldo awal per 1 Jan 2026')).toBeInTheDocument();
  });
});
