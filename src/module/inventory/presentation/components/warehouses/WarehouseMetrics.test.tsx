import { render, screen } from '@test-utils';
import type {
  Warehouse,
  WarehouseStockItem,
  WarehouseSummary,
} from '@/module/inventory/domain/warehouse';
import { WarehouseDetailMetrics, WarehouseListMetrics } from './WarehouseMetrics';

const warehouse = (overrides: Partial<Warehouse>): Warehouse => ({
  id: 'w1',
  code: 'GDG-001',
  name: 'Gudang Utama',
  address: '',
  city: '',
  postalCode: '',
  phone: '',
  notes: '',
  picUser: null,
  isDefault: false,
  isActive: true,
  runningOpname: null,
  lastOpname: null,
  itemCount: 0,
  inventoryValue: 0,
  belowMinCount: 0,
  canDelete: false,
  codeLocked: true,
  createdAt: '',
  createdBy: null,
  ...overrides,
});

const summary = (overrides: Partial<WarehouseSummary> = {}): WarehouseSummary => ({
  totalCount: 4,
  activeCount: 3,
  itemCount: 7,
  inventoryValue: 12859000,
  ...overrides,
});

const stock = (overrides: Partial<WarehouseStockItem>): WarehouseStockItem => ({
  productId: 'p1',
  name: 'Kertas A4',
  sku: '',
  unit: 'rim',
  quantity: 10,
  minQty: 0,
  status: 'safe',
  avgCost: 1000,
  value: 10000,
  ...overrides,
});

describe('WarehouseListMetrics', () => {
  const warehouses = [
    warehouse({ id: 'a', name: 'Gudang Utama', itemCount: 6, inventoryValue: 12291000 }),
    warehouse({ id: 'b', name: 'Gudang Lt. 2', itemCount: 1, inventoryValue: 568000 }),
    warehouse({ id: 'c', name: 'Gudang Lt. 3', itemCount: 0, inventoryValue: 0 }),
  ];

  it('shows the three figures with how the value is spread over the warehouses', () => {
    render(<WarehouseListMetrics summary={summary()} warehouses={warehouses} />);

    expect(screen.getByText('Gudang aktif')).toBeInTheDocument();
    expect(screen.getByText('3 dari 4 gudang')).toBeInTheDocument();
    expect(screen.getByText('Total item')).toBeInTheDocument();
    expect(screen.getByText('Nilai persediaan')).toBeInTheDocument();
    expect(screen.getAllByText(/Gudang Utama \(95%\)/).length).toBeGreaterThan(0);
  });

  it('draws no slice for a warehouse with nothing in it', () => {
    render(<WarehouseListMetrics summary={summary()} warehouses={warehouses} />);

    expect(screen.queryByText('Gudang Lt. 3')).not.toBeInTheDocument();
  });

  it('leaves out the value card when the service sends no values', () => {
    render(
      <WarehouseListMetrics
        summary={summary({ inventoryValue: null })}
        warehouses={warehouses.map((item) => ({ ...item, inventoryValue: null }))}
      />
    );

    expect(screen.queryByText('Nilai persediaan')).not.toBeInTheDocument();
    expect(screen.getByText('Total item')).toBeInTheDocument();
  });
});

describe('WarehouseDetailMetrics', () => {
  it('says all stock is safe when nothing is short', () => {
    render(
      <WarehouseDetailMetrics
        warehouse={warehouse({ itemCount: 1, inventoryValue: 10000 })}
        stock={[stock({})]}
        stockReady
      />
    );

    expect(screen.getByText('Semua stok aman')).toBeInTheDocument();
    expect(screen.getByText('1 dari 1 produk berstok')).toBeInTheDocument();
  });

  it('counts products that are out of stock', () => {
    render(
      <WarehouseDetailMetrics
        warehouse={warehouse({ itemCount: 1, belowMinCount: 2, inventoryValue: 10000 })}
        stock={[
          stock({}),
          stock({
            productId: 'p2',
            name: 'Map',
            quantity: 0,
            minQty: 5,
            status: 'empty',
            value: 0,
          }),
          stock({
            productId: 'p3',
            name: 'Pipa',
            quantity: 0,
            minQty: 5,
            status: 'empty',
            value: 0,
          }),
        ]}
        stockReady
      />
    );

    expect(screen.getByText('2 produk habis')).toBeInTheDocument();
    expect(screen.queryByText('Semua stok aman')).not.toBeInTheDocument();
  });

  it('shows no value card without values and no picture before the stock is loaded', () => {
    render(
      <WarehouseDetailMetrics
        warehouse={warehouse({ inventoryValue: null })}
        stock={[]}
        stockReady={false}
      />
    );

    expect(screen.queryByText('Nilai persediaan')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
