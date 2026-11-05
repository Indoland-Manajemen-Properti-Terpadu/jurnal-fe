import { useCallback } from 'react';
import { useTranslation } from '@/i18n';
import { toPurchaseError } from '@/module/purchases/infrastructure/purchaseErrors';

type Translate = (key: string) => string;

/**
 * A safe sentence for any purchasing failure. The server's business messages are Indonesian and
 * specific (they name amounts and documents), so Indonesian readers get them as written; English
 * readers get a generic sentence. Validation text, status codes and stack traces never show.
 */
export const describePurchaseError = (error: unknown, language: string, t: Translate): string => {
  const normalized = toPurchaseError(error);
  switch (normalized.kind) {
    case 'domain':
      return language === 'id' && normalized.serverMessage
        ? normalized.serverMessage
        : t('errors.rejected');
    case 'forbidden':
      return language === 'id' &&
        normalized.serverMessage &&
        normalized.serverMessage !== 'Forbidden Access Role'
        ? normalized.serverMessage
        : t('errors.forbidden');
    case 'validation':
      return t('errors.validation');
    case 'unauthorized':
      return t('errors.unauthorized');
    case 'notFound':
      return t('errors.notFound');
    case 'network':
      return t('errors.network');
    default:
      return t('errors.generic');
  }
};

export const usePurchaseErrorMessage = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  return useCallback(
    (error: unknown) => describePurchaseError(error, currentLanguage, t),
    [currentLanguage, t]
  );
};
