import apiClient from '@/lib/http/apiClient';
import { BASE_URL } from '@/lib/http/endpoints';
import type {
  CashBook,
  Page,
  PettyCashFund,
  PettyCashLookups,
  PettyCashVoucherRecord,
} from '@/module/petty-cash/domain/pettyCashEntities';
import type { PettyCashAccessProfile } from '@/module/petty-cash/domain/pettyCashAccess';
import type { FundStatus, VoucherStatus } from '@/module/petty-cash/domain/pettyCashStatus';
import type {
  ApiEnvelope,
  CashBookDto,
  FundDto,
  LookupsDto,
  MyPermissionsDto,
  PageDto,
  VoucherDto,
} from '@/module/petty-cash/infrastructure/pettyCashDto';
import { readUserIdFromToken } from '@/module/petty-cash/infrastructure/accessToken';
import { PETTY_CASH_API } from '@/module/petty-cash/infrastructure/pettyCashEndpoints';
import {
  PettyCashError,
  toPettyCashError,
} from '@/module/petty-cash/infrastructure/pettyCashErrors';
import {
  toAccessProfile,
  toCashBook,
  toFund,
  toLookups,
  toPage,
  toVoucher,
} from '@/module/petty-cash/infrastructure/pettyCashMappers';
import { cleanParams } from '@/module/petty-cash/infrastructure/queryParams';

export interface PageParams {
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface FundListParams extends PageParams {
  status?: FundStatus;
  search?: string;
}

export interface VoucherListParams extends PageParams {
  fundId?: string;
  status?: VoucherStatus[];
  from?: string;
  to?: string;
  search?: string;
}

export interface CashBookParams extends PageParams {
  from?: string;
  to?: string;
}

/** Every call rethrows a normalized `PettyCashError`; callers never see the raw Axios error. */
const request = async <T>(call: () => Promise<{ data: T }>): Promise<T> => {
  try {
    const { data } = await call();
    return data;
  } catch (error) {
    throw toPettyCashError(error);
  }
};

export const listFunds = async (params: FundListParams = {}): Promise<Page<PettyCashFund>> => {
  const body = await request(() =>
    apiClient.get<ApiEnvelope<PageDto<FundDto>>>(PETTY_CASH_API.funds, {
      params: cleanParams({ ...params }),
    })
  );
  return toPage(body.data, toFund);
};

export const getFund = async (fundId: string): Promise<PettyCashFund> => {
  const body = await request(() =>
    apiClient.get<ApiEnvelope<FundDto>>(PETTY_CASH_API.fund(fundId))
  );
  return toFund(body.data);
};

export const getCashBook = async (
  fundId: string,
  params: CashBookParams = {}
): Promise<CashBook> => {
  const body = await request(() =>
    apiClient.get<ApiEnvelope<CashBookDto>>(PETTY_CASH_API.cashBook(fundId), {
      params: cleanParams({ ...params }),
    })
  );
  return toCashBook(body.data);
};

export const getLookups = async (): Promise<PettyCashLookups> => {
  const body = await request(() => apiClient.get<ApiEnvelope<LookupsDto>>(PETTY_CASH_API.lookups));
  return toLookups(body.data);
};

export const listVouchers = async (
  params: VoucherListParams = {}
): Promise<Page<PettyCashVoucherRecord>> => {
  const body = await request(() =>
    apiClient.get<ApiEnvelope<PageDto<VoucherDto>>>(PETTY_CASH_API.vouchers, {
      params: cleanParams({ ...params }),
    })
  );
  return toPage(body.data, toVoucher);
};

export const getVoucher = async (voucherId: string): Promise<PettyCashVoucherRecord> => {
  const body = await request(() =>
    apiClient.get<ApiEnvelope<VoucherDto>>(PETTY_CASH_API.voucher(voucherId))
  );
  return toVoucher(body.data);
};

/**
 * A receipt is opened through a signed link that is valid for 10 minutes and needs no bearer token.
 * The backend answers a path relative to the API host, so the base URL is added here.
 */
export const getAttachmentLink = async (
  attachmentId: string
): Promise<{ url: string; expiresAt: string }> => {
  const body = await request(() =>
    apiClient.get<ApiEnvelope<{ url: string; expiresAt: string }>>(
      PETTY_CASH_API.attachmentUrl(attachmentId)
    )
  );
  const { url, expiresAt } = body.data;
  // The link is opened without a bearer token, so it must stay on the API host.
  const link = new URL(url, BASE_URL);
  if (link.origin !== new URL(BASE_URL).origin) throw new PettyCashError({ kind: 'unknown' });
  return { url: link.toString(), expiresAt };
};

/** `me/permissions` answers without the `{ code, message, data }` envelope. */
export const getAccessProfile = async (): Promise<PettyCashAccessProfile> => {
  const userId = readUserIdFromToken(localStorage.getItem('accessToken'));
  const permissions = await request(() =>
    apiClient.get<MyPermissionsDto>(PETTY_CASH_API.myPermissions)
  );
  return toAccessProfile(userId, permissions);
};
