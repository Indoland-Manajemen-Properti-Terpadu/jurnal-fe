import { useQueryClient } from '@tanstack/react-query';
import { pettyCashKeys } from '@/module/petty-cash/presentation/hooks/pettyCashKeys';
import { usePettyCashScope } from '@/module/petty-cash/presentation/hooks/usePettyCashScope';

/**
 * A change in one document moves the others: a replenishment turns vouchers over and refills the
 * fund, a count settles with it, a voucher changes the balance. So every list, detail and the fund
 * itself (balance, cash book) are refreshed together.
 */
export const useRefreshPettyCash = () => {
  const queryClient = useQueryClient();
  const scope = usePettyCashScope();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: pettyCashKeys.vouchers(scope) }),
      queryClient.invalidateQueries({ queryKey: pettyCashKeys.funds(scope) }),
      queryClient.invalidateQueries({ queryKey: pettyCashKeys.counts(scope) }),
      queryClient.invalidateQueries({ queryKey: pettyCashKeys.reimbursements(scope) }),
      queryClient.invalidateQueries({ queryKey: pettyCashKeys.advances(scope) }),
      queryClient.invalidateQueries({ queryKey: pettyCashKeys.reports(scope) }),
    ]);
};
