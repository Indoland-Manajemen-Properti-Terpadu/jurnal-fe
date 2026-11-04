import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, userEvent, waitFor } from '@test-utils';
import AddAccountPage from './AddAccountPage';
import EditAccountPage from './EditAccountPage';

const addMutate = vi.fn();
const updateMutate = vi.fn();
let detail: Record<string, unknown> | undefined;
let detailError = false;

vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/module/user-management', () => ({
  useUsers: () => ({ data: { results: [] }, isLoading: false }),
  useRoles: () => ({ data: [], isLoading: false }),
}));
vi.mock('../hooks/useCategoryAccounts', () => ({
  useCategoryAccounts: () => ({
    data: [
      { id: 'c-kb', categoryID: 'KB', name: 'Kas & Bank', isDebit: true },
      { id: 'c-pen', categoryID: 'PEN', name: 'Pendapatan', isDebit: false },
    ],
    isLoading: false,
  }),
}));
vi.mock('../hooks/useCategoryInfo', () => ({
  useCategoryInfo: (id?: string) => ({
    data: id
      ? {
          suggestedAccountNumber: '1-10001',
          possibleHeadAccounts: [{ id: 'h1', accountNumber: '1-1000', name: 'Induk' }],
          possibleSubAccounts: [],
        }
      : undefined,
  }),
}));
vi.mock('../hooks/useAddAccount', () => ({
  useAddAccount: () => ({ mutate: addMutate, isPending: false }),
}));
vi.mock('../hooks/useUpdateAccount', () => ({
  useUpdateAccount: () => ({ mutate: updateMutate, isPending: false }),
}));
vi.mock('../hooks/useDetailAccount', () => ({
  useDetailAccount: () => ({ accountDetail: detail, isLoading: false, isError: detailError }),
}));

const renderAdd = () =>
  render(
    <MemoryRouter>
      <AddAccountPage />
    </MemoryRouter>
  );

const renderEdit = () =>
  render(
    <MemoryRouter initialEntries={['/edit/acc-1']}>
      <Routes>
        <Route path="/edit/:idAccount" element={<EditAccountPage />} />
      </Routes>
    </MemoryRouter>
  );

const saveButton = (name: RegExp) => screen.getByRole('button', { name });

describe('AddAccountPage rules (characterization: I6)', () => {
  beforeEach(() => addMutate.mockClear());

  it('starts with the save button disabled', () => {
    renderAdd();
    expect(saveButton(/simpan/i)).toBeDisabled();
  });

  it('a preset sets category and code without sending the cash/bank flag', async () => {
    const user = userEvent.setup();
    renderAdd();
    await user.click(screen.getByRole('button', { name: /bank/i }));
    await waitFor(() => expect(saveButton(/simpan/i)).toBeEnabled());
    expect(screen.getByDisplayValue('1-10001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bank Operasional')).toBeInTheDocument();
    await user.click(saveButton(/simpan/i));
    expect(addMutate).toHaveBeenCalledWith({
      name: 'Bank Operasional',
      accountNumber: '1-10001',
      category: 'c-kb',
      taxType: undefined,
      isContra: false,
      desc: undefined,
      isAllUser: true,
    });
  });

  it('keeps save disabled when the name has fewer than 3 characters', async () => {
    const user = userEvent.setup();
    renderAdd();
    await user.click(screen.getByRole('button', { name: /bank/i }));
    const name = await screen.findByDisplayValue('Bank Operasional');
    await user.clear(name);
    await user.type(name, 'ab');
    expect(saveButton(/simpan/i)).toBeDisabled();
    await user.type(name, 'c');
    expect(saveButton(/simpan/i)).toBeEnabled();
  });

  it('requires a head account for a Sub account', async () => {
    const user = userEvent.setup();
    renderAdd();
    await user.click(screen.getByRole('button', { name: /bank/i }));
    await waitFor(() => expect(saveButton(/simpan/i)).toBeEnabled());
    await user.click(screen.getByText(/^Sub Akun \(Turunan\)$/));
    expect(saveButton(/simpan/i)).toBeDisabled();
  });
});

describe('EditAccountPage rules (characterization: I6, I7)', () => {
  beforeEach(() => {
    updateMutate.mockClear();
    detailError = false;
    detail = {
      name: 'Kas Kecil',
      accountNumber: '1-10002',
      category: { id: 'c-kb' },
      isBankAndCash: true,
      isContra: false,
      isAllUser: true,
      isLocked: false,
    };
  });

  it('loads the account, enables save and submits the mapped payload', async () => {
    const user = userEvent.setup();
    renderEdit();
    await waitFor(() => expect(saveButton(/simpan perubahan/i)).toBeEnabled());
    await user.click(saveButton(/simpan perubahan/i));
    expect(updateMutate).toHaveBeenCalledWith({
      name: 'Kas Kecil',
      accountNumber: '1-10002',
      category: 'c-kb',
      taxType: undefined,
      isBankAndCash: true,
      isContra: false,
      desc: undefined,
      isAllUser: true,
    });
  });

  it('accepts a one-character name on edit (the 3-character rule is create only)', async () => {
    const user = userEvent.setup();
    renderEdit();
    const name = await screen.findByDisplayValue('Kas Kecil');
    await user.clear(name);
    await user.type(name, 'K');
    expect(saveButton(/simpan perubahan/i)).toBeEnabled();
    await user.clear(name);
    expect(saveButton(/simpan perubahan/i)).toBeDisabled();
  });

  it('shows the hierarchy card and an enabled category when the account is unlocked', async () => {
    renderEdit();
    await screen.findByDisplayValue('Kas Kecil');
    expect(screen.getByText('Struktur & Hierarki Bagan Akun')).toBeInTheDocument();
    expect(screen.queryByText(/Akun Berstatus Terkunci/)).not.toBeInTheDocument();
  });

  it('makes a locked account read-only: no save, no checklist, every field disabled (I7)', async () => {
    detail = { ...detail, isLocked: true };
    renderEdit();
    const name = await screen.findByDisplayValue('Kas Kecil');
    expect(screen.getByText(/Akun Berstatus Terkunci/)).toBeInTheDocument();
    expect(name).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /Kategori Akun/ })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /simpan perubahan/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Checklist Kesiapan Akun')).not.toBeInTheDocument();
    expect(updateMutate).not.toHaveBeenCalled();
  });

  it('shows the not found page instead of an empty form when the account fails to load', () => {
    detailError = true;
    detail = undefined;
    renderEdit();
    expect(screen.getByText('Something is not right...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /simpan perubahan/i })).not.toBeInTheDocument();
  });
});

describe('EditAccountPage hierarchy (from the detail response)', () => {
  beforeEach(() => {
    updateMutate.mockClear();
    detailError = false;
    detail = {
      name: 'Kas Kecil',
      accountNumber: '1-10002',
      category: { id: 'c-kb' },
      isBankAndCash: true,
      isContra: false,
      isAllUser: true,
      isLocked: false,
      level: 'master',
      subAccount: [],
    };
  });

  it('opens a Sub account as Sub with its parent from headerAccount and keeps the link on save', async () => {
    detail = {
      ...detail,
      level: 'sub',
      headerAccount: { id: 'h-locked', name: 'Induk Terkunci', accountNumber: '1-1000' },
    };
    const user = userEvent.setup();
    renderEdit();
    // The category info omits a locked parent, so it must come from the detail.
    expect(await screen.findByDisplayValue('[1-1000] Induk Terkunci')).toBeInTheDocument();
    await user.click(saveButton(/simpan perubahan/i));
    expect(updateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ headAccountId: 'h-locked', isAllUser: true })
    );
  });

  it('opens an account that has children as a Header account', async () => {
    detail = { ...detail, subAccount: [{ id: 's1' }] };
    const user = userEvent.setup();
    renderEdit();
    await screen.findByDisplayValue('Kas Kecil');
    await user.click(saveButton(/simpan perubahan/i));
    const payload = updateMutate.mock.calls[0][0];
    expect(payload.isAllUser).toBe(true);
    expect(payload).not.toHaveProperty('headAccountId');
    expect(screen.getByText(/Hubungkan Sub Akun Terkait/)).toBeInTheDocument();
  });
});

describe('Add and edit pages share one layout', () => {
  it('edit shows the readiness checklist like add, and no creation presets', async () => {
    detail = {
      name: 'Kas Kecil',
      accountNumber: '1-10002',
      category: { id: 'c-kb' },
      isAllUser: true,
      level: 'master',
      subAccount: [],
    };
    renderEdit();
    await screen.findByDisplayValue('Kas Kecil');
    expect(screen.getByText('Checklist Kesiapan Akun')).toBeInTheDocument();
    expect(screen.getByText('Nama akun telah diisi')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /bank/i })).not.toBeInTheDocument();
  });
});
