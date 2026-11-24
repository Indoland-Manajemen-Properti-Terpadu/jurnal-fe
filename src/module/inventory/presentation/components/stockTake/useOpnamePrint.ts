import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import { warehouseName, type StockOpname } from '@/module/inventory/domain/stockOpname';
import {
  buildOpnamePrint,
  printHtml,
  type PrintLabels,
} from '@/module/inventory/presentation/components/stockTake/opnamePrint';
import { dateFormatV1 } from '@/utils/formatDate';

/** Prints the count sheet in the active language. The minutes are downloaded from the server. */
export const useOpnamePrint = () => {
  const { t } = useTranslation('stockTake');
  const labels: PrintLabels = {
    countTitle: t('print.countTitle'),
    meta: (opname) =>
      t('print.meta', {
        number: opname.number,
        warehouse: warehouseName(opname.warehouse, t('warehouseMissing')),
        date: dateFormatV1(opname.date, 'D MMM YYYY'),
      }),
    people: (opname) =>
      t('print.people', {
        counter: opname.counterName ?? '-',
        creator: opname.createdByName || '-',
      }),
    cols: {
      no: t('print.cols.no'),
      product: t('print.cols.product'),
      sku: t('print.cols.sku'),
      unit: t('print.cols.unit'),
      counted: t('print.cols.counted'),
      initial: t('print.cols.initial'),
    },
    countNote: t('print.countNote'),
    sign: { counter: t('print.sign.counter'), witness: t('print.sign.witness') },
  };

  return (opname: StockOpname) => {
    if (!printHtml(buildOpnamePrint(opname, labels))) {
      notifications.show({ color: 'orange', message: t('print.blocked') });
    }
  };
};
