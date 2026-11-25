import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import type { OpnamePage } from '@/module/inventory/infrastructure/opnameApi';
import { OpnameTable } from './OpnameTable';

const page = (canSeeValues: boolean): OpnamePage => ({
  items: [
    {
      id: 'o1',
      number: 'SO/2026/11/0003',
      status: 'posted',
      date: '2026-11-22T00:00:00.000Z',
      warehouse: { id: 'w1', code: 'GDG-003', name: 'Uji Gudang Bekasi' },
      counted: 5,
      total: 5,
      diffProducts: 2,
      diffValue: canSeeValues ? -113600 : null,
      createdByName: 'Maya',
    },
  ],
  page: 1,
  totalPages: 1,
  totalResults: 1,
  canSeeValues,
  summary: { running: 0, pending: 0, diffThisMonth: null },
});

const renderTable = (data: OpnamePage | undefined, overrides = {}) =>
  render(
    <MemoryRouter>
      <OpnameTable
        data={data}
        pageSize={10}
        loading={false}
        failed={false}
        filtered={false}
        canCreate
        onRetry={vi.fn()}
        onCreate={vi.fn()}
        onPageChange={vi.fn()}
        {...overrides}
      />
    </MemoryRouter>
  );

describe('OpnameTable', () => {
  it('links the document, shows the progress and the value of the difference', () => {
    renderTable(page(true));

    expect(screen.getByRole('link', { name: 'SO/2026/11/0003' })).toHaveAttribute(
      'href',
      '/inventory/stock-take/o1'
    );
    expect(screen.getByText('5 dari 5 dihitung')).toBeInTheDocument();
    expect(screen.getByText('Nilai selisih')).toBeInTheDocument();
  });

  it('leaves out the difference columns for a person who is not sent values', () => {
    renderTable(page(false));

    expect(screen.queryByText('Nilai selisih')).not.toBeInTheDocument();
    expect(screen.queryByText('Produk selisih')).not.toBeInTheDocument();
    expect(screen.getByText('5 dari 5 dihitung')).toBeInTheDocument();
  });

  it('offers to create the first count when there is none', () => {
    renderTable({ ...page(true), items: [], totalResults: 0 });

    expect(screen.getByText('Belum ada stok opname')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Buat opname/ })).toBeInTheDocument();
  });

  it('says nothing matches, without offering to create, when filters are on', () => {
    renderTable({ ...page(true), items: [], totalResults: 0 }, { filtered: true });

    expect(screen.getByText('Tidak ada dokumen yang cocok')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Buat opname/ })).not.toBeInTheDocument();
  });
});

describe('a count whose warehouse was deleted', () => {
  it('still lists, and says the warehouse is not found instead of breaking the page', () => {
    const data = page(true);
    data.items[0] = { ...data.items[0], warehouse: { id: '', code: '', name: '' } };

    renderTable(data);

    expect(screen.getByText('SO/2026/11/0003')).toBeInTheDocument();
    expect(screen.getByText('Gudang tidak ditemukan')).toBeInTheDocument();
  });

  it('shows no difference for a count that was cancelled: nothing of it is booked', () => {
    const data = page(true);
    renderTable({
      ...data,
      items: [{ ...data.items[0], status: 'cancelled', diffProducts: 1, diffValue: -820000 }],
    });

    expect(screen.queryByText(/820\.000/)).not.toBeInTheDocument();
  });

  it('still shows the difference of a posted count', () => {
    renderTable(page(true));

    expect(screen.getByText(/113\.600/)).toBeInTheDocument();
  });
});
