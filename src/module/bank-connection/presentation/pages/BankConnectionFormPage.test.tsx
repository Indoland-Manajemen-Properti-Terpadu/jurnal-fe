import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BankConnectionFormPage from '@/module/bank-connection/presentation/pages/BankConnectionFormPage';

const m = vi.hoisted(() => ({
  mutate: vi.fn(),
  existing: {} as Record<string, unknown>,
  providers: {} as Record<string, unknown>,
  site: undefined as { name: string; code?: string } | undefined,
}));

vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/module/profile', () => ({
  useCompanySite: () => ({ site: m.site }),
}));
vi.mock('@/module/chart-of-accounts', () => ({
  useSimpleAccounts: () => ({
    accounts: [{ id: 'acc-1', name: 'Rekening Operasional', accountNumber: '1-10003' }],
  }),
}));
vi.mock('@/module/bank-connection/presentation/hooks/useBankConnectionQueries', () => ({
  useBankProviders: () => m.providers,
  useBankConnection: () => m.existing,
}));
vi.mock('@/module/bank-connection/presentation/hooks/useBankConnectionMutations', () => ({
  useSaveConnection: () => ({ mutate: m.mutate, isPending: false }),
}));

const realProviders = {
  isLoading: false,
  error: null,
  data: [
    {
      id: 'p1',
      bankName: 'Bank Contoh A',
      accountTypes: ['CORPORATE', 'INDIVIDUAL'],
      capabilities: [],
      status: 'AVAILABLE',
      requiredFields: [],
      monthlyFee: 50000,
    },
  ],
};

const renderForm = (
  url = '/bank-cash/connection/new?providerId=p1&accountId=acc-1',
  path = '/bank-cash/connection/new'
) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path={path} element={<BankConnectionFormPage />} />
        <Route path="/bank-cash/connection/:connectionId" element={<div>halaman detail</div>} />
      </Routes>
    </MemoryRouter>
  );

const fill = async (label: RegExp, value: string) => {
  const field = screen.getByRole('textbox', { name: label });
  await userEvent.clear(field);
  await userEvent.type(field, value);
};

const doc = (name: string) => new File([new Uint8Array(1024)], name, { type: 'application/pdf' });

const attachDocuments = async () => {
  await userEvent.upload(screen.getByLabelText('KTP/KITAS penanggung jawab'), doc('ktp.pdf'));
  await userEvent.upload(screen.getByLabelText('Buku tabungan'), doc('buku.pdf'));
};

const fillAll = async () => {
  await fill(/Nama pemilik rekening/, 'PT Maju Bersama');
  await fill(/ID korporasi/, 'CID-835780');
  await fill(/Nomor rekening/, '1234567890');
  await fill(/Nama penanggung jawab/, 'Budi Santoso');
  await fill(/NIK atau NIORA/, '3171234567890001');
  await attachDocuments();
};

describe('BankConnectionFormPage', () => {
  beforeEach(() => {
    m.mutate.mockReset();
    m.existing = { data: undefined, isLoading: false };
    m.providers = realProviders;
    m.site = { name: 'Demo Site', code: '991276' };
  });

  it('names the bank and the fee, and starts with the account from the link', () => {
    renderForm();
    expect(screen.getByText('Hubungkan Bank Contoh A')).toBeTruthy();
    expect(screen.getByText(/Biaya layanan .*50\.000.* per bulan/)).toBeTruthy();
    expect(screen.getAllByText(/1-10003 · Rekening Operasional/).length).toBeGreaterThan(0);
  });

  it('does not send an incomplete form and says what is missing', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: 'Kirim untuk ditinjau' }));
    expect(m.mutate).not.toHaveBeenCalled();
    expect(await screen.findByText('Lengkapi kolom yang bertanda merah.')).toBeTruthy();
    expect(screen.getAllByText('Kolom ini wajib diisi.').length).toBeGreaterThan(0);
  });

  it('explains a wrong account number and a wrong national id', async () => {
    renderForm();
    await fill(/Nomor rekening/, '12AB');
    await fill(/NIK atau NIORA/, '123');
    await userEvent.click(screen.getByRole('button', { name: 'Kirim untuk ditinjau' }));
    expect(await screen.findByText('Hanya boleh berisi angka.')).toBeTruthy();
    expect(screen.getByText('NIK terdiri dari 16 angka.')).toBeTruthy();
  });

  it('sends a complete form for review with the numbers tidied', async () => {
    renderForm();
    await fillAll();
    await userEvent.click(screen.getByRole('button', { name: 'Kirim untuk ditinjau' }));
    expect(m.mutate).toHaveBeenCalledTimes(1);
    expect(m.mutate.mock.calls[0][0]).toMatchObject({
      submit: true,
      body: {
        providerId: 'p1',
        accountId: 'acc-1',
        accountType: 'CORPORATE',
        bankAccountNumber: '1234567890',
        accountHolderName: 'PT Maju Bersama',
        corporateId: 'CID-835780',
        signatory: { name: 'Budi Santoso', nationalId: '3171234567890001' },
      },
    });
  });

  it('saves a half-finished form as a draft without sending it', async () => {
    renderForm();
    await fill(/Nama pemilik rekening/, 'PT Maju');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan draf' }));
    expect(m.mutate.mock.calls[0][0]).toMatchObject({
      submit: false,
      body: { providerId: 'p1', accountId: 'acc-1', accountHolderName: 'PT Maju' },
    });
    expect(m.mutate.mock.calls[0][0].body).not.toHaveProperty('bankAccountNumber');
  });

  it('hides the corporate id for an individual account', async () => {
    renderForm();
    expect(screen.getByRole('textbox', { name: /ID korporasi/ })).toBeTruthy();
    await userEvent.click(screen.getByRole('textbox', { name: 'Tipe rekening' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Perorangan', hidden: true }));
    expect(screen.queryByRole('textbox', { name: /ID korporasi/ })).toBeNull();
  });

  it('shows the reason a server error gives, in plain words, and keeps the form', async () => {
    m.mutate.mockImplementation((_input, options) =>
      options.onError({
        kind: 'conflict',
        code: 'ACCOUNT_ALREADY_CONNECTED',
        fieldErrors: undefined,
      })
    );
    renderForm();
    await fillAll();
    await userEvent.click(screen.getByRole('button', { name: 'Kirim untuk ditinjau' }));
    expect(await screen.findByText('Akun ini sudah memiliki koneksi bank.')).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /Nomor rekening/ })).toBeTruthy();
  });

  it('marks the fields a server answer rejects', async () => {
    m.mutate.mockImplementation((_input, options) =>
      options.onError({ kind: 'validation', fieldErrors: { bankAccountNumber: 'bad' } })
    );
    renderForm();
    await fillAll();
    await userEvent.click(screen.getByRole('button', { name: 'Kirim untuk ditinjau' }));
    expect(await screen.findByText('Periksa kembali isian ini.')).toBeTruthy();
  });

  it('on a request sent back, prefills the safe fields, asks again for the sensitive ones and offers "send again"', () => {
    m.existing = {
      isLoading: false,
      data: {
        id: 'bc_1',
        providerId: 'p1',
        accountId: 'acc-1',
        accountType: 'CORPORATE',
        status: 'NEEDS_REVISION',
        accountHolderName: 'PT Lama',
        signatoryName: 'Budi',
        accountNumberMasked: '••••7890',
        bankName: 'Bank Contoh A',
        nextAction: 'FIX_FORM',
      },
    };
    renderForm('/bank-cash/connection/bc_1/edit', '/bank-cash/connection/:connectionId/edit');
    expect(
      (screen.getByRole('textbox', { name: /Nama pemilik rekening/ }) as HTMLInputElement).value
    ).toBe('PT Lama');
    expect(
      (screen.getByRole('textbox', { name: /Nomor rekening/ }) as HTMLInputElement).value
    ).toBe('');
    expect(screen.getByText(/tidak ditampilkan lagi/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Kirim ulang' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Simpan draf' })).toBeNull();
  });

  it('refuses to edit a request that has already gone to the bank', () => {
    m.existing = {
      isLoading: false,
      data: {
        id: 'bc_1',
        providerId: 'p1',
        accountId: 'a',
        status: 'IN_REVIEW',
        accountType: 'CORPORATE',
      },
    };
    renderForm('/bank-cash/connection/bc_1/edit', '/bank-cash/connection/:connectionId/edit');
    expect(screen.getByText(/sudah dikirim dan tidak bisa diubah/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Kirim untuk ditinjau' })).toBeNull();
  });

  it('while the backend has no bank list, opens the form for a bank that has a logo', () => {
    m.providers = { data: undefined, isLoading: false, error: { kind: 'unavailable' } };
    renderForm('/bank-cash/connection/new?providerId=014&accountId=acc-1');
    expect(screen.getByText('Hubungkan BCA')).toBeTruthy();
    expect(screen.getByText(/Biaya layanan/)).toBeTruthy();
  });

  it('asks for both documents before a request is sent, and says so per document', async () => {
    renderForm();
    await fill(/Nama pemilik rekening/, 'PT Maju Bersama');
    await fill(/ID korporasi/, 'CID-835780');
    await fill(/Nomor rekening/, '1234567890');
    await fill(/Nama penanggung jawab/, 'Budi Santoso');
    await fill(/NIK atau NIORA/, '3171234567890001');
    await userEvent.click(screen.getByRole('button', { name: 'Kirim untuk ditinjau' }));
    expect(m.mutate).not.toHaveBeenCalled();
    expect(await screen.findAllByText('Lampirkan dokumen ini.')).toHaveLength(2);
  });

  it('sends the chosen documents with the request', async () => {
    renderForm();
    await fillAll();
    await userEvent.click(screen.getByRole('button', { name: 'Kirim untuk ditinjau' }));
    const { documents } = m.mutate.mock.calls[0][0];
    expect(documents.IDENTITY.name).toBe('ktp.pdf');
    expect(documents.ACCOUNT_PROOF.name).toBe('buku.pdf');
  });

  it('does not ask again for a document the backend already holds when a request is sent back', () => {
    m.existing = {
      isLoading: false,
      data: {
        id: 'bc_1',
        providerId: 'p1',
        accountId: 'acc-1',
        accountType: 'CORPORATE',
        status: 'NEEDS_REVISION',
        accountNumberMasked: '••••7890',
        bankName: 'Bank Contoh A',
        nextAction: 'FIX_FORM',
        documents: [{ type: 'IDENTITY', fileName: 'ktp-lama.pdf' }],
      },
    };
    renderForm('/bank-cash/connection/bc_1/edit', '/bank-cash/connection/:connectionId/edit');
    expect(screen.getByText('Terlampir: ktp-lama.pdf')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Lampirkan buku tabungan' })).toBeTruthy();
  });

  it('after a failed upload, retries on the request it already saved instead of creating another', async () => {
    m.mutate.mockImplementationOnce((_input, options) =>
      options.onError({ kind: 'refused', savedId: 'bc_9' })
    );
    renderForm();
    await fillAll();
    await userEvent.click(screen.getByRole('button', { name: 'Kirim untuk ditinjau' }));
    await userEvent.click(screen.getByRole('button', { name: 'Kirim untuk ditinjau' }));
    expect(m.mutate.mock.calls[0][0].id).toBeUndefined();
    expect(m.mutate.mock.calls[1][0].id).toBe('bc_9');
  });

  it('names the company under the bank: the site and its id', () => {
    renderForm();
    expect((screen.getByRole('textbox', { name: 'Perusahaan' }) as HTMLInputElement).value).toBe(
      'Demo Site · ID 991276'
    );
  });

  it('leaves out the company line when the user has no site', () => {
    m.site = undefined;
    renderForm();
    expect(screen.queryByRole('textbox', { name: 'Perusahaan' })).toBeNull();
  });

  it('writes the bank by its full name from the bank master when it has a code', () => {
    m.providers = { data: undefined, isLoading: false, error: { kind: 'unavailable' } };
    renderForm('/bank-cash/connection/new?providerId=014&accountId=acc-1');
    expect((screen.getByRole('textbox', { name: 'Bank' }) as HTMLInputElement).value).toBe(
      'Bank Central Asia (BCA)'
    );
  });

  it('opens an example of each document', async () => {
    renderForm();
    const links = screen.getAllByRole('button', { name: 'Lihat contoh' });
    expect(links).toHaveLength(2);
    await userEvent.click(links[0]);
    expect(await screen.findByText('Contoh KTP/KITAS')).toBeTruthy();
  });

  it('for BCA corporate, states the fee rule with the quota and opens the full explanation', async () => {
    m.providers = { data: undefined, isLoading: false, error: { kind: 'unavailable' } };
    renderForm('/bank-cash/connection/new?providerId=014&accountId=acc-1');
    expect(screen.getByText(/Biaya layanan .*50\.000.* per bulan/)).toBeTruthy();
    expect(screen.getByText(/500 kali penyegaran/)).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Info lengkap' }));
    expect(await screen.findByText('Biaya layanan koneksi bank')).toBeTruthy();
    expect(screen.getByText(/auto-debit oleh bank/)).toBeTruthy();
  });

  it('shows no fee rule for BCA individual, nor for a bank without one', async () => {
    m.providers = { data: undefined, isLoading: false, error: { kind: 'unavailable' } };
    renderForm('/bank-cash/connection/new?providerId=014&accountId=acc-1');
    await userEvent.click(screen.getByRole('textbox', { name: 'Tipe rekening' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Perorangan', hidden: true }));
    expect(screen.queryByText(/Biaya layanan/)).toBeNull();
  });
});
