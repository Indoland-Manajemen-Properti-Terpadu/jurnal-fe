import { render, screen, userEvent, within } from '@test-utils';
import type { WarehouseStockItem } from '@/module/inventory/domain/warehouse';
import { MinStockDialog } from './MinStockDialog';
import { WarehouseStockTab } from './WarehouseStockTab';

const item = (overrides: Partial<WarehouseStockItem>): WarehouseStockItem => ({
  productId: 'p1',
  name: 'Kertas A4 80 gsm',
  sku: 'SKU-1',
  unit: 'rim',
  quantity: 60,
  minQty: 20,
  status: 'safe',
  avgCost: 56800,
  value: 3408000,
  ...overrides,
});

const items = [
  item({}),
  item({
    productId: 'p2',
    name: 'Elbow PVC',
    sku: 'SKU-2',
    unit: 'pcs',
    quantity: 25,
    minQty: 40,
    status: 'belowMin',
    value: 162500,
  }),
  item({
    productId: 'p3',
    name: 'Map plastik',
    sku: 'SKU-3',
    unit: 'pcs',
    quantity: 0,
    minQty: 250,
    status: 'empty',
    value: 0,
  }),
];

const renderTab = (props: Record<string, unknown> = {}) =>
  render(
    <WarehouseStockTab
      items={items}
      loading={false}
      failed={false}
      showValue
      totalValue={3570500}
      canUpdate
      onSetMin={vi.fn()}
      onRetry={vi.fn()}
      {...props}
    />
  );

describe('WarehouseStockTab', () => {
  it('names the stock status of every product in words', () => {
    renderTab();
    const table = within(screen.getByRole('table'));

    expect(table.getByText('Aman')).toBeInTheDocument();
    expect(table.getByText('Di bawah minimum')).toBeInTheDocument();
    expect(table.getByText('Habis')).toBeInTheDocument();
  });

  it('never adds the quantities of different products together', () => {
    renderTab();

    expect(screen.queryByText('85')).not.toBeInTheDocument();
    expect(screen.getByText('Total nilai persediaan')).toBeInTheDocument();
  });

  it('hides the value columns and the total when the service sends no values', () => {
    renderTab({ showValue: false, totalValue: null });

    expect(screen.queryByText('Nilai')).not.toBeInTheDocument();
    expect(screen.queryByText('Harga rata-rata')).not.toBeInTheDocument();
    expect(screen.queryByText('Total nilai persediaan')).not.toBeInTheDocument();
  });

  it('filters by status', async () => {
    renderTab();

    await userEvent.click(screen.getByRole('textbox', { name: 'Status stok' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Habis', hidden: true }));

    expect(screen.getByText('Map plastik')).toBeInTheDocument();
    expect(screen.queryByText('Elbow PVC')).not.toBeInTheDocument();
  });

  it('offers the minimum-stock action only with the update right', async () => {
    renderTab({ canUpdate: false });

    expect(screen.queryByRole('button', { name: 'Aksi Kertas A4 80 gsm' })).not.toBeInTheDocument();
  });
});

describe('MinStockDialog', () => {
  it('refuses a negative minimum and does not save', async () => {
    const onSave = vi.fn();
    render(
      <MinStockDialog
        item={item({})}
        warehouseName="Gudang Utama"
        saving={false}
        onSave={onSave}
        onClose={vi.fn()}
      />
    );

    const field = screen.getByRole('textbox', { name: /Stok minimum di Gudang Utama/ });
    await userEvent.clear(field);
    await userEvent.type(field, '-2');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByText('Stok minimum tidak boleh negatif')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves an empty field as zero, meaning not monitored', async () => {
    const onSave = vi.fn();
    render(
      <MinStockDialog
        item={item({})}
        warehouseName="Gudang Utama"
        saving={false}
        onSave={onSave}
        onClose={vi.fn()}
      />
    );

    const field = screen.getByRole('textbox', { name: /Stok minimum di Gudang Utama/ });
    await userEvent.clear(field);
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(onSave).toHaveBeenCalledWith(0);
  });
});
