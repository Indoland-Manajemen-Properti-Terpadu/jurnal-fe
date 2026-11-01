import apiClient from '@/lib/http/apiClient';
import {
  getAccessProfile,
  getAttachmentLink,
  getFund,
  listVouchers,
} from '@/module/petty-cash/infrastructure/pettyCashApi';
import { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';

vi.mock('@/lib/http/apiClient', () => ({ default: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const httpError = (status: number, data: unknown) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    response: { status, statusText: '', data },
  });

describe('pettyCashApi', () => {
  beforeEach(() => {
    get.mockReset();
    localStorage.clear();
  });

  it('sends only filled params and maps the page', async () => {
    get.mockResolvedValue({
      data: {
        code: 200,
        message: 'ok',
        data: { results: [], page: 2, limit: 25, totalPages: 3, totalResults: 51 },
      },
    } as never);

    const page = await listVouchers({
      fundId: 'f1',
      status: ['PENDING_REIMBURSE', 'IN_REIMBURSEMENT'],
      search: '',
      from: undefined,
      page: 2,
    });

    expect(get).toHaveBeenCalledWith('/v1/petty-cash/vouchers', {
      params: { fundId: 'f1', status: 'PENDING_REIMBURSE,IN_REIMBURSEMENT', page: 2 },
      timeout: 30000,
    });
    expect(page).toEqual({ items: [], page: 2, limit: 25, totalPages: 3, totalResults: 51 });
  });

  it('rethrows a normalized error with the domain code', async () => {
    get.mockRejectedValue(
      httpError(404, {
        code: 404,
        message: 'Kas kecil tidak ditemukan',
        data: { errorCode: 'NOT_FOUND' },
        stack: 'Error at /app/src/modules/pettyCash',
      })
    );

    const failure = await getFund('missing').catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(PettyCashError);
    expect(failure).toMatchObject({ kind: 'domain', code: 'NOT_FOUND', status: 404 });
  });

  it('builds the access profile from the token subject and the permission answer', async () => {
    const payload = btoa(JSON.stringify({ sub: 'u1' })).replace(/=+$/, '');
    localStorage.setItem('accessToken', `h.${payload}.s`);
    get.mockResolvedValue({
      data: {
        role: 'user',
        permissions: [
          {
            menuId: 'JP-PC-VCH',
            name: 'Voucher',
            create: true,
            read: true,
            update: false,
            delete: false,
          },
        ],
      },
    } as never);

    await expect(getAccessProfile()).resolves.toEqual({
      userId: 'u1',
      isSuperAdmin: false,
      rights: { 'JP-PC-VCH': { create: true, read: true, update: false, delete: false } },
    });
    // users/get-id answers 403 for a user without user-management rights, so it is never called.
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('/v1/users/me/permissions', { timeout: 30000 });
  });

  it('fails as unauthorized when there is no token to read the user from', async () => {
    localStorage.removeItem('accessToken');

    await expect(getAccessProfile()).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(get).not.toHaveBeenCalled();
  });

  it('prefixes the API host to the relative signed attachment link', async () => {
    get.mockResolvedValue({
      data: {
        code: 200,
        message: 'ok',
        data: {
          url: '/v1/petty-cash/attachments/a1/file?expires=1&signature=abc',
          expiresAt: '2026-10-31T11:00:00.000Z',
        },
      },
    } as never);

    const link = await getAttachmentLink('a1');

    expect(get).toHaveBeenCalledWith('/v1/petty-cash/attachments/a1/url', { timeout: 30000 });
    expect(link.url).toMatch(
      /^https?:\/\/.+\/v1\/petty-cash\/attachments\/a1\/file\?expires=1&signature=abc$/
    );
    expect(link.expiresAt).toBe('2026-10-31T11:00:00.000Z');
  });

  it('refuses an attachment link that points away from the API host', async () => {
    get.mockResolvedValue({
      data: {
        code: 200,
        message: 'ok',
        data: { url: 'https://evil.example/file?expires=1&signature=abc', expiresAt: 'x' },
      },
    } as never);

    await expect(getAttachmentLink('a1')).rejects.toBeInstanceOf(PettyCashError);
  });
});
