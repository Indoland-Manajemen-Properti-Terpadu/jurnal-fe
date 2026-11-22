import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import type { Warehouse } from '@/module/inventory/domain/warehouse';
import type { WarehousePage } from '@/module/inventory/infrastructure/warehouseApi';
import { WarehouseTable } from './WarehouseTable';

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

const page = (items: Warehouse[], inventoryValue: number | null = 0): WarehousePage => ({
  items,
  page: 1,
  totalPages: 1,
  totalResults: items.length,
  summary: { totalCount: items.length, activeCount: items.length, itemCount: 0, inventoryValue },
});

const rights = { create: true, read: true, update: true, delete: true };

const renderTable = (data: WarehousePage, overrides: Record<string, unknown> = {}) => {
  const handlers = {
    onRetry: vi.fn(),
    onResetFilters: vi.fn(),
    onAddNew: vi.fn(),
    onPageChange: vi.fn(),
    onOpen: vi.fn(),
    onEdit: vi.fn(),
    onMakeDefault: vi.fn(),
    onDeactivate: vi.fn(),
    onActivate: vi.fn(),
    onDelete: vi.fn(),
  };
  render(
    <MemoryRouter>
      <WarehouseTable
        data={data}
        loading={false}
        failed={false}
        hasFilters={false}
        rights={rights}
        {...handlers}
        {...overrides}
      />
    </MemoryRouter>
  );
  return handlers;
};

describe('WarehouseTable', () => {
  it('marks the main warehouse and offers neither Nonaktifkan nor Hapus for it', async () => {
    renderTable(page([warehouse({ isDefault: true, canDelete: false })]));

    expect(screen.getByText('Utama')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Aksi Gudang Utama' }));

    expect(await screen.findByRole('menuitem', { name: 'Ubah' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Nonaktifkan' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Hapus' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Jadikan utama' })).not.toBeInTheDocument();
  });

  it('offers Hapus for a warehouse no document has used', async () => {
    renderTable(page([warehouse({ name: 'Gudang Lt. 3', code: 'GDG-003', canDelete: true })]));

    await userEvent.click(screen.getByRole('button', { name: 'Aksi Gudang Lt. 3' }));

    expect(await screen.findByRole('menuitem', { name: 'Hapus' })).toBeInTheDocument();
  });

  it('does not offer Hapus for a warehouse that has been used', async () => {
    renderTable(page([warehouse({ name: 'Gudang Lt. 2', code: 'GDG-002', canDelete: false })]));

    await userEvent.click(screen.getByRole('button', { name: 'Aksi Gudang Lt. 2' }));

    await screen.findByRole('menuitem', { name: 'Ubah' });
    expect(screen.queryByRole('menuitem', { name: 'Hapus' })).not.toBeInTheDocument();
  });

  it('offers Aktifkan for an inactive warehouse', async () => {
    renderTable(page([warehouse({ isActive: false, name: 'Gudang Lama' })]));

    await userEvent.click(screen.getByRole('button', { name: 'Aksi Gudang Lama' }));

    expect(await screen.findByRole('menuitem', { name: 'Aktifkan' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Nonaktifkan' })).not.toBeInTheDocument();
  });

  it('shows "Belum ditunjuk" and a dash instead of blanks', () => {
    renderTable(page([warehouse({})]));

    expect(screen.getByText('Belum ditunjuk')).toBeInTheDocument();
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
  });

  it('hides the value column when the service sends no values', () => {
    renderTable(page([warehouse({ inventoryValue: null })], null));

    expect(screen.queryByText('Nilai persediaan')).not.toBeInTheDocument();
  });

  it('keeps the table frame and offers a reset when filters match nothing', async () => {
    const handlers = renderTable(page([]), { hasFilters: true });

    expect(screen.getByText('Nama gudang')).toBeInTheDocument();
    expect(screen.getByText('Tidak ada gudang yang cocok')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Atur ulang filter' }));

    expect(handlers.onResetFilters).toHaveBeenCalled();
  });
});
