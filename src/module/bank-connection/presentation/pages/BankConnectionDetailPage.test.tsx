import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BankConnectionDetailPage from '@/module/bank-connection/presentation/pages/BankConnectionDetailPage';

const m = vi.hoisted(() => ({
  connection: {} as Record<string, unknown>,
  runs: {} as Record<string, unknown>,
  events: {} as Record<string, unknown>,
  sign: vi.fn(),
  cancel: vi.fn(),
  sync: vi.fn(),
  revoke: vi.fn(),
  detail: {} as Record<string, unknown>,
}));

vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/module/chart-of-accounts', () => ({
  useDetailAccount: () => m.detail,
  unwrapAccountDetail: (d?: { data?: unknown }) => (d && 'data' in d ? d.data : d),
}));
vi.mock('@/module/bank-connection/presentation/hooks/useBankConnectionQueries', () => ({
  useBankConnection: () => m.connection,
  useConnectionEvents: () => m.events,
  useSyncRuns: () => m.runs,
}));
vi.mock('@/module/bank-connection/presentation/hooks/useBankConnectionMutations', () => ({
  useSignConnection: () => ({ mutate: m.sign, isPending: false }),
  useCancelConnection: () => ({ mutate: m.cancel, isPending: false }),
  useSyncConnection: () => ({ mutate: m.sync, isPending: false }),
  useRevokeConnection: () => ({ mutate: m.revoke, isPending: false }),
}));

const connection = (over: object = {}) => ({
  id: 'bc_1',
  providerId: 'p1',
  bankName: 'Bank Contoh A',
  accountId: 'acc-1',
  accountType: 'CORPORATE',
  status: 'IN_REVIEW',
  nextAction: 'WAIT_REVIEW',
  accountNumberMasked: '••••4821',
  accountHolderName: 'PT Maju',
  signatoryName: 'Budi Santoso',
  ...over,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/bank-cash/connection/bc_1']}>
      <Routes>
        <Route path="/bank-cash/connection/:connectionId" element={<BankConnectionDetailPage />} />
        <Route path="/bank-cash/connection/:connectionId/edit" element={<div>halaman ubah</div>} />
        <Route path="/bank-cash/connection" element={<div>pilih bank</div>} />
      </Routes>
    </MemoryRouter>
  );

const setStatus = (status: string, over: object = {}) => {
  m.connection = { isLoading: false, error: null, data: connection({ status, ...over }) };
};

describe('BankConnectionDetailPage', () => {
  beforeEach(() => {
    Object.values({ s: m.sign, c: m.cancel, y: m.sync, r: m.revoke }).forEach((fn) =>
      fn.mockReset()
    );
    m.events = {
      data: [{ id: 'e1', at: '2026-11-12T03:02:00Z', toStatus: 'SUBMITTED', actor: 'Rizky' }],
    };
    m.runs = { data: [] };
    m.detail = { accountDetail: { data: { amount: 127_472_682 } } };
    setStatus('IN_REVIEW');
  });

  it('shows the bank, the masked account and a status in words, with the steps', () => {
    renderPage();
    expect(screen.getByText('Bank Contoh A')).toBeTruthy();
    expect(screen.getByText('••••4821')).toBeTruthy();
    expect(screen.getAllByText('Sedang ditinjau').length).toBeGreaterThan(0);
    expect(screen.getByText('Tanda tangan dan kirim')).toBeTruthy();
  });

  it('while in review, says nothing is needed and lets the user cancel after confirming', async () => {
    renderPage();
    expect(screen.getByText('Pengajuan Anda sedang kami periksa')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Batalkan pengajuan' }));
    expect(m.cancel).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Ya, batalkan' }));
    expect(m.cancel).toHaveBeenCalledWith('bc_1', expect.anything());
  });

  it('keeps the signing button disabled until the person agrees, then signs', async () => {
    setStatus('AWAITING_SIGNATURE', { nextAction: 'SIGN' });
    renderPage();
    const button = screen.getByRole('button', { name: 'Tandatangani dan kirim ke bank' });
    expect(button.hasAttribute('disabled')).toBe(true);
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(button);
    expect(m.sign).toHaveBeenCalledWith('bc_1', expect.anything());
  });

  it('sends the user to the signing page the backend names instead of signing here', () => {
    setStatus('AWAITING_SIGNATURE', { signingUrl: 'https://sign.example/abc' });
    renderPage();
    const link = screen.getByRole('link', { name: 'Buka halaman tanda tangan' });
    expect(link.getAttribute('href')).toBe('https://sign.example/abc');
    expect(screen.queryByRole('button', { name: 'Tandatangani dan kirim ke bank' })).toBeNull();
  });

  it('shows the reason a request was sent back and leads to the correction', async () => {
    setStatus('NEEDS_REVISION', {
      reason: 'Nama pemilik rekening tidak sama dengan nama perusahaan',
    });
    renderPage();
    expect(screen.getByText(/tidak sama dengan nama perusahaan/)).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Perbaiki data' }));
    expect(await screen.findByText('halaman ubah')).toBeTruthy();
  });

  it('offers another bank after a refusal, and a new request after a disconnect', async () => {
    setStatus('REJECTED', { reason: 'Rekening perorangan tidak didukung' });
    const { unmount } = renderPage();
    expect(screen.getByText('Rekening perorangan tidak didukung')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Pilih bank lain' }));
    expect(await screen.findByText('pilih bank')).toBeTruthy();
    unmount();
    setStatus('REVOKED');
    renderPage();
    expect(screen.getByText('Koneksi diputus')).toBeTruthy();
    expect(screen.queryByText('Langkah pengajuan')).toBeNull();
  });

  it('says plainly that the connection cannot be found, with no retry', () => {
    m.connection = { isLoading: false, data: undefined, error: { kind: 'notFound' } };
    renderPage();
    expect(screen.getByText('Koneksi ini tidak ditemukan.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Coba lagi' })).toBeNull();
  });

  it('lets the user retry a failed load', () => {
    m.connection = {
      isLoading: false,
      data: undefined,
      error: { kind: 'network' },
      refetch: vi.fn(),
    };
    renderPage();
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeTruthy();
  });

  describe('active connection', () => {
    beforeEach(() => {
      setStatus('ACTIVE', {
        nextAction: 'NONE',
        statementBalance: 127_500_000,
        statementBalanceAsOf: '2026-11-12T03:05:00Z',
        lastSyncedAt: new Date(Date.now() - 10 * 60_000).toISOString(),
        consentExpiresAt: '2027-11-12T00:00:00Z',
      });
    });

    it('puts the bank balance, the book balance and the difference side by side', () => {
      renderPage();
      expect(screen.getByText(/127\.500\.000/)).toBeTruthy();
      expect(screen.getByText(/127\.472\.682/)).toBeTruthy();
      expect(screen.getByText(/27\.318/)).toBeTruthy();
      expect(screen.getByText(/Terakhir sinkron 10 menit lalu/)).toBeTruthy();
    });

    it('says the balances agree when there is no difference', () => {
      m.detail = { accountDetail: { data: { amount: 127_500_000 } } };
      renderPage();
      expect(screen.getByText('Saldo bank dan Jurnal sama')).toBeTruthy();
    });

    it('starts a sync on request', async () => {
      renderPage();
      await userEvent.click(screen.getByRole('button', { name: 'Sinkronkan sekarang' }));
      expect(m.sync).toHaveBeenCalledWith('bc_1', expect.anything());
    });

    it('asks twice before disconnecting', async () => {
      renderPage();
      await userEvent.click(screen.getByRole('button', { name: 'Putuskan koneksi' }));
      expect(m.revoke).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole('button', { name: 'Ya, putuskan' }));
      expect(m.revoke).toHaveBeenCalledWith({ id: 'bc_1' }, expect.anything());
    });

    it("shows how many of the month's refreshes are used, and warns when the quota is passed", () => {
      setStatus('ACTIVE', {
        nextAction: 'NONE',
        refreshUsage: { used: 120, included: 500, extraRefreshFee: 100 },
      });
      const { unmount } = renderPage();
      expect(screen.getByText(/120 dari 500 penyegaran bulan ini/)).toBeTruthy();
      unmount();
      setStatus('ACTIVE', {
        nextAction: 'NONE',
        refreshUsage: { used: 530, included: 500, extraRefreshFee: 100 },
      });
      renderPage();
      expect(screen.getByText(/melebihi kuota/)).toBeTruthy();
    });

    it('lists the last syncs', () => {
      m.runs = {
        data: [
          {
            id: 'r1',
            startedAt: '2026-11-12T03:05:00Z',
            trigger: 'SCHEDULE',
            status: 'SUCCESS',
            added: 5,
            duplicates: 0,
          },
          {
            id: 'r2',
            startedAt: '2026-11-12T02:00:00Z',
            trigger: 'MANUAL',
            status: 'FAILED',
            added: 0,
            duplicates: 0,
            errorCode: 'SYNC-4102',
          },
        ],
      };
      renderPage();
      expect(screen.getByText('5 mutasi baru')).toBeTruthy();
      expect(screen.getByText('Gagal')).toBeTruthy();
    });

    it('does not offer a sync while the service is paused, and says so', () => {
      setStatus('SUSPENDED');
      renderPage();
      expect(screen.getByText('Layanan dijeda')).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Sinkronkan sekarang' })).toBeNull();
    });

    it('shows the failure and its code when syncing keeps failing', () => {
      setStatus('ERROR');
      m.runs = {
        data: [
          {
            id: 'r',
            startedAt: '2026-11-12T02:00:00Z',
            trigger: 'SCHEDULE',
            status: 'FAILED',
            added: 0,
            duplicates: 0,
            errorCode: 'SYNC-4102',
          },
        ],
      };
      renderPage();
      expect(screen.getByText('Belum bisa mengambil mutasi')).toBeTruthy();
      expect(screen.getByText('Kode: SYNC-4102')).toBeTruthy();
    });

    it('asks for a new connection once the permission has expired', () => {
      setStatus('EXPIRED');
      renderPage();
      expect(screen.getByText('Izin sudah habis')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Ajukan koneksi baru' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Sinkronkan sekarang' })).toBeNull();
    });
  });
});
