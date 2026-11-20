import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import { themeColors } from '@/theme';
import { cancelReconciliationMatch } from '../../infrastructure/matchApi';
import { journalMatchKeys } from './matchKeys';

/** Un-Reconcile: cancels one match and refreshes everything that shows its rows or journal. */
export const useCancelReconciliation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('reconciliation');

  return useMutation({
    mutationFn: (matchId: string) => cancelReconciliationMatch(matchId),
    onSuccess: () => {
      notifications.show({
        title: t('notifications.successTitle'),
        message: t('notifications.unmatched'),
        color: themeColors.green[6],
      });
      queryClient.invalidateQueries({ queryKey: ['get_reconciliation'] });
      queryClient.invalidateQueries({ queryKey: ['bank_statement'] });
      queryClient.invalidateQueries({ queryKey: ['journal_details_for_recon'] });
      queryClient.invalidateQueries({ queryKey: journalMatchKeys.all });
      queryClient.invalidateQueries({ queryKey: ['transaction_by_account'] });
      queryClient.invalidateQueries({ queryKey: ['detail_account'] });
    },
    onError: () => {
      notifications.show({
        title: t('notifications.failureTitle'),
        message: t('notifications.unmatchFailed'),
        color: themeColors.red[6],
      });
    },
  });
};
