/** Codes the backend names in `docs/prd/bank-connection.md` (7.2, 7.3); each has its own sentence. */
const CODED = new Set([
  'ACCOUNT_NOT_ELIGIBLE',
  'ACCOUNT_ALREADY_CONNECTED',
  'BANK_ACCOUNT_ALREADY_CONNECTED',
  'PROVIDER_UNAVAILABLE',
  'ACCOUNT_HOLDER_MISMATCH',
  'CONSENT_EXPIRED',
  'CONNECTION_NOT_EDITABLE',
]);

const BY_KIND = new Set(['network', 'forbidden', 'rateLimited']);

/** The i18n key (namespace `bankConnection`) of the sentence for an error; raw codes and server text are never shown. */
export const connectionErrorKey = (error: { kind: string; code?: string }): string => {
  if (error.code && CODED.has(error.code)) return `errors.${error.code}`;
  if (BY_KIND.has(error.kind)) return `errors.${error.kind}`;
  return 'errors.generic';
};
