import type {
  Page,
  ReimbursementRecord,
  ReplenishmentPreview,
} from '@/module/petty-cash/domain/pettyCashEntities';
import type {
  ReplenishmentInput,
  ReplenishmentPreviewInput,
} from '@/module/petty-cash/domain/replenishment';
import type { ReimbursementStatus } from '@/module/petty-cash/domain/pettyCashStatus';
import type {
  ApiEnvelope,
  PageDto,
  ReimbursementDto,
  ReplenishmentPreviewDto,
} from '@/module/petty-cash/infrastructure/pettyCashDto';
import { PETTY_CASH_API } from '@/module/petty-cash/infrastructure/pettyCashEndpoints';
import { http } from '@/module/petty-cash/infrastructure/pettyCashHttp';
import {
  toPage,
  toPreview,
  toReimbursement,
} from '@/module/petty-cash/infrastructure/pettyCashMappers';
import type { PageParams } from '@/module/petty-cash/infrastructure/pettyCashApi';

export interface ReimbursementListParams extends PageParams {
  fundId?: string;
  status?: ReimbursementStatus[];
  from?: string;
  to?: string;
}

export const listReimbursements = async (
  params: ReimbursementListParams = {}
): Promise<Page<ReimbursementRecord>> => {
  const body = await http.get<ApiEnvelope<PageDto<ReimbursementDto>>>(
    PETTY_CASH_API.reimbursements,
    { ...params }
  );
  return toPage(body.data, toReimbursement);
};

export const getReimbursement = async (reimbursementId: string): Promise<ReimbursementRecord> =>
  toReimbursement(
    (await http.get<ApiEnvelope<ReimbursementDto>>(PETTY_CASH_API.reimbursement(reimbursementId)))
      .data
  );

/** Saves nothing: shows what a replenishment of these vouchers would pay and post. */
export const previewReplenishment = async (
  input: ReplenishmentPreviewInput & { disbursementDate: string }
): Promise<ReplenishmentPreview> =>
  toPreview(
    (
      await http.post<ApiEnvelope<ReplenishmentPreviewDto>>(
        PETTY_CASH_API.reimbursementPreview,
        input
      )
    ).data
  );

export const createReplenishment = async (
  input: ReplenishmentInput,
  idempotencyKey: string
): Promise<ReimbursementRecord> =>
  toReimbursement(
    (
      await http.post<ApiEnvelope<ReimbursementDto>>(PETTY_CASH_API.reimbursements, input, {
        idempotencyKey,
      })
    ).data
  );

const act = async (
  reimbursementId: string,
  action: 'approve' | 'reject' | 'cancel' | 'disburse',
  body: unknown,
  idempotencyKey: string
) =>
  toReimbursement(
    (
      await http.post<ApiEnvelope<ReimbursementDto>>(
        PETTY_CASH_API.reimbursementAction(reimbursementId, action),
        body,
        { idempotencyKey }
      )
    ).data
  );

export const approveReplenishment = (id: string, idempotencyKey: string) =>
  act(id, 'approve', undefined, idempotencyKey);

export const rejectReplenishment = (id: string, reason: string, idempotencyKey: string) =>
  act(id, 'reject', { reason: reason.trim() }, idempotencyKey);

export const cancelReplenishment = (id: string, reason: string, idempotencyKey: string) =>
  act(id, 'cancel', { reason: reason.trim() }, idempotencyKey);

/** Posts the journal and refills the fund; the date is the accounting date of the journal. */
export const disburseReplenishment = (
  id: string,
  disbursementDate: string,
  idempotencyKey: string,
  pocket?: string
) => act(id, 'disburse', { disbursementDate, ...(pocket ? { pocket } : {}) }, idempotencyKey);
