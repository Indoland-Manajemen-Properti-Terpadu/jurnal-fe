import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { post } from '@/lib/http/apiClient';
import { useAuthStore } from '@/store/useAuthentications';
import { useLogin } from './useLogin';

vi.mock('@/lib/http/apiClient', () => ({ post: vi.fn() }));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const navigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}));

const setTokens = vi.fn();
const setUserName = vi.fn();
vi.mock('@/store/useAuthentications', () => ({
  useAuthStore: vi.fn(() => ({ setTokens, setUserName })),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('useLogin', () => {
  beforeEach(() => {
    vi.mocked(post).mockReset();
    vi.mocked(notifications.show).mockReset();
    navigate.mockReset();
    setTokens.mockReset();
    setUserName.mockReset();
    vi.mocked(useAuthStore).mockReturnValue({ setTokens, setUserName } as never);
  });

  it('stores the tokens and name, then goes to the dashboard', async () => {
    vi.mocked(post).mockResolvedValue({
      user: { name: 'Siti' },
      tokens: { access: { token: 'a' }, refresh: { token: 'r' } },
    });
    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => result.current.mutate({ email: 'siti@indoland.id', password: 'secret1' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setTokens).toHaveBeenCalledWith('a', 'r');
    expect(setUserName).toHaveBeenCalledWith('Siti');
    expect(navigate).toHaveBeenCalledWith('/dashboard');
    expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ color: 'green' }));
  });

  it('shows access denied and stores nothing when the server answers an error', async () => {
    vi.mocked(post).mockResolvedValue({ status: 401, data: { message: 'bad' } } as never);
    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => result.current.mutate({ email: 'siti@indoland.id', password: 'wrong1' }));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(setTokens).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'red', title: 'Access Denied' })
    );
  });
});
