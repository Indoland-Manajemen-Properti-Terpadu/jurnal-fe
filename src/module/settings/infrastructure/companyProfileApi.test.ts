import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchCompanyProfile,
  removeCompanyLogo,
  resolveLogoUrl,
  saveCompanyProfile,
  toCompanyProfile,
  uploadCompanyLogo,
} from './companyProfileApi';

const http = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), post: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));
vi.mock('@/lib/http/endpoints', () => ({ BASE_URL: 'https://api.example.test/' }));

const dto = {
  name: 'PT Indoland',
  address: 'Jl. Sudirman',
  city: 'Jakarta',
  postalCode: '12190',
  npwp: '01.234',
  phone: '021',
  email: 'a@b.co',
  website: 'www.b.co',
  logo: { id: 'l1', fileName: 'logo.png', filePath: 'uploads/logo.png', mimeType: 'image/png' },
  updatedAt: '2026-11-24T08:30:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('toCompanyProfile', () => {
  it('reads every field and the logo', () => {
    expect(toCompanyProfile(dto)).toEqual({
      ...dto,
      logo: { id: 'l1', fileName: 'logo.png', filePath: 'uploads/logo.png', mimeType: 'image/png' },
    });
  });

  it('turns missing text into empty text and a logo without a path into no logo', () => {
    const profile = toCompanyProfile({ name: 'Demo Site', logo: { id: 'x', filePath: null } });

    expect(profile.address).toBe('');
    expect(profile.email).toBe('');
    expect(profile.logo).toBeNull();
    expect(profile.updatedAt).toBeNull();
  });
});

describe('resolveLogoUrl', () => {
  it('puts the API host in front of a relative path, once', () => {
    expect(resolveLogoUrl('uploads/logo.png')).toBe('https://api.example.test/uploads/logo.png');
    expect(resolveLogoUrl('/uploads/logo.png')).toBe('https://api.example.test/uploads/logo.png');
  });

  it('keeps a full address and answers null for none', () => {
    expect(resolveLogoUrl('https://cdn.test/a.png')).toBe('https://cdn.test/a.png');
    expect(resolveLogoUrl(null)).toBeNull();
  });
});

describe('the calls', () => {
  it('reads the profile', async () => {
    http.get.mockResolvedValue({ data: { data: dto } });

    const profile = await fetchCompanyProfile();

    expect(http.get).toHaveBeenCalledWith('/v1/settings/company-profile');
    expect(profile.name).toBe('PT Indoland');
  });

  it('saves the text fields with PUT', async () => {
    http.put.mockResolvedValue({ data: { data: dto } });
    const fields = {
      name: dto.name,
      address: dto.address,
      city: dto.city,
      postalCode: dto.postalCode,
      npwp: dto.npwp,
      phone: dto.phone,
      email: dto.email,
      website: dto.website,
    };

    await saveCompanyProfile(fields);

    expect(http.put).toHaveBeenCalledWith('/v1/settings/company-profile', fields);
  });

  it('sends a new logo as multipart in the field `logo`', async () => {
    http.post.mockResolvedValue({ data: { data: dto } });
    const file = new File(['x'], 'logo.png', { type: 'image/png' });

    await uploadCompanyLogo(file);

    const [url, form] = http.post.mock.calls[0];
    expect(url).toBe('/v1/settings/company-profile/logo');
    expect((form as FormData).get('logo')).toBe(file);
  });

  it('removes the logo by saving `logo: null`', async () => {
    http.put.mockResolvedValue({ data: { data: { ...dto, logo: null } } });

    const profile = await removeCompanyLogo();

    expect(http.put).toHaveBeenCalledWith('/v1/settings/company-profile', { logo: null });
    expect(profile.logo).toBeNull();
  });
});
