import { BASE_URL } from '@/lib/http/endpoints';
import type {
  CashBook,
  Page,
  PettyCashFund,
  PettyCashLookups,
  PettyCashVoucherRecord,
} from '@/module/petty-cash/domain/pettyCashEntities';
import type { VoucherInput } from '@/module/petty-cash/domain/voucherForm';
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
import { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';
import { http } from '@/module/petty-cash/infrastructure/pettyCashHttp';
import {
  toAccessProfile,
  toCashBook,
  toFund,
  toLookups,
  toPage,
  toVoucher,
} from '@/module/petty-cash/infrastructure/pettyCashMappers';

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

export const listFunds = async (params: FundListParams = {}): Promise<Page<PettyCashFund>> => {
  const body = await http.get<ApiEnvelope<PageDto<FundDto>>>(PETTY_CASH_API.funds, { ...params });
  return toPage(body.data, toFund);
};

export const getFund = async (fundId: string): Promise<PettyCashFund> => {
  const body = await http.get<ApiEnvelope<FundDto>>(PETTY_CASH_API.fund(fundId));
  return toFund(body.data);
};

export const getCashBook = async (
  fundId: string,
  params: CashBookParams = {}
): Promise<CashBook> => {
  const body = await http.get<ApiEnvelope<CashBookDto>>(PETTY_CASH_API.cashBook(fundId), {
    ...params,
  });
  return toCashBook(body.data);
};

export const getLookups = async (): Promise<PettyCashLookups> => {
  const body = await http.get<ApiEnvelope<LookupsDto>>(PETTY_CASH_API.lookups);
  return toLookups(body.data);
};

export const listVouchers = async (
  params: VoucherListParams = {}
): Promise<Page<PettyCashVoucherRecord>> => {
  const body = await http.get<ApiEnvelope<PageDto<VoucherDto>>>(PETTY_CASH_API.vouchers, {
    ...params,
  });
  return toPage(body.data, toVoucher);
};

export const getVoucher = async (voucherId: string): Promise<PettyCashVoucherRecord> => {
  const body = await http.get<ApiEnvelope<VoucherDto>>(PETTY_CASH_API.voucher(voucherId));
  return toVoucher(body.data);
};

/**
 * A receipt is opened through a signed link that is valid for 10 minutes and needs no bearer token.
 * The backend answers a path relative to the API host, so the base URL is added here.
 */
export const getAttachmentLink = async (
  attachmentId: string
): Promise<{ url: string; expiresAt: string }> => {
  const body = await http.get<ApiEnvelope<{ url: string; expiresAt: string }>>(
    PETTY_CASH_API.attachmentUrl(attachmentId)
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
  const permissions = await http.get<MyPermissionsDto>(PETTY_CASH_API.myPermissions);
  return toAccessProfile(userId, permissions);
};

const voucherFrom = (body: ApiEnvelope<VoucherDto>) => toVoucher(body.data);

/**
 * Create is JSON, or multipart when receipts travel with it (`lines` is then a JSON string and
 * `submit` the text "true"/"false"). `submit: true` sends the voucher straight into approval or,
 * below the fund's approval threshold, into the waiting-for-replenishment state.
 */
export const createVoucher = async (
  params: { fundId: string; input: VoucherInput; submit: boolean; files?: File[] },
  idempotencyKey: string
): Promise<PettyCashVoucherRecord> => {
  const { fundId, input, submit, files = [] } = params;

  if (files.length === 0) {
    const body = await http.post<ApiEnvelope<VoucherDto>>(
      PETTY_CASH_API.vouchers,
      { fundId, ...input, submit },
      { idempotencyKey }
    );
    return voucherFrom(body);
  }

  const form = new FormData();
  form.append('fundId', fundId);
  form.append('date', input.date);
  form.append('beneficiary', input.beneficiary);
  (['receiptNumber', 'description', 'taxInvoiceNumber', 'vendorTaxId'] as const).forEach(
    (field) => {
      const value = input[field];
      if (value !== undefined) form.append(field, value);
    }
  );
  form.append('lines', JSON.stringify(input.lines));
  form.append('submit', submit ? 'true' : 'false');
  files.forEach((file) => form.append('attachments', file));

  const body = await http.post<ApiEnvelope<VoucherDto>>(PETTY_CASH_API.vouchers, form, {
    idempotencyKey,
    upload: true,
  });
  return voucherFrom(body);
};

/** Update replaces the whole voucher (draft or rejected only); a rejected one returns to draft. */
export const updateVoucher = async (
  voucherId: string,
  input: VoucherInput
): Promise<PettyCashVoucherRecord> => {
  const body = await http.patch<ApiEnvelope<VoucherDto>>(PETTY_CASH_API.voucher(voucherId), {
    ...input,
    submit: false,
  });
  return voucherFrom(body);
};

export const submitVoucher = async (voucherId: string, idempotencyKey: string) =>
  voucherFrom(
    await http.post<ApiEnvelope<VoucherDto>>(
      PETTY_CASH_API.voucherAction(voucherId, 'submit'),
      undefined,
      { idempotencyKey }
    )
  );

export const approveVoucher = async (voucherId: string, idempotencyKey: string) =>
  voucherFrom(
    await http.post<ApiEnvelope<VoucherDto>>(
      PETTY_CASH_API.voucherAction(voucherId, 'approve'),
      undefined,
      { idempotencyKey }
    )
  );

const decideWithReason = async (
  voucherId: string,
  action: 'reject' | 'void',
  reason: string,
  idempotencyKey: string
) =>
  voucherFrom(
    await http.post<ApiEnvelope<VoucherDto>>(
      PETTY_CASH_API.voucherAction(voucherId, action),
      { reason: reason.trim() },
      { idempotencyKey }
    )
  );

export const rejectVoucher = (voucherId: string, reason: string, idempotencyKey: string) =>
  decideWithReason(voucherId, 'reject', reason, idempotencyKey);

export const voidVoucher = (voucherId: string, reason: string, idempotencyKey: string) =>
  decideWithReason(voucherId, 'void', reason, idempotencyKey);

export const uploadVoucherAttachments = async (voucherId: string, files: File[]) => {
  const form = new FormData();
  files.forEach((file) => form.append('attachments', file));
  return voucherFrom(
    await http.post<ApiEnvelope<VoucherDto>>(PETTY_CASH_API.voucherAttachments(voucherId), form, {
      upload: true,
    })
  );
};

export const deleteVoucherAttachment = async (voucherId: string, attachmentId: string) =>
  voucherFrom(
    await http.delete<ApiEnvelope<VoucherDto>>(
      PETTY_CASH_API.voucherAttachment(voucherId, attachmentId)
    )
  );
