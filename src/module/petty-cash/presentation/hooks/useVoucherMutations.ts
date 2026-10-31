import type { PettyCashVoucherRecord } from '@/module/petty-cash/domain/pettyCashEntities';
import type { VoucherInput } from '@/module/petty-cash/domain/voucherForm';
import {
  approveVoucher,
  createVoucher,
  deleteVoucherAttachment,
  rejectVoucher,
  submitVoucher,
  updateVoucher,
  uploadVoucherAttachments,
  voidVoucher,
} from '@/module/petty-cash/infrastructure/pettyCashApi';
import { usePettyCashNotifier } from '@/module/petty-cash/presentation/hooks/usePettyCashNotifier';
import { useRefreshPettyCash } from '@/module/petty-cash/presentation/hooks/useRefreshPettyCash';
import { useIdempotentMutation } from '@/module/petty-cash/presentation/hooks/useIdempotentMutation';

export interface CreateVoucherVariables {
  input: VoucherInput;
  submit: boolean;
  files: File[];
}

export const useCreateVoucher = (fundId: string) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useIdempotentMutation<PettyCashVoucherRecord, CreateVoucherVariables>(
    `voucher:create:${fundId}`,
    (variables, key) => createVoucher({ fundId, ...variables }, key),
    {
      onSuccess: async (voucher, variables) => {
        await refresh();
        notify.success(variables.submit ? 'createdSubmitted' : 'created', {
          number: voucher.voucherNumber,
        });
      },
      onError: async (error) => {
        notify.failure(error);
        await refresh();
      },
    }
  );
};

export interface UpdateVoucherVariables {
  input: VoucherInput;
  files: File[];
  /** False when a submit follows, so the user gets one message instead of two. */
  announce: boolean;
}

/**
 * Save the edit and add the new receipts. Submitting is a separate step (`useVoucherDecision`), so
 * a failed submit can be retried without repeating the save or uploading the receipts again.
 */
export const useUpdateVoucher = (voucherId: string) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useIdempotentMutation<PettyCashVoucherRecord, UpdateVoucherVariables>(
    `voucher:update:${voucherId}`,
    async ({ input, files }) => {
      const voucher = await updateVoucher(voucherId, input);
      return files.length > 0 ? uploadVoucherAttachments(voucherId, files) : voucher;
    },
    {
      onSuccess: async (voucher, variables) => {
        await refresh();
        if (variables.announce) notify.success('updated', { number: voucher.voucherNumber });
      },
      onError: async (error) => {
        notify.failure(error);
        await refresh();
      },
    }
  );
};

export type VoucherDecision = 'submit' | 'approve' | 'reject' | 'void';

const NOTIFY_KEY: Record<VoucherDecision, string> = {
  submit: 'submitted',
  approve: 'approved',
  reject: 'rejected',
  void: 'voided',
};

/** Submit, approve, reject or void one voucher; reject and void carry a reason. */
export const useVoucherDecision = (voucherId: string, decision: VoucherDecision) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useIdempotentMutation<PettyCashVoucherRecord, { reason?: string }>(
    `voucher:${decision}:${voucherId}`,
    ({ reason = '' }, key) => {
      if (decision === 'submit') return submitVoucher(voucherId, key);
      if (decision === 'approve') return approveVoucher(voucherId, key);
      return decision === 'reject'
        ? rejectVoucher(voucherId, reason, key)
        : voidVoucher(voucherId, reason, key);
    },
    {
      onSuccess: async (voucher) => {
        await refresh();
        notify.success(NOTIFY_KEY[decision], { number: voucher.voucherNumber });
      },
      onError: async (error) => {
        notify.failure(error);
        await refresh();
      },
    }
  );
};

export const useUploadVoucherAttachments = (voucherId: string) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useIdempotentMutation<PettyCashVoucherRecord, { files: File[] }>(
    `voucher:attach:${voucherId}`,
    ({ files }) => uploadVoucherAttachments(voucherId, files),
    {
      onSuccess: async () => {
        await refresh();
        notify.success('attachmentUploaded');
      },
      onError: async (error) => {
        notify.failure(error);
        await refresh();
      },
    }
  );
};

export const useDeleteVoucherAttachment = (voucherId: string) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useIdempotentMutation<PettyCashVoucherRecord, { attachmentId: string }>(
    `voucher:detach:${voucherId}`,
    ({ attachmentId }) => deleteVoucherAttachment(voucherId, attachmentId),
    {
      onSuccess: async () => {
        await refresh();
        notify.success('attachmentDeleted');
      },
      onError: async (error) => {
        notify.failure(error);
        await refresh();
      },
    }
  );
};
