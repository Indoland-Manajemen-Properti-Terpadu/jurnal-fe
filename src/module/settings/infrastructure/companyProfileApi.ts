import apiClient from '@/lib/http/apiClient';
import { toApiError } from '@/lib/http/apiError';
import { BASE_URL } from '@/lib/http/endpoints';
import type { CompanyForm, CompanyProfile } from '@/module/settings/domain/companyProfile';

const PROFILE = '/v1/settings/company-profile';

type Envelope<T> = { code?: number; message?: string; data: T };

export interface CompanyProfileDto {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  npwp?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: {
    id?: string | null;
    fileName?: string | null;
    filePath?: string | null;
    mimeType?: string | null;
  } | null;
  updatedAt?: string | null;
}

/** Text fields come back as empty strings when blank; a logo with no path counts as none. */
export const toCompanyProfile = (dto: CompanyProfileDto): CompanyProfile => ({
  name: dto.name ?? '',
  address: dto.address ?? '',
  city: dto.city ?? '',
  postalCode: dto.postalCode ?? '',
  npwp: dto.npwp ?? '',
  phone: dto.phone ?? '',
  email: dto.email ?? '',
  website: dto.website ?? '',
  logo: dto.logo?.filePath
    ? {
        id: dto.logo.id ?? '',
        fileName: dto.logo.fileName ?? '',
        filePath: dto.logo.filePath,
        mimeType: dto.logo.mimeType ?? '',
      }
    : null,
  updatedAt: dto.updatedAt ?? null,
});

/** Files are returned relative to the API host (`uploads/x.png`); the page needs the full address. */
export const resolveLogoUrl = (filePath: string | null): string | null => {
  if (!filePath) return null;
  if (/^https?:\/\//.test(filePath)) return filePath;
  return `${BASE_URL.replace(/\/$/, '')}/${filePath.replace(/^\//, '')}`;
};

const call = async <T>(request: () => Promise<{ data: Envelope<T> }>): Promise<T> => {
  try {
    return (await request()).data.data;
  } catch (error) {
    throw toApiError(error);
  }
};

/** One profile per site; the service creates it on the first read, named after the site. */
export const fetchCompanyProfile = async (): Promise<CompanyProfile> =>
  toCompanyProfile(await call(() => apiClient.get<Envelope<CompanyProfileDto>>(PROFILE)));

export const saveCompanyProfile = async (body: CompanyForm): Promise<CompanyProfile> =>
  toCompanyProfile(await call(() => apiClient.put<Envelope<CompanyProfileDto>>(PROFILE, body)));

/** A new logo replaces the old one; the service reads one file in the field `logo`. */
export const uploadCompanyLogo = async (file: File): Promise<CompanyProfile> => {
  const form = new FormData();
  form.append('logo', file);
  return toCompanyProfile(
    await call(() => apiClient.post<Envelope<CompanyProfileDto>>(`${PROFILE}/logo`, form))
  );
};

export const removeCompanyLogo = async (): Promise<CompanyProfile> =>
  toCompanyProfile(
    await call(() => apiClient.put<Envelope<CompanyProfileDto>>(PROFILE, { logo: null }))
  );
