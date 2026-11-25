import { render, screen } from '@test-utils';
import type { BalanceReport } from '@/module/inventory/domain/stockBalance';
import { BalanceMetrics } from './BalanceMetrics';
import { ReconciliationBanner } from './ReconciliationBanner';

const report = (overrides: Partial<BalanceReport> = {}): BalanceReport => ({
  asOf: '2026-11-22',
  warehouses: [
    { id: 'a', code: 'GDG-001', name: 'Utama', isActive: true, isDefault: true },
    { id: 'b', code: 'GDG-002', name: 'Lt. 2', isActive: true, isDefault: false },
  ],
  rows: [
    {
      productId: 'p1',
      name: 'Kertas A4',
      sku: '',
      unit: 'rim',
      quantities: { a: 50, b: 10 },
      totalQty: 60,
      avgCost: 56800,
      value: 3408000,
    },
    {
      productId: 'p2',
      name: 'Map plastik',
      sku: '',
      unit: 'pcs',
      quantities: { a: 200 },
      totalQty: 200,
      avgCost: 3600,
      value: 720000,
    },
  ],
  summary: { inventoryValue: 4128000, trackedProducts: 4, belowMinCount: 2, emptyCount: 1 },
  reconciliation: { matches: true, stockValue: 4128000, ledgerValue: 4128000 },
  ...overrides,
});

describe('BalanceMetrics', () => {
  it('shows the four figures with how the stock is spread', () => {
    render(<BalanceMetrics report={report()} />);

    expect(screen.getByText('Nilai persediaan')).toBeInTheDocument();
    expect(screen.getByText('2 gudang berisi stok')).toBeInTheDocument();
    expect(screen.getByText('Produk dilacak')).toBeInTheDocument();
    expect(screen.getByText('2 produk berstok')).toBeInTheDocument();
    expect(screen.getByText('Di bawah minimum')).toBeInTheDocument();
    expect(screen.getByText('Habis')).toBeInTheDocument();
    expect(screen.getByText(/^Terbesar: Kertas A4/)).toBeInTheDocument();
  });

  it('says so in words when nothing is short', () => {
    render(
      <BalanceMetrics
        report={report({
          summary: { inventoryValue: 1, trackedProducts: 2, belowMinCount: 0, emptyCount: 0 },
        })}
      />
    );

    expect(screen.getByText('Semua stok aman')).toBeInTheDocument();
    expect(screen.getByText('Tidak ada yang habis')).toBeInTheDocument();
  });

  it('leaves out the value card when the service sends no values', () => {
    render(
      <BalanceMetrics
        report={report({
          summary: { inventoryValue: null, trackedProducts: 4, belowMinCount: 0, emptyCount: 0 },
          rows: report().rows.map((row) => ({ ...row, value: null, avgCost: null })),
        })}
      />
    );

    expect(screen.queryByText('Nilai persediaan')).not.toBeInTheDocument();
    expect(screen.getByText('Produk dilacak')).toBeInTheDocument();
  });
});

describe('ReconciliationBanner', () => {
  it('says the books match', () => {
    render(<ReconciliationBanner report={report()} />);

    expect(screen.getByText('Cocok dengan buku besar')).toBeInTheDocument();
  });

  it('names the size of the difference when the books disagree', () => {
    render(
      <ReconciliationBanner
        report={report({
          reconciliation: { matches: false, stockValue: 5000000, ledgerValue: 10086140 },
        })}
      />
    );

    expect(screen.getByText(/Selisih Rp\s5\.086\.140,00 dengan buku besar/)).toBeInTheDocument();
    expect(screen.queryByText('Cocok dengan buku besar')).not.toBeInTheDocument();
  });

  it('says the check covers every warehouse when the table is narrowed to one', () => {
    render(<ReconciliationBanner report={report()} scoped />);

    expect(screen.getByText(/dihitung untuk semua gudang dan kategori/i)).toBeInTheDocument();
  });

  it('adds no such note when nothing narrows the table', () => {
    render(<ReconciliationBanner report={report()} />);

    expect(screen.queryByText(/dihitung untuk semua gudang/i)).not.toBeInTheDocument();
  });

  it('shows nothing without a reconciliation', () => {
    render(<ReconciliationBanner report={report({ reconciliation: null })} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/buku besar/)).not.toBeInTheDocument();
  });
});
