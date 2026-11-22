import { useCallback } from 'react';
import { useTranslation } from '@/i18n';
import { describeApiError } from '@/lib/http/apiError';

type Translate = (key: string) => string;

/** A safe sentence for any purchasing failure (see `describeApiError`). */
export const describePurchaseError = (error: unknown, language: string, t: Translate): string =>
  describeApiError(error, language, {
    rejected: t('errors.rejected'),
    forbidden: t('errors.forbidden'),
    validation: t('errors.validation'),
    unauthorized: t('errors.unauthorized'),
    notFound: t('errors.notFound'),
    network: t('errors.network'),
    generic: t('errors.generic'),
  });

export const usePurchaseErrorMessage = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  return useCallback(
    (error: unknown) => describePurchaseError(error, currentLanguage, t),
    [currentLanguage, t]
  );
};
