import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@test-utils';
import type { BalanceReport } from '@/module/inventory/domain/stockBalance';
import { BalanceList } from './BalanceList';
import { BalanceMatrix } from './BalanceMatrix';

const report: BalanceReport = {
  asOf: '2026-11-22',
  warehouses: [
    { id: 'a', code: 'GDG-001', name: 'Gudang Utama', isActive: true, isDefault: true },
    { id: 'b', code: 'GDG-002', name: 'Gudang Lt. 2', isActive: true, isDefault: false },
    { id: 'c', code: 'GDG-003', name: 'Gudang Lama', isActive: false, isDefault: false },
  ],
  rows: [
    {
      productId: 'p1',
      name: 'Kertas A4',
      sku: 'SKU-1',
      unit: 'rim',
      quantities: { a: 50, b: 10 },
      totalQty: 60,
      avgCost: 56800,
      value: 3408000,
    },
    {
      productId: 'p2',
      name: 'Map plastik',
      sku: 'SKU-2',
      unit: 'pcs',
      quantities: { a: 200 },
      totalQty: 200,
      avgCost: 3600,
      value: 720000,
    },
  ],
  summary: { inventoryValue: 4128000, trackedProducts: 2, belowMinCount: 0, emptyCount: 0 },
  reconciliation: { matches: true, stockValue: 4128000, ledgerValue: 4128000 },
};

const renderMatrix = (overrides: Partial<BalanceReport> = {}, showValue = true) =>
  render(
    <MemoryRouter>
      <BalanceMatrix report={{ ...report, ...overrides }} showValue={showValue} />
    </MemoryRouter>
  );

describe('BalanceMatrix', () => {
  it('has a column for every active warehouse and none for an empty inactive one', () => {
    renderMatrix();

    expect(screen.getByText('GDG-001')).toBeInTheDocument();
    expect(screen.getByText('GDG-002')).toBeInTheDocument();
    expect(screen.queryByText('GDG-003')).not.toBeInTheDocument();
  });

  it('keeps an inactive warehouse that still holds stock on that date', () => {
    renderMatrix({
      rows: [{ ...report.rows[0], quantities: { a: 50, c: 3 }, totalQty: 53 }],
    });

    expect(screen.getByText('GDG-003')).toBeInTheDocument();
  });

  it('shows a dash where a warehouse holds none and opens the stock card from a quantity', () => {
    renderMatrix();
    const row = within(screen.getByText('Map plastik').closest('tr') as HTMLElement);

    expect(row.getAllByText('—').length).toBeGreaterThan(0);
    expect(row.getByRole('link', { name: '200' })).toHaveAttribute(
      'href',
      '/inventory/stock-movements/card/p2?warehouse=a'
    );
  });

  it('totals only the value, never the quantities of different products', () => {
    renderMatrix();

    expect(screen.getByText('Total nilai persediaan')).toBeInTheDocument();
    expect(screen.queryByText('260')).not.toBeInTheDocument();
  });

  it('hides price columns and the total when the service sends no values', () => {
    renderMatrix({}, false);

    expect(screen.queryByText('Harga rata-rata')).not.toBeInTheDocument();
    expect(screen.queryByText('Total nilai persediaan')).not.toBeInTheDocument();
  });
});

describe('BalanceList', () => {
  const renderList = (
    mins?: Record<string, { minQty: number; status: 'safe' | 'belowMin' | 'empty' }>
  ) =>
    render(
      <MemoryRouter>
        <BalanceList report={report} warehouseId="a" showValue mins={mins} />
      </MemoryRouter>
    );

  it('lists what one warehouse holds', () => {
    renderList();

    expect(screen.getByText('Kertas A4')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('shows the minimum and the status only when they are known', () => {
    renderList({ p1: { minQty: 20, status: 'safe' }, p2: { minQty: 250, status: 'belowMin' } });

    expect(screen.getByText('Stok min.')).toBeInTheDocument();
    expect(screen.getByText('Aman')).toBeInTheDocument();
    expect(screen.getByText('Di bawah minimum')).toBeInTheDocument();
  });

  it('leaves the minimum and status columns out when they are unknown', () => {
    renderList(undefined);

    expect(screen.queryByText('Stok min.')).not.toBeInTheDocument();
    expect(screen.queryByText('Aman')).not.toBeInTheDocument();
  });
});
