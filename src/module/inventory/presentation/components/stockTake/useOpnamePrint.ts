import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import {
  warehouseName,
  type JournalPreview,
  type StockOpname,
} from '@/module/inventory/domain/stockOpname';
import {
  buildOpnamePrint,
  printHtml,
  type PrintKind,
  type PrintLabels,
} from '@/module/inventory/presentation/components/stockTake/opnamePrint';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';

/** Prints the count sheet or the minutes of a count, in the active language. */
export const useOpnamePrint = () => {
  const { t } = useTranslation('stockTake');
  const labels: PrintLabels = {
    countTitle: t('print.countTitle'),
    recordTitle: t('print.recordTitle'),
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
      book: t('print.cols.book'),
      diff: t('print.cols.diff'),
      value: t('print.cols.value'),
      reason: t('print.cols.reason'),
      account: t('print.cols.account'),
      debit: t('print.cols.debit'),
      credit: t('print.cols.credit'),
    },
    reason: (reason) => t(`reason.${reason}`),
    countNote: t('print.countNote'),
    noDiff: t('print.noDiff'),
    summary: ({ summary }) =>
      t('print.summary', {
        counted: numberFormat(summary.counted),
        total: numberFormat(summary.total),
        gainQty: numberFormat(summary.gainQty),
        gainValue: formatCurrency(summary.gainValue ?? 0),
        lossQty: numberFormat(summary.lossQty),
        lossValue: formatCurrency(summary.lossValue ?? 0),
        net: formatCurrency(summary.netValue ?? 0),
      }),
    sign: {
      counter: t('print.sign.counter'),
      witness: t('print.sign.witness'),
      accounting: t('print.sign.accounting'),
      manager: t('print.sign.manager'),
    },
    money: formatCurrency,
    qty: numberFormat,
  };

  return (kind: PrintKind, opname: StockOpname, preview?: JournalPreview) => {
    if (!printHtml(buildOpnamePrint(kind, opname, preview, labels))) {
      notifications.show({ color: 'orange', message: t('print.blocked') });
    }
  };
};
