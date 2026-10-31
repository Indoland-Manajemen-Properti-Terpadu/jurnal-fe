import { useCallback } from 'react';
import { useTranslation } from '@/i18n';
import { toPettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';

/** Domain codes with their own sentence in the `pettyCash.errors.codes` namespace. */
export const KNOWN_ERROR_CODES = [
  'NOT_FOUND',
  'PETTY_CASH_INSUFFICIENT_BALANCE',
  'SOD_VIOLATION',
  'NOT_CUSTODIAN',
  'ATTACHMENT_REQUIRED',
  'INVALID_STATE_TRANSITION',
  'PETTY_CASH_PENDING_REIMBURSEMENT',
  'COUNT_REQUIRED',
  'PERIOD_LOCKED',
  'DEFAULT_ACCOUNT_NOT_CONFIGURED',
  'IDEMPOTENCY_KEY_REUSED',
  'PETTY_CASH_USER_BLOCKED',
  'ADVANCE_LIMIT_EXCEEDED',
  'EXPENSE_ACCOUNT_REQUIRED',
  'INVALID_EXPENSE_ACCOUNT',
  'FUND_HAS_OPEN_ITEMS',
  'TAX_INVOICE_REQUIRED',
  'FUTURE_DATE_NOT_ALLOWED',
] as const;

type Translate = (key: string) => string;

/**
 * A safe sentence for any petty cash failure. Indonesian domain messages from the server are
 * specific (they name amounts and documents), so Indonesian readers get them as is; English
 * readers get our translation of the code. Technical text (Joi, stack, raw codes) never shows.
 */
export const describePettyCashError = (error: unknown, language: string, t: Translate) => {
  const normalized = toPettyCashError(error);

  switch (normalized.kind) {
    case 'domain': {
      if (language === 'id' && normalized.serverMessage) return normalized.serverMessage;
      const { code } = normalized;
      return code && (KNOWN_ERROR_CODES as readonly string[]).includes(code)
        ? t(`errors.codes.${code}`)
        : t('errors.rejected');
    }
    case 'validation':
      return t('errors.validation');
    case 'forbidden':
      return t('errors.forbidden');
    case 'unauthorized':
      return t('errors.unauthorized');
    case 'network':
      return t('errors.network');
    default:
      return t('errors.generic');
  }
};

export const usePettyCashErrorMessage = () => {
  const { t, currentLanguage } = useTranslation('pettyCash');
  return useCallback(
    (error: unknown) => describePettyCashError(error, currentLanguage, t),
    [currentLanguage, t]
  );
};
