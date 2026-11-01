/** Path of a posting form that opens with one account preselected (`?fromAccountId=` or `?toAccountId=`). */
export const withAccountPrefill = (
  path: string,
  param: 'fromAccountId' | 'toAccountId',
  accountId: string
): string => `${path}?${param}=${encodeURIComponent(accountId)}`;
