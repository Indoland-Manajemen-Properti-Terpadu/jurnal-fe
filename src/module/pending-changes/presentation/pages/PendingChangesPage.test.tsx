import { act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { render, screen } from '@test-utils';
import { useI18nStore } from '@/i18n/store';
import PendingChangesPage from './PendingChangesPage';

vi.mock('@/components/AppShellLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const approveMutateAsync = vi.fn();
const approveAllMutateAsync = vi.fn();

const items = [
  {
    id: 'c1',
    type: 'FINE',
    referenceModel: 'Sale',
    referenceId: 's1',
    status: 'PENDING',
    notes: 'Invoice: INV-001, Pelanggan: C-77 Denda bulan Mei',
    payload: { newLateFeeAmount: 1500.5 },
    createdAt: '2026-05-10T12:00:00Z',
    updatedAt: '2026-05-11T12:00:00Z',
  },
  {
    id: 'c2',
    type: 'SALE_PAYMENT',
    referenceModel: 'Sale',
    referenceId: 's2',
    status: 'APPROVED',
    payload: { amount: '2500000', paymentMethod: 'Transfer', transactionNumber: 'TRX-9' },
    createdAt: '2026-05-10T12:00:00Z',
  },
  {
    id: 'c3',
    type: 'INVOICE_VOID',
    referenceModel: 'Sale',
    referenceId: 's3',
    status: 'PENDING',
    payload: { originalAmount: 100000, reason: 'Salah input' },
  },
  {
    id: 'c4',
    type: 'OTHER',
    referenceModel: 'Contact',
    referenceId: 'k1',
    status: 'PENDING',
    payload: { total: 12, description: 'Penyesuaian' },
  },
  {
    id: 'c5',
    type: 'STATUS_UPDATE',
    referenceModel: 'Contact',
    referenceId: 'k2',
    status: 'PENDING',
    payload: { state: 'active', a: 1, b: 2, syncDate: 'x' },
  },
];

vi.mock('@/module/pending-changes/presentation/hooks/usePendingChangesQueries', () => ({
  usePendingChanges: () => ({
    data: { data: items, pagination: { total: 5, page: 1, limit: 10, totalPages: 1 } },
    isLoading: false,
    refetch: vi.fn(),
  }),
  usePendingChangesCount: () => ({ data: 1234, refetch: vi.fn() }),
  useApprovePendingChange: () => ({ mutateAsync: approveMutateAsync, isPending: false }),
  useApproveAllPendingChanges: () => ({ mutateAsync: approveAllMutateAsync, isPending: false }),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <PendingChangesPage />
    </MemoryRouter>
  );

describe('<PendingChangesPage />', () => {
  beforeEach(() => {
    approveMutateAsync.mockReset();
    approveAllMutateAsync.mockReset();
  });
  afterEach(() => act(() => useI18nStore.getState().setLanguage('id')));

  it('shows the Indonesian title and the grouped total', () => {
    renderPage();

    expect(screen.getByText('Pusat Persetujuan Perubahan')).toBeInTheDocument();
    expect(screen.getByText('1.234')).toBeInTheDocument();
    expect(screen.getByText('Perlu persetujuan akuntan')).toBeInTheDocument();
  });

  it('switches the title and total grouping to English', () => {
    act(() => useI18nStore.getState().setLanguage('en'));
    renderPage();

    expect(screen.getByText('Pending Approvals Center')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('formats fine and payment amounts as rupiah and reads invoice and customer from notes', () => {
    renderPage();

    expect(screen.getByText('+Rp 1.500,50')).toBeInTheDocument();
    expect(screen.getByText('Rp 2.500.000,00')).toBeInTheDocument();
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('C-77')).toBeInTheDocument();
    expect(screen.getByText('Denda bulan Mei')).toBeInTheDocument();
    expect(screen.getByText('#TRX-9')).toBeInTheDocument();
  });

  it('labels deletions, fines and payments in the type badge', () => {
    renderPage();

    expect(screen.getByText('Penghapusan (VOID)')).toBeInTheDocument();
    expect(screen.getByText('Denda (FINE)')).toBeInTheDocument();
    expect(screen.getByText('Pembayaran (SALE_PAYMENT)')).toBeInTheDocument();
    expect(screen.getByText('Nilai Faktur: Rp 100.000,00')).toBeInTheDocument();
    expect(screen.getByText('Salah input')).toBeInTheDocument();
  });

  it('falls back to a generic amount and to the first two payload fields', () => {
    renderPage();

    expect(screen.getByText('Rp 12,00')).toBeInTheDocument();
    expect(screen.getByText('Penyesuaian')).toBeInTheDocument();
    expect(screen.getByText(/state:/)).toBeInTheDocument();
    expect(screen.getByText('+1 field')).toBeInTheDocument();
  });

  it('shows the approved badge only for approved items and an approve button for the rest', () => {
    renderPage();

    expect(screen.getAllByText('Disetujui')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Setujui' })).toHaveLength(4);
  });

  it('shows the update line only when updatedAt differs from createdAt', () => {
    renderPage();

    expect(screen.getAllByText(/^Upd:/)).toHaveLength(1);
    expect(screen.getAllByText(/10 Mei 2026/).length).toBeGreaterThan(0);
  });

  it('approves one change after confirming in the modal', async () => {
    approveMutateAsync.mockResolvedValue(undefined);
    renderPage();

    act(() => screen.getAllByRole('button', { name: 'Setujui' })[0].click());
    const confirm = await screen.findByRole('button', { name: 'Ya, Setujui Perubahan' });
    await act(async () => confirm.click());

    expect(approveMutateAsync).toHaveBeenCalledWith('c1');
  });

  it('approves everything after confirming the bulk modal', async () => {
    approveAllMutateAsync.mockResolvedValue(undefined);
    renderPage();

    act(() => screen.getByRole('button', { name: /Setujui Semua/ }).click());
    const confirm = await screen.findByRole('button', { name: 'Ya, Setujui Semua' });
    await act(async () => confirm.click());

    expect(approveAllMutateAsync).toHaveBeenCalledWith(undefined);
  });
});
