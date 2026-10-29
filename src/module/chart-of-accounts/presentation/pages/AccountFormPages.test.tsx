import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, userEvent, waitFor } from '@test-utils';
import AddAccountPage from './AddAccountPage';
import EditAccountPage from './EditAccountPage';

const addMutate = vi.fn();
const updateMutate = vi.fn();
let detail: Record<string, unknown> | undefined;

vi.mock('@/components/AppShellLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/module/SettingMenu/UserManagement/User/service/User.service', () => ({
  useGetAllUser: () => ({ data: { results: [] }, isLoading: false }),
}));
vi.mock('@/module/SettingMenu/UserManagement/Role/Service/Role.service', () => ({
  GetRoles: () => ({ data: [], isLoading: false }),
}));
vi.mock('../hooks/useCategoryAccounts', () => ({
  GetCategoryAccount: () => ({
    data: [
      { id: 'c-kb', categoryID: 'KB', name: 'Kas & Bank', isDebit: true },
      { id: 'c-pen', categoryID: 'PEN', name: 'Pendapatan', isDebit: false },
    ],
    isLoading: false,
  }),
}));
vi.mock('../hooks/useCategoryInfo', () => ({
  useGetCategoryInfo: (id?: string) => ({
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
  useDetailAccount: () => ({ accountDetail: detail, isLoading: false, isError: false }),
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

  it('a preset sets category, suggested code, cash/bank flag and submits the payload', async () => {
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
      isBankAndCash: true,
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
    expect(screen.getByText('Struktur & Hierarki Akun')).toBeInTheDocument();
    expect(screen.queryByText(/Akun Berstatus Terkunci/)).not.toBeInTheDocument();
  });

  it('locks the category select and hides the hierarchy card when the account is locked (I7)', async () => {
    detail = { ...detail, isLocked: true };
    renderEdit();
    await screen.findByDisplayValue('Kas Kecil');
    expect(screen.getByText(/Akun Berstatus Terkunci/)).toBeInTheDocument();
    expect(screen.queryByText('Struktur & Hierarki Akun')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Kategori Akun/ })).toBeDisabled();
  });
});
