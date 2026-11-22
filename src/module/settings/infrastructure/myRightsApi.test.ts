import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchMenuRights } from './myRightsApi';

const http = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchMenuRights', () => {
  it('reads the four rights of the asked menu', async () => {
    http.get.mockResolvedValue({
      data: {
        role: 'user',
        permissions: [
          { menuId: 'JP-SETT-DEPT', create: true, read: true, update: true, delete: false },
          { menuId: 'JP-GL', create: true, read: true, update: true, delete: true },
        ],
      },
    });

    expect(await fetchMenuRights('JP-SETT-DEPT')).toEqual({
      create: true,
      read: true,
      update: true,
      delete: false,
    });
  });

  it('gives nothing for a menu the role does not list', async () => {
    http.get.mockResolvedValue({ data: { role: 'user', permissions: [] } });

    expect(await fetchMenuRights('JP-SETT-DEPT')).toEqual({
      create: false,
      read: false,
      update: false,
      delete: false,
    });
  });

  it('gives a superadmin everything', async () => {
    http.get.mockResolvedValue({ data: { role: 'superadmin', permissions: [] } });

    expect(await fetchMenuRights('JP-SETT-DEPT')).toMatchObject({ create: true, delete: true });
  });
});
