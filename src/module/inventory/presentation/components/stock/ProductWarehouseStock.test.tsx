import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@test-utils';
import type { ProductStock } from '@/module/inventory/domain/productStock';
import { ProductWarehouseStockTable } from './ProductWarehouseStock';

const stock: ProductStock = {
  productId: 'p1',
  unit: 'rim',
  totalQty: 63,
  warehouses: [
    {
      warehouseId: 'w1',
      code: 'GDG-001',
      name: 'Gudang Utama',
      isActive: true,
      isDefault: true,
      quantity: 60,
      minQty: 40,
      status: 'safe',
      lastOpname: { id: 'o1', number: 'SO/2026/11/0004', date: '2026-11-22T00:00:00.000Z' },
    },
    {
      warehouseId: 'w2',
      code: 'GDG-002',
      name: 'Gudang Cadangan',
      isActive: false,
      isDefault: false,
      quantity: 3,
      minQty: 10,
      status: 'belowMin',
      lastOpname: null,
    },
    {
      warehouseId: 'w3',
      code: 'GDG-003',
      name: 'Gudang Uji',
      isActive: true,
      isDefault: false,
      quantity: 0,
      minQty: 0,
      status: 'empty',
      lastOpname: null,
    },
  ],
};

const renderTable = (value: ProductStock) =>
  render(
    <MemoryRouter>
      <ProductWarehouseStockTable productId="p1" stock={value} />
    </MemoryRouter>
  );

describe('ProductWarehouseStockTable', () => {
  it('shows each warehouse with its quantity, status and last count', () => {
    renderTable(stock);

    const main = screen.getByRole('row', { name: /Gudang Utama/ });
    expect(within(main).getByText('Utama')).toBeInTheDocument();
    expect(within(main).getByText('60 rim')).toBeInTheDocument();
    expect(within(main).getByText('Aman')).toBeInTheDocument();
    expect(within(main).getByText('SO/2026/11/0004')).toBeInTheDocument();

    const spare = screen.getByRole('row', { name: /Gudang Cadangan/ });
    expect(within(spare).getByText('Nonaktif')).toBeInTheDocument();
    expect(within(spare).getByText('Di bawah minimum')).toBeInTheDocument();
    expect(within(spare).getByText('Belum pernah')).toBeInTheDocument();

    expect(
      within(screen.getByRole('row', { name: /Gudang Uji/ })).getByText('Habis')
    ).toBeInTheDocument();
  });

  it('links each warehouse to the stock card of this product for that warehouse', () => {
    renderTable(stock);
    expect(screen.getByRole('link', { name: /Gudang Utama/ })).toHaveAttribute(
      'href',
      expect.stringContaining('warehouse=w1')
    );
  });

  it('adds up the total and leaves the minimum blank when none is set', () => {
    renderTable(stock);
    expect(screen.getByText('63 rim')).toBeInTheDocument();
    expect(
      within(screen.getByRole('row', { name: /Gudang Uji/ })).getByText('-')
    ).toBeInTheDocument();
  });

  it('says so when there is no warehouse', () => {
    renderTable({ ...stock, warehouses: [], totalQty: 0 });
    expect(screen.getByText('Belum ada gudang')).toBeInTheDocument();
  });
});
