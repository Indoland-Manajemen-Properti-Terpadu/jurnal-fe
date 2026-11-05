import { useCallback } from 'react';
import { useTranslation } from '@/i18n';
import { classifySaleError } from '../../infrastructure/saleErrors';

type Translate = (key: string) => string;

/**
 * A safe sentence for any sales failure. The server's business messages are Indonesian and
 * specific, so Indonesian readers get them as written; English readers get a generic sentence.
 * Validation text, status codes and stack traces never show.
 */
export const describeSaleError = (error: unknown, language: string, t: Translate): string => {
  const { kind, serverMessage } = classifySaleError(error);
  switch (kind) {
    case 'domain':
      return language === 'id' && serverMessage ? serverMessage : t('errors.rejected');
    case 'forbidden':
      return language === 'id' && serverMessage && serverMessage !== 'Forbidden Access Role'
        ? serverMessage
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

export const useSaleErrorMessage = () => {
  const { t, currentLanguage } = useTranslation('sales');
  return useCallback(
    (error: unknown) => describeSaleError(error, currentLanguage, t),
    [currentLanguage, t]
  );
};
