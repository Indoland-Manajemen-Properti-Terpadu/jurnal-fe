import { useCallback } from 'react';
import { useTranslation } from '@/i18n';
import { toPettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';

/** Domain codes with their own sentence in the `pettyCash.errors.codes` namespace. */
export const KNOWN_ERROR_CODES = [
  'NOT_FOUND',
  'PETTY_CASH_INSUFFICIENT_BALANCE',
  'SOD_VIOLATION',
  'APPROVAL_LEVEL_FORBIDDEN',
  'INVALID_BANK_ACCOUNT',
  'REIMBURSEMENT_AMOUNT_CHANGED',
  'POCKET_NOT_FOUND',
  'POCKET_INACTIVE',
  'POCKET_BALANCES_REQUIRED',
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

const namesPocket = (details: unknown) =>
  typeof details === 'object' &&
  details !== null &&
  typeof (details as { pocket?: unknown }).pocket === 'string';

/**
 * A safe sentence for any petty cash failure. Indonesian domain messages from the server are
 * specific (they name amounts and documents), so Indonesian readers get them as is; English
 * readers get our translation of the code. Technical text (Joi, stack, raw codes) never shows.
 */
export const describePettyCashError = (error: unknown, language: string, t: Translate) => {
  const normalized = toPettyCashError(error);

  switch (normalized.kind) {
    case 'domain': {
      const { code } = normalized;
      const base =
        language === 'id' && normalized.serverMessage
          ? normalized.serverMessage
          : code && (KNOWN_ERROR_CODES as readonly string[]).includes(code)
            ? t(`errors.codes.${code}`)
            : t('errors.rejected');
      // A shortage that names a pocket can be fixed by moving funds in or choosing another pocket.
      return code === 'PETTY_CASH_INSUFFICIENT_BALANCE' && namesPocket(normalized.details)
        ? `${base} ${t('errors.pocketTransferHint')}`
        : base;
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
