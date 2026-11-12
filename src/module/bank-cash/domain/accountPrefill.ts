/** Path of a posting form that opens with one account preselected (`?fromAccountId=` or `?toAccountId=`). */
export const withAccountPrefill = (
  path: string,
  param: 'fromAccountId' | 'toAccountId',
  accountId: string
): string => `${path}?${param}=${encodeURIComponent(accountId)}`;

/** The account a form opens with, or a refusal when the form does not offer the one the URL names. */
export const resolvePrefill = (
  accountId: string,
  selectable: { id: string }[]
): { accountId: string | null; blocked: boolean } => {
  if (!accountId) return { accountId: null, blocked: false };
  const offered = selectable.some((account) => account.id === accountId);
  return offered ? { accountId, blocked: false } : { accountId: null, blocked: true };
};
