import type { CountRecord, Page } from '@/module/petty-cash/domain/pettyCashEntities';
import type { CountInput } from '@/module/petty-cash/domain/cashCount';
import type { CountStatus } from '@/module/petty-cash/domain/pettyCashStatus';
import type {
  ApiEnvelope,
  CountDto,
  PageDto,
} from '@/module/petty-cash/infrastructure/pettyCashDto';
import { PETTY_CASH_API } from '@/module/petty-cash/infrastructure/pettyCashEndpoints';
import { http } from '@/module/petty-cash/infrastructure/pettyCashHttp';
import { toCount, toPage } from '@/module/petty-cash/infrastructure/pettyCashMappers';
import type { PageParams } from '@/module/petty-cash/infrastructure/pettyCashApi';

/** `search` is not accepted on this list (the backend answers 400), so it is not offered here. */
export interface CountListParams extends PageParams {
  fundId?: string;
  status?: CountStatus[];
  from?: string;
  to?: string;
}

export const listCounts = async (params: CountListParams = {}): Promise<Page<CountRecord>> => {
  const body = await http.get<ApiEnvelope<PageDto<CountDto>>>(PETTY_CASH_API.counts, { ...params });
  return toPage(body.data, toCount);
};

export const getCount = async (countId: string): Promise<CountRecord> =>
  toCount((await http.get<ApiEnvelope<CountDto>>(PETTY_CASH_API.count(countId))).data);

/** The counter is the signed-in user. `submit: false` keeps it as a draft. */
export const createCount = async (
  params: { fundId: string; input: CountInput; submit: boolean },
  idempotencyKey: string
): Promise<CountRecord> => {
  const { fundId, input, submit } = params;
  const body = await http.post<ApiEnvelope<CountDto>>(
    PETTY_CASH_API.counts,
    { fundId, ...input, submit },
    { idempotencyKey }
  );
  return toCount(body.data);
};

/** A reason is needed when the count has a variance; a draft already carries it, so it is resent. */
export const submitCount = async (
  countId: string,
  reason: string | null,
  idempotencyKey: string
) => {
  const body = await http.post<ApiEnvelope<CountDto>>(
    PETTY_CASH_API.countAction(countId, 'submit'),
    reason ? { reason: reason.trim() } : undefined,
    { idempotencyKey }
  );
  return toCount(body.data);
};

export const approveCount = async (countId: string, idempotencyKey: string) =>
  toCount(
    (
      await http.post<ApiEnvelope<CountDto>>(
        PETTY_CASH_API.countAction(countId, 'approve'),
        undefined,
        { idempotencyKey }
      )
    ).data
  );

export const rejectCount = async (countId: string, reason: string, idempotencyKey: string) =>
  toCount(
    (
      await http.post<ApiEnvelope<CountDto>>(
        PETTY_CASH_API.countAction(countId, 'reject'),
        { reason: reason.trim() },
        { idempotencyKey }
      )
    ).data
  );
