import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  fetchGeneralSettings,
  updateGeneralSettings,
} from '@/module/settings/infrastructure/settingApi';

import { settingKeys } from '@/module/settings/presentation/hooks/settingKeys';

import { useTranslation } from '@/i18n';

/** Root query keys of screens that show amounts rounded to the site precision (reports, assets). */
const PRECISION_DEPENDENT_KEYS = new Set([
  'assets',
  'profit-loss',
  'trial-balance',
  'balance-sheet-report',
  'general-ledger',
  'income_statement_report',
  'equity_change_report',
]);

export const useGeneralSettings = () =>
  useQuery({
    queryKey: settingKeys.general(),
    queryFn: fetchGeneralSettings,
  });

export const useUpdateGeneralSettings = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (decimalPrecision: number) => updateGeneralSettings(decimalPrecision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.general() });
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => PRECISION_DEPENDENT_KEYS.has(String(queryKey[0])),
      });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.general.saved'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.general.saveFailed'),
      });
    },
  });
};
