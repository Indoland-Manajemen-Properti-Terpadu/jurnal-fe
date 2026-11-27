import { dueDateFor, type BillSourceDoc } from '@/module/purchases/domain/billSources';
import { useTranslation } from '@/i18n';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';

export const useBillDueHint = (
  picked: BillSourceDoc[],
  transactionDate: string,
  currentLanguage: string
) => {
  const { t } = useTranslation('purchases');
  const first = picked[0];
  if (!first) return undefined;

  const suggested = dueDateFor(first, transactionDate);
  return suggested
    ? t('bills.form.dueDateSuggested', {
        term: first.term.name,
        date: formatDay(suggested, currentLanguage),
      })
    : t('bills.form.dueDateFromTerm', { term: first.term.name });
};
