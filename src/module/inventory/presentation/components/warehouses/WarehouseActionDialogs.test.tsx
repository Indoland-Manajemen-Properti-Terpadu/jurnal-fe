import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import type { BlockReason, Warehouse } from '@/module/inventory/domain/warehouse';
import { WarehouseBlockedDialog } from './WarehouseActionDialogs';

const warehouse = { id: 'w2', name: 'Gudang Lt. 2' } as Warehouse;

const renderBlocked = (reasons: BlockReason[], onOwnPage = false) =>
  render(
    <MemoryRouter>
      <WarehouseBlockedDialog
        warehouse={warehouse}
        reasons={reasons}
        onOwnPage={onOwnPage}
        onClose={vi.fn()}
      />
    </MemoryRouter>
  );

describe('WarehouseBlockedDialog', () => {
  it('lists every reason at once and offers no Nonaktifkan button', () => {
    renderBlocked([
      { kind: 'default' },
      { kind: 'stock', itemCount: 1, value: 568000 },
      { kind: 'orders', count: 2 },
      { kind: 'opname', number: 'SO/2026/11/0003', id: 'o3' },
    ]);

    expect(screen.getByText('Gudang Lt. 2 belum bisa dinonaktifkan')).toBeInTheDocument();
    expect(screen.getByText('Ini gudang utama. Pilih gudang utama lain dulu.')).toBeInTheDocument();
    expect(screen.getByText(/Masih ada stok 1 item \(Rp\s568\.000,00\)\./)).toBeInTheDocument();
    expect(
      screen.getByText('2 pesanan pembelian belum diterima ke gudang ini.')
    ).toBeInTheDocument();
    expect(screen.getByText('Stok opname SO/2026/11/0003 masih berjalan.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nonaktifkan' })).not.toBeInTheDocument();
    // The header's close icon and the footer button share the name.
    expect(screen.getAllByRole('button', { name: 'Tutup' })).toHaveLength(2);
  });

  it('links each reason to the place that settles it', () => {
    renderBlocked([
      { kind: 'stock', itemCount: 1, value: 568000 },
      { kind: 'orders', count: 2 },
      { kind: 'opname', number: 'SO/2026/11/0003', id: 'o3' },
    ]);

    expect(screen.getByRole('link', { name: 'Lihat isi gudang' })).toHaveAttribute(
      'href',
      '/inventory/warehouses/w2'
    );
    expect(screen.getByRole('link', { name: 'Lihat pesanan' })).toHaveAttribute(
      'href',
      '/purchases/orders'
    );
    expect(screen.getByRole('link', { name: 'Buka opname' })).toHaveAttribute(
      'href',
      '/inventory/stock-take'
    );
  });

  it('does not link back to the warehouse page it is opened on', () => {
    renderBlocked([{ kind: 'stock', itemCount: 1, value: 568000 }], true);

    expect(screen.queryByRole('link', { name: 'Lihat isi gudang' })).not.toBeInTheDocument();
  });

  it('shows the stock reason without a value when the service sends no values', () => {
    renderBlocked([{ kind: 'stock', itemCount: 3, value: null }]);

    expect(screen.getByText('Masih ada stok 3 item.')).toBeInTheDocument();
  });

  it('keeps the service sentence for a reason it does not know', () => {
    renderBlocked([{ kind: 'other', message: 'Ada hal lain yang belum selesai.' }]);

    expect(screen.getByText('Ada hal lain yang belum selesai.')).toBeInTheDocument();
  });
});
