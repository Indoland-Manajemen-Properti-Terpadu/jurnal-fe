import type {
  AdvanceRecord,
  AdvanceStatusInfo,
  Page,
} from '@/module/petty-cash/domain/pettyCashEntities';
import type { SettlementInput } from '@/module/petty-cash/domain/advance';
import type { AdvanceStatus } from '@/module/petty-cash/domain/pettyCashStatus';
import type {
  AdvanceDto,
  AdvanceStatusDto,
  ApiEnvelope,
  PageDto,
} from '@/module/petty-cash/infrastructure/pettyCashDto';
import { PETTY_CASH_API } from '@/module/petty-cash/infrastructure/pettyCashEndpoints';
import { http } from '@/module/petty-cash/infrastructure/pettyCashHttp';
import {
  toAdvance,
  toAdvanceStatus,
  toPage,
} from '@/module/petty-cash/infrastructure/pettyCashMappers';
import type { PageParams } from '@/module/petty-cash/infrastructure/pettyCashApi';

export interface AdvanceListParams extends PageParams {
  fundId?: string;
  requesterId?: string;
  status?: AdvanceStatus[];
  overdue?: boolean;
  from?: string;
  to?: string;
  search?: string;
}

const advanceFrom = (body: ApiEnvelope<AdvanceDto>) => toAdvance(body.data);
const statusFrom = (body: ApiEnvelope<AdvanceStatusDto>) => toAdvanceStatus(body.data);

export const listAdvances = async (
  params: AdvanceListParams = {}
): Promise<Page<AdvanceRecord>> => {
  const body = await http.get<ApiEnvelope<PageDto<AdvanceDto>>>(PETTY_CASH_API.advances, {
    ...params,
  });
  return toPage(body.data, toAdvance);
};

export const getAdvance = async (advanceId: string): Promise<AdvanceRecord> =>
  advanceFrom(await http.get<ApiEnvelope<AdvanceDto>>(PETTY_CASH_API.advance(advanceId)));

export const createAdvance = async (
  input: { fundId: string; amount: number; purpose: string },
  idempotencyKey: string
): Promise<AdvanceRecord> =>
  advanceFrom(
    await http.post<ApiEnvelope<AdvanceDto>>(PETTY_CASH_API.advances, input, { idempotencyKey })
  );

type AdvanceAction = Parameters<typeof PETTY_CASH_API.advanceAction>[1];

const act = async (
  advanceId: string,
  action: AdvanceAction,
  body: unknown,
  idempotencyKey: string
) =>
  advanceFrom(
    await http.post<ApiEnvelope<AdvanceDto>>(
      PETTY_CASH_API.advanceAction(advanceId, action),
      body,
      {
        idempotencyKey,
      }
    )
  );

/** The approver may approve less than was asked; `amount` must not exceed the request. */
export const approveAdvance = (
  id: string,
  input: { amount?: number; note?: string },
  key: string
) => act(id, 'approve', input, key);

export const rejectAdvance = (id: string, reason: string, key: string) =>
  act(id, 'reject', { reason: reason.trim() }, key);

export const cancelAdvance = (id: string, reason: string, key: string) =>
  act(id, 'cancel', { reason: reason.trim() }, key);

export const disburseAdvance = (id: string, key: string) => act(id, 'disburse', undefined, key);

export const custodianVerifyAdvance = (id: string, note: string, key: string) =>
  act(id, 'custodian-verify', note.trim() ? { note: note.trim() } : undefined, key);

export const custodianRejectAdvance = (id: string, reason: string, key: string) =>
  act(id, 'custodian-reject', { reason: reason.trim() }, key);

export const financeVerifyAdvance = (id: string, note: string, key: string) =>
  act(id, 'finance-verify', note.trim() ? { note: note.trim() } : undefined, key);

export const financeRejectAdvance = (id: string, reason: string, key: string) =>
  act(id, 'finance-reject', { reason: reason.trim() }, key);

/** Moves the unsettled cash to the employee receivable account and refills the fund from the bank. */
export const convertAdvanceToReceivable = (
  id: string,
  input: { bankAccountId: string; date: string; reason: string },
  key: string
) => act(id, 'convert-to-receivable', { ...input, reason: input.reason.trim() }, key);

export const uploadAdvanceAttachments = async (advanceId: string, files: File[]) => {
  const form = new FormData();
  files.forEach((file) => form.append('attachments', file));
  return advanceFrom(
    await http.post<ApiEnvelope<AdvanceDto>>(PETTY_CASH_API.advanceAttachments(advanceId), form, {
      upload: true,
    })
  );
};

/**
 * Settlement is JSON, or multipart when the receipts travel with it (`lines` is then a JSON string).
 * A settlement that spent money needs at least one receipt.
 */
export const submitAdvanceSettlement = async (
  advanceId: string,
  params: { input: SettlementInput; files?: File[] },
  idempotencyKey: string
): Promise<AdvanceRecord> => {
  const { input, files = [] } = params;
  const url = PETTY_CASH_API.advanceAction(advanceId, 'settlement');

  if (files.length === 0) {
    return advanceFrom(await http.post<ApiEnvelope<AdvanceDto>>(url, input, { idempotencyKey }));
  }
  const form = new FormData();
  form.append('date', input.date);
  form.append('beneficiary', input.beneficiary);
  if (input.description !== undefined) form.append('description', input.description);
  if (input.receiptNumber !== undefined) form.append('receiptNumber', input.receiptNumber);
  form.append('lines', JSON.stringify(input.lines));
  files.forEach((file) => form.append('attachments', file));
  return advanceFrom(
    await http.post<ApiEnvelope<AdvanceDto>>(url, form, { idempotencyKey, upload: true })
  );
};

/** Verifiers assign the expense account of every settlement line before finance can verify. */
export const setSettlementAccounts = async (
  advanceId: string,
  lines: Array<{ lineNo: number; expenseAccountId: string }>
) =>
  advanceFrom(
    await http.patch<ApiEnvelope<AdvanceDto>>(PETTY_CASH_API.advanceSettlementAccounts(advanceId), {
      lines,
    })
  );

export const getMyAdvanceStatus = async (): Promise<AdvanceStatusInfo> =>
  statusFrom(await http.get<ApiEnvelope<AdvanceStatusDto>>(PETTY_CASH_API.myAdvanceStatus));

export const getAdvanceStatusOf = async (userId: string): Promise<AdvanceStatusInfo> =>
  statusFrom(await http.get<ApiEnvelope<AdvanceStatusDto>>(PETTY_CASH_API.advanceStatus(userId)));

const restrict = async (userId: string, action: 'block' | 'unblock' | 'override', body: unknown) =>
  statusFrom(
    await http.post<ApiEnvelope<AdvanceStatusDto>>(
      PETTY_CASH_API.restrictionAction(userId, action),
      body
    )
  );

export const blockAdvanceUser = (userId: string, reason: string) =>
  restrict(userId, 'block', { reason: reason.trim() });

export const unblockAdvanceUser = (userId: string, reason: string) =>
  restrict(userId, 'unblock', { reason: reason.trim() });

/** `until: null` revokes an override; an ISO datetime lets the user ask again until then. */
export const overrideAdvanceUser = (userId: string, until: string | null, reason: string) =>
  restrict(userId, 'override', { until, reason: reason.trim() });
