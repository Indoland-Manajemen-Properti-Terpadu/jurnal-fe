import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import { themeColors } from '@/theme';
import { matchErrorMessage, matchReconciliation } from '../../infrastructure/reconciliationApi';
import type { MatchPayload } from '../../domain/reconciliation';
import { reconciliationKeys } from './reconciliationKeys';

export const useMatchReconciliation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('reconciliation');

  return useMutation({
    mutationFn: (payload: MatchPayload) => matchReconciliation(payload),
    onSuccess: () => {
      notifications.show({
        title: t('notifications.successTitle'),
        message: t('notifications.matched'),
        color: themeColors.green[6],
      });
      queryClient.invalidateQueries({ queryKey: reconciliationKeys.all });
      queryClient.invalidateQueries({ queryKey: ['bank_statement'] });
      queryClient.invalidateQueries({ queryKey: reconciliationKeys.allJournalDetails });
      queryClient.invalidateQueries({ queryKey: ['transaction_by_account'] });
      queryClient.invalidateQueries({ queryKey: ['detail_account'] });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: t('notifications.failureTitle'),
        message: matchErrorMessage(error) || t('notifications.matchFailed'),
        color: themeColors.red[6],
      });
    },
  });
};
