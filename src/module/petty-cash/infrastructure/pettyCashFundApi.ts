import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import type { toCreateFundInput, toPaguInput } from '@/module/petty-cash/domain/fundAdmin';
import type { ApiEnvelope, FundDto } from '@/module/petty-cash/infrastructure/pettyCashDto';
import { PETTY_CASH_API } from '@/module/petty-cash/infrastructure/pettyCashEndpoints';
import { http } from '@/module/petty-cash/infrastructure/pettyCashHttp';
import { toFund } from '@/module/petty-cash/infrastructure/pettyCashMappers';

const fundFrom = (body: ApiEnvelope<FundDto>) => toFund(body.data);

/** Opening a fund can post the funding journal (bank to petty cash), so it carries a key. */
export const createFund = async (
  input: ReturnType<typeof toCreateFundInput>,
  idempotencyKey: string
): Promise<PettyCashFund> =>
  fundFrom(await http.post<ApiEnvelope<FundDto>>(PETTY_CASH_API.funds, input, { idempotencyKey }));

/** The ceiling cannot be changed here; use `adjustPagu`. */
export const updateFund = async (
  fundId: string,
  patch: Record<string, unknown>
): Promise<PettyCashFund> =>
  fundFrom(await http.patch<ApiEnvelope<FundDto>>(PETTY_CASH_API.fund(fundId), patch));

/** Posts a journal between the petty cash account and the chosen bank account. */
export const adjustPagu = async (
  fundId: string,
  input: ReturnType<typeof toPaguInput>,
  idempotencyKey: string
): Promise<PettyCashFund> =>
  fundFrom(
    await http.post<ApiEnvelope<FundDto>>(PETTY_CASH_API.fundPaguAdjustments(fundId), input, {
      idempotencyKey,
    })
  );

/** Returns the ceiling to the bank; refused while anything is still open on the fund. */
export const closeFund = async (
  fundId: string,
  input: { bankAccountId: string; date: string; reason: string },
  idempotencyKey: string
): Promise<PettyCashFund> =>
  fundFrom(
    await http.post<ApiEnvelope<FundDto>>(
      PETTY_CASH_API.fundClose(fundId),
      { ...input, reason: input.reason.trim() },
      { idempotencyKey }
    )
  );
