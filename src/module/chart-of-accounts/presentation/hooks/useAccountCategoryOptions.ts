import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { getCategoryPrefix } from '../../domain/accountRules';
import { groupCategoryOptions } from '../../domain/categoryOptions';
import type { CategoryAccountModel } from '../../domain/categoryAccount';

/** Grouped category options and the report target, shared by the add and edit account pages. */
export const useAccountCategoryOptions = (
  categoryAccounts: CategoryAccountModel[] | undefined,
  categoryId: string,
  accountNumber: string
) => {
  const { t, currentLanguage } = useTranslation('chartOfAccounts');

  const categoryOptions = useMemo(
    () =>
      groupCategoryOptions(categoryAccounts || [], {
        balanceSheet: t('form.balanceSheetGroup'),
        profitLoss: t('form.profitLossGroup'),
        unnamed: t('form.unnamedCategory'),
      }),
    [categoryAccounts, currentLanguage]
  );

  const selectedCategoryObj = useMemo(
    () => categoryAccounts?.find((cat) => cat.id === categoryId),
    [categoryAccounts, categoryId]
  );

  // The first digit of the code wins; otherwise the category decides (accounts 4 to 8 are profit and loss).
  const isIncomeStatementCategory = useMemo(() => {
    const codeChar = accountNumber.trim().charAt(0);
    const prefix = ['1', '2', '3', '4', '5', '6', '7', '8'].includes(codeChar)
      ? codeChar
      : getCategoryPrefix(selectedCategoryObj);
    return Number(prefix) >= 4;
  }, [accountNumber, selectedCategoryObj]);

  return { categoryOptions, selectedCategoryObj, isIncomeStatementCategory };
};
