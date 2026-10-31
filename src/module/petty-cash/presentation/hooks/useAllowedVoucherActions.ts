import type {
  PettyCashFund,
  PettyCashVoucherRecord,
} from '@/module/petty-cash/domain/pettyCashEntities';
import type { VoucherAction } from '@/module/petty-cash/domain/pettyCashStatus';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';

/** What the signed-in user may do with this voucher right now (status, menu rights, custodian, SoD). */
export const useAllowedVoucherActions = (
  voucher: PettyCashVoucherRecord | undefined,
  fund: PettyCashFund | undefined
): VoucherAction[] => {
  const access = usePettyCashAccess();
  if (!voucher || !fund) return [];
  return access.voucherActions(
    {
      status: voucher.status,
      source: voucher.source,
      requestedById: voucher.requestedBy?.id ?? null,
    },
    { custodianId: fund.custodian.id, singleUserOverride: fund.settings.singleUserOverride }
  );
};
