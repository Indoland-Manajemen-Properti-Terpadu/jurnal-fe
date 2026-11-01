import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import {
  buildAccountLabelMap,
  buildTaxLabelMap,
  resolveAccountLabel,
  resolveTaxLabel,
} from '@/module/products/domain/productRules';
import { useAccountOptions, useTaxes } from './useProductQueries';

/** Readable labels for the account and tax references of a product, with translated fallbacks. */
export const useReferenceLabels = () => {
  const { t } = useTranslation('products');
  const accountsQuery = useAccountOptions();
  const taxesQuery = useTaxes();

  const accountLabels = useMemo(
    () => buildAccountLabelMap(accountsQuery.data ?? []),
    [accountsQuery.data]
  );
  const taxLabels = useMemo(() => buildTaxLabelMap(taxesQuery.data ?? []), [taxesQuery.data]);

  return {
    accountLabel: (account: unknown): string =>
      resolveAccountLabel(account, accountLabels) ?? t('detail.accountUnset'),
    taxLabel: (tax: unknown): string => resolveTaxLabel(tax, taxLabels) ?? t('detail.taxFree'),
  };
};
