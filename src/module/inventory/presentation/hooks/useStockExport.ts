import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import {
  exportStock,
  type BalanceParams,
  type MovementParams,
} from '@/module/inventory/infrastructure/stockApi';
import { saveBlob } from '@/module/inventory/presentation/components/shared/saveBlob';
import { useStockErrorMessage } from '@/module/inventory/presentation/hooks/useStockQueries';

type Scope = 'balances' | 'movements';

/** Downloads the figures on screen as a workbook, with a message when it is ready or fails. */
export const useStockExport = () => {
  const { t } = useTranslation('stockMovements');
  const describe = useStockErrorMessage();
  const [loading, setLoading] = useState(false);

  const run = async (scope: Scope, params: BalanceParams & MovementParams, date: string) => {
    setLoading(true);
    try {
      const blob = await exportStock(scope, params);
      saveBlob(blob, `mutasi-stok-${scope === 'balances' ? 'saldo' : 'riwayat'}-${date}.xlsx`);
      notifications.show({ color: 'green', message: t('exportReady') });
    } catch (error) {
      notifications.show({
        color: 'orange',
        title: t('exportFailed'),
        message: describe(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return { run, loading };
};
