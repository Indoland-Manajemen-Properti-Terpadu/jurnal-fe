import { useMutation } from '@tanstack/react-query';
import type { AdvanceRecord } from '@/module/petty-cash/domain/pettyCashEntities';
import type { SettlementInput } from '@/module/petty-cash/domain/advance';
import {
  approveAdvance,
  blockAdvanceUser,
  cancelAdvance,
  convertAdvanceToReceivable,
  createAdvance,
  custodianRejectAdvance,
  custodianVerifyAdvance,
  disburseAdvance,
  financeRejectAdvance,
  financeVerifyAdvance,
  overrideAdvanceUser,
  rejectAdvance,
  setSettlementAccounts,
  submitAdvanceSettlement,
  unblockAdvanceUser,
  uploadAdvanceAttachments,
} from '@/module/petty-cash/infrastructure/pettyCashAdvanceApi';
import { useIdempotentMutation } from '@/module/petty-cash/presentation/hooks/useIdempotentMutation';
import { usePettyCashNotifier } from '@/module/petty-cash/presentation/hooks/usePettyCashNotifier';
import { useRefreshPettyCash } from '@/module/petty-cash/presentation/hooks/useRefreshPettyCash';

const settled = (
  refresh: () => Promise<unknown>,
  notify: ReturnType<typeof usePettyCashNotifier>
) => ({
  onError: async (error: unknown) => {
    notify.failure(error);
    await refresh();
  },
});

export const useCreateAdvance = (fundId: string) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useIdempotentMutation<AdvanceRecord, { amount: number; purpose: string }>(
    `advance:create:${fundId}`,
    (input, key) => createAdvance({ fundId, ...input }, key),
    {
      onSuccess: async (advance) => {
        await refresh();
        notify.success('advanceRequested', { number: advance.advanceNumber });
      },
      ...settled(refresh, notify),
    }
  );
};

export type AdvanceDecision =
  | 'approve'
  | 'reject'
  | 'cancel'
  | 'disburse'
  | 'custodianVerify'
  | 'custodianReject'
  | 'financeVerify'
  | 'financeReject';

export interface AdvanceDecisionInput {
  /** A reason, or an optional note for the verify steps. */
  reason?: string;
  /** Approval only: less than requested is allowed. */
  amount?: number;
}

const DECIDE: Record<
  AdvanceDecision,
  (id: string, input: AdvanceDecisionInput, key: string) => Promise<AdvanceRecord>
> = {
  approve: (id, { amount, reason }, key) =>
    approveAdvance(id, { amount, note: reason?.trim() || undefined }, key),
  reject: (id, { reason = '' }, key) => rejectAdvance(id, reason, key),
  cancel: (id, { reason = '' }, key) => cancelAdvance(id, reason, key),
  disburse: (id, _input, key) => disburseAdvance(id, key),
  custodianVerify: (id, { reason = '' }, key) => custodianVerifyAdvance(id, reason, key),
  custodianReject: (id, { reason = '' }, key) => custodianRejectAdvance(id, reason, key),
  financeVerify: (id, { reason = '' }, key) => financeVerifyAdvance(id, reason, key),
  financeReject: (id, { reason = '' }, key) => financeRejectAdvance(id, reason, key),
};

/** One step of the advance workflow on one advance. */
export const useAdvanceDecision = (advanceId: string, decision: AdvanceDecision) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useIdempotentMutation<AdvanceRecord, AdvanceDecisionInput>(
    `advance:${decision}:${advanceId}`,
    (input, key) => DECIDE[decision](advanceId, input, key),
    {
      onSuccess: async (advance) => {
        await refresh();
        notify.success(`advance_${decision}`, { number: advance.advanceNumber });
      },
      ...settled(refresh, notify),
    }
  );
};

export const useSubmitSettlement = (advanceId: string) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useIdempotentMutation<AdvanceRecord, { input: SettlementInput; files?: File[] }>(
    `advance:settle:${advanceId}`,
    (params, key) => submitAdvanceSettlement(advanceId, params, key),
    {
      onSuccess: async (advance) => {
        await refresh();
        notify.success('advanceSettlementSubmitted', { number: advance.advanceNumber });
      },
      ...settled(refresh, notify),
    }
  );
};

export const useUploadAdvanceAttachments = (advanceId: string) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useMutation<AdvanceRecord, unknown, File[]>({
    mutationFn: (files) => uploadAdvanceAttachments(advanceId, files),
    onSuccess: async () => {
      await refresh();
      notify.success('attachmentUploaded');
    },
    ...settled(refresh, notify),
  });
};

export const useSetSettlementAccounts = (advanceId: string) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useMutation<AdvanceRecord, unknown, Array<{ lineNo: number; expenseAccountId: string }>>({
    mutationFn: (lines) => setSettlementAccounts(advanceId, lines),
    onSuccess: async () => {
      await refresh();
      notify.success('advanceAccountsSaved');
    },
    ...settled(refresh, notify),
  });
};

export const useConvertAdvance = (advanceId: string) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useIdempotentMutation<
    AdvanceRecord,
    { bankAccountId: string; date: string; reason: string }
  >(
    `advance:convert:${advanceId}`,
    (input, key) => convertAdvanceToReceivable(advanceId, input, key),
    {
      onSuccess: async (advance) => {
        await refresh();
        notify.success('advanceConverted', { number: advance.advanceNumber });
      },
      ...settled(refresh, notify),
    }
  );
};

export type RestrictionChange =
  | { kind: 'block'; reason: string }
  | { kind: 'unblock'; reason: string }
  | { kind: 'override'; until: string | null; reason: string };

export const useChangeRestriction = (userId: string) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useMutation<unknown, unknown, RestrictionChange>({
    mutationFn: (change) => {
      if (change.kind === 'block') return blockAdvanceUser(userId, change.reason);
      if (change.kind === 'unblock') return unblockAdvanceUser(userId, change.reason);
      return overrideAdvanceUser(userId, change.until, change.reason);
    },
    onSuccess: async (_data, change) => {
      await refresh();
      notify.success(`restriction_${change.kind}`);
    },
    ...settled(refresh, notify),
  });
};
