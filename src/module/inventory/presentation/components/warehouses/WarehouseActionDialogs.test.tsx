import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import type { BlockReason, Warehouse } from '@/module/inventory/domain/warehouse';
import { WarehouseBlockedDialog } from './WarehouseActionDialogs';

const warehouse = { id: 'w2', name: 'Gudang Lt. 2' } as Warehouse;

const renderBlocked = (reasons: BlockReason[]) =>
  render(
    <MemoryRouter>
      <WarehouseBlockedDialog warehouse={warehouse} reasons={reasons} onClose={vi.fn()} />
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

    expect(screen.getByRole('link', { name: 'Pindah barang' })).toHaveAttribute(
      'href',
      '/inventory/stock-movements/transfers/new?from=w2&fill=all'
    );
    expect(screen.getByRole('link', { name: 'Lihat pesanan' })).toHaveAttribute(
      'href',
      '/purchases/orders'
    );
    expect(screen.getByRole('link', { name: 'Buka opname' })).toHaveAttribute(
      'href',
      '/inventory/stock-take/o3'
    );
  });

  it('shows the stock reason without a value when the service sends no values', () => {
    renderBlocked([{ kind: 'stock', itemCount: 3, value: null }]);

    expect(screen.getByText('Masih ada stok 3 item.')).toBeInTheDocument();
  });

  it('keeps the service sentence for a reason it does not know', () => {
    renderBlocked([{ kind: 'other', message: 'Ada hal lain yang belum selesai.' }]);

    expect(screen.getByText('Ada hal lain yang belum selesai.')).toBeInTheDocument();
  });

  it('names each transfer that waits for approval and links to it', () => {
    renderBlocked([
      {
        kind: 'transfers',
        count: 2,
        transfers: [
          { id: 't5', number: 'PDH/2026/11/0005' },
          { id: 't6', number: 'PDH/2026/11/0006' },
        ],
      },
    ]);

    expect(screen.getByText('2 pindah barang masih menunggu persetujuan.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'PDH/2026/11/0005' })).toHaveAttribute(
      'href',
      '/inventory/stock-movements/transfers/t5'
    );
    expect(screen.getByRole('link', { name: 'PDH/2026/11/0006' })).toHaveAttribute(
      'href',
      '/inventory/stock-movements/transfers/t6'
    );
    expect(screen.queryByRole('link', { name: /lainnya/ })).not.toBeInTheDocument();
  });

  it('shows the first five and sends the rest to the list of waiting transfers', () => {
    const transfers = Array.from({ length: 7 }, (_, index) => ({
      id: `t${index}`,
      number: `PDH/2026/11/000${index}`,
    }));
    renderBlocked([{ kind: 'transfers', count: 7, transfers }]);

    expect(screen.getAllByRole('link', { name: /^PDH\// })).toHaveLength(5);
    expect(screen.getByRole('link', { name: 'dan 2 lainnya' })).toHaveAttribute(
      'href',
      '/inventory/stock-movements?tab=transfers&warehouse=w2&tstatus=PENDING_APPROVAL'
    );
  });

  it('still points to the list when the service names no transfer', () => {
    renderBlocked([{ kind: 'transfers', count: null, transfers: [] }]);

    expect(
      screen.getByText('Masih ada pindah barang yang menunggu persetujuan.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat pindah barang' })).toHaveAttribute(
      'href',
      '/inventory/stock-movements?tab=transfers&warehouse=w2&tstatus=PENDING_APPROVAL'
    );
  });
});
