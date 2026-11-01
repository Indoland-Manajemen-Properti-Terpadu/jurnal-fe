import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import apiClient from '@/lib/http/apiClient';
import { useAuthStore } from '@/store/useAuthentications';
import { useLogin } from './useLogin';

vi.mock('@/lib/http/apiClient', () => ({ default: { post: vi.fn() } }));

const post = vi.mocked(apiClient.post);
/** What the shared client rejects with on an HTTP error (axios.isAxiosError looks at this flag). */
const httpError = (status: number, data: unknown) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    response: { status, statusText: '', data },
  });
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
    post.mockReset();
    vi.mocked(notifications.show).mockReset();
    navigate.mockReset();
    setTokens.mockReset();
    setUserName.mockReset();
    vi.mocked(useAuthStore).mockReturnValue({ setTokens, setUserName } as never);
  });

  it('stores the tokens and name, then goes to the dashboard', async () => {
    post.mockResolvedValue({
      data: {
        user: { name: 'Siti' },
        tokens: { access: { token: 'a' }, refresh: { token: 'r' } },
      },
    } as never);
    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => result.current.mutate({ email: 'siti@indoland.id', password: 'secret1' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setTokens).toHaveBeenCalledWith('a', 'r');
    expect(setUserName).toHaveBeenCalledWith('Siti');
    expect(navigate).toHaveBeenCalledWith('/dashboard');
    expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ color: 'green' }));
  });

  it('shows access denied and stores nothing when the server rejects the login', async () => {
    post.mockRejectedValue(httpError(401, { message: 'bad' }));
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
