import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import type { StockOpname } from '@/module/inventory/domain/stockOpname';
import { downloadOpnameMinutes } from '@/module/inventory/infrastructure/opnameApi';
import { saveBlob } from '@/module/inventory/presentation/components/shared/saveBlob';
import { useStockTakeErrorMessage } from '@/module/inventory/presentation/hooks/useOpnames';

/** Downloads the minutes of a posted count as the PDF the server made, with a message either way. */
export const useOpnameMinutes = () => {
  const { t } = useTranslation('stockTake');
  const describe = useStockTakeErrorMessage();
  const [loading, setLoading] = useState(false);

  const download = async (opname: Pick<StockOpname, 'id' | 'number'>) => {
    if (loading) return;
    setLoading(true);
    try {
      const blob = await downloadOpnameMinutes(opname.id);
      saveBlob(blob, `berita-acara-${opname.number.replaceAll('/', '-')}.pdf`);
      notifications.show({ color: 'green', message: t('print.recordReady') });
    } catch (error) {
      notifications.show({
        color: 'orange',
        title: t('print.recordFailed'),
        message: describe(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return { download, loading };
};
